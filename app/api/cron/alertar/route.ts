import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { verificarCronAuth, sistemaPausado } from '@/lib/cron-auth'
import { enviarAlertaEmailUsuario } from '@/lib/alerts/email'
import { registrarCronLog } from '@/lib/cron-log'
import { getLimites, HORARIOS_POR_QTD } from '@/lib/planos'

export const maxDuration = 300

/** Retorna hora e dia no fuso Brasília (UTC-3) */
function horasBrasilia(): { dia: number; hora: number } {
  const brasilia = new Date(Date.now() - 3 * 60 * 60 * 1000)
  return { dia: brasilia.getUTCDay(), hora: brasilia.getUTCHours() }
}

function dentroDoHorarioGlobal(): boolean {
  const { dia, hora } = horasBrasilia()
  if (dia >= 1 && dia <= 5) return hora >= 7 && hora <= 17
  if (dia === 6)            return hora >= 7 && hora <= 15
  return false
}

/** Verifica se a hora atual (BRT) está no schedule do usuário */
function horarioPermitidoParaUsuario(emailsPorDia: number, horaBRT: number): boolean {
  const horarios = HORARIOS_POR_QTD[emailsPorDia] ?? HORARIOS_POR_QTD[2]
  return horarios.includes(horaBRT)
}

export async function GET(request: Request) {
  if (!verificarCronAuth(request)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  if (await sistemaPausado()) {
    return NextResponse.json({ ok: false, motivo: 'sistema pausado para manutencao' }, { status: 503 })
  }

  if (!dentroDoHorarioGlobal()) {
    await registrarCronLog({ job: 'alertar', status: 'ignorado', mensagem: 'Fora do horário permitido' })
    return NextResponse.json({ ok: true, motivo: 'Fora do horário permitido', enviados: 0 })
  }

  const { hora: horaBRT } = horasBrasilia()
  const supabase  = await createServiceClient()
  const appUrl    = process.env.NEXT_PUBLIC_APP_URL ?? 'https://monitordelicitacoes.com.br'
  const umaSemanAAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const SELECT_ALERTAS = `
    id, licitacao_id, keyword_id, canais, criado_em, enviado_em, score,
    licitacoes!inner (id, orgao, objeto, valor_estimado, data_abertura, url, estado, cidade),
    keywords (id, termo, user_id)
  `

  // 1. Pendentes (nunca enviados) — mais recentes primeiro para o usuário receber o que acabou de surgir
  const { data: novos, error } = await supabase
    .from('alertas')
    .select(SELECT_ALERTAS)
    .eq('canais', '{}')
    .order('criado_em', { ascending: false })
    .limit(2000)

  if (error) {
    console.error('Erro ao buscar alertas:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // 2. Reenvios sem filtro de data — o controle por usuário ocorre abaixo
  const { data: reenvios } = await supabase
    .from('alertas')
    .select(SELECT_ALERTAS)
    .neq('canais', '{}')
    .order('score', { ascending: false })
    .limit(2000)

  // Agrupar por usuário (novos + reenvios separados para decidir por fila individual)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const novosPorUsuario    = new Map<string, any[]>()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reenviosPorUsuario = new Map<string, any[]>()

  for (const a of (novos ?? [])) {
    const uid = (a.keywords as any)?.user_id
    if (!uid) continue
    if (!novosPorUsuario.has(uid)) novosPorUsuario.set(uid, [])
    novosPorUsuario.get(uid)!.push(a)
  }
  for (const a of (reenvios ?? [])) {
    const uid = (a.keywords as any)?.user_id
    if (!uid) continue
    if (!reenviosPorUsuario.has(uid)) reenviosPorUsuario.set(uid, [])
    reenviosPorUsuario.get(uid)!.push(a)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const alertasPorUsuario = new Map<string, any[]>()
  const todosUids = new Set([...novosPorUsuario.keys(), ...reenviosPorUsuario.keys()])

  for (const uid of todosUids) {
    const novosUid    = novosPorUsuario.get(uid)    ?? []
    const reenviosUid = reenviosPorUsuario.get(uid) ?? []
    // Só envia alertas genuinamente novos (nunca enviados via e-mail).
    // Reenvios com >7 dias são incluídos apenas se houver novos também —
    // nunca reciclagem pura para evitar repetição de licitações.
    const reenviosFiltrados = reenviosUid.filter(a => a.enviado_em && new Date(a.enviado_em) <= new Date(umaSemanAAtras))
    const combinados = novosUid.length
      ? [...novosUid, ...reenviosFiltrados.map(a => ({ ...a, _reenvio: true }))]
      : []
    if (combinados.length) alertasPorUsuario.set(uid, combinados)
  }

  if (!alertasPorUsuario.size) {
    return NextResponse.json({ ok: true, enviados: 0, pendentes: 0 })
  }

  const userIds = [...alertasPorUsuario.keys()]

  // listUsers retorna max 1000 por página — paginar para suportar 10K+ usuários
  const allAuthUsers: { id: string; email?: string }[] = []
  for (let page = 1; ; page++) {
    const { data: authPage } = await supabase.auth.admin.listUsers({ page, perPage: 1000 })
    if (!authPage?.users?.length) break
    allAuthUsers.push(...authPage.users.filter(u => userIds.includes(u.id)))
    if (authPage.users.length < 1000) break
  }
  const emailMap = Object.fromEntries(allAuthUsers.map(u => [u.id, u.email!]))

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, status, plano, telegram_chat_id, whatsapp, emails_por_dia, itens_por_email, trial_fim, email_pausado_ate')
    .in('id', userIds)
  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p]))

  let totalEnviados = 0
  const resultadosPorUsuario: Record<string, unknown> = {}

  // Dispatch paralelo — 20 usuários simultâneos; JS é single-thread, variáveis
  // compartilhadas (totalEnviados, resultadosPorUsuario) são seguras com Promise.all
  const CONCORRENCIA = 20
  const entries = [...alertasPorUsuario.entries()]
  for (let i = 0; i < entries.length; i += CONCORRENCIA) {
    await Promise.all(entries.slice(i, i + CONCORRENCIA).map(async ([userId, alertas]) => {
      const email  = emailMap[userId]
      const perfil = profileMap[userId]
      if (!email || perfil?.status === 'expired') return
      // Canal e-mail pausado?
      if (perfil?.email_pausado_ate && new Date(perfil.email_pausado_ate) > new Date()) return

      const plano   = perfil?.plano ?? 'basic'
      const limites = getLimites(plano)

      // Padrão por plano: 5 e-mails/dia com 10 itens cada = 50 licitações/dia para todos
      const emailsPorDia  = Math.min(perfil?.emails_por_dia  ?? 5,  limites.maxEmailsPorDia)
      const itensPorEmail = Math.min(perfil?.itens_por_email ?? 10, limites.maxItensPorEmail)

      // Verificar se este é um horário programado para o usuário
      if (!horarioPermitidoParaUsuario(emailsPorDia, horaBRT)) return

      const planoEhTrial = perfil?.status === 'trial'
      const trialInfo = planoEhTrial && perfil?.trial_fim
        ? (() => {
            const fim = new Date(perfil.trial_fim)
            const dias = Math.max(0, Math.ceil((fim.getTime() - Date.now()) / 86400000))
            return { diasRestantes: dias, appUrl }
          })()
        : undefined

      // Separar novos de reenvios
      const novosAlertas    = alertas.filter(a => !(a as any)._reenvio)
      const reenviosAlertas = alertas.filter(a =>  (a as any)._reenvio)

      // Novos têm prioridade; reenvios preenchem o restante até o cap
      const novosParaEnviar    = novosAlertas.slice(0, itensPorEmail)
      const totalRestante      = novosAlertas.length - novosParaEnviar.length
      const vagasReenvio       = Math.max(0, itensPorEmail - novosParaEnviar.length)
      const reenviosParaEnviar = reenviosAlertas.slice(0, vagasReenvio)

      const alertasParaEnviar = [...novosParaEnviar, ...reenviosParaEnviar]
      if (!alertasParaEnviar.length) return

      // Montar lista de licitações — deduplicar por licitacao_id, agrupando keywords
      const licitacoesMap = new Map<string, {
        id: string; orgao: string; objeto: string; valor_estimado: number | null;
        data_abertura: string | null; url: string; estado: string | null; cidade: string | null;
        keyword: string; reenvio: boolean; score: number;
      }>()
      for (const a of alertasParaEnviar) {
        const lid = a.licitacao_id
        const termo = (a.keywords as any).termo
        if (licitacoesMap.has(lid)) {
          const existing = licitacoesMap.get(lid)!
          const termos = existing.keyword.split(', ')
          if (!termos.includes(termo)) existing.keyword = [...termos, termo].join(', ')
        } else {
          licitacoesMap.set(lid, {
            id:             lid,
            orgao:          (a.licitacoes as any).orgao,
            objeto:         (a.licitacoes as any).objeto,
            valor_estimado: (a.licitacoes as any).valor_estimado,
            data_abertura:  (a.licitacoes as any).data_abertura,
            url:            (a.licitacoes as any).url,
            estado:         (a.licitacoes as any).estado,
            cidade:         (a.licitacoes as any).cidade,
            keyword:        termo,
            reenvio:        !!(a as any)._reenvio,
            score:          (a as any).score ?? 0,
          })
        }
      }
      const licitacoesDoUsuario = [...licitacoesMap.values()]

      const canaisEnviados: string[] = []

      // E-mail: todos (com info de trial se aplicável)
      // Telegram/WA urgentes são gerenciados pelo /api/cron/alertar-urgente (a cada 5 min)
      const emailOk = await enviarAlertaEmailUsuario(email, licitacoesDoUsuario, totalRestante, trialInfo)
      if (emailOk) canaisEnviados.push('email')

      if (canaisEnviados.length > 0) {
        const ids = alertasParaEnviar.map(a => a.id)
        await supabase
          .from('alertas')
          .update({ canais: canaisEnviados, enviado_em: new Date().toISOString() })
          .in('id', ids)
        totalEnviados += alertasParaEnviar.length
      }

      resultadosPorUsuario[email] = {
        alertas:      alertasParaEnviar.length,
        canais:       canaisEnviados,
        emailsPorDia,
        itensPorEmail,
        horaBRT,
        ok: canaisEnviados.length > 0,
      }
    }))
  }

  const totalUsuarios = Object.keys(resultadosPorUsuario).length
  console.log(`Alertas: ${totalEnviados} enviados para ${totalUsuarios} usuários (BRT ${horaBRT}h)`)

  await registrarCronLog({
    job:      'alertar',
    status:   'ok',
    mensagem: `${totalEnviados} alertas para ${totalUsuarios} usuário(s) — BRT ${horaBRT}h`,
    detalhes: resultadosPorUsuario,
  })

  return NextResponse.json({ ok: true, enviados: totalEnviados, usuarios: totalUsuarios, horaBRT, detalhes: resultadosPorUsuario })
}

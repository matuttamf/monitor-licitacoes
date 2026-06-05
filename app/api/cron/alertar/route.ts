import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { enviarAlertaEmailUsuario } from '@/lib/alerts/email'
import { enviarAlertaTelegram } from '@/lib/alerts/telegram'

export const maxDuration = 300

function dentroDoHorarioComercial(): boolean {
  const agora = new Date()
  const brasilia = new Date(agora.getTime() - 3 * 60 * 60 * 1000)
  const dia = brasilia.getUTCDay()
  const hora = brasilia.getUTCHours()
  return dia >= 1 && dia <= 5 && hora >= 7 && hora < 17
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  if (!dentroDoHorarioComercial()) {
    return NextResponse.json({ ok: true, motivo: 'Fora do horário comercial', enviados: 0 })
  }

  const supabase = await createServiceClient()

  // Buscar alertas pendentes (canais vazio) criados nas últimas 48h
  // Inclui keyword (com user_id) e dados da licitação
  const { data: alertasPendentes, error } = await supabase
    .from('alertas')
    .select(`
      id,
      licitacao_id,
      keyword_id,
      canais,
      criado_em,
      licitacoes (id, orgao, objeto, valor_estimado, data_abertura, url, estado, cidade),
      keywords (id, termo, user_id)
    `)
    .eq('canais', '{}')
    .gte('criado_em', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())
    .order('criado_em', { ascending: true })
    .limit(200)

  if (error) {
    console.error('Erro ao buscar alertas:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!alertasPendentes?.length) {
    return NextResponse.json({ ok: true, enviados: 0, pendentes: 0 })
  }

  // Agrupar alertas por user_id (dono da keyword)
  const alertasPorUsuario = new Map<string, typeof alertasPendentes>()
  for (const alerta of alertasPendentes) {
    const userId = (alerta.keywords as any)?.user_id
    if (!userId) continue
    if (!alertasPorUsuario.has(userId)) alertasPorUsuario.set(userId, [])
    alertasPorUsuario.get(userId)!.push(alerta)
  }

  // Buscar emails de todos os usuários envolvidos
  const userIds = [...alertasPorUsuario.keys()]
  const { data: authUsers } = await supabase.auth.admin.listUsers()
  const emailMap = Object.fromEntries(
    (authUsers?.users ?? [])
      .filter(u => userIds.includes(u.id))
      .map(u => [u.id, u.email!])
  )

  // Buscar status dos usuários (só envia para trial/active)
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, status')
    .in('id', userIds)
  const statusMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p.status]))

  let totalEnviados = 0
  const resultadosPorUsuario: Record<string, { email: string; alertas: number; ok: boolean }> = {}

  for (const [userId, alertas] of alertasPorUsuario.entries()) {
    const emailUsuario = emailMap[userId]
    const statusUsuario = statusMap[userId]

    // Pular usuários expirados ou sem email
    if (!emailUsuario || statusUsuario === 'expired') continue

    const licitacoesDoUsuario = alertas.map(a => ({
      id: a.licitacao_id,
      orgao: (a.licitacoes as any).orgao,
      objeto: (a.licitacoes as any).objeto,
      valor_estimado: (a.licitacoes as any).valor_estimado,
      data_abertura: (a.licitacoes as any).data_abertura,
      url: (a.licitacoes as any).url,
      estado: (a.licitacoes as any).estado,
      cidade: (a.licitacoes as any).cidade,
      keyword: (a.keywords as any).termo,
    }))

    const canaisEnviados: string[] = []

    // Enviar e-mail para este usuário
    const emailOk = await enviarAlertaEmailUsuario(emailUsuario, licitacoesDoUsuario)
    if (emailOk) canaisEnviados.push('email')

    // Telegram só para admin (por enquanto)
    if (emailUsuario === process.env.ADMIN_EMAIL) {
      const telegramOk = await enviarAlertaTelegram(licitacoesDoUsuario)
      if (telegramOk) canaisEnviados.push('telegram')
    }

    // Marcar alertas deste usuário como enviados
    if (canaisEnviados.length > 0) {
      const ids = alertas.map(a => a.id)
      await supabase
        .from('alertas')
        .update({ canais: canaisEnviados, enviado_em: new Date().toISOString() })
        .in('id', ids)
      totalEnviados += alertas.length
    }

    resultadosPorUsuario[emailUsuario] = {
      email: emailUsuario,
      alertas: alertas.length,
      ok: canaisEnviados.length > 0,
    }
  }

  console.log(`Alertas enviados para ${Object.keys(resultadosPorUsuario).length} usuários, ${totalEnviados} alertas no total`)

  return NextResponse.json({
    ok: true,
    enviados: totalEnviados,
    usuarios: Object.keys(resultadosPorUsuario).length,
    detalhes: resultadosPorUsuario,
  })
}

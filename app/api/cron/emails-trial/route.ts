import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { verificarCronAuth, sistemaPausado } from '@/lib/cron-auth'
import { registrarCronLog } from '@/lib/cron-log'
import { enviarEmailDia3, enviarEmailUrgencia } from '@/lib/emails/trial'
import { enviarWATrialDia3, enviarWATrialExpirando } from '@/lib/alerts/whatsapp'

export const maxDuration = 300

export async function GET(request: Request) {
  if (!verificarCronAuth(request)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  if (await sistemaPausado()) {
    return NextResponse.json({ ok: false, motivo: 'sistema pausado para manutencao' }, { status: 503 })
  }

  const supabase = await createServiceClient()

  // Buscar usuários em trial — limit garante escala (em 50k usuários ~10% em trial = 5k)
  const { data: usuarios } = await supabase
    .from('profiles')
    .select('id, trial_inicio, trial_fim, status, nome, whatsapp, whatsapp_pausado_ate')
    .eq('status', 'trial')
    .limit(10000)

  if (!usuarios?.length) return NextResponse.json({ ok: true, enviados: 0 })

  // Busca e-mails em lote via listUsers paginado — evita N chamadas getUserById sequenciais.
  // Com 5k trials: 5 páginas de 1000, ~5 chamadas vs 5000 individuais.
  const uids = new Set(usuarios.map(u => u.id))
  const allAuthUsers: { id: string; email?: string }[] = []
  for (let page = 1; ; page++) {
    const { data: pg } = await supabase.auth.admin.listUsers({ page, perPage: 1000 })
    const users = pg?.users ?? []
    allAuthUsers.push(...users.filter(u => uids.has(u.id)))
    if (users.length < 1000) break
  }
  const emailMap = Object.fromEntries(allAuthUsers.map(u => [u.id, u.email ?? '']))

  let enviados = 0
  let erros = 0
  const agora = new Date()

  for (const usuario of usuarios) {
    const inicio = new Date(usuario.trial_inicio)
    const diasDeTrial = Math.floor((agora.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24))

    const email = emailMap[usuario.id]
    if (!email) continue

    // Verifica se trial expira amanhã (usa trial_fim — mais preciso que contar dias)
    const fim    = new Date(usuario.trial_fim)
    const amanha = new Date(agora)
    amanha.setDate(amanha.getDate() + 1)
    const expiraAmanha = fim.toDateString() === amanha.toDateString()

    try {
      // Dia 3: e-mail de engajamento
      if (diasDeTrial === 3) {
        const keywordsResult = await supabase
          .from('keywords')
          .select('id, termo')
          .eq('user_id', usuario.id)
          .eq('ativo', true)

        const keywordIds = keywordsResult.data?.map(k => k.id) ?? []
        const termos     = keywordsResult.data?.map(k => k.termo as string) ?? []

        let count = 0
        if (termos.length > 0) {
          const hoje = new Date().toISOString().substring(0, 10)
          const { count: licitacaoCount } = await supabase
            .from('licitacoes')
            .select('id', { count: 'exact' })
            .or(termos.map(t => `objeto.ilike.%${t}%`).join(','))
            .or(`data_abertura.is.null,data_abertura.gte.${hoje}`)

          count = licitacaoCount ?? 0
        }

        await enviarEmailDia3(email, count, termos)
        if (usuario.whatsapp) await enviarWATrialDia3(usuario.whatsapp, usuario.nome ?? null, count, termos)
        enviados++
      }

      // Expira amanhã: e-mail de urgência (baseado em trial_fim, cobre trials de duração variável)
      if (expiraAmanha) {
        await enviarEmailUrgencia(email)
        if (usuario.whatsapp) await enviarWATrialExpirando(usuario.whatsapp, usuario.nome ?? null)
        enviados++
      }
    } catch (error) {
      console.error(`Erro ao enviar e-mail para ${email}:`, error)
      erros++
    }
  }

  const resultado = { ok: true, enviados, erros }
  await registrarCronLog({
    job: 'emails-trial',
    status: erros > 0 && enviados === 0 ? 'erro' : 'ok',
    mensagem: `${enviados} e-mail(s) enviados${erros > 0 ? `, ${erros} erro(s)` : ''}`,
    detalhes: resultado,
  })
  return NextResponse.json(resultado)
}

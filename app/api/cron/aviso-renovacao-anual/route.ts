import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { verificarCronAuth, sistemaPausado } from '@/lib/cron-auth'
import { registrarCronLog } from '@/lib/cron-log'
import { enviarAvisoRenovacaoAnual } from '@/lib/emails/assinatura'

export const maxDuration = 300

export async function GET(request: Request) {
  if (!verificarCronAuth(request)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  if (await sistemaPausado()) {
    return NextResponse.json({ ok: false, motivo: 'sistema pausado para manutencao' }, { status: 503 })
  }

  const supabase = await createServiceClient()
  const detalhes: Record<string, unknown>[] = []
  let enviados = 0

  // Janela: assinaturas anuais que vencem em 29–31 dias a partir de hoje
  const agora     = new Date()
  const em29Dias  = new Date(agora.getTime() + 29 * 24 * 60 * 60 * 1000)
  const em31Dias  = new Date(agora.getTime() + 31 * 24 * 60 * 60 * 1000)

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, plano, periodo, valor_mensalidade, assinatura_inicio')
    .eq('status', 'active')
    .eq('periodo', 'anual')
    .not('assinatura_inicio', 'is', null)
    .not('mp_subscription_id', 'is', null)

  if (!profiles?.length) {
    await registrarCronLog({ job: 'aviso-renovacao-anual', status: 'ok', mensagem: '0 assinaturas anuais ativas' })
    return NextResponse.json({ ok: true, enviados: 0 })
  }

  // Filtrar os que renovam na janela 29-31 dias
  const naJanela = profiles.filter(p => {
    if (!p.assinatura_inicio) return false
    const inicio = new Date(p.assinatura_inicio)
    // Calcula próximo aniversário
    const proximoAniversario = new Date(inicio)
    while (proximoAniversario <= agora) {
      proximoAniversario.setFullYear(proximoAniversario.getFullYear() + 1)
    }
    return proximoAniversario >= em29Dias && proximoAniversario <= em31Dias
  })

  if (!naJanela.length) {
    await registrarCronLog({ job: 'aviso-renovacao-anual', status: 'ok', mensagem: '0 renovações na janela de 30 dias' })
    return NextResponse.json({ ok: true, enviados: 0 })
  }

  const uids = naJanela.map(p => p.id)
  const allAuthUsers: { id: string; email?: string }[] = []
  for (let page = 1; ; page++) {
    const { data: pg } = await supabase.auth.admin.listUsers({ page, perPage: 1000 })
    if (!pg?.users?.length) break
    allAuthUsers.push(...pg.users.filter(u => uids.includes(u.id)))
    if (pg.users.length < 1000) break
  }
  const emailMap = Object.fromEntries(allAuthUsers.map(u => [u.id, u.email!]))

  for (const profile of naJanela) {
    const email = emailMap[profile.id]
    if (!email) continue

    const inicio = new Date(profile.assinatura_inicio!)
    const proximoAniversario = new Date(inicio)
    while (proximoAniversario <= agora) {
      proximoAniversario.setFullYear(proximoAniversario.getFullYear() + 1)
    }

    try {
      await enviarAvisoRenovacaoAnual(
        email,
        profile.plano ?? 'basic',
        profile.valor_mensalidade ?? 0,
        proximoAniversario,
      )
      enviados++
      detalhes.push({ email, plano: profile.plano, renovacao: proximoAniversario.toISOString() })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`aviso-renovacao-anual erro ${email}:`, msg)
      detalhes.push({ email, erro: msg })
    }
  }

  await registrarCronLog({
    job:      'aviso-renovacao-anual',
    status:   'ok',
    mensagem: `${enviados} aviso(s) enviado(s)`,
    detalhes: Object.fromEntries(detalhes.map((d, i) => [i, d])),
  })

  return NextResponse.json({ ok: true, enviados, detalhes })
}

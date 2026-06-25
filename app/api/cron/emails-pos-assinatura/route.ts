import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { verificarCronAuth, sistemaPausado } from '@/lib/cron-auth'
import { registrarCronLog } from '@/lib/cron-log'
import {
  enviarEmailPosAssinaturaDia1,
  enviarEmailPosAssinaturaDia7,
  enviarEmailPosAssinaturaDia30,
} from '@/lib/emails/assinatura'
import { enviarWAPosAssinaturaDia1, enviarWAPosAssinaturaDia7 } from '@/lib/alerts/whatsapp'

export const maxDuration = 300

function janela(diasAtras: number): { inicio: string; fim: string } {
  const base = Date.now() - diasAtras * 24 * 60 * 60 * 1000
  return {
    inicio: new Date(base - 2 * 60 * 60 * 1000).toISOString(),
    fim:    new Date(base + 2 * 60 * 60 * 1000).toISOString(),
  }
}

async function keywordIds(supabase: Awaited<ReturnType<typeof createServiceClient>>, userId: string): Promise<string[]> {
  const { data } = await supabase.from('keywords').select('id').eq('user_id', userId)
  return (data ?? []).map(k => k.id)
}

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

  const j1  = janela(1)
  const j7  = janela(7)
  const j30 = janela(30)

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, plano, status, email_pausado_ate, assinatura_inicio, nome, whatsapp, whatsapp_pausado_ate')
    .eq('status', 'active')
    .not('assinatura_inicio', 'is', null)
    .or([
      `assinatura_inicio.gte.${j1.inicio},assinatura_inicio.lte.${j1.fim}`,
      `assinatura_inicio.gte.${j7.inicio},assinatura_inicio.lte.${j7.fim}`,
      `assinatura_inicio.gte.${j30.inicio},assinatura_inicio.lte.${j30.fim}`,
    ].join(','))

  if (!profiles?.length) {
    await registrarCronLog({ job: 'emails-pos-assinatura', status: 'ok', mensagem: '0 usuários na janela' })
    return NextResponse.json({ ok: true, enviados: 0 })
  }

  const uids = profiles.map(p => p.id)
  const allAuthUsers: { id: string; email?: string }[] = []
  for (let page = 1; ; page++) {
    const { data: pg } = await supabase.auth.admin.listUsers({ page, perPage: 1000 })
    if (!pg?.users?.length) break
    allAuthUsers.push(...pg.users.filter(u => uids.includes(u.id)))
    if (pg.users.length < 1000) break
  }
  const emailMap = Object.fromEntries(allAuthUsers.map(u => [u.id, u.email!]))

  for (const profile of profiles) {
    const email = emailMap[profile.id]
    if (!email) continue
    if (profile.email_pausado_ate && new Date(profile.email_pausado_ate) > new Date()) continue

    const inicio = new Date(profile.assinatura_inicio).getTime()
    const agora  = Date.now()
    const diasPassados = (agora - inicio) / (24 * 60 * 60 * 1000)

    let tipo: 'dia1' | 'dia7' | 'dia30' | null = null
    if (diasPassados >= 0.9  && diasPassados <= 1.1)  tipo = 'dia1'
    else if (diasPassados >= 6.9  && diasPassados <= 7.1)  tipo = 'dia7'
    else if (diasPassados >= 29.9 && diasPassados <= 30.1) tipo = 'dia30'
    if (!tipo) continue

    try {
      if (tipo === 'dia1') {
        await enviarEmailPosAssinaturaDia1(email, profile.plano ?? 'basic')
        if (profile.whatsapp) await enviarWAPosAssinaturaDia1(profile.whatsapp, profile.nome ?? null)

      } else if (tipo === 'dia7') {
        const kIds = await keywordIds(supabase, profile.id)
        const semanaAtras = new Date(agora - 7 * 24 * 60 * 60 * 1000).toISOString()

        const { count: totalAlertas } = await supabase
          .from('alertas')
          .select('id', { count: 'exact' })
          .gte('criado_em', semanaAtras)
          .in('keyword_id', kIds)

        const { count: totalLicitacoes } = await supabase
          .from('alertas')
          .select('licitacao_id', { count: 'exact' })
          .gte('criado_em', semanaAtras)
          .in('keyword_id', kIds)

        await enviarEmailPosAssinaturaDia7(
          email,
          totalAlertas ?? 0,
          totalLicitacoes ?? 0,
        )
        if (profile.whatsapp) await enviarWAPosAssinaturaDia7(profile.whatsapp, profile.nome ?? null)

      } else if (tipo === 'dia30') {
        const kIds = await keywordIds(supabase, profile.id)
        const mesAtras = new Date(agora - 30 * 24 * 60 * 60 * 1000).toISOString()

        const { count: totalAlertas } = await supabase
          .from('alertas')
          .select('id', { count: 'exact' })
          .gte('criado_em', mesAtras)
          .in('keyword_id', kIds)

        const { count: totalLicitacoes } = await supabase
          .from('alertas')
          .select('licitacao_id', { count: 'exact' })
          .gte('criado_em', mesAtras)
          .in('keyword_id', kIds)

        const { data: valoresData } = await supabase
          .from('alertas')
          .select('licitacoes!inner(valor_estimado)')
          .gte('criado_em', mesAtras)
          .in('keyword_id', kIds)
          .not('licitacoes.valor_estimado', 'is', null)

        const volumeMonitorado = (valoresData ?? []).reduce((sum, a) => {
          const v = (a.licitacoes as unknown as { valor_estimado: number })?.valor_estimado
          return sum + (v ?? 0)
        }, 0)

        await enviarEmailPosAssinaturaDia30(
          email,
          profile.plano ?? 'basic',
          totalAlertas ?? 0,
          totalLicitacoes ?? 0,
          volumeMonitorado,
        )
      }

      enviados++
      detalhes.push({ email, tipo, plano: profile.plano })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`emails-pos-assinatura erro ${email} ${tipo}:`, msg)
      detalhes.push({ email, tipo, erro: msg })
    }
  }

  await registrarCronLog({
    job:      'emails-pos-assinatura',
    status:   'ok',
    mensagem: `${enviados} e-mail(s) enviado(s)`,
    detalhes: Object.fromEntries(detalhes.map((d, i) => [i, d])),
  })

  return NextResponse.json({ ok: true, enviados, detalhes })
}

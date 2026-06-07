import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ADMIN_EMAIL = 'matuttamaquinaseferramentas@gmail.com'

export async function POST(request: Request) {
  const supabase = await createServiceClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const { acao } = await request.json()
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://monitor-licitacoes-two.vercel.app'
  const secret = process.env.CRON_SECRET

  // Ação especial: remover região Norte das keywords do admin
  if (acao === 'remover-norte') {
    const NORTE = ['norte', 'AC', 'AM', 'AP', 'PA', 'RO', 'RR', 'TO']
    const OUTRAS = ['nordeste', 'sudeste', 'sul', 'centro_oeste']

    // Busca keywords do admin
    const { data: kws, error: errKw } = await supabase
      .from('keywords')
      .select('id, regiao')
      .eq('user_id', user.id)

    if (errKw) return NextResponse.json({ error: errKw.message }, { status: 500 })

    let atualizadas = 0
    for (const kw of kws ?? []) {
      const regioes: string[] = kw.regiao ?? ['brasil']

      // brasil → troca por todas exceto Norte
      if (regioes.includes('brasil')) {
        await supabase.from('keywords').update({ regiao: OUTRAS }).eq('id', kw.id)
        atualizadas++
        continue
      }

      // Remove Norte e UFs do Norte
      const nova = regioes.filter(r => !NORTE.includes(r))
      if (nova.length !== regioes.length) {
        await supabase.from('keywords').update({ regiao: nova.length ? nova : ['brasil'] }).eq('id', kw.id)
        atualizadas++
      }
    }

    return NextResponse.json({ ok: true, atualizadas, total: kws?.length ?? 0 })
  }

  const rotas: Record<string, string> = {
    coletar:           `${baseUrl}/api/cron/coletar`,
    matching:          `${baseUrl}/api/cron/matching`,
    alertar:           `${baseUrl}/api/cron/alertar`,
    emails:            `${baseUrl}/api/cron/emails-trial`,
    'expirar-trials':  `${baseUrl}/api/cron/expirar-trials`,
    'coletar-leads':      `${baseUrl}/api/cron/coletar-leads`,
    'disparar-leads':     `${baseUrl}/api/cron/disparar-leads`,
    'reconverter-trials': `${baseUrl}/api/cron/reconverter-trials`,
  }

  const url = rotas[acao]
  if (!url) return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })

  // Matching roda em background — retorna imediatamente sem aguardar
  const fireAndForget = acao === 'matching'

  if (fireAndForget) {
    fetch(url, { headers: { 'Authorization': `Bearer ${secret}`, 'X-Cron-Secret': secret ?? '' } }).catch(console.error)
    return NextResponse.json({ ok: true, status: 202, data: { ok: true, msg: 'Matching disparado em background. Verifique Alertas em ~60s.' } })
  }

  try {
    const res = await fetch(url, {
      headers: {
        // Vercel pode remover Authorization em chamadas server-to-server internas.
        // Enviamos o secret nos dois headers; o cron aceita qualquer um dos dois.
        'Authorization':  `Bearer ${secret}`,
        'X-Cron-Secret':  secret ?? '',
      },
      signal: AbortSignal.timeout(55000), // 55s timeout para não travar o botão
    })
    const texto = await res.text()
    let data
    try { data = JSON.parse(texto) } catch { data = { raw: texto } }
    return NextResponse.json({ ok: res.ok, status: res.status, data })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

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

  const rotas: Record<string, string> = {
    coletar:          `${baseUrl}/api/cron/coletar`,
    matching:         `${baseUrl}/api/cron/matching`,
    alertar:          `${baseUrl}/api/cron/alertar`,
    emails:           `${baseUrl}/api/cron/emails-trial`,
    'expirar-trials': `${baseUrl}/api/cron/expirar-trials`,
  }

  const url = rotas[acao]
  if (!url) return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })

  // Matching roda em background — retorna imediatamente sem aguardar
  const fireAndForget = acao === 'matching'

  if (fireAndForget) {
    fetch(url, { headers: { Authorization: `Bearer ${secret}` } }).catch(console.error)
    return NextResponse.json({ ok: true, status: 202, data: { ok: true, msg: 'Matching disparado em background. Verifique Alertas em ~60s.' } })
  }

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${secret}` },
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

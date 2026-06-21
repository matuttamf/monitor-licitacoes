import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ACCESS_TOKEN = process.env.MP_AMBIENTE === 'production'
  ? process.env.MP_ACCESS_TOKEN_PROD!
  : process.env.MP_ACCESS_TOKEN_TEST!

async function listarPreapprovals(status?: string): Promise<{ id: string; status: string; payer_email: string; external_reference: string }[]> {
  const params = new URLSearchParams({ limit: '100' })
  if (status) params.set('status', status)
  const res = await fetch(`https://api.mercadopago.com/preapproval/search?${params}`, {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
  })
  const data = await res.json()
  return data.results ?? []
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  const assinaturas = await listarPreapprovals()
  return NextResponse.json({ assinaturas, total: assinaturas.length })
}

export async function DELETE() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const assinaturas = await listarPreapprovals()
  const resultados: { id: string; email: string; ok: boolean }[] = []

  for (const a of assinaturas) {
    if (a.status === 'cancelled') {
      resultados.push({ id: a.id, email: a.payer_email, ok: true })
      continue
    }
    const res = await fetch(`https://api.mercadopago.com/preapproval/${a.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ACCESS_TOKEN}` },
      body: JSON.stringify({ status: 'cancelled' }),
    })
    resultados.push({ id: a.id, email: a.payer_email, ok: res.ok })
  }

  const cancelados = resultados.filter(r => r.ok).length
  return NextResponse.json({ cancelados, total: assinaturas.length, resultados })
}

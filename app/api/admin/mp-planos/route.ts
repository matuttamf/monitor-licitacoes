import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ACCESS_TOKEN = process.env.MP_AMBIENTE === 'production'
  ? process.env.MP_ACCESS_TOKEN_PROD!
  : process.env.MP_ACCESS_TOKEN_TEST!

async function listarPlanos(): Promise<{ id: string; reason: string; status: string }[]> {
  const res = await fetch('https://api.mercadopago.com/preapproval_plan/search?limit=100', {
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
  const planos = await listarPlanos()
  return NextResponse.json({ planos, total: planos.length })
}

export async function DELETE() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const planos = await listarPlanos()
  const resultados: { id: string; reason: string; ok: boolean }[] = []

  for (const plano of planos) {
    const res = await fetch(`https://api.mercadopago.com/preapproval_plan/${plano.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ACCESS_TOKEN}` },
      body: JSON.stringify({ status: 'cancelled' }),
    })
    resultados.push({ id: plano.id, reason: plano.reason, ok: res.ok })
  }

  return NextResponse.json({ deletados: resultados.filter(r => r.ok).length, total: planos.length, resultados })
}

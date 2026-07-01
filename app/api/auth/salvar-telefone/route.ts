import { createClient, createServiceClient } from '@/lib/supabase/server'
import { rateLimitGuard, getIp } from '@/lib/rate-limit'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  if (!await rateLimitGuard(`ip:${getIp(request)}:salvar-telefone`, 10, 60_000)) {
    return NextResponse.json({ error: 'Muitas tentativas. Aguarde.' }, { status: 429 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { telefone, nome } = await request.json().catch(() => ({}))
  if (!telefone?.trim()) return NextResponse.json({ error: 'Telefone obrigatório' }, { status: 400 })

  // Sanitização básica: aceita apenas dígitos, parênteses, espaços e hífen
  const telLimpo = telefone.replace(/[^\d\s()\-+]/g, '').trim()
  const digits = telLimpo.replace(/\D/g, '')
  if (digits.length < 10 || digits.length > 13) {
    return NextResponse.json({ error: 'Telefone inválido.' }, { status: 400 })
  }

  const serviceClient = await createServiceClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const update: Record<string, any> = { telefone: telLimpo }
  if (nome?.trim()) update.nome = nome.trim().slice(0, 100)

  const { error } = await serviceClient
    .from('profiles')
    .update(update)
    .eq('id', user.id)

  if (error) {
    console.error('[salvar-telefone] Erro ao salvar:', error.message, { userId: user.id })
    return NextResponse.json({ error: 'Erro ao salvar. Tente novamente.' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}

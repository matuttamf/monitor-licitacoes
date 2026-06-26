import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getLimites, OPCOES_EMAILS_DIA } from '@/lib/planos'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { data } = await supabase
    .from('profiles')
    .select('nome, telefone, whatsapp, empresa, cnpj, telegram_chat_id, min_valor_interesse, max_valor_interesse, emails_por_dia, itens_por_email, plano, periodo, status, pausa_ate, trial_fim, email_pausado_ate, telegram_pausado_ate, whatsapp_pausado_ate')
    .eq('id', user.id)
    .single()

  return NextResponse.json({ ...data, email: user.email })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const body = await request.json()
  const {
    nome, telefone, whatsapp, empresa, telegram_chat_id,
    min_valor_interesse, max_valor_interesse,
    emails_por_dia, itens_por_email,
    email_pausado_ate, telegram_pausado_ate, whatsapp_pausado_ate,
  } = body

  // Buscar plano atual para validar limites
  const { data: perfil } = await supabase
    .from('profiles')
    .select('plano')
    .eq('id', user.id)
    .single()

  const limites = getLimites(perfil?.plano ?? 'basic')

  // Salva apenas dígitos — facilita comparações e o Z-API já formata internamente
  const normFone = (v: unknown) => {
    if (!v || typeof v !== 'string') return v ?? null
    const d = v.replace(/\D/g, '')
    return d || null
  }

  const update: Record<string, unknown> = {
    nome, empresa, telegram_chat_id,
    telefone: normFone(telefone),
    whatsapp: normFone(whatsapp),
    min_valor_interesse: min_valor_interesse ?? 0,
    max_valor_interesse: max_valor_interesse ?? 0,
  }

  // Preferências de e-mail — validar contra plano
  if (emails_por_dia !== undefined) {
    if (!OPCOES_EMAILS_DIA.includes(emails_por_dia))
      return NextResponse.json({ error: 'Quantidade de e-mails inválida' }, { status: 400 })
    if (emails_por_dia > limites.maxEmailsPorDia)
      return NextResponse.json({ error: `Seu plano permite até ${limites.maxEmailsPorDia} e-mails/dia` }, { status: 400 })
    update.emails_por_dia = emails_por_dia
  }

  if (itens_por_email !== undefined) {
    if (![10, 20, 30].includes(itens_por_email))
      return NextResponse.json({ error: 'Quantidade de itens inválida' }, { status: 400 })
    if (itens_por_email > limites.maxItensPorEmail)
      return NextResponse.json({ error: `Seu plano permite até ${limites.maxItensPorEmail} itens por e-mail` }, { status: 400 })
    update.itens_por_email = itens_por_email
  }

  // Pausas por canal — aceita ISO string ou null (reativar)
  if ('email_pausado_ate' in body)     update.email_pausado_ate     = email_pausado_ate     ?? null
  if ('telegram_pausado_ate' in body)  update.telegram_pausado_ate  = telegram_pausado_ate  ?? null
  if ('whatsapp_pausado_ate' in body)  update.whatsapp_pausado_ate  = whatsapp_pausado_ate  ?? null

  const { error } = await supabase
    .from('profiles')
    .update(update)
    .eq('id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

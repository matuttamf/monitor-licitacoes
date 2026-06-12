import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'matuttamaquinaseferramentas@gmail.com'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.email !== ADMIN_EMAIL) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  const body = await req.json().catch(() => ({}))
  const { razao_social, cnpj, email, telefone, municipio, uf, segmento } = body

  if (!razao_social?.trim()) return NextResponse.json({ error: 'Razão social é obrigatória' }, { status: 400 })
  if (!email?.trim())        return NextResponse.json({ error: 'E-mail é obrigatório' }, { status: 400 })

  const service = createAdminClient()

  // Checa duplicata por CNPJ
  if (cnpj?.trim()) {
    const cnpjLimpo = cnpj.replace(/\D/g, '')
    const { data: porCnpj } = await service
      .from('leads')
      .select('id, razao_social, status')
      .eq('cnpj', cnpjLimpo)
      .maybeSingle()
    if (porCnpj) {
      return NextResponse.json({
        error: `CNPJ já consta no banco: "${porCnpj.razao_social}" (status: ${porCnpj.status})`,
        duplicata: true,
        lead: porCnpj,
      }, { status: 409 })
    }
  }

  // Checa duplicata por razão social (exact, case-insensitive)
  const { data: porNome } = await service
    .from('leads')
    .select('id, razao_social, cnpj, status')
    .ilike('razao_social', razao_social.trim())
    .maybeSingle()
  if (porNome) {
    return NextResponse.json({
      error: `Empresa já consta no banco: "${porNome.razao_social}" (CNPJ: ${porNome.cnpj ?? 'N/A'}, status: ${porNome.status})`,
      duplicata: true,
      lead: porNome,
    }, { status: 409 })
  }

  // Checa duplicata por e-mail
  const { data: porEmail } = await service
    .from('leads')
    .select('id, razao_social, status')
    .eq('email', email.trim().toLowerCase())
    .maybeSingle()
  if (porEmail) {
    return NextResponse.json({
      error: `E-mail já consta no banco: usado por "${porEmail.razao_social}" (status: ${porEmail.status})`,
      duplicata: true,
      lead: porEmail,
    }, { status: 409 })
  }

  const { data, error } = await service
    .from('leads')
    .insert({
      razao_social:  razao_social.trim().toUpperCase(),
      cnpj:          cnpj?.replace(/\D/g, '') || null,
      email:         email.trim().toLowerCase(),
      telefone:      telefone?.trim() || null,
      municipio:     municipio?.trim() || null,
      uf:            uf?.trim()?.toUpperCase() || null,
      segmento:      segmento?.trim() || null,
      status:        'pendente',
      fonte:         'busca_manual',
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, id: data.id })
}

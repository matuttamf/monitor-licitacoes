import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'matuttamaquinaseferramentas@gmail.com'

interface LeadPayload {
  cnpj: string
  razao_social: string
  nome_fantasia?: string
  email: string
  telefone?: string
  municipio?: string
  uf?: string
  situacao?: string
  porte?: string
  cnae?: string
  objeto?: string
  valor?: number
  data_contrato?: string
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const { leads } = await req.json() as { leads: LeadPayload[] }
  if (!Array.isArray(leads) || leads.length === 0) {
    return NextResponse.json({ error: 'Nenhum lead enviado' }, { status: 400 })
  }

  const service = await createServiceClient()

  const rows = leads
    .filter(l => l.cnpj && l.email)
    .map(l => ({
      cnpj:          l.cnpj,
      razao_social:  l.razao_social,
      nome_fantasia: l.nome_fantasia ?? null,
      email:         l.email.toLowerCase().trim(),
      telefone:      l.telefone ?? null,
      municipio:     l.municipio ?? null,
      uf:            l.uf ?? null,
      situacao:      l.situacao ?? null,
      porte:         l.porte ?? null,
      cnae:          l.cnae ?? null,
      objeto:        l.objeto ?? null,
      valor:         l.valor ?? null,
      data_contrato: l.data_contrato ?? null,
      status:        'pendente',
      fonte:         'busca_manual',
    }))

  const { error } = await service
    .from('leads')
    .upsert(rows, { onConflict: 'cnpj', ignoreDuplicates: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, importados: rows.length })
}

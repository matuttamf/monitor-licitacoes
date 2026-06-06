import { createClient } from '@/lib/supabase/server'
import { type NextRequest } from 'next/server'
import { estadoCompativelComRegioes } from '@/lib/regioes'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Não autorizado', { status: 401 })

  const sp = request.nextUrl.searchParams
  const busca   = sp.get('busca')?.trim() ?? ''
  const kwTermo = sp.get('keyword') ?? ''
  const regioes = sp.get('regioes')?.split(',').filter(Boolean) ?? []

  let query = supabase
    .from('alertas')
    .select(`
      id, criado_em, enviado_em, canais,
      licitacoes(orgao, objeto, url, estado, cidade, valor_estimado, data_abertura),
      keywords(termo)
    `)
    .order('enviado_em', { ascending: false, nullsFirst: false })
    .limit(5000)

  if (kwTermo) {
    query = query.eq('keywords.termo', kwTermo)
  }

  const { data, error } = await query
  if (error) return new Response(error.message, { status: 500 })

  type LicRow = { orgao?: string; objeto?: string; url?: string; estado?: string; cidade?: string; valor_estimado?: number; data_abertura?: string } | null
  type KwRow  = { termo?: string } | null

  let resultado = data ?? []

  // Filtro de região (mesmo comportamento do route principal)
  if (regioes.length > 0 && !regioes.includes('brasil')) {
    resultado = resultado.filter(a => {
      const lic = a.licitacoes as unknown as { estado?: string } | null
      return estadoCompativelComRegioes(lic?.estado, regioes)
    })
  }

  if (busca) {
    const termo = busca.toLowerCase()
    resultado = resultado.filter(a => {
      const lic = a.licitacoes as unknown as LicRow
      const kw  = a.keywords  as unknown as KwRow
      return (
        lic?.orgao?.toLowerCase().includes(termo) ||
        lic?.objeto?.toLowerCase().includes(termo) ||
        kw?.termo?.toLowerCase().includes(termo)
      )
    })
  }

  const HEADER = ['ID', 'Data do alerta', 'Canais', 'Palavra-chave', 'Órgão', 'Objeto', 'Valor estimado (R$)', 'Data de abertura', 'Estado', 'Cidade', 'URL']

  function csvCell(v: string | number | undefined | null): string {
    if (v == null) return ''
    const s = String(v)
    if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`
    return s
  }

  const rows = resultado.map(a => {
    const lic = a.licitacoes as unknown as LicRow
    const kw  = a.keywords  as unknown as KwRow
    return [
      csvCell(a.id),
      csvCell(a.enviado_em ? new Date(a.enviado_em).toLocaleString('pt-BR') : ''),
      csvCell((a.canais ?? []).join('; ')),
      csvCell(kw?.termo),
      csvCell(lic?.orgao),
      csvCell(lic?.objeto),
      csvCell(lic?.valor_estimado != null ? lic.valor_estimado.toFixed(2) : ''),
      csvCell(lic?.data_abertura ? new Date(lic.data_abertura).toLocaleDateString('pt-BR') : ''),
      csvCell(lic?.estado),
      csvCell(lic?.cidade),
      csvCell(lic?.url),
    ].join(',')
  })

  const csv = [HEADER.join(','), ...rows].join('\n')
  const dataStr = new Date().toISOString().slice(0, 10)

  return new Response('﻿' + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="alertas-${dataStr}.csv"`,
    },
  })
}

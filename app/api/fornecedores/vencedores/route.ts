import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { temFornecedores } from '@/lib/planos'

export const dynamic = 'force-dynamic'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'matuttamaquinaseferramentas@gmail.com'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('plano, status')
    .eq('id', user.id)
    .single()

  const plano  = profile?.plano  ?? 'basic'
  const status = profile?.status ?? 'trial'
  const isAdmin = user.email === ADMIN_EMAIL

  if (!isAdmin && !temFornecedores(plano)) {
    return NextResponse.json({ error: 'plano_insuficiente' }, { status: 403 })
  }
  if (!isAdmin && status !== 'active') {
    return NextResponse.json({ error: 'plano_insuficiente' }, { status: 403 })
  }

  const url       = new URL(request.url)
  const busca     = url.searchParams.get('q')?.trim()          ?? ''
  const regiao    = url.searchParams.get('regiao')?.trim()     ?? ''
  const anoInicio = url.searchParams.get('ano_inicio')?.trim() ?? ''
  const anoFim    = url.searchParams.get('ano_fim')?.trim()    ?? ''

  // Mapa usando nomes completos pois r.estado no banco armazena nome por extenso
  const REGIAO_ESTADOS: Record<string, string[]> = {
    'Norte':        ['Acre','Amazonas','Amapá','Pará','Rondônia','Roraima','Tocantins'],
    'Nordeste':     ['Alagoas','Bahia','Ceará','Maranhão','Paraíba','Pernambuco','Piauí','Rio Grande do Norte','Sergipe'],
    'Centro-Oeste': ['Distrito Federal','Goiás','Mato Grosso do Sul','Mato Grosso'],
    'Sudeste':      ['Espírito Santo','Minas Gerais','Rio de Janeiro','São Paulo'],
    'Sul':          ['Paraná','Rio Grande do Sul','Santa Catarina'],
  }
  // Mapa de sigla → nome completo para quando o usuário selecionar UF individual
  const UF_NOME: Record<string, string> = {
    AC:'Acre',AL:'Alagoas',AP:'Amapá',AM:'Amazonas',BA:'Bahia',CE:'Ceará',
    DF:'Distrito Federal',ES:'Espírito Santo',GO:'Goiás',MA:'Maranhão',
    MT:'Mato Grosso',MS:'Mato Grosso do Sul',MG:'Minas Gerais',PA:'Pará',
    PB:'Paraíba',PR:'Paraná',PE:'Pernambuco',PI:'Piauí',RJ:'Rio de Janeiro',
    RN:'Rio Grande do Norte',RS:'Rio Grande do Sul',RO:'Rondônia',RR:'Roraima',
    SC:'Santa Catarina',SP:'São Paulo',SE:'Sergipe',TO:'Tocantins',
  }

  let ufs: string[] | null = null
  if (REGIAO_ESTADOS[regiao]) {
    ufs = REGIAO_ESTADOS[regiao]
  } else if (regiao.length === 2) {
    const nome = UF_NOME[regiao.toUpperCase()]
    ufs = nome ? [nome] : null
  }

  const anoInicioNum = anoInicio ? parseInt(anoInicio, 10) : null
  const anoFimNum    = anoFim    ? parseInt(anoFim,    10) : null

  // Busca sem filtro de UF na SQL (LIMIT alto para não cortar antes de filtrar)
  const { data, error } = await supabase.rpc('buscar_vencedores_licitacoes', {
    p_termo:      busca || null,
    p_uf:         null,
    p_ano_inicio: anoInicioNum,
    p_ano_fim:    anoFimNum,
    p_limite:     ufs ? 500 : 50,   // busca mais resultados quando vai filtrar depois
  })

  if (error) {
    console.error('[vencedores] rpc error:', error.message, 'ufs:', ufs)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Filtra por região no JS usando o campo `estados` (array de UFs do vencedor)
  type Vencedor = { estados: string[] | null; [k: string]: unknown }
  const todos = (data ?? []) as Vencedor[]
  const filtrados = ufs
    ? todos.filter(v => v.estados?.some(e => ufs!.includes(e)))
    : todos

  return NextResponse.json({ vencedores: filtrados.slice(0, 50) })
}

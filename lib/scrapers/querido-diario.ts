/**
 * Scraper: Querido Diário (Open Knowledge Brasil)
 * API pública — diários oficiais municipais de todo o Brasil
 * https://queridodiario.ok.org.br/api/docs
 *
 * Foco principal: dispensas pequenas (art. 75 Lei 14.133/2021) e
 * inexigibilidades publicadas nos diários municipais/estaduais — que
 * NÃO aparecem no PNCP por serem abaixo do limiar de publicação obrigatória.
 */
import type { LicitacaoRaw } from './types'

const BASE_URL = 'https://queridodiario.ok.org.br/api'

interface QDGazette {
  edition_number: string
  source_text:    string
  territory_name: string
  state_code:     string
  date:           string
  file_url:       string
  url?:           string
  excerpts?:      string[]
}

// Termos específicos para capturar dispensas e inexigibilidades pequenas
const TERMOS_DISPENSA = [
  'dispensa de licitação',
  'dispensa licitação',
  'art. 75',
  'inexigibilidade',
  'contratação direta',
  'dispensável',
]

function extrairObjeto(gazette: QDGazette): string {
  // Usa excerpts se disponível (contexto mais rico)
  const texto = gazette.excerpts?.join(' ') || gazette.source_text || ''

  // Tenta extrair o objeto da contratação
  const matchObjeto = texto.match(/objeto[:\s]+([^.\n]{10,200})/i)
    || texto.match(/contrata(?:ção|r)[:\s]+([^.\n]{10,200})/i)
    || texto.match(/aquisi(?:ção|r)[:\s]+([^.\n]{10,200})/i)
    || texto.match(/servi[çc]os?[:\s]+([^.\n]{10,200})/i)

  if (matchObjeto) return matchObjeto[1].trim().substring(0, 500)

  // Fallback: primeiros 500 chars do texto
  return texto.substring(0, 500).replace(/\s+/g, ' ').trim()
}

function extrairValor(gazette: QDGazette): number | null {
  const texto = gazette.excerpts?.join(' ') || gazette.source_text || ''
  const match = texto.match(/R\$\s*([\d.,]+)/i)
  if (!match) return null
  const valor = parseFloat(match[1].replace(/\./g, '').replace(',', '.'))
  return isNaN(valor) ? null : valor
}

export async function coletarQueridoDiario(termos: string[]): Promise<LicitacaoRaw[]> {
  const resultados: LicitacaoRaw[] = []

  const ontem = new Date()
  ontem.setDate(ontem.getDate() - 2)
  const publishedSince = ontem.toISOString().substring(0, 10)

  // Buscas em paralelo cobrindo todas as modalidades:
  // 1. Cada termo de dispensa individualmente (mais preciso que OR)
  // 2. Licitação/pregão geral
  // 3. Keywords do usuário em grupos de 5 (cobre até 50 termos)
  const buscas: { querystring: string; size: number }[] = []

  // Busca 1: cada termo de dispensa separado para máxima cobertura
  for (const termo of TERMOS_DISPENSA) {
    buscas.push({ querystring: termo, size: 50 })
  }

  // Busca 2: licitação/pregão geral
  buscas.push({ querystring: 'licitação pregão eletrônico edital', size: 50 })

  // Busca 3+: keywords do usuário em grupos de 5
  // O QD API busca gazettes que mencionem QUALQUER dos termos do grupo
  for (let i = 0; i < Math.min(termos.length, 50); i += 5) {
    buscas.push({ querystring: termos.slice(i, i + 5).join(' '), size: 30 })
  }

  await Promise.allSettled(buscas.map(async (busca) => {
    try {
      const url = new URL(`${BASE_URL}/gazettes`)
      url.searchParams.set('querystring',     busca.querystring)
      url.searchParams.set('published_since', publishedSince)
      url.searchParams.set('size',            String(busca.size))
      url.searchParams.set('sort_by',         'descending_date')
      url.searchParams.set('excerpt_size',    '500')
      url.searchParams.set('number_of_excerpts', '3')

      const res = await fetch(url.toString(), {
        signal: AbortSignal.timeout(25000),
        headers: { Accept: 'application/json', 'User-Agent': 'Monitor-Licitacoes/2.0' },
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const json = await res.json()
      const gazettes: QDGazette[] = json.gazettes ?? []

      for (const g of gazettes) {
        if (!g.source_text && !g.excerpts?.length) continue

        const matchEdital = (g.source_text || '').match(/n[°º.\s]*(\d{1,6}[\/-]\d{2,4})/i)
        const id = matchEdital?.[1] ?? `${g.territory_name}-${g.date}-${g.edition_number}`

        resultados.push({
          fonte:         'Querido Diário',
          numero_edital: `QD-${id}`,
          orgao:         g.territory_name,
          objeto:        extrairObjeto(g),
          valor_estimado: extrairValor(g),
          data_abertura: g.date,
          url:           g.file_url ?? g.url ?? 'https://queridodiario.ok.org.br',
          estado:        g.state_code ?? null,
          cidade:        g.territory_name,
        })
      }
    } catch (err) {
      console.error('Querido Diário busca erro:', err instanceof Error ? err.message : err)
    }
  }))

  // Deduplica por numero_edital
  const vistos = new Set<string>()
  return resultados.filter(r => {
    if (vistos.has(r.numero_edital!)) return false
    vistos.add(r.numero_edital!)
    return true
  })
}

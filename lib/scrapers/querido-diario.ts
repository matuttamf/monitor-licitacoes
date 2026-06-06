/**
 * Scraper: Querido Diário (Open Knowledge Brasil)
 * API pública — diários oficiais municipais de todo o Brasil
 * https://queridodiario.ok.org.br/api/docs
 *
 * Correções v2:
 *  - try/catch com retorno [] em falha
 *  - AbortSignal.timeout para não pendurar o cron
 *  - published_since para limitar ao dia anterior
 *  - size reduzido para 20 (mais rápido, dentro do limite da API)
 *  - querystring simplificada para termos de maior cobertura
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
}

export async function coletarQueridoDiario(termos: string[]): Promise<LicitacaoRaw[]> {
  try {
    const ontem = new Date()
    ontem.setDate(ontem.getDate() - 2) // janela de 2 dias para cobrir fim de semana
    const publishedSince = ontem.toISOString().substring(0, 10)

    // Termos fixos de alta relevância + até 3 do usuário
    const querystring = ['licitação', 'pregão eletrônico', 'dispensa', ...termos.slice(0, 3)].join(' ')

    const url = new URL(`${BASE_URL}/gazettes`)
    url.searchParams.set('querystring',    querystring)
    url.searchParams.set('published_since', publishedSince)
    url.searchParams.set('size',           '20')
    url.searchParams.set('sort_by',        'descending_date')

    const res = await fetch(url.toString(), {
      signal: AbortSignal.timeout(25000),
      headers: { Accept: 'application/json', 'User-Agent': 'Monitor-Licitacoes/2.0' },
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const json = await res.json()
    const gazettes: QDGazette[] = json.gazettes ?? []

    return gazettes
      .filter(g => g.source_text && g.territory_name)
      .map(g => {
        const matchEdital = g.source_text.match(/n[°º.\s]*(\d{1,6}[\/-]\d{2,4})/i)
        const id = matchEdital?.[1] ?? `${g.territory_name}-${g.date}-${g.edition_number}`
        return {
          fonte:         'Querido Diário',
          numero_edital: `QD-${id}`,
          orgao:         g.territory_name,
          objeto:        g.source_text.substring(0, 500),
          data_abertura: g.date,
          url:           g.file_url ?? g.url ?? 'https://queridodiario.ok.org.br',
          estado:        g.state_code ?? null,
          cidade:        g.territory_name,
        } satisfies LicitacaoRaw
      })
  } catch (err) {
    console.error('Querido Diário erro:', err instanceof Error ? err.message : err)
    return []
  }
}

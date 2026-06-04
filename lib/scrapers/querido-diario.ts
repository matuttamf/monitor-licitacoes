import { LicitacaoRaw } from './types'

const BASE_URL = 'https://queridodiario.ok.org.br/api'

interface QDExcerto {
  edition_number: string
  source_text: string
  territory_name: string
  state_code: string
  date: string
  file_url: string
}

export async function coletarQueridoDiario(termos: string[]): Promise<LicitacaoRaw[]> {
  const licitacoes: LicitacaoRaw[] = []

  // Buscar por termos de licitação nos diários
  const queryTermos = ['licitação', 'pregão', 'tomada de preços', 'concorrência', ...termos]
    .slice(0, 5) // API limita os termos de busca
    .join(' ')

  const url = `${BASE_URL}/gazettes?querystring=${encodeURIComponent(queryTermos)}&size=50&sort_by=descending_date`

  const res = await fetch(url, { next: { revalidate: 0 } })
  if (!res.ok) return licitacoes

  const json = await res.json()
  const excertos: QDExcerto[] = json.gazettes ?? []

  for (const excerto of excertos) {
    // Extrair número do edital do texto (heurística)
    const matchEdital = excerto.source_text.match(/n[°º\.]?\s*(\d+[\/-]\d+)/i)
    const numero = matchEdital?.[1] ?? `QD-${excerto.edition_number}-${Date.now()}`

    licitacoes.push({
      fonte: 'Querido Diário',
      numero_edital: numero,
      orgao: excerto.territory_name,
      objeto: excerto.source_text.substring(0, 500),
      data_abertura: excerto.date,
      url: excerto.file_url,
      estado: excerto.state_code,
      cidade: excerto.territory_name,
    })
  }

  return licitacoes
}

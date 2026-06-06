import { LicitacaoRaw } from './types'

const BASE_URL = 'https://www.licitanet.com.br'

interface LicitanetItem {
  id?: string | number
  numero?: string
  orgao?: string
  objeto?: string
  valorEstimado?: number
  dataAbertura?: string
  municipio?: string
  uf?: string
  urlEdital?: string
  link?: string
}

export async function coletarLicitanet(dataInicio: string): Promise<LicitacaoRaw[]> {
  const licitacoes: LicitacaoRaw[] = []

  try {
    // Licitanet API pública
    const url = `${BASE_URL}/api/licitacoes/consulta?dataInicio=${dataInicio}&status=aberta&pagina=1&quantidade=50`

    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; MonitorLicitacoes/1.0)',
      },
      next: { revalidate: 0 },
    } as RequestInit)

    if (!res.ok) {
      console.warn(`Licitanet: HTTP ${res.status}`)
      return licitacoes
    }

    const json = await res.json()
    const itens: LicitanetItem[] = json.data ?? json.licitacoes ?? json.resultado ?? json ?? []

    if (!Array.isArray(itens)) return licitacoes

    for (const item of itens) {
      const numero = item.numero ?? String(item.id ?? '')
      const orgao  = item.orgao ?? ''
      const objeto = item.objeto ?? ''
      if (!numero || !objeto) continue

      licitacoes.push({
        fonte:          'Licitanet',
        numero_edital:  `LN-${numero}`,
        orgao,
        objeto,
        valor_estimado: item.valorEstimado,
        data_abertura:  item.dataAbertura?.substring(0, 10),
        url:            item.urlEdital ?? item.link ?? `${BASE_URL}/licitacao/${numero}`,
        estado:         item.uf,
        cidade:         item.municipio,
      })
    }

    console.log(`Licitanet: ${licitacoes.length} licitações coletadas`)
  } catch (err) {
    console.error('Licitanet erro:', err)
  }

  return licitacoes
}

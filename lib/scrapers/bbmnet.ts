import { LicitacaoRaw } from './types'

const BASE_URL = 'https://www.bbmnet.com.br'

interface BbmnetPregao {
  id?: string | number
  numero?: string
  orgao?: string
  entidade?: string
  objeto?: string
  descricao?: string
  valor?: number
  valorEstimado?: number
  dataAbertura?: string
  dataPublicacao?: string
  municipio?: string
  uf?: string
  estado?: string
  link?: string
  url?: string
}

export async function coletarBBMNET(dataInicio: string): Promise<LicitacaoRaw[]> {
  const licitacoes: LicitacaoRaw[] = []

  try {
    // BBMNET API pública de pregões
    const url = `${BASE_URL}/pregoes/v2/pregoes/publicos?dataInicio=${dataInicio}&page=0&size=50`

    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; MonitorLicitacoes/1.0)',
      },
      next: { revalidate: 0 },
    } as RequestInit)

    if (!res.ok) {
      console.warn(`BBMNET: HTTP ${res.status}`)
      return licitacoes
    }

    const json = await res.json()
    // Suporte a diferentes formatos de resposta
    const itens: BbmnetPregao[] = json.content ?? json.data ?? json.pregoes ?? json ?? []

    if (!Array.isArray(itens)) return licitacoes

    for (const item of itens) {
      const numero = item.numero ?? String(item.id ?? '')
      const orgao  = item.orgao ?? item.entidade ?? ''
      const objeto = item.objeto ?? item.descricao ?? ''
      if (!numero || !objeto) continue

      licitacoes.push({
        fonte:          'BBMNET',
        numero_edital:  `BBMNET-${numero}`,
        orgao,
        objeto,
        valor_estimado: item.valorEstimado ?? item.valor,
        data_abertura:  item.dataAbertura?.substring(0, 10),
        url:            item.link ?? item.url ?? `${BASE_URL}/pregoes/${numero}`,
        estado:         item.uf ?? item.estado,
        cidade:         item.municipio,
      })
    }

    console.log(`BBMNET: ${licitacoes.length} licitações coletadas`)
  } catch (err) {
    console.error('BBMNET erro:', err)
  }

  return licitacoes
}

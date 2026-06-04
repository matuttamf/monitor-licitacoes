import { LicitacaoRaw } from './types'

const BASE_URL = 'https://pncp.gov.br/api/pncp/v1'

interface PncpContrato {
  numeroControlePNCP: string
  orgaoEntidade: { razaoSocial: string; ufSigla: string; municipioNome: string }
  objetoCompra: string
  valorTotalEstimado?: number
  dataAberturaProposta?: string
  linkSistemaOrigem: string
}

export async function coletarPNCP(dataInicio: string, dataFim: string): Promise<LicitacaoRaw[]> {
  const licitacoes: LicitacaoRaw[] = []
  let pagina = 1
  const tamanhoPagina = 50

  while (true) {
    const url = `${BASE_URL}/contratacoes/publicacao?dataInicial=${dataInicio}&dataFinal=${dataFim}&pagina=${pagina}&tamanhoPagina=${tamanhoPagina}`

    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 0 },
    })

    if (!res.ok) break

    const json = await res.json()
    const itens: PncpContrato[] = json.data ?? []

    if (itens.length === 0) break

    for (const item of itens) {
      licitacoes.push({
        fonte: 'PNCP',
        numero_edital: item.numeroControlePNCP,
        orgao: item.orgaoEntidade.razaoSocial,
        objeto: item.objetoCompra,
        valor_estimado: item.valorTotalEstimado,
        data_abertura: item.dataAberturaProposta?.substring(0, 10),
        url: item.linkSistemaOrigem || `https://pncp.gov.br/app/editais/${item.numeroControlePNCP}`,
        estado: item.orgaoEntidade.ufSigla,
        cidade: item.orgaoEntidade.municipioNome,
      })
    }

    if (itens.length < tamanhoPagina) break
    pagina++

    // Respeitar rate limit
    await new Promise(r => setTimeout(r, 200))
  }

  return licitacoes
}

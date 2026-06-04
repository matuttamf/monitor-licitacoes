import { LicitacaoRaw } from './types'

const BASE_URL = 'https://compras.dados.gov.br'

interface ComprasNetLicitacao {
  id_licitacao: string
  nome_unidade_compradora: string
  objeto: string
  valor_estimado_total?: number
  data_abertura_proposta?: string
  link_sistema_origem: string
  codigo_uf?: string
}

export async function coletarComprasNet(dataInicio: string): Promise<LicitacaoRaw[]> {
  const licitacoes: LicitacaoRaw[] = []

  const url = `${BASE_URL}/licitacoes/v1/licitacoes.json?data_abertura_proposta=${dataInicio}&_page=1&_pageSize=50`

  const res = await fetch(url, { next: { revalidate: 0 } } as any)
  if (!res.ok) return licitacoes

  const json = await res.json()
  const itens: ComprasNetLicitacao[] = json._embedded?.licitacoes ?? []

  for (const item of itens) {
    licitacoes.push({
      fonte: 'ComprasNet',
      numero_edital: String(item.id_licitacao),
      orgao: item.nome_unidade_compradora,
      objeto: item.objeto,
      valor_estimado: item.valor_estimado_total,
      data_abertura: item.data_abertura_proposta?.substring(0, 10),
      url: item.link_sistema_origem || `${BASE_URL}/licitacoes`,
      estado: item.codigo_uf,
    })
  }

  return licitacoes
}

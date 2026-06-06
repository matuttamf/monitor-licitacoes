import { LicitacaoRaw } from './types'

const BASE_URL = 'https://pncp.gov.br/api/consulta/v1'

// Todas as modalidades do PNCP — cobertura máxima
const MODALIDADES = [
  { codigo: 6, nome: 'Pregão Eletrônico' },
  { codigo: 7, nome: 'Pregão Presencial' },
  { codigo: 4, nome: 'Concorrência Eletrônica' },
  { codigo: 5, nome: 'Concorrência Presencial' },
  { codigo: 8, nome: 'Dispensa de Licitação' },
  { codigo: 9, nome: 'Inexigibilidade' },
  { codigo: 10, nome: 'Credenciamento' },
  { codigo: 12, nome: 'Diálogo Competitivo' },
  { codigo: 1, nome: 'Convite' },
  { codigo: 2, nome: 'Tomada de Preços' },
  { codigo: 3, nome: 'Concurso' },
  { codigo: 11, nome: 'Leilão - Eletrônico' },
]

interface PncpItem {
  numeroControlePNCP?: string
  numeroCompra?: string
  anoCompra?: number
  sequencialCompra?: number
  orgaoEntidade: { cnpj?: string; razaoSocial: string }
  unidadeOrgao?: { ufSigla: string; municipioNome: string; nomeUnidade?: string }
  objetoCompra: string
  valorTotalEstimado?: number
  dataAberturaProposta?: string
  dataEncerramentoProposta?: string
  linkSistemaOrigem?: string
  linkProcessoEletronico?: string
}

// Converter de yyyy-MM-dd para yyyyMMdd (novo formato exigido pela API)
function formatarData(data: string): string {
  return data.replace(/-/g, '')
}

async function coletarModalidade(
  dataInicio: string,
  dataFim: string,
  codigoModalidade: number
): Promise<LicitacaoRaw[]> {
  const licitacoes: LicitacaoRaw[] = []
  let pagina = 1
  const tamanhoPagina = 50 // mínimo 10, usar 50

  while (true) {
    const url = `${BASE_URL}/contratacoes/publicacao?dataInicial=${formatarData(dataInicio)}&dataFinal=${formatarData(dataFim)}&pagina=${pagina}&tamanhoPagina=${tamanhoPagina}&codigoModalidadeContratacao=${codigoModalidade}`

    try {
      const res = await fetch(url, {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 0 },
      })

      if (!res.ok) {
        console.warn(`PNCP modalidade ${codigoModalidade} página ${pagina}: HTTP ${res.status}`)
        break
      }

      const json = await res.json()
      const itens: PncpItem[] = json.data ?? []

      if (itens.length === 0) break

      for (const item of itens) {
        const orgao = item.unidadeOrgao?.nomeUnidade || item.orgaoEntidade.razaoSocial
        const estado = item.unidadeOrgao?.ufSigla
        const cidade = item.unidadeOrgao?.municipioNome
        // URL do edital no PNCP: formato correto é /app/editais/{cnpj}/{ano}/{sequencial}
        const cnpj = item.orgaoEntidade.cnpj ?? ''
        const ano = item.anoCompra ?? new Date().getFullYear()
        const seq = String(item.sequencialCompra ?? 0).padStart(6, '0')
        const urlPncp = cnpj
          ? `https://pncp.gov.br/app/editais/${cnpj}/${ano}/${seq}`
          : `https://pncp.gov.br/app/editais`

        const url_edital = item.linkSistemaOrigem
          || item.linkProcessoEletronico
          || urlPncp

        licitacoes.push({
          fonte: 'PNCP',
          numero_edital: item.numeroControlePNCP
            || `${item.anoCompra}-${item.orgaoEntidade.cnpj ?? ''}-${item.sequencialCompra}`,
          orgao,
          objeto: item.objetoCompra,
          valor_estimado: item.valorTotalEstimado,
          data_abertura: item.dataEncerramentoProposta?.substring(0, 10)
            || item.dataAberturaProposta?.substring(0, 10),
          url: url_edital,
          estado,
          cidade,
        })
      }

      const totalPaginas = json.totalPaginas ?? 1
      if (pagina >= totalPaginas || itens.length < tamanhoPagina) break
      pagina++

      // Respeitar rate limit
      await new Promise(r => setTimeout(r, 300))
    } catch (err) {
      console.error(`PNCP modalidade ${codigoModalidade} erro:`, err)
      break
    }
  }

  return licitacoes
}

export async function coletarPNCP(dataInicio: string, dataFim: string): Promise<LicitacaoRaw[]> {
  console.log(`Coletando PNCP de ${dataInicio} a ${dataFim} (${MODALIDADES.length} modalidades)`)

  // Coletar todas as modalidades em paralelo
  const resultados = await Promise.allSettled(
    MODALIDADES.map(m => coletarModalidade(dataInicio, dataFim, m.codigo))
  )

  const todas: LicitacaoRaw[] = []
  const vistos = new Set<string>()

  for (const resultado of resultados) {
    if (resultado.status === 'fulfilled') {
      for (const licitacao of resultado.value) {
        const chave = licitacao.numero_edital ?? licitacao.external_id ?? ''
        if (!vistos.has(chave)) {
          vistos.add(chave)
          todas.push(licitacao)
        }
      }
    }
  }

  console.log(`PNCP: ${todas.length} licitações coletadas`)
  return todas
}

/**
 * PNCP — Licitações com abertura FUTURA (endpoint /proposta).
 *
 * Diferença crítica do scraper principal (pncp.ts):
 *   - pncp.ts usa /publicacao → filtra por DATA DE PUBLICAÇÃO no PNCP
 *   - este usa /proposta     → filtra por DATA DE ABERTURA DA PROPOSTA
 *
 * Resultado: captura TODAS as licitações ainda abertas, independente
 * de quando foram publicadas — incluindo editais publicados há meses
 * com prazo de abertura no futuro.
 */
import type { LicitacaoRaw } from './types'

const BASE_URL = 'https://pncp.gov.br/api/consulta/v1'

const MODALIDADES = [
  { codigo: 6,  nome: 'Pregão Eletrônico' },
  { codigo: 7,  nome: 'Pregão Presencial' },
  { codigo: 4,  nome: 'Concorrência Eletrônica' },
  { codigo: 5,  nome: 'Concorrência Presencial' },
  { codigo: 8,  nome: 'Dispensa' },
  { codigo: 9,  nome: 'Inexigibilidade' },
  { codigo: 10, nome: 'Credenciamento' },
  { codigo: 12, nome: 'Diálogo Competitivo' },
  { codigo: 1,  nome: 'Convite' },
  { codigo: 2,  nome: 'Tomada de Preços' },
  { codigo: 3,  nome: 'Concurso' },
  { codigo: 11, nome: 'Leilão Eletrônico' },
]

interface PncpItem {
  numeroControlePNCP?: string
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

function fmt(data: string): string {
  return data.replace(/-/g, '')
}

async function coletarModalidadeAberta(
  dataInicio: string,
  dataFim: string,
  codigoModalidade: number,
  maxPaginas: number,
  deadline: number, // timestamp em ms — para de paginar se ultrapassar
): Promise<LicitacaoRaw[]> {
  const licitacoes: LicitacaoRaw[] = []
  let pagina = 1

  while (pagina <= maxPaginas) {
    // Para antes de estourar o maxDuration da Vercel
    if (Date.now() > deadline) {
      console.warn(`PNCP-abertos modal=${codigoModalidade}: deadline atingido na pág ${pagina}, salvando parcial`)
      break
    }

    const url = `${BASE_URL}/contratacoes/proposta?dataInicial=${fmt(dataInicio)}&dataFinal=${fmt(dataFim)}&pagina=${pagina}&tamanhoPagina=50&codigoModalidadeContratacao=${codigoModalidade}`

    try {
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(15000),
      })

      if (res.status === 404 || res.status === 400) break
      if (!res.ok) { console.warn(`PNCP-abertos modal=${codigoModalidade} p=${pagina}: HTTP ${res.status}`); break }

      const json = await res.json()
      const itens: PncpItem[] = json.data ?? []
      if (itens.length === 0) break

      for (const item of itens) {
        const orgao  = item.unidadeOrgao?.nomeUnidade || item.orgaoEntidade.razaoSocial
        const cnpj   = item.orgaoEntidade.cnpj ?? ''
        const ano    = item.anoCompra ?? new Date().getFullYear()
        const seq    = String(item.sequencialCompra ?? 0).padStart(6, '0')
        const urlPncp = cnpj
          ? `https://pncp.gov.br/app/editais/${cnpj}/${ano}/${seq}`
          : 'https://pncp.gov.br/app/editais'

        licitacoes.push({
          fonte:          'PNCP',
          numero_edital:  item.numeroControlePNCP || `${ano}-${cnpj}-${seq}`,
          orgao,
          objeto:         item.objetoCompra,
          valor_estimado: item.valorTotalEstimado,
          data_abertura:  item.dataEncerramentoProposta?.substring(0, 10)
                        || item.dataAberturaProposta?.substring(0, 10),
          url:            item.linkSistemaOrigem || item.linkProcessoEletronico || urlPncp,
          estado:         item.unidadeOrgao?.ufSigla,
          cidade:         item.unidadeOrgao?.municipioNome,
        })
      }

      const totalPaginas = json.totalPaginas ?? 1
      if (pagina >= totalPaginas || itens.length < 50) break
      pagina++

      await new Promise(r => setTimeout(r, 200))
    } catch (err) {
      console.error(`PNCP-abertos modal=${codigoModalidade} p=${pagina} erro:`, err instanceof Error ? err.message : err)
      break
    }
  }

  return licitacoes
}

/**
 * Coleta licitações desertas (código 6) e fracassadas (código 7) dos últimos 30 dias.
 * Estas representam oportunidades imediatas: o órgão precisa do produto/serviço
 * mas não recebeu proposta válida — a nova chamada costuma ter prazo mais curto.
 */
export async function coletarPNCPDesertas(budgetSeg = 60): Promise<LicitacaoRaw[]> {
  const hoje = new Date()
  const trinta = new Date(hoje)
  trinta.setDate(trinta.getDate() - 30)

  const dataInicio  = trinta.toISOString().substring(0, 10)
  const dataFim     = hoje.toISOString().substring(0, 10)
  const deadline    = Date.now() + budgetSeg * 1000
  const resultados: LicitacaoRaw[] = []

  for (const codigoSituacao of [6, 7]) {
    const label = codigoSituacao === 6 ? 'deserta' : 'fracassada'
    let pagina = 1

    while (pagina <= 10) {
      if (Date.now() > deadline) break

      const url = `${BASE_URL}/contratacoes/publicacao?dataInicial=${fmt(dataInicio)}&dataFinal=${fmt(dataFim)}&codigoSituacaoEdital=${codigoSituacao}&pagina=${pagina}&tamanhoPagina=50`

      try {
        const res = await fetch(url, {
          headers: { Accept: 'application/json' },
          signal:  AbortSignal.timeout(12000),
        })

        if (res.status === 404 || res.status === 400) break
        if (!res.ok) break

        const json = await res.json()
        const itens: PncpItem[] = json.data ?? []
        if (!itens.length) break

        for (const item of itens) {
          const orgao = item.unidadeOrgao?.nomeUnidade || item.orgaoEntidade.razaoSocial
          const cnpj  = item.orgaoEntidade.cnpj ?? ''
          const ano   = item.anoCompra ?? new Date().getFullYear()
          const seq   = String(item.sequencialCompra ?? 0).padStart(6, '0')
          const urlPncp = cnpj
            ? `https://pncp.gov.br/app/editais/${cnpj}/${ano}/${seq}`
            : 'https://pncp.gov.br/app/editais'

          resultados.push({
            fonte:          'PNCP',
            numero_edital:  item.numeroControlePNCP || `${ano}-${cnpj}-${seq}`,
            orgao,
            objeto:         `[${label.toUpperCase()}] ${item.objetoCompra}`,
            valor_estimado: item.valorTotalEstimado,
            data_abertura:  item.dataEncerramentoProposta?.substring(0, 10) || item.dataAberturaProposta?.substring(0, 10),
            url:            item.linkSistemaOrigem || item.linkProcessoEletronico || urlPncp,
            estado:         item.unidadeOrgao?.ufSigla,
            cidade:         item.unidadeOrgao?.municipioNome,
          })
        }

        const total = json.totalPaginas ?? 1
        if (pagina >= total || itens.length < 50) break
        pagina++
        await new Promise(r => setTimeout(r, 200))
      } catch (err) {
        console.error(`PNCP-desertas sit=${codigoSituacao} p=${pagina}:`, err instanceof Error ? err.message : err)
        break
      }
    }

    console.log(`PNCP-desertas ${label}: ${resultados.filter(r => r.objeto?.startsWith(`[${label.toUpperCase()}]`)).length} encontradas`)
  }

  return resultados
}

/**
 * Coleta todas as licitações com abertura de proposta entre hoje e +horizonte dias.
 * @param horizonte    Dias à frente (padrão 180 — cobre editais de longo prazo).
 * @param maxPaginas   Páginas por modalidade (padrão 100 = 5.000/modalidade = 60.000 total).
 * @param budgetSeg    Orçamento de tempo em segundos (padrão 240 — deixa 60s para salvar).
 */
export async function coletarPNCPAbertos(
  horizonte = 180,
  maxPaginas = 100,
  budgetSeg = 240,
): Promise<LicitacaoRaw[]> {
  const hoje = new Date()
  const fim  = new Date(hoje)
  fim.setDate(fim.getDate() + horizonte)

  const dataInicio = hoje.toISOString().substring(0, 10)
  const dataFim    = fim.toISOString().substring(0, 10)
  // deadline só como proteção extrema — 260s deixa 40s para salvar os lotes
  const deadline   = Date.now() + budgetSeg * 1000

  console.log(`PNCP-abertos: buscando abertura entre ${dataInicio} e ${dataFim} (horizon=${horizonte}d, maxPag=${maxPaginas}, budget=${budgetSeg}s, deadline=${new Date(deadline).toISOString()})`)

  const resultados = await Promise.allSettled(
    MODALIDADES.map(m => coletarModalidadeAberta(dataInicio, dataFim, m.codigo, maxPaginas, deadline))
  )

  const todas: LicitacaoRaw[] = []
  const vistos = new Set<string>()

  for (const r of resultados) {
    if (r.status !== 'fulfilled') continue
    for (const lic of r.value) {
      const chave = lic.numero_edital ?? lic.external_id ?? ''
      if (!vistos.has(chave)) { vistos.add(chave); todas.push(lic) }
    }
  }

  console.log(`PNCP-abertos: ${todas.length} licitações com abertura futura`)
  return todas
}

/**
 * Scraper: PNCP — Plano de Contratações Anual (PCA)
 * Endpoint: /v1/pca
 * O PCA é publicado anualmente pelos órgãos e indica TODAS as contratações
 * previstas para o ano — é a maior fonte de oportunidades futuras.
 * Este scraper busca PCAs do ano corrente e do próximo.
 */
import type { LicitacaoRaw } from './types'

const BASE = 'https://pncp.gov.br/api/consulta/v1'

interface PncpPCA {
  id?: string
  numeroControlePNCP?: string
  orgaoEntidade?: { razaoSocial?: string; cnpj?: string }
  unidadeOrgao?: { ufSigla?: string; municipioNome?: string; nomeUnidade?: string }
  descricaoObjeto?: string
  valorTotal?: number
  ano?: number
  linkSistemaOrigem?: string
  dataPublicacaoPncp?: string
}

async function coletarPCAano(ano: number): Promise<LicitacaoRaw[]> {
  const licitacoes: LicitacaoRaw[] = []
  let pagina = 1

  while (pagina <= 3) {
    try {
      // Busca PCAs publicados recentemente para o ano
      const url = `${BASE}/pca?ano=${ano}&pagina=${pagina}&tamanhoPagina=50`
      const res = await fetch(url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(20000) })
      if (!res.ok) break

      const json = await res.json()
      const itens: PncpPCA[] = json.data ?? []
      if (!itens.length) break

      for (const item of itens) {
        const orgao = item.unidadeOrgao?.nomeUnidade ?? item.orgaoEntidade?.razaoSocial ?? ''
        const id = item.numeroControlePNCP ?? item.id ?? String(Math.random())
        licitacoes.push({
          external_id:    `pncp-pca-${id}`,
          titulo:         `[PCA ${ano}] ${(item.descricaoObjeto ?? orgao).slice(0, 200)}`,
          objeto:         item.descricaoObjeto ?? `Plano Anual de Contratações ${ano} — ${orgao}`,
          orgao,
          valor_estimado: item.valorTotal ?? undefined,
          // PCA é planejamento — sem data de abertura
          estado:         item.unidadeOrgao?.ufSigla,
          municipio:      item.unidadeOrgao?.municipioNome,
          fonte:          'PNCP PCA',
          url:            item.linkSistemaOrigem ?? `https://pncp.gov.br/app/pca`,
        })
      }

      if (itens.length < 50) break
      pagina++
      await new Promise(r => setTimeout(r, 200))
    } catch (err) {
      console.error(`PNCP PCA ${ano} página ${pagina}:`, err instanceof Error ? err.message : err)
      break
    }
  }

  return licitacoes
}

export async function coletarPNCPPCA(): Promise<LicitacaoRaw[]> {
  const anoAtual = new Date().getFullYear()

  const [pcaAtual, pcaProximo] = await Promise.allSettled([
    coletarPCAano(anoAtual),
    coletarPCAano(anoAtual + 1),
  ])

  const result: LicitacaoRaw[] = []
  if (pcaAtual.status === 'fulfilled') result.push(...pcaAtual.value)
  if (pcaProximo.status === 'fulfilled') result.push(...pcaProximo.value)

  console.log(`PNCP PCA: ${result.length} planos coletados`)
  return result
}

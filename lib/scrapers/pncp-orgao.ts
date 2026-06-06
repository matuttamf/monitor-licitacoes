/**
 * Utilitário: PNCP filtrado por CNPJ de órgão específico
 *
 * A API PNCP já é confirmada saudável (pncp_ok: true).
 * Filtrando pelo CNPJ de cada autarquia/ministério obtemos apenas
 * as licitações daquele órgão — sem depender de portal próprio.
 *
 * Uso:
 *   export const coletarINSS = criarScraperPNCPOrgao('29979036000140', 'INSS', 'INSS')
 */
import type { LicitacaoRaw } from './types'

export function criarScraperPNCPOrgao(cnpj: string, orgaoNome: string, fonte: string) {
  const cnpjLimpo = cnpj.replace(/\D/g, '')
  const prefixo   = fonte.toLowerCase().replace(/[^a-z0-9]/g, '-')

  return async function (dataInicio: string, dataFim: string): Promise<LicitacaoRaw[]> {
    try {
      const url = `https://pncp.gov.br/api/consulta/v1/contratacoes/publicacao?dataInicial=${dataInicio}&dataFinal=${dataFim}&cnpj=${cnpjLimpo}&pagina=1&tamanhoPagina=50`
      const res = await fetch(url, {
        headers: { Accept: 'application/json', 'User-Agent': 'Monitor-Licitacoes/2.0' },
        signal: AbortSignal.timeout(25000),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      const items: unknown[] = json?.data ?? json?.content ?? []

      return items.map((item: unknown) => {
        const i = item as Record<string, unknown>
        const id = String(i.numeroControlePNCP ?? i.sequencialCompra ?? Math.random())
        return {
          external_id:    `${prefixo}-${id}`,
          objeto:         String(i.objetoCompra ?? i.descricao ?? ''),
          orgao:          orgaoNome,
          valor_estimado: typeof i.valorTotalEstimado === 'number' ? i.valorTotalEstimado : undefined,
          data_abertura:  String(i.dataAberturaProposta ?? i.dataPublicacaoPncp ?? '').substring(0, 10) || dataInicio,
          estado:         null,
          fonte,
          url: String(i.linkSistemaOrigem ?? `https://pncp.gov.br/app/editais/${id}`),
        } satisfies LicitacaoRaw
      }).filter(l => l.objeto.length > 10)
    } catch (err) {
      console.error(`${fonte} erro:`, err instanceof Error ? err.message : err)
      return []
    }
  }
}

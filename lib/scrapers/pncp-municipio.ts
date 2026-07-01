/**
 * Utilitário: PNCP filtrado por município (código IBGE)
 *
 * Desde 2023 o PNCP é obrigatório para contratações acima do limite
 * para TODOS os municípios brasileiros. Filtrar pelo código IBGE
 * retorna apenas as licitações daquele município — garantidamente saudável.
 *
 * Uso:
 *   export const coletarSaoGoncalo = criarScraperPNCPMunicipio(3304904, 'RJ', 'São Gonçalo', 'São Gonçalo RJ')
 */
import type { LicitacaoRaw } from './types'

export function criarScraperPNCPMunicipio(
  codigoIBGE: number,
  uf: string,
  municipioNome: string,
  fonte: string,
) {
  const prefixo = fonte.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')

  return async function (dataInicio: string, dataFim: string): Promise<LicitacaoRaw[]> {
    try {
      const di = dataInicio.replace(/-/g, '')
      const df = dataFim.replace(/-/g, '')
      const url =
        `https://pncp.gov.br/api/consulta/v1/contratacoes/publicacao` +
        `?dataInicial=${di}&dataFinal=${df}` +
        `&codigoMunicipio=${codigoIBGE}&uf=${uf}` +
        `&pagina=1&tamanhoPagina=50`

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
          orgao:          String(i.nomeUnidade ?? i.orgaoEntidade ?? `Prefeitura de ${municipioNome}`),
          valor_estimado: typeof i.valorTotalEstimado === 'number' ? i.valorTotalEstimado : undefined,
          data_abertura:  String(i.dataAberturaProposta ?? i.dataPublicacaoPncp ?? '').substring(0, 10) || dataInicio,
          estado:         uf,
          municipio:      municipioNome,
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

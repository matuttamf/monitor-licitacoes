/**
 * Scraper: FNS — Fundo Nacional de Saúde / Ministério da Saúde
 * Compra de medicamentos, equipamentos hospitalares, vacinas e insumos para o SUS
 * PNCP — filtra pelo CNPJ do MS: 00.394.544/0001-43
 */
import type { LicitacaoRaw } from './types'

const CNPJ_MS = '00394544000143'

export async function coletarFNS(dataInicio: string, dataFim: string): Promise<LicitacaoRaw[]> {
  try {
    const url = `https://pncp.gov.br/api/consulta/v1/contratacoes/publicacao?dataInicial=${dataInicio.replace(/-/g,'')}&dataFinal=${dataFim.replace(/-/g,'')}&cnpj=${CNPJ_MS}&pagina=1&tamanhoPagina=50`
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
        external_id:    `fns-${id}`,
        objeto:         String(i.objetoCompra ?? i.descricao ?? ''),
        orgao:          'FNS — Fundo Nacional de Saúde / Ministério da Saúde',
        valor_estimado: typeof i.valorTotalEstimado === 'number' ? i.valorTotalEstimado : undefined,
        data_abertura:  String(i.dataAberturaProposta ?? i.dataPublicacaoPncp ?? '').substring(0, 10) || dataInicio,
        estado:         null,
        fonte:          'FNS / Ministério da Saúde',
        url:            String(i.linkSistemaOrigem ?? `https://pncp.gov.br/app/editais/${id}`),
      } satisfies LicitacaoRaw
    }).filter(l => l.objeto.length > 10)
  } catch (err) {
    console.error('FNS erro:', err instanceof Error ? err.message : err)
    return []
  }
}

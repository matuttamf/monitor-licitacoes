/**
 * Scraper: DNIT — Departamento Nacional de Infraestrutura de Transportes
 * Maior comprador de obras rodoviárias, sinalização, manutenção e serviços de engenharia do Brasil
 * PNCP — CNPJ DNIT: 04.892.707/0001-00
 */
import type { LicitacaoRaw } from './types'

const CNPJ_DNIT = '04892707000100'

export async function coletarDNIT(dataInicio: string, dataFim: string): Promise<LicitacaoRaw[]> {
  try {
    const url = `https://pncp.gov.br/api/consulta/v1/contratacoes/publicacao?dataInicial=${dataInicio}&dataFinal=${dataFim}&cnpj=${CNPJ_DNIT}&pagina=1&tamanhoPagina=50`
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
        external_id:    `dnit-${id}`,
        objeto:         String(i.objetoCompra ?? i.descricao ?? ''),
        orgao:          'DNIT — Departamento Nacional de Infraestrutura de Transportes',
        valor_estimado: typeof i.valorTotalEstimado === 'number' ? i.valorTotalEstimado : undefined,
        data_abertura:  String(i.dataAberturaProposta ?? i.dataPublicacaoPncp ?? '').substring(0, 10) || dataInicio,
        estado:         null,
        fonte:          'DNIT',
        url:            String(i.linkSistemaOrigem ?? `https://pncp.gov.br/app/editais/${id}`),
      } satisfies LicitacaoRaw
    }).filter(l => l.objeto.length > 10)
  } catch (err) {
    console.error('DNIT erro:', err instanceof Error ? err.message : err)
    return []
  }
}

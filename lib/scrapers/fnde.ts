/**
 * Scraper: FNDE — Fundo Nacional de Desenvolvimento da Educação
 * Maior comprador de material escolar, merenda, ônibus e tecnologia educacional do Brasil
 * PNCP CNPJ do FNDE: 00.378.257/0001-81 → filtra via API PNCP por órgão
 */
import type { LicitacaoRaw } from './types'

const CNPJ_FNDE = '00378257000181'

export async function coletarFNDE(dataInicio: string, dataFim: string): Promise<LicitacaoRaw[]> {
  try {
    const url = `https://pncp.gov.br/api/consulta/v1/contratacoes/publicacao?dataInicial=${dataInicio}&dataFinal=${dataFim}&cnpj=${CNPJ_FNDE}&pagina=1&tamanhoPagina=50`
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
        external_id:    `fnde-${id}`,
        objeto:         String(i.objetoCompra ?? i.descricao ?? ''),
        orgao:          'FNDE — Fundo Nacional de Desenvolvimento da Educação',
        valor_estimado: typeof i.valorTotalEstimado === 'number' ? i.valorTotalEstimado : undefined,
        data_abertura:  String(i.dataAberturaProposta ?? i.dataPublicacaoPncp ?? '').substring(0, 10) || dataInicio,
        estado:         null,
        fonte:          'FNDE',
        url:            String(i.linkSistemaOrigem ?? `https://pncp.gov.br/app/editais/${id}`),
      } satisfies LicitacaoRaw
    }).filter(l => l.objeto.length > 10)
  } catch (err) {
    console.error('FNDE erro:', err instanceof Error ? err.message : err)
    return []
  }
}

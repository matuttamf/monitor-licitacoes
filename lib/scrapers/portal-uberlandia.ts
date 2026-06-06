/**
 * Scraper: Portal de Compras — Prefeitura de Uberlândia (MG — 700k hab)
 * https://licitacoes.uberlandia.mg.gov.br
 */
import type { LicitacaoRaw } from './types'

export async function coletarPortalUberlandia(dataInicio: string): Promise<LicitacaoRaw[]> {
  try {
    const res = await fetch(
      `https://licitacoes.uberlandia.mg.gov.br/api/licitacoes?dataInicio=${dataInicio}&dataFim=${dataInicio}&situacao=ABERTA&pagina=1&quantidade=100`,
      { headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(20000) }
    )
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    const items: unknown[] = json?.licitacoes ?? json?.data ?? json?.content ?? (Array.isArray(json) ? json : [])
    return items.map((item: unknown) => {
      const i = item as Record<string, unknown>
      const id = String(i.id ?? i.numeroProcesso ?? Math.random())
      return {
        external_id: `uberlandia-${id}`,
        objeto: String(i.objeto ?? i.descricao ?? ''),
        orgao: String(i.nomeOrgao ?? i.orgao ?? 'Prefeitura de Uberlândia'),
        valor_estimado: parseFloat(String(i.valorEstimado ?? 0)) || undefined,
        data_abertura: String(i.dataAbertura ?? '').split('T')[0] || dataInicio,
        estado: 'MG', municipio: 'Uberlândia',
        fonte: 'Portal Uberlândia',
        url: String(i.url ?? `https://licitacoes.uberlandia.mg.gov.br/licitacoes/${id}`),
      } satisfies LicitacaoRaw
    }).filter(l => l.objeto.length > 10)
  } catch (err) { console.error('Portal Uberlândia erro:', err instanceof Error ? err.message : err); return [] }
}

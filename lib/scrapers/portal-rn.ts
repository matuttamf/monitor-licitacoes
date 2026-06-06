/**
 * Scraper: Portal de Compras — Rio Grande do Norte
 * https://www.transparencia.rn.gov.br / Sistema de Compras RN
 */
import type { LicitacaoRaw } from './types'

export async function coletarPortalRN(dataInicio: string): Promise<LicitacaoRaw[]> {
  try {
    const res = await fetch(
      `https://www.transparencia.rn.gov.br/api/licitacoes?dataInicio=${dataInicio}&dataFim=${dataInicio}&pagina=1&quantidade=100`,
      { headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(20000) }
    )
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    const items: unknown[] = json?.licitacoes ?? json?.data ?? json?.content ?? (Array.isArray(json) ? json : [])
    return items.map((item: unknown) => {
      const i = item as Record<string, unknown>
      const id = String(i.id ?? i.numeroProcesso ?? Math.random())
      return {
        external_id:    `rn-${id}`,
        titulo:         String(i.objeto ?? i.descricao ?? '').slice(0, 500),
        objeto:         String(i.objeto ?? i.descricao ?? ''),
        orgao:          String(i.nomeOrgao ?? i.orgao ?? 'Governo do Rio Grande do Norte'),
        valor_estimado: parseFloat(String(i.valorEstimado ?? 0)) || null,
        data_abertura:  String(i.dataAbertura ?? '').split('T')[0] || dataInicio,
        estado: 'RN', municipio: null,
        fonte: 'Portal RN',
        url: String(i.url ?? i.link ?? `https://www.transparencia.rn.gov.br/licitacoes/${id}`),
      }
    }).filter(l => l.objeto.length > 10)
  } catch (err) { console.error('Portal RN erro:', err instanceof Error ? err.message : err); return [] }
}

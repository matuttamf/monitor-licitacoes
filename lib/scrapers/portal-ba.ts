/**
 * Scraper: Portal de Compras BA (Bahia)
 * https://www.transparencia.ba.gov.br / SIGA-BA
 */
import type { LicitacaoRaw } from './types'

export async function coletarPortalBA(dataInicio: string): Promise<LicitacaoRaw[]> {
  try {
    const url = `https://www.transparencia.ba.gov.br/api/licitacoes?dataInicio=${dataInicio}&dataFim=${dataInicio}&situacao=aberta&pagina=1&quantidade=100`
    const res = await fetch(url, { headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(20000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    const items: unknown[] = json?.licitacoes ?? json?.data ?? json?.resultado ?? (Array.isArray(json) ? json : [])
    return items.map((item: unknown) => {
      const i = item as Record<string, unknown>
      return {
        external_id:    `ba-${i.id ?? i.numeroProcesso ?? Math.random()}`,
        titulo:         String(i.objeto ?? i.descricao ?? '').slice(0, 500),
        objeto:         String(i.objeto ?? i.descricao ?? ''),
        orgao:          String(i.nomeOrgao ?? i.orgao ?? ''),
        valor_estimado: parseFloat(String(i.valorEstimado ?? 0)) || null,
        data_abertura:  String(i.dataAbertura ?? '').split('T')[0] || null,
        estado:         'BA', municipio: String(i.municipio ?? '') || null,
        fonte:          'Portal BA',
        url:            `https://www.transparencia.ba.gov.br/licitacoes/${i.id ?? ''}`,
      }
    }).filter(l => l.objeto.length > 10)
  } catch (err) { console.error('Portal BA erro:', err instanceof Error ? err.message : err); return [] }
}

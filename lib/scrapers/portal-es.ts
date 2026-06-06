/** Scraper: Portal de Compras ES (Espírito Santo) — https://compras.es.gov.br */
import type { LicitacaoRaw } from './types'

export async function coletarPortalES(dataInicio: string): Promise<LicitacaoRaw[]> {
  try {
    const res = await fetch(
      `https://compras.es.gov.br/api/licitacoes?dataInicio=${dataInicio}&dataFim=${dataInicio}&situacao=ABERTA&pagina=1&quantidade=100`,
      { headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(20000) }
    )
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    const items: unknown[] = json?.licitacoes ?? json?.data ?? json?.content ?? (Array.isArray(json) ? json : [])
    return items.map((item: unknown) => {
      const i = item as Record<string, unknown>
      return {
        external_id:    `es-${i.id ?? i.numeroProcesso ?? Math.random()}`,
        titulo:         String(i.objeto ?? i.descricao ?? '').slice(0, 500),
        objeto:         String(i.objeto ?? i.descricao ?? ''),
        orgao:          String(i.nomeOrgao ?? i.orgao ?? ''),
        valor_estimado: parseFloat(String(i.valorEstimado ?? 0)) || null,
        data_abertura:  String(i.dataAbertura ?? '').split('T')[0] || null,
        estado: 'ES', municipio: String(i.municipio ?? '') || null,
        fonte: 'Portal ES',
        url: `https://compras.es.gov.br/licitacoes/${i.id ?? ''}`,
      }
    }).filter(l => l.objeto.length > 10)
  } catch (err) { console.error('Portal ES erro:', err instanceof Error ? err.message : err); return [] }
}

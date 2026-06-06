/** Scraper: Portal de Compras SC (Santa Catarina) */
import type { LicitacaoRaw } from './types'

export async function coletarPortalSC(dataInicio: string): Promise<LicitacaoRaw[]> {
  try {
    const res = await fetch(
      `https://www.portaldecompras.sc.gov.br/api/v1/licitacoes?dataInicio=${dataInicio}&dataFim=${dataInicio}&situacao=aberta&page=1&size=100`,
      { headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(20000) }
    )
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    const items: unknown[] = json?.content ?? json?.licitacoes ?? json?.data ?? (Array.isArray(json) ? json : [])
    return items.map((item: unknown) => {
      const i = item as Record<string, unknown>
      return {
        external_id:    `sc-${i.id ?? i.numeroProcesso ?? Math.random()}`,
        titulo:         String(i.objeto ?? i.descricaoObjeto ?? '').slice(0, 500),
        objeto:         String(i.objeto ?? i.descricaoObjeto ?? ''),
        orgao:          String(i.nomeOrgao ?? i.orgao ?? ''),
        valor_estimado: parseFloat(String(i.valorEstimado ?? 0)) || null,
        data_abertura:  String(i.dataAbertura ?? '').split('T')[0] || null,
        estado: 'SC', municipio: String(i.municipio ?? '') || null,
        fonte: 'Portal SC',
        url: `https://www.portaldecompras.sc.gov.br/licitacoes/${i.id ?? ''}`,
      }
    }).filter(l => l.objeto.length > 10)
  } catch (err) { console.error('Portal SC erro:', err instanceof Error ? err.message : err); return [] }
}

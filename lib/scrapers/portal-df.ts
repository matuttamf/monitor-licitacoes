/** Scraper: Portal de Compras DF (Distrito Federal) — https://www.compras.df.gov.br */
import type { LicitacaoRaw } from './types'

export async function coletarPortalDF(dataInicio: string): Promise<LicitacaoRaw[]> {
  try {
    const res = await fetch(
      `https://www.compras.df.gov.br/api/licitacoes?dataInicio=${dataInicio}&dataFim=${dataInicio}&situacao=ABERTA&pagina=1&quantidade=100`,
      { headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(20000) }
    )
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    const items: unknown[] = json?.licitacoes ?? json?.data ?? json?.resultado ?? (Array.isArray(json) ? json : [])
    return items.map((item: unknown) => {
      const i = item as Record<string, unknown>
      return {
        external_id:    `df-${i.id ?? i.numeroProcesso ?? Math.random()}`,
        titulo:         String(i.objeto ?? i.descricao ?? '').slice(0, 500),
        objeto:         String(i.objeto ?? i.descricao ?? ''),
        orgao:          String(i.nomeOrgao ?? i.orgao ?? ''),
        valor_estimado: parseFloat(String(i.valorEstimado ?? 0)) || null,
        data_abertura:  String(i.dataAbertura ?? '').split('T')[0] || null,
        estado: 'DF', municipio: 'Brasília',
        fonte: 'Portal DF',
        url: `https://www.compras.df.gov.br/licitacoes/${i.id ?? ''}`,
      }
    }).filter(l => l.objeto.length > 10)
  } catch (err) { console.error('Portal DF erro:', err instanceof Error ? err.message : err); return [] }
}

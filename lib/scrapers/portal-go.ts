/** Scraper: Compras GO (Goiás) — https://www.compras.go.gov.br */
import type { LicitacaoRaw } from './types'

export async function coletarPortalGO(dataInicio: string): Promise<LicitacaoRaw[]> {
  try {
    const res = await fetch(
      `https://www.compras.go.gov.br/api/licitacoes?dataInicio=${dataInicio}&dataFim=${dataInicio}&situacao=ABERTA&page=0&size=100`,
      { headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(20000) }
    )
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    const items: unknown[] = json?.content ?? json?.licitacoes ?? json?.data ?? (Array.isArray(json) ? json : [])
    return items.map((item: unknown) => {
      const i = item as Record<string, unknown>
      return {
        external_id:    `go-${i.id ?? i.numeroProcesso ?? Math.random()}`,
        titulo:         String(i.objeto ?? i.descricao ?? '').slice(0, 500),
        objeto:         String(i.objeto ?? i.descricao ?? ''),
        orgao:          String(i.nomeOrgao ?? i.orgao ?? ''),
        valor_estimado: parseFloat(String(i.valorEstimado ?? 0)) || null,
        data_abertura:  String(i.dataAbertura ?? '').split('T')[0] || null,
        estado: 'GO', municipio: String(i.municipio ?? '') || null,
        fonte: 'Portal GO',
        url: `https://www.compras.go.gov.br/licitacoes/${i.id ?? ''}`,
      }
    }).filter(l => l.objeto.length > 10)
  } catch (err) { console.error('Portal GO erro:', err instanceof Error ? err.message : err); return [] }
}

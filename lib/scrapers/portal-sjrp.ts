/**
 * Scraper: Portal de Compras — Prefeitura de São José do Rio Preto (SP — 460k hab)
 * https://licitacoes.riopreto.sp.gov.br
 */
import type { LicitacaoRaw } from './types'
export async function coletarPortalSJRP(dataInicio: string): Promise<LicitacaoRaw[]> {
  try {
    const res = await fetch(
      `https://licitacoes.riopreto.sp.gov.br/api/licitacoes?dataInicio=${dataInicio}&situacao=ABERTA&pagina=1&quantidade=100`,
      { headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(20000) }
    )
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    const items: unknown[] = json?.licitacoes ?? json?.data ?? json?.content ?? (Array.isArray(json) ? json : [])
    return items.map((item: unknown) => {
      const i = item as Record<string, unknown>
      const id = String(i.id ?? i.numeroProcesso ?? Math.random())
      return { external_id: `sjrp-${id}`, objeto: String(i.objeto ?? i.descricao ?? ''), orgao: String(i.nomeOrgao ?? i.orgao ?? 'Prefeitura de São José do Rio Preto'), valor_estimado: parseFloat(String(i.valorEstimado ?? 0)) || undefined, data_abertura: String(i.dataAbertura ?? '').split('T')[0] || dataInicio, estado: 'SP', municipio: 'São José do Rio Preto', fonte: 'Portal São José do Rio Preto', url: String(i.url ?? `https://licitacoes.riopreto.sp.gov.br/licitacoes/${id}`) } satisfies LicitacaoRaw
    }).filter(l => l.objeto.length > 10)
  } catch (err) { console.error('Portal SJRP erro:', err instanceof Error ? err.message : err); return [] }
}

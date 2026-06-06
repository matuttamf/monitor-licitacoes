/**
 * Scraper: Portal de Compras — Prefeitura de Recife
 * https://licitacoes.recife.pe.gov.br
 */
import type { LicitacaoRaw } from './types'

export async function coletarPortalRecife(dataInicio: string): Promise<LicitacaoRaw[]> {
  try {
    const res = await fetch(
      `https://licitacoes.recife.pe.gov.br/api/licitacoes?dataInicio=${dataInicio}&dataFim=${dataInicio}&situacao=ABERTA&pagina=1&quantidade=100`,
      { headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(20000) }
    )
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    const items: unknown[] = json?.licitacoes ?? json?.data ?? json?.content ?? (Array.isArray(json) ? json : [])
    return items.map((item: unknown) => {
      const i = item as Record<string, unknown>
      const id = String(i.id ?? i.numeroProcesso ?? Math.random())
      return {
        external_id:    `recife-${id}`,
        titulo:         String(i.objeto ?? i.descricao ?? '').slice(0, 500),
        objeto:         String(i.objeto ?? i.descricao ?? ''),
        orgao:          String(i.nomeOrgao ?? i.orgao ?? 'Prefeitura de Recife'),
        valor_estimado: parseFloat(String(i.valorEstimado ?? 0)) || null,
        data_abertura:  String(i.dataAbertura ?? '').split('T')[0] || dataInicio,
        estado: 'PE', municipio: 'Recife',
        fonte: 'Portal Recife',
        url: String(i.url ?? i.link ?? `https://licitacoes.recife.pe.gov.br/licitacoes/${id}`),
      }
    }).filter(l => l.objeto.length > 10)
  } catch (err) { console.error('Portal Recife erro:', err instanceof Error ? err.message : err); return [] }
}

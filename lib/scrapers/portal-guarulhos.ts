/**
 * Scraper: Portal de Compras — Prefeitura de Guarulhos (SP — 1.4M hab, maior cidade não-capital)
 * https://licitacoes.guarulhos.sp.gov.br
 */
import type { LicitacaoRaw } from './types'

export async function coletarPortalGuarulhos(dataInicio: string): Promise<LicitacaoRaw[]> {
  try {
    const res = await fetch(
      `https://licitacoes.guarulhos.sp.gov.br/api/licitacoes?dataInicio=${dataInicio}&dataFim=${dataInicio}&situacao=ABERTA&pagina=1&quantidade=100`,
      { headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(20000) }
    )
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    const items: unknown[] = json?.licitacoes ?? json?.data ?? json?.content ?? (Array.isArray(json) ? json : [])
    return items.map((item: unknown) => {
      const i = item as Record<string, unknown>
      const id = String(i.id ?? i.numeroProcesso ?? Math.random())
      return {
        external_id: `guarulhos-${id}`,
        objeto: String(i.objeto ?? i.descricao ?? ''),
        orgao: String(i.nomeOrgao ?? i.orgao ?? 'Prefeitura de Guarulhos'),
        valor_estimado: parseFloat(String(i.valorEstimado ?? 0)) || undefined,
        data_abertura: String(i.dataAbertura ?? '').split('T')[0] || dataInicio,
        estado: 'SP', municipio: 'Guarulhos',
        fonte: 'Portal Guarulhos',
        url: String(i.url ?? `https://licitacoes.guarulhos.sp.gov.br/licitacoes/${id}`),
      } satisfies LicitacaoRaw
    }).filter(l => l.objeto.length > 10)
  } catch (err) { console.error('Portal Guarulhos erro:', err instanceof Error ? err.message : err); return [] }
}

/**
 * Scraper: Portal de Compras — Prefeitura de São Paulo (capital)
 * https://e-negocioscidadesp.prefeitura.sp.gov.br
 */
import type { LicitacaoRaw } from './types'

export async function coletarPortalSPCidade(dataInicio: string): Promise<LicitacaoRaw[]> {
  try {
    const res = await fetch(
      `https://e-negocioscidadesp.prefeitura.sp.gov.br/api/licitacoes?dataInicio=${dataInicio}&dataFim=${dataInicio}&situacao=ABERTA&pagina=1&quantidade=100`,
      { headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(20000) }
    )
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    const items: unknown[] = json?.licitacoes ?? json?.data ?? json?.content ?? (Array.isArray(json) ? json : [])
    return items.map((item: unknown) => {
      const i = item as Record<string, unknown>
      const id = String(i.id ?? i.numeroProcesso ?? Math.random())
      return {
        external_id:    `sp-cidade-${id}`,
        titulo:         String(i.objeto ?? i.descricao ?? '').slice(0, 500),
        objeto:         String(i.objeto ?? i.descricao ?? ''),
        orgao:          String(i.nomeOrgao ?? i.orgao ?? 'Prefeitura de São Paulo'),
        valor_estimado: parseFloat(String(i.valorEstimado ?? 0)) || null,
        data_abertura:  String(i.dataAbertura ?? '').split('T')[0] || null,
        estado: 'SP', municipio: 'São Paulo',
        fonte: 'SP Capital',
        url: `https://e-negocioscidadesp.prefeitura.sp.gov.br/licitacoes/${id}`,
      }
    }).filter(l => l.objeto.length > 10)
  } catch (err) { console.error('SP Capital erro:', err instanceof Error ? err.message : err); return [] }
}

/**
 * Scraper: Central de Licitações RS (Rio Grande do Sul)
 * https://www.centraldisponivel.rs.gov.br
 */
import type { LicitacaoRaw } from './types'

export async function coletarPortalRS(dataInicio: string): Promise<LicitacaoRaw[]> {
  try {
    const url = `https://www.centraldisponivel.rs.gov.br/api/licitacoes?dataInicio=${dataInicio}&dataFim=${dataInicio}&situacao=ABERTA&pagina=1&tamanhoPagina=100`
    const res = await fetch(url, {
      headers: {
        'Accept':     'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; MonitorLicitacoes/1.0)',
      },
      signal: AbortSignal.timeout(20000),
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    const items: unknown[] = json?.licitacoes ?? json?.content ?? json?.data ?? (Array.isArray(json) ? json : [])

    return items.map((item: unknown) => {
      const i = item as Record<string, unknown>
      const id = String(i.id ?? i.numeroProcesso ?? i.numeroEdital ?? Math.random())
      return {
        external_id:    `rs-${id}`,
        titulo:         String(i.objeto ?? i.descricao ?? '').slice(0, 500),
        objeto:         String(i.objeto ?? i.descricao ?? ''),
        orgao:          String(i.nomeOrgao ?? i.orgao ?? i.entidade ?? ''),
        valor_estimado: parseFloat(String(i.valorEstimado ?? i.valor ?? 0)) || null,
        data_abertura:  String(i.dataAbertura ?? i.data ?? '').split('T')[0] || null,
        estado:         'RS',
        municipio:      String(i.municipio ?? i.cidade ?? '') || null,
        fonte:          'Portal RS',
        url:            `https://www.centraldisponivel.rs.gov.br/licitacoes/${id}`,
      }
    }).filter(l => l.objeto.length > 10)
  } catch (err) {
    console.error('Portal RS erro:', err instanceof Error ? err.message : err)
    return []
  }
}

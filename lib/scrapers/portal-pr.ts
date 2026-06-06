/**
 * Scraper: Compras Paraná (Portal de Compras PR)
 * https://www.comprasparana.pr.gov.br
 */
import type { LicitacaoRaw } from './types'

export async function coletarPortalPR(dataInicio: string): Promise<LicitacaoRaw[]> {
  try {
    const [ano, mes, dia] = dataInicio.split('-')
    const dtBR = `${dia}/${mes}/${ano}`

    const url = `https://www.comprasparana.pr.gov.br/Licitacao/ListarLicitacao?dataAbertura=${dtBR}&situacao=Aberta&pagina=1&quantidade=100`
    const res = await fetch(url, {
      headers: {
        'Accept':     'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; MonitorLicitacoes/1.0)',
        'X-Requested-With': 'XMLHttpRequest',
      },
      signal: AbortSignal.timeout(20000),
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    const items: unknown[] = json?.licitacoes ?? json?.data ?? json?.resultado ?? (Array.isArray(json) ? json : [])

    return items.map((item: unknown) => {
      const i = item as Record<string, unknown>
      const id = String(i.id ?? i.numeroLicitacao ?? i.numeroProcesso ?? Math.random())
      return {
        external_id:    `pr-${id}`,
        titulo:         String(i.objeto ?? i.descricaoObjeto ?? '').slice(0, 500),
        objeto:         String(i.objeto ?? i.descricaoObjeto ?? ''),
        orgao:          String(i.nomeOrgao ?? i.orgao ?? i.entidade ?? ''),
        valor_estimado: parseFloat(String(i.valorEstimado ?? i.valor ?? 0)) || null,
        data_abertura:  String(i.dataAbertura ?? i.data ?? '').split('T')[0] || null,
        estado:         'PR',
        municipio:      String(i.municipio ?? i.cidade ?? '') || null,
        fonte:          'Portal PR',
        url:            `https://www.comprasparana.pr.gov.br/Licitacao/Detalhes/${id}`,
      }
    }).filter(l => l.objeto.length > 10)
  } catch (err) {
    console.error('Portal PR erro:', err instanceof Error ? err.message : err)
    return []
  }
}

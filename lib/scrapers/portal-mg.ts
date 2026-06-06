/**
 * Scraper: Portal de Compras MG (Minas Gerais)
 * https://www.compras.mg.gov.br — grande volume, complementa PNCP
 */
import type { LicitacaoRaw } from './types'

export async function coletarPortalMG(dataInicio: string): Promise<LicitacaoRaw[]> {
  try {
    const url = `https://www.compras.mg.gov.br/publ/servicos/licitacoes/listar-licitacoes?dataPublicacaoInicio=${dataInicio}&dataPublicacaoFim=${dataInicio}&pagina=1&quantidadeRegistrosPorPagina=100`
    const res = await fetch(url, {
      headers: {
        'Accept':     'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; MonitorLicitacoes/1.0)',
      },
      signal: AbortSignal.timeout(20000),
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    const items: unknown[] = json?.licitacoes ?? json?.data ?? json?.resultado ?? (Array.isArray(json) ? json : [])

    return items.map((item: unknown) => {
      const i = item as Record<string, unknown>
      const id = String(i.numeroProcesso ?? i.id ?? i.numeroEdital ?? Math.random())
      return {
        external_id:    `mg-${id}`,
        titulo:         String(i.objeto ?? i.descricaoObjeto ?? '').slice(0, 500),
        objeto:         String(i.objeto ?? i.descricaoObjeto ?? ''),
        orgao:          String(i.nomeOrgao ?? i.orgao ?? i.unidadeGestora ?? ''),
        valor_estimado: parseFloat(String(i.valorEstimado ?? i.valor ?? 0)) || null,
        data_abertura:  String(i.dataAbertura ?? i.dataPublicacao ?? '').split('T')[0] || null,
        estado:         'MG',
        municipio:      String(i.municipio ?? '') || null,
        fonte:          'Portal MG',
        url:            `https://www.compras.mg.gov.br/publ/portal-de-compras/compras-mg/licitacao;id=${id}`,
      }
    }).filter(l => l.objeto.length > 10)
  } catch (err) {
    console.error('Portal MG erro:', err instanceof Error ? err.message : err)
    return []
  }
}

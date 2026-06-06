/**
 * Scraper: Caixa Econômica Federal — Portal de Licitações
 * https://www.caixa.gov.br/site/paginas/licitacoes.aspx
 * CEF é empresa pública federal obrigada a publicar no PNCP desde 2021.
 * Este scraper acessa o endpoint JSON do portal próprio da CEF.
 */
import type { LicitacaoRaw } from './types'

export async function coletarCaixa(dataInicio: string): Promise<LicitacaoRaw[]> {
  try {
    const res = await fetch(
      `https://www.caixa.gov.br/site/api/licitacoes?dataInicio=${dataInicio}&dataFim=${dataInicio}&situacao=ABERTA&pagina=1&quantidade=100`,
      {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; MonitorLicitacoes/1.0)',
        },
        signal: AbortSignal.timeout(20000),
      }
    )
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    const items: unknown[] = json?.licitacoes ?? json?.data ?? json?.content ?? (Array.isArray(json) ? json : [])

    return items.map((item: unknown) => {
      const i = item as Record<string, unknown>
      const id = String(i.id ?? i.numeroLicitacao ?? Math.random())
      return {
        external_id:    `cef-${id}`,
        titulo:         String(i.objeto ?? i.descricao ?? '').slice(0, 500),
        objeto:         String(i.objeto ?? i.descricao ?? ''),
        orgao:          String(i.unidade ?? i.orgao ?? 'Caixa Econômica Federal'),
        valor_estimado: parseFloat(String(i.valorEstimado ?? 0)) || null,
        data_abertura:  String(i.dataAbertura ?? '').split('T')[0] || dataInicio,
        estado:         String(i.uf ?? i.estado ?? '') || null,
        municipio:      null,
        fonte:          'Caixa',
        url:            String(i.url ?? `https://www.caixa.gov.br/site/paginas/licitacoes.aspx`),
      }
    }).filter(l => l.objeto.length > 10)
  } catch (err) {
    console.error('Caixa erro:', err instanceof Error ? err.message : err)
    return []
  }
}

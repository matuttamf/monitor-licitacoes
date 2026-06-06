/**
 * Scraper: SABESP — Portal do Fornecedor / Licitações
 * https://fornecedor.sabesp.com.br
 * Companhia de Saneamento Básico do Estado de São Paulo — empresa mista estadual.
 * Obrigada a publicar no PNCP; também mantém portal próprio via SAP Ariba.
 */
import type { LicitacaoRaw } from './types'

export async function coletarSabesp(dataInicio: string): Promise<LicitacaoRaw[]> {
  try {
    const res = await fetch(
      `https://fornecedor.sabesp.com.br/api/licitacoes/abertas?dataInicio=${dataInicio}&dataFim=${dataInicio}&pagina=1&quantidade=100`,
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
      const id = String(i.id ?? i.numero ?? Math.random())
      return {
        external_id:    `sabesp-${id}`,
        titulo:         String(i.objeto ?? i.titulo ?? i.descricao ?? '').slice(0, 500),
        objeto:         String(i.objeto ?? i.descricao ?? ''),
        orgao:          'SABESP',
        valor_estimado: parseFloat(String(i.valorEstimado ?? 0)) || null,
        data_abertura:  String(i.dataEncerramento ?? i.dataAbertura ?? '').split('T')[0] || dataInicio,
        estado:         'SP',
        municipio:      null,
        fonte:          'SABESP',
        url:            String(i.url ?? i.link ?? `https://fornecedor.sabesp.com.br/licitacoes/${id}`),
      }
    }).filter(l => l.objeto.length > 10)
  } catch (err) {
    console.error('SABESP erro:', err instanceof Error ? err.message : err)
    return []
  }
}

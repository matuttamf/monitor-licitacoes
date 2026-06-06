/**
 * Scraper: Correios — Portal de Licitações
 * https://www.correios.com.br/acesso-a-informacao/licitacoes
 * Os Correios são empresa pública federal e publicam licitações no PNCP.
 * Este scraper busca diretamente no portal deles por itens mais recentes.
 */
import type { LicitacaoRaw } from './types'

export async function coletarCorreios(dataInicio: string): Promise<LicitacaoRaw[]> {
  try {
    // Correios utilizam sistema próprio de licitações via API REST
    const res = await fetch(
      `https://www.correios.com.br/fornecedor/licitacoes/json?dataInicio=${dataInicio}&dataFim=${dataInicio}&status=aberta`,
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
        external_id:    `correios-${id}`,
        titulo:         String(i.objeto ?? i.descricao ?? '').slice(0, 500),
        objeto:         String(i.objeto ?? i.descricao ?? ''),
        orgao:          'Correios — ECT',
        valor_estimado: parseFloat(String(i.valorEstimado ?? 0)) || null,
        data_abertura:  String(i.dataAbertura ?? i.dataEncerramento ?? '').split('T')[0] || dataInicio,
        estado:         null,
        municipio:      null,
        fonte:          'Correios',
        url:            String(i.url ?? i.link ?? `https://www.correios.com.br/fornecedor/licitacoes/${id}`),
      }
    }).filter(l => l.objeto.length > 10)
  } catch (err) {
    console.error('Correios erro:', err instanceof Error ? err.message : err)
    return []
  }
}

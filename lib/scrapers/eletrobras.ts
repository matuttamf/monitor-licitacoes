/**
 * Scraper: Eletrobras — Portal de Licitações
 * https://www.eletrobras.com/pt/fornecedores/licitacoes-e-contratos
 * Eletrobras foi privatizada em 2022 mas mantém portal de licitações.
 * Tenta API REST; fallback se indisponível.
 */
import type { LicitacaoRaw } from './types'

export async function coletarEletrobras(dataInicio: string): Promise<LicitacaoRaw[]> {
  try {
    const res = await fetch(
      `https://www.eletrobras.com/api/licitacoes?dataInicio=${dataInicio}&dataFim=${dataInicio}&status=aberta&pagina=1&quantidade=100`,
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
        external_id:    `eletrobras-${id}`,
        titulo:         String(i.objeto ?? i.titulo ?? i.descricao ?? '').slice(0, 500),
        objeto:         String(i.objeto ?? i.descricao ?? ''),
        orgao:          String(i.empresa ?? i.orgao ?? 'Eletrobras'),
        valor_estimado: parseFloat(String(i.valorEstimado ?? 0)) || null,
        data_abertura:  String(i.dataEncerramento ?? i.dataAbertura ?? '').split('T')[0] || dataInicio,
        estado:         null,
        municipio:      null,
        fonte:          'Eletrobras',
        url:            String(i.url ?? i.link ?? `https://www.eletrobras.com/pt/fornecedores/licitacoes-e-contratos`),
      }
    }).filter(l => l.objeto.length > 10)
  } catch (err) {
    console.error('Eletrobras erro:', err instanceof Error ? err.message : err)
    return []
  }
}

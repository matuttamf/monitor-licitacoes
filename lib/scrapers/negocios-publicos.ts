/**
 * Scraper: Negócios Públicos — https://negociospublicos.com.br
 * Grande agregador nacional de licitações municipais e estaduais.
 */
import type { LicitacaoRaw } from './types'

export async function coletarNegociosPublicos(dataInicio: string): Promise<LicitacaoRaw[]> {
  try {
    const res = await fetch(
      `https://negociospublicos.com.br/api/v1/licitacoes?dataPublicacao=${dataInicio}&situacao=ABERTA&pagina=1&quantidade=100`,
      { headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(20000) }
    )
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    const items: unknown[] = json?.licitacoes ?? json?.data ?? json?.content ?? (Array.isArray(json) ? json : [])
    return items.map((item: unknown) => {
      const i = item as Record<string, unknown>
      const id = String(i.id ?? i.uuid ?? i.codigoLicitacao ?? Math.random())
      return {
        external_id:    `negocios-publicos-${id}`,
        titulo:         String(i.objeto ?? i.descricao ?? i.titulo ?? '').slice(0, 500),
        objeto:         String(i.objeto ?? i.descricao ?? i.titulo ?? ''),
        orgao:          String(i.nomeOrgao ?? i.orgao ?? i.entidade ?? ''),
        valor_estimado: parseFloat(String(i.valorEstimado ?? i.valor ?? 0)) || null,
        data_abertura:  String(i.dataAbertura ?? i.abertura ?? '').split('T')[0] || null,
        estado:         String(i.uf ?? i.estado ?? '').toUpperCase().slice(0, 2) || null,
        municipio:      String(i.municipio ?? i.cidade ?? '') || null,
        fonte:          'Negócios Públicos',
        url:            `https://negociospublicos.com.br/licitacao/${id}`,
      }
    }).filter(l => l.objeto.length > 10)
  } catch (err) { console.error('Negócios Públicos erro:', err instanceof Error ? err.message : err); return [] }
}

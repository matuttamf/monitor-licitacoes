/**
 * Scraper: Compras Públicas — https://www.compraspublicas.com.br
 * Plataforma agregadora nacional com forte presença municipal.
 */
import type { LicitacaoRaw } from './types'

export async function coletarComprasPublicas(dataInicio: string): Promise<LicitacaoRaw[]> {
  try {
    const res = await fetch(
      `https://www.compraspublicas.com.br/api/licitacoes?dataInicio=${dataInicio}&dataFim=${dataInicio}&situacao=aberta&pagina=1&quantidade=100`,
      { headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(20000) }
    )
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    const items: unknown[] = json?.licitacoes ?? json?.data ?? json?.content ?? (Array.isArray(json) ? json : [])
    return items.map((item: unknown) => {
      const i = item as Record<string, unknown>
      const id = String(i.id ?? i.codigo ?? Math.random())
      return {
        external_id:    `compras-publicas-${id}`,
        titulo:         String(i.objeto ?? i.descricao ?? i.titulo ?? '').slice(0, 500),
        objeto:         String(i.objeto ?? i.descricao ?? i.titulo ?? ''),
        orgao:          String(i.nomeOrgao ?? i.orgao ?? i.entidade ?? ''),
        valor_estimado: parseFloat(String(i.valorEstimado ?? i.valor ?? 0)) || null,
        data_abertura:  String(i.dataAbertura ?? '').split('T')[0] || null,
        estado:         String(i.uf ?? i.estado ?? '').toUpperCase().slice(0, 2) || null,
        municipio:      String(i.municipio ?? i.cidade ?? '') || null,
        fonte:          'Compras Públicas',
        url:            `https://www.compraspublicas.com.br/licitacao/${id}`,
      }
    }).filter(l => l.objeto.length > 10)
  } catch (err) { console.error('Compras Públicas erro:', err instanceof Error ? err.message : err); return [] }
}

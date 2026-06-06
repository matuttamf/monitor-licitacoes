/**
 * Scraper: BLL (Bolsa de Licitações e Leilões)
 * Plataforma privada usada por centenas de municípios brasileiros.
 * Endpoint público de avisos de licitação.
 */
import type { LicitacaoRaw } from './types'

export async function coletarBLL(dataInicio: string): Promise<LicitacaoRaw[]> {
  try {
    const url = `https://bll.org.br/api/aviso-licitacao/public?dtInicio=${dataInicio}&dtFim=${dataInicio}&status=ABERTO&size=100`
    const res = await fetch(url, {
      headers: {
        'Accept':     'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; MonitorLicitacoes/1.0)',
        'Origin':     'https://bll.org.br',
        'Referer':    'https://bll.org.br/pesquisa/',
      },
      signal: AbortSignal.timeout(20000),
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    const items: unknown[] = json?.content ?? json?.data ?? json?.avisos ?? (Array.isArray(json) ? json : [])

    return items.map((item: unknown) => {
      const i = item as Record<string, unknown>
      const id = String(i.id ?? i.numeroEdital ?? i.codigoAviso ?? Math.random())
      return {
        external_id:    `bll-${id}`,
        titulo:         String(i.objeto ?? i.descricao ?? '').slice(0, 500),
        objeto:         String(i.objeto ?? i.descricao ?? ''),
        orgao:          String(i.nomeOrgao ?? i.orgao ?? i.entidade ?? ''),
        valor_estimado: parseFloat(String(i.valorEstimado ?? i.valor ?? 0)) || null,
        data_abertura:  String(i.dataAbertura ?? i.dtAbertura ?? '').split('T')[0] || null,
        estado:         String(i.uf ?? i.estado ?? '').toUpperCase().slice(0, 2) || null,
        municipio:      String(i.municipio ?? i.cidade ?? '') || null,
        fonte:          'BLL',
        url:            i.id
          ? `https://bll.org.br/pesquisa/aviso-licitacao/${id}`
          : 'https://bll.org.br/pesquisa/',
      }
    }).filter(l => l.objeto.length > 10)
  } catch (err) {
    console.error('BLL erro:', err instanceof Error ? err.message : err)
    return []
  }
}

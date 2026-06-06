/**
 * Scraper: Licitar Digital
 * https://www.licitardigital.com.br — plataforma nacional usada por municípios
 */
import type { LicitacaoRaw } from './types'

export async function coletarLicitarDigital(dataInicio: string): Promise<LicitacaoRaw[]> {
  try {
    const url = `https://app.licitardigital.com.br/api/v1/licitacoes/publicas?dataInicio=${dataInicio}&dataFim=${dataInicio}&status=aberta&pagina=1&quantidade=100`
    const res = await fetch(url, {
      headers: {
        'Accept':     'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; MonitorLicitacoes/1.0)',
        'Origin':     'https://www.licitardigital.com.br',
      },
      signal: AbortSignal.timeout(20000),
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    const items: unknown[] = json?.licitacoes ?? json?.data ?? json?.content ?? (Array.isArray(json) ? json : [])

    return items.map((item: unknown) => {
      const i = item as Record<string, unknown>
      const id = String(i.id ?? i.uuid ?? i.numeroEdital ?? Math.random())
      return {
        external_id:    `licitar-digital-${id}`,
        titulo:         String(i.objeto ?? i.descricao ?? i.titulo ?? '').slice(0, 500),
        objeto:         String(i.objeto ?? i.descricao ?? i.titulo ?? ''),
        orgao:          String(i.nomeOrgao ?? i.orgao ?? i.entidade ?? ''),
        valor_estimado: parseFloat(String(i.valorEstimado ?? i.valor ?? 0)) || null,
        data_abertura:  String(i.dataAbertura ?? i.abertura ?? '').split('T')[0] || null,
        estado:         String(i.uf ?? i.estado ?? '').toUpperCase().slice(0, 2) || null,
        municipio:      String(i.municipio ?? i.cidade ?? '') || null,
        fonte:          'Licitar Digital',
        url:            i.id
          ? `https://www.licitardigital.com.br/licitacao/${id}`
          : 'https://www.licitardigital.com.br',
      }
    }).filter(l => l.objeto.length > 10)
  } catch (err) {
    console.error('Licitar Digital erro:', err instanceof Error ? err.message : err)
    return []
  }
}

/**
 * Scraper: Licitações-e (Banco do Brasil)
 * Plataforma do BB usada por centenas de municípios e estados.
 * REST público sem autenticação.
 */
import type { LicitacaoRaw } from './types'

export async function coletarLicitacoesE(dataInicio: string): Promise<LicitacaoRaw[]> {
  try {
    // DD/MM/YYYY para o endpoint legado
    const [ano, mes, dia] = dataInicio.split('-')
    const dtBR = `${dia}/${mes}/${ano}`

    const url = `https://www.licitacoes-e.com.br/aop/licitacaoListaJson?dt=${dtBR}`
    const res = await fetch(url, {
      headers: {
        'Accept':     'application/json, text/javascript, */*',
        'User-Agent': 'Mozilla/5.0 (compatible; MonitorLicitacoes/1.0)',
        'Referer':    'https://www.licitacoes-e.com.br/',
      },
      signal: AbortSignal.timeout(20000),
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    const items: unknown[] = Array.isArray(json) ? json : (json?.licitacoes ?? json?.resultado ?? [])

    return items.map((item: unknown) => {
      const i = item as Record<string, unknown>
      const id = String(i.codigoLicitacao ?? i.id ?? i.numero ?? Math.random())
      return {
        external_id:    `licitacoes-e-${id}`,
        titulo:         String(i.descricaoObjeto ?? i.objeto ?? '').slice(0, 500),
        objeto:         String(i.descricaoObjeto ?? i.objeto ?? ''),
        orgao:          String(i.nomeUnidadeCompra ?? i.orgao ?? i.entidade ?? ''),
        valor_estimado: parseFloat(String(i.valorEstimado ?? i.valor ?? 0)) || null,
        data_abertura:  parseDataBR(String(i.dtAbertura ?? i.dataAbertura ?? '')),
        estado:         ufFromString(String(i.uf ?? i.estado ?? '')),
        municipio:      String(i.municipio ?? i.cidade ?? '') || null,
        fonte:          'Licitações-e',
        url:            i.codigoLicitacao
          ? `https://www.licitacoes-e.com.br/aop/detalhelicitacao.do?codigoLicitacao=${id}`
          : 'https://www.licitacoes-e.com.br',
      }
    }).filter(l => l.objeto.length > 10)
  } catch (err) {
    console.error('Licitações-e erro:', err instanceof Error ? err.message : err)
    return []
  }
}

function parseDataBR(s: string): string | null {
  if (!s) return null
  // DD/MM/YYYY ou YYYY-MM-DD
  if (/^\d{2}\/\d{2}\/\d{4}/.test(s)) {
    const [d, m, y] = s.split('/')
    return `${y}-${m}-${d}`
  }
  const iso = s.split('T')[0]
  return iso.length === 10 ? iso : null
}

function ufFromString(s: string): string | null {
  const uf = s.toUpperCase().trim().slice(0, 2)
  return uf.length === 2 && /^[A-Z]{2}$/.test(uf) ? uf : null
}

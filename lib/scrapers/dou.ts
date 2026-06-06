/**
 * Scraper: DOU — Diário Oficial da União (Imprensa Nacional)
 * API pública: https://www.in.gov.br/servicos/pesquisar-diario-oficial
 * Busca por editais de licitação publicados na seção 3.
 */
import type { LicitacaoRaw } from './types'

export async function coletarDOU(dataInicio: string): Promise<LicitacaoRaw[]> {
  try {
    const [ano, mes, dia] = dataInicio.split('-')
    const dtBR = `${dia}-${mes}-${ano}` // formato da API: DD-MM-YYYY

    const url = `https://www.in.gov.br/leiturajornal?data=${dtBR}&secao=do3&temas=licita%C3%A7%C3%A3o`
    const res = await fetch(url, {
      headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(25000),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()

    // A API retorna { jsonArray: [...] }
    const items: unknown[] = json?.jsonArray ?? json?.content ?? (Array.isArray(json) ? json : [])

    return items.map((item: unknown) => {
      const i = item as Record<string, unknown>
      const titulo = String(i.title ?? i.titulo ?? i.nome ?? '')
      const corpo  = String(i.content ?? i.texto ?? i.resumo ?? titulo)
      const id     = String(i.id ?? i.urlTitle ?? Math.random())
      return {
        external_id:    `dou-${id}`,
        titulo:         titulo.slice(0, 500),
        objeto:         corpo.slice(0, 2000),
        orgao:          String(i.orgao ?? i.entidade ?? i.hierarchyStr ?? ''),
        valor_estimado: null,
        data_abertura:  dataInicio,
        estado:         null,
        municipio:      null,
        fonte:          'DOU',
        url:            i.urlTitle
          ? `https://www.in.gov.br/en/web/dou/-/${i.urlTitle}`
          : 'https://www.in.gov.br',
      }
    }).filter(l => l.objeto.length > 20)
  } catch (err) { console.error('DOU erro:', err instanceof Error ? err.message : err); return [] }
}

/**
 * Scraper: Consórcio PCJ — Comitês das Bacias dos Rios Piracicaba, Capivari e Jundiaí
 * Grandes contratos de saneamento, obras hídricas e serviços ambientais — SP/MG
 * https://www.agenciapcj.org.br/licitacoes
 */
import type { LicitacaoRaw } from './types'

export async function coletarConsorcioPCJ(dataInicio: string): Promise<LicitacaoRaw[]> {
  try {
    const res = await fetch(
      `https://www.agenciapcj.org.br/api/licitacoes?dataInicio=${dataInicio}&situacao=ABERTA&pagina=1&quantidade=50`,
      { headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(20000) }
    )
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    const items: unknown[] = json?.licitacoes ?? json?.data ?? json?.content ?? (Array.isArray(json) ? json : [])
    return items.map((item: unknown) => {
      const i = item as Record<string, unknown>
      const id = String(i.id ?? i.numeroProcesso ?? Math.random())
      return {
        external_id:    `pcj-${id}`,
        objeto:         String(i.objeto ?? i.descricao ?? ''),
        orgao:          String(i.nomeOrgao ?? i.orgao ?? 'Consórcio PCJ / Agência PCJ'),
        valor_estimado: parseFloat(String(i.valorEstimado ?? 0)) || undefined,
        data_abertura:  String(i.dataAbertura ?? '').split('T')[0] || dataInicio,
        estado:         'SP',
        fonte:          'Consórcio PCJ',
        url:            String(i.url ?? `https://www.agenciapcj.org.br/licitacoes/${id}`),
      } satisfies LicitacaoRaw
    }).filter(l => l.objeto.length > 10)
  } catch (err) {
    console.error('Consórcio PCJ erro:', err instanceof Error ? err.message : err)
    return []
  }
}

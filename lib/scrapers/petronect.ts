/**
 * Scraper: Petronect — Portal de Licitações da Petrobras
 * https://petronect.com.br
 * Petrobras publica oportunidades de fornecimento via Petronect (SAP Ariba).
 * Endpoint público de consulta de oportunidades abertas.
 */
import type { LicitacaoRaw } from './types'

interface PetronectItem {
  id?: string
  titulo?: string
  descricao?: string
  objeto?: string
  valorEstimado?: number
  dataPublicacao?: string
  dataEncerramento?: string
  unidadeNegocio?: string
  url?: string
}

export async function coletarPetronect(dataInicio: string): Promise<LicitacaoRaw[]> {
  try {
    // API pública de oportunidades abertas do Petronect
    const res = await fetch(
      `https://petronect.com.br/irj/go/km/docs/pccshrcontent/WebContent/publico/json/oportunidades-abertas.json`,
      {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; MonitorLicitacoes/1.0)',
          Referer: 'https://petronect.com.br',
        },
        signal: AbortSignal.timeout(25000),
      }
    )
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()

    const items: PetronectItem[] = json?.oportunidades ?? json?.data ?? (Array.isArray(json) ? json : [])

    return items.map(item => {
      const id = item.id ?? String(Math.random())
      const objeto = item.descricao ?? item.objeto ?? item.titulo ?? ''
      return {
        external_id:    `petronect-${id}`,
        titulo:         (item.titulo ?? objeto).slice(0, 500),
        objeto,
        orgao:          item.unidadeNegocio ?? 'Petrobras',
        valor_estimado: item.valorEstimado ?? null,
        data_abertura:  item.dataEncerramento?.substring(0, 10) ?? dataInicio,
        estado:         null,
        municipio:      null,
        fonte:          'Petronect',
        url:            item.url ?? `https://petronect.com.br/oportunidade/${id}`,
      }
    }).filter(l => l.objeto.length > 10)
  } catch (err) {
    console.error('Petronect erro:', err instanceof Error ? err.message : err)
    return []
  }
}

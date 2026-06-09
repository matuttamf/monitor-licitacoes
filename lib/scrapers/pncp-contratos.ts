/**
 * Scraper: PNCP — Contratos e Atas de Registro de Preços
 * Endpoint: /v1/contratos/publicacao e /v1/atas
 * Captura contratos recém-publicados no PNCP (sinalizam demandas ativas)
 * e Atas de Registro de Preços (oportunidades de adesão).
 */
import type { LicitacaoRaw } from './types'

const BASE = 'https://pncp.gov.br/api/consulta/v1'

function formatarData(d: string): string { return d.replace(/-/g, '') }

interface PncpContrato {
  id?: string
  numeroContrato?: string
  numeroControlePNCP?: string
  orgaoEntidade?: { razaoSocial?: string; cnpj?: string }
  unidadeOrgao?: { ufSigla?: string; municipioNome?: string; nomeUnidade?: string }
  objetoContrato?: string
  valorInicial?: number
  dataPublicacaoPncp?: string
  dataVigenciaFim?: string
  linkSistemaOrigem?: string
}

interface PncpAta {
  id?: string
  numeroControlePNCP?: string
  orgaoEntidade?: { razaoSocial?: string; cnpj?: string }
  unidadeOrgao?: { ufSigla?: string; municipioNome?: string; nomeUnidade?: string }
  descricaoObjeto?: string
  valorTotal?: number
  dataPublicacaoPncp?: string
  dataVigenciaFim?: string
  linkSistemaOrigem?: string
}

async function coletarContratos(dataInicio: string, dataFim: string): Promise<LicitacaoRaw[]> {
  const licitacoes: LicitacaoRaw[] = []
  let pagina = 1

  while (pagina <= 5) { // máximo 5 páginas de contratos por vez
    try {
      const url = `${BASE}/contratos?dataInicial=${formatarData(dataInicio)}&dataFinal=${formatarData(dataFim)}&pagina=${pagina}&tamanhoPagina=50`
      const res = await fetch(url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(20000) })
      if (!res.ok) break

      const json = await res.json()
      const itens: PncpContrato[] = json.data ?? []
      if (!itens.length) break

      for (const item of itens) {
        const orgao = item.unidadeOrgao?.nomeUnidade ?? item.orgaoEntidade?.razaoSocial ?? ''
        const id = item.numeroControlePNCP ?? item.numeroContrato ?? String(Math.random())
        licitacoes.push({
          external_id:    `pncp-contrato-${id}`,
          titulo:         `[Contrato] ${(item.objetoContrato ?? '').slice(0, 200)}`,
          objeto:         item.objetoContrato ?? '',
          orgao,
          valor_estimado: item.valorInicial ?? undefined,
          data_abertura:  item.dataVigenciaFim?.substring(0, 10) ?? item.dataPublicacaoPncp?.substring(0, 10),
          estado:         item.unidadeOrgao?.ufSigla,
          municipio:      item.unidadeOrgao?.municipioNome,
          fonte:          'PNCP Contratos',
          url:            item.linkSistemaOrigem ?? `https://pncp.gov.br/app/contratos`,
        })
      }

      if (itens.length < 50) break
      pagina++
      await new Promise(r => setTimeout(r, 200))
    } catch (err) {
      console.error(`PNCP Contratos página ${pagina}:`, err instanceof Error ? err.message : err)
      break
    }
  }

  return licitacoes.filter(l => l.objeto.length > 10)
}

async function coletarAtas(dataInicio: string, dataFim: string): Promise<LicitacaoRaw[]> {
  const licitacoes: LicitacaoRaw[] = []
  let pagina = 1

  while (pagina <= 5) {
    try {
      const url = `${BASE}/atas?dataInicial=${formatarData(dataInicio)}&dataFinal=${formatarData(dataFim)}&pagina=${pagina}&tamanhoPagina=50`
      const res = await fetch(url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(20000) })
      if (!res.ok) break

      const json = await res.json()
      const itens: PncpAta[] = json.data ?? []
      if (!itens.length) break

      for (const item of itens) {
        const orgao = item.unidadeOrgao?.nomeUnidade ?? item.orgaoEntidade?.razaoSocial ?? ''
        const id = item.numeroControlePNCP ?? String(Math.random())
        licitacoes.push({
          external_id:    `pncp-ata-${id}`,
          titulo:         `[Ata ARP] ${(item.descricaoObjeto ?? '').slice(0, 200)}`,
          objeto:         item.descricaoObjeto ?? '',
          orgao,
          valor_estimado: item.valorTotal ?? undefined,
          data_abertura:  item.dataVigenciaFim?.substring(0, 10) ?? item.dataPublicacaoPncp?.substring(0, 10),
          estado:         item.unidadeOrgao?.ufSigla,
          municipio:      item.unidadeOrgao?.municipioNome,
          fonte:          'PNCP Atas',
          url:            item.linkSistemaOrigem ?? `https://pncp.gov.br/app/atas`,
        })
      }

      if (itens.length < 50) break
      pagina++
      await new Promise(r => setTimeout(r, 200))
    } catch (err) {
      console.error(`PNCP Atas página ${pagina}:`, err instanceof Error ? err.message : err)
      break
    }
  }

  return licitacoes.filter(l => l.objeto.length > 10)
}

export async function coletarPNCPContratos(dataInicio: string, dataFim: string): Promise<LicitacaoRaw[]> {
  const [contratos, atas] = await Promise.allSettled([
    coletarContratos(dataInicio, dataFim),
    coletarAtas(dataInicio, dataFim),
  ])

  const result: LicitacaoRaw[] = []
  if (contratos.status === 'fulfilled') result.push(...contratos.value)
  if (atas.status === 'fulfilled') result.push(...atas.value)

  console.log(`PNCP Contratos+Atas: ${result.length} itens`)
  return result
}

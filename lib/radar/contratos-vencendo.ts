/**
 * Radar de Inteligência — Contratos com vigência vencendo em breve.
 * Endpoint PNCP: /contratos com dataVigenciaFimInicial/Final.
 * Usado para identificar oportunidades de renovação/adesão.
 */

const BASE = 'https://pncp.gov.br/api/consulta/v1'

export interface ContratoVencendo {
  orgao:           string
  objeto:          string
  valor:           number | null
  dataVigenciaFim: string
  diasRestantes:   number
  url:             string
  estado:          string | null
  cidade:          string | null
}

export interface RadarContratos {
  em30dias:   ContratoVencendo[]
  em60dias:   ContratoVencendo[]
  em90dias:   ContratoVencendo[]
  coletadoEm: string
}

function fmt(d: string): string { return d.replace(/-/g, '') }

function addDias(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().substring(0, 10)
}

function diasAte(dataFim: string): number {
  const fim  = new Date(dataFim + 'T00:00:00')
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  return Math.round((fim.getTime() - hoje.getTime()) / 86400000)
}

async function buscarFaixa(dataIni: string, dataFim: string, maxPag = 20): Promise<ContratoVencendo[]> {
  const lista: ContratoVencendo[] = []

  for (let p = 1; p <= maxPag; p++) {
    try {
      const url = `${BASE}/contratos?dataVigenciaFimInicial=${fmt(dataIni)}&dataVigenciaFimFinal=${fmt(dataFim)}&pagina=${p}&tamanhoPagina=50`
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal:  AbortSignal.timeout(15000),
      })

      if (res.status === 404 || res.status === 400) break
      if (!res.ok) break

      const json = await res.json()
      const itens: Record<string, unknown>[] = json.data ?? []
      if (!itens.length) break

      for (const item of itens) {
        const orgEnt = item.orgaoEntidade as { razaoSocial?: string; cnpj?: string } | null
        const und    = item.unidadeOrgao  as { ufSigla?: string; municipioNome?: string; nomeUnidade?: string } | null
        const fim    = (item.dataVigenciaFim as string | null)?.substring(0, 10) ?? ''
        if (!fim) continue

        lista.push({
          orgao:           und?.nomeUnidade || orgEnt?.razaoSocial || 'Órgão não informado',
          objeto:          (item.objetoContrato as string | null) ?? '',
          valor:           (item.valorInicial as number | null) ?? null,
          dataVigenciaFim: fim,
          diasRestantes:   diasAte(fim),
          url:             (item.linkSistemaOrigem as string | null) ?? 'https://pncp.gov.br/app/contratos',
          estado:          und?.ufSigla ?? null,
          cidade:          und?.municipioNome ?? null,
        })
      }

      const total = json.totalPaginas ?? 1
      if (p >= total || itens.length < 50) break
      await new Promise(r => setTimeout(r, 200))
    } catch (err) {
      console.error('radar contratos erro p=' + p + ':', err instanceof Error ? err.message : err)
      break
    }
  }

  return lista
}

export async function coletarContratosVencendo(): Promise<RadarContratos> {
  const hoje = new Date().toISOString().substring(0, 10)

  const [r30, r60, r90] = await Promise.allSettled([
    buscarFaixa(hoje,          addDias(30)),
    buscarFaixa(addDias(31),   addDias(60)),
    buscarFaixa(addDias(61),   addDias(90)),
  ])

  return {
    em30dias:   r30.status === 'fulfilled' ? r30.value : [],
    em60dias:   r60.status === 'fulfilled' ? r60.value : [],
    em90dias:   r90.status === 'fulfilled' ? r90.value : [],
    coletadoEm: new Date().toISOString(),
  }
}

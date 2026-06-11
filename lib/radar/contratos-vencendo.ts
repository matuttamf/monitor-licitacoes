/**
 * Radar de Inteligência — Contratos com vigência vencendo em breve.
 *
 * PNCP removeu o filtro dataVigenciaFimInicial/Final — agora é obrigatório
 * dataInicial/dataFinal (data de publicação, janela máx 365 dias).
 *
 * Estratégia: buscar contratos publicados há 9–12 meses (vigência típica 1 ano
 * no governo BR) e filtrar por dataVigenciaFim no cliente.
 * tamanhoPagina máximo aceito pelo PNCP: 20.
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
  keywords?:       string[]
}

export interface RadarContratos {
  em30dias:   ContratoVencendo[]
  em60dias:   ContratoVencendo[]
  em90dias:   ContratoVencendo[]
  coletadoEm: string
  totalBruto: number
}

function fmt(d: Date): string {
  return d.toISOString().substring(0, 10).replace(/-/g, '')
}

function subDias(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

function diasAte(dataFim: string): number {
  const fim  = new Date(dataFim + 'T00:00:00')
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  return Math.round((fim.getTime() - hoje.getTime()) / 86400000)
}

async function buscarJanela(dataIni: Date, dataFim: Date, maxPag = 15): Promise<ContratoVencendo[]> {
  const lista: ContratoVencendo[] = []

  for (let p = 1; p <= maxPag; p++) {
    try {
      const url = `${BASE}/contratos?dataInicial=${fmt(dataIni)}&dataFinal=${fmt(dataFim)}&pagina=${p}&tamanhoPagina=20`
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal:  AbortSignal.timeout(12000),
      })

      if (!res.ok) break

      const json = await res.json()
      const itens: Record<string, unknown>[] = json.data ?? []
      if (!itens.length) break

      for (const item of itens) {
        const fim = (item.dataVigenciaFim as string | null)?.substring(0, 10) ?? ''
        if (!fim) continue

        const dias = diasAte(fim)
        if (dias < 0 || dias > 90) continue  // só vencendo nos próximos 90d

        const orgEnt = item.orgaoEntidade as { razaoSocial?: string } | null
        const und    = item.unidadeOrgao  as { ufSigla?: string; municipioNome?: string; nomeUnidade?: string } | null

        lista.push({
          orgao:           und?.nomeUnidade || orgEnt?.razaoSocial || 'Órgão não informado',
          objeto:          (item.objetoContrato as string | null) ?? '',
          valor:           (item.valorInicial as number | null) ?? null,
          dataVigenciaFim: fim,
          diasRestantes:   dias,
          url:             (item.linkSistemaOrigem as string | null) ?? 'https://pncp.gov.br/app/contratos',
          estado:          und?.ufSigla ?? null,
          cidade:          und?.municipioNome ?? null,
        })
      }

      const total = json.totalPaginas ?? 1
      if (p >= total || itens.length < 20) break
      await new Promise(r => setTimeout(r, 150))
    } catch (err) {
      console.error('radar contratos err p=' + p + ':', err instanceof Error ? err.message : err)
      break
    }
  }

  return lista
}

export async function coletarContratosVencendo(): Promise<RadarContratos> {
  // Contratos publicados nos últimos 12 meses: cobre vigências típicas de 1 ano
  // Três janelas em paralelo para varrer ~9 meses distintos
  const hoje = new Date()
  const [w1, w2, w3] = await Promise.allSettled([
    buscarJanela(subDias(120), subDias(1),    15),  // 0-4 meses atrás
    buscarJanela(subDias(240), subDias(121),  15),  // 4-8 meses atrás
    buscarJanela(subDias(364), subDias(241),  15),  // 8-12 meses atrás
  ])

  const todos = [
    ...(w1.status === 'fulfilled' ? w1.value : []),
    ...(w2.status === 'fulfilled' ? w2.value : []),
    ...(w3.status === 'fulfilled' ? w3.value : []),
  ]

  const em30dias = todos.filter(c => c.diasRestantes >= 0  && c.diasRestantes <= 30)
  const em60dias = todos.filter(c => c.diasRestantes >= 31 && c.diasRestantes <= 60)
  const em90dias = todos.filter(c => c.diasRestantes >= 61 && c.diasRestantes <= 90)

  return {
    em30dias,
    em60dias,
    em90dias,
    coletadoEm: hoje.toISOString(),
    totalBruto: todos.length,
  }
}

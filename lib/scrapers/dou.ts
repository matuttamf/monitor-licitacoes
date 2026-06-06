/**
 * Scraper: DOU — Diário Oficial da União (Imprensa Nacional)
 * API pública: https://www.in.gov.br/servicos/pesquisar-diario-oficial
 *
 * Seção 1: Leis, decretos, portarias ministeriais, abertura de programas
 *          → Sinaliza contratos futuros antes do edital existir
 * Seção 2: Convênios, acordos, termos de fomento entre entes públicos
 *          → Geram licitações derivadas em prefeituras parceiras
 * Seção 3: Editais, contratos, dispensas, inexigibilidades, avisos
 *          → Publicação obrigatória de licitações federais
 */
import type { LicitacaoRaw } from './types'

type Secao = 'do1' | 'do2' | 'do3'

const SECOES: { secao: Secao; fonte: string; relevante: RegExp }[] = [
  {
    secao: 'do3',
    fonte: 'DOU',
    // Seção 3: tudo sobre licitações e contratos é relevante
    relevante: /licita|edital|pregão|concorrência|dispensa|inexig|contrat|aviso|credenci|registro de preço/i,
  },
  {
    secao: 'do2',
    fonte: 'DOU Seção 2',
    // Seção 2: convênios e acordos que geram licitações
    relevante: /convênio|acordo|termo de cooperação|parceria|repasse|contrat|licit|edital/i,
  },
  {
    secao: 'do1',
    fonte: 'DOU Seção 1',
    // Seção 1: atos normativos que anunciam programas (geram contratações futuras)
    relevante: /programa|aquisição|compra|fornecimento|serviço|obra|licit|contrat|edital|dispensa|convênio/i,
  },
]

async function coletarSecao(dataInicio: string, secao: Secao, fonte: string, relevante: RegExp): Promise<LicitacaoRaw[]> {
  const [ano, mes, dia] = dataInicio.split('-')
  const dtBR = `${dia}-${mes}-${ano}`

  // Tentar o endpoint de leitura do DOU
  const url = `https://www.in.gov.br/leiturajornal?data=${dtBR}&secao=${secao}`

  const res = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0' },
    signal: AbortSignal.timeout(25000),
  })
  if (!res.ok) throw new Error(`DOU ${secao} HTTP ${res.status}`)

  const json = await res.json()
  const items: unknown[] = json?.jsonArray ?? json?.content ?? (Array.isArray(json) ? json : [])

  return items
    .map((item: unknown) => {
      const i = item as Record<string, unknown>
      const titulo = String(i.title ?? i.titulo ?? i.nome ?? '')
      const corpo  = String(i.content ?? i.texto ?? i.resumo ?? titulo)
      const id     = String(i.id ?? i.urlTitle ?? Math.random())
      return {
        external_id:    `dou-${secao}-${id}`,
        titulo:         titulo.slice(0, 500),
        objeto:         corpo.slice(0, 2000),
        orgao:          String(i.orgao ?? i.entidade ?? i.hierarchyStr ?? ''),
        valor_estimado: undefined,
        data_abertura:  dataInicio,
        estado:         null,
        municipio:      null,
        fonte,
        url: i.urlTitle
          ? `https://www.in.gov.br/en/web/dou/-/${i.urlTitle}`
          : 'https://www.in.gov.br',
      } satisfies LicitacaoRaw
    })
    .filter(l => l.objeto.length > 30 && relevante.test(l.objeto + ' ' + l.titulo + ' ' + l.orgao))
}

export async function coletarDOU(dataInicio: string): Promise<LicitacaoRaw[]> {
  const resultados = await Promise.allSettled(
    SECOES.map(s => coletarSecao(dataInicio, s.secao, s.fonte, s.relevante))
  )

  const todas: LicitacaoRaw[] = []
  const contagem = { do3: 0, do2: 0, do1: 0 }

  for (let i = 0; i < resultados.length; i++) {
    const r = resultados[i]
    const secao = SECOES[i].secao
    if (r.status === 'fulfilled') {
      contagem[secao] = r.value.length
      todas.push(...r.value)
    } else {
      console.warn(`DOU ${secao} erro: ${r.reason instanceof Error ? r.reason.message : r.reason}`)
    }
  }

  console.log(`DOU: ${todas.length} itens (S1:${contagem.do1} S2:${contagem.do2} S3:${contagem.do3})`)
  return todas
}

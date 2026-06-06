import { LicitacaoRaw } from './types'

// BEC/SP — Bolsa Eletrônica de Compras do Estado de São Paulo
// Maior portal de compras do estado de SP, alto volume de editais municipais
const BASE_URL = 'https://www.bec.sp.gov.br'

function formatarDataBR(iso: string): string {
  // yyyy-MM-dd → dd/MM/yyyy
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

interface BecItem {
  NumeroPregao?: string
  NumeroOcorrencia?: string
  NomeOrgao?: string
  Objeto?: string
  ValorEstimado?: number | string
  DataAbertura?: string
  Municipio?: string
  LinkEdital?: string
  LinkOcorrencia?: string
}

export async function coletarBECSP(dataInicio: string): Promise<LicitacaoRaw[]> {
  const licitacoes: LicitacaoRaw[] = []

  try {
    const dtBR = formatarDataBR(dataInicio)

    // Endpoint REST do BEC/SP
    const url = `${BASE_URL}/SIGEO/Services/REST/OcorrenciasLicitacoes.aspx?tpDocumento=2&DtInicio=${dtBR}&DtFim=${dtBR}`

    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json, text/xml, */*',
        'User-Agent': 'Mozilla/5.0 (compatible; MonitorLicitacoes/1.0)',
      },
      next: { revalidate: 0 },
    } as RequestInit)

    if (!res.ok) {
      console.warn(`BEC/SP: HTTP ${res.status}`)
      return licitacoes
    }

    const contentType = res.headers.get('content-type') ?? ''
    let itens: BecItem[] = []

    if (contentType.includes('json')) {
      const json = await res.json()
      itens = json.OcorrenciasLicitacoes ?? json.data ?? json ?? []
    } else {
      // Resposta XML — parse básico sem dependência externa
      const texto = await res.text()
      const matches = texto.matchAll(/<Ocorrencia[^>]*>([\s\S]*?)<\/Ocorrencia>/g)
      for (const m of matches) {
        const bloco = m[1]
        const get = (tag: string) =>
          bloco.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`))?.[1]?.trim() ?? ''
        itens.push({
          NumeroPregao:    get('NumeroPregao') || get('NumeroLicitacao'),
          NumeroOcorrencia: get('NumeroOcorrencia'),
          NomeOrgao:       get('NomeOrgao') || get('Orgao'),
          Objeto:          get('Objeto') || get('DescricaoObjeto'),
          ValorEstimado:   Number(get('ValorEstimado')) || undefined,
          DataAbertura:    get('DataAbertura'),
          Municipio:       get('Municipio') || get('NomeMunicipio'),
          LinkEdital:      get('LinkEdital') || get('Link'),
        })
      }
    }

    if (!Array.isArray(itens)) return licitacoes

    for (const item of itens) {
      const numero = item.NumeroPregao ?? item.NumeroOcorrencia ?? ''
      const orgao  = item.NomeOrgao ?? ''
      const objeto = item.Objeto ?? ''
      if (!objeto) continue

      // Converter data BR para ISO se necessário
      let dataAbertura: string | undefined
      if (item.DataAbertura) {
        const partes = item.DataAbertura.split('/')
        if (partes.length === 3) {
          dataAbertura = `${partes[2]}-${partes[1]}-${partes[0]}`
        } else {
          dataAbertura = item.DataAbertura.substring(0, 10)
        }
      }

      const valor = typeof item.ValorEstimado === 'string'
        ? parseFloat(item.ValorEstimado.replace(',', '.'))
        : item.ValorEstimado

      licitacoes.push({
        fonte:          'BEC/SP',
        numero_edital:  `BECSP-${numero || Math.random().toString(36).slice(2)}`,
        orgao:          orgao || 'Órgão SP',
        objeto,
        valor_estimado: isNaN(valor as number) ? undefined : valor,
        data_abertura:  dataAbertura,
        url:            item.LinkEdital ?? item.LinkOcorrencia ?? `${BASE_URL}/netcore/plugin/consultas/ocorrenciasLicitacoes.aspx`,
        estado:         'SP',
        cidade:         item.Municipio,
      })
    }

    console.log(`BEC/SP: ${licitacoes.length} licitações coletadas`)
  } catch (err) {
    console.error('BEC/SP erro:', err)
  }

  return licitacoes
}

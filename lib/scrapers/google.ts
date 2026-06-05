import { LicitacaoRaw } from './types'

const API_KEY = process.env.GOOGLE_SEARCH_API_KEY!
const SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID!
const BASE_URL = 'https://www.googleapis.com/customsearch/v1'

interface GoogleSearchItem {
  title: string
  link: string
  snippet: string
  displayLink: string
}

// Agrupa keywords em lotes para economizar queries
function agruparKeywords(keywords: string[], tamanhoLote = 5): string[][] {
  const grupos: string[][] = []
  for (let i = 0; i < keywords.length; i += tamanhoLote) {
    grupos.push(keywords.slice(i, i + tamanhoLote))
  }
  return grupos
}

// Extrai estado da URL ou snippet
function extrairEstado(url: string, snippet: string): string | undefined {
  const estados = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']
  const texto = (url + ' ' + snippet).toUpperCase()
  return estados.find(uf => texto.includes(`.${uf}.GOV`) || texto.includes(`/${uf}/`) || texto.includes(`-${uf}-`))
}

// Verifica se o resultado parece ser uma licitação real
function eLicitacao(item: GoogleSearchItem): boolean {
  const texto = (item.title + ' ' + item.snippet).toLowerCase()
  const palavrasChave = ['licitação', 'licitacao', 'pregão', 'pregao', 'edital', 'concorrência', 'concorrencia', 'tomada de preços', 'dispensa', 'inexigibilidade', 'compras']
  return palavrasChave.some(p => texto.includes(p))
}

export async function coletarGoogle(keywords: string[]): Promise<LicitacaoRaw[]> {
  if (!API_KEY || !SEARCH_ENGINE_ID) {
    console.warn('Google Search: API Key ou Search Engine ID não configurados')
    return []
  }

  const licitacoes: LicitacaoRaw[] = []
  const vistos = new Set<string>()

  // Agrupar keywords em lotes de 5 para economizar queries
  const grupos = agruparKeywords(keywords, 5)

  // Limitar a 15 grupos para não ultrapassar 100 queries/dia
  const gruposParaBuscar = grupos.slice(0, 15)

  for (const grupo of gruposParaBuscar) {
    const termosOR = grupo.map(k => `"${k}"`).join(' OR ')
    const query = `licitação OR pregão OR edital (${termosOR})`

    try {
      const url = `${BASE_URL}?key=${API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}&num=10&lr=lang_pt`

      const res = await fetch(url, { next: { revalidate: 0 } })

      if (!res.ok) {
        console.error(`Google Search erro ${res.status} para query: ${query}`)
        continue
      }

      const json = await res.json()
      const itens: GoogleSearchItem[] = json.items ?? []

      for (const item of itens) {
        // Pular se não parece licitação
        if (!eLicitacao(item)) continue

        // Pular duplicatas por URL
        if (vistos.has(item.link)) continue
        vistos.add(item.link)

        const estado = extrairEstado(item.link, item.snippet)

        licitacoes.push({
          fonte: 'Google',
          numero_edital: `GOOGLE-${Buffer.from(item.link).toString('base64').substring(0, 20)}`,
          orgao: item.displayLink,
          objeto: item.title + (item.snippet ? ` — ${item.snippet}` : ''),
          url: item.link,
          estado,
        })
      }

      // Respeitar rate limit
      await new Promise(r => setTimeout(r, 200))

    } catch (err) {
      console.error('Google Search erro:', err)
    }
  }

  return licitacoes
}

import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

export interface MatchResult {
  licitacao_id: string
  keyword_ids: string[]
}

export async function encontrarMatches(
  licitacoes: { id: string; objeto: string }[],
  keywords: { id: string; termo: string }[]
): Promise<MatchResult[]> {
  if (licitacoes.length === 0 || keywords.length === 0) return []

  const resultados: MatchResult[] = []
  const termosTexto = keywords.map(k => `"${k.termo}"`).join(', ')

  // Processar em lotes de 10 licitações para não exceder o contexto
  for (let i = 0; i < licitacoes.length; i += 10) {
    const lote = licitacoes.slice(i, i + 10)

    const prompt = `
Analise cada licitação abaixo e identifique quais palavras-chave têm relação semântica com o objeto da licitação.
Considere sinônimos, categorias relacionadas e contexto. Seja criterioso — só marque como match se houver relação real.

Palavras-chave: ${termosTexto}

Licitações:
${lote.map((l, idx) => `[${idx}] ${l.objeto}`).join('\n')}

Responda APENAS com JSON no formato:
[{"index": 0, "keywords": ["termo1", "termo2"]}, {"index": 1, "keywords": []}, ...]

Inclua todas as licitações mesmo sem match (keywords vazio).
`

    try {
      const resultado = await model.generateContent(prompt)
      const texto = resultado.response.text()

      // Extrair JSON da resposta
      const jsonMatch = texto.match(/\[[\s\S]*\]/)
      if (!jsonMatch) continue

      const matches: { index: number; keywords: string[] }[] = JSON.parse(jsonMatch[0])

      for (const match of matches) {
        const licitacao = lote[match.index]
        if (!licitacao || match.keywords.length === 0) continue

        const keywordIds = match.keywords
          .map(termo => keywords.find(k => k.termo === termo)?.id)
          .filter(Boolean) as string[]

        if (keywordIds.length > 0) {
          resultados.push({ licitacao_id: licitacao.id, keyword_ids: keywordIds })
        }
      }
    } catch (err) {
      console.error('Erro no matching Gemini:', err)
    }

    // Respeitar rate limit
    await new Promise(r => setTimeout(r, 500))
  }

  return resultados
}

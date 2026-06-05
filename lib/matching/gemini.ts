import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

export interface MatchResult {
  licitacao_id: string
  keyword_ids: string[]
}

export interface MatchResponse {
  resultados: MatchResult[]
  erros: string[]
  lotes: number
  lotesComErro: number
}

export async function encontrarMatchesDetalhado(
  licitacoes: { id: string; objeto: string }[],
  keywords: { id: string; termo: string }[]
): Promise<MatchResponse> {
  if (licitacoes.length === 0 || keywords.length === 0) {
    return { resultados: [], erros: [], lotes: 0, lotesComErro: 0 }
  }

  const resultados: MatchResult[] = []
  const erros: string[] = []
  const termosTexto = keywords.map(k => `"${k.termo}"`).join(', ')

  for (let i = 0; i < licitacoes.length; i += 10) {
    const lote = licitacoes.slice(i, i + 10)

    const prompt = `Você é um especialista em licitações públicas brasileiras. Analise cada licitação e identifique quais palavras-chave correspondem ao que está sendo COMPRADO/ADQUIRIDO pela licitação.

REGRA PRINCIPAL: A palavra-chave deve ser o OBJETO PRINCIPAL da compra — o item que o órgão público quer adquirir ou contratar.

INCLUA quando:
- O órgão está comprando/adquirindo o produto diretamente (ex: "aquisição de ar condicionado", "compra de bebedouros")
- Registro de preços para fornecimento do produto
- Locação do equipamento

EXCLUA quando:
- O produto aparece apenas como ferramenta de um SERVIÇO (ex: "prestação de serviço de TI que utiliza videomonitoramento", "manutenção de sistema que usa catracas")
- O objeto principal é um serviço de engenharia, TI, limpeza, vigilância, consultoria etc.
- O produto é apenas mencionado no contexto, mas não é o que está sendo comprado

Palavras-chave: ${termosTexto}

Licitações:
${lote.map((l, idx) => `[${idx}] ${l.objeto}`).join('\n')}

Responda APENAS com JSON válido (sem markdown, sem explicações):
[{"index": 0, "keywords": ["termo1"]}, {"index": 1, "keywords": []}, ...]`

    try {
      const resultado = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 1024,
          // @ts-expect-error - thinkingConfig é suportado no gemini-2.5-flash mas não está nos tipos ainda
          thinkingConfig: { thinkingBudget: 0 },
        },
      })
      const texto = resultado.response.text()
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
      const msg = err instanceof Error ? err.message : String(err)
      erros.push(msg)
      console.error(`Gemini lote ${i / 10 + 1} erro:`, msg)
    }

    await new Promise(r => setTimeout(r, 100))
  }

  const lotes = Math.ceil(licitacoes.length / 10)
  console.log(`Gemini concluído: ${lotes} lotes, ${erros.length} erros, ${resultados.length} matches`)
  return { resultados, erros, lotes, lotesComErro: erros.length }
}

// Alias para compatibilidade
export const encontrarMatches = async (
  licitacoes: { id: string; objeto: string }[],
  keywords: { id: string; termo: string }[]
): Promise<MatchResult[]> => {
  const { resultados } = await encontrarMatchesDetalhado(licitacoes, keywords)
  return resultados
}

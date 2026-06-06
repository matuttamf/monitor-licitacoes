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

    const prompt = `Você é um especialista em licitações públicas brasileiras. Analise cada licitação e identifique quais palavras-chave correspondem ao que está sendo COMPRADO/ADQUIRIDO diretamente pela licitação.

REGRA PRINCIPAL: A palavra-chave deve ser o OBJETO PRINCIPAL e ESPECÍFICO da compra. Quando há dúvida, retorne keywords vazia [].

INCLUA apenas quando:
- O órgão está comprando/adquirindo o produto diretamente (ex: "aquisição de bebedouros", "compra de notebooks")
- SRP (Registro de preços) para FORNECIMENTO do produto específico (ex: "SRP para fornecimento de ar condicionado")
- Locação do equipamento específico (ex: "locação de geradores")

EXCLUA obrigatoriamente quando:
- O objeto começa ou é "PRESTAÇÃO DE SERVIÇOS" e o produto aparece apenas como atividade do serviço
  Exemplos a EXCLUIR: "SRP para prestação de serviços de locação, montagem e operação", "prestação de serviços de manutenção", "contratação de empresa para prestação de serviços"
- O objeto principal é serviço de engenharia, limpeza, vigilância, TI, consultoria, operação, manutenção
- SRP genérico para "futura e eventual contratação de empresa na prestação de serviços" — SEMPRE EXCLUIR, mesmo que liste produtos nas atividades
- O produto aparece como instrumento/ferramenta de execução de um serviço
- Obras de construção/reforma onde materiais são citados

EXEMPLOS PRÁTICOS:
✅ INCLUIR: "Aquisição de ar condicionado split 12.000 BTUs" → keyword: "ar condicionado"
✅ INCLUIR: "SRP para fornecimento de bebedouros" → keyword: "bebedouro"
❌ EXCLUIR: "SRP para prestação de serviços de locação, montagem, desmontagem e operação" → keywords: []
❌ EXCLUIR: "Contratação de empresa para prestação de serviços de manutenção" → keywords: []
❌ EXCLUIR: "Serviços de limpeza e conservação" → keywords: []

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

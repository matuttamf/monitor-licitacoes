import { GoogleGenerativeAI } from '@google/generative-ai'
import { trackGemini } from '@/lib/uso-apis'

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

  for (let i = 0; i < licitacoes.length; i += 50) {
    const lote = licitacoes.slice(i, i + 50)

    const prompt = `Você é um especialista em licitações públicas brasileiras. Analise cada licitação e identifique quais palavras-chave correspondem ao TEMA PRINCIPAL do que está sendo contratado.

REGRA CENTRAL: A palavra-chave deve ser o tema CENTRAL e ESPECÍFICO do objeto — seja um produto sendo comprado OU um serviço sendo contratado diretamente. Quando há dúvida, retorne [].

✅ INCLUA quando a palavra-chave É o tema central:
- Compra/aquisição direta: "aquisição de notebooks" → keyword: "notebook"
- SRP para fornecimento específico: "SRP para fornecimento de bebedouros" → keyword: "bebedouro"
- Serviço específico sendo contratado: "prestação de serviços de limpeza" → keyword: "limpeza" (válido para empresa de limpeza)
- Locação do equipamento específico: "locação de geradores" → keyword: "gerador"

❌ EXCLUA quando a palavra-chave aparece apenas como ATIVIDADE SECUNDÁRIA ou INSTRUMENTO de outro serviço:
- A keyword lista atividades genéricas dentro de um serviço amplo: "SRP para prestação de serviços de locação, montagem, desmontagem e operação de tendas" — aqui "locação" e "montagem" são atividades do serviço, não o objeto específico
- O objeto é genérico demais: "contratação de empresa para prestação de serviços diversos"
- A keyword aparece como meio para realizar outro fim: "manutenção de sistema que usa câmeras" (câmera não é o objeto)
- Obras de construção onde materiais são mencionados como insumo

DISTINÇÃO CHAVE — mesmo verbo, contexto diferente:
✅ "Serviços de limpeza predial" → keyword "limpeza" é o tema central → INCLUIR
❌ "SRP para locação, montagem, desmontagem, operação e manutenção de estruturas" → "locação" e "montagem" são atividades do serviço, não o objeto → EXCLUIR

Palavras-chave: ${termosTexto}

Licitações:
${lote.map((l, idx) => `[${idx}] ${l.objeto}`).join('\n')}

Responda APENAS com JSON válido (sem markdown, sem explicações):
[{"index": 0, "keywords": ["termo1"]}, {"index": 1, "keywords": []}, ...]`

    try {
      trackGemini() // contabiliza chamadas mensais ao Gemini
      const resultado = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 4096,
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

        // filter (não find) — múltiplos usuários podem ter o mesmo termo
        const keywordIds = match.keywords
          .flatMap(termo => keywords.filter(k => k.termo === termo).map(k => k.id))
          .filter(Boolean) as string[]

        if (keywordIds.length > 0) {
          resultados.push({ licitacao_id: licitacao.id, keyword_ids: keywordIds })
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      erros.push(msg)
      console.error(`Gemini lote ${Math.floor(i / 50) + 1} erro:`, msg)
    }

    await new Promise(r => setTimeout(r, 100))
  }

  const lotes = Math.ceil(licitacoes.length / 50)
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

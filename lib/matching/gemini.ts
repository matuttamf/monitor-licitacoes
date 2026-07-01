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
  keywords: { id: string; termo: string }[],
  opts?: { timeLimitMs?: number }
): Promise<MatchResponse> {
  if (licitacoes.length === 0 || keywords.length === 0) {
    return { resultados: [], erros: [], lotes: 0, lotesComErro: 0 }
  }

  const inicio = Date.now()
  // Para antes do timeout do Vercel: 840s (14min) por padrão, ou valor customizado
  const limiteMs = opts?.timeLimitMs ?? 840_000

  const resultados: MatchResult[] = []
  const erros: string[] = []
  // Deduplica termos — N usuários podem ter o mesmo termo; o prompt usa só únicos
  const termosUnicos = [...new Set(keywords.map(k => k.termo))]
  const termosTexto  = termosUnicos.map(t => `"${t}"`).join(', ')

  for (let i = 0; i < licitacoes.length; i += 50) {
    if (Date.now() - inicio > limiteMs) {
      console.warn(`[gemini] tempo limite atingido após ${Math.round((Date.now() - inicio) / 1000)}s — ${i} de ${licitacoes.length} licitações processadas`)
      break
    }
    const lote = licitacoes.slice(i, i + 50)

    const prompt = `Você é um especialista em licitações públicas brasileiras. Analise cada licitação e identifique quais palavras-chave correspondem ao TEMA PRINCIPAL do que está sendo contratado.

REGRA CENTRAL: A palavra-chave deve ser o tema CENTRAL e ESPECÍFICO do objeto. Só inclua se a conexão for DIRETA e ÓBVIA — sem inferências, sem relações indiretas. Na dúvida, retorne [].

✅ INCLUA apenas quando a keyword É literalmente o produto/serviço contratado:
- "aquisição de notebooks" → keyword "notebook" ✅
- "prestação de serviços de limpeza predial" → keyword "limpeza" ✅
- "contratação de assessoria de imprensa" → keyword "assessoria de imprensa" ✅
- "produção de vídeo institucional" → keyword "produção audiovisual e multimídia" ✅
- "serviços de campanha publicitária" → keyword "campanha publicitária" ✅

❌ EXCLUA em todos esses casos — sem exceção:
- O objeto é de área completamente diferente da keyword: "aquisição de medicamentos" ≠ "produção audiovisual", "fornecimento de fardamentos" ≠ "jornalismo", "construção de escola" ≠ "campanha publicitária"
- A keyword é citada apenas como instrumento secundário do serviço principal
- O objeto é genérico demais para confirmar a keyword
- Qualquer dúvida sobre a relevância → retorne []

TESTE MENTAL antes de incluir: "Uma empresa especializada em [keyword] seria a contratada para executar esse objeto?" Se não for óbvio que sim → [].

Exemplos de erros a evitar:
❌ "Aquisição de materiais médico-hospitalares" → keyword "monitoramento de mídia" (nenhuma relação)
❌ "Fornecimento de fardamentos" → keyword "assessoria de imprensa" (nenhuma relação)
❌ "Construção de escola" → keyword "campanha publicitária" (nenhuma relação)
❌ "Compra de medicamentos" → keyword "produção audiovisual e multimídia" (nenhuma relação)

Palavras-chave disponíveis: ${termosTexto}

Licitações:
${lote.map((l, idx) => `[${idx}] ${l.objeto}`).join('\n')}

Responda APENAS com JSON válido (sem markdown, sem explicações):
[{"index": 0, "keywords": ["termo1"]}, {"index": 1, "keywords": []}, ...]`

    // Retry com backoff para 503 (high demand) e 429 (rate limit)
    let texto = ''
    try {
      for (let tentativa = 0; tentativa < 3; tentativa++) {
        try {
          if (tentativa > 0) await new Promise(r => setTimeout(r, tentativa * 3000))
          trackGemini()
          const resultado = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 8192,
            },
          })
          texto = resultado.response.text()
          break
        } catch (retryErr) {
          const msg = retryErr instanceof Error ? retryErr.message : String(retryErr)
          const retravel = msg.includes('503') || msg.includes('429') || msg.includes('overloaded')
          if (!retravel || tentativa === 2) throw retryErr
          console.warn(`Gemini lote tentativa ${tentativa + 1} falhou (${msg.substring(0, 60)}), retentando...`)
        }
      }
    } catch (apiErr) {
      const msg = apiErr instanceof Error ? apiErr.message : String(apiErr)
      erros.push(msg)
      console.error(`Gemini lote ${Math.floor(i / 50) + 1} API erro (pulando):`, msg.substring(0, 120))
      continue
    }

    try {
      const textoLimpo = texto
        .replace(/^```(?:json)?\s*/u, '').replace(/\s*```$/u, '').trim()
        // Normaliza aspas tipograficas que Gemini as vezes usa (U+2018/19 e U+201C/D)
        .replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
        // Remove caracteres de controle (exceto tab/newline)
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ‘’)
      const jsonMatch = textoLimpo.match(/\[[\s\S]*\]/)
      if (!jsonMatch) continue

      // Gemini às vezes inclui \n literal dentro de valores string (JSON inválido).
      // Substitui por espaço e remove trailing commas antes de parsear.
      const jsonStr = jsonMatch[0]
        .replace(/\r\n/g, ‘ ‘)
        .replace(/[\r\n]/g, ‘ ‘)
        .replace(/,\s*([\]}])/g, ‘$1’)

      const matches: { index: number; keywords: string[] }[] = JSON.parse(jsonStr)

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

/** Sugere keywords adicionais com base nos termos que o usuário já tem configurados. */
export async function sugerirKeywordsSimilares(termos: string[], quantidade = 8): Promise<string[]> {
  if (!termos.length) return []

  const prompt = `Você é especialista em licitações públicas brasileiras.

Um usuário do sistema de monitoramento de licitações já configurou estas palavras-chave:
${termos.map(t => `- ${t}`).join('\n')}

Sugira exatamente ${quantidade} palavras-chave ADICIONAIS que esse usuário deveria monitorar para encontrar mais oportunidades relacionadas ao mesmo segmento de negócio.

Regras:
- Não repita nenhuma das palavras já listadas
- Cada sugestão deve ser um termo específico que aparece em editais (2 a 4 palavras no máximo)
- Priorize termos que aparecem com frequência em licitações públicas brasileiras
- Mantenha coerência com o segmento indicado pelas palavras existentes

Responda APENAS com JSON válido (sem markdown, sem explicações):
["termo 1", "termo 2", ...]`

  try {
    trackGemini()
    const resultado = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 512,
        // @ts-expect-error - thinkingConfig é suportado no gemini-2.5-flash mas não está nos tipos ainda
        thinkingConfig: { thinkingBudget: 0 },
      },
    })
    const texto = resultado.response.text()
    const limpo = texto.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
    const match = limpo.match(/\[[\s\S]*\]/)
    if (!match) return []
    const sugestoes: unknown = JSON.parse(match[0])
    if (!Array.isArray(sugestoes)) return []
    return (sugestoes as unknown[])
      .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
      .slice(0, quantidade)
  } catch (err) {
    console.error('sugerirKeywordsSimilares erro:', err instanceof Error ? err.message : err)
    return []
  }
}

// Alias para compatibilidade
export const encontrarMatches = async (
  licitacoes: { id: string; objeto: string }[],
  keywords: { id: string; termo: string }[]
): Promise<MatchResult[]> => {
  const { resultados } = await encontrarMatchesDetalhado(licitacoes, keywords)
  return resultados
}

/**
 * Motor de score de relevância — FERRAMENTA INTERNA
 * Nunca exibido ao usuário em nenhuma interface.
 *
 * Score final = keyword×0.60 + localização×0.25 + valor×0.15  (0–100)
 */

// ─── Constantes de limiar ──────────────────────────────────────────────────

/** Score mínimo para enviar por e-mail */
export const SCORE_MIN_EMAIL = 50

/** Score mínimo para enviar por WhatsApp e Telegram (alta relevância) */
export const SCORE_MIN_URGENTE = 80

/** Máximo de licitações por lote de e-mail */
export const MAX_POR_EMAIL = 15

import {
  ESTADOS_POR_REGIAO,
  ADJACENCIAS,
  regiaoDeUF,
  estadoCompativelComRegioes,
} from '@/lib/regioes'

// ─── Score de KEYWORD (60%) ───────────────────────────────────────────────

/**
 * Gemini já confirmou que há match semântico.
 * Diferenciamos exato vs. parcial via busca textual simples.
 */
export function scoreKeyword(objeto: string, termo: string): number {
  const obj  = objeto.toLowerCase()
  const term = termo.toLowerCase()

  // Correspondência exata da palavra inteira (word boundary simulado)
  const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`)
  if (regex.test(obj)) return 100

  // Termo aparece como substring
  if (obj.includes(term)) return 85

  // Todas as palavras do termo aparecem (ex: "notebook corporativo" → "aquisição de notebooks corporativos")
  const palavras = term.split(/\s+/)
  if (palavras.length > 1 && palavras.every(p => obj.includes(p))) return 70

  // Gemini confirmou mas não achou textualmente → match semântico/sinônimo
  return 55
}

// ─── Score de LOCALIZAÇÃO (25%) ──────────────────────────────────────────

/**
 * Aceita array de regiões/UFs.
 * Pontua com base na melhor correspondência dentre as regiões selecionadas.
 */
export function scoreLocalizacao(
  estadoLicitacao: string | null | undefined,
  regioesKeyword: string[] | string | null | undefined,
): number {
  // Normaliza para array
  const regioes: string[] = !regioesKeyword
    ? ['brasil']
    : Array.isArray(regioesKeyword)
      ? regioesKeyword
      : [regioesKeyword]

  // Sem filtro → neutro positivo
  if (regioes.length === 0 || regioes.includes('brasil')) return 80

  // Licitação sem estado → não penaliza
  if (!estadoLicitacao) return 70

  const uf = estadoLicitacao.toUpperCase().trim()

  let melhorScore = 0

  for (const r of regioes) {
    const estados = ESTADOS_POR_REGIAO[r]

    if (estados) {
      // É uma grande região
      if (estados.includes(uf)) { melhorScore = Math.max(melhorScore, 100); break }

      // UF em região adjacente?
      const regiaoUF = regiaoDeUF(uf)
      if (regiaoUF && ADJACENCIAS[r]?.includes(regiaoUF)) {
        melhorScore = Math.max(melhorScore, 50)
      } else {
        melhorScore = Math.max(melhorScore, 15)
      }
    } else {
      // É uma UF específica
      melhorScore = Math.max(melhorScore, uf === r.toUpperCase() ? 100 : 15)
    }
  }

  return melhorScore || 15
}

// ─── Score de VALOR (15%) ─────────────────────────────────────────────────

/**
 * Retorna -1 se a licitação deve ser EXCLUÍDA por ultrapassar o máximo.
 * Caso contrário retorna score 0–100.
 */
export function scoreValor(
  valorLicitacao: number | null | undefined,
  minValorInteresse: number,
  maxValorInteresse: number = 0,
): number {
  // Filtro hard de máximo — retorna -1 para sinalizar exclusão
  if (maxValorInteresse > 0 && valorLicitacao != null && valorLicitacao > 0) {
    if (valorLicitacao > maxValorInteresse) return -1
  }

  // Usuário não definiu mínimo → neutro positivo
  if (!minValorInteresse || minValorInteresse <= 0) return 75

  // Licitação sem valor informado → neutro
  if (!valorLicitacao || valorLicitacao <= 0) return 50

  const ratio = valorLicitacao / minValorInteresse

  if (ratio >= 10)  return 100  // ≥10× o mínimo
  if (ratio >= 5)   return 95
  if (ratio >= 2)   return 85
  if (ratio >= 1)   return 70   // exatamente no mínimo
  if (ratio >= 0.5) return 35   // metade do mínimo
  return 15                      // muito abaixo
}

// ─── Score FINAL ──────────────────────────────────────────────────────────

export interface ScoreResult {
  score:         number  // 0–100 arredondado
  score_keyword: number
  score_local:   number
  score_valor:   number
}

export function calcularScore(params: {
  objeto:            string
  termo:             string
  estadoLicitacao:   string | null | undefined
  regiaoKeyword:     string[] | string | null | undefined
  valorLicitacao:    number | null | undefined
  minValorInteresse: number
  maxValorInteresse?: number
}): ScoreResult | null {
  const sk = scoreKeyword(params.objeto, params.termo)
  const sl = scoreLocalizacao(params.estadoLicitacao, params.regiaoKeyword)
  const sv = scoreValor(params.valorLicitacao, params.minValorInteresse, params.maxValorInteresse ?? 0)

  // Valor acima do máximo definido → descarta completamente
  if (sv === -1) return null

  const total = Math.round(sk * 0.60 + sl * 0.25 + sv * 0.15)

  return {
    score:         Math.min(100, Math.max(0, total)),
    score_keyword: sk,
    score_local:   sl,
    score_valor:   sv,
  }
}

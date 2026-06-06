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

// ─── Mapa região → estados ────────────────────────────────────────────────

const ESTADOS_REGIAO: Record<string, string[]> = {
  norte:        ['AC', 'AM', 'AP', 'PA', 'RO', 'RR', 'TO'],
  nordeste:     ['AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE'],
  sudeste:      ['ES', 'MG', 'RJ', 'SP'],
  sul:          ['PR', 'RS', 'SC'],
  centro_oeste: ['DF', 'GO', 'MS', 'MT'],
}

/** Regiões adjacentes (compartilham fronteira relevante) */
const ADJACENCIAS: Record<string, string[]> = {
  norte:        ['nordeste', 'centro_oeste'],
  nordeste:     ['norte', 'sudeste', 'centro_oeste'],
  sudeste:      ['nordeste', 'sul', 'centro_oeste'],
  sul:          ['sudeste', 'centro_oeste'],
  centro_oeste: ['norte', 'nordeste', 'sudeste', 'sul'],
}

function regiaoDeUF(uf: string): string | null {
  const u = uf.toUpperCase()
  for (const [regiao, estados] of Object.entries(ESTADOS_REGIAO)) {
    if (estados.includes(u)) return regiao
  }
  return null
}

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

export function scoreLocalizacao(
  estadoLicitacao: string | null | undefined,
  regiaoKeyword: string | null | undefined,
): number {
  // Sem filtro de região → neutro positivo (não penaliza)
  if (!regiaoKeyword || regiaoKeyword === 'brasil') return 80

  // Licitação sem estado definido → não penaliza
  if (!estadoLicitacao) return 70

  const uf     = estadoLicitacao.toUpperCase().trim()
  const regKw  = regiaoKeyword.toLowerCase()

  // Keyword é uma UF específica
  if (uf.length === 2 && !ESTADOS_REGIAO[regKw]) {
    return uf === regKw.toUpperCase() ? 100 : 15
  }

  // Keyword é uma grande região
  const estadosDaRegiao = ESTADOS_REGIAO[regKw]
  if (!estadosDaRegiao) return 70 // valor desconhecido → neutro

  // UF está na região exata
  if (estadosDaRegiao.includes(uf)) return 100

  // UF está em região adjacente
  const regiaoUF = regiaoDeUF(uf)
  if (regiaoUF && ADJACENCIAS[regKw]?.includes(regiaoUF)) return 50

  // Fora da região — não bloqueia, mas pontua baixo
  return 15
}

// ─── Score de VALOR (15%) ─────────────────────────────────────────────────

export function scoreValor(
  valorLicitacao: number | null | undefined,
  minValorInteresse: number,
): number {
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
  regiaoKeyword:     string | null | undefined
  valorLicitacao:    number | null | undefined
  minValorInteresse: number
}): ScoreResult {
  const sk = scoreKeyword(params.objeto, params.termo)
  const sl = scoreLocalizacao(params.estadoLicitacao, params.regiaoKeyword)
  const sv = scoreValor(params.valorLicitacao, params.minValorInteresse)

  const total = Math.round(sk * 0.60 + sl * 0.25 + sv * 0.15)

  return {
    score:         Math.min(100, Math.max(0, total)),
    score_keyword: sk,
    score_local:   sl,
    score_valor:   sv,
  }
}

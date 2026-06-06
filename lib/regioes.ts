/**
 * Constantes e utilitários de regiões brasileiras.
 * Compartilhado entre frontend (palavras-chave, alertas) e backend (matching, scoring).
 */

// ─── Definição das regiões ────────────────────────────────────────────────

export const ESTADOS_POR_REGIAO: Record<string, string[]> = {
  norte:        ['AC', 'AM', 'AP', 'PA', 'RO', 'RR', 'TO'],
  nordeste:     ['AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE'],
  sudeste:      ['ES', 'MG', 'RJ', 'SP'],
  sul:          ['PR', 'RS', 'SC'],
  centro_oeste: ['DF', 'GO', 'MS', 'MT'],
}

export const TODAS_UFS: string[] = Object.values(ESTADOS_POR_REGIAO).flat()

/** Regiões adjacentes (para scoring de proximidade) */
export const ADJACENCIAS: Record<string, string[]> = {
  norte:        ['nordeste', 'centro_oeste'],
  nordeste:     ['norte', 'sudeste', 'centro_oeste'],
  sudeste:      ['nordeste', 'sul', 'centro_oeste'],
  sul:          ['sudeste', 'centro_oeste'],
  centro_oeste: ['norte', 'nordeste', 'sudeste', 'sul'],
}

/** Rótulos para exibição */
export const LABEL_REGIAO: Record<string, string> = {
  brasil:       'Brasil',
  norte:        'Norte',
  nordeste:     'Nordeste',
  sudeste:      'Sudeste',
  sul:          'Sul',
  centro_oeste: 'Centro-Oeste',
}

/** Estados do filtro — sigla para nome curto */
export const NOME_UF: Record<string, string> = {
  AC: 'Acre', AL: 'Alagoas', AP: 'Amapá', AM: 'Amazonas', BA: 'Bahia',
  CE: 'Ceará', DF: 'Distrito Federal', ES: 'Espírito Santo', GO: 'Goiás',
  MA: 'Maranhão', MT: 'Mato Grosso', MS: 'Mato Grosso do Sul',
  MG: 'Minas Gerais', PA: 'Pará', PB: 'Paraíba', PR: 'Paraná',
  PE: 'Pernambuco', PI: 'Piauí', RJ: 'Rio de Janeiro',
  RN: 'Rio Grande do Norte', RS: 'Rio Grande do Sul', RO: 'Rondônia',
  RR: 'Roraima', SC: 'Santa Catarina', SP: 'São Paulo', SE: 'Sergipe',
  TO: 'Tocantins',
}

// ─── Utilitários ──────────────────────────────────────────────────────────

/** labelSelecao sem emoji */
export function labelSelecao(s: string): string {
  if (s === 'brasil') return '🌎 Brasil'
  if (LABEL_REGIAO[s]) return LABEL_REGIAO[s]
  return s.toUpperCase() // UF
}

/** Retorna o nome da grande região de uma UF */
export function regiaoDeUF(uf: string): string | null {
  const u = uf.toUpperCase()
  for (const [regiao, estados] of Object.entries(ESTADOS_POR_REGIAO)) {
    if (estados.includes(u)) return regiao
  }
  return null
}

/** Retorna todos os estados cobertos por uma lista de seleções */
export function estadosCobertos(selecoes: string[]): Set<string> {
  const cobertos = new Set<string>()
  if (selecoes.includes('brasil')) {
    TODAS_UFS.forEach(uf => cobertos.add(uf))
    return cobertos
  }
  for (const s of selecoes) {
    const estados = ESTADOS_POR_REGIAO[s]
    if (estados) estados.forEach(uf => cobertos.add(uf))
    else cobertos.add(s.toUpperCase())
  }
  return cobertos
}

/**
 * Verifica se um item já está coberto pela seleção atual.
 * Regras:
 *  - 'brasil' cobre tudo
 *  - Uma região cobre todos os seus estados
 *  - Uma UF é coberta se estiver numa região já selecionada
 */
export function jaCoberto(item: string, selecoes: string[]): boolean {
  if (selecoes.includes('brasil')) return item !== 'brasil'
  if (item === 'brasil') return false
  if (selecoes.includes(item)) return true

  const cobertos = estadosCobertos(selecoes)

  if (ESTADOS_POR_REGIAO[item]) {
    // É uma região — coberta se TODOS os seus estados já estão cobertos
    return ESTADOS_POR_REGIAO[item].every(uf => cobertos.has(uf))
  }
  // É uma UF
  return cobertos.has(item.toUpperCase())
}

/**
 * Adiciona um item à seleção com resolução de conflitos:
 *  - 'brasil' substitui tudo
 *  - Se já coberto, ignora
 *  - Ao adicionar região, remove UFs individuais que ela cobre
 */
export function adicionarRegiao(item: string, atual: string[]): string[] {
  if (item === 'brasil') return ['brasil']
  if (atual.includes('brasil')) return atual   // brasil explícito = tudo já coberto
  if (jaCoberto(item, atual)) return atual

  // Ao adicionar região mãe, remove UFs já cobertas por ela
  let novas = [...atual]
  if (ESTADOS_POR_REGIAO[item]) {
    const estadosDaRegiao = new Set(ESTADOS_POR_REGIAO[item])
    novas = novas.filter(s => !estadosDaRegiao.has(s.toUpperCase()))
  }

  return [...novas, item]
}

/** Remove um item da seleção; se ficar vazio, volta para ['brasil'] */
export function removerRegiao(item: string, atual: string[]): string[] {
  const novas = atual.filter(s => s !== item)
  return novas.length === 0 ? ['brasil'] : novas
}

export function selecaoEhBrasil(selecoes: string[]): boolean {
  return selecoes.includes('brasil') || selecoes.length === 0
}

/**
 * Verifica se um estado de licitação é compatível com a lista de regiões da keyword.
 * Retorna true se houver qualquer match, ou se o filtro for 'brasil'.
 */
export function estadoCompativelComRegioes(
  estadoLicitacao: string | null | undefined,
  regioes: string[] | null | undefined,
): boolean {
  if (!regioes || regioes.length === 0 || regioes.includes('brasil')) return true
  if (!estadoLicitacao) return true // sem estado = não filtra

  const uf = estadoLicitacao.toUpperCase().trim()

  for (const r of regioes) {
    const estados = ESTADOS_POR_REGIAO[r]
    if (estados) {
      if (estados.includes(uf)) return true
    } else {
      // É uma UF específica
      if (uf === r.toUpperCase()) return true
    }
  }
  return false
}


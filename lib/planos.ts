export interface LimitesPlano {
  maxKeywords: number
  maxUsers: number
  maxKeywordsPerSeat: number
  nome: string
  maxEmailsPorDia: number
  maxItensPorEmail: number
  maxPriceBuscas: number    // buscas de preços vencedores por mês (Basic=20, Pro+=ilimitado)
}

export const LIMITES_PLANO: Record<string, LimitesPlano> = {
  trial:        { maxKeywords: 7,     maxUsers: 1,  maxKeywordsPerSeat: 7,     nome: 'Trial',        maxEmailsPorDia: 5,  maxItensPorEmail: 10, maxPriceBuscas: 5     },
  basic:        { maxKeywords: 20,    maxUsers: 1,  maxKeywordsPerSeat: 20,    nome: 'Basic',        maxEmailsPorDia: 5,  maxItensPorEmail: 10, maxPriceBuscas: 20    },
  profissional: { maxKeywords: 99999, maxUsers: 1,  maxKeywordsPerSeat: 99999, nome: 'Profissional', maxEmailsPorDia: 5,  maxItensPorEmail: 10, maxPriceBuscas: 99999 },
  gestao:       { maxKeywords: 99999, maxUsers: 5,  maxKeywordsPerSeat: 99999, nome: 'Gestão',       maxEmailsPorDia: 5,  maxItensPorEmail: 10, maxPriceBuscas: 99999 },
  empresarial:  { maxKeywords: 99999, maxUsers: 15, maxKeywordsPerSeat: 99999, nome: 'Empresarial',  maxEmailsPorDia: 5,  maxItensPorEmail: 10, maxPriceBuscas: 99999 },
}

export function getLimites(plano: string): LimitesPlano {
  if (plano === 'pro') return { ...LIMITES_PLANO.gestao }  // retrocompatibilidade
  return LIMITES_PLANO[plano] ?? LIMITES_PLANO.basic
}

export function temMultiUsuario(plano: string): boolean {
  return getLimites(plano).maxUsers > 1
}

/** WhatsApp disponível apenas para Profissional, Gestão e Empresarial */
export function temWhatsApp(plano: string): boolean {
  return ['profissional', 'gestao', 'pro', 'empresarial'].includes(plano)
}

/** Radar de Inteligência disponível para Profissional, Gestão e Empresarial */
export function temRadar(plano: string): boolean {
  return ['profissional', 'gestao', 'pro', 'empresarial'].includes(plano)
}

/** Diretório de Fornecedores visível para Profissional, Gestão e Empresarial */
export function temFornecedores(plano: string): boolean {
  return ['profissional', 'gestao', 'pro', 'empresarial'].includes(plano)
}

/** Análise de Preços sem filtros avançados no Basic */
export function temPrecosFiltros(plano: string): boolean {
  return ['profissional', 'gestao', 'pro', 'empresarial'].includes(plano)
}

/** Horários BRT por quantidade de e-mails/dia — devem bater com o cron alertar: 8h,10h,12h,14h,16h */
export const HORARIOS_POR_QTD: Record<number, number[]> = {
  1:  [8],
  2:  [8, 14],
  3:  [8, 12, 16],
  4:  [8, 10, 14, 16],
  5:  [8, 10, 12, 14, 16],
  6:  [8, 10, 12, 14, 16],
  8:  [8, 10, 12, 14, 16],
  10: [8, 10, 12, 14, 16],
}

/** Opções válidas de emails/dia (sem 7 e 9) */
export const OPCOES_EMAILS_DIA = [1, 2, 3, 4, 5, 6, 8, 10]

/** Opções de itens por email */
export const OPCOES_ITENS_EMAIL = [10, 20, 30]

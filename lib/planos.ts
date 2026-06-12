export interface LimitesPlano {
  maxKeywords: number
  maxUsers: number
  nome: string
  maxEmailsPorDia: number   // opções: 1,2,3,4,5,6,8,10 (sem 7 e 9)
  maxItensPorEmail: number  // opções: 10, 20, 30
}

export const LIMITES_PLANO: Record<string, LimitesPlano> = {
  basic:        { maxKeywords: 20,    maxUsers: 1,  nome: 'Basic',        maxEmailsPorDia: 5,  maxItensPorEmail: 10 },
  profissional: { maxKeywords: 99999, maxUsers: 1,  nome: 'Profissional', maxEmailsPorDia: 5, maxItensPorEmail: 10 },
  gestao:       { maxKeywords: 99999, maxUsers: 5,  nome: 'Gestão',       maxEmailsPorDia: 5, maxItensPorEmail: 10 },
  empresarial:  { maxKeywords: 99999, maxUsers: 15, nome: 'Empresarial',  maxEmailsPorDia: 5, maxItensPorEmail: 10 },
}

/** trial = acesso completo por 7 dias (mesmo limite do basic) */
export function getLimites(plano: string): LimitesPlano {
  if (plano === 'trial') return { ...LIMITES_PLANO.basic }
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

/** Horários BRT por quantidade de e-mails/dia (sem 7 e 9) */
export const HORARIOS_POR_QTD: Record<number, number[]> = {
  1:  [8],
  2:  [8, 10],
  3:  [8, 10, 15],
  4:  [8, 10, 13, 15],
  5:  [8, 9, 10, 13, 15],
  6:  [7, 8, 9, 10, 13, 15],
  8:  [7, 8, 9, 10, 11, 13, 14, 15],
  10: [7, 8, 9, 10, 11, 13, 14, 15, 16, 17],
}

/** Opções válidas de emails/dia (sem 7 e 9) */
export const OPCOES_EMAILS_DIA = [1, 2, 3, 4, 5, 6, 8, 10]

/** Opções de itens por email */
export const OPCOES_ITENS_EMAIL = [10, 20, 30]

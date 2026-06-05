export interface LimitesPlano {
  maxKeywords: number
  maxUsers: number
  nome: string
}

export const LIMITES_PLANO: Record<string, LimitesPlano> = {
  basic:        { maxKeywords: 10,    maxUsers: 1,  nome: 'Basic' },
  profissional: { maxKeywords: 99999, maxUsers: 1,  nome: 'Profissional' },
  pro:          { maxKeywords: 99999, maxUsers: 5,  nome: 'Pro' },
  empresarial:  { maxKeywords: 99999, maxUsers: 15, nome: 'Empresarial' },
}

export function getLimites(plano: string): LimitesPlano {
  return LIMITES_PLANO[plano] ?? LIMITES_PLANO.basic
}

export function temMultiUsuario(plano: string): boolean {
  return getLimites(plano).maxUsers > 1
}

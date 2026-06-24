import type { SupabaseClient } from '@supabase/supabase-js'
import { PLANOS } from './mercadopago'

export type Periodo = 'mensal' | 'anual'

export type RegraDesconto = {
  plano: string | null
  periodo: string | null
  desconto_percentual: number
  desconto_meses: number
}

export type ResultadoCupom = {
  valido: boolean
  motivo?: string
  campanhaId?: string
  nome?: string
  comissaoTipo?: string  // 'nenhum' | 'percentual' | 'fixo' — usado para evitar vazar comissão
  percentual: number
  meses: number          // 0 = permanente
  precoOriginal: number
  precoFinal: number
}

/**
 * Escolhe a regra mais específica para (plano, periodo).
 * Precedência: plano+ciclo exato › só plano › só ciclo › geral (null/null).
 */
export function escolherRegra(regras: RegraDesconto[], plano: string, periodo: Periodo): RegraDesconto | null {
  const candidatas = regras.filter(r =>
    (r.plano === null || r.plano === plano) &&
    (r.periodo === null || r.periodo === periodo)
  )
  if (candidatas.length === 0) return null
  const score = (r: RegraDesconto) => (r.plano ? 2 : 0) + (r.periodo ? 1 : 0)
  return [...candidatas].sort((a, b) => score(b) - score(a))[0]
}

function precoBase(plano: string, periodo: Periodo): number {
  const p = PLANOS[plano as keyof typeof PLANOS]
  return periodo === 'anual' ? p.preco_anual : p.preco
}

function aplicar(preco: number, percentual: number): number {
  return Math.round(preco * (1 - percentual / 100) * 100) / 100
}

/**
 * Resolve um código de cupom digitado no checkout para um desconto concreto.
 * Usa um client com service_role (campanhas tem RLS sem acesso público).
 * Se userId for informado, bloqueia reutilização do mesmo cupom pelo mesmo usuário.
 */
export async function resolverCupom(
  admin: SupabaseClient,
  codigo: string,
  plano: string,
  periodo: Periodo,
  userId?: string,
): Promise<ResultadoCupom> {
  const precoOriginal = precoBase(plano, periodo)
  const semDesconto = (motivo: string, campanhaId?: string): ResultadoCupom =>
    ({ valido: false, motivo, percentual: 0, meses: 0, precoOriginal, precoFinal: precoOriginal, campanhaId })

  const codigoNorm = String(codigo).toLowerCase().trim()
  if (!codigoNorm) return semDesconto('Informe um cupom')

  const { data: campanha } = await admin
    .from('campanhas')
    .select('id, nome, ativo, permite_cupom, comissao_tipo')
    .eq('codigo', codigoNorm)
    .maybeSingle()

  if (!campanha || !campanha.ativo) return semDesconto('Cupom inválido ou expirado')
  if (!campanha.permite_cupom)      return semDesconto('Este código não é um cupom de desconto')

  // Bloqueia reutilização: cada usuário pode usar cada cupom apenas uma vez
  if (userId) {
    const { data: usoAnterior } = await admin
      .from('cupom_usos')
      .select('id')
      .eq('profile_id', userId)
      .eq('campanha_id', campanha.id)
      .maybeSingle()
    if (usoAnterior) return semDesconto('Este cupom já foi utilizado por esta conta', campanha.id)
  }

  const { data: regras } = await admin
    .from('campanha_descontos')
    .select('plano, periodo, desconto_percentual, desconto_meses')
    .eq('campanha_id', campanha.id)

  const regra = escolherRegra((regras ?? []) as RegraDesconto[], plano, periodo)
  if (!regra) return semDesconto('Cupom não válido para este plano ou período', campanha.id)

  return {
    valido: true,
    campanhaId: campanha.id,
    nome: campanha.nome,
    comissaoTipo: campanha.comissao_tipo ?? 'nenhum',
    percentual: regra.desconto_percentual,
    meses: regra.desconto_meses,
    precoOriginal,
    precoFinal: aplicar(precoOriginal, regra.desconto_percentual),
  }
}

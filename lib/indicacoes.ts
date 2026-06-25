import type { SupabaseClient } from '@supabase/supabase-js'

// ════════════════════════════════════════════════════════════════════════════
// Programa de Indicações — regras de negócio centralizadas.
// ════════════════════════════════════════════════════════════════════════════

/** Dias de carência antes de liberar a recompensa (amigo não pode cancelar). */
export const CARENCIA_DIAS = 10
/** Dias creditados ao indicador por amigo convertido. */
export const RECOMPENSA_DIAS = 30
/** Desconto concedido ao amigo na primeira assinatura. */
export const DESCONTO_AMIGO_PERCENTUAL = 20
/** Dias de assinatura ativa exigidos para o usuário ficar apto a indicar. */
export const APTO_APOS_DIAS = 10
/** Indicações liberadas que tornam o usuário candidato a afiliado. */
export const LIMIAR_AFILIADO = 10
/** Cookie de atribuição de indicação dura 24h (campanhas duram 30 dias). */
export const COOKIE_INDICA_MAX_AGE = 60 * 60 * 24

/**
 * Gera um código pessoal de 8 caracteres alfanuméricos (a-z0-9), único em todo o
 * sistema de rastreio: não colide com campanhas, vínculos de afiliado nem com
 * outros códigos de indicação. Evita caracteres ambíguos (0/o, 1/l/i) para leitura.
 */
export async function gerarCodigoIndica(admin: SupabaseClient): Promise<string> {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789' // sem 0 o 1 l i
  for (let tentativa = 0; tentativa < 50; tentativa++) {
    let cod = ''
    for (let i = 0; i < 8; i++) cod += chars[Math.floor(Math.random() * chars.length)]

    const [{ data: emProfile }, { data: emCampanha }, { data: emVinculo }] = await Promise.all([
      admin.from('profiles').select('id').eq('indica_codigo', cod).maybeSingle(),
      admin.from('campanhas').select('id').eq('codigo', cod).maybeSingle(),
      admin.from('afiliado_campanhas').select('id').eq('codigo', cod).maybeSingle(),
    ])
    if (!emProfile && !emCampanha && !emVinculo) return cod
  }
  throw new Error('Não foi possível gerar código de indicação único')
}

/** Lê o interruptor global da campanha de indicações. */
export async function indicacoesAtiva(admin: SupabaseClient): Promise<boolean> {
  try {
    const { data } = await admin
      .from('configuracoes')
      .select('valor')
      .eq('chave', 'indicacoes_ativa')
      .maybeSingle()
    return data?.valor === true || data?.valor === 'true'
  } catch {
    return false
  }
}

/**
 * Resolve um código de indicação pessoal (?ref=CODIGO de 8 chars) para o id do
 * indicador. Só retorna se a campanha estiver ativa e o dono estiver apto.
 */
export async function resolverIndicaCodigo(
  admin: SupabaseClient,
  codigo: string,
): Promise<{ indicadorId: string } | null> {
  const cod = String(codigo).trim().toLowerCase()
  if (cod.length !== 8) return null

  const { data } = await admin
    .from('profiles')
    .select('id, indica_apto_em')
    .eq('indica_codigo', cod)
    .maybeSingle()

  if (!data || !data.indica_apto_em) return null
  return { indicadorId: data.id }
}

export type ResultadoFraude = { fraude: boolean; motivo?: string }

/**
 * Antifraude: impede auto-indicação e contas duplicadas/sequenciais.
 * Compara CPF/CNPJ, e-mail, telefone e proximidade de criação das contas.
 * Recebe os dois perfis já carregados (com campos fiscais e de contato).
 */
export function checarFraude(
  indicador: PerfilFraude | null,
  indicado: PerfilFraude | null,
): ResultadoFraude {
  if (!indicador || !indicado) return { fraude: true, motivo: 'perfil ausente' }
  if (indicador.id === indicado.id) return { fraude: true, motivo: 'auto-indicação' }

  const norm = (v: string | null | undefined) =>
    (v ?? '').replace(/\D/g, '').trim() || null
  const normEmail = (v: string | null | undefined) =>
    (v ?? '').toLowerCase().trim() || null

  // Mesmo documento fiscal
  const docA = norm(indicador.cnpj) ?? norm(indicador.cpf)
  const docB = norm(indicado.cnpj)  ?? norm(indicado.cpf)
  if (docA && docB && docA === docB) return { fraude: true, motivo: 'mesmo CPF/CNPJ' }

  // Mesmo telefone (whatsapp ou telefone geral)
  const telA = norm(indicador.whatsapp) ?? norm(indicador.telefone)
  const telB = norm(indicado.whatsapp)  ?? norm(indicado.telefone)
  if (telA && telB && telA === telB) return { fraude: true, motivo: 'mesmo telefone' }

  // Mesmo e-mail (defensivo — improvável, mas barra alias idênticos)
  const emA = normEmail(indicador.email)
  const emB = normEmail(indicado.email)
  if (emA && emB && emA === emB) return { fraude: true, motivo: 'mesmo e-mail' }

  // Contas criadas em sequência (< 10 min entre uma e outra)
  if (indicador.criado_em && indicado.criado_em) {
    const dt = Math.abs(new Date(indicador.criado_em).getTime() - new Date(indicado.criado_em).getTime())
    if (dt < 10 * 60 * 1000) return { fraude: true, motivo: 'contas criadas em sequência' }
  }

  return { fraude: false }
}

export type PerfilFraude = {
  id: string
  cpf?: string | null
  cnpj?: string | null
  whatsapp?: string | null
  telefone?: string | null
  email?: string | null
  criado_em?: string | null
}

/** Colunas necessárias para a checagem antifraude. */
export const COLUNAS_FRAUDE = 'id, cpf, cnpj, whatsapp, telefone, email, criado_em'

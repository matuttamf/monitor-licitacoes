import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { isDominioDescartavel } from '@/lib/dominios-descartaveis'

// Normaliza e-mail para detectar reutilização de trial via alias/pontos
// Gmail: user.name+alias@gmail.com → username@gmail.com
// Outros: apenas remove +alias e normaliza lowercase
export function normalizarEmail(email: string): string {
  const lower = email.toLowerCase().trim()
  const [local, domain] = lower.split('@')
  if (!local || !domain) return lower

  // Remove +alias (universal)
  const semAlias = local.split('+')[0]

  // Remove pontos apenas no Gmail (em outros provedores pontos são significativos)
  const localNorm = domain === 'gmail.com'
    ? semAlias.replace(/\./g, '')
    : semAlias

  return `${localNorm}@${domain}`
}

// Valida CNPJ (algoritmo oficial)
export function validarCNPJ(cnpj: string): boolean {
  const nums = cnpj.replace(/\D/g, '')
  if (nums.length !== 14) return false
  if (/^(\d)\1{13}$/.test(nums)) return false // todos dígitos iguais

  const calc = (s: string, len: number) => {
    let sum = 0, pos = len - 7
    for (let i = len; i >= 1; i--) {
      sum += parseInt(s[len - i]) * pos--
      if (pos < 2) pos = 9
    }
    const r = sum % 11
    return r < 2 ? 0 : 11 - r
  }
  return (
    calc(nums, 12) === parseInt(nums[12]) &&
    calc(nums, 13) === parseInt(nums[13])
  )
}

export async function POST(request: NextRequest) {
  try {
    const { email, cnpj } = await request.json()
    if (!email) return NextResponse.json({ permitido: true })

    // 0. Verificar se cadastros estão bloqueados pelo admin
    const supabaseConfig = await createServiceClient()
    const { data: cfgRow } = await supabaseConfig
      .from('configuracoes')
      .select('valor')
      .eq('chave', 'cadastro_bloqueado')
      .maybeSingle()

    if (cfgRow?.valor === 'true') {
      return NextResponse.json({
        permitido: false,
        motivo: 'cadastro_bloqueado',
        mensagem: 'O cadastro de novos usuários está temporariamente suspenso. Tente novamente em breve.',
      })
    }

    // 1. Bloquear domínios de e-mail descartáveis
    if (isDominioDescartavel(email)) {
      return NextResponse.json({
        permitido: false,
        motivo: 'email_descartavel',
        mensagem: 'E-mails temporários ou descartáveis não são aceitos. Use seu e-mail corporativo ou pessoal permanente.',
      })
    }

    // 2. Validar formato do CNPJ se fornecido
    if (cnpj) {
      const cnpjLimpo = cnpj.replace(/\D/g, '')
      if (cnpjLimpo.length === 14 && !validarCNPJ(cnpj)) {
        return NextResponse.json({
          permitido: false,
          motivo: 'cnpj_invalido',
          mensagem: 'CNPJ inválido. Verifique o número e tente novamente.',
        })
      }
    }

    const emailNorm = normalizarEmail(email)
    const supabase  = await createServiceClient()

    // 3. Verificar se e-mail normalizado já usou trial ou tem conta ativa
    const { data: porEmail } = await supabase
      .from('profiles')
      .select('id, status')
      .eq('email_normalizado', emailNorm)
      .in('status', ['trial', 'active', 'expired'])
      .limit(1)

    if (porEmail && porEmail.length > 0) {
      return NextResponse.json({
        permitido: false,
        motivo: 'trial_usado',
        mensagem: 'Este e-mail já utilizou o período de teste gratuito. Escolha um plano para continuar.',
      })
    }

    // 4. Verificar se CNPJ já tem conta cadastrada
    if (cnpj) {
      const cnpjLimpo = cnpj.replace(/\D/g, '')
      const cnpjFormatado = cnpjLimpo.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')

      const { data: porCNPJ } = await supabase
        .from('profiles')
        .select('id, status')
        .eq('cnpj', cnpjFormatado)
        .in('status', ['trial', 'active', 'expired'])
        .limit(1)

      if (porCNPJ && porCNPJ.length > 0) {
        return NextResponse.json({
          permitido: false,
          motivo: 'cnpj_ja_cadastrado',
          mensagem: 'Este CNPJ já possui uma conta cadastrada. Entre em contato pelo suporte se precisar de ajuda.',
        })
      }
    }

    return NextResponse.json({ permitido: true, emailNormalizado: emailNorm })
  } catch {
    // Em caso de erro, não bloqueamos o cadastro
    return NextResponse.json({ permitido: true })
  }
}

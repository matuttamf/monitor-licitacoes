import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { validarCNPJ } from '@/app/api/auth/verificar-trial/route'
import { isDominioDescartavel } from '@/lib/dominios-descartaveis'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const body = await request.json()
    const {
      cnpj, razao_social, nome_fantasia, ie,
      cep, logradouro, numero, complemento, bairro, cidade, estado_uf,
    } = body

    // Validações
    if (!cnpj || !razao_social || !cep || !logradouro || !numero || !cidade || !estado_uf) {
      return NextResponse.json({ error: 'Campos obrigatórios incompletos.' }, { status: 400 })
    }

    if (!validarCNPJ(cnpj)) {
      return NextResponse.json({ error: 'CNPJ inválido.' }, { status: 400 })
    }

    // Bloquear domínios descartáveis (verificação extra no servidor)
    if (user.email && isDominioDescartavel(user.email)) {
      return NextResponse.json({ error: 'E-mail não permitido.' }, { status: 400 })
    }

    const cnpjLimpo = cnpj.replace(/\D/g, '')
    const cnpjFormatado = cnpjLimpo.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')

    // Verificar se CNPJ já está em uso por outra conta (service client para bypass RLS)
    const service = await createServiceClient()
    const { data: existente } = await service
      .from('profiles')
      .select('id')
      .eq('cnpj', cnpjFormatado)
      .neq('id', user.id)
      .limit(1)

    if (existente && existente.length > 0) {
      return NextResponse.json({
        error: 'Este CNPJ já possui uma conta cadastrada. Entre em contato pelo suporte se precisar de ajuda.',
      }, { status: 409 })
    }

    // Salvar dados no profile
    const { error: updateError } = await service
      .from('profiles')
      .update({
        cnpj:          cnpjFormatado,
        razao_social:  razao_social.trim(),
        nome_fantasia: nome_fantasia?.trim() || null,
        ie:            ie?.trim() || null,
        cep:           cep.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2'),
        logradouro:    logradouro.trim(),
        numero:        numero.trim(),
        complemento:   complemento?.trim() || null,
        bairro:        bairro.trim(),
        cidade:        cidade.trim(),
        estado_uf:     estado_uf,
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Erro ao atualizar perfil:', updateError)
      return NextResponse.json({ error: 'Erro ao salvar dados. Tente novamente.' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Erro em completar-perfil:', err)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}

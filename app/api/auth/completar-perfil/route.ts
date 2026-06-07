import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { validarCNPJ } from '@/app/api/auth/verificar-trial/route'
import { isDominioDescartavel } from '@/lib/dominios-descartaveis'

function validarCPF(cpf: string): boolean {
  const n = cpf.replace(/\D/g, '')
  if (n.length !== 11 || /^(\d)\1{10}$/.test(n)) return false
  const calc = (s: string, len: number) => {
    let sum = 0
    for (let i = 0; i < len; i++) sum += parseInt(s[i]) * (len + 1 - i)
    const r = (sum * 10) % 11
    return r === 10 || r === 11 ? 0 : r
  }
  return calc(n, 9) === parseInt(n[9]) && calc(n, 10) === parseInt(n[10])
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const body = await request.json()
    const { tipo_pessoa = 'PJ', cnpj, cpf, razao_social, nome_completo, nome_fantasia, ie,
            cep, logradouro, numero, complemento, bairro, cidade, estado_uf } = body

    // Validar endereço (obrigatório para ambos)
    if (!cep || !logradouro || !numero || !cidade || !estado_uf) {
      return NextResponse.json({ error: 'Endereço incompleto.' }, { status: 400 })
    }

    if (user.email && isDominioDescartavel(user.email)) {
      return NextResponse.json({ error: 'E-mail não permitido.' }, { status: 400 })
    }

    const service = await createServiceClient()
    let updateData: Record<string, unknown> = {
      tipo_pessoa,
      ie:          ie?.trim() || null,
      cep:         cep.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2'),
      logradouro:  logradouro.trim(),
      numero:      numero.trim(),
      complemento: complemento?.trim() || null,
      bairro:      bairro?.trim() || null,
      cidade:      cidade.trim(),
      estado_uf,
    }

    if (tipo_pessoa === 'PJ') {
      if (!cnpj || !razao_social) return NextResponse.json({ error: 'CNPJ e Razão Social são obrigatórios.' }, { status: 400 })
      if (!validarCNPJ(cnpj)) return NextResponse.json({ error: 'CNPJ inválido.' }, { status: 400 })

      const cnpjFormatado = cnpj.replace(/\D/g, '').replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')

      // Verificar duplicidade de CNPJ
      const { data: existente } = await service.from('profiles').select('id').eq('cnpj', cnpjFormatado).neq('id', user.id).limit(1)
      if (existente && existente.length > 0) {
        return NextResponse.json({ error: 'Este CNPJ já possui uma conta cadastrada.' }, { status: 409 })
      }

      updateData = { ...updateData, cnpj: cnpjFormatado, razao_social: razao_social.trim(), nome_fantasia: nome_fantasia?.trim() || null }

    } else {
      if (!cpf || !nome_completo) return NextResponse.json({ error: 'CPF e nome completo são obrigatórios.' }, { status: 400 })
      if (!validarCPF(cpf)) return NextResponse.json({ error: 'CPF inválido.' }, { status: 400 })

      const cpfFormatado = cpf.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')

      // Verificar duplicidade de CPF
      const { data: existente } = await service.from('profiles').select('id').eq('cpf', cpfFormatado).neq('id', user.id).limit(1)
      if (existente && existente.length > 0) {
        return NextResponse.json({ error: 'Este CPF já possui uma conta cadastrada.' }, { status: 409 })
      }

      updateData = { ...updateData, cpf: cpfFormatado, nome_completo: nome_completo.trim() }
    }

    const { error: updateError } = await service.from('profiles').update(updateData).eq('id', user.id)

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

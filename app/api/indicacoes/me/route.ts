import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { indicacoesAtiva } from '@/lib/indicacoes'

export const dynamic = 'force-dynamic'

/**
 * Dados de indicação do usuário logado: código, link, créditos, economia e
 * contagem de amigos convertidos. Usado pelo widget gamificado do painel.
 * Não expõe nada se a campanha estiver pausada ou o usuário não estiver apto.
 */
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const admin = createAdminClient()

  const ativa = await indicacoesAtiva(admin)
  if (!ativa) return NextResponse.json({ ativa: false, apto: false })

  const { data: perfil } = await admin
    .from('profiles')
    .select('indica_codigo, indica_creditos_dias, indica_economia_total, afiliado_id')
    .eq('id', user.id)
    .maybeSingle()

  // Afiliado tem outro programa (comissão) — não acumula +30 dias.
  const ehAfiliado = !!perfil?.afiliado_id
  if (!perfil?.indica_codigo || ehAfiliado) {
    return NextResponse.json({ ativa: true, apto: false, ehAfiliado })
  }

  // Contagem de amigos por estágio
  const { data: minhas } = await admin
    .from('indicacoes')
    .select('status')
    .eq('indicador_id', user.id)

  const lista = minhas ?? []
  const convertidos = lista.filter(i => i.status === 'liberada').length
  const aguardando  = lista.filter(i => i.status === 'assinou').length
  const pendentes   = lista.filter(i => i.status === 'pendente').length

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://monitordelicitacoes.com.br').replace(/\/$/, '')

  return NextResponse.json({
    ativa: true,
    apto: true,
    ehAfiliado: false,
    codigo: perfil.indica_codigo,
    link: `${appUrl}/r/${perfil.indica_codigo}`,
    creditosDias: perfil.indica_creditos_dias ?? 0,
    economiaTotal: perfil.indica_economia_total ?? 0,
    convertidos,
    aguardando,
    pendentes,
  })
}

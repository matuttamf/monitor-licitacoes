import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'matuttamaquinaseferramentas@gmail.com'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.email !== ADMIN_EMAIL) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  const body = await req.json().catch(() => ({}))
  const scope: string = body.scope ?? 'enviados'

  const service = createAdminClient()

  const statusAlvo: string[] =
    scope === 'completo' || scope === 'todos'
      ? ['enviado', 'erro', 'invalido']
      : ['enviado']

  // Zera descadastrados → invalido (respeita opt-out: não voltam a receber e-mails)
  if (scope === 'completo') {
    await service
      .from('leads')
      .update({ status: 'invalido', erro_msg: 'descadastrado_zerado' })
      .eq('status', 'descadastrado')
  }

  const { error } = await service
    .from('leads')
    .update({
      status:           'pendente',
      emails_enviados:  0,
      enviado_em:       null,
      proximo_email_em: null,
      abriu_em:         null,
      clicou_em:        null,
      erro_msg:         null,
    })
    .in('status', statusAlvo)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Conta quantos ainda estão pendentes para confirmar o reset
  const { count } = await service
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pendente')

  console.log(`[reset-leads] scope=${scope} pendentes_agora=${count}`)
  return NextResponse.json({ ok: true, resetados: count ?? 0 })
}

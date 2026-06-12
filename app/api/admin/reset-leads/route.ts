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

  // ── 1. Descadastrados → invalido (sempre respeitamos opt-out) ────────────────
  if (scope === 'completo') {
    await service
      .from('leads')
      .update({ status: 'invalido', erro_msg: 'descadastrado_zerado' })
      .eq('status', 'descadastrado')
  }

  // ── 2. Reset principal: apenas leads COM e-mail → pendente ───────────────────
  // Leads sem e-mail NÃO devem ir para pendente (o cron disparar não consegue
  // enviar e eles travam a fila sem serventia).
  const statusAlvo: string[] =
    scope === 'completo' || scope === 'todos'
      ? ['enviado', 'erro', 'invalido']
      : ['enviado']

  const { error: errReset } = await service
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
    .not('email', 'is', null)   // ← somente quem tem e-mail

  if (errReset) return NextResponse.json({ error: errReset.message }, { status: 500 })

  // ── 3. Leads SEM e-mail no scope completo: reabrir para enriquecimento ───────
  // - situacao='ATIVA' + sem email → zera tentativas para enriquecer-emails tentar
  //   novamente (não precisa re-verificar RF pois já sabemos que é empresa ativa)
  // - situacao IS NULL              → volta a pendente para enriquecer-receita
  //   verificar o CNPJ pela primeira vez
  let reabertosRF = 0, reabertosEmail = 0

  if (scope === 'completo') {
    // 3a. Ativas sem email → zera tentativas de busca de email (enriquecer-emails vai tentar de novo)
    const { count: cEmail } = await service
      .from('leads')
      .update({
        email_tentativas: 0,
        email_buscado_em: null,
        erro_msg:         null,
      })
      .eq('status', 'invalido')
      .eq('situacao', 'ATIVA')
      .is('email', null)
    reabertosEmail = cEmail ?? 0

    // 3b. Nunca verificados na RF (situacao IS NULL) → pendente para enriquecer-receita
    const { count: cRF } = await service
      .from('leads')
      .update({
        status:   'pendente',
        erro_msg: null,
      })
      .in('status', ['invalido', 'erro'])
      .is('situacao', null)
      .is('email', null)
    reabertosRF = cRF ?? 0
  }

  // ── 4. Contagem final ────────────────────────────────────────────────────────
  const { count: pendentes } = await service
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pendente')

  console.log(`[reset-leads] scope=${scope} pendentes=${pendentes} reabertosEmail=${reabertosEmail} reabertosRF=${reabertosRF}`)
  return NextResponse.json({ ok: true, pendentes: pendentes ?? 0, reabertosEmail, reabertosRF })
}

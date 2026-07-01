import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { rateLimitGuard, getIp } from '@/lib/rate-limit'

// GET  /api/meus-dados  — exporta todos os dados do usuário (LGPD art. 18)
// DELETE /api/meus-dados — solicita exclusão da conta (LGPD art. 18 VI)

export async function GET(request: Request) {
  const ip = getIp(request)
  if (!await rateLimitGuard(`ip:${ip}:meus-dados-get`, 5, 60_000)) {
    return NextResponse.json({ error: 'Muitas tentativas. Aguarde um momento.' }, { status: 429 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const [
    { data: perfil },
    { data: keywords },
    { data: alertas },
    { data: equipe },
    { data: fornecedor },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('keywords').select('*').eq('profile_id', user.id),
    supabase.from('alertas').select('id, licitacao_id, criado_em, lido').eq('profile_id', user.id).limit(500),
    supabase.from('team_members').select('*').eq('profile_id', user.id),
    supabase.from('fornecedores').select('*').eq('profile_id', user.id).maybeSingle(),
  ])

  const exportData = {
    exportado_em: new Date().toISOString(),
    perfil,
    palavras_chave: keywords,
    alertas,
    equipe,
    fornecedor,
  }

  return new Response(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="meus-dados-monitor-licitacoes.json"',
    },
  })
}

export async function DELETE(request: Request) {
  const ip = getIp(request)
  if (!await rateLimitGuard(`ip:${ip}:meus-dados-delete`, 3, 300_000)) {
    return NextResponse.json({ error: 'Muitas tentativas. Aguarde um momento.' }, { status: 429 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  // Marca conta para exclusão — equipe executa manualmente para não perder dados fiscais
  // e garantir cancelamento de assinatura ativa antes de deletar
  const serviceClient = await createServiceClient()
  await serviceClient.from('profiles').update({
    exclusao_solicitada_em: new Date().toISOString(),
    status: 'exclusao_pendente',
  }).eq('id', user.id)

  console.log(`[meus-dados] Exclusão solicitada: user=${user.id} email=${user.email}`)

  return NextResponse.json({
    ok: true,
    mensagem: 'Solicitação de exclusão registrada. Seus dados serão removidos em até 15 dias úteis. Você receberá uma confirmação por e-mail.',
  })
}

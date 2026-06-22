import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { verificarCronAuth, sistemaPausado } from '@/lib/cron-auth'
import { registrarCronLog } from '@/lib/cron-log'
import { enviarEmailSegunda } from '@/lib/emails/trial'

export const maxDuration = 300

export async function GET(request: Request) {
  if (!verificarCronAuth(request)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  if (await sistemaPausado()) {
    return NextResponse.json({ ok: false, motivo: 'sistema pausado para manutencao' }, { status: 503 })
  }

  const supabase = await createServiceClient()

  // Todos os usuários ativos (trial + active) que não pausaram e-mail
  const { data: usuarios } = await supabase
    .from('profiles')
    .select('id, status')
    .in('status', ['trial', 'active'])

  if (!usuarios?.length) return NextResponse.json({ ok: true, enviados: 0 })

  let enviados = 0
  let erros = 0
  const hoje = new Date().toISOString().substring(0, 10)

  for (const usuario of usuarios) {
    try {
      // Buscar e-mail do usuário
      const { data: authUser } = await supabase.auth.admin.getUserById(usuario.id)
      const email = authUser?.user?.email
      if (!email) continue

      // Verificar se e-mail está pausado
      const { data: perfil } = await supabase
        .from('profiles')
        .select('email_pausado_ate')
        .eq('id', usuario.id)
        .single()
      if (perfil?.email_pausado_ate && new Date(perfil.email_pausado_ate) > new Date()) continue

      // Keywords ativas do usuário
      const { data: keywords } = await supabase
        .from('keywords')
        .select('termo')
        .eq('user_id', usuario.id)
        .eq('ativo', true)

      const termos = keywords?.map(k => k.termo as string) ?? []

      // Contagem nacional: licitações abertas que batem com os termos (sem filtro de UF)
      let totalNacional = 0
      if (termos.length > 0) {
        const { count } = await supabase
          .from('licitacoes')
          .select('id', { count: 'exact' })
          .or(termos.map(t => `objeto.ilike.%${t}%`).join(','))
          .or(`data_abertura.is.null,data_abertura.gte.${hoje}`)
        totalNacional = count ?? 0
      }

      await enviarEmailSegunda(email, totalNacional, termos, usuario.status === 'trial')
      enviados++
    } catch (error) {
      console.error(`Erro ao enviar email-segunda para user=${usuario.id}:`, error)
      erros++
    }
  }

  const resultado = { ok: true, enviados, erros }
  await registrarCronLog({
    job: 'email-segunda',
    status: erros > 0 && enviados === 0 ? 'erro' : 'ok',
    mensagem: `${enviados} e-mail(s) enviados${erros > 0 ? `, ${erros} erro(s)` : ''}`,
    detalhes: resultado,
  })
  return NextResponse.json(resultado)
}

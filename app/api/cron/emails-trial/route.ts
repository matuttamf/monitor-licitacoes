import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { enviarEmailDia3, enviarEmailUrgencia } from '@/lib/emails/trial'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const supabase = await createServiceClient()

  // Buscar usuários em trial
  const { data: usuarios } = await supabase
    .from('profiles')
    .select('id, trial_inicio, trial_fim, status')
    .eq('status', 'trial')

  if (!usuarios?.length) return NextResponse.json({ ok: true, enviados: 0 })

  let enviados = 0
  const agora = new Date()

  for (const usuario of usuarios) {
    const inicio = new Date(usuario.trial_inicio)
    const diasDeTrial = Math.floor((agora.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24))

    // Buscar email do usuário
    const { data: authUser } = await supabase.auth.admin.getUserById(usuario.id)
    const email = authUser?.user?.email
    if (!email) continue

    // Verifica se trial expira amanhã (usa trial_fim — mais preciso que contar dias)
    const fim    = new Date(usuario.trial_fim)
    const amanha = new Date(agora)
    amanha.setDate(amanha.getDate() + 1)
    const expiraAmanha = fim.toDateString() === amanha.toDateString()

    try {
      // Dia 3: e-mail de engajamento
      if (diasDeTrial === 3) {
        // Contar licitações encontradas para este usuário
        const keywordsResult = await supabase
          .from('keywords')
          .select('id')
          .eq('user_id', usuario.id)

        const keywordIds = keywordsResult.data?.map(k => k.id) ?? []

        let count = 0
        if (keywordIds.length > 0) {
          const { count: licitacaoCount } = await supabase
            .from('alertas')
            .select('id', { count: 'exact' })
            .in('keyword_id', keywordIds)

          count = licitacaoCount ?? 0
        }

        await enviarEmailDia3(email, count)
        enviados++
      }

      // Expira amanhã: e-mail de urgência (baseado em trial_fim, cobre trials de duração variável)
      if (expiraAmanha) {
        await enviarEmailUrgencia(email)
        enviados++
      }
    } catch (error) {
      console.error(`Erro ao enviar e-mail para ${email}:`, error)
    }
  }

  return NextResponse.json({ ok: true, enviados })
}

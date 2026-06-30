import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { verificarCronAuth, sistemaPausado } from '@/lib/cron-auth'
import { registrarCronLog } from '@/lib/cron-log'
import { enviarEmailSegunda } from '@/lib/emails/trial'
import { enviarTextoTelegram } from '@/lib/alerts/telegram'
import { enviarSegundaWhatsApp } from '@/lib/alerts/whatsapp'

export const maxDuration = 300

export async function GET(request: Request) {
  if (!verificarCronAuth(request)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  if (await sistemaPausado()) {
    return NextResponse.json({ ok: false, motivo: 'sistema pausado para manutencao' }, { status: 503 })
  }

  const supabase = await createServiceClient()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://monitordelicitacoes.com.br'

  const { data: usuarios } = await supabase
    .from('profiles')
    .select('id, status, plano, telegram_chat_id, whatsapp, email_pausado_ate, telegram_pausado_ate, whatsapp_pausado_ate')
    .in('status', ['trial', 'active'])

  if (!usuarios?.length) return NextResponse.json({ ok: true, enviados: 0 })

  // Mapear emails em lote
  const uids = usuarios.map(u => u.id)
  const allAuthUsers: { id: string; email?: string }[] = []
  for (let page = 1; ; page++) {
    const { data: pg } = await supabase.auth.admin.listUsers({ page, perPage: 1000 })
    if (!pg?.users?.length) break
    allAuthUsers.push(...pg.users.filter(u => uids.includes(u.id)))
    if (pg.users.length < 1000) break
  }
  const emailMap = Object.fromEntries(allAuthUsers.map(u => [u.id, u.email!]))

  let enviados = 0
  let erros = 0
  const hoje = new Date().toISOString().substring(0, 10)
  const agora = new Date()

  for (const usuario of usuarios) {
    try {
      const email = emailMap[usuario.id]
      if (!email) continue

      const emailPausado = usuario.email_pausado_ate && new Date(usuario.email_pausado_ate) > agora
      const telegramPausado = usuario.telegram_pausado_ate && new Date(usuario.telegram_pausado_ate) > agora
      const whatsappPausado = usuario.whatsapp_pausado_ate && new Date(usuario.whatsapp_pausado_ate) > agora

      // Keywords ativas
      const { data: keywords } = await supabase
        .from('keywords')
        .select('termo')
        .eq('user_id', usuario.id)
        .eq('ativo', true)

      const termos = keywords?.map(k => k.termo as string) ?? []

      // Contagem nacional
      let totalNacional = 0
      if (termos.length > 0) {
        const { count } = await supabase
          .from('licitacoes')
          .select('id', { count: 'exact' })
          .or(termos.map(t => `objeto.ilike.%${t}%`).join(','))
          .gte('data_abertura', hoje)
        totalNacional = count ?? 0
      }

      const canaisEnviados: string[] = []

      // E-mail
      if (!emailPausado) {
        await enviarEmailSegunda(email, totalNacional, termos, usuario.status === 'trial')
        canaisEnviados.push('email')
      }

      // Telegram — todos os planos
      if (usuario.telegram_chat_id && !telegramPausado) {
        const termosStr = termos.slice(0, 3).join(', ') + (termos.length > 3 ? '...' : '')
        const texto =
          `📅 *Bom começo de semana!*\n\n` +
          `🔍 Esta semana há *${totalNacional.toLocaleString('pt-BR')} licitaç${totalNacional !== 1 ? 'ões' : 'ão'}* abertas` +
          (termosStr ? ` para "${termosStr}"` : '') +
          ` em todo o Brasil.\n\n` +
          `_Acompanhe no painel: ${appUrl}/alertas_`
        const ok = await enviarTextoTelegram(usuario.telegram_chat_id, texto)
        if (ok) canaisEnviados.push('telegram')
      }

      // WhatsApp — todos os planos
      if (usuario.whatsapp && !whatsappPausado) {
        const ok = await enviarSegundaWhatsApp(usuario.whatsapp, totalNacional, termos)
        if (ok) canaisEnviados.push('whatsapp')
      }

      if (canaisEnviados.length > 0) enviados++
    } catch (error) {
      console.error(`Erro email-segunda user=${usuario.id}:`, error)
      erros++
    }
  }

  const resultado = { ok: true, enviados, erros }
  await registrarCronLog({
    job:      'email-segunda',
    status:   erros > 0 && enviados === 0 ? 'erro' : 'ok',
    mensagem: `${enviados} usuário(s) notificado(s)${erros > 0 ? `, ${erros} erro(s)` : ''}`,
    detalhes: resultado,
  })
  return NextResponse.json(resultado)
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getLimites } from '@/lib/planos'
import { sugerirKeywordsSimilares } from '@/lib/matching/gemini'
import { enviarEmailPoucasKeywords } from '@/lib/emails/onboarding'
import { enviarWAPoucasKeywords } from '@/lib/alerts/whatsapp'
import { enviarTextoTelegram } from '@/lib/alerts/telegram'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'matuttamaquinaseferramentas@gmail.com'
const MIN_KEYWORDS = 5

export const maxDuration = 300

/**
 * POST /api/admin/disparar-poucas-keywords
 *
 * Body (opcional): { "user_ids": ["uuid1", "uuid2"] }
 * Sem body: dispara para todos os usuários elegíveis (< MIN_KEYWORDS, trial/active).
 *
 * Bypass da janela D+2 — uso manual pelo admin.
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const body = await req.json().catch(() => ({}))
  const filtroIds: string[] | undefined = Array.isArray(body?.user_ids) ? body.user_ids : undefined

  const service = createAdminClient()

  // Busca perfis elegíveis
  let query = service
    .from('profiles')
    .select('id, nome, plano, status, whatsapp, telegram_chat_id, whatsapp_pausado_ate, telegram_pausado_ate, email_pausado_ate')
    .in('status', ['trial', 'active'])
    .limit(10000)

  if (filtroIds?.length) {
    query = query.in('id', filtroIds)
  }

  const { data: profiles, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const uids = (profiles ?? []).map(p => p.id)
  if (!uids.length) return NextResponse.json({ ok: true, enviados: 0, motivo: 'nenhum perfil encontrado' })

  // Keywords ativas por usuário
  const { data: kwRows } = await service
    .from('keywords')
    .select('user_id, termo')
    .in('user_id', uids)
    .eq('ativo', true)

  const keywordsPorUsuario = new Map<string, string[]>()
  for (const kw of kwRows ?? []) {
    const uid = kw.user_id as string
    if (!keywordsPorUsuario.has(uid)) keywordsPorUsuario.set(uid, [])
    keywordsPorUsuario.get(uid)!.push(kw.termo as string)
  }

  // E-mails dos usuários
  const allAuthUsers: { id: string; email?: string }[] = []
  for (let page = 1; ; page++) {
    const { data: pg } = await service.auth.admin.listUsers({ page, perPage: 1000 })
    const users = pg?.users ?? []
    allAuthUsers.push(...users.filter(u => uids.includes(u.id)))
    if (users.length < 1000) break
  }
  const emailMap = Object.fromEntries(allAuthUsers.map(u => [u.id, u.email ?? '']))

  const agora = new Date()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://monitordelicitacoes.com.br'

  let enviados = 0
  let ignorados = 0
  const detalhes: { id: string; email: string; keywords: number; status: string }[] = []

  for (const p of profiles ?? []) {
    const termos = keywordsPorUsuario.get(p.id) ?? []
    const limiteDoPlano = getLimites(p.plano ?? 'trial').maxKeywords
    const minRecomendado = Math.min(MIN_KEYWORDS, limiteDoPlano)

    if (termos.length >= minRecomendado) {
      ignorados++
      continue
    }

    const email = emailMap[p.id]
    const emailPausado = p.email_pausado_ate && new Date(p.email_pausado_ate) > agora
    const waPausado    = p.whatsapp_pausado_ate && new Date(p.whatsapp_pausado_ate) > agora
    const tgPausado    = p.telegram_pausado_ate && new Date(p.telegram_pausado_ate) > agora

    try {
      const sugestoes = await sugerirKeywordsSimilares(
        termos,
        Math.min(8, limiteDoPlano - termos.length),
      )

      if (email && !emailPausado) {
        await enviarEmailPoucasKeywords(email, p.nome, termos, sugestoes, limiteDoPlano)
      }
      if (p.whatsapp && !waPausado) {
        await enviarWAPoucasKeywords(p.whatsapp, p.nome, termos, sugestoes, limiteDoPlano)
      }
      if (p.telegram_chat_id && !tgPausado) {
        const qtd = termos.length
        const sugestoesTexto = sugestoes.slice(0, 5).map(s => `• ${s}`).join('\n')
        const msgTelegram =
          `💡 *Mais oportunidades com mais palavras-chave*\n\n` +
          `Você monitora ${qtd} termo${qtd !== 1 ? 's' : ''}, mas seu plano permite até ${limiteDoPlano}.\n\n` +
          (sugestoesTexto ? `*Sugestões para adicionar:*\n${sugestoesTexto}\n\n` : '') +
          `[Adicionar palavras-chave →](${appUrl}/palavras-chave)`
        await enviarTextoTelegram(p.telegram_chat_id, msgTelegram)
      }

      enviados++
      detalhes.push({ id: p.id, email: email ?? '', keywords: termos.length, status: 'enviado' })
    } catch (e) {
      console.error(`[disparar-poucas-keywords] erro user=${p.id}:`, e)
      detalhes.push({ id: p.id, email: email ?? '', keywords: termos.length, status: 'erro' })
    }

    await new Promise(r => setTimeout(r, 300))
  }

  return NextResponse.json({ ok: true, enviados, ignorados, detalhes })
}

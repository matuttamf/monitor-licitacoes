/**
 * Cron: onboarding-followup
 * Horário: 9h e 21h BRT (12h e 0h UTC) → "0 12,0 * * *"
 *
 * Envia e-mail + WhatsApp em 4 fluxos de onboarding:
 *   1. Perfil incompleto  — D+1 (24h)
 *   2. Sem palavras-chave — sequência de 6: 12h, 24h, 48h, 72h, 96h, 120h
 *   3. Fornecedor D+3     — sem perfil no Diretório (72h)
 *   4. Telegram D+5       — sem telegram_chat_id (120h)
 */

import { NextRequest, NextResponse } from 'next/server'
import { verificarCronAuth, sistemaPausado } from '@/lib/cron-auth'
import { registrarCronLog } from '@/lib/cron-log'
import { createClient } from '@supabase/supabase-js'
import {
  enviarEmailPerfilIncompleto,
  enviarEmailSemKeywords,
  enviarEmailFornecedorD3,
  enviarEmailTelegramD5,
  enviarEmailPoucasKeywords,
  enviarEmail2h,
  enviarEmailConvite,
} from '@/lib/emails/onboarding'
import {
  enviarWAPerfilIncompleto,
  enviarWASemKeywords,
  enviarWAFornecedorD3,
  enviarWATelegramD5,
  enviarWAPoucasKeywords,
  enviarWAConvite,
} from '@/lib/alerts/whatsapp'
import { getLimites } from '@/lib/planos'
import { sugerirKeywordsSimilares } from '@/lib/matching/gemini'
import { enviarTextoTelegram } from '@/lib/alerts/telegram'

export const maxDuration = 300

// Usuários com menos que este número de keywords recebem sugestão (D+2).
// Deve ser <= limite do trial (7) para não impactar todos os trials.
const MIN_KEYWORDS_RECOMENDADO = 5

const HORAS_KEYWORDS = [12, 24, 48, 72, 96, 120] as const
// proof-of-value: dispara 2h após cadastro para quem já tem keywords
type HorasKw = typeof HORAS_KEYWORDS[number]

function janela(horasAtras: number, toleranciaH = 3): { inicio: Date; fim: Date } {
  const base = Date.now()
  return {
    inicio: new Date(base - (horasAtras + toleranciaH) * 3_600_000),
    fim:    new Date(base - (horasAtras - toleranciaH) * 3_600_000),
  }
}

function emJanela(criado: Date, j: { inicio: Date; fim: Date }): boolean {
  return criado >= j.inicio && criado <= j.fim
}

export async function GET(req: NextRequest) {
  if (!verificarCronAuth(req)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  if (await sistemaPausado()) {
    return NextResponse.json({ ok: false, motivo: 'sistema pausado para manutencao' }, { status: 503 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const adminEmail = process.env.ADMIN_EMAIL ?? 'matuttamaquinaseferramentas@gmail.com'
  const agora = new Date()

  // Janelas de tempo pré-calculadas
  const j2h                = janela(2, 1)   // 1h-3h após cadastro
  const jPerfilIncompleto  = janela(24)
  const jPoucasKeywords    = janela(48)
  const jConvite           = janela(72)     // D+3: convite para compartilhar (só run noturno)
  const jFornecedor        = janela(72)
  const jTelegram          = janela(120)
  const jKeywords         = new Map<HorasKw, { inicio: Date; fim: Date }>(
    HORAS_KEYWORDS.map(h => [h, janela(h)])
  )

  // Janela mais larga para buscar todos os perfis relevantes (120h + 3h tolerância)
  const janelaMaisLarga = new Date(agora.getTime() - 123 * 3_600_000).toISOString()

  const horaUTC = agora.getUTCHours()
  const isRunNoturno = horaUTC <= 1 // 0h UTC = 21h BRT

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, nome, plano, telefone, whatsapp, telegram_chat_id, email_pausado_ate, whatsapp_pausado_ate, telegram_pausado_ate, criado_em, status, codigo_indicacao')
    .in('status', ['trial', 'active'])
    .gte('criado_em', janelaMaisLarga)

  if (!profiles?.length) {
    await registrarCronLog({ job: 'onboarding-followup', status: 'ok', mensagem: '0 usuários no período' })
    return NextResponse.json({ ok: true, disparos: 0 })
  }

  const uids = profiles.map(p => p.id)

  // E-mails em lote
  const allAuthUsers: { id: string; email?: string }[] = []
  for (let page = 1; ; page++) {
    const { data: pg } = await supabase.auth.admin.listUsers({ page, perPage: 1000 })
    if (!pg?.users?.length) break
    allAuthUsers.push(...pg.users.filter(u => uids.includes(u.id)))
    if (pg.users.length < 1000) break
  }
  const emailMap = Object.fromEntries(allAuthUsers.map(u => [u.id, u.email ?? '']))

  // Keywords ativas por usuário (termos + contagem)
  const { data: kwRows } = await supabase
    .from('keywords')
    .select('user_id, termo')
    .in('user_id', uids)
    .eq('ativo', true)

  const usersComKeywords = new Set((kwRows ?? []).map(k => k.user_id as string))

  // Agrupa termos por usuário para o flow de poucas keywords
  const keywordsPorUsuario = new Map<string, string[]>()
  for (const kw of kwRows ?? []) {
    const uid = kw.user_id as string
    if (!keywordsPorUsuario.has(uid)) keywordsPorUsuario.set(uid, [])
    keywordsPorUsuario.get(uid)!.push(kw.termo as string)
  }

  // Usuários em janela D+3 com fornecedor cadastrado
  const usersEmD3 = profiles
    .filter(p => emJanela(new Date(p.criado_em), jFornecedor))
    .map(p => p.id)

  const usersComFornecedor = new Set<string>()
  if (usersEmD3.length > 0) {
    const { data: fornRows } = await supabase
      .from('fornecedores')
      .select('user_id, razao_social')
      .in('user_id', usersEmD3)
    ;(fornRows ?? [])
      .filter(f => f.razao_social)
      .forEach(f => usersComFornecedor.add(f.user_id as string))
  }

  let disparos = 0
  let erros    = 0

  for (const p of profiles) {
    const email = emailMap[p.id]
    if (email === adminEmail) continue

    const criado      = new Date(p.criado_em)
    const emailPausado = p.email_pausado_ate && new Date(p.email_pausado_ate) > agora
    const waPausado    = p.whatsapp_pausado_ate && new Date(p.whatsapp_pausado_ate) > agora

    try {
      let disparouNesteTick = false

      // 0. Proof of value — 2h após cadastro (só para quem já tem >= 3 keywords)
      if (emJanela(criado, j2h) && (keywordsPorUsuario.get(p.id)?.length ?? 0) >= 3) {
        const termos = keywordsPorUsuario.get(p.id) ?? []
        try {
          // Conta licitações com match em qualquer termo do usuário
          const orFilter = termos.map(t => `objeto.ilike.%${t}%`).join(',')
          const { count: totalLic } = await supabase
            .from('licitacoes')
            .select('*', { count: 'exact', head: true })
            .or(orFilter)
          const total = totalLic ?? 0
          if (total > 0 && email && !emailPausado) {
            await enviarEmail2h(email, p.nome, total, termos.slice(0, 2))
            disparouNesteTick = true
          }
        } catch (e2h) {
          console.error(`[onboarding-followup] erro 2h user=${p.id}:`, e2h)
        }
      }

      // 1. Perfil incompleto — D+1
      if (emJanela(criado, jPerfilIncompleto) && (!p.nome || !p.telefone)) {
        if (email && !emailPausado) await enviarEmailPerfilIncompleto(email, p.nome)
        if (p.whatsapp && !waPausado) await enviarWAPerfilIncompleto(p.whatsapp, p.nome)
        if (email || p.whatsapp) disparouNesteTick = true
      }

      // 2. Sem palavras-chave — sequência de 6
      if (!usersComKeywords.has(p.id)) {
        for (const h of HORAS_KEYWORDS) {
          if (emJanela(criado, jKeywords.get(h)!)) {
            if (email && !emailPausado) await enviarEmailSemKeywords(email, p.nome, h)
            if (p.whatsapp && !waPausado) await enviarWASemKeywords(p.whatsapp, p.nome, h)
            if (email || p.whatsapp) disparouNesteTick = true
            break
          }
        }
      }

      // 3. Poucas palavras-chave — D+2 (só para quem já tem keywords mas poucas)
      if (
        emJanela(criado, jPoucasKeywords) &&
        usersComKeywords.has(p.id)
      ) {
        const termos = keywordsPorUsuario.get(p.id) ?? []
        const limiteDoPlano = getLimites(p.plano ?? 'trial').maxKeywords
        const minRecomendado = Math.min(MIN_KEYWORDS_RECOMENDADO, limiteDoPlano)

        if (termos.length < minRecomendado) {
          try {
            const sugestoes = await sugerirKeywordsSimilares(termos, Math.min(8, limiteDoPlano - termos.length))

            if (email && !emailPausado) {
              await enviarEmailPoucasKeywords(email, p.nome, termos, sugestoes, limiteDoPlano)
            }
            if (p.whatsapp && !waPausado) {
              await enviarWAPoucasKeywords(p.whatsapp, p.nome, termos, sugestoes, limiteDoPlano)
            }
            if (p.telegram_chat_id && (!p.telegram_pausado_ate || new Date(p.telegram_pausado_ate) > agora)) {
              const qtd = termos.length
              const sugestoesTexto = sugestoes.slice(0, 5).map(s => `• ${s}`).join('\n')
              const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://monitordelicitacoes.com.br'
              const msgTelegram =
                `💡 *Mais oportunidades com mais palavras-chave*\n\n` +
                `Você monitora ${qtd} termo${qtd !== 1 ? 's' : ''}, mas seu plano permite até ${limiteDoPlano}.\n\n` +
                (sugestoesTexto ? `*Sugestões para adicionar:*\n${sugestoesTexto}\n\n` : '') +
                `[Adicionar palavras-chave →](${appUrl}/palavras-chave)`
              await enviarTextoTelegram(p.telegram_chat_id, msgTelegram)
            }
            if (email || p.whatsapp || p.telegram_chat_id) disparouNesteTick = true
          } catch (e) {
            console.error(`[onboarding-followup] erro poucas-keywords user=${p.id}:`, e)
          }
        }
      }

      // 5a. Convite compartilhar — D+3, somente assinantes ativos, run das 21h BRT (0h UTC)
      if (isRunNoturno && p.status === 'active' && emJanela(criado, jConvite) && p.codigo_indicacao) {
        try {
          if (email && !emailPausado) {
            await enviarEmailConvite(email, p.nome, p.codigo_indicacao)
            disparouNesteTick = true
          }
          if (p.whatsapp && !waPausado) {
            await enviarWAConvite(p.whatsapp, p.nome, p.codigo_indicacao)
            disparouNesteTick = true
          }
        } catch (eConv) {
          console.error(`[onboarding-followup] erro convite user=${p.id}:`, eConv)
        }
      }

      // 5b. Fornecedor D+3
      if (emJanela(criado, jFornecedor) && !usersComFornecedor.has(p.id)) {
        if (email && !emailPausado) await enviarEmailFornecedorD3(email, p.nome)
        if (p.whatsapp && !waPausado) await enviarWAFornecedorD3(p.whatsapp, p.nome)
        if (email || p.whatsapp) disparouNesteTick = true
      }

      // 4. Telegram D+5
      if (emJanela(criado, jTelegram) && !p.telegram_chat_id) {
        if (email && !emailPausado) await enviarEmailTelegramD5(email, p.nome)
        if (p.whatsapp && !waPausado) await enviarWATelegramD5(p.whatsapp, p.nome)
        if (email || p.whatsapp) disparouNesteTick = true
      }

      if (disparouNesteTick) disparos++
    } catch (e) {
      console.error(`[onboarding-followup] erro user=${p.id}:`, e)
      erros++
    }

    await new Promise(r => setTimeout(r, 150))
  }

  const resultado = { ok: true, disparos, erros, total: profiles.length }
  await registrarCronLog({
    job:      'onboarding-followup',
    status:   erros > 0 && disparos === 0 ? 'erro' : 'ok',
    mensagem: `${disparos} disparo(s) enviado(s)${erros > 0 ? `, ${erros} erro(s)` : ''}`,
    detalhes: resultado,
  })
  return NextResponse.json(resultado)
}

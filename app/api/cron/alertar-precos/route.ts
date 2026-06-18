/**
 * Cron: alertar-precos
 * Horário: 0 9 * * 1-5 (seg-sex às 9h)
 *
 * Para cada usuário ativo com palavras-chave:
 *   1. Busca resultados novos (coletados ontem) que batem com algum termo via FTS
 *   2. Envia e-mail resumo se encontrou correspondências
 *
 * A busca não consome o limite mensal do usuário (é feita internamente).
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabase } from '@supabase/supabase-js'
import { verificarCronAuth, sistemaPausado } from '@/lib/cron-auth'
import { salvarResultadoCron } from '@/lib/cron-log'

export const maxDuration = 300

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://monitordelicitacoes.com.br'

function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
function fmtData(iso: string | null) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export async function GET(req: NextRequest) {
  if (!verificarCronAuth(req)) return NextResponse.json({ error: 'não autorizado' }, { status: 401 })
  return NextResponse.json({ ok: true, msg: 'desativado' })

  const pausado = await sistemaPausado()
  if (pausado) return NextResponse.json({ ok: true, msg: 'sistema pausado' })

  // Resend instanciado dentro da função (evita erro em build)
  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)

  const supabase = createSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Buscar usuários ativos com e-mail confirmado
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, nome, plano, status, trial_fim, acesso_ate, owner_id, membro_ativo, bloqueado_admin')
    .or('status.eq.active,status.eq.trial')
    .not('bloqueado_admin', 'eq', true)

  if (!profiles?.length) return NextResponse.json({ ok: true, enviados: 0 })

  // Buscar e-mails dos usuários (auth.users)
  const ids = profiles!.map(p => p.id)
  const { data: authUsers } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  const emailPorId = new Map(authUsers?.users?.map(u => [u.id, u.email ?? '']) ?? [])

  // Resultados novos nas últimas 30h (janela generosa para cobrir variação de horário)
  const limiteColetado = new Date(Date.now() - 30 * 3600000).toISOString()

  let enviados = 0
  let erros    = 0

  for (const profile of profiles!) {
    // Verificar acesso ativo
    if (profile.owner_id && profile.membro_ativo === false) continue
    if (profile.status === 'trial' && profile.trial_fim && new Date(profile.trial_fim) < new Date()) {
      if (!profile.acesso_ate || new Date(profile.acesso_ate) < new Date()) continue
    }

    const email = emailPorId.get(profile.id)
    if (!email) continue

    // Buscar palavras-chave do usuário na tabela keywords
    const { data: keywords } = await supabase
      .from('keywords')
      .select('termo')
      .eq('user_id', profile.id)
      .limit(15)

    if (!keywords?.length) continue

    // Para cada palavra-chave buscar resultados recentes (sem contar no limite)
    const matches: { descricao: string; valor: number; orgao: string; estado: string; data: string | null }[] = []

    for (const kw of keywords!) {
      const termo = kw.termo?.trim()
      if (!termo) continue

      const { data: rows } = await supabase
        .from('resultados_itens')
        .select('descricao_item, valor_unitario, orgao, estado, data_resultado')
        .gte('coletado_em', limiteColetado)
        .textSearch('tsv', termo, { type: 'plain', config: 'portuguese' })
        .limit(3)

      for (const r of rows ?? []) {
        matches.push({
          descricao: r.descricao_item,
          valor:     r.valor_unitario,
          orgao:     r.orgao ?? '—',
          estado:    r.estado ?? '—',
          data:      r.data_resultado,
        })
      }
    }

    if (!matches.length) continue

    // Deduplica por descrição+valor, limita em 10
    const vistos = new Set<string>()
    const unicos = matches.filter(m => {
      const k = `${m.descricao}|${m.valor}`
      if (vistos.has(k)) return false
      vistos.add(k); return true
    }).slice(0, 10)

    const linhas = unicos.map(m => `
      <tr style="border-bottom:1px solid #f0ede8;">
        <td style="padding:14px 16px;">
          <div style="font-size:13px;color:#1A1A1C;line-height:1.45;margin-bottom:8px;">${m.descricao}</div>
          <table cellpadding="0" cellspacing="0" style="width:100%;">
            <tr>
              <td style="font-size:14px;font-weight:700;color:#6B0F1A;padding-right:16px;">${fmtBRL(m.valor)}</td>
              <td style="font-size:12px;color:#666;padding-right:12px;">${m.estado}</td>
              <td style="font-size:12px;color:#aaa;text-align:right;">${fmtData(m.data)}</td>
            </tr>
          </table>
          <div style="font-size:11px;color:#999;margin-top:4px;">${m.orgao}</div>
        </td>
      </tr>`).join('')

    const nomeExibido = profile.nome?.trim() || email.split('@')[0]

    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FAF6F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:620px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.06);">
    <div style="background:#1A1A1C;padding:28px 32px;display:flex;align-items:center;gap:14px;">
      <div style="width:38px;height:38px;background:#6B0F1A;border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:12px;color:#C9A65A;flex-shrink:0;">ML</div>
      <div>
        <div style="color:white;font-weight:700;font-size:15px;">Monitor de Licitações</div>
        <div style="color:rgba(255,255,255,0.4);font-size:12px;">Análise de Preços Vencedores</div>
      </div>
    </div>
    <div style="padding:32px;">
      <p style="margin:0 0 8px;font-size:18px;font-weight:700;color:#1A1A1C;">Novos preços vencedores para suas palavras-chave</p>
      <p style="margin:0 0 24px;font-size:14px;color:#666;line-height:1.6;">
        Olá, ${nomeExibido}! Encontramos <strong>${unicos.length} resultado${unicos.length > 1 ? 's' : ''}</strong> de licitações homologadas que combinam com o que você monitora.
      </p>
      <div style="overflow-x:auto;border-radius:10px;border:1px solid #e8e4de;">
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:#f7f4ef;">
              <th style="padding:10px 12px;text-align:left;font-size:11px;color:#888;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Item</th>
              <th style="padding:10px 12px;text-align:left;font-size:11px;color:#888;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Valor unit.</th>
              <th style="padding:10px 12px;text-align:left;font-size:11px;color:#888;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Órgão</th>
              <th style="padding:10px 12px;text-align:left;font-size:11px;color:#888;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">UF</th>
              <th style="padding:10px 12px;text-align:left;font-size:11px;color:#888;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Data</th>
            </tr>
          </thead>
          <tbody>${linhas}</tbody>
        </table>
      </div>
      <div style="margin-top:28px;text-align:center;">
        <a href="${APP_URL}/precos" style="display:inline-block;padding:13px 28px;background:#6B0F1A;color:white;font-weight:700;font-size:14px;text-decoration:none;border-radius:10px;">
          Ver análise completa →
        </a>
      </div>
      <p style="margin:24px 0 0;font-size:12px;color:#aaa;line-height:1.6;text-align:center;">
        <a href="${APP_URL}/perfil" style="color:#888;">Gerenciar preferências</a>
      </p>
    </div>
  </div>
</body>
</html>`

    const { error } = await resend.emails.send({
      from:    'Monitor de Licitações <alertas@monitordelicitacoes.com.br>',
      to:      email,
      subject: `💰 ${unicos.length} preço${unicos.length > 1 ? 's' : ''} vencedor${unicos.length > 1 ? 'es' : ''} encontrado${unicos.length > 1 ? 's' : ''} para suas palavras-chave`,
      html,
    })

    if (error) erros++
    else enviados++
  }

  await salvarResultadoCron(supabase, 'alertar-precos', { enviados, erros, usuarios: profiles!.length })

  return NextResponse.json({ ok: true, enviados, erros })
}

/**
 * Cron: enriquecer-emails
 * Horário: a cada 30 minutos
 *
 * Para leads com email=null (status='invalido'), tenta encontrar o e-mail
 * corporativo buscando na internet:
 *
 *  1. DuckDuckGo HTML: "{razao_social} {municipio} email contato"
 *     → extrai e-mails de snippets com regex
 *  2. Se URL de site encontrada → fetch /contato, /sobre, /fale-conosco
 *     → extrai e-mail da página
 *  3. Tentativa direta: constrói domínio a partir do nome da empresa
 *     → verifica se existe e extrai e-mail
 *
 *  Lead enriquecido → status 'pendente' + email atualizado
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabase } from '@supabase/supabase-js'
import { verificarCronAuth } from '@/lib/cron-auth'

export const maxDuration = 300

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

// Domínios de e-mail genéricos (não corporativos)
const DOMINIOS_GENERICOS = [
  'gmail.com','hotmail.com','yahoo.com.br','yahoo.com','outlook.com',
  'bol.com.br','uol.com.br','terra.com.br','ig.com.br','live.com',
  'msn.com','icloud.com','me.com','protonmail.com','tutanota.com',
]

const EMAIL_REGEX = /[\w.+%-]+@[\w-]+\.[\w.]{2,}/g

function extrairEmails(texto: string): string[] {
  const matches = texto.match(EMAIL_REGEX) ?? []
  return matches
    .map(e => e.toLowerCase().replace(/[.,;:>]+$/, ''))
    .filter(e => e.includes('.') && !e.endsWith('.') && e.length < 80)
}

function scoreEmail(email: string): number {
  if (DOMINIOS_GENERICOS.some(d => email.endsWith(d))) return 0  // genérico
  if (/contato|comercial|vendas|financeiro|empresa|info|sac|atendimento/.test(email)) return 3
  return 2  // corporativo desconhecido
}

function melhorEmail(emails: string[]): string | null {
  const uniq = [...new Set(emails)]
  const scored = uniq.map(e => ({ e, s: scoreEmail(e) })).filter(x => x.s > 0)
  if (!scored.length) return null
  scored.sort((a, b) => b.s - a.s)
  return scored[0].e
}

// Limpa nome da empresa para montar slug de domínio
function slugDominio(razao: string): string {
  return razao
    .toLowerCase()
    .replace(/\b(ltda|eireli|me|epp|s\.?a\.?|sa|comercio|comercial|industria|servicos|solucoes|tecnologia|brasil)\b/g, '')
    .replace(/[^a-z0-9]/g, '')
    .replace(/^(\d)/, 'x$1')
    .slice(0, 30)
}

// ── Estratégia 1: DuckDuckGo HTML ────────────────────────────────────────────
async function buscarDDG(razao_social: string, municipio: string | null, uf: string | null): Promise<{ emails: string[]; urls: string[] }> {
  const q = encodeURIComponent(`"${razao_social.slice(0, 40)}" ${municipio ?? ''} ${uf ?? ''} email contato`)
  try {
    const res = await fetch(`https://html.duckduckgo.com/html/?q=${q}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'pt-BR,pt;q=0.9',
        'Referer': 'https://duckduckgo.com/',
      },
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) return { emails: [], urls: [] }
    const html = await res.text()
    const emails = extrairEmails(html)
    // Extrai URLs de resultados
    const urlMatches = html.match(/uddg=([^"&]+)/g) ?? []
    const urls = urlMatches
      .map(m => { try { return decodeURIComponent(m.replace('uddg=', '')) } catch { return '' } })
      .filter(u => u.startsWith('http') && !u.includes('duckduckgo') && !u.includes('duck.com'))
      .slice(0, 3)
    return { emails, urls }
  } catch { return { emails: [], urls: [] } }
}

// ── Estratégia 2: Fetch de página da empresa ─────────────────────────────────
async function buscarEmailNaSite(baseUrl: string): Promise<string[]> {
  const paths = ['', '/contato', '/fale-conosco', '/sobre', '/sobre-nos', '/contact', '/quem-somos']
  const emails: string[] = []
  for (const path of paths.slice(0, 3)) {
    try {
      const url = baseUrl.replace(/\/$/, '') + path
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'text/html' },
        signal: AbortSignal.timeout(8000),
        redirect: 'follow',
      })
      if (!res.ok) continue
      const html = await res.text()
      emails.push(...extrairEmails(html))
      if (melhorEmail(emails)) break
      await sleep(500)
    } catch { /* ignora */ }
  }
  return emails
}

// ── Estratégia 3: Domínio deduzido ──────────────────────────────────────────
async function buscarEmailPorDominio(razao: string): Promise<string[]> {
  const slug = slugDominio(razao)
  if (slug.length < 3) return []
  const candidatos = [
    `https://www.${slug}.com.br`,
    `https://${slug}.com.br`,
    `https://www.${slug}.com`,
  ]
  for (const url of candidatos) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'text/html' },
        signal: AbortSignal.timeout(8000),
        redirect: 'follow',
      })
      if (!res.ok) continue
      const html = await res.text()
      const emails = extrairEmails(html)
      if (emails.length) return emails
    } catch { /* ignora */ }
  }
  return []
}

// ── Handler ──────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  if (!verificarCronAuth(req)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const supabase = createSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Verifica se captação está ativa
  const { data: cfg } = await supabase
    .from('configuracoes').select('valor').eq('chave', 'captacao_ativa').maybeSingle()
  if (cfg && (cfg.valor === false || cfg.valor === 'false')) {
    return NextResponse.json({ ok: true, enriquecidos: 0, motivo: 'sistema pausado' })
  }

  // Busca até 10 leads sem e-mail
  const { data: leads, error } = await supabase
    .from('leads')
    .select('id, cnpj, razao_social, municipio, uf, email_buscado_em')
    .is('email', null)
    .eq('status', 'invalido')
    .or('email_buscado_em.is.null,email_buscado_em.lt.' + new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: true })
    .limit(10)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!leads?.length) return NextResponse.json({ ok: true, enriquecidos: 0, motivo: 'sem leads para enriquecer' })

  let enriquecidos = 0
  let tentativas   = 0
  const detalhes: Record<string, string> = {}

  for (const lead of leads) {
    tentativas++
    await sleep(1500)  // respeita rate limit do DDG

    let emailFinal: string | null = null
    let metodo = ''

    // ── Estratégia 1: DuckDuckGo ────────────────────────────────────────────
    const { emails: emailsDDG, urls } = await buscarDDG(lead.razao_social, lead.municipio, lead.uf)
    emailFinal = melhorEmail(emailsDDG)
    if (emailFinal) { metodo = 'ddg_snippet' }

    // ── Estratégia 2: Site encontrado via DDG ────────────────────────────────
    if (!emailFinal && urls.length) {
      await sleep(1000)
      const emailsSite = await buscarEmailNaSite(urls[0])
      emailFinal = melhorEmail(emailsSite)
      if (emailFinal) { metodo = 'ddg_site' }
    }

    // ── Estratégia 3: Domínio deduzido ──────────────────────────────────────
    if (!emailFinal) {
      await sleep(1000)
      const emailsDom = await buscarEmailPorDominio(lead.razao_social)
      emailFinal = melhorEmail(emailsDom)
      if (emailFinal) { metodo = 'dominio_deduzido' }
    }

    // ── Atualiza o lead ──────────────────────────────────────────────────────
    const update: Record<string, unknown> = { email_buscado_em: new Date().toISOString() }
    if (emailFinal) {
      update.email  = emailFinal
      update.status = 'pendente'
      enriquecidos++
      detalhes[lead.cnpj] = `${emailFinal} (${metodo})`
    }
    await supabase.from('leads').update(update).eq('id', lead.id)
  }

  return NextResponse.json({ ok: true, enriquecidos, tentativas, detalhes })
}

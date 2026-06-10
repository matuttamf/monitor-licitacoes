/**
 * Cron: enriquecer-emails
 * Horário: a cada 30 minutos
 *
 * Para leads com email=null (status='invalido') E situacao='ATIVA',
 * tenta encontrar o e-mail corporativo:
 *
 *  1. SearXNG (instâncias públicas, retorna JSON)
 *  2. Bing HTML scraping
 *  3. DuckDuckGo HTML scraping
 *  4. Fetch direto de site da empresa (/contato, /sobre...)
 *  5. Domínio deduzido do nome
 *
 * Apenas leads com situacao='ATIVA' são processados.
 * Leads enriquecidos → status 'pendente'.
 * Retry somente após 7 dias.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabase } from '@supabase/supabase-js'
import { verificarCronAuth } from '@/lib/cron-auth'

export const maxDuration = 300

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

const DOMINIOS_GENERICOS = new Set([
  'gmail.com','hotmail.com','yahoo.com.br','yahoo.com','outlook.com',
  'bol.com.br','uol.com.br','terra.com.br','ig.com.br','live.com',
  'msn.com','icloud.com','me.com','protonmail.com','tutanota.com',
  'hotmail.com.br','outlook.com.br',
])

const EMAIL_REGEX = /[\w.+%-]{2,}@[\w-]+\.[\w.]{2,}/g

function extrairEmails(texto: string): string[] {
  const raw = texto.match(EMAIL_REGEX) ?? []
  return [...new Set(
    raw
      .map(e => e.toLowerCase().replace(/[.,;:>'")\]]+$/, ''))
      .filter(e =>
        e.includes('@') &&
        e.includes('.') &&
        !e.endsWith('.') &&
        e.length >= 6 &&
        e.length <= 80 &&
        !e.includes('..') &&
        !/\.(png|jpg|gif|svg|css|js|php|html|woff)$/i.test(e)
      )
  )]
}

function scoreEmail(email: string): number {
  const dominio = email.split('@')[1] ?? ''
  if (DOMINIOS_GENERICOS.has(dominio)) return 0
  if (/contato|comercial|vendas|financeiro|info|sac|atendimento|suporte|empresa/.test(email)) return 4
  if (/^[a-z]+\.[a-z]+@/.test(email)) return 2   // nome.sobrenome@ — provavelmente corporativo
  return 3  // qualquer outro email corporativo
}

function melhorEmail(emails: string[]): string | null {
  const scored = emails.map(e => ({ e, s: scoreEmail(e) })).filter(x => x.s > 0)
  if (!scored.length) return null
  scored.sort((a, b) => b.s - a.s)
  return scored[0].e
}

function slugDominio(razao: string): string {
  return razao
    .toLowerCase()
    .replace(/\b(ltda|eireli|me|epp|s\.?a\.?|sa|comercio|comercial|industria|servicos|solucoes|tecnologia|brasil|e|de|da|do|das|dos)\b/g, '')
    .replace(/[^a-z0-9]/g, '')
    .replace(/^(\d)/, 'x$1')
    .slice(0, 25)
}

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

// ── Estratégia 1: SearXNG (instâncias públicas, JSON) ────────────────────────
const SEARX_INSTANCES = [
  'https://searx.be',
  'https://search.inetol.net',
  'https://opnxng.com',
]

async function buscarSearX(query: string): Promise<{ emails: string[]; urls: string[]; debug: string }> {
  for (const base of SEARX_INSTANCES) {
    try {
      const q = encodeURIComponent(query)
      const res = await fetch(`${base}/search?q=${q}&format=json&language=pt-BR&categories=general`, {
        headers: { 'User-Agent': UA, 'Accept': 'application/json' },
        signal: AbortSignal.timeout(10000),
      })
      if (!res.ok) continue
      const json = await res.json() as { results?: { url?: string; content?: string; title?: string }[] }
      const results = json.results ?? []
      const texto = results.map(r => `${r.title ?? ''} ${r.content ?? ''} ${r.url ?? ''}`).join(' ')
      const emails = extrairEmails(texto)
      const urls = results.map(r => r.url ?? '').filter(u => u.startsWith('http')).slice(0, 3)
      return { emails, urls, debug: `searx:${base} ok (${results.length} resultados)` }
    } catch (e) {
      /* próxima instância */
    }
  }
  return { emails: [], urls: [], debug: 'searx: todas as instâncias falharam' }
}

// ── Estratégia 2: Bing HTML ───────────────────────────────────────────────────
async function buscarBing(query: string): Promise<{ emails: string[]; urls: string[]; debug: string }> {
  try {
    const q = encodeURIComponent(query)
    const res = await fetch(`https://www.bing.com/search?q=${q}&setlang=pt-BR`, {
      headers: {
        'User-Agent': UA,
        'Accept': 'text/html',
        'Accept-Language': 'pt-BR,pt;q=0.9',
      },
      signal: AbortSignal.timeout(12000),
    })
    if (!res.ok) return { emails: [], urls: [], debug: `bing: HTTP ${res.status}` }
    const html = await res.text()
    const emails = extrairEmails(html)
    // Extrai URLs dos snippets do Bing
    const urlMatches = [...html.matchAll(/href="(https?:\/\/[^"?#]+)[^"]*"/g)]
      .map(m => m[1])
      .filter(u => !u.includes('bing.com') && !u.includes('microsoft.com'))
      .slice(0, 3)
    return { emails, urls: urlMatches, debug: `bing: ok (${emails.length} emails encontrados)` }
  } catch (e) {
    return { emails: [], urls: [], debug: `bing: ${String(e).slice(0, 80)}` }
  }
}

// ── Estratégia 3: DuckDuckGo HTML ────────────────────────────────────────────
async function buscarDDG(query: string): Promise<{ emails: string[]; urls: string[]; debug: string }> {
  try {
    const q = encodeURIComponent(query)
    const res = await fetch(`https://html.duckduckgo.com/html/?q=${q}`, {
      headers: {
        'User-Agent': UA,
        'Accept': 'text/html',
        'Accept-Language': 'pt-BR,pt;q=0.9',
        'Referer': 'https://duckduckgo.com/',
      },
      signal: AbortSignal.timeout(12000),
    })
    if (!res.ok) return { emails: [], urls: [], debug: `ddg: HTTP ${res.status}` }
    const html = await res.text()
    if (html.includes('duckduckgo.com/sorry') || html.length < 1000) {
      return { emails: [], urls: [], debug: 'ddg: bloqueado (página de sorry)' }
    }
    const emails = extrairEmails(html)
    const urlMatches = html.match(/uddg=([^"&]+)/g) ?? []
    const urls = urlMatches
      .map(m => { try { return decodeURIComponent(m.replace('uddg=', '')) } catch { return '' } })
      .filter(u => u.startsWith('http') && !u.includes('duckduckgo'))
      .slice(0, 3)
    return { emails, urls, debug: `ddg: ok (${emails.length} emails, ${urls.length} urls)` }
  } catch (e) {
    return { emails: [], urls: [], debug: `ddg: ${String(e).slice(0, 80)}` }
  }
}

// ── Estratégia 4: Fetch de página da empresa ─────────────────────────────────
async function buscarEmailNaSite(baseUrl: string): Promise<string[]> {
  const paths = ['/contato', '/fale-conosco', '/sobre', '/sobre-nos', '', '/contact', '/quem-somos']
  const emails: string[] = []
  for (const path of paths.slice(0, 4)) {
    try {
      const url = baseUrl.replace(/\/$/, '') + path
      const res = await fetch(url, {
        headers: { 'User-Agent': UA, 'Accept': 'text/html' },
        signal: AbortSignal.timeout(7000),
        redirect: 'follow',
      })
      if (!res.ok) continue
      const html = await res.text()
      emails.push(...extrairEmails(html))
      if (melhorEmail(emails)) break
      await sleep(400)
    } catch { /* ignora */ }
  }
  return emails
}

// ── Estratégia 5: Domínio deduzido ──────────────────────────────────────────
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
        headers: { 'User-Agent': UA, 'Accept': 'text/html' },
        signal: AbortSignal.timeout(7000),
        redirect: 'follow',
      })
      if (!res.ok) continue
      const emails = extrairEmails(await res.text())
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

  const { data: cfg } = await supabase
    .from('configuracoes').select('valor').eq('chave', 'captacao_ativa').maybeSingle()
  if (cfg && (cfg.valor === false || cfg.valor === 'false')) {
    return NextResponse.json({ ok: true, enriquecidos: 0, motivo: 'sistema pausado' })
  }

  const retryApos = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  // Apenas leads ATIVOS (situacao = 'ATIVA') sem e-mail
  const { data: leads, error } = await supabase
    .from('leads')
    .select('id, cnpj, razao_social, municipio, uf')
    .is('email', null)
    .eq('status', 'invalido')
    .eq('situacao', 'ATIVA')   // ← garante que só processa empresas ATIVAS
    .or(`email_buscado_em.is.null,email_buscado_em.lt.${retryApos}`)
    .order('created_at', { ascending: true })
    .limit(8)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!leads?.length) return NextResponse.json({ ok: true, enriquecidos: 0, motivo: 'sem leads elegíveis' })

  let enriquecidos = 0
  const detalhes: Record<string, { email?: string; metodo?: string; debug: string[] }> = {}

  for (const lead of leads) {
    const query   = `"${lead.razao_social.slice(0, 45)}" ${lead.municipio ?? ''} ${lead.uf ?? ''} email contato`
    const debugLog: string[] = []
    let emailFinal: string | null = null
    let metodo = ''

    // 1. SearXNG ──────────────────────────────────────────────────────────────
    const searx = await buscarSearX(query)
    debugLog.push(searx.debug)
    emailFinal = melhorEmail(searx.emails)
    if (emailFinal) { metodo = 'searx_snippet' }

    // 2. Bing ─────────────────────────────────────────────────────────────────
    if (!emailFinal) {
      await sleep(1000)
      const bing = await buscarBing(query)
      debugLog.push(bing.debug)
      emailFinal = melhorEmail(bing.emails)
      if (emailFinal) { metodo = 'bing_snippet' }

      // Site via Bing URL
      if (!emailFinal && bing.urls.length) {
        const emailsSite = await buscarEmailNaSite(bing.urls[0])
        emailFinal = melhorEmail(emailsSite)
        if (emailFinal) { metodo = 'bing_site' }
      }
    }

    // 3. DDG ──────────────────────────────────────────────────────────────────
    if (!emailFinal) {
      await sleep(1500)
      const ddg = await buscarDDG(query)
      debugLog.push(ddg.debug)
      emailFinal = melhorEmail(ddg.emails)
      if (emailFinal) { metodo = 'ddg_snippet' }

      if (!emailFinal && ddg.urls.length) {
        const emailsSite = await buscarEmailNaSite(ddg.urls[0])
        emailFinal = melhorEmail(emailsSite)
        if (emailFinal) { metodo = 'ddg_site' }
      }
    }

    // 4. Site via SearX URL ───────────────────────────────────────────────────
    if (!emailFinal && searx.urls.length) {
      const emailsSite = await buscarEmailNaSite(searx.urls[0])
      emailFinal = melhorEmail(emailsSite)
      if (emailFinal) { metodo = 'searx_site' }
    }

    // 5. Domínio deduzido ─────────────────────────────────────────────────────
    if (!emailFinal) {
      const emailsDom = await buscarEmailPorDominio(lead.razao_social)
      emailFinal = melhorEmail(emailsDom)
      if (emailFinal) { metodo = 'dominio_deduzido' }
    }

    // Atualiza o lead ─────────────────────────────────────────────────────────
    const update: Record<string, unknown> = { email_buscado_em: new Date().toISOString() }
    if (emailFinal) {
      update.email  = emailFinal
      update.status = 'pendente'
      enriquecidos++
      detalhes[lead.cnpj] = { email: emailFinal, metodo, debug: debugLog }
    } else {
      detalhes[lead.cnpj] = { debug: debugLog }
    }

    await supabase.from('leads').update(update).eq('id', lead.id)
    await sleep(800)
  }

  return NextResponse.json({
    ok:          true,
    enriquecidos,
    tentativas:  leads.length,
    detalhes,
  })
}

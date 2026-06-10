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
import { trackGoogleCSE, trackEnrichment } from '@/lib/uso-apis'

export const maxDuration = 300

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

const DOMINIOS_GENERICOS = new Set([
  'gmail.com','hotmail.com','yahoo.com.br','yahoo.com','outlook.com',
  'bol.com.br','uol.com.br','terra.com.br','ig.com.br','live.com',
  'msn.com','icloud.com','me.com','protonmail.com','tutanota.com',
  'hotmail.com.br','outlook.com.br',
])

const EMAIL_REGEX = /[\w.+%-]{2,}@[\w-]+\.[\w.]{2,}/g

// TLDs válidos — bloqueia coisas como fancybox@3.5.7 (versão de lib JS)
const TLD_VALIDO = /\.(com|net|org|gov|edu|mil|int|br|co|io|app|dev|info|biz|pro|mus|tel|mobi|name|aero|coop|museum|com\.br|net\.br|org\.br|gov\.br|edu\.br|adv\.br|eng\.br|med\.br|arq\.br)$/i

// E-mails/domínios que nunca são reais (placeholders, exemplos, testes)
const EMAIL_BLACKLIST = new Set([
  'exemplo@exemplo.com.br', 'example@example.com', 'email@email.com',
  'contato@empresa.com.br', 'email@dominio.com.br', 'seuemail@email.com',
  'nome@dominio.com', 'email@exemplo.com.br',
])
const DOMINIO_BLACKLIST = new Set([
  'exemplo.com.br', 'example.com', 'email.com', 'dominio.com.br',
  'empresa.com.br', 'test.com', 'teste.com.br', 'fake.com',
  'seusite.com.br', 'yoursite.com',
])

function extrairEmails(texto: string): string[] {
  const raw = texto.match(EMAIL_REGEX) ?? []
  return [...new Set(
    raw
      .map(e => e.toLowerCase().replace(/[.,;:>'")\]]+$/, ''))
      .filter(e => {
        if (!e.includes('@') || !e.includes('.')) return false
        if (e.endsWith('.') || e.includes('..')) return false
        if (e.length < 6 || e.length > 80) return false
        if (/\.(png|jpg|gif|svg|css|js|php|html|woff|ttf|eot|ico|xml|json|map)$/i.test(e)) return false
        // Domínio deve ter TLD real (bloqueia versões de libs como @3.5.7)
        const dominio = e.split('@')[1] ?? ''
        if (!TLD_VALIDO.test(dominio)) return false
        // Blacklists de placeholders conhecidos
        if (EMAIL_BLACKLIST.has(e)) return false
        if (DOMINIO_BLACKLIST.has(dominio)) return false
        // Domínio não pode ser só números (ex: @123.456)
        if (/^[\d.]+$/.test(dominio)) return false
        return true
      })
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

// ── Estratégia 1: Google Custom Search JSON API ───────────────────────────────
async function buscarGoogle(query: string): Promise<{ emails: string[]; urls: string[]; debug: string }> {
  const apiKey = process.env.GOOGLE_SEARCH_API_KEY
  const cx     = process.env.GOOGLE_SEARCH_ENGINE_ID
  if (!apiKey || !cx) return { emails: [], urls: [], debug: 'google: sem credenciais configuradas' }

  try {
    const q   = encodeURIComponent(query)
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${q}&gl=br&hl=pt&num=10`
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) })

    if (res.status === 429) return { emails: [], urls: [], debug: 'google: cota diária atingida (100/dia)' }
    if (!res.ok) return { emails: [], urls: [], debug: `google: HTTP ${res.status}` }

    trackGoogleCSE() // contabiliza uso diário (100 queries/dia compartilhado)
    const json = await res.json() as {
      items?: { link?: string; snippet?: string; title?: string }[]
    }
    const items = json.items ?? []
    // Extrai emails dos snippets e títulos
    const texto = items.map(i => `${i.title ?? ''} ${i.snippet ?? ''} ${i.link ?? ''}`).join(' ')
    const emails = extrairEmails(texto)
    const urls   = items.map(i => i.link ?? '').filter(u => u.startsWith('http')).slice(0, 4)
    return { emails, urls, debug: `google: ok (${items.length} resultados, ${emails.length} emails nos snippets)` }
  } catch (e) {
    return { emails: [], urls: [], debug: `google: ${String(e).slice(0, 80)}` }
  }
}

// ── Estratégia 2 (fallback): SearXNG (instâncias públicas, JSON) ──────────────
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
    const res = await fetch(`https://www.bing.com/search?q=${q}&setlang=pt-BR&cc=BR`, {
      headers: {
        'User-Agent': UA,
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Cookie': 'SRCHHPGUSR=SRCHLANG=pt',
      },
      signal: AbortSignal.timeout(12000),
    })
    if (!res.ok) return { emails: [], urls: [], debug: `bing: HTTP ${res.status}` }
    const html = await res.text()

    // Detecta página de captcha/bot
    if (html.includes('g.live.com/OR/') || html.includes('captcha') || html.length < 2000) {
      return { emails: [], urls: [], debug: `bing: bloqueado (captcha ou HTML curto: ${html.length}b)` }
    }

    const emails = extrairEmails(html)

    // Bing usa <cite> para mostrar a URL real dos resultados orgânicos
    const citeMatches = [...html.matchAll(/<cite[^>]*>(https?:\/\/[^<]+)<\/cite>/gi)]
      .map(m => m[1].trim())
      .filter(u => !u.includes('bing.com') && !u.includes('microsoft.com'))

    // Fallback: href direto de links externos
    const hrefMatches = [...html.matchAll(/href="(https?:\/\/(?!www\.bing\.com|microsoft\.com)[^"?#]{10,80})"/g)]
      .map(m => m[1])
      .filter(u => !u.includes('bing.com') && !u.includes('microsoft.com') && !u.includes('msn.com'))

    const urls = [...new Set([...citeMatches, ...hrefMatches])].slice(0, 4)
    return { emails, urls, debug: `bing: ok (${emails.length} emails, ${urls.length} urls, html=${html.length}b)` }
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
  // Filtro: leads dos últimos 20 anos — cobre toda a base histórica disponível
  const vinteAnosAtras = new Date(Date.now() - 20 * 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  const { data: leads, error } = await supabase
    .from('leads')
    .select('id, cnpj, razao_social, municipio, uf, porte')
    .is('email', null)
    .eq('status', 'invalido')
    .or(`email_buscado_em.is.null,email_buscado_em.lt.${retryApos}`)
    .gte('data_contrato', vinteAnosAtras)
    .order('data_contrato', { ascending: false })   // mais recentes primeiro
    .limit(25)  // 4 rodadas/dia × 25 = 100 queries Google CSE (free tier exato)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!leads?.length) return NextResponse.json({ ok: true, enriquecidos: 0, motivo: 'sem leads elegíveis' })

  let enriquecidos = 0
  const detalhes: Record<string, { email?: string; metodo?: string; debug: string[] }> = {}

  for (const lead of leads) {
    const query    = `"${lead.razao_social.slice(0, 45)}" ${lead.municipio ?? ''} ${lead.uf ?? ''} email contato`
    const debugLog: string[] = []
    let emailFinal: string | null = null
    let metodo = ''

    // 0. Domínio deduzido — gratuito, zero queries de API ────────────────────
    // Tenta deduzir o site da empresa pelo nome e buscar e-mail lá diretamente.
    // Se funcionar, economiza toda a chamada de busca abaixo.
    const emailsDom0 = await buscarEmailPorDominio(lead.razao_social)
    emailFinal = melhorEmail(emailsDom0)
    if (emailFinal) {
      metodo = 'dominio_deduzido'
      debugLog.push(`dominio: encontrou ${emailFinal}`)
    } else {
      debugLog.push('dominio: sem resultado')
    }

    // 1. Google Custom Search (principal — JSON confiável, 100/dia grátis) ────
    if (!emailFinal) {
      const google = await buscarGoogle(query)
      debugLog.push(google.debug)
      emailFinal = melhorEmail(google.emails)
      if (emailFinal) { metodo = 'google_snippet' }

      // Site via URLs do Google
      if (!emailFinal && google.urls.length) {
        for (const url of google.urls) {
          const es = await buscarEmailNaSite(url)
          emailFinal = melhorEmail(es)
          if (emailFinal) { metodo = 'google_site'; break }
          await sleep(300)
        }
      }
    }

    // 2. SearXNG (fallback gratuito se cota Google atingida) ──────────────────
    if (!emailFinal) {
      const searx = await buscarSearX(query)
      debugLog.push(searx.debug)
      emailFinal = melhorEmail(searx.emails)
      if (emailFinal) { metodo = 'searx_snippet' }

      if (!emailFinal && searx.urls.length) {
        for (const url of searx.urls) {
          const es = await buscarEmailNaSite(url)
          emailFinal = melhorEmail(es)
          if (emailFinal) { metodo = 'searx_site'; break }
          await sleep(300)
        }
      }
    }

    // 3. Bing (fallback HTML) ──────────────────────────────────────────────────
    if (!emailFinal) {
      await sleep(1000)
      const bing = await buscarBing(query)
      debugLog.push(bing.debug)
      emailFinal = melhorEmail(bing.emails)
      if (emailFinal) { metodo = 'bing_snippet' }

      if (!emailFinal && bing.urls.length) {
        for (const url of bing.urls) {
          const es = await buscarEmailNaSite(url)
          emailFinal = melhorEmail(es)
          if (emailFinal) { metodo = 'bing_site'; break }
          await sleep(300)
        }
      }
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

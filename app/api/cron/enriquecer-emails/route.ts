/**
 * Cron: enriquecer-emails
 * Horário: a cada 30 minutos
 *
 * Etapa 1: Para leads ATIVAS sem e-mail, tenta encontrar o e-mail corporativo via:
 *  1. Domínio deduzido do nome (sem quota)
 *  2. Google Custom Search JSON API (100/dia)
 *  3. SearXNG (instâncias públicas, fallback)
 *  4. Bing HTML scraping (fallback)
 *
 * A Etapa 0 (Receita Federal) foi separada para enriquecer-receita (a cada 5min).
 * Leads enriquecidos → status 'pendente'. Retry somente após 7 dias.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabase } from '@supabase/supabase-js'
import { verificarCronAuth, sistemaPausado } from '@/lib/cron-auth'
import { trackGoogleCSE } from '@/lib/uso-apis'
import { salvarResultadoCron, registrarCronLog } from '@/lib/cron-log'

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

/**
 * Pontua um e-mail considerando domínio corporativo, padrão de endereço e
 * (opcionalmente) compatibilidade com a razão social da empresa.
 * Scores: 0 = genérico/descartado, 1-3 = corporativo ok, 4-6 = corporativo preferido
 */
function scoreEmail(email: string, razaoSocial?: string): number {
  const dominio = email.split('@')[1] ?? ''
  if (DOMINIOS_GENERICOS.has(dominio)) return 0
  let score = 1
  // +2 se o domínio contém token da razão social → forte indício de que é da empresa
  if (razaoSocial && emailDominioCompativel(email, razaoSocial)) score += 2
  // +2 se é endereço de contato/departamento (mais estável que nome pessoal)
  if (/^(contato|comercial|vendas|financeiro|info|sac|atendimento|suporte|compras|licitacao|licitacoes|faleconosco)@/.test(email)) score += 2
  // +1 se parece nome pessoal corporativo (nome.sobrenome@empresa)
  else if (/^[a-z]{2,}[._][a-z]{2,}@/.test(email)) score += 1
  return score
}

function melhorEmail(emails: string[], razaoSocial?: string): string | null {
  const scored = emails.map(e => ({ e, s: scoreEmail(e, razaoSocial) })).filter(x => x.s > 0)
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

/**
 * Extrai tokens identificadores da razão social (palavras com ≥4 letras, sem stopwords).
 * Usado para verificar se uma página ou domínio realmente pertence à empresa.
 */
function tokenizarRazao(razao: string): string[] {
  return razao
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')   // remove acentos
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length >= 4 && !/^(ltda|eireli|eireli|comercio|comercial|industria|servicos|solucoes|empresa|brasil|grupo|nacional)$/.test(t))
}

/**
 * Retorna true se o domínio do e-mail contém pelo menos 1 token identificador
 * da razão social — sinal de que o email provavelmente pertence à empresa.
 * Ex: "construtora silva" → tokens ["construtora","silva"] → "silva@construtora.com.br" ✓
 */
function emailDominioCompativel(email: string, razaoSocial: string): boolean {
  const dominio = (email.split('@')[1] ?? '').replace(/\.(com\.br|com|net\.br|net|org\.br|org|br)$/i, '')
  const tokens  = tokenizarRazao(razaoSocial)
  return tokens.some(t => dominio.includes(t))
}

/**
 * Verifica se um bloco de texto (snippet ou HTML) menciona o CNPJ ou
 * pelo menos 2 tokens da razão social — confirma que a fonte realmente
 * é sobre esta empresa, não um email achado por coincidência.
 */
function textoMencaonaEmpresa(texto: string, cnpj: string, razaoSocial: string): boolean {
  const t = texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  // CNPJ formatado ou cru — mais forte, aceita só 1
  const cnpjFormatado = cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  if (t.includes(cnpj) || t.includes(cnpjFormatado.toLowerCase())) return true
  // Tokens da razão social — exige ≥2 tokens presentes
  const tokens = tokenizarRazao(razaoSocial)
  const matches = tokens.filter(tk => t.includes(tk))
  return matches.length >= 2
}

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

const MINHARECEITA = 'https://minhareceita.org'

async function consultarReceita(cnpj: string): Promise<string | null> {
  try {
    const res = await fetch(`${MINHARECEITA}/${cnpj}`, {
      headers: { Accept: 'application/json', 'User-Agent': 'MonitorLicitacoes/1.0' },
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) return null
    const dados = await res.json()
    const email = dados.email?.trim()?.toLowerCase()
    return email || null
  } catch { return null }
}

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
async function buscarEmailNaSite(
  baseUrl: string,
  cnpj?: string,
  razaoSocial?: string,
): Promise<string[]> {
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
      // Verificação cruzada: só extrai emails da página se ela menciona a empresa
      if (cnpj && razaoSocial && !textoMencaonaEmpresa(html, cnpj, razaoSocial)) {
        continue
      }
      emails.push(...extrairEmails(html))
      if (melhorEmail(emails, razaoSocial)) break
      await sleep(400)
    } catch { /* ignora */ }
  }
  return emails
}

// ── Estratégia 5: Domínio deduzido ──────────────────────────────────────────
async function buscarEmailPorDominio(razao: string, cnpj?: string): Promise<string[]> {
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
      const html = await res.text()
      // Verificação: a página deve mencionar a empresa antes de extrair emails
      if (cnpj && !textoMencaonaEmpresa(html, cnpj, razao)) continue
      const emails = extrairEmails(html)
      if (emails.length) return emails
    } catch { /* ignora */ }
  }
  return []
}

// ── Handler ──────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  console.log('[enriquecer-emails] iniciando')
  if (!verificarCronAuth(req)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  if (await sistemaPausado()) {
    return NextResponse.json({ ok: false, motivo: 'sistema pausado para manutencao' }, { status: 503 })
  }
  console.log('[enriquecer-emails] auth ok')

  const supabase = createSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: cfg } = await supabase
    .from('configuracoes').select('valor').eq('chave', 'captacao_ativa').maybeSingle()
  if (cfg && (cfg.valor === false || cfg.valor === 'false')) {
    return NextResponse.json({ ok: true, enriquecidos: 0, motivo: 'sistema pausado' })
  }
  console.log('[enriquecer-emails] cfg ok, buscando leads')

  // Etapa 0 (Receita Federal) foi movida para enriquecer-receita (*/5 min).
  // Este cron faz apenas a busca web de e-mail para leads ATIVAS sem e-mail.
  const inicioEtapa1 = Date.now()
  const vinteAnosAtras = new Date(Date.now() - 20 * 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  // Sem .or() em email_buscado_em — causa full scan mesmo com índice.
  // email_tentativas < 3 já garante no máximo 3 tentativas por lead.
  const { data: leads, error } = await supabase
    .from('leads')
    .select('id, cnpj, razao_social, nome_fantasia, municipio, uf, porte, email_tentativas')
    .is('email', null)
    .eq('status', 'invalido')
    .eq('situacao', 'ATIVA')
    .lt('email_tentativas', 3)
    .gte('data_contrato', vinteAnosAtras)
    .order('data_contrato', { ascending: false })
    .limit(60)

  console.log(`[enriquecer-emails] query leads: ${leads?.length ?? 0} encontrados, erro: ${error?.message ?? 'nenhum'}`)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!leads?.length) return NextResponse.json({
    ok: true, enriquecidos: 0, motivo: 'sem leads elegíveis para e-mail',
  })

  let enriquecidos = 0
  const detalhes: Record<string, { email?: string; metodo?: string; debug: string[] }> = {}

  // Processa leads em paralelo com concorrência 3 — ~3× mais throughput
  const CONCORRENCIA_EMAIL = 3
  const lotesEmail: typeof leads[] = []
  for (let i = 0; i < leads.length; i += CONCORRENCIA_EMAIL) {
    lotesEmail.push(leads.slice(i, i + CONCORRENCIA_EMAIL))
  }

  async function processarLead(lead: NonNullable<typeof leads>[0]) {
    const razao = lead.nome_fantasia?.trim() || (lead.razao_social ?? '').replace(/^\d{8}\s+/, '').trim()
    const cnpj  = lead.cnpj ?? ''
    // Query inclui CNPJ formatado para ancoragem — reduz falsos positivos em buscas
    const cnpjFmt = cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    const query = `"${razao.slice(0, 45)}" CNPJ ${cnpjFmt} email contato`
    const debugLog: string[] = []
    let emailFinal: string | null = null
    let metodo = ''

    // -1. Retry Receita Federal — pode ter e-mail agora que não tinha antes
    const emailReceita = await consultarReceita(cnpj)
    if (emailReceita) {
      emailFinal = emailReceita
      metodo = 'receita_federal'
      debugLog.push(`receita: encontrou ${emailFinal}`)
    } else {
      debugLog.push('receita: sem e-mail registrado')
    }

    // 0. Domínio deduzido — gratuito, zero queries de API
    if (!emailFinal) {
      const emailsDom0 = await buscarEmailPorDominio(razao, cnpj)
      emailFinal = melhorEmail(emailsDom0, razao)
      if (emailFinal) {
        metodo = 'dominio_deduzido'
        debugLog.push(`dominio: encontrou ${emailFinal}`)
      } else {
        debugLog.push('dominio: sem resultado')
      }
    }

    // 1. Google Custom Search (principal — JSON confiável, 100/dia grátis)
    if (!emailFinal) {
      const google = await buscarGoogle(query)
      debugLog.push(google.debug)
      // Só aceita emails de snippets que mencionam a empresa (verificação cruzada)
      const emailsVerificados = google.emails.filter(e => {
        const snippetTotal = google.urls.join(' ') + ' ' + query
        return textoMencaonaEmpresa(snippetTotal, cnpj, razao) || emailDominioCompativel(e, razao)
      })
      emailFinal = melhorEmail(emailsVerificados, razao)
      if (emailFinal) { metodo = 'google_snippet' }

      if (!emailFinal && google.urls.length) {
        for (const url of google.urls) {
          const es = await buscarEmailNaSite(url, cnpj, razao)
          emailFinal = melhorEmail(es, razao)
          if (emailFinal) { metodo = 'google_site'; break }
          await sleep(200)
        }
      }
    }

    // 2. SearXNG (fallback gratuito se cota Google atingida)
    if (!emailFinal) {
      const searx = await buscarSearX(query)
      debugLog.push(searx.debug)
      const emailsVerificados = searx.emails.filter(e =>
        textoMencaonaEmpresa(searx.urls.join(' '), cnpj, razao) || emailDominioCompativel(e, razao)
      )
      emailFinal = melhorEmail(emailsVerificados, razao)
      if (emailFinal) { metodo = 'searx_snippet' }

      if (!emailFinal && searx.urls.length) {
        for (const url of searx.urls) {
          const es = await buscarEmailNaSite(url, cnpj, razao)
          emailFinal = melhorEmail(es, razao)
          if (emailFinal) { metodo = 'searx_site'; break }
          await sleep(200)
        }
      }
    }

    // 3. Bing (fallback HTML)
    if (!emailFinal) {
      await sleep(500)
      const bing = await buscarBing(query)
      debugLog.push(bing.debug)
      const emailsVerificados = bing.emails.filter(e =>
        textoMencaonaEmpresa(bing.urls.join(' '), cnpj, razao) || emailDominioCompativel(e, razao)
      )
      emailFinal = melhorEmail(emailsVerificados, razao)
      if (emailFinal) { metodo = 'bing_snippet' }

      if (!emailFinal && bing.urls.length) {
        for (const url of bing.urls) {
          const es = await buscarEmailNaSite(url, cnpj, razao)
          emailFinal = melhorEmail(es, razao)
          if (emailFinal) { metodo = 'bing_site'; break }
          await sleep(200)
        }
      }
    }

    const tentativasAtual = (lead as { email_tentativas?: number }).email_tentativas ?? 0
    const update: Record<string, unknown> = {
      email_buscado_em:  new Date().toISOString(),
      email_tentativas:  tentativasAtual + 1,
    }
    if (emailFinal) {
      update.email             = emailFinal
      update.status            = 'pendente'
      update.email_tentativas  = 0  // reset ao encontrar e-mail
      enriquecidos++
      detalhes[lead.cnpj] = { email: emailFinal, metodo, debug: debugLog }
    } else {
      detalhes[lead.cnpj] = { debug: debugLog }
    }
    await supabase.from('leads').update(update).eq('id', lead.id)
  }

  for (const lote of lotesEmail) {
    // Saída antecipada: para com segurança se já gastou 230s
    if (Date.now() - inicioEtapa1 > 230_000) {
      console.log('[enriquecer-emails] tempo limite atingido, saindo antes do fim do lote')
      break
    }
    await Promise.all(lote.map(lead => processarLead(lead).catch(err => {
      console.error('[enriquecer-emails] lead crash:', lead.cnpj, err instanceof Error ? err.message : String(err))
    })))
    await sleep(400)
  }

  const resultado = {
    ok:         true,
    enriquecidos,
    tentativas: leads.length,
  }
  await registrarCronLog({ job: 'enriquecer-emails', status: 'ok', mensagem: `${enriquecidos} enriquecidos`, detalhes: resultado })
  await salvarResultadoCron(supabase, 'enriquecer-emails', resultado)
  return NextResponse.json({ ...resultado, detalhes })
}

/**
 * Cron: coletar-leads
 * Horário: a cada 10 minutos, 24/7
 *
 * Fluxo:
 *  1. Busca contratos publicados no PNCP no período
 *  2. Extrai CNPJs de fornecedores (apenas empresas — 14 dígitos)
 *  3. Ignora CNPJs já presentes na tabela leads
 *  4. Enriquece via BrasilAPI
 *  5. Filtra: apenas empresas ATIVAS (situacao_cadastral = '02') com e-mail
 *  6. Classifica em segmento via CNAE
 *  7. Insere novos leads com fonte='pncp_contrato'
 *
 * Backfill progressivo:
 *  - Chave 'captacao_backfill_data' em configuracoes guarda próximo dia
 *  - Janela de 30 dias por execução → ~4h para cobrir 2022–hoje
 *  - Após backfill: modo contínuo (ontem + hoje)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabase } from '@supabase/supabase-js'
import { verificarCronAuth } from '@/lib/cron-auth'
import { trackEnrichment } from '@/lib/uso-apis'
import { salvarResultadoCron, registrarCronLog } from '@/lib/cron-log'

export const maxDuration = 300

const PNCP_BASE  = 'https://pncp.gov.br/api/consulta/v1'
// minhareceita.org: dados Receita Federal, sem CF/rate-limit server-side
// BrasilAPI e cnpj.ws bloqueiam IPs compartilhados da Vercel
const CNPJ_API   = 'https://minhareceita.org'

// PNCP tem dados a partir de ~2021 — começar antes desperdiça execuções
const BACKFILL_INICIO  = '2021-01-01'
const JANELA_BACKFILL  = 7   // dias por execução — menor janela = menos dados = menos timeout
const JANELA_CONTINUA  = 2   // ontem + hoje no modo contínuo
const MAX_FALHAS_SKIP  = 5   // após N timeouts consecutivos no mesmo período, pula e avança

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }
const fmt    = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, '')
const fmtIso = (d: Date) => d.toISOString().slice(0, 10)

// ─── Segmentação por CNAE ─────────────────────────────────────────────────────
function mapearSegmento(cnae: string | null | undefined): string {
  if (!cnae) return 'outros'
  const c = cnae.toLowerCase()
  if (/constru|engenharia|obra|reform|pavimentaç/.test(c))          return 'construção'
  if (/tecnolog|informátic|software|sistema|hardware|ti\b|dados/.test(c)) return 'tecnologia'
  if (/saúde|hospital|médic|farmac|laborat|clínic|enfermag/.test(c)) return 'saúde'
  if (/limpeza|conservaç|higienizaç|saneament|desinfeç/.test(c))     return 'limpeza'
  if (/vigilânc|segurança|monitoram|portaria|armado/.test(c))        return 'segurança'
  if (/transport|logístic|frete|mudança|veícul|frota/.test(c))       return 'transporte'
  if (/aliment|nutriç|refeição|caterinг|merenda|buffet/.test(c))     return 'alimentação'
  if (/consult|assessor|gestão|planejam|auditoria/.test(c))          return 'consultoria'
  if (/educaç|treinament|capacitaç|ensino|curso|escola/.test(c))     return 'educação'
  if (/manutençã|reparo|instalação|calibraç|assistência técn/.test(c)) return 'manutenção'
  if (/paisag|jardim|arborizaç|verde/.test(c))                       return 'jardinagem'
  if (/gráfic|impres|copiaç|editoraç/.test(c))                       return 'gráfica'
  return 'outros'
}

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface PncpContrato {
  niFornecedor?:             string   // CPF ou CNPJ do fornecedor (campo correto na API PNCP)
  nomeRazaoSocialFornecedor?: string
  tipoPessoa?:               string   // 'PJ' | 'PF' | 'PE'
  objetoContrato?:           string
  valorInicial?:             number
  dataPublicacaoPncp?:       string
  tipoContrato?:             { id?: number; nome?: string; descricao?: string }
  modalidadeContratacao?:    { id?: number; nome?: string; descricao?: string }
  unidadeOrgao?:             { ufSigla?: string; municipioNome?: string }
}

// minhareceita.org — situacao_cadastral é número (2 = ATIVA), porte é string direta
interface CnpjWs {
  cnpj:                          string
  razao_social:                  string
  nome_fantasia?:                string
  situacao_cadastral:            number   // 2 = ATIVA, outros = inativa
  descricao_situacao_cadastral?: string   // "ATIVA", "BAIXADA", etc.
  porte?:                        string   // "DEMAIS", "PEQUENO PORTE", etc.
  cnae_fiscal_descricao?:        string
  email?:                        string
  ddd_telefone_1?:               string
  municipio?:                    string
  uf?:                           string
}

// ─── Busca PNCP ───────────────────────────────────────────────────────────────

async function buscarContratosPNCP(
  dataInicial: string, dataFinal: string, paginas = 26
): Promise<{ contratos: PncpContrato[]; debug: string[]; hadError: boolean }> {
  const todos: PncpContrato[] = []
  const debug: string[] = []
  let hadError = false
  for (let p = 1; p <= paginas; p++) {
    try {
      const url = `${PNCP_BASE}/contratos?dataInicial=${dataInicial}&dataFinal=${dataFinal}&pagina=${p}&tamanhoPagina=50`
      const res = await fetch(url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(45000) })
      debug.push(`p${p}: HTTP ${res.status}`)
      if (res.status === 204) {
        debug.push(`p${p}: sem conteúdo (204)`)
        break
      }
      if (!res.ok) {
        hadError = true
        debug.push(`p${p} erro: ${(await res.text().catch(() => '')).slice(0, 200)}`)
        break
      }
      const json = await res.json()
      const itens: PncpContrato[] = json.data ?? json ?? []
      debug.push(`p${p}: ${itens.length} itens, total=${json.totalRegistros ?? '?'}`)
      if (!itens.length) break
      // Apenas PJ (empresas, CNPJ 14 dígitos) — PF tem CPF de 11 dígitos
      todos.push(...itens.filter(c => c.niFornecedor && c.tipoPessoa !== 'PF'))
      if (itens.length < 50) break
    } catch (e) {
      hadError = true
      debug.push(`p${p}: exception ${String(e)}`)
      break
    }
  }
  return { contratos: todos, debug, hadError }
}

async function enriquecerCnpj(cnpj: string): Promise<CnpjWs | null> {
  try {
    const res = await fetch(`${CNPJ_API}/${cnpj}`, {
      headers: { Accept: 'application/json', 'User-Agent': 'MonitorLicitacoes/1.0' },
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) return null
    return await res.json()
  } catch { return null }
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  if (!verificarCronAuth(req)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const supabase = createSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Verificar se captação está ativa
  const { data: cfg } = await supabase
    .from('configuracoes')
    .select('valor')
    .eq('chave', 'captacao_ativa')
    .maybeSingle()
  if (cfg && (cfg.valor === false || cfg.valor === 'false')) {
    return NextResponse.json({ ok: true, novos: 0, motivo: 'sistema pausado' })
  }

  // ── Determinar período ────────────────────────────────────────────────────
  const hoje    = new Date()
  const hojeIso = fmtIso(hoje)

  const [{ data: cfgBf }, { data: cfgFalhas }] = await Promise.all([
    supabase.from('configuracoes').select('valor').eq('chave', 'captacao_backfill_data').maybeSingle(),
    supabase.from('configuracoes').select('valor').eq('chave', 'captacao_pncp_falhas_consecutivas').maybeSingle(),
  ])

  let ponteiro: string = (cfgBf?.valor as string) || BACKFILL_INICIO
  const emBackfill = ponteiro < hojeIso

  let dataInicial: string
  let dataFinal:   string
  let modoLabel:   string

  if (emBackfill) {
    const inicioDate = new Date(ponteiro)
    const fimDate    = new Date(inicioDate)
    fimDate.setDate(fimDate.getDate() + JANELA_BACKFILL - 1)
    if (fimDate > hoje) fimDate.setTime(hoje.getTime())
    dataInicial = fmt(inicioDate)
    dataFinal   = fmt(fimDate)
    modoLabel   = `backfill (${ponteiro} → ${fmtIso(fimDate)})`
  } else {
    const inicioDate = new Date(hoje)
    inicioDate.setDate(inicioDate.getDate() - JANELA_CONTINUA)
    dataInicial = fmt(inicioDate)
    dataFinal   = fmt(hoje)
    modoLabel   = `contínuo`
  }

  // ── 1. Buscar contratos PNCP ──────────────────────────────────────────────
  // Usa o default de 26 páginas (= até 1300 contratos por janela de 30 dias)
  const { contratos, debug: debugPncp, hadError } = await buscarContratosPNCP(dataInicial, dataFinal)

  if (!contratos.length) {
    if (emBackfill && hadError) {
      // Incrementa contador de falhas — após MAX_FALHAS_SKIP, pula o período
      const falhasAtual = parseInt((cfgFalhas?.valor as string) || '0', 10) || 0
      const falhasNovo  = falhasAtual + 1
      if (falhasNovo >= MAX_FALHAS_SKIP) {
        console.warn(`[coletar-leads] ${MAX_FALHAS_SKIP} falhas consecutivas em ${modoLabel} — pulando período`)
        await avancarPonteiro(supabase, dataFinal)
        await supabase.from('configuracoes').upsert(
          { chave: 'captacao_pncp_falhas_consecutivas', valor: '0' },
          { onConflict: 'chave' }
        )
        return NextResponse.json({
          ok: true, novos: 0, modo: modoLabel,
          mensagem: `Período pulado após ${MAX_FALHAS_SKIP} timeouts consecutivos`,
          pncp_debug: debugPncp,
        })
      }
      await supabase.from('configuracoes').upsert(
        { chave: 'captacao_pncp_falhas_consecutivas', valor: String(falhasNovo) },
        { onConflict: 'chave' }
      )
      return NextResponse.json({
        ok: false, novos: 0, modo: modoLabel,
        mensagem: `Erro ao buscar contratos PNCP — tentativa ${falhasNovo}/${MAX_FALHAS_SKIP}`,
        pncp_debug: debugPncp,
      })
    }
    if (emBackfill && !hadError) {
      await avancarPonteiro(supabase, dataFinal)
      await supabase.from('configuracoes').upsert(
        { chave: 'captacao_pncp_falhas_consecutivas', valor: '0' },
        { onConflict: 'chave' }
      )
    }
    return NextResponse.json({
      ok: true, novos: 0, modo: modoLabel,
      mensagem: 'Nenhum contrato encontrado no período',
      pncp_debug: debugPncp,
    })
  }

  // ── 2. Desduplicar CNPJs (apenas 14 dígitos = empresa) ───────────────────
  const cnpjMap = new Map<string, PncpContrato>()
  for (const c of contratos) {
    const raw = c.niFornecedor!.replace(/\D/g, '')
    if (raw.length === 14 && !cnpjMap.has(raw)) cnpjMap.set(raw, c)
  }
  const cnpjsNovos = [...cnpjMap.keys()]

  // ── 3. Separar: novos × já na base sem e-mail ────────────────────────────
  // Novos → inserir. Já na base sem email → só atualizar email/status se achar.
  const { data: existentes } = await supabase
    .from('leads')
    .select('cnpj, email')
    .in('cnpj', cnpjsNovos)
  const mapExistentes = new Map(
    (existentes ?? []).map((r: { cnpj: string; email: string | null }) => [r.cnpj, r.email])
  )
  const paraInserir   = cnpjsNovos.filter(c => !mapExistentes.has(c))
  const paraAtuEmail  = cnpjsNovos.filter(c => mapExistentes.has(c) && mapExistentes.get(c) == null)
  // Pool total para processar nesta execução
  const paraEnriquecer = [...paraInserir, ...paraAtuEmail]

  // Chegou aqui = sucesso na busca PNCP — zera contador de falhas
  await supabase.from('configuracoes').upsert(
    { chave: 'captacao_pncp_falhas_consecutivas', valor: '0' },
    { onConflict: 'chave' }
  )

  if (!paraEnriquecer.length) {
    if (emBackfill) await avancarPonteiro(supabase, dataFinal)
    return NextResponse.json({
      ok: true, novos: 0, modo: modoLabel,
      mensagem: 'Todos os CNPJs já na base com e-mail',
      total_contratos_pncp: contratos.length,
    })
  }

  // ── 4. Inserir TODOS os CNPJs novos imediatamente com dados do contrato ───
  // Garante que nenhum CNPJ seja perdido por falha/timeout de API posterior.
  // O ponteiro avança aqui — após garantir que tudo foi salvo.
  let inseridos = 0
  for (const cnpj of paraInserir) {
    const contrato = cnpjMap.get(cnpj)!
    const modalidade = contrato.modalidadeContratacao?.nome
                    ?? contrato.modalidadeContratacao?.descricao
                    ?? contrato.tipoContrato?.nome
                    ?? contrato.tipoContrato?.descricao
                    ?? null
    const { error } = await supabase.from('leads').upsert({
      cnpj,
      razao_social:  contrato.nomeRazaoSocialFornecedor ?? cnpj,
      municipio:     contrato.unidadeOrgao?.municipioNome ?? null,
      uf:            contrato.unidadeOrgao?.ufSigla ?? null,
      modalidade,
      objeto:        (contrato.objetoContrato ?? '').slice(0, 200) || null,
      valor:         contrato.valorInicial ?? null,
      data_contrato: contrato.dataPublicacaoPncp?.slice(0, 10) ?? null,
      status:        'invalido',   // será atualizado após enriquecimento
      situacao:      null,         // null = aguardando check Receita Federal
      fonte:         'pncp_contrato',
    }, { onConflict: 'cnpj', ignoreDuplicates: true })
    if (!error) inseridos++
  }

  // Ponteiro avança depois da inserção — todos os CNPJs já estão na base
  if (emBackfill) await avancarPonteiro(supabase, dataFinal)

  // ── 5. Enriquecer via minhareceita.org (cap = LOTE) — atualiza os já inseridos
  // Se minhareceita retornar null (erro/timeout): fica com dados parciais do
  // contrato — enriquecer-emails buscará Receita + e-mail nas próximas rodadas.
  // Se inativa (baixada/suspensa): salva situacao, mantém status='invalido'.
  const LOTE = 50
  let comEmail = 0, situacaoAtualizada = 0, brasilApiOk = 0, brasilApiNull = 0, inativas = 0

  // Para atualização de e-mail nos leads já existentes (paraAtuEmail)
  const todoEnriquecimento = [...paraInserir, ...paraAtuEmail]

  for (let i = 0; i < Math.min(todoEnriquecimento.length, LOTE); i++) {
    const cnpj   = todoEnriquecimento[i]
    const ehNovo = paraInserir.includes(cnpj)
    const dados  = await enriquecerCnpj(cnpj)
    await sleep(500) // ~2 req/s

    if (!dados) {
      brasilApiNull++
      // CNPJ já está na base com dados parciais — enriquecer-emails fará retry
      continue
    }
    brasilApiOk++
    trackEnrichment()

    const emailRaw = dados.email?.trim()
    const cnae     = dados.cnae_fiscal_descricao ?? null
    const ativa    = dados.situacao_cadastral === 2

    if (!ativa) {
      inativas++
      // Empresa inativa: registra situacao para não tentar e-mail depois
      await supabase.from('leads').update({
        razao_social:  dados.razao_social,
        situacao:      dados.descricao_situacao_cadastral ?? 'INATIVA',
        cnae, porte: dados.porte ?? null,
        status: 'invalido',
      }).eq('cnpj', cnpj).is('situacao', null)  // só se ainda não verificada
      situacaoAtualizada++
      continue
    }

    if (!ehNovo) {
      // Lead existente — só atualiza e-mail se encontrou um agora
      if (!emailRaw) { situacaoAtualizada++; continue }
      const { error } = await supabase.from('leads')
        .update({ email: emailRaw.toLowerCase(), status: 'pendente' })
        .eq('cnpj', cnpj).is('email', null)
      if (!error) { comEmail++; situacaoAtualizada++ }
      continue
    }

    const contrato   = cnpjMap.get(cnpj)!
    const modalidade = contrato.modalidadeContratacao?.nome
                    ?? contrato.modalidadeContratacao?.descricao
                    ?? contrato.tipoContrato?.nome
                    ?? contrato.tipoContrato?.descricao
                    ?? null
    const { error } = await supabase.from('leads').update({
      razao_social:  dados.razao_social,
      nome_fantasia: dados.nome_fantasia ?? null,
      email:         emailRaw ? emailRaw.toLowerCase() : null,
      telefone:      dados.ddd_telefone_1 ?? null,
      municipio:     dados.municipio ?? contrato.unidadeOrgao?.municipioNome ?? null,
      uf:            dados.uf ?? contrato.unidadeOrgao?.ufSigla ?? null,
      situacao:      dados.descricao_situacao_cadastral ?? 'ATIVA',
      porte:         dados.porte ?? null,
      cnae, segmento: mapearSegmento(cnae), modalidade,
      status:        emailRaw ? 'pendente' : 'invalido',
    }).eq('cnpj', cnpj)
    if (!error) {
      situacaoAtualizada++
      if (emailRaw) comEmail++
    } else {
      console.error('[coletar-leads] update error:', error.message)
    }
  }

  console.log(`[coletar-leads] ${modoLabel} → ${inseridos} salvos, ${situacaoAtualizada} receita-ok, ${comEmail} com-email`)
  const resultado = {
    ok: true,
    modo: modoLabel,
    salvos: inseridos,
    cnpjs_novos: paraInserir.length,
    total_contratos_pncp: contratos.length,
    receita: { ok: brasilApiOk, sem_resposta: brasilApiNull, inativas, com_email: comEmail, situacao_atualizada: situacaoAtualizada },
  }
  await registrarCronLog({ job: 'coletar-leads', status: 'ok', mensagem: `${inseridos} salvos, ${comEmail} com e-mail`, detalhes: resultado })
  await salvarResultadoCron(supabase, 'coletar-leads', resultado)
  return NextResponse.json(resultado)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function avancarPonteiro(supabase: any, dataFinalFmt: string) {
  const d = new Date(dataFinalFmt.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'))
  d.setDate(d.getDate() + 1)
  const proximo = d.toISOString().slice(0, 10)
  await supabase.from('configuracoes').upsert(
    { chave: 'captacao_backfill_data', valor: proximo },
    { onConflict: 'chave' }
  )
}

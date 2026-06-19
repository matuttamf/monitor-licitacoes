/**
 * Cron: enriquecer-leads  (enriquecimento puro — sem PNCP)
 * Horário: a cada 15 minutos
 *
 * Responsabilidade ÚNICA: pegar CNPJs que estão na tabela leads com
 * situacao=null (ainda não verificados na Receita Federal) e enriquecê-los
 * via minhareceita.org, atualizando email, situação, CNAE, porte, segmento.
 *
 * Vantagens da separação:
 *  - coletar-leads roda rápido (só PNCP + INSERT)
 *  - Este cron drena o backlog sem interferir na coleta
 *  - Uma única query no banco por execução (SELECT pendentes)
 *  - Sem limite de 50: processa 80 por run (~10 min a 500ms/cnpj)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabase } from '@supabase/supabase-js'
import { verificarCronAuth, sistemaPausado } from '@/lib/cron-auth'
import { trackEnrichment } from '@/lib/uso-apis'
import { salvarResultadoCron, registrarCronLog } from '@/lib/cron-log'
import { mapearSegmento } from '@/lib/leads/segmento'

export const maxDuration = 300

const CNPJ_API = 'https://minhareceita.org'
const LOTE     = 80   // ~10 min a 500ms/req + overhead

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

interface MinhaReceita {
  cnpj:                          string
  razao_social:                  string
  nome_fantasia?:                string
  situacao_cadastral:            number   // 2 = ATIVA
  descricao_situacao_cadastral?: string
  email?:                        string
  ddd_telefone_1?:               string
  municipio?:                    string
  uf?:                           string
  porte?:                        string
  cnae_fiscal_descricao?:        string
  cnae_fiscal?:                  number
}

async function enriquecerCnpj(cnpj: string): Promise<MinhaReceita | null> {
  try {
    const res = await fetch(`${CNPJ_API}/${cnpj}`, {
      headers: { Accept: 'application/json', 'User-Agent': 'MonitorLicitacoes/1.0' },
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) return null
    return await res.json()
  } catch { return null }
}

export async function GET(req: NextRequest) {
  if (!verificarCronAuth(req)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  if (await sistemaPausado()) return NextResponse.json({ ok: false, motivo: 'sistema pausado' }, { status: 503 })

  const supabase = createSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // ── Uma única query: pegar backlog de CNPJs sem enriquecimento ─────────────
  // situacao IS NULL = ainda não verificado na Receita Federal
  // Prioriza mais recentes (data_contrato DESC) para ter leads quentes primeiro
  const { data: pendentes, error: errQuery } = await supabase
    .from('leads')
    .select('cnpj')
    .is('situacao', null)
    .order('created_at', { ascending: false })
    .limit(LOTE)

  if (errQuery) {
    console.error('[enriquecer-leads] query error:', errQuery.message)
    return NextResponse.json({ ok: false, erro: errQuery.message }, { status: 500 })
  }

  if (!pendentes?.length) {
    return NextResponse.json({ ok: true, processados: 0, mensagem: 'Backlog vazio — nenhum CNPJ pendente' })
  }

  const cnpjs = pendentes.map((r: { cnpj: string }) => r.cnpj)

  // ── Enriquecer cada CNPJ via minhareceita.org ─────────────────────────────
  let processados = 0, comEmail = 0, ativas = 0, inativas = 0, semResposta = 0

  for (const cnpj of cnpjs) {
    const dados = await enriquecerCnpj(cnpj)
    await sleep(500)   // ~2 req/s respeitando rate limit

    if (!dados) {
      semResposta++
      // Marca com situacao='TIMEOUT' para não ficar em loop eterno
      // Uma query periódica de limpeza pode resetar esses para retry
      await supabase.from('leads')
        .update({ situacao: 'TIMEOUT' })
        .eq('cnpj', cnpj)
        .is('situacao', null)
      continue
    }

    trackEnrichment()
    processados++

    const ativa        = dados.situacao_cadastral === 2
    const emailRaw     = dados.email?.trim()
    const cnae         = dados.cnae_fiscal_descricao ?? null
    const cnae_codigo  = dados.cnae_fiscal ? String(dados.cnae_fiscal).replace(/\D/g, '') : null
    const situacaoDesc = dados.descricao_situacao_cadastral ?? (ativa ? 'ATIVA' : 'INATIVA')

    if (!ativa) {
      inativas++
      // BAIXADA e INAPTA são irreversíveis — remove do banco
      if (['BAIXADA', 'INAPTA'].includes(situacaoDesc.toUpperCase())) {
        await supabase.from('leads').delete().eq('cnpj', cnpj)
      } else {
        await supabase.from('leads').update({
          razao_social: dados.razao_social,
          situacao:     situacaoDesc,
          cnae, cnae_codigo,
          porte:        dados.porte ?? null,
          status:       'invalido',
        }).eq('cnpj', cnpj)
      }
      continue
    }

    ativas++
    const { error } = await supabase.from('leads').update({
      razao_social:  dados.razao_social,
      nome_fantasia: dados.nome_fantasia ?? null,
      email:         emailRaw ? emailRaw.toLowerCase() : null,
      telefone:      dados.ddd_telefone_1 ?? null,
      municipio:     dados.municipio ?? null,
      uf:            dados.uf ?? null,
      situacao:      situacaoDesc,
      porte:         dados.porte ?? null,
      cnae, cnae_codigo,
      segmento:      mapearSegmento(cnae),
      status:        emailRaw ? 'pendente' : 'invalido',
    }).eq('cnpj', cnpj)

    if (!error && emailRaw) comEmail++
  }

  const resultado = {
    ok: true,
    lote:        cnpjs.length,
    processados,
    sem_resposta: semResposta,
    ativas,
    inativas,
    com_email:   comEmail,
  }

  console.log(`[enriquecer-leads] ${cnpjs.length} tentados → ${processados} ok, ${comEmail} com e-mail, ${semResposta} timeout`)
  await registrarCronLog({ job: 'enriquecer-leads', status: 'ok', mensagem: `${processados} ok, ${comEmail} com e-mail`, detalhes: resultado })
  await salvarResultadoCron(supabase, 'enriquecer-leads', resultado)
  return NextResponse.json(resultado)
}

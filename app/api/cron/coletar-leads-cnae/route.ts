/**
 * Cron: coletar-leads-cnae
 * Horário: sábados às 6h (semanal)
 *
 * Coleta CNPJs da base de dados abertos da Receita Federal,
 * filtrados pelos CNAEs das empresas que já participam de licitações.
 * Esses leads são marcados com origem='cnae' e filtráveis separadamente.
 *
 * Fluxo:
 * 1. Lê top CNAEs dos leads com origem='participante' (campo cnae_codigo)
 * 2. Baixa arquivo Estabelecimentos da RF (stream ZIP → DEFLATE → CSV)
 * 3. Filtra: ATIVA + MATRIZ + CNAE na lista alvo
 * 4. Insere com origem='cnae', status='invalido' (enriquecer-receita preenche depois)
 * 5. Avança para próximo arquivo no estado (configuracoes)
 *
 * Estado em configuracoes.coletar_leads_cnae_estado (JSON):
 *   { file_idx: 0-9, rows_processed: N, ano: YYYY, mes: M }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabase } from '@supabase/supabase-js'
import { verificarCronAuth } from '@/lib/cron-auth'
import { salvarResultadoCron } from '@/lib/cron-log'
import { createInflateRaw } from 'node:zlib'

export const maxDuration = 300

const MAX_LEADS_POR_EXECUCAO = 2000
const MAX_LINHAS_VARRER      = 600_000

// CNAEs padrão caso ainda não existam leads com cnae_codigo preenchido.
// Representa setores mais comuns em licitações públicas.
const CNAE_SEED = new Set([
  '4789005', // equipamentos e artigos médicos/odontológicos
  '6209100', // suporte técnico em TI
  '8121400', // limpeza de prédios
  '4322301', // instalações hidráulicas
  '4330404', // esquadrias e divisórias
  '4744001', // material de construção
  '4771701', // farmácias
  '4754701', // móveis para escritório
  '8111700', // serviços de zeladoria
  '5250801', // transporte de valores e segurança
])

// Índices das colunas no CSV de Estabelecimentos (separador: |, sem header)
// CNPJ_BASICO|CNPJ_ORDEM|CNPJ_DV|MATFIL|NOME_FANTASIA|SITUACAO|...|CNAE_PRINC|...|UF|MUNICIPIO|...|EMAIL|...
const COL = { BASICO: 0, ORDEM: 1, DV: 2, MATFIL: 3, SITUACAO: 5, CNAE: 11, UF: 19, MUNICIPIO: 20, EMAIL: 27 }

interface CnaeEstado {
  file_idx:       number
  rows_processed: number
  ano:            number
  mes:            number
}

function getRFUrl(fileIdx: number, ano: number, mes: number): string {
  return `https://dados.rfb.gov.br/CNPJ/dados_abertos_cnpj/${ano}-${String(mes).padStart(2, '0')}/Estabelecimentos${fileIdx}.zip`
}

function getAnoMes(): { ano: number; mes: number } {
  const d = new Date()
  d.setMonth(d.getMonth() - 2) // RF publica com ~2 meses de atraso
  return { ano: d.getFullYear(), mes: d.getMonth() + 1 }
}

async function getTargetCnaes(supabase: ReturnType<typeof createSupabase>): Promise<Set<string>> {
  const { data } = await supabase
    .from('leads')
    .select('cnae_codigo')
    .eq('origem', 'participante')
    .not('cnae_codigo', 'is', null)
    .limit(5000)

  if (!data?.length) return CNAE_SEED

  const counts: Record<string, number> = {}
  for (const r of data) {
    const code = String(r.cnae_codigo).replace(/\D/g, '').slice(0, 7)
    if (code.length >= 4) counts[code] = (counts[code] ?? 0) + 1
  }

  const top = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50)
    .map(([c]) => c)

  return top.length ? new Set(top) : CNAE_SEED
}

interface LeadRow {
  cnpj:         string
  razao_social: string
  email:        string | null
  uf:           string | null
  municipio:    string | null
  cnae_codigo:  string | null
  status:       'invalido'
  situacao:     null
  origem:       'cnae'
}

async function processarArquivoRF(
  url:         string,
  targetCnaes: Set<string>,
  skipRows:    number,
  maxLeads:    number,
): Promise<{ leads: LeadRow[]; rowsProcessed: number; esgotado: boolean; erro?: string }> {
  const leads: LeadRow[] = []
  let rowsProcessed = 0
  let esgotado      = false
  let shouldStop    = false
  const abortCtrl   = new AbortController()

  let res: Response
  try {
    res = await fetch(url, {
      signal:  abortCtrl.signal,
      headers: { 'User-Agent': 'MonitorLicitacoes/1.0', Accept: '*/*' },
    })
  } catch (e) {
    return { leads, rowsProcessed, esgotado, erro: `fetch falhou: ${e}` }
  }

  if (!res.ok) {
    return { leads, rowsProcessed, esgotado, erro: `HTTP ${res.status} da Receita Federal` }
  }
  if (!res.body) {
    return { leads, rowsProcessed, esgotado, erro: 'body vazio' }
  }

  // Infla o DEFLATE contido dentro do ZIP
  const inflate  = createInflateRaw()
  let lineBuffer = ''
  let rowsSkipped = 0

  inflate.on('data', (chunk: Buffer) => {
    if (shouldStop) return
    lineBuffer += chunk.toString('latin1')

    let nl: number
    while ((nl = lineBuffer.indexOf('\n')) !== -1) {
      const line = lineBuffer.slice(0, nl).trimEnd()
      lineBuffer  = lineBuffer.slice(nl + 1)

      rowsProcessed++
      if (rowsProcessed > MAX_LINHAS_VARRER) { shouldStop = true; break }

      if (rowsSkipped < skipRows) { rowsSkipped++; continue }

      const cols = line.split('|')
      if (cols.length < 28) continue
      if (cols[COL.MATFIL]  !== '1')  continue  // só MATRIZ
      if (cols[COL.SITUACAO] !== '02') continue  // só ATIVA

      const cnae = cols[COL.CNAE].trim().replace(/\D/g, '')
      if (!targetCnaes.has(cnae)) continue

      const cnpj = (cols[COL.BASICO] + cols[COL.ORDEM] + cols[COL.DV]).replace(/\D/g, '')
      if (cnpj.length !== 14) continue

      leads.push({
        cnpj,
        razao_social: cnpj,                                  // Receita preencherá depois
        email:        cols[COL.EMAIL]?.trim()   || null,
        uf:           cols[COL.UF]?.trim()      || null,
        municipio:    cols[COL.MUNICIPIO]?.trim() || null,
        cnae_codigo:  cnae || null,
        status:       'invalido',
        situacao:     null,
        origem:       'cnae',
      })

      if (leads.length >= maxLeads) { shouldStop = true; break }
    }

    if (shouldStop) abortCtrl.abort()
  })

  inflate.on('end', () => { esgotado = true })

  // Lê o ZIP, pula o cabeçalho local (30 bytes + filename + extra) e alimenta o inflate
  const reader       = res.body.getReader()
  let headerBuffer   = Buffer.alloc(0)
  let headerParsed   = false
  let deflateStart   = -1

  try {
    while (!shouldStop) {
      const { done, value } = await reader.read()
      if (done) {
        inflate.end()
        // Aguarda o inflate terminar de processar o buffer restante
        await new Promise<void>((resolve, reject) => {
          if (esgotado) return resolve()
          inflate.once('end',   resolve)
          inflate.once('error', reject)
        }).catch(() => {/* ignorar erros de aborto */})
        break
      }

      const chunk = Buffer.from(value)

      if (!headerParsed) {
        headerBuffer = Buffer.concat([headerBuffer, chunk])
        if (headerBuffer.length >= 30) {
          const fnameLen  = headerBuffer.readUInt16LE(26)
          const extraLen  = headerBuffer.readUInt16LE(28)
          deflateStart    = 30 + fnameLen + extraLen

          if (headerBuffer.length >= deflateStart) {
            headerParsed = true
            const deflateData = headerBuffer.subarray(deflateStart)
            if (deflateData.length > 0) inflate.write(deflateData)
            headerBuffer = Buffer.alloc(0)
          }
        }
      } else {
        inflate.write(chunk)
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (!msg.toLowerCase().includes('abort') && !msg.includes('ERR_ABORTED')) {
      return { leads, rowsProcessed, esgotado, erro: `stream erro: ${msg}` }
    }
  } finally {
    reader.releaseLock()
  }

  return { leads, rowsProcessed, esgotado }
}

export async function GET(req: NextRequest) {
  if (!verificarCronAuth(req)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const supabase = createSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Verificar se captação está ativa
  const { data: cfgAtiva } = await supabase
    .from('configuracoes').select('valor').eq('chave', 'captacao_ativa').maybeSingle()
  if (cfgAtiva && (cfgAtiva.valor === false || cfgAtiva.valor === 'false')) {
    return NextResponse.json({ ok: true, inseridos: 0, motivo: 'sistema pausado' })
  }

  // Carregar estado
  const { data: cfgEstado } = await supabase
    .from('configuracoes').select('valor').eq('chave', 'coletar_leads_cnae_estado').maybeSingle()

  const { ano: anoAtual, mes: mesAtual } = getAnoMes()
  const estado: CnaeEstado = cfgEstado?.valor
    ? (cfgEstado.valor as CnaeEstado)
    : { file_idx: 0, rows_processed: 0, ano: anoAtual, mes: mesAtual }

  // Se mudou o período mensal, reinicia do arquivo 0
  if (estado.ano !== anoAtual || estado.mes !== mesAtual) {
    estado.file_idx       = 0
    estado.rows_processed = 0
    estado.ano            = anoAtual
    estado.mes            = mesAtual
  }

  if (estado.file_idx > 9) {
    return NextResponse.json({ ok: true, inseridos: 0, motivo: 'todos os 10 arquivos processados neste mês' })
  }

  // Obter CNAEs alvo
  const targetCnaes = await getTargetCnaes(supabase)
  const url = getRFUrl(estado.file_idx, estado.ano, estado.mes)

  console.log(`[coletar-leads-cnae] arquivo=${estado.file_idx} skip=${estado.rows_processed} cnae_alvo=${targetCnaes.size} url=${url}`)

  const { leads, rowsProcessed, esgotado, erro } = await processarArquivoRF(
    url,
    targetCnaes,
    estado.rows_processed,
    MAX_LEADS_POR_EXECUCAO,
  )

  if (erro) {
    await salvarResultadoCron(supabase, 'coletar-leads-cnae', { ok: false, erro, file_idx: estado.file_idx })
    return NextResponse.json({ ok: false, erro })
  }

  // Inserir leads (ignora duplicatas por CNPJ)
  let inseridos = 0
  const LOTE = 100
  for (let i = 0; i < leads.length; i += LOTE) {
    const lote = leads.slice(i, i + LOTE)
    const { error } = await supabase
      .from('leads')
      .upsert(lote, { onConflict: 'cnpj', ignoreDuplicates: true })
    if (!error) inseridos += lote.length
  }

  // Atualizar estado
  const novoEstado: CnaeEstado = {
    ...estado,
    rows_processed: estado.rows_processed + rowsProcessed,
    file_idx:       esgotado ? estado.file_idx + 1 : estado.file_idx,
  }

  if (esgotado) novoEstado.rows_processed = 0  // próximo arquivo começa do zero

  await supabase.from('configuracoes').upsert(
    { chave: 'coletar_leads_cnae_estado', valor: novoEstado },
    { onConflict: 'chave' }
  )

  const resultado = {
    ok: true,
    inseridos,
    leads_encontrados: leads.length,
    linhas_varridas:   rowsProcessed,
    esgotado,
    file_idx:          estado.file_idx,
    proximo_arquivo:   esgotado ? estado.file_idx + 1 : estado.file_idx,
    cnae_alvo:         targetCnaes.size,
  }

  await salvarResultadoCron(supabase, 'coletar-leads-cnae', resultado)
  return NextResponse.json(resultado)
}

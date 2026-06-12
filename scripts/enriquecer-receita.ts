/**
 * Script: enriquecer-receita
 * Consulta minhareceita.org para todos os leads com situacao=null.
 * Atualiza: razao_social, situacao, cnae, cnae_codigo, porte, email, telefone, municipio, uf, status.
 * Sem limite de registros — processa tudo de uma vez.
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!
const MINHARECEITA = 'https://minhareceita.org'
const CONCORRENCIA = 5
const LOTE         = 500

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

async function consultarCNPJ(cnpj: string) {
  try {
    const res = await fetch(`${MINHARECEITA}/${cnpj}`, {
      headers: { Accept: 'application/json', 'User-Agent': 'MonitorLicitacoes/1.0' },
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) return null
    return await res.json()
  } catch { return null }
}

async function main() {
  console.log('=== Enriquecer Receita Federal ===')

  let offset = 0
  let totalVerificados = 0, totalAtivos = 0, totalInativos = 0, totalSemDados = 0

  while (true) {
    const { data: leads, error } = await supabase
      .from('leads')
      .select('id, cnpj, email')
      .eq('status', 'invalido')
      .range(offset, offset + LOTE - 1)

    if (error) { console.error('Erro ao buscar leads:', error.message); break }
    if (!leads || leads.length === 0) break

    console.log(`\nLote ${Math.floor(offset / LOTE) + 1}: ${leads.length} leads`)

    const grupos: typeof leads[] = []
    for (let i = 0; i < leads.length; i += CONCORRENCIA) {
      grupos.push(leads.slice(i, i + CONCORRENCIA))
    }

    for (const grupo of grupos) {
      await Promise.all(grupo.map(async lead => {
        const dados = await consultarCNPJ(lead.cnpj)
        if (!dados) { totalSemDados++; return }

        totalVerificados++
        const emailDaReceita = dados.email?.trim()?.toLowerCase() || null
        const emailFinal     = emailDaReceita ?? lead.email ?? null
        const ativa          = dados.situacao_cadastral === 2
        const cnaeCode       = String(dados.cnae_fiscal ?? '').replace(/\D/g, '') || null
        const telefone       = dados.ddd_telefone_1?.trim() || dados.ddd_telefone_2?.trim() || null

        if (!ativa) {
          totalInativos++
          await supabase.from('leads').update({
            razao_social: dados.razao_social ?? lead.cnpj,
            situacao:     dados.descricao_situacao_cadastral ?? 'INATIVA',
            cnae:         dados.cnae_fiscal_descricao ?? null,
            cnae_codigo:  cnaeCode,
            porte:        dados.porte ?? null,
            telefone,
            municipio:    dados.municipio ?? null,
            uf:           dados.uf ?? null,
            status:       'invalido',
          }).eq('id', lead.id)
          return
        }

        totalAtivos++
        await supabase.from('leads').update({
          razao_social:  dados.razao_social,
          nome_fantasia: dados.nome_fantasia ?? null,
          email:         emailFinal,
          telefone,
          municipio:     dados.municipio ?? null,
          uf:            dados.uf ?? null,
          situacao:      dados.descricao_situacao_cadastral ?? 'ATIVA',
          porte:         dados.porte ?? null,
          cnae:          dados.cnae_fiscal_descricao ?? null,
          cnae_codigo:   cnaeCode,
          status:        emailFinal ? 'pendente' : 'invalido',
        }).eq('id', lead.id)
      }))
      await sleep(200) // evitar rate limit
    }

    console.log(`  verificados=${totalVerificados} ativos=${totalAtivos} inativas=${totalInativos} sem_dados=${totalSemDados}`)
    offset += LOTE

    if (leads.length < LOTE) break
  }

  console.log(`\n✓ Concluído: ${totalVerificados} verificados, ${totalAtivos} ativos, ${totalInativos} inativas, ${totalSemDados} sem dados`)
}

main().catch(e => { console.error(e); process.exit(1) })

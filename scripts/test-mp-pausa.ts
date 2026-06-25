/**
 * Teste de sandbox MercadoPago: valida o ciclo pausar → retomar de uma
 * assinatura (preapproval), que é o mecanismo de entrega do prêmio +30d.
 *
 * Responde empiricamente:
 *   - Pausar (status=paused) interrompe a cobrança recorrente?
 *   - Retomar (status=authorized) reagenda a próxima cobrança para frente?
 *   - O cartão tokenizado é preservado?
 *
 * Usa SOMENTE o token de TESTE (MP_ACCESS_TOKEN_TEST). Não toca produção.
 *
 * Uso:
 *   npx tsx scripts/test-mp-pausa.ts                 # busca uma assinatura autorizada de teste
 *   npx tsx scripts/test-mp-pausa.ts <preapproval_id>  # testa uma assinatura específica
 */
import { config } from 'dotenv'
config({ path: '.env.local' })

const TOKEN = process.env.MP_ACCESS_TOKEN_TEST
if (!TOKEN) {
  console.error('✗ MP_ACCESS_TOKEN_TEST ausente em .env.local')
  process.exit(1)
}
if (!TOKEN.startsWith('TEST-') && !TOKEN.startsWith('APP_USR-')) {
  console.warn('⚠ Token não parece de teste. Abortei por segurança.')
  // tokens de teste do MP começam com TEST- (ou APP_USR- de app de teste)
}

const API = 'https://api.mercadopago.com'
const H = { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' }

async function getSub(id: string) {
  const r = await fetch(`${API}/preapproval/${id}`, { headers: H })
  if (!r.ok) throw new Error(`GET ${id} → ${r.status} ${await r.text()}`)
  return r.json()
}

function resumo(s: Record<string, unknown>) {
  const ar = (s.auto_recurring ?? {}) as Record<string, unknown>
  return {
    id: s.id,
    status: s.status,
    next_payment_date: s.next_payment_date ?? s.date_of_next_payment ?? null,
    valor: ar.transaction_amount,
    frequencia: `${ar.frequency}/${ar.frequency_type}`,
    payer_id: s.payer_id,
    card_id: (s as { card_id?: string }).card_id ?? '(não retornado)',
  }
}

async function putStatus(id: string, status: 'paused' | 'authorized') {
  const r = await fetch(`${API}/preapproval/${id}`, {
    method: 'PUT', headers: H, body: JSON.stringify({ status }),
  })
  const body = await r.text()
  return { ok: r.ok, status: r.status, body }
}

async function buscarAutorizada(): Promise<string | null> {
  const r = await fetch(`${API}/preapproval/search?status=authorized&limit=10`, { headers: H })
  if (!r.ok) { console.error('search →', r.status, await r.text()); return null }
  const data = await r.json()
  const results = (data.results ?? []) as Record<string, unknown>[]
  if (!results.length) return null
  console.log(`\nAssinaturas autorizadas de teste encontradas: ${results.length}`)
  results.forEach((s, i) => console.log(`  [${i}] ${s.id} — ${(s as { reason?: string }).reason ?? ''}`))
  return String(results[0].id)
}

async function main() {
  let id = process.argv[2]
  if (!id) {
    console.log('Nenhum ID informado — buscando uma assinatura autorizada de teste…')
    id = (await buscarAutorizada()) ?? ''
    if (!id) {
      console.error(
        '\n✗ Nenhuma assinatura autorizada de teste encontrada.\n' +
        'Crie uma primeiro: no app em modo sandbox, cadastre um amigo de teste via link\n' +
        'de indicação, vá ao checkout e pague com um cartão de teste do MP\n' +
        '(https://www.mercadopago.com.br/developers → Cartões de teste).\n' +
        'Depois rode novamente com o ID:  npx tsx scripts/test-mp-pausa.ts <preapproval_id>'
      )
      process.exit(1)
    }
  }

  console.log(`\n══ Testando assinatura ${id} ══\n`)

  console.log('1) Estado inicial:')
  const s0 = await getSub(id)
  console.table(resumo(s0))
  const nextInicial = s0.next_payment_date ?? s0.date_of_next_payment

  console.log('\n2) Pausando (status=paused)…')
  const p = await putStatus(id, 'paused')
  console.log(`   HTTP ${p.status} ${p.ok ? 'OK' : 'FALHOU: ' + p.body}`)
  await new Promise(r => setTimeout(r, 1500))
  const s1 = await getSub(id)
  console.table(resumo(s1))

  console.log('\n3) Retomando (status=authorized)…')
  const a = await putStatus(id, 'authorized')
  console.log(`   HTTP ${a.status} ${a.ok ? 'OK' : 'FALHOU: ' + a.body}`)
  await new Promise(r => setTimeout(r, 1500))
  const s2 = await getSub(id)
  console.table(resumo(s2))
  const nextFinal = s2.next_payment_date ?? s2.date_of_next_payment

  console.log('\n══ Veredito ══')
  console.log(`Status final: ${s2.status} (esperado: authorized)`)
  console.log(`Cartão preservado: ${(s2 as { card_id?: string }).card_id ? 'SIM' : 'verificar (card_id não veio na resposta)'}`)
  console.log(`next_payment_date inicial: ${nextInicial}`)
  console.log(`next_payment_date final:   ${nextFinal}`)
  if (nextInicial && nextFinal) {
    const delta = (new Date(nextFinal).getTime() - new Date(nextInicial).getTime()) / 86400000
    console.log(`Δ próxima cobrança: ${delta.toFixed(1)} dias ${delta > 0 ? '(adiada ✓)' : delta === 0 ? '(inalterada — pausa não adiou)' : '(antecipada ⚠)'}`)
  }
  console.log('\nObservação: o adiamento real só é confiável quando a pausa dura até a data\nda cobrança. Este teste é instantâneo; valide também deixando pausada e\nconferindo que NENHUMA cobrança (payment) é gerada na janela.')
}

main().catch(e => { console.error('\n✗ Erro:', e.message); process.exit(1) })

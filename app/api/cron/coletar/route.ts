import { NextResponse } from 'next/server'
import { coletarPNCP }          from '@/lib/scrapers/pncp'
import { coletarComprasNet }    from '@/lib/scrapers/comprasnet'
import { coletarQueridoDiario } from '@/lib/scrapers/querido-diario'
import { coletarGoogle }        from '@/lib/scrapers/google'
import { coletarBBMNET }        from '@/lib/scrapers/bbmnet'
import { coletarLicitanet }     from '@/lib/scrapers/licitanet'
import { coletarBECSP }         from '@/lib/scrapers/bec-sp'
import { coletarBLL }           from '@/lib/scrapers/bll'
import { coletarLicitacoesE }   from '@/lib/scrapers/licitacoes-e'
import { coletarPortalMG }      from '@/lib/scrapers/portal-mg'
import { coletarPortalRS }      from '@/lib/scrapers/portal-rs'
import { coletarPortalPR }      from '@/lib/scrapers/portal-pr'
import { coletarLicitarDigital } from '@/lib/scrapers/licitar-digital'
import { salvarLicitacoes }     from '@/lib/scrapers/salvar'
import { createServiceClient }  from '@/lib/supabase/server'
import { registrarCronLog }     from '@/lib/cron-log'

export const maxDuration = 300 // 5 minutos (máximo Vercel)

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const hoje  = new Date()
  const ontem = new Date(hoje)
  ontem.setDate(ontem.getDate() - 1)

  const dataInicio = ontem.toISOString().substring(0, 10)
  const dataFim    = hoje.toISOString().substring(0, 10)

  console.log(`Iniciando coleta para ${dataInicio} a ${dataFim}`)

  // 0. Limpar licitações expiradas
  const supabase = await createServiceClient()
  const ontemDate = new Date()
  ontemDate.setDate(ontemDate.getDate() - 1)
  const { count: removidas } = await supabase
    .from('licitacoes')
    .delete({ count: 'exact' })
    .lt('data_abertura', ontemDate.toISOString().substring(0, 10))
    .not('data_abertura', 'is', null)
  console.log(`${removidas ?? 0} licitações expiradas removidas`)

  // Keywords ativas para Google e Querido Diário
  const { data: kwData } = await supabase.from('keywords').select('termo').eq('ativo', true)
  const termosAtivos = kwData?.map(k => k.termo) ?? []

  // 1. Coletar de todas as fontes em paralelo (falhas isoladas via allSettled)
  const [
    pncp, comprasnet, queridoDiario, google,
    bbmnet, licitanet, becsp,
    bll, licitacoesE, portalMG, portalRS, portalPR, licitarDigital,
  ] = await Promise.allSettled([
    coletarPNCP(dataInicio, dataFim),
    coletarComprasNet(dataInicio),
    coletarQueridoDiario(termosAtivos.slice(0, 5)),
    coletarGoogle(termosAtivos),
    coletarBBMNET(dataInicio),
    coletarLicitanet(dataInicio),
    coletarBECSP(dataInicio),
    coletarBLL(dataInicio),
    coletarLicitacoesE(dataInicio),
    coletarPortalMG(dataInicio),
    coletarPortalRS(dataInicio),
    coletarPortalPR(dataInicio),
    coletarLicitarDigital(dataInicio),
  ])

  const ok   = (r: PromiseSettledResult<unknown[]>) => r.status === 'fulfilled' ? r.value : []
  const isOk = (r: PromiseSettledResult<unknown>) => r.status === 'fulfilled'

  const todasLicitacoes = [
    ...ok(pncp), ...ok(comprasnet), ...ok(queridoDiario), ...ok(google),
    ...ok(bbmnet), ...ok(licitanet), ...ok(becsp),
    ...ok(bll), ...ok(licitacoesE), ...ok(portalMG), ...ok(portalRS), ...ok(portalPR), ...ok(licitarDigital),
  ]

  console.log(`Coletadas ${todasLicitacoes.length} licitações no total`)

  // 2. Salvar (com deduplicação por external_id)
  const salvas = await salvarLicitacoes(todasLicitacoes)
  console.log(`${salvas} licitações novas salvas`)

  // 3. Buscar keywords ativas para matching
  const { data: keywords } = await supabase
    .from('keywords').select('id, termo').eq('ativo', true)

  if (!keywords?.length) {
    return NextResponse.json({ ok: true, salvas, matches: 0, debug: 'sem keywords' })
  }

  // 4. Pré-filtro textual — candidatos das últimas 24h
  const termos   = keywords.map(k => k.termo.toLowerCase())
  const filtroOr = termos.map(t => `objeto.ilike.%${t}%`).join(',')

  const { data: candidatos } = await supabase
    .from('licitacoes')
    .select('id, objeto')
    .gte('coletado_em', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .or(filtroOr)
    .limit(300)

  console.log(`${candidatos?.length ?? 0} candidatos para matching`)

  if (!candidatos?.length) {
    return NextResponse.json({ ok: true, salvas, matches: 0, debug: 'sem candidatos' })
  }

  // 5. Disparar matching em endpoint separado (não bloqueia)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  fetch(`${appUrl}/api/cron/matching`, {
    method:  'GET',
    headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
  }).catch(err => console.error('Erro ao disparar matching:', err))

  const detalhes = {
    pncp_ok:           isOk(pncp),
    comprasnet_ok:     isOk(comprasnet),
    querido_ok:        isOk(queridoDiario),
    google_ok:         isOk(google),
    bbmnet_ok:         isOk(bbmnet),
    licitanet_ok:      isOk(licitanet),
    becsp_ok:          isOk(becsp),
    bll_ok:            isOk(bll),
    licitacoes_e_ok:   isOk(licitacoesE),
    portal_mg_ok:      isOk(portalMG),
    portal_rs_ok:      isOk(portalRS),
    portal_pr_ok:      isOk(portalPR),
    licitar_digital_ok: isOk(licitarDigital),
    total_coletadas:   todasLicitacoes.length,
    salvas,
    candidatos:        candidatos.length,
  }

  console.log('Detalhes scrapers:', detalhes)

  await registrarCronLog({
    job:      'coletar',
    status:   'ok',
    mensagem: `${salvas} salvas, ${candidatos.length} candidatos — matching disparado`,
    detalhes,
  })

  return NextResponse.json({ ok: true, salvas, candidatos: candidatos.length, detalhes })
}

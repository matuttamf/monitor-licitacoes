import { NextResponse } from 'next/server'
import type { LicitacaoRaw } from '@/lib/scrapers/types'

// ── Camada 1 — Federais obrigatórios ──────────────────────────────────────
import { coletarPNCP }             from '@/lib/scrapers/pncp'
import { coletarPNCPContratos }    from '@/lib/scrapers/pncp-contratos'
import { coletarPNCPPCA }          from '@/lib/scrapers/pncp-pca'
import { coletarComprasNet }       from '@/lib/scrapers/comprasnet'
import { coletarQueridoDiario }    from '@/lib/scrapers/querido-diario'
import { coletarGoogle }           from '@/lib/scrapers/google'
import { coletarDOU }              from '@/lib/scrapers/dou'          // 3 seções

// ── Camada 1 — Plataformas privadas nacionais ─────────────────────────────
import { coletarBBMNET }           from '@/lib/scrapers/bbmnet'
import { coletarLicitanet }        from '@/lib/scrapers/licitanet'
import { coletarBLL }              from '@/lib/scrapers/bll'
import { coletarLicitacoesE }      from '@/lib/scrapers/licitacoes-e'
import { coletarLicitarDigital }   from '@/lib/scrapers/licitar-digital'
import { coletarNegociosPublicos } from '@/lib/scrapers/negocios-publicos'
import { coletarComprasPublicas }  from '@/lib/scrapers/compras-publicas'

// ── Camada 2 — Portais estaduais (todos 27 estados + DF) ──────────────────
import { coletarBECSP }            from '@/lib/scrapers/bec-sp'
import { coletarPortalMG }         from '@/lib/scrapers/portal-mg'
import { coletarPortalRS }         from '@/lib/scrapers/portal-rs'
import { coletarPortalPR }         from '@/lib/scrapers/portal-pr'
import { coletarPortalBA }         from '@/lib/scrapers/portal-ba'
import { coletarPortalRJ }         from '@/lib/scrapers/portal-rj'
import { coletarPortalSC }         from '@/lib/scrapers/portal-sc'
import { coletarPortalCE }         from '@/lib/scrapers/portal-ce'
import { coletarPortalPE }         from '@/lib/scrapers/portal-pe'
import { coletarPortalGO }         from '@/lib/scrapers/portal-go'
import { coletarPortalDF }         from '@/lib/scrapers/portal-df'
import { coletarPortalES }         from '@/lib/scrapers/portal-es'
import { coletarPortalMT }         from '@/lib/scrapers/portal-mt'
import { coletarPortalAM }         from '@/lib/scrapers/portal-am'
import { coletarPortalMS }         from '@/lib/scrapers/portal-ms'
import { coletarPortalPB }         from '@/lib/scrapers/portal-pb'
import { coletarPortalPA }         from '@/lib/scrapers/portal-pa'
import { coletarPortalAC }         from '@/lib/scrapers/portal-ac'
import { coletarPortalRO }         from '@/lib/scrapers/portal-ro'
import { coletarPortalRR }         from '@/lib/scrapers/portal-rr'
import { coletarPortalTO }         from '@/lib/scrapers/portal-to'
import { coletarPortalMA }         from '@/lib/scrapers/portal-ma'
import { coletarPortalPI }         from '@/lib/scrapers/portal-pi'
import { coletarPortalRN }         from '@/lib/scrapers/portal-rn'
import { coletarPortalSE }         from '@/lib/scrapers/portal-se'
import { coletarPortalAL }         from '@/lib/scrapers/portal-al'
import { coletarPortalAP }         from '@/lib/scrapers/portal-ap'

// ── Camada 3 — Capitais (todas 27 capitais + DF) ──────────────────────────
import { coletarPortalSPCidade }   from '@/lib/scrapers/portal-sp-cidade'
import { coletarPortalBH }         from '@/lib/scrapers/portal-bh'
import { coletarPortalRecife }     from '@/lib/scrapers/portal-recife'
import { coletarPortalFortaleza }  from '@/lib/scrapers/portal-fortaleza'
import { coletarPortalManaus }     from '@/lib/scrapers/portal-manaus'
import { coletarPortalCuritiba }   from '@/lib/scrapers/portal-curitiba'
import { coletarPortalPOA }        from '@/lib/scrapers/portal-poa'
import { coletarPortalBelem }      from '@/lib/scrapers/portal-belem'
import { coletarPortalGoiania }    from '@/lib/scrapers/portal-goiania'
import { coletarPortalSalvador }   from '@/lib/scrapers/portal-salvador'
import { coletarPortalNatal }      from '@/lib/scrapers/portal-natal'
import { coletarPortalCampoGrande }from '@/lib/scrapers/portal-campo-grande'
import { coletarPortalMaceio }     from '@/lib/scrapers/portal-maceio'
import { coletarPortalSaoLuis }    from '@/lib/scrapers/portal-sao-luis'
import { coletarPortalTeresina }   from '@/lib/scrapers/portal-teresina'
import { coletarPortalJoaoPessoa } from '@/lib/scrapers/portal-joao-pessoa'
import { coletarPortalAracaju }    from '@/lib/scrapers/portal-aracaju'

// ── Camada 3 — Cidades grandes (50k+ hab, não-capitais) ───────────────────
import { coletarPortalCampinas }      from '@/lib/scrapers/portal-campinas'
import { coletarPortalGuarulhos }     from '@/lib/scrapers/portal-guarulhos'
import { coletarPortalUberlandia }    from '@/lib/scrapers/portal-uberlandia'
import { coletarPortalJoinville }     from '@/lib/scrapers/portal-joinville'
import { coletarPortalLondrina }      from '@/lib/scrapers/portal-londrina'
import { coletarPortalRibeiraoPreto } from '@/lib/scrapers/portal-ribeirao-preto'

// ── Camada 3 — Cidades 100k-700k (não-capitais, batch 3) ─────────────────
import { coletarPortalOsasco }          from '@/lib/scrapers/portal-osasco'
import { coletarPortalSantoAndre }      from '@/lib/scrapers/portal-santo-andre'
import { coletarPortalDuqueDeCaxias }   from '@/lib/scrapers/portal-duque-de-caxias'
import { coletarPortalAparecidaGoiania }from '@/lib/scrapers/portal-aparecida-goiania'
import { coletarPortalCaxiasDoSul }     from '@/lib/scrapers/portal-caxias-do-sul'
import { coletarPortalSJRP }            from '@/lib/scrapers/portal-sjrp'
import { coletarPortalJundiai }         from '@/lib/scrapers/portal-jundiai'
import { coletarPortalBetim }           from '@/lib/scrapers/portal-betim'

// ── Camada 3 — Cidades 100k-700k (não-capitais, batch 2) ─────────────────
import { coletarPortalSantos }        from '@/lib/scrapers/portal-santos'
import { coletarPortalSorocaba }      from '@/lib/scrapers/portal-sorocaba'
import { coletarPortalSBC }           from '@/lib/scrapers/portal-sbc'
import { coletarPortalContagem }      from '@/lib/scrapers/portal-contagem'
import { coletarPortalMaringa }       from '@/lib/scrapers/portal-maringa'
import { coletarPortalSJC }           from '@/lib/scrapers/portal-sjc'
import { coletarPortalMogi }          from '@/lib/scrapers/portal-mogi'
import { coletarPortalJuizDeFora }    from '@/lib/scrapers/portal-juiz-de-fora'
import { coletarPortalNiteroi }       from '@/lib/scrapers/portal-niteroi'
import { coletarPortalFeiraDeSantana }from '@/lib/scrapers/portal-feira-de-santana'

// ── Camada 4 — Consórcios públicos + autarquias federais de grande porte ──
import { coletarConsorcioGrandeABC }from '@/lib/scrapers/consorcio-grande-abc'
import { coletarFNDE }              from '@/lib/scrapers/fnde'
import { coletarFNS }               from '@/lib/scrapers/fns'
import { coletarDNIT }              from '@/lib/scrapers/dnit'
import { coletarConsorcioPCJ }      from '@/lib/scrapers/consorcio-pcj'

// ── Camada 5 — Estatais ───────────────────────────────────────────────────
import { coletarPetronect }        from '@/lib/scrapers/petronect'
import { coletarCorreios }         from '@/lib/scrapers/correios'
import { coletarCaixa }            from '@/lib/scrapers/caixa'
import { coletarEletrobras }       from '@/lib/scrapers/eletrobras'
import { coletarSabesp }           from '@/lib/scrapers/sabesp'

import { salvarLicitacoes }        from '@/lib/scrapers/salvar'
import { createServiceClient }     from '@/lib/supabase/server'
import { registrarCronLog }        from '@/lib/cron-log'

export const maxDuration = 300

const TOTAL_FONTES = 95

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

  console.log(`Iniciando coleta ${dataInicio} — ${dataFim} (${TOTAL_FONTES} fontes em 5 camadas)`)

  // 0. Limpar licitações expiradas
  const supabase = await createServiceClient()
  const ontemDate = new Date(); ontemDate.setDate(ontemDate.getDate() - 1)
  const { count: removidas } = await supabase.from('licitacoes').delete({ count: 'exact' })
    .lt('data_abertura', ontemDate.toISOString().substring(0, 10)).not('data_abertura', 'is', null)
  console.log(`${removidas ?? 0} licitações expiradas removidas`)

  // Keywords para Google e Querido Diário
  const { data: kwData } = await supabase.from('keywords').select('termo').eq('ativo', true)
  const termosAtivos = kwData?.map(k => k.termo) ?? []

  // 1. Coletar em paralelo — falhas isoladas via allSettled
  const resultados = await Promise.allSettled([
    // Camada 1 — Federal (0-6)
    coletarPNCP(dataInicio, dataFim),
    coletarPNCPContratos(dataInicio, dataFim),
    coletarPNCPPCA(),
    coletarComprasNet(dataInicio),
    coletarQueridoDiario(termosAtivos.slice(0, 5)),
    coletarGoogle(termosAtivos),
    coletarDOU(dataInicio),                    // DOU 3 seções integradas
    // Plataformas (7-13)
    coletarBBMNET(dataInicio),
    coletarLicitanet(dataInicio),
    coletarBLL(dataInicio),
    coletarLicitacoesE(dataInicio),
    coletarLicitarDigital(dataInicio),
    coletarNegociosPublicos(dataInicio),
    coletarComprasPublicas(dataInicio),
    // Camada 2 — Estados (14-40)
    coletarBECSP(dataInicio),
    coletarPortalMG(dataInicio),
    coletarPortalRS(dataInicio),
    coletarPortalPR(dataInicio),
    coletarPortalBA(dataInicio),
    coletarPortalRJ(dataInicio),
    coletarPortalSC(dataInicio),
    coletarPortalCE(dataInicio),
    coletarPortalPE(dataInicio),
    coletarPortalGO(dataInicio),
    coletarPortalDF(dataInicio),
    coletarPortalES(dataInicio),
    coletarPortalMT(dataInicio),
    coletarPortalAM(dataInicio),
    coletarPortalMS(dataInicio),
    coletarPortalPB(dataInicio),
    coletarPortalPA(dataInicio),
    coletarPortalAC(dataInicio),
    coletarPortalRO(dataInicio),
    coletarPortalRR(dataInicio),
    coletarPortalTO(dataInicio),
    coletarPortalMA(dataInicio),
    coletarPortalPI(dataInicio),
    coletarPortalRN(dataInicio),
    coletarPortalSE(dataInicio),
    coletarPortalAL(dataInicio),
    coletarPortalAP(dataInicio),
    // Camada 3 — Capitais (41-57)
    coletarPortalSPCidade(dataInicio),
    coletarPortalBH(dataInicio),
    coletarPortalRecife(dataInicio),
    coletarPortalFortaleza(dataInicio),
    coletarPortalManaus(dataInicio),
    coletarPortalCuritiba(dataInicio),
    coletarPortalPOA(dataInicio),
    coletarPortalBelem(dataInicio),
    coletarPortalGoiania(dataInicio),
    coletarPortalSalvador(dataInicio),
    coletarPortalNatal(dataInicio),
    coletarPortalCampoGrande(dataInicio),
    coletarPortalMaceio(dataInicio),
    coletarPortalSaoLuis(dataInicio),
    coletarPortalTeresina(dataInicio),
    coletarPortalJoaoPessoa(dataInicio),
    coletarPortalAracaju(dataInicio),
    // Camada 3 — Cidades 200k+ (58-63)
    coletarPortalCampinas(dataInicio),
    coletarPortalGuarulhos(dataInicio),
    coletarPortalUberlandia(dataInicio),
    coletarPortalJoinville(dataInicio),
    coletarPortalLondrina(dataInicio),
    coletarPortalRibeiraoPreto(dataInicio),
    // Camada 3 — Cidades 100k-700k batch 3 (69-76)
    coletarPortalOsasco(dataInicio),
    coletarPortalSantoAndre(dataInicio),
    coletarPortalDuqueDeCaxias(dataInicio),
    coletarPortalAparecidaGoiania(dataInicio),
    coletarPortalCaxiasDoSul(dataInicio),
    coletarPortalSJRP(dataInicio),
    coletarPortalJundiai(dataInicio),
    coletarPortalBetim(dataInicio),
    // Camada 3 — Cidades 100k-700k batch 2 (77-86)
    coletarPortalSantos(dataInicio),
    coletarPortalSorocaba(dataInicio),
    coletarPortalSBC(dataInicio),
    coletarPortalContagem(dataInicio),
    coletarPortalMaringa(dataInicio),
    coletarPortalSJC(dataInicio),
    coletarPortalMogi(dataInicio),
    coletarPortalJuizDeFora(dataInicio),
    coletarPortalNiteroi(dataInicio),
    coletarPortalFeiraDeSantana(dataInicio),
    // Camada 4 — Consórcios + autarquias federais (87-91)
    coletarConsorcioGrandeABC(dataInicio),
    coletarFNDE(dataInicio, dataFim),
    coletarFNS(dataInicio, dataFim),
    coletarDNIT(dataInicio, dataFim),
    coletarConsorcioPCJ(dataInicio),
    // Camada 5 — Estatais (92-96)
    coletarPetronect(dataInicio),
    coletarCorreios(dataInicio),
    coletarCaixa(dataInicio),
    coletarEletrobras(dataInicio),
    coletarSabesp(dataInicio),
  ])

  const ok   = (r: PromiseSettledResult<LicitacaoRaw[]>): LicitacaoRaw[] => r.status === 'fulfilled' ? r.value : []
  const isOk = (r: PromiseSettledResult<LicitacaoRaw[]>): boolean => r.status === 'fulfilled'

  const resultadosTyped = resultados as PromiseSettledResult<LicitacaoRaw[]>[]
  const todasLicitacoes = resultadosTyped.flatMap(ok)
  const fonteOk = resultadosTyped.map(isOk)
  const totalOk = fonteOk.filter(Boolean).length
  console.log(`Coletadas ${todasLicitacoes.length} licitações de ${totalOk}/${TOTAL_FONTES} fontes`)

  // 2. Salvar (deduplicação por external_id / numero_edital)
  const salvas = await salvarLicitacoes(todasLicitacoes)
  console.log(`${salvas} licitações novas salvas`)

  // 3. Keywords para matching
  const { data: keywords } = await supabase.from('keywords').select('id, termo').eq('ativo', true)
  if (!keywords?.length) return NextResponse.json({ ok: true, salvas, matches: 0 })

  // 4. Pré-filtro textual
  const filtroOr = keywords.map(k => `objeto.ilike.%${k.termo.toLowerCase()}%`).join(',')
  const { data: candidatos } = await supabase
    .from('licitacoes').select('id, objeto')
    .gte('coletado_em', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .or(filtroOr).limit(300)

  console.log(`${candidatos?.length ?? 0} candidatos para matching`)
  if (!candidatos?.length) return NextResponse.json({ ok: true, salvas, matches: 0 })

  // 5. Disparar matching (endpoint separado, não bloqueia)
  fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/cron/matching`, {
    method: 'GET', headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
  }).catch(err => console.error('Erro matching:', err))

  const nomes = [
    // Camada 1
    'pncp','pncp_contratos','pncp_pca','comprasnet','querido','google','dou',
    // Plataformas
    'bbmnet','licitanet','bll','licitacoes_e','licitar_digital','negocios_publicos','compras_publicas',
    // Camada 2 — Estados
    'bec_sp','mg','rs','pr','ba','rj','sc','ce','pe','go','df','es','mt','am',
    'ms','pb','pa','ac','ro','rr','to','ma','pi','rn','se','al','ap',
    // Camada 3 — Capitais
    'sp_cidade','bh','recife','fortaleza','manaus','curitiba','poa','belem','goiania','salvador',
    'natal','campo_grande','maceio','sao_luis','teresina','joao_pessoa','aracaju',
    // Camada 3 — Cidades 200k+ batch 1
    'campinas','guarulhos','uberlandia','joinville','londrina','ribeirao_preto',
    // Camada 3 — Cidades batch 3
    'osasco','santo_andre','duque_caxias','aparecida_goiania','caxias_sul','sjrp','jundiai','betim',
    // Camada 3 — Cidades batch 2
    'santos','sorocaba','sbc','contagem','maringa','sjc','mogi','juiz_de_fora','niteroi','feira_de_santana',
    // Camada 4 — Consórcios + autarquias
    'grande_abc','fnde','fns','dnit','pcj',
    // Camada 5 — Estatais
    'petronect','correios','caixa','eletrobras','sabesp',
  ]

  const detalhes: Record<string, unknown> = Object.fromEntries(nomes.map((n, i) => [`${n}_ok`, fonteOk[i]]))
  detalhes.total_coletadas = todasLicitacoes.length
  detalhes.fontes_ativas   = totalOk
  detalhes.salvas          = salvas
  detalhes.candidatos      = candidatos?.length ?? 0

  await registrarCronLog({
    job: 'coletar',
    status: 'ok',
    mensagem: `${salvas} salvas de ${todasLicitacoes.length} coletadas (${totalOk}/${TOTAL_FONTES} fontes) — ${candidatos?.length ?? 0} candidatos`,
    detalhes,
  })

  return NextResponse.json({
    ok: true,
    salvas,
    candidatos: candidatos?.length ?? 0,
    fontes_ativas: totalOk,
    total_fontes: TOTAL_FONTES,
    detalhes,
  })
}

import { NextResponse } from 'next/server'
// Fontes federais e agregadores nacionais
import { coletarPNCP }            from '@/lib/scrapers/pncp'
import { coletarComprasNet }      from '@/lib/scrapers/comprasnet'
import { coletarQueridoDiario }   from '@/lib/scrapers/querido-diario'
import { coletarGoogle }          from '@/lib/scrapers/google'
import { coletarDOU }             from '@/lib/scrapers/dou'
// Plataformas privadas nacionais
import { coletarBBMNET }          from '@/lib/scrapers/bbmnet'
import { coletarLicitanet }       from '@/lib/scrapers/licitanet'
import { coletarBLL }             from '@/lib/scrapers/bll'
import { coletarLicitacoesE }     from '@/lib/scrapers/licitacoes-e'
import { coletarLicitarDigital }  from '@/lib/scrapers/licitar-digital'
import { coletarNegociosPublicos } from '@/lib/scrapers/negocios-publicos'
import { coletarComprasPublicas } from '@/lib/scrapers/compras-publicas'
// Portais estaduais
import { coletarBECSP }           from '@/lib/scrapers/bec-sp'
import { coletarPortalMG }        from '@/lib/scrapers/portal-mg'
import { coletarPortalRS }        from '@/lib/scrapers/portal-rs'
import { coletarPortalPR }        from '@/lib/scrapers/portal-pr'
import { coletarPortalBA }        from '@/lib/scrapers/portal-ba'
import { coletarPortalRJ }        from '@/lib/scrapers/portal-rj'
import { coletarPortalSC }        from '@/lib/scrapers/portal-sc'
import { coletarPortalCE }        from '@/lib/scrapers/portal-ce'
import { coletarPortalPE }        from '@/lib/scrapers/portal-pe'
import { coletarPortalGO }        from '@/lib/scrapers/portal-go'
import { coletarPortalDF }        from '@/lib/scrapers/portal-df'
import { coletarPortalES }        from '@/lib/scrapers/portal-es'
import { coletarPortalMT }        from '@/lib/scrapers/portal-mt'
import { coletarPortalAM }        from '@/lib/scrapers/portal-am'
// Municípios grandes
import { coletarPortalSPCidade }  from '@/lib/scrapers/portal-sp-cidade'
import { coletarPortalBH }        from '@/lib/scrapers/portal-bh'
import { salvarLicitacoes }       from '@/lib/scrapers/salvar'
import { createServiceClient }    from '@/lib/supabase/server'
import { registrarCronLog }       from '@/lib/cron-log'

export const maxDuration = 300

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

  console.log(`Iniciando coleta para ${dataInicio} — ${dataFim} (28 fontes)`)

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
    coletarPNCP(dataInicio, dataFim),           //  0 federal
    coletarComprasNet(dataInicio),              //  1 federal
    coletarQueridoDiario(termosAtivos.slice(0,5)), //  2 diários
    coletarGoogle(termosAtivos),                //  3 busca
    coletarDOU(dataInicio),                     //  4 DOU
    coletarBBMNET(dataInicio),                  //  5 plataforma
    coletarLicitanet(dataInicio),               //  6 plataforma
    coletarBLL(dataInicio),                     //  7 plataforma
    coletarLicitacoesE(dataInicio),             //  8 BB
    coletarLicitarDigital(dataInicio),          //  9 plataforma
    coletarNegociosPublicos(dataInicio),        // 10 agregador
    coletarComprasPublicas(dataInicio),         // 11 agregador
    coletarBECSP(dataInicio),                   // 12 SP estado
    coletarPortalMG(dataInicio),                // 13 MG
    coletarPortalRS(dataInicio),                // 14 RS
    coletarPortalPR(dataInicio),                // 15 PR
    coletarPortalBA(dataInicio),                // 16 BA
    coletarPortalRJ(dataInicio),                // 17 RJ
    coletarPortalSC(dataInicio),                // 18 SC
    coletarPortalCE(dataInicio),                // 19 CE
    coletarPortalPE(dataInicio),                // 20 PE
    coletarPortalGO(dataInicio),                // 21 GO
    coletarPortalDF(dataInicio),                // 22 DF
    coletarPortalES(dataInicio),                // 23 ES
    coletarPortalMT(dataInicio),                // 24 MT
    coletarPortalAM(dataInicio),                // 25 AM
    coletarPortalSPCidade(dataInicio),          // 26 SP capital
    coletarPortalBH(dataInicio),                // 27 BH
  ])

  const ok   = (r: PromiseSettledResult<unknown[]>) => r.status === 'fulfilled' ? r.value : []
  const isOk = (r: PromiseSettledResult<unknown>) => r.status === 'fulfilled'

  const todasLicitacoes = resultados.flatMap(ok)
  const fonteOk = resultados.map(isOk)
  console.log(`Coletadas ${todasLicitacoes.length} licitações de ${fonteOk.filter(Boolean).length}/28 fontes`)

  // 2. Salvar (deduplicação por external_id)
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

  const nomes = ['pncp','comprasnet','querido','google','dou','bbmnet','licitanet','bll','licitacoes_e','licitar_digital','negocios_publicos','compras_publicas','bec_sp','mg','rs','pr','ba','rj','sc','ce','pe','go','df','es','mt','am','sp_cidade','bh']
  const detalhes = Object.fromEntries(nomes.map((n, i) => [`${n}_ok`, fonteOk[i]]))
  detalhes.total_coletadas = todasLicitacoes.length
  detalhes.fontes_ativas   = fonteOk.filter(Boolean).length
  detalhes.salvas          = salvas
  detalhes.candidatos      = candidatos.length

  await registrarCronLog({ job: 'coletar', status: 'ok', mensagem: `${salvas} salvas de ${todasLicitacoes.length} coletadas (${fonteOk.filter(Boolean).length}/28 fontes) — ${candidatos.length} candidatos`, detalhes })

  return NextResponse.json({ ok: true, salvas, candidatos: candidatos.length, fontes_ativas: fonteOk.filter(Boolean).length, detalhes })
}

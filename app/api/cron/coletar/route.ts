import { NextResponse } from 'next/server'
import type { LicitacaoRaw } from '@/lib/scrapers/types'

// ── Camada 1 — Federais obrigatórios ──────────────────────────────────────
import { coletarPNCP }             from '@/lib/scrapers/pncp'
import { coletarPNCPContratos }    from '@/lib/scrapers/pncp-contratos'
import { coletarPNCPPCA }          from '@/lib/scrapers/pncp-pca'
import { coletarComprasNet }       from '@/lib/scrapers/comprasnet'
import { coletarQueridoDiario }    from '@/lib/scrapers/querido-diario'
import { coletarGoogle }           from '@/lib/scrapers/google'
import { coletarDOU }              from '@/lib/scrapers/dou'

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

// ── Camada 3 — Capitais (17 capitais com portais próprios) ────────────────
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

// ── Camada 3 — Cidades 200k+ batch 1 ─────────────────────────────────────
import { coletarPortalCampinas }      from '@/lib/scrapers/portal-campinas'
import { coletarPortalGuarulhos }     from '@/lib/scrapers/portal-guarulhos'
import { coletarPortalUberlandia }    from '@/lib/scrapers/portal-uberlandia'
import { coletarPortalJoinville }     from '@/lib/scrapers/portal-joinville'
import { coletarPortalLondrina }      from '@/lib/scrapers/portal-londrina'
import { coletarPortalRibeiraoPreto } from '@/lib/scrapers/portal-ribeirao-preto'

// ── Camada 3 — Cidades batch 2 ────────────────────────────────────────────
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

// ── Camada 3 — Cidades batch 3 ────────────────────────────────────────────
import { coletarPortalOsasco }          from '@/lib/scrapers/portal-osasco'
import { coletarPortalSantoAndre }      from '@/lib/scrapers/portal-santo-andre'
import { coletarPortalDuqueDeCaxias }   from '@/lib/scrapers/portal-duque-de-caxias'
import { coletarPortalAparecidaGoiania }from '@/lib/scrapers/portal-aparecida-goiania'
import { coletarPortalCaxiasDoSul }     from '@/lib/scrapers/portal-caxias-do-sul'
import { coletarPortalSJRP }            from '@/lib/scrapers/portal-sjrp'
import { coletarPortalJundiai }         from '@/lib/scrapers/portal-jundiai'
import { coletarPortalBetim }           from '@/lib/scrapers/portal-betim'

// ── Camada 4 — Autarquias federais ────────────────────────────────────────
import { coletarFNDE }              from '@/lib/scrapers/fnde'
import { coletarFNS }               from '@/lib/scrapers/fns'
import { coletarDNIT }              from '@/lib/scrapers/dnit'

// ── Camada 5 — Estatais ───────────────────────────────────────────────────
import { coletarPetronect }        from '@/lib/scrapers/petronect'
import { coletarCorreios }         from '@/lib/scrapers/correios'
import { coletarCaixa }            from '@/lib/scrapers/caixa'
import { coletarEletrobras }       from '@/lib/scrapers/eletrobras'
import { coletarSabesp }           from '@/lib/scrapers/sabesp'

// ── Camada 6 — Órgãos federais via PNCP CNPJ (18 novos) ──────────────────
import {
  coletarINSS, coletarMEC, coletarCAPES, coletarCNPq, coletarEMBRAPA,
  coletarIBGE_org, coletarFIOCRUZ, coletarANVISA, coletarINFRAERO,
  coletarANATEL, coletarCODEVASF, coletarCONAB, coletarAGU, coletarTCU,
  coletarINCRA, coletarIBAMA, coletarSERPRO, coletarDATAPREV,
} from '@/lib/scrapers/orgaos-federais'

// ── Camada 7 — Cidades via PNCP IBGE (Sudeste — 29 cidades) ──────────────
import {
  coletarSaoGoncalo, coletarNovaIguacu, coletarCamposGoyt,
  coletarVoltaRedonda, coletarMacae, coletarPetropolis,
  coletarPiracicaba, coletarMaua, coletarDiadema, coletarCarapicuiba,
  coletarBauru, coletarFranca, coletarLimeira, coletarBarueri,
  coletarTaubate, coletarSuzano, coletarSumare, coletarSaoVicente,
  coletarPraiaGrande, coletarTaboaoDaSerra,
  coletarUberaba, coletarGovValadares, coletarIpatinga,
  coletarSeteLagoas, coletarDivinopolis, coletarMontesClaros,
  coletarVilaVelha, coletarSerra, coletarCariacica,
} from '@/lib/scrapers/cidades-pncp-sudeste'

// ── Camada 7 — Cidades via PNCP IBGE (Sul — 18 cidades) ──────────────────
import {
  coletarPontaGrossa, coletarCascavel, coletarFozDoIguacu,
  coletarSJPinhais, coletarColombo,
  coletarBlumenau, coletarSaoJoseSC, coletarChapeco, coletarItajai,
  coletarBalnearioCamboriu, coletarPalhoca,
  coletarPelotas, coletarCanoas, coletarSantaMaria,
  coletarNovoHamburgo, coletarGravitai, coletarViamao, coletarSaoLeopoldo,
} from '@/lib/scrapers/cidades-pncp-sul'

// ── Camada 7 — Cidades via PNCP IBGE (Nordeste — 19 cidades) ─────────────
import {
  coletarVitoriaConquista, coletarCamacari, coletarItabuna,
  coletarIlheus, coletarLauroDeFreitas,
  coletarCaruaru, coletarPetrolina, coletarOlinda, coletarCaboSantoAgost,
  coletarCaucaia, coletarJuazeiroDoNorte, coletarMaracanau, coletarSobral,
  coletarMossoro, coletarCampinaGrande,
  coletarImperatriz, coletarTimon, coletarParnaiba, coletarArapiraca,
} from '@/lib/scrapers/cidades-pncp-nordeste'

// ── Camada 7 — Cidades via PNCP IBGE (Norte + CO — 20 cidades) ───────────
import {
  coletarFlorianopolis, coletarVitoriaES, coletarCuiaba,
  coletarPortoVelho, coletarRioBranco, coletarMacapa,
  coletarBoaVista, coletarPalmas,
  coletarAnanindeua, coletarSantarem, coletarMaraba, coletarCastanhal,
  coletarAnapolisGO, coletarRioVerdeGO, coletarDourados,
  coletarVarzeaGrande, coletarRondonopolis,
  coletarJiParana, coletarAraguaina,
} from '@/lib/scrapers/cidades-pncp-norte-co'

// ── Camada 8 — SP Interior (23 cidades) ──────────────────────────────────
import {
  coletarItaquaquecetuba, coletarCotia, coletarEmbuDasArtes, coletarItapevi,
  coletarHortolandia, coletarIndaiatuba, coletarAmericana, coletarFerrazVasc,
  coletarItapecericaSerra, coletarSaoCaetanoSul,
  coletarSaoCarlos, coletarAraraquara, coletarPresPrudente, coletarRioClaro,
  coletarJacarei, coletarAracatuba, coletarMarilia, coletarMogiGuacu,
  coletarBotucatu, coletarCatanduva, coletarGuaratingueta,
  coletarSertaozinho, coletarLeme,
} from '@/lib/scrapers/cidades-pncp-sp-interior'

// ── Camada 8 — RJ interior + MG extra + ES extra (23 cidades) ─────────────
import {
  coletarBelfordRoxo, coletarSJMeriti, coletarMage, coletarItaborai,
  coletarNovaFriburgo, coletarAngraDoReis, coletarCaboFrio,
  coletarNilopolis, coletarTeresopolis, coletarQueimados,
  coletarPatosDeMinas, coletarTeofiloOtoni, coletarPocosDeCaldas,
  coletarBarbacena, coletarCoronelFabriciano, coletarMuriae,
  coletarVarginha, coletarLavras, coletarAlfenas,
  coletarLinhares, coletarSaoMateus, coletarColatina, coletarCachoeiro,
} from '@/lib/scrapers/cidades-pncp-rj-mg-es'

// ── Camada 8 — Sul extra + GO/MS extra (24 cidades) ───────────────────────
import {
  coletarApucarana, coletarGuarapuava, coletarParanagua as coletarParanaguaCidade,
  coletarAraucaria, coletarPinhais, coletarAlmiranteTam, coletarToledo, coletarUmuarama,
  coletarCricuma, coletarLages, coletarJaragua, coletarBiguacu,
  coletarTubarao, coletarNavegantes,
  coletarPassoFundo, coletarBage, coletarSantaCruzSul,
  coletarCachoeirinha, coletarAlvorada, coletarErechim,
  coletarLuzianiaGO, coletarValparaisoGO, coletarCaldasNovas, coletarItumbiara,
} from '@/lib/scrapers/cidades-pncp-sul-extra'

// ── Camada 9 — Estatais estaduais: energia + saneamento + bancos (26) ─────
import {
  coletarCEMIG, coletarCOPEL, coletarCELESC, coletarCEAL,
  coletarENERGISASE, coletarCELPA, coletarCEMAR,
  coletarCEDAE, coletarCOPASA, coletarSANEPAR, coletarCASAN,
  coletarEMBASA, coletarCAGEPA, coletarCAERN, coletarCAGECE,
  coletarCOMPESA, coletarCOSANPA, coletarCAEMA, coletarAGESPISA,
  coletarDESO, coletarSANESUL, coletarCASAL,
  coletarBDMG, coletarBRDE, coletarBANRISUL, coletarBRB,
} from '@/lib/scrapers/estatais-estaduais'

// ── Camada 9 — Portos + concessionárias + empresas federais (16) ──────────
import {
  coletarPortoSantos, coletarPortoParanagua, coletarPortoRioGrande,
  coletarPortoVitoria, coletarPortoRecife as coletarPortoRecifePorto,
  coletarPortoSalvador as coletarPortoSalvadorPorto,
  coletarPortoItaqui, coletarPortoManaus as coletarPortoManausPorto,
  coletarPortoBelem as coletarPortoBelemPorto,
  coletarPortoFortaleza as coletarPortoFortalezaPorto,
  coletarVALEC, coletarCPRM, coletarEBC, coletarHEMOBRAS, coletarPPSA, coletarEBSERH,
} from '@/lib/scrapers/portos-concessoes'

// ── Camada 10 — Judiciário + Legislativo + MPF (11) ──────────────────────
import {
  coletarSTF, coletarSTJ, coletarTST, coletarTSE, coletarSTM,
  coletarCNJ, coletarCNMP, coletarCamara, coletarSenado, coletarMPF, coletarDPU,
} from '@/lib/scrapers/judiciario-legislativo'

// ── Camada 10 — Agências Reguladoras (9) ──────────────────────────────────
import {
  coletarANEEL, coletarANAC, coletarANTT, coletarANP, coletarANS,
  coletarANA, coletarANTAQ, coletarANCINE, coletarABIN,
} from '@/lib/scrapers/agencias-reguladoras'

// ── Camada 10 — Segurança + Ministérios + Bancos Regionais (13) ───────────
import {
  coletarPolFederal, coletarPRF, coletarPCDF, coletarCBMDF,
  coletarMinDefesa, coletarMinFazenda, coletarMAPA, coletarMinTrabalho, coletarMinJustica,
  coletarBNB, coletarBASA, coletarCasaMoeda, coletarIMBEL,
} from '@/lib/scrapers/seguranca-ministerios'

// ── Camada 10 — Cidades médias adicionais via PNCP IBGE (34) ──────────────
import {
  coletarGuaruja, coletarItu, coletarItapetininga, coletarBragancaPaulista,
  coletarLorena, coletarRegistro,
  coletarResende, coletarTresRios, coletarBarraMansa,
  coletarAraxa, coletarConselheiro, coletarItajuba,
  coletarJuazeiroBa, coletarJequie, coletarAlagoinhas, coletarTeixeiraFreitas,
  coletarCrato, coletarIguatu,
  coletarCaxiasMa, coletarAcailandia,
  coletarGurupi,
  coletarParauapebas, coletarAltamira,
  coletarVilhena, coletarCacoal,
  coletarSinop, coletarSorriso,
  coletarTresLagoas, coletarCorumba,
  coletarCatalao, coletarJatai,
  coletarSantanaAP,
  coletarCaico,
  coletarSantaRitaPB,
} from '@/lib/scrapers/cidades-pncp-mais'

import { salvarLicitacoes }        from '@/lib/scrapers/salvar'
import { createServiceClient }     from '@/lib/supabase/server'
import { registrarCronLog }        from '@/lib/cron-log'

export const maxDuration = 300

const TOTAL_FONTES = 372

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

  console.log(`Iniciando coleta ${dataInicio} — ${dataFim} (${TOTAL_FONTES} fontes verificadas em 10 camadas)`)

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
    coletarDOU(dataInicio),
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
    // Camada 3 — Capitais com portais próprios (41-57)
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
    // Camada 3 — Cidades 200k+ batch 1 (58-63)
    coletarPortalCampinas(dataInicio),
    coletarPortalGuarulhos(dataInicio),
    coletarPortalUberlandia(dataInicio),
    coletarPortalJoinville(dataInicio),
    coletarPortalLondrina(dataInicio),
    coletarPortalRibeiraoPreto(dataInicio),
    // Camada 3 — Cidades batch 2 (64-73)
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
    // Camada 3 — Cidades batch 3 (74-81)
    coletarPortalOsasco(dataInicio),
    coletarPortalSantoAndre(dataInicio),
    coletarPortalDuqueDeCaxias(dataInicio),
    coletarPortalAparecidaGoiania(dataInicio),
    coletarPortalCaxiasDoSul(dataInicio),
    coletarPortalSJRP(dataInicio),
    coletarPortalJundiai(dataInicio),
    coletarPortalBetim(dataInicio),
    // Camada 4 — Autarquias federais (82-84)
    coletarFNDE(dataInicio, dataFim),
    coletarFNS(dataInicio, dataFim),
    coletarDNIT(dataInicio, dataFim),
    // Camada 5 — Estatais (87-91)
    coletarPetronect(dataInicio),
    coletarCorreios(dataInicio),
    coletarCaixa(dataInicio),
    coletarEletrobras(dataInicio),
    coletarSabesp(dataInicio),
    // Camada 6 — Órgãos federais PNCP CNPJ (92-109)
    coletarINSS(dataInicio, dataFim),
    coletarMEC(dataInicio, dataFim),
    coletarCAPES(dataInicio, dataFim),
    coletarCNPq(dataInicio, dataFim),
    coletarEMBRAPA(dataInicio, dataFim),
    coletarIBGE_org(dataInicio, dataFim),
    coletarFIOCRUZ(dataInicio, dataFim),
    coletarANVISA(dataInicio, dataFim),
    coletarINFRAERO(dataInicio, dataFim),
    coletarANATEL(dataInicio, dataFim),
    coletarCODEVASF(dataInicio, dataFim),
    coletarCONAB(dataInicio, dataFim),
    coletarAGU(dataInicio, dataFim),
    coletarTCU(dataInicio, dataFim),
    coletarINCRA(dataInicio, dataFim),
    coletarIBAMA(dataInicio, dataFim),
    coletarSERPRO(dataInicio, dataFim),
    coletarDATAPREV(dataInicio, dataFim),
    // Camada 7 — Cidades PNCP IBGE Sudeste (110-138)
    coletarSaoGoncalo(dataInicio, dataFim),
    coletarNovaIguacu(dataInicio, dataFim),
    coletarCamposGoyt(dataInicio, dataFim),
    coletarVoltaRedonda(dataInicio, dataFim),
    coletarMacae(dataInicio, dataFim),
    coletarPetropolis(dataInicio, dataFim),
    coletarPiracicaba(dataInicio, dataFim),
    coletarMaua(dataInicio, dataFim),
    coletarDiadema(dataInicio, dataFim),
    coletarCarapicuiba(dataInicio, dataFim),
    coletarBauru(dataInicio, dataFim),
    coletarFranca(dataInicio, dataFim),
    coletarLimeira(dataInicio, dataFim),
    coletarBarueri(dataInicio, dataFim),
    coletarTaubate(dataInicio, dataFim),
    coletarSuzano(dataInicio, dataFim),
    coletarSumare(dataInicio, dataFim),
    coletarSaoVicente(dataInicio, dataFim),
    coletarPraiaGrande(dataInicio, dataFim),
    coletarTaboaoDaSerra(dataInicio, dataFim),
    coletarUberaba(dataInicio, dataFim),
    coletarGovValadares(dataInicio, dataFim),
    coletarIpatinga(dataInicio, dataFim),
    coletarSeteLagoas(dataInicio, dataFim),
    coletarDivinopolis(dataInicio, dataFim),
    coletarMontesClaros(dataInicio, dataFim),
    coletarVilaVelha(dataInicio, dataFim),
    coletarSerra(dataInicio, dataFim),
    coletarCariacica(dataInicio, dataFim),
    // Camada 7 — Sul (139-156)
    coletarPontaGrossa(dataInicio, dataFim),
    coletarCascavel(dataInicio, dataFim),
    coletarFozDoIguacu(dataInicio, dataFim),
    coletarSJPinhais(dataInicio, dataFim),
    coletarColombo(dataInicio, dataFim),
    coletarBlumenau(dataInicio, dataFim),
    coletarSaoJoseSC(dataInicio, dataFim),
    coletarChapeco(dataInicio, dataFim),
    coletarItajai(dataInicio, dataFim),
    coletarBalnearioCamboriu(dataInicio, dataFim),
    coletarPalhoca(dataInicio, dataFim),
    coletarPelotas(dataInicio, dataFim),
    coletarCanoas(dataInicio, dataFim),
    coletarSantaMaria(dataInicio, dataFim),
    coletarNovoHamburgo(dataInicio, dataFim),
    coletarGravitai(dataInicio, dataFim),
    coletarViamao(dataInicio, dataFim),
    coletarSaoLeopoldo(dataInicio, dataFim),
    // Camada 7 — Nordeste (157-175)
    coletarVitoriaConquista(dataInicio, dataFim),
    coletarCamacari(dataInicio, dataFim),
    coletarItabuna(dataInicio, dataFim),
    coletarIlheus(dataInicio, dataFim),
    coletarLauroDeFreitas(dataInicio, dataFim),
    coletarCaruaru(dataInicio, dataFim),
    coletarPetrolina(dataInicio, dataFim),
    coletarOlinda(dataInicio, dataFim),
    coletarCaboSantoAgost(dataInicio, dataFim),
    coletarCaucaia(dataInicio, dataFim),
    coletarJuazeiroDoNorte(dataInicio, dataFim),
    coletarMaracanau(dataInicio, dataFim),
    coletarSobral(dataInicio, dataFim),
    coletarMossoro(dataInicio, dataFim),
    coletarCampinaGrande(dataInicio, dataFim),
    coletarImperatriz(dataInicio, dataFim),
    coletarTimon(dataInicio, dataFim),
    coletarParnaiba(dataInicio, dataFim),
    coletarArapiraca(dataInicio, dataFim),
    // Camada 7 — Norte + Centro-Oeste (176-194)
    coletarFlorianopolis(dataInicio, dataFim),
    coletarVitoriaES(dataInicio, dataFim),
    coletarCuiaba(dataInicio, dataFim),
    coletarPortoVelho(dataInicio, dataFim),
    coletarRioBranco(dataInicio, dataFim),
    coletarMacapa(dataInicio, dataFim),
    coletarBoaVista(dataInicio, dataFim),
    coletarPalmas(dataInicio, dataFim),
    coletarAnanindeua(dataInicio, dataFim),
    coletarSantarem(dataInicio, dataFim),
    coletarMaraba(dataInicio, dataFim),
    coletarCastanhal(dataInicio, dataFim),
    coletarAnapolisGO(dataInicio, dataFim),
    coletarRioVerdeGO(dataInicio, dataFim),
    coletarDourados(dataInicio, dataFim),
    coletarVarzeaGrande(dataInicio, dataFim),
    coletarRondonopolis(dataInicio, dataFim),
    coletarJiParana(dataInicio, dataFim),
    coletarAraguaina(dataInicio, dataFim),
    // Camada 8 — SP Interior (195-217)
    coletarItaquaquecetuba(dataInicio, dataFim),
    coletarCotia(dataInicio, dataFim),
    coletarEmbuDasArtes(dataInicio, dataFim),
    coletarItapevi(dataInicio, dataFim),
    coletarHortolandia(dataInicio, dataFim),
    coletarIndaiatuba(dataInicio, dataFim),
    coletarAmericana(dataInicio, dataFim),
    coletarFerrazVasc(dataInicio, dataFim),
    coletarItapecericaSerra(dataInicio, dataFim),
    coletarSaoCaetanoSul(dataInicio, dataFim),
    coletarSaoCarlos(dataInicio, dataFim),
    coletarAraraquara(dataInicio, dataFim),
    coletarPresPrudente(dataInicio, dataFim),
    coletarRioClaro(dataInicio, dataFim),
    coletarJacarei(dataInicio, dataFim),
    coletarAracatuba(dataInicio, dataFim),
    coletarMarilia(dataInicio, dataFim),
    coletarMogiGuacu(dataInicio, dataFim),
    coletarBotucatu(dataInicio, dataFim),
    coletarCatanduva(dataInicio, dataFim),
    coletarGuaratingueta(dataInicio, dataFim),
    coletarSertaozinho(dataInicio, dataFim),
    coletarLeme(dataInicio, dataFim),
    // Camada 8 — RJ interior + MG extra + ES extra (218-240)
    coletarBelfordRoxo(dataInicio, dataFim),
    coletarSJMeriti(dataInicio, dataFim),
    coletarMage(dataInicio, dataFim),
    coletarItaborai(dataInicio, dataFim),
    coletarNovaFriburgo(dataInicio, dataFim),
    coletarAngraDoReis(dataInicio, dataFim),
    coletarCaboFrio(dataInicio, dataFim),
    coletarNilopolis(dataInicio, dataFim),
    coletarTeresopolis(dataInicio, dataFim),
    coletarQueimados(dataInicio, dataFim),
    coletarPatosDeMinas(dataInicio, dataFim),
    coletarTeofiloOtoni(dataInicio, dataFim),
    coletarPocosDeCaldas(dataInicio, dataFim),
    coletarBarbacena(dataInicio, dataFim),
    coletarCoronelFabriciano(dataInicio, dataFim),
    coletarMuriae(dataInicio, dataFim),
    coletarVarginha(dataInicio, dataFim),
    coletarLavras(dataInicio, dataFim),
    coletarAlfenas(dataInicio, dataFim),
    coletarLinhares(dataInicio, dataFim),
    coletarSaoMateus(dataInicio, dataFim),
    coletarColatina(dataInicio, dataFim),
    coletarCachoeiro(dataInicio, dataFim),
    // Camada 8 — Sul extra + GO/MS extra (241-264)
    coletarApucarana(dataInicio, dataFim),
    coletarGuarapuava(dataInicio, dataFim),
    coletarParanaguaCidade(dataInicio, dataFim),
    coletarAraucaria(dataInicio, dataFim),
    coletarPinhais(dataInicio, dataFim),
    coletarAlmiranteTam(dataInicio, dataFim),
    coletarToledo(dataInicio, dataFim),
    coletarUmuarama(dataInicio, dataFim),
    coletarCricuma(dataInicio, dataFim),
    coletarLages(dataInicio, dataFim),
    coletarJaragua(dataInicio, dataFim),
    coletarBiguacu(dataInicio, dataFim),
    coletarTubarao(dataInicio, dataFim),
    coletarNavegantes(dataInicio, dataFim),
    coletarPassoFundo(dataInicio, dataFim),
    coletarBage(dataInicio, dataFim),
    coletarSantaCruzSul(dataInicio, dataFim),
    coletarCachoeirinha(dataInicio, dataFim),
    coletarAlvorada(dataInicio, dataFim),
    coletarErechim(dataInicio, dataFim),
    coletarLuzianiaGO(dataInicio, dataFim),
    coletarValparaisoGO(dataInicio, dataFim),
    coletarCaldasNovas(dataInicio, dataFim),
    coletarItumbiara(dataInicio, dataFim),
    // Camada 9 — Estatais estaduais (265-290)
    coletarCEMIG(dataInicio, dataFim),
    coletarCOPEL(dataInicio, dataFim),
    coletarCELESC(dataInicio, dataFim),
    coletarCEAL(dataInicio, dataFim),
    coletarENERGISASE(dataInicio, dataFim),
    coletarCELPA(dataInicio, dataFim),
    coletarCEMAR(dataInicio, dataFim),
    coletarCEDAE(dataInicio, dataFim),
    coletarCOPASA(dataInicio, dataFim),
    coletarSANEPAR(dataInicio, dataFim),
    coletarCASAN(dataInicio, dataFim),
    coletarEMBASA(dataInicio, dataFim),
    coletarCAGEPA(dataInicio, dataFim),
    coletarCAERN(dataInicio, dataFim),
    coletarCAGECE(dataInicio, dataFim),
    coletarCOMPESA(dataInicio, dataFim),
    coletarCOSANPA(dataInicio, dataFim),
    coletarCAEMA(dataInicio, dataFim),
    coletarAGESPISA(dataInicio, dataFim),
    coletarDESO(dataInicio, dataFim),
    coletarSANESUL(dataInicio, dataFim),
    coletarCASAL(dataInicio, dataFim),
    coletarBDMG(dataInicio, dataFim),
    coletarBRDE(dataInicio, dataFim),
    coletarBANRISUL(dataInicio, dataFim),
    coletarBRB(dataInicio, dataFim),
    // Camada 9 — Portos + concessionárias (291-306)
    coletarPortoSantos(dataInicio, dataFim),
    coletarPortoParanagua(dataInicio, dataFim),
    coletarPortoRioGrande(dataInicio, dataFim),
    coletarPortoVitoria(dataInicio, dataFim),
    coletarPortoRecifePorto(dataInicio, dataFim),
    coletarPortoSalvadorPorto(dataInicio, dataFim),
    coletarPortoItaqui(dataInicio, dataFim),
    coletarPortoManausPorto(dataInicio, dataFim),
    coletarPortoBelemPorto(dataInicio, dataFim),
    coletarPortoFortalezaPorto(dataInicio, dataFim),
    coletarVALEC(dataInicio, dataFim),
    coletarCPRM(dataInicio, dataFim),
    coletarEBC(dataInicio, dataFim),
    coletarHEMOBRAS(dataInicio, dataFim),
    coletarPPSA(dataInicio, dataFim),
    coletarEBSERH(dataInicio, dataFim),
    // Camada 10 — Judiciário + Legislativo + MPF (307-317)
    coletarSTF(dataInicio, dataFim),
    coletarSTJ(dataInicio, dataFim),
    coletarTST(dataInicio, dataFim),
    coletarTSE(dataInicio, dataFim),
    coletarSTM(dataInicio, dataFim),
    coletarCNJ(dataInicio, dataFim),
    coletarCNMP(dataInicio, dataFim),
    coletarCamara(dataInicio, dataFim),
    coletarSenado(dataInicio, dataFim),
    coletarMPF(dataInicio, dataFim),
    coletarDPU(dataInicio, dataFim),
    // Camada 10 — Agências Reguladoras (318-326)
    coletarANEEL(dataInicio, dataFim),
    coletarANAC(dataInicio, dataFim),
    coletarANTT(dataInicio, dataFim),
    coletarANP(dataInicio, dataFim),
    coletarANS(dataInicio, dataFim),
    coletarANA(dataInicio, dataFim),
    coletarANTAQ(dataInicio, dataFim),
    coletarANCINE(dataInicio, dataFim),
    coletarABIN(dataInicio, dataFim),
    // Camada 10 — Segurança + Ministérios + Bancos Regionais (327-339)
    coletarPolFederal(dataInicio, dataFim),
    coletarPRF(dataInicio, dataFim),
    coletarPCDF(dataInicio, dataFim),
    coletarCBMDF(dataInicio, dataFim),
    coletarMinDefesa(dataInicio, dataFim),
    coletarMinFazenda(dataInicio, dataFim),
    coletarMAPA(dataInicio, dataFim),
    coletarMinTrabalho(dataInicio, dataFim),
    coletarMinJustica(dataInicio, dataFim),
    coletarBNB(dataInicio, dataFim),
    coletarBASA(dataInicio, dataFim),
    coletarCasaMoeda(dataInicio, dataFim),
    coletarIMBEL(dataInicio, dataFim),
    // Camada 10 — Cidades médias adicionais PNCP IBGE (340-373)
    coletarGuaruja(dataInicio, dataFim),
    coletarItu(dataInicio, dataFim),
    coletarItapetininga(dataInicio, dataFim),
    coletarBragancaPaulista(dataInicio, dataFim),
    coletarLorena(dataInicio, dataFim),
    coletarRegistro(dataInicio, dataFim),
    coletarResende(dataInicio, dataFim),
    coletarTresRios(dataInicio, dataFim),
    coletarBarraMansa(dataInicio, dataFim),
    coletarAraxa(dataInicio, dataFim),
    coletarConselheiro(dataInicio, dataFim),
    coletarItajuba(dataInicio, dataFim),
    coletarJuazeiroBa(dataInicio, dataFim),
    coletarJequie(dataInicio, dataFim),
    coletarAlagoinhas(dataInicio, dataFim),
    coletarTeixeiraFreitas(dataInicio, dataFim),
    coletarCrato(dataInicio, dataFim),
    coletarIguatu(dataInicio, dataFim),
    coletarCaxiasMa(dataInicio, dataFim),
    coletarAcailandia(dataInicio, dataFim),
    coletarGurupi(dataInicio, dataFim),
    coletarParauapebas(dataInicio, dataFim),
    coletarAltamira(dataInicio, dataFim),
    coletarVilhena(dataInicio, dataFim),
    coletarCacoal(dataInicio, dataFim),
    coletarSinop(dataInicio, dataFim),
    coletarSorriso(dataInicio, dataFim),
    coletarTresLagoas(dataInicio, dataFim),
    coletarCorumba(dataInicio, dataFim),
    coletarCatalao(dataInicio, dataFim),
    coletarJatai(dataInicio, dataFim),
    coletarSantanaAP(dataInicio, dataFim),
    coletarCaico(dataInicio, dataFim),
    coletarSantaRitaPB(dataInicio, dataFim),
  ])

  const ok   = (r: PromiseSettledResult<LicitacaoRaw[]>): LicitacaoRaw[] => r.status === 'fulfilled' ? r.value : []
  const isOk = (r: PromiseSettledResult<LicitacaoRaw[]>): boolean => r.status === 'fulfilled'

  const resultadosTyped = resultados as PromiseSettledResult<LicitacaoRaw[]>[]
  const todasLicitacoes = resultadosTyped.flatMap(ok)
  const fonteOk = resultadosTyped.map(isOk)
  const totalOk = fonteOk.filter(Boolean).length
  console.log(`Coletadas ${todasLicitacoes.length} licitações de ${totalOk}/${TOTAL_FONTES} fontes`)

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
    // Camada 3 — batch 1
    'campinas','guarulhos','uberlandia','joinville','londrina','ribeirao_preto',
    // Camada 3 — batch 2
    'santos','sorocaba','sbc','contagem','maringa','sjc','mogi','juiz_de_fora','niteroi','feira_de_santana',
    // Camada 3 — batch 3
    'osasco','santo_andre','duque_caxias','aparecida_goiania','caxias_sul','sjrp','jundiai','betim',
    // Camada 4
    'fnde','fns','dnit',
    // Camada 5
    'petronect','correios','caixa','eletrobras','sabesp',
    // Camada 6 — Órgãos federais
    'inss','mec','capes','cnpq','embrapa','ibge_org','fiocruz','anvisa',
    'infraero','anatel','codevasf','conab','agu','tcu','incra','ibama','serpro','dataprev',
    // Camada 7 — Sudeste
    'sao_goncalo','nova_iguacu','campos_goyt','volta_redonda','macae','petropolis',
    'piracicaba','maua','diadema','carapicuiba','bauru','franca','limeira','barueri',
    'taubate','suzano','sumare','sao_vicente','praia_grande','taboao_serra',
    'uberaba','gov_valadares','ipatinga','sete_lagoas','divinopolis','montes_claros',
    'vila_velha','serra_es','cariacica',
    // Camada 7 — Sul
    'ponta_grossa','cascavel','foz_iguacu','sj_pinhais','colombo',
    'blumenau','sao_jose_sc','chapeco','itajai','balneario_camboriu','palhoca',
    'pelotas','canoas','santa_maria','novo_hamburgo','gravitai','viamao','sao_leopoldo',
    // Camada 7 — Nordeste
    'vitoria_conquista','camacari','itabuna','ilheus','lauro_freitas',
    'caruaru','petrolina','olinda','cabo_sto_agostinho',
    'caucaia','juazeiro_norte','maracanau','sobral',
    'mossoro','campina_grande',
    'imperatriz','timon','parnaiba','arapiraca',
    // Camada 7 — Norte+CO
    'florianopolis','vitoria_es','cuiaba','porto_velho','rio_branco','macapa',
    'boa_vista','palmas',
    'ananindeua','santarem','maraba','castanhal',
    'anapolis_go','rio_verde_go','dourados','varzea_grande','rondonopolis',
    'ji_parana','araguaina',
    // Camada 8 — SP interior
    'itaquaquecetuba','cotia','embu_artes','itapevi','hortolandia','indaiatuba',
    'americana','ferraz_vasc','itapecerica','sao_caetano_sul',
    'sao_carlos','araraquara','pres_prudente','rio_claro','jacarei',
    'aracatuba','marilia','mogi_guacu','botucatu','catanduva',
    'guaratingueta','sertaozinho','leme',
    // Camada 8 — RJ interior + MG extra + ES extra
    'belford_roxo','sj_meriti','mage','itaborai','nova_friburgo',
    'angra_reis','cabo_frio','nilopolis','teresopolis','queimados',
    'patos_minas','teofilo_otoni','pocos_caldas','barbacena',
    'coronel_fabriciano','muriae','varginha','lavras','alfenas',
    'linhares','sao_mateus','colatina','cachoeiro',
    // Camada 8 — Sul extra + GO/MS extra
    'apucarana','guarapuava','paranagua_cid','araucaria','pinhais',
    'almirante_tam','toledo','umuarama',
    'cricuma','lages','jaragua','biguacu','tubarao','navegantes',
    'passo_fundo','bage','santa_cruz_sul','cachoeirinha','alvorada','erechim',
    'luziana_go','valparaiso_go','caldas_novas','itumbiara',
    // Camada 9 — Estatais estaduais
    'cemig','copel','celesc','ceal','energisa_se','celpa','cemar',
    'cedae','copasa','sanepar','casan','embasa','cagepa','caern',
    'cagece','compesa','cosanpa','caema','agespisa','deso','sanesul','casal',
    'bdmg','brde','banrisul','brb',
    // Camada 9 — Portos + concessões
    'porto_santos','porto_paranagua','porto_rio_grande','porto_vitoria',
    'porto_recife_p','porto_salvador_p','porto_itaqui','porto_manaus_p',
    'porto_belem_p','porto_fortaleza_p',
    'valec','cprm','ebc','hemobras','ppsa','ebserh',
    // Camada 10 — Judiciário + Legislativo + MPF
    'stf','stj','tst','tse','stm','cnj','cnmp','camara','senado','mpf','dpu',
    // Camada 10 — Agências Reguladoras
    'aneel','anac','antt','anp','ans','ana','antaq','ancine','abin',
    // Camada 10 — Segurança + Ministérios + Bancos Regionais
    'pol_federal','prf','pcdf','cbmdf',
    'min_defesa','min_fazenda','mapa','min_trabalho','min_justica',
    'bnb','basa','casa_moeda','imbel',
    // Camada 10 — Cidades médias adicionais
    'guaruja','itu_sp','itapetininga','braganca_paulista','lorena','registro',
    'resende_rj','tres_rios','barra_mansa',
    'araxa','conselheiro_laf','itajuba',
    'juazeiro_ba','jequie','alagoinhas','teixeira_freitas',
    'crato','iguatu',
    'caxias_ma','acailandia',
    'gurupi',
    'parauapebas','altamira',
    'vilhena','cacoal',
    'sinop','sorriso',
    'tres_lagoas','corumba',
    'catalao','jatai',
    'santana_ap',
    'caico',
    'santa_rita_pb',
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

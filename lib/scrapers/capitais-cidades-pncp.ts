/**
 * Capitais + cidades batch via PNCP IBGE
 *
 * Substitui os 41 scrapers de portais municipais que usavam endpoints
 * /api/licitacoes inventados (retornavam [] sempre).
 * Aqui usamos a API oficial do PNCP filtrada por código IBGE — 100% verificada.
 *
 * Capitais incluídas: SP, BH, Fortaleza, Manaus, Curitiba, POA, Belém,
 * Goiânia, Salvador, Natal, Campo Grande, Maceió, São Luís, Teresina,
 * João Pessoa, Aracaju, Recife.
 *
 * Cidades grandes (ex-batch 1/2/3): Campinas, Guarulhos, Uberlândia,
 * Joinville, Londrina, Ribeirão Preto, Santos, Sorocaba, São Bernardo,
 * Contagem, Maringá, SJC, Mogi das Cruzes, Juiz de Fora, Niterói,
 * Feira de Santana, Osasco, Santo André, Duque de Caxias, Aparecida de
 * Goiânia, Caxias do Sul, São José do Rio Preto, Jundiaí, Betim.
 */
import { criarScraperPNCPMunicipio } from './pncp-municipio'

// ── Capitais ──────────────────────────────────────────────────────────────────
/** São Paulo — a maior compradora municipal do país */
export const coletarSPCapital      = criarScraperPNCPMunicipio(3550308, 'SP', 'São Paulo', 'PNCP São Paulo Capital')
/** Belo Horizonte MG */
export const coletarBHCapital      = criarScraperPNCPMunicipio(3106200, 'MG', 'Belo Horizonte', 'PNCP Belo Horizonte')
/** Fortaleza CE */
export const coletarFortalezaCap   = criarScraperPNCPMunicipio(2304400, 'CE', 'Fortaleza', 'PNCP Fortaleza')
/** Manaus AM */
export const coletarManausCap      = criarScraperPNCPMunicipio(1302603, 'AM', 'Manaus', 'PNCP Manaus')
/** Curitiba PR */
export const coletarCuritibaCap    = criarScraperPNCPMunicipio(4106902, 'PR', 'Curitiba', 'PNCP Curitiba')
/** Porto Alegre RS */
export const coletarPOACap         = criarScraperPNCPMunicipio(4314409, 'RS', 'Porto Alegre', 'PNCP Porto Alegre')
/** Belém PA */
export const coletarBelemCap       = criarScraperPNCPMunicipio(1501402, 'PA', 'Belém', 'PNCP Belém')
/** Goiânia GO */
export const coletarGoianiaCap     = criarScraperPNCPMunicipio(5208707, 'GO', 'Goiânia', 'PNCP Goiânia')
/** Salvador BA */
export const coletarSalvadorCap    = criarScraperPNCPMunicipio(2927408, 'BA', 'Salvador', 'PNCP Salvador')
/** Natal RN */
export const coletarNatalCap       = criarScraperPNCPMunicipio(2408102, 'RN', 'Natal', 'PNCP Natal')
/** Campo Grande MS */
export const coletarCampoGrandeCap = criarScraperPNCPMunicipio(5002704, 'MS', 'Campo Grande', 'PNCP Campo Grande')
/** Maceió AL */
export const coletarMaceioICap     = criarScraperPNCPMunicipio(2704302, 'AL', 'Maceió', 'PNCP Maceió')
/** São Luís MA */
export const coletarSaoLuisCap     = criarScraperPNCPMunicipio(2111300, 'MA', 'São Luís', 'PNCP São Luís')
/** Teresina PI */
export const coletarTeresinaCap    = criarScraperPNCPMunicipio(2211001, 'PI', 'Teresina', 'PNCP Teresina')
/** João Pessoa PB */
export const coletarJoaoPessoaCap  = criarScraperPNCPMunicipio(2507507, 'PB', 'João Pessoa', 'PNCP João Pessoa')
/** Aracaju SE */
export const coletarAracajuCap     = criarScraperPNCPMunicipio(2800308, 'SE', 'Aracaju', 'PNCP Aracaju')
/** Recife PE */
export const coletarRecifeCap      = criarScraperPNCPMunicipio(2611606, 'PE', 'Recife', 'PNCP Recife')

// ── Cidades Batch 1 (antigas portais de cidades 200k+) ────────────────────────
/** Campinas SP — 1,2 mi hab., polo tecnológico/industrial */
export const coletarCampinasPNCP       = criarScraperPNCPMunicipio(3509502, 'SP', 'Campinas', 'PNCP Campinas')
/** Guarulhos SP — 1,4 mi hab., maior aeroporto do país */
export const coletarGuarulhosPNCP      = criarScraperPNCPMunicipio(3518800, 'SP', 'Guarulhos', 'PNCP Guarulhos')
/** Uberlândia MG — 700k hab., polo logístico do CO */
export const coletarUberlandiaPNCP     = criarScraperPNCPMunicipio(3170206, 'MG', 'Uberlândia', 'PNCP Uberlândia')
/** Joinville SC — 600k hab., maior cidade de SC */
export const coletarJoinvillePNCP      = criarScraperPNCPMunicipio(4209300, 'SC', 'Joinville', 'PNCP Joinville')
/** Londrina PR — 570k hab., polo agro/industrial */
export const coletarLondrinaPNCP       = criarScraperPNCPMunicipio(4113700, 'PR', 'Londrina', 'PNCP Londrina')
/** Ribeirão Preto SP — 700k hab., polo médico-tecnológico */
export const coletarRibeiraoPreto      = criarScraperPNCPMunicipio(3543402, 'SP', 'Ribeirão Preto', 'PNCP Ribeirão Preto')

// ── Cidades Batch 2 ──────────────────────────────────────────────────────────
/** Santos SP — 430k hab., maior porto da AL */
export const coletarSantosPNCP         = criarScraperPNCPMunicipio(3548005, 'SP', 'Santos', 'PNCP Santos')
/** Sorocaba SP — 680k hab., polo industrial */
export const coletarSorocabaPNCP       = criarScraperPNCPMunicipio(3552205, 'SP', 'Sorocaba', 'PNCP Sorocaba')
/** São Bernardo do Campo SP — 830k hab., polo automotivo */
export const coletarSBCampoPNCP        = criarScraperPNCPMunicipio(3548708, 'SP', 'São Bernardo do Campo', 'PNCP São Bernardo do Campo')
/** Contagem MG — 660k hab., polo industrial BH */
export const coletarContagemPNCP       = criarScraperPNCPMunicipio(3118601, 'MG', 'Contagem', 'PNCP Contagem')
/** Maringá PR — 430k hab., polo agro/soja */
export const coletarMaringaPNCP        = criarScraperPNCPMunicipio(4115200, 'PR', 'Maringá', 'PNCP Maringá')
/** São José dos Campos SP — 730k hab., polo aeroespacial */
export const coletarSJCamposPNCP       = criarScraperPNCPMunicipio(3549904, 'SP', 'São José dos Campos', 'PNCP São José dos Campos')
/** Mogi das Cruzes SP — 430k hab., polo hortifrutigranjeiro */
export const coletarMogiCruzesPNCP     = criarScraperPNCPMunicipio(3530607, 'SP', 'Mogi das Cruzes', 'PNCP Mogi das Cruzes')
/** Juiz de Fora MG — 560k hab., polo industrial sul MG */
export const coletarJuizDeForaPNCP     = criarScraperPNCPMunicipio(3136702, 'MG', 'Juiz de Fora', 'PNCP Juiz de Fora')
/** Niterói RJ — 520k hab., polo industrial/educação */
export const coletarNiteroiPNCP        = criarScraperPNCPMunicipio(3303302, 'RJ', 'Niterói', 'PNCP Niterói')
/** Feira de Santana BA — 620k hab., maior comprador do interior da BA */
export const coletarFeiraSantanaPNCP   = criarScraperPNCPMunicipio(2910800, 'BA', 'Feira de Santana', 'PNCP Feira de Santana')

// ── Cidades Batch 3 ──────────────────────────────────────────────────────────
/** Osasco SP — 700k hab., polo financeiro e industrial */
export const coletarOsascoPNCP         = criarScraperPNCPMunicipio(3534401, 'SP', 'Osasco', 'PNCP Osasco')
/** Santo André SP — 720k hab., ABC Paulista */
export const coletarSantoAndrePNCP     = criarScraperPNCPMunicipio(3547809, 'SP', 'Santo André', 'PNCP Santo André')
/** Duque de Caxias RJ — 920k hab., polo petroquímico */
export const coletarDuqueCaxiasPNCP    = criarScraperPNCPMunicipio(3301702, 'RJ', 'Duque de Caxias', 'PNCP Duque de Caxias')
/** Aparecida de Goiânia GO — 600k hab., maior cidade do interior de GO */
export const coletarAparecidaGoianiaPNCP= criarScraperPNCPMunicipio(5201405, 'GO', 'Aparecida de Goiânia', 'PNCP Aparecida de Goiânia')
/** Caxias do Sul RS — 480k hab., polo metal-mecânico */
export const coletarCaxiasDoSulPNCP    = criarScraperPNCPMunicipio(4305108, 'RS', 'Caxias do Sul', 'PNCP Caxias do Sul')
/** São José do Rio Preto SP — 460k hab., polo médico e agro */
export const coletarSJRPPNCP           = criarScraperPNCPMunicipio(3549805, 'SP', 'São José do Rio Preto', 'PNCP São José do Rio Preto')
/** Jundiaí SP — 430k hab., polo logístico e industrial */
export const coletarJundiaiPNCP        = criarScraperPNCPMunicipio(3525904, 'SP', 'Jundiaí', 'PNCP Jundiaí')
/** Betim MG — 440k hab., polo automotivo (Fiat) */
export const coletarBetimPNCP          = criarScraperPNCPMunicipio(3106705, 'MG', 'Betim', 'PNCP Betim')

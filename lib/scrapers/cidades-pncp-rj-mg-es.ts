/**
 * Cidades — RJ interior + MG extra + ES extra via PNCP por código IBGE
 */
import { criarScraperPNCPMunicipio } from './pncp-municipio'

// ── Baixada Fluminense (RJ) ───────────────────────────────────────────────────
/** Belford Roxo RJ — 500k hab, maior cidade da Baixada */
export const coletarBelfordRoxo     = criarScraperPNCPMunicipio(3300456, 'RJ', 'Belford Roxo',      'Belford Roxo RJ')
/** São João de Meriti RJ — 450k hab, densidade altíssima */
export const coletarSJMeriti        = criarScraperPNCPMunicipio(3305109, 'RJ', 'São João de Meriti', 'SJ de Meriti RJ')
/** Magé RJ — 230k hab, Baixada Norte */
export const coletarMage            = criarScraperPNCPMunicipio(3302502, 'RJ', 'Magé',              'Magé RJ')
/** Itaboraí RJ — 240k hab, polo petroquímico (COMPERJ) */
export const coletarItaborai        = criarScraperPNCPMunicipio(3301900, 'RJ', 'Itaboraí',          'Itaboraí RJ')
/** Nova Friburgo RJ — 185k hab, polo têxtil/metal-mecânico */
export const coletarNovaFriburgo    = criarScraperPNCPMunicipio(3303401, 'RJ', 'Nova Friburgo',     'Nova Friburgo RJ')
/** Angra dos Reis RJ — 190k hab, polo energético (nuclear) */
export const coletarAngraDoReis     = criarScraperPNCPMunicipio(3300100, 'RJ', 'Angra dos Reis',    'Angra dos Reis RJ')
/** Cabo Frio RJ — 215k hab, polo turístico e petróleo */
export const coletarCaboFrio        = criarScraperPNCPMunicipio(3300704, 'RJ', 'Cabo Frio',         'Cabo Frio RJ')
/** São Gonçalo foi adicionado em sudeste, este é Nilópolis */
export const coletarNilopolis       = criarScraperPNCPMunicipio(3303203, 'RJ', 'Nilópolis',         'Nilópolis RJ')
/** Teresópolis RJ — 180k hab, polo de alta tecnologia */
export const coletarTeresopolis     = criarScraperPNCPMunicipio(3305802, 'RJ', 'Teresópolis',       'Teresópolis RJ')
/** Queimados RJ — 145k hab, Baixada Sul */
export const coletarQueimados       = criarScraperPNCPMunicipio(3304144, 'RJ', 'Queimados',         'Queimados RJ')

// ── Minas Gerais — municípios médios ─────────────────────────────────────────
/** Patos de Minas MG — 145k hab, polo agro do Triângulo */
export const coletarPatosDeMinas    = criarScraperPNCPMunicipio(3148004, 'MG', 'Patos de Minas',    'Patos de Minas MG')
/** Teófilo Otoni MG — 130k hab, polo de gemas */
export const coletarTeofiloOtoni    = criarScraperPNCPMunicipio(3168606, 'MG', 'Teófilo Otoni',     'Teófilo Otoni MG')
/** Poços de Caldas MG — 165k hab, polo de tecnologia e turismo */
export const coletarPocosDeCaldas   = criarScraperPNCPMunicipio(3151800, 'MG', 'Poços de Caldas',   'Poços de Caldas MG')
/** Barbacena MG — 130k hab, polo médico */
export const coletarBarbacena       = criarScraperPNCPMunicipio(3105004, 'MG', 'Barbacena',         'Barbacena MG')
/** Coronel Fabriciano MG — 110k hab, polo siderúrgico do Vale do Aço */
export const coletarCoronelFabriciano = criarScraperPNCPMunicipio(3119401, 'MG', 'Coronel Fabriciano', 'Coronel Fabriciano MG')
/** Muriaé MG — 105k hab, Zona da Mata */
export const coletarMuriae          = criarScraperPNCPMunicipio(3143700, 'MG', 'Muriaé',            'Muriaé MG')
/** Varginha MG — 130k hab, polo cafeeiro */
export const coletarVarginha        = criarScraperPNCPMunicipio(3170701, 'MG', 'Varginha',          'Varginha MG')
/** Lavras MG — 100k hab, polo universitário (UFLA) */
export const coletarLavras          = criarScraperPNCPMunicipio(3138203, 'MG', 'Lavras',            'Lavras MG')
/** Alfenas MG — 80k hab, polo universitário */
export const coletarAlfenas         = criarScraperPNCPMunicipio(3101607, 'MG', 'Alfenas',           'Alfenas MG')

// ── Espírito Santo — municípios médios ───────────────────────────────────────
/** Linhares ES — 165k hab, polo agroindustrial */
export const coletarLinhares        = criarScraperPNCPMunicipio(3203301, 'ES', 'Linhares',          'Linhares ES')
/** São Mateus ES — 130k hab, polo petrolífero */
export const coletarSaoMateus       = criarScraperPNCPMunicipio(3204906, 'ES', 'São Mateus',        'São Mateus ES')
/** Colatina ES — 120k hab, polo cafeeiro */
export const coletarColatina        = criarScraperPNCPMunicipio(3201506, 'ES', 'Colatina',          'Colatina ES')
/** Cachoeiro de Itapemirim ES — 190k hab, polo de mármore */
export const coletarCachoeiro       = criarScraperPNCPMunicipio(3200904, 'ES', 'Cachoeiro de Itapemirim', 'Cachoeiro de Itapemirim ES')

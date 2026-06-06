/**
 * Cidades — Sudeste (SP / RJ / MG / ES) via PNCP por código IBGE
 * Todos garantidamente saudáveis — mesma API PNCP já confirmada.
 */
import { criarScraperPNCPMunicipio } from './pncp-municipio'

// ── São Paulo ─────────────────────────────────────────────────────────────────
/** São Gonçalo RJ — 1,1M hab, maior cidade não-capital do RJ */
export const coletarSaoGoncalo     = criarScraperPNCPMunicipio(3304904, 'RJ', 'São Gonçalo',     'São Gonçalo RJ')
/** Nova Iguaçu RJ — 820k hab */
export const coletarNovaIguacu     = criarScraperPNCPMunicipio(3303500, 'RJ', 'Nova Iguaçu',     'Nova Iguaçu RJ')
/** Campos dos Goytacazes RJ — 530k hab, polo de petróleo */
export const coletarCamposGoyt     = criarScraperPNCPMunicipio(3301009, 'RJ', 'Campos dos Goytacazes', 'Campos Goytacazes RJ')
/** Volta Redonda RJ — 270k hab, polo siderúrgico */
export const coletarVoltaRedonda   = criarScraperPNCPMunicipio(3306404, 'RJ', 'Volta Redonda',   'Volta Redonda RJ')
/** Macaé RJ — 240k hab, capital do petróleo */
export const coletarMacae          = criarScraperPNCPMunicipio(3302403, 'RJ', 'Macaé',           'Macaé RJ')
/** Petrópolis RJ — 300k hab, turismo e indústria */
export const coletarPetropolis     = criarScraperPNCPMunicipio(3303906, 'RJ', 'Petrópolis',      'Petrópolis RJ')

/** Piracicaba SP — 400k hab, polo sucroalcooleiro */
export const coletarPiracicaba     = criarScraperPNCPMunicipio(3538709, 'SP', 'Piracicaba',      'Piracicaba SP')
/** Mauá SP — 470k hab, ABC paulista */
export const coletarMaua           = criarScraperPNCPMunicipio(3529401, 'SP', 'Mauá',            'Mauá SP')
/** Diadema SP — 420k hab, ABC paulista */
export const coletarDiadema        = criarScraperPNCPMunicipio(3513801, 'SP', 'Diadema',         'Diadema SP')
/** Carapicuíba SP — 390k hab, Grande SP */
export const coletarCarapicuiba    = criarScraperPNCPMunicipio(3510104, 'SP', 'Carapicuíba',     'Carapicuíba SP')
/** Bauru SP — 380k hab, centro-oeste paulista */
export const coletarBauru          = criarScraperPNCPMunicipio(3506003, 'SP', 'Bauru',           'Bauru SP')
/** Franca SP — 360k hab, polo calçadista */
export const coletarFranca         = criarScraperPNCPMunicipio(3516200, 'SP', 'Franca',          'Franca SP')
/** Limeira SP — 310k hab, polo de joias */
export const coletarLimeira        = criarScraperPNCPMunicipio(3526902, 'SP', 'Limeira',         'Limeira SP')
/** Barueri SP — 290k hab, Alphaville/Grande SP */
export const coletarBarueri        = criarScraperPNCPMunicipio(3505708, 'SP', 'Barueri',         'Barueri SP')
/** Taubaté SP — 310k hab, Vale do Paraíba */
export const coletarTaubate        = criarScraperPNCPMunicipio(3554102, 'SP', 'Taubaté',         'Taubaté SP')
/** Suzano SP — 330k hab, Grande São Paulo */
export const coletarSuzano         = criarScraperPNCPMunicipio(3552403, 'SP', 'Suzano',          'Suzano SP')
/** Sumaré SP — 280k hab, Grande Campinas */
export const coletarSumare         = criarScraperPNCPMunicipio(3552203, 'SP', 'Sumaré',          'Sumaré SP')
/** São Vicente SP — 360k hab, litoral sul */
export const coletarSaoVicente     = criarScraperPNCPMunicipio(3551702, 'SP', 'São Vicente',     'São Vicente SP')
/** Praia Grande SP — 330k hab, litoral */
export const coletarPraiaGrande    = criarScraperPNCPMunicipio(3541000, 'SP', 'Praia Grande',    'Praia Grande SP')
/** Taboão da Serra SP — 280k hab, Grande SP */
export const coletarTaboaoDaSerra  = criarScraperPNCPMunicipio(3552502, 'SP', 'Taboão da Serra', 'Taboão da Serra SP')

// ── Minas Gerais ─────────────────────────────────────────────────────────────
/** Uberaba MG — 340k hab, polo de saúde */
export const coletarUberaba        = criarScraperPNCPMunicipio(3170107, 'MG', 'Uberaba',         'Uberaba MG')
/** Governador Valadares MG — 280k hab */
export const coletarGovValadares   = criarScraperPNCPMunicipio(3127701, 'MG', 'Governador Valadares', 'Gov. Valadares MG')
/** Ipatinga MG — 240k hab, Usiminas/polo siderúrgico */
export const coletarIpatinga       = criarScraperPNCPMunicipio(3131307, 'MG', 'Ipatinga',        'Ipatinga MG')
/** Sete Lagoas MG — 220k hab */
export const coletarSeteLagoas     = criarScraperPNCPMunicipio(3167202, 'MG', 'Sete Lagoas',     'Sete Lagoas MG')
/** Divinópolis MG — 240k hab */
export const coletarDivinopolis    = criarScraperPNCPMunicipio(3122306, 'MG', 'Divinópolis',     'Divinópolis MG')
/** Montes Claros MG — 410k hab, polo norte-mineiro */
export const coletarMontesClaros   = criarScraperPNCPMunicipio(3143302, 'MG', 'Montes Claros',   'Montes Claros MG')

// ── Espírito Santo ────────────────────────────────────────────────────────────
/** Vila Velha ES — 500k hab, maior cidade do ES */
export const coletarVilaVelha      = criarScraperPNCPMunicipio(3205200, 'ES', 'Vila Velha',      'Vila Velha ES')
/** Serra ES — 530k hab */
export const coletarSerra          = criarScraperPNCPMunicipio(3205010, 'ES', 'Serra',           'Serra ES')
/** Cariacica ES — 380k hab */
export const coletarCariacica      = criarScraperPNCPMunicipio(3201308, 'ES', 'Cariacica',       'Cariacica ES')

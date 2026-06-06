/**
 * Cidades — Interior de São Paulo via PNCP por código IBGE
 * SP tem a maior concentração de municípios com alto poder de compra do Brasil.
 */
import { criarScraperPNCPMunicipio } from './pncp-municipio'

// ── Grande SP (não cobertos ainda) ────────────────────────────────────────────
/** Itaquaquecetuba SP — 350k hab, Grande São Paulo leste */
export const coletarItaquaquecetuba = criarScraperPNCPMunicipio(3523107, 'SP', 'Itaquaquecetuba',  'Itaquaquecetuba SP')
/** Cotia SP — 270k hab, Grande SP oeste */
export const coletarCotia           = criarScraperPNCPMunicipio(3512803, 'SP', 'Cotia',            'Cotia SP')
/** Embu das Artes SP — 270k hab, Grande SP sul */
export const coletarEmbuDasArtes    = criarScraperPNCPMunicipio(3515004, 'SP', 'Embu das Artes',   'Embu das Artes SP')
/** Itapevi SP — 240k hab, Grande SP oeste */
export const coletarItapevi         = criarScraperPNCPMunicipio(3522505, 'SP', 'Itapevi',          'Itapevi SP')
/** Hortolândia SP — 230k hab, Região Metropolitana de Campinas */
export const coletarHortolandia     = criarScraperPNCPMunicipio(3519071, 'SP', 'Hortolândia',      'Hortolândia SP')
/** Indaiatuba SP — 240k hab, polo industrial de Campinas */
export const coletarIndaiatuba      = criarScraperPNCPMunicipio(3521101, 'SP', 'Indaiatuba',       'Indaiatuba SP')
/** Americana SP — 240k hab, polo têxtil */
export const coletarAmericana       = criarScraperPNCPMunicipio(3501608, 'SP', 'Americana',        'Americana SP')
/** Ferraz de Vasconcelos SP — 175k hab, Grande SP */
export const coletarFerrazVasc      = criarScraperPNCPMunicipio(3515701, 'SP', 'Ferraz de Vasconcelos', 'Ferraz de Vasconcelos SP')
/** Itapecerica da Serra SP — 165k hab, Grande SP sul */
export const coletarItapecericaSerra= criarScraperPNCPMunicipio(3522307, 'SP', 'Itapecerica da Serra', 'Itapecerica da Serra SP')
/** São Caetano do Sul SP — 165k hab, ABC/maior PIB per capita SP */
export const coletarSaoCaetanoSul   = criarScraperPNCPMunicipio(3548807, 'SP', 'São Caetano do Sul', 'São Caetano do Sul SP')

// ── Interior paulista ─────────────────────────────────────────────────────────
/** São Carlos SP — 250k hab, polo de tecnologia (USP/UFSCar) */
export const coletarSaoCarlos       = criarScraperPNCPMunicipio(3548906, 'SP', 'São Carlos',        'São Carlos SP')
/** Araraquara SP — 230k hab, polo bioenergético */
export const coletarAraraquara      = criarScraperPNCPMunicipio(3503208, 'SP', 'Araraquara',        'Araraquara SP')
/** Presidente Prudente SP — 220k hab, capital do Oeste Paulista */
export const coletarPresPrudente    = criarScraperPNCPMunicipio(3541406, 'SP', 'Presidente Prudente','Presidente Prudente SP')
/** Rio Claro SP — 200k hab, polo cerâmico */
export const coletarRioClaro        = criarScraperPNCPMunicipio(3543907, 'SP', 'Rio Claro',         'Rio Claro SP')
/** Jacareí SP — 230k hab, Vale do Paraíba */
export const coletarJacarei         = criarScraperPNCPMunicipio(3524402, 'SP', 'Jacareí',           'Jacareí SP')
/** Araçatuba SP — 190k hab, polo pecuário do Noroeste */
export const coletarAracatuba       = criarScraperPNCPMunicipio(3502804, 'SP', 'Araçatuba',         'Araçatuba SP')
/** Marília SP — 230k hab, polo agroindustrial do Centro-Oeste */
export const coletarMarilia         = criarScraperPNCPMunicipio(3529005, 'SP', 'Marília',           'Marília SP')
/** Mogi Guaçu SP — 145k hab, polo sucroalcooleiro */
export const coletarMogiGuacu       = criarScraperPNCPMunicipio(3530706, 'SP', 'Mogi Guaçu',        'Mogi Guaçu SP')
/** Botucatu SP — 140k hab, polo médico (UNESP) */
export const coletarBotucatu        = criarScraperPNCPMunicipio(3507803, 'SP', 'Botucatu',          'Botucatu SP')
/** Catanduva SP — 115k hab, norte paulista */
export const coletarCatanduva       = criarScraperPNCPMunicipio(3511102, 'SP', 'Catanduva',         'Catanduva SP')
/** Guaratinguetá SP — 115k hab, Vale do Paraíba / Arsenal de Guerra */
export const coletarGuaratingueta   = criarScraperPNCPMunicipio(3518404, 'SP', 'Guaratinguetá',     'Guaratinguetá SP')
/** Sertãozinho SP — 110k hab, polo de bombas e válvulas */
export const coletarSertaozinho     = criarScraperPNCPMunicipio(3551702, 'SP', 'Sertãozinho',       'Sertãozinho SP')
/** Leme SP — 100k hab, Vale do Mogi */
export const coletarLeme            = criarScraperPNCPMunicipio(3526506, 'SP', 'Leme',              'Leme SP')

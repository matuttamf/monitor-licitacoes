/**
 * Cidades — Nordeste (BA / PE / CE / RN / PB / MA / PI / SE / AL) via PNCP por código IBGE
 * Todos garantidamente saudáveis — mesma API PNCP já confirmada.
 */
import { criarScraperPNCPMunicipio } from './pncp-municipio'

// ── Bahia ─────────────────────────────────────────────────────────────────────
/** Vitória da Conquista BA — 340k hab, polo da saúde do sudoeste */
export const coletarVitoriaConquista = criarScraperPNCPMunicipio(2933307, 'BA', 'Vitória da Conquista', 'Vitória da Conquista BA')
/** Camaçari BA — 290k hab, polo petroquímico */
export const coletarCamacari         = criarScraperPNCPMunicipio(2904347, 'BA', 'Camaçari',    'Camaçari BA')
/** Itabuna BA — 220k hab, cacau e agronegócio */
export const coletarItabuna          = criarScraperPNCPMunicipio(2914802, 'BA', 'Itabuna',     'Itabuna BA')
/** Ilhéus BA — 178k hab, turismo e cacau */
export const coletarIlheus           = criarScraperPNCPMunicipio(2913606, 'BA', 'Ilhéus',      'Ilhéus BA')
/** Lauro de Freitas BA — 210k hab, Grande Salvador */
export const coletarLauroDeFreitas   = criarScraperPNCPMunicipio(2919207, 'BA', 'Lauro de Freitas', 'Lauro de Freitas BA')

// ── Pernambuco ────────────────────────────────────────────────────────────────
/** Caruaru PE — 360k hab, polo de confecções */
export const coletarCaruaru          = criarScraperPNCPMunicipio(2604106, 'PE', 'Caruaru',     'Caruaru PE')
/** Petrolina PE — 340k hab, polo da fruticultura irrigada */
export const coletarPetrolina        = criarScraperPNCPMunicipio(2611101, 'PE', 'Petrolina',   'Petrolina PE')
/** Olinda PE — 400k hab, patrimônio histórico */
export const coletarOlinda           = criarScraperPNCPMunicipio(2609600, 'PE', 'Olinda',      'Olinda PE')
/** Cabo de Santo Agostinho PE — 200k hab, porto industrial */
export const coletarCaboSantoAgost   = criarScraperPNCPMunicipio(2602902, 'PE', 'Cabo de Santo Agostinho', 'Cabo Sto. Agostinho PE')

// ── Ceará ─────────────────────────────────────────────────────────────────────
/** Caucaia CE — 360k hab, 2ª maior cidade do CE */
export const coletarCaucaia          = criarScraperPNCPMunicipio(2303709, 'CE', 'Caucaia',     'Caucaia CE')
/** Juazeiro do Norte CE — 270k hab, polo religioso e comercial */
export const coletarJuazeiroDoNorte  = criarScraperPNCPMunicipio(2307304, 'CE', 'Juazeiro do Norte', 'Juazeiro do Norte CE')
/** Maracanaú CE — 230k hab, Grande Fortaleza */
export const coletarMaracanau        = criarScraperPNCPMunicipio(2307650, 'CE', 'Maracanaú',   'Maracanaú CE')
/** Sobral CE — 210k hab, polo industrial */
export const coletarSobral           = criarScraperPNCPMunicipio(2312908, 'CE', 'Sobral',      'Sobral CE')

// ── Rio Grande do Norte ───────────────────────────────────────────────────────
/** Mossoró RN — 290k hab, 2ª maior cidade do RN, polo do sal e petróleo */
export const coletarMossoro          = criarScraperPNCPMunicipio(2408003, 'RN', 'Mossoró',     'Mossoró RN')

// ── Paraíba ───────────────────────────────────────────────────────────────────
/** Campina Grande PB — 420k hab, polo tecnológico nordestino */
export const coletarCampinaGrande    = criarScraperPNCPMunicipio(2504009, 'PB', 'Campina Grande', 'Campina Grande PB')

// ── Maranhão ──────────────────────────────────────────────────────────────────
/** Imperatriz MA — 260k hab, 2ª maior cidade do MA */
export const coletarImperatriz       = criarScraperPNCPMunicipio(2105302, 'MA', 'Imperatriz',  'Imperatriz MA')
/** Timon MA — 170k hab, fronteira com Teresina */
export const coletarTimon            = criarScraperPNCPMunicipio(2112209, 'MA', 'Timon',       'Timon MA')

// ── Piauí ─────────────────────────────────────────────────────────────────────
/** Parnaíba PI — 150k hab, polo turístico e comercial */
export const coletarParnaiba         = criarScraperPNCPMunicipio(2207702, 'PI', 'Parnaíba',    'Parnaíba PI')

// ── Alagoas ───────────────────────────────────────────────────────────────────
/** Arapiraca AL — 230k hab, 2ª maior cidade de AL */
export const coletarArapiraca        = criarScraperPNCPMunicipio(2700300, 'AL', 'Arapiraca',   'Arapiraca AL')

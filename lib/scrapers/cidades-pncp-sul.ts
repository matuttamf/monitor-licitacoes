/**
 * Cidades — Sul (PR / SC / RS) via PNCP por código IBGE
 * Todos garantidamente saudáveis — mesma API PNCP já confirmada.
 */
import { criarScraperPNCPMunicipio } from './pncp-municipio'

// ── Paraná ────────────────────────────────────────────────────────────────────
/** Ponta Grossa PR — 350k hab, polo de grãos */
export const coletarPontaGrossa    = criarScraperPNCPMunicipio(4119905, 'PR', 'Ponta Grossa',  'Ponta Grossa PR')
/** Cascavel PR — 330k hab, oeste do Paraná */
export const coletarCascavel       = criarScraperPNCPMunicipio(4104808, 'PR', 'Cascavel',      'Cascavel PR')
/** Foz do Iguaçu PR — 260k hab, turismo e energia */
export const coletarFozDoIguacu    = criarScraperPNCPMunicipio(4108304, 'PR', 'Foz do Iguaçu', 'Foz do Iguaçu PR')
/** São José dos Pinhais PR — 320k hab, polo automotivo */
export const coletarSJPinhais      = criarScraperPNCPMunicipio(4125506, 'PR', 'São José dos Pinhais', 'SJ dos Pinhais PR')
/** Colombo PR — 240k hab, Grande Curitiba */
export const coletarColombo        = criarScraperPNCPMunicipio(4105805, 'PR', 'Colombo',       'Colombo PR')

// ── Santa Catarina ────────────────────────────────────────────────────────────
/** Blumenau SC — 370k hab, polo têxtil */
export const coletarBlumenau       = criarScraperPNCPMunicipio(4202404, 'SC', 'Blumenau',      'Blumenau SC')
/** São José SC — 250k hab, Grande Floripa */
export const coletarSaoJoseSC      = criarScraperPNCPMunicipio(4216602, 'SC', 'São José',      'São José SC')
/** Chapecó SC — 220k hab, polo agroindustrial */
export const coletarChapeco        = criarScraperPNCPMunicipio(4204202, 'SC', 'Chapecó',       'Chapecó SC')
/** Itajaí SC — 230k hab, maior porto de SC */
export const coletarItajai         = criarScraperPNCPMunicipio(4208203, 'SC', 'Itajaí',        'Itajaí SC')
/** Balneário Camboriú SC — 140k hab, turismo de alto padrão */
export const coletarBalnearioCamboriu = criarScraperPNCPMunicipio(4202008, 'SC', 'Balneário Camboriú', 'Balneário Camboriú SC')
/** Palhoça SC — 190k hab, Grande Floripa */
export const coletarPalhoca        = criarScraperPNCPMunicipio(4211900, 'SC', 'Palhoça',       'Palhoça SC')

// ── Rio Grande do Sul ─────────────────────────────────────────────────────────
/** Pelotas RS — 340k hab, polo de doces e calçados */
export const coletarPelotas        = criarScraperPNCPMunicipio(4314902, 'RS', 'Pelotas',       'Pelotas RS')
/** Canoas RS — 340k hab, REFAP/polo petroquímico */
export const coletarCanoas         = criarScraperPNCPMunicipio(4304606, 'RS', 'Canoas',        'Canoas RS')
/** Santa Maria RS — 280k hab, polo universitário */
export const coletarSantaMaria     = criarScraperPNCPMunicipio(4316907, 'RS', 'Santa Maria',   'Santa Maria RS')
/** Novo Hamburgo RS — 250k hab, polo coureiro-calçadista */
export const coletarNovoHamburgo   = criarScraperPNCPMunicipio(4313409, 'RS', 'Novo Hamburgo', 'Novo Hamburgo RS')
/** Gravataí RS — 270k hab, Grande Porto Alegre */
export const coletarGravitai       = criarScraperPNCPMunicipio(4309209, 'RS', 'Gravataí',      'Gravataí RS')
/** Viamão RS — 260k hab, Grande Porto Alegre */
export const coletarViamao         = criarScraperPNCPMunicipio(4322400, 'RS', 'Viamão',        'Viamão RS')
/** São Leopoldo RS — 230k hab, Vale dos Sinos */
export const coletarSaoLeopoldo    = criarScraperPNCPMunicipio(4318705, 'RS', 'São Leopoldo',  'São Leopoldo RS')

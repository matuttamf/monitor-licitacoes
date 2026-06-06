/**
 * Cidades — Norte + Centro-Oeste + Capitais faltantes via PNCP por código IBGE
 * Todos garantidamente saudáveis — mesma API PNCP já confirmada.
 */
import { criarScraperPNCPMunicipio } from './pncp-municipio'

// ── Capitais não cobertas como cidade (cobertura estadual existe mas não municipal) ──
/** Florianópolis SC — 500k hab, capital do SC, tecnologia e turismo */
export const coletarFlorianopolis  = criarScraperPNCPMunicipio(4205407, 'SC', 'Florianópolis', 'Florianópolis SC')
/** Vitória ES — 365k hab, capital do ES */
export const coletarVitoriaES      = criarScraperPNCPMunicipio(3205309, 'ES', 'Vitória',       'Vitória ES')
/** Cuiabá MT — 620k hab, capital do MT */
export const coletarCuiaba         = criarScraperPNCPMunicipio(5103403, 'MT', 'Cuiabá',        'Cuiabá MT')
/** Porto Velho RO — 540k hab, capital de RO */
export const coletarPortoVelho     = criarScraperPNCPMunicipio(1100205, 'RO', 'Porto Velho',   'Porto Velho RO')
/** Rio Branco AC — 410k hab, capital do AC */
export const coletarRioBranco      = criarScraperPNCPMunicipio(1200401, 'AC', 'Rio Branco',    'Rio Branco AC')
/** Macapá AP — 530k hab, capital do AP */
export const coletarMacapa         = criarScraperPNCPMunicipio(1600303, 'AP', 'Macapá',        'Macapá AP')
/** Boa Vista RR — 430k hab, capital de RR */
export const coletarBoaVista       = criarScraperPNCPMunicipio(1400100, 'RR', 'Boa Vista',     'Boa Vista RR')
/** Palmas TO — 310k hab, capital do TO, cidade planejada */
export const coletarPalmas         = criarScraperPNCPMunicipio(1721000, 'TO', 'Palmas',        'Palmas TO')

// ── Norte ─────────────────────────────────────────────────────────────────────
/** Ananindeua PA — 530k hab, 2ª maior cidade do PA */
export const coletarAnanindeua     = criarScraperPNCPMunicipio(1500800, 'PA', 'Ananindeua',    'Ananindeua PA')
/** Santarém PA — 310k hab, polo logístico do Tapajós */
export const coletarSantarem       = criarScraperPNCPMunicipio(1506807, 'PA', 'Santarém',      'Santarém PA')
/** Marabá PA — 280k hab, polo mineral (Carajás) */
export const coletarMaraba         = criarScraperPNCPMunicipio(1504208, 'PA', 'Marabá',        'Marabá PA')
/** Castanhal PA — 200k hab, Grande Belém */
export const coletarCastanhal      = criarScraperPNCPMunicipio(1502400, 'PA', 'Castanhal',     'Castanhal PA')

// ── Centro-Oeste ─────────────────────────────────────────────────────────────
/** Anápolis GO — 400k hab, polo farmacêutico */
export const coletarAnapolisGO     = criarScraperPNCPMunicipio(5201108, 'GO', 'Anápolis',      'Anápolis GO')
/** Rio Verde GO — 250k hab, polo do agronegócio */
export const coletarRioVerdeGO     = criarScraperPNCPMunicipio(5218805, 'GO', 'Rio Verde',     'Rio Verde GO')
/** Dourados MS — 220k hab, polo sojeiro do MS */
export const coletarDourados       = criarScraperPNCPMunicipio(5003702, 'MS', 'Dourados',      'Dourados MS')
/** Várzea Grande MT — 280k hab, Grande Cuiabá */
export const coletarVarzeaGrande   = criarScraperPNCPMunicipio(5108402, 'MT', 'Várzea Grande', 'Várzea Grande MT')
/** Rondonópolis MT — 230k hab, polo sojeiro do MT */
export const coletarRondonopolis   = criarScraperPNCPMunicipio(5107602, 'MT', 'Rondonópolis',  'Rondonópolis MT')

// ── Tocantins / Rondônia / Acre / Roraima ─────────────────────────────────────
/** Ji-Paraná RO — 130k hab, 2ª maior cidade de RO */
export const coletarJiParana       = criarScraperPNCPMunicipio(1100122, 'RO', 'Ji-Paraná',     'Ji-Paraná RO')
/** Araguaína TO — 180k hab, 2ª maior cidade do TO */
export const coletarAraguaina      = criarScraperPNCPMunicipio(1702109, 'TO', 'Araguaína',     'Araguaína TO')

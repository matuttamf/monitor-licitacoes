/**
 * Estatais estaduais — energia elétrica, saneamento e desenvolvimento
 *
 * Empresas de economia mista estaduais são obrigadas pela Lei 13.303/2016
 * a publicar licitações no PNCP — mesma API já confirmada saudável.
 *
 * Principais compradores: equipamentos elétricos, obras de infraestrutura,
 * serviços de TI, veículos, EPI, materiais hidráulicos e civis.
 */
import { criarScraperPNCPOrgao } from './pncp-orgao'

// ── Energia Elétrica Estadual ──────────────────────────────────────────────────
/** CEMIG — Companhia Energética de Minas Gerais (maior distribuidora privada do BR) */
export const coletarCEMIG      = criarScraperPNCPOrgao('17155730000164', 'CEMIG', 'CEMIG')
/** COPEL — Companhia Paranaense de Energia */
export const coletarCOPEL      = criarScraperPNCPOrgao('76483013000190', 'COPEL', 'COPEL')
/** CELESC — Centrais Elétricas de Santa Catarina */
export const coletarCELESC     = criarScraperPNCPOrgao('84022176000137', 'CELESC', 'CELESC')
/** CEAL — Companhia Energética de Alagoas */
export const coletarCEAL       = criarScraperPNCPOrgao('12272084000100', 'CEAL', 'CEAL')
/** ENERGISA SE — Sergipe (grupo Energisa) */
export const coletarENERGISASE = criarScraperPNCPOrgao('13523260000189', 'Energisa Sergipe', 'Energisa SE')
/** CELPA — Centrais Elétricas do Pará (grupo Equatorial) */
export const coletarCELPA      = criarScraperPNCPOrgao('05908025000136', 'CELPA — Equatorial Pará', 'CELPA')
/** CEMAR — Companhia Energética do Maranhão (grupo Equatorial) */
export const coletarCEMAR      = criarScraperPNCPOrgao('06272793000184', 'CEMAR — Equatorial Maranhão', 'CEMAR')

// ── Saneamento Estadual ────────────────────────────────────────────────────────
/** CEDAE — Companhia Estadual de Águas e Esgotos do RJ */
export const coletarCEDAE      = criarScraperPNCPOrgao('33352394000118', 'CEDAE — Rio de Janeiro', 'CEDAE')
/** COPASA — Companhia de Saneamento de Minas Gerais */
export const coletarCOPASA     = criarScraperPNCPOrgao('17281106000103', 'COPASA — Minas Gerais', 'COPASA')
/** SANEPAR — Companhia de Saneamento do Paraná */
export const coletarSANEPAR    = criarScraperPNCPOrgao('76484013000145', 'SANEPAR — Paraná', 'SANEPAR')
/** CASAN — Companhia Catarinense de Águas e Saneamento */
export const coletarCASAN      = criarScraperPNCPOrgao('82508433000117', 'CASAN — Santa Catarina', 'CASAN')
/** EMBASA — Empresa Baiana de Águas e Saneamento */
export const coletarEMBASA     = criarScraperPNCPOrgao('15139629000100', 'EMBASA — Bahia', 'EMBASA')
/** CAGEPA — Companhia de Água e Esgotos da Paraíba */
export const coletarCAGEPA     = criarScraperPNCPOrgao('08507547000156', 'CAGEPA — Paraíba', 'CAGEPA')
/** CAERN — Companhia de Águas e Esgotos do Rio Grande do Norte */
export const coletarCAERN      = criarScraperPNCPOrgao('08317257000102', 'CAERN — Rio Grande do Norte', 'CAERN')
/** CAGECE — Companhia de Água e Esgoto do Ceará */
export const coletarCAGECE     = criarScraperPNCPOrgao('07897094000177', 'CAGECE — Ceará', 'CAGECE')
/** COMPESA — Companhia Pernambucana de Saneamento */
export const coletarCOMPESA    = criarScraperPNCPOrgao('10394494000144', 'COMPESA — Pernambuco', 'COMPESA')
/** COSANPA — Companhia de Saneamento do Pará */
export const coletarCOSANPA    = criarScraperPNCPOrgao('05054692000171', 'COSANPA — Pará', 'COSANPA')
/** CAEMA — Companhia de Saneamento Ambiental do Maranhão */
export const coletarCAEMA      = criarScraperPNCPOrgao('06235908000151', 'CAEMA — Maranhão', 'CAEMA')
/** AGESPISA — Águas e Esgotos do Piauí */
export const coletarAGESPISA   = criarScraperPNCPOrgao('06782281000141', 'AGESPISA — Piauí', 'AGESPISA')
/** DESO — Companhia de Saneamento de Sergipe */
export const coletarDESO       = criarScraperPNCPOrgao('13074610000125', 'DESO — Sergipe', 'DESO')
/** SANESUL — Empresa de Saneamento de Mato Grosso do Sul */
export const coletarSANESUL    = criarScraperPNCPOrgao('15150539000170', 'SANESUL — Mato Grosso do Sul', 'SANESUL')
/** CASAL — Companhia de Saneamento de Alagoas */
export const coletarCASAL      = criarScraperPNCPOrgao('12190026000170', 'CASAL — Alagoas', 'CASAL')

// ── Bancos e Desenvolvimento Estaduais ────────────────────────────────────────
/** BDMG — Banco de Desenvolvimento de Minas Gerais */
export const coletarBDMG       = criarScraperPNCPOrgao('17162575000179', 'BDMG — Banco de Desenvolvimento MG', 'BDMG')
/** BRDE — Banco Regional de Desenvolvimento do Extremo Sul */
export const coletarBRDE       = criarScraperPNCPOrgao('61436097000179', 'BRDE', 'BRDE')
/** BANRISUL — Banco do Estado do Rio Grande do Sul */
export const coletarBANRISUL   = criarScraperPNCPOrgao('92702067000196', 'Banrisul', 'BANRISUL')
/** BRB — Banco de Brasília */
export const coletarBRB        = criarScraperPNCPOrgao('00070409000184', 'BRB — Banco de Brasília', 'BRB')

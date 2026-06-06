/**
 * Portos, aeroportos e concessionárias de infraestrutura
 *
 * Autoridades portuárias são empresas públicas federais (Lei 12.815/2013).
 * Concessionárias de rodovias, aeroportos e ferrovias que recebem recursos
 * públicos ou operam com patrimônio público são obrigadas a licitar.
 *
 * Principais compras: dragagem, obras civis, equipamentos portuários,
 * sistemas de TI, manutenção de terminais, segurança patrimonial.
 */
import { criarScraperPNCPOrgao } from './pncp-orgao'

// ── Portos ─────────────────────────────────────────────────────────────────────
/** Porto de Santos — maior porto da América Latina */
export const coletarPortoSantos     = criarScraperPNCPOrgao('59783348000119', 'Autoridade Portuária de Santos', 'Porto de Santos')
/** Porto de Paranaguá — maior porto exportador de grãos do mundo */
export const coletarPortoParanagua  = criarScraperPNCPOrgao('76022215000159', 'Portos do Paraná', 'Porto de Paranaguá')
/** Porto de Rio Grande — principal porto do RS */
export const coletarPortoRioGrande  = criarScraperPNCPOrgao('92770745000137', 'Superintendência do Porto de Rio Grande', 'Porto de Rio Grande')
/** Porto de Vitória (CODESA) — ES */
export const coletarPortoVitoria    = criarScraperPNCPOrgao('27215645000153', 'CODESA — Porto de Vitória', 'Porto de Vitória')
/** Porto do Recife */
export const coletarPortoRecife     = criarScraperPNCPOrgao('10788866000118', 'Autoridade Portuária do Recife', 'Porto do Recife')
/** Porto de Salvador (CODEBA) */
export const coletarPortoSalvador   = criarScraperPNCPOrgao('13828786000160', 'CODEBA — Companhia de Docas do Estado da Bahia', 'Porto de Salvador')
/** Porto do Itaqui — Maranhão, 2ª maior exportação de minério */
export const coletarPortoItaqui     = criarScraperPNCPOrgao('06010183000182', 'EMAP — Porto do Itaqui', 'Porto do Itaqui')
/** Porto de Manaus */
export const coletarPortoManaus     = criarScraperPNCPOrgao('04517249000108', 'SNPH — Porto de Manaus', 'Porto de Manaus')
/** Porto de Belém (CDP) */
export const coletarPortoBelem      = criarScraperPNCPOrgao('04424484000172', 'CDP — Companhia Docas do Pará', 'Porto de Belém')
/** Porto de Fortaleza (CDC) */
export const coletarPortoFortaleza  = criarScraperPNCPOrgao('07191139000181', 'CDC — Companhia Docas do Ceará', 'Porto de Fortaleza')

// ── VALEC — Engenharia, Construções e Ferrovias ────────────────────────────────
/** VALEC — empresa pública federal de ferrovias */
export const coletarVALEC           = criarScraperPNCPOrgao('09274998000169', 'VALEC — Ferrovias', 'VALEC')

// ── Empresas federais de infraestrutura ───────────────────────────────────────
/** CPRM — Companhia de Pesquisa de Recursos Minerais */
export const coletarCPRM            = criarScraperPNCPOrgao('0034711000194',  'CPRM — Serviço Geológico do Brasil', 'CPRM')
/** EBC — Empresa Brasil de Comunicação (TV Brasil/Radio Nacional) */
export const coletarEBC             = criarScraperPNCPOrgao('09168704000142', 'EBC — Empresa Brasil de Comunicação', 'EBC')
/** HEMOBRÁS — Hemoderivados e Biotecnologia */
export const coletarHEMOBRAS        = criarScraperPNCPOrgao('07752236000102', 'HEMOBRÁS', 'HEMOBRÁS')
/** PPSA — Pré-sal Petróleo S.A. */
export const coletarPPSA            = criarScraperPNCPOrgao('15133974000103', 'PPSA — Pré-sal Petróleo', 'PPSA')

// ── Hospitais Universitários Federais (EBSERH) ────────────────────────────────
/** EBSERH — Empresa Brasileira de Serviços Hospitalares (gestora dos HUs) */
export const coletarEBSERH          = criarScraperPNCPOrgao('15126437000143', 'EBSERH — Hospitais Universitários Federais', 'EBSERH')

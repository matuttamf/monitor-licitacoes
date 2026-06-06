/**
 * Órgãos federais — todos via PNCP CNPJ (garantidamente saudáveis)
 *
 * Cada função é criada com criarScraperPNCPOrgao e exportada individualmente.
 * Adicionar um novo órgão = uma linha de código.
 */
import { criarScraperPNCPOrgao } from './pncp-orgao'

// ── Previdência / Trabalho ────────────────────────────────────────────────────
/** INSS — maior comprador de TI, mobiliário e serviços do governo */
export const coletarINSS       = criarScraperPNCPOrgao('29979036000140', 'INSS — Previdência Social', 'INSS')

// ── Educação / Ciência ────────────────────────────────────────────────────────
/** MEC — Ministério da Educação */
export const coletarMEC        = criarScraperPNCPOrgao('00394445000144', 'MEC — Ministério da Educação', 'MEC')
/** CAPES — Coordenação de Aperfeiçoamento de Pessoal de Nível Superior */
export const coletarCAPES      = criarScraperPNCPOrgao('00902478000170', 'CAPES', 'CAPES')
/** CNPq — Conselho Nacional de Desenvolvimento Científico */
export const coletarCNPq       = criarScraperPNCPOrgao('33654831000136', 'CNPq', 'CNPq')
/** EMBRAPA — Pesquisa agropecuária, maior compradora de equipamentos lab */
export const coletarEMBRAPA    = criarScraperPNCPOrgao('00348003000110', 'EMBRAPA', 'EMBRAPA')
/** IBGE — Instituto Brasileiro de Geografia e Estatística */
export const coletarIBGE_org   = criarScraperPNCPOrgao('33787094000140', 'IBGE', 'IBGE')

// ── Saúde ─────────────────────────────────────────────────────────────────────
/** FIOCRUZ — maior comprador de insumos farmacêuticos e equipamentos médicos */
export const coletarFIOCRUZ    = criarScraperPNCPOrgao('33781055000135', 'FIOCRUZ', 'FIOCRUZ')
/** ANVISA — Agência Nacional de Vigilância Sanitária */
export const coletarANVISA     = criarScraperPNCPOrgao('03112386000176', 'ANVISA', 'ANVISA')

// ── Infraestrutura ────────────────────────────────────────────────────────────
/** INFRAERO — Aeroportos (equipamentos, obras e serviços aeroportuários) */
export const coletarINFRAERO   = criarScraperPNCPOrgao('00352294000110', 'INFRAERO', 'INFRAERO')
/** ANATEL — Agência Nacional de Telecomunicações */
export const coletarANATEL     = criarScraperPNCPOrgao('02030715000112', 'ANATEL', 'ANATEL')
/** CODEVASF — Companhia de Desenvolvimento do Vale do São Francisco */
export const coletarCODEVASF   = criarScraperPNCPOrgao('00399857000160', 'CODEVASF', 'CODEVASF')
/** CONAB — Companhia Nacional de Abastecimento */
export const coletarCONAB      = criarScraperPNCPOrgao('26461699000130', 'CONAB', 'CONAB')

// ── Jurídico / Controle ───────────────────────────────────────────────────────
/** AGU — Advocacia-Geral da União */
export const coletarAGU        = criarScraperPNCPOrgao('26986062000178', 'AGU — Advocacia-Geral da União', 'AGU')
/** TCU — Tribunal de Contas da União */
export const coletarTCU        = criarScraperPNCPOrgao('00414607000153', 'TCU — Tribunal de Contas da União', 'TCU')

// ── Terra / Meio Ambiente ─────────────────────────────────────────────────────
/** INCRA — Colonização e reforma agrária, grandes contratos de topografia */
export const coletarINCRA      = criarScraperPNCPOrgao('00375972000101', 'INCRA', 'INCRA')
/** IBAMA — Instituto Brasileiro do Meio Ambiente */
export const coletarIBAMA      = criarScraperPNCPOrgao('03820923000113', 'IBAMA', 'IBAMA')

// ── TI Federal ────────────────────────────────────────────────────────────────
/** SERPRO — Serviço Federal de Processamento de Dados (maior TI do governo) */
export const coletarSERPRO     = criarScraperPNCPOrgao('33683111000107', 'SERPRO', 'SERPRO')
/** DATAPREV — TI da Previdência Social */
export const coletarDATAPREV   = criarScraperPNCPOrgao('42422253000116', 'DATAPREV', 'DATAPREV')

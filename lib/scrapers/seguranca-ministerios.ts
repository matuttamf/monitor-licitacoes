/**
 * Segurança Pública Federal + Ministérios + Bancos Regionais — via PNCP CNPJ
 *
 * Órgãos com volume expressivo de licitações públicas:
 * - Forças de segurança: armamentos, viaturas, TI, serviços
 * - Ministérios: obras, TI, mobiliário, serviços de escritório
 * - Bancos de desenvolvimento regional: obras, TI, consultorias
 */
import { criarScraperPNCPOrgao } from './pncp-orgao'

// ── Segurança Pública Federal ──────────────────────────────────────────────────
/** DPF — Departamento de Polícia Federal */
export const coletarPolFederal = criarScraperPNCPOrgao('01798296000143', 'Polícia Federal — DPF', 'Polícia Federal')
/** PRF — Polícia Rodoviária Federal */
export const coletarPRF        = criarScraperPNCPOrgao('05172696000183', 'PRF — Polícia Rodoviária Federal', 'PRF')
/** PCDF — Polícia Civil do Distrito Federal */
export const coletarPCDF       = criarScraperPNCPOrgao('00359491000168', 'PCDF — Polícia Civil do Distrito Federal', 'PCDF')
/** CBMDF — Corpo de Bombeiros Militar do DF */
export const coletarCBMDF      = criarScraperPNCPOrgao('03735583000155', 'CBMDF — Corpo de Bombeiros DF', 'CBMDF')

// ── Ministérios Federais ───────────────────────────────────────────────────────
/** Ministério da Defesa */
export const coletarMinDefesa  = criarScraperPNCPOrgao('00394429000101', 'Ministério da Defesa', 'Min. Defesa')
/** Ministério da Fazenda */
export const coletarMinFazenda = criarScraperPNCPOrgao('00394566000164', 'Ministério da Fazenda', 'Min. Fazenda')
/** MAPA — Ministério da Agricultura, Pecuária e Abastecimento */
export const coletarMAPA       = criarScraperPNCPOrgao('00396895000196', 'MAPA — Ministério da Agricultura', 'MAPA')
/** Ministério do Trabalho e Emprego */
export const coletarMinTrabalho = criarScraperPNCPOrgao('05914891000108', 'Ministério do Trabalho e Emprego', 'Min. Trabalho')
/** Ministério da Justiça e Segurança Pública */
export const coletarMinJustica  = criarScraperPNCPOrgao('00394494000124', 'Ministério da Justiça e Segurança Pública', 'Min. Justiça')

// ── Bancos de Desenvolvimento Regional ────────────────────────────────────────
/** BNB — Banco do Nordeste do Brasil (um dos maiores compradores do NE) */
export const coletarBNB        = criarScraperPNCPOrgao('07237373000120', 'BNB — Banco do Nordeste do Brasil', 'BNB')
/** BASA — Banco da Amazônia (grande comprador da Região Norte) */
export const coletarBASA       = criarScraperPNCPOrgao('04902979000144', 'BASA — Banco da Amazônia', 'BASA')

// ── Entidades Federais Especiais ───────────────────────────────────────────────
/** Casa da Moeda do Brasil */
export const coletarCasaMoeda  = criarScraperPNCPOrgao('33354692000104', 'Casa da Moeda do Brasil', 'Casa da Moeda')
/** IMBEL — Indústria de Material Bélico do Brasil */
export const coletarIMBEL      = criarScraperPNCPOrgao('33083025000197', 'IMBEL — Material Bélico do Brasil', 'IMBEL')

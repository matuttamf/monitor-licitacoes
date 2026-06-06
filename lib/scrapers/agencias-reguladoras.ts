/**
 * Agências Reguladoras Federais — via PNCP CNPJ
 *
 * Todas são autarquias especiais sujeitas à Lei 14.133/2021.
 * Compras típicas: TI, consultorias técnicas, serviços analíticos,
 * mobiliário, veículos, segurança patrimonial e obras de sede.
 */
import { criarScraperPNCPOrgao } from './pncp-orgao'

/** ANEEL — Agência Nacional de Energia Elétrica */
export const coletarANEEL   = criarScraperPNCPOrgao('02270669000172', 'ANEEL — Agência Nacional de Energia Elétrica', 'ANEEL')
/** ANAC — Agência Nacional de Aviação Civil */
export const coletarANAC    = criarScraperPNCPOrgao('09125206000119', 'ANAC — Agência Nacional de Aviação Civil', 'ANAC')
/** ANTT — Agência Nacional de Transportes Terrestres */
export const coletarANTT    = criarScraperPNCPOrgao('04884062000155', 'ANTT — Agência Nacional de Transportes Terrestres', 'ANTT')
/** ANP — Agência Nacional do Petróleo, Gás Natural e Biocombustíveis */
export const coletarANP     = criarScraperPNCPOrgao('09372837000100', 'ANP — Agência Nacional do Petróleo', 'ANP')
/** ANS — Agência Nacional de Saúde Suplementar */
export const coletarANS     = criarScraperPNCPOrgao('03589068000174', 'ANS — Agência Nacional de Saúde Suplementar', 'ANS')
/** ANA — Agência Nacional de Águas e Saneamento Básico */
export const coletarANA     = criarScraperPNCPOrgao('04858120000168', 'ANA — Agência Nacional de Águas', 'ANA')
/** ANTAQ — Agência Nacional de Transportes Aquaviários */
export const coletarANTAQ   = criarScraperPNCPOrgao('04795056000102', 'ANTAQ — Agência Nacional de Transportes Aquaviários', 'ANTAQ')
/** ANCINE — Agência Nacional do Cinema */
export const coletarANCINE  = criarScraperPNCPOrgao('04884574000131', 'ANCINE — Agência Nacional do Cinema', 'ANCINE')
/** ABIN — Agência Brasileira de Inteligência */
export const coletarABIN    = criarScraperPNCPOrgao('04882280000137', 'ABIN — Agência Brasileira de Inteligência', 'ABIN')

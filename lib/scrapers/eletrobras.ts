/**
 * Eletrobras — Centrais Elétricas Brasileiras S.A.
 *
 * Sociedade de economia mista federal (privatizada em 2022 mas mantém
 * obrigações da Lei 13.303/2016). Maior geradora de energia da AL.
 * Principais compras: equipamentos elétricos, obras civis, TI, manutenção.
 *
 * CNPJ da holding: 00.070.698/0001-11
 */
import { criarScraperPNCPOrgao } from './pncp-orgao'

export const coletarEletrobras = criarScraperPNCPOrgao(
  '00070698000111',
  'Eletrobras — Centrais Elétricas Brasileiras',
  'Eletrobras',
)

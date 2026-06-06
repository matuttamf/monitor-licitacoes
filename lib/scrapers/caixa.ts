/**
 * Caixa Econômica Federal
 *
 * Empresa pública federal sujeita à Lei 14.133/2021 + Lei 13.303/2016.
 * Principais compras: TI, obras em agências e habitações (MCMV),
 * serviços financeiros, segurança patrimonial, mobiliário.
 *
 * CNPJ: 00.360.305/0001-04
 */
import { criarScraperPNCPOrgao } from './pncp-orgao'

export const coletarCaixa = criarScraperPNCPOrgao(
  '00360305000104',
  'Caixa Econômica Federal',
  'Caixa',
)

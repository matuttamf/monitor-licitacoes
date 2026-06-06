/**
 * Correios — Empresa Brasileira de Correios e Telégrafos
 *
 * Empresa pública federal sujeita à Lei 14.133/2021 + Lei 13.303/2016.
 * Principais compras: frotas, TI, logística, obras civis, uniformes,
 * serviços de triagem e tratamento de encomendas.
 *
 * CNPJ: 34.028.316/0001-03
 */
import { criarScraperPNCPOrgao } from './pncp-orgao'

export const coletarCorreios = criarScraperPNCPOrgao(
  '34028316000103',
  'ECT — Empresa Brasileira de Correios e Telégrafos',
  'Correios',
)

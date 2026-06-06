/**
 * SABESP — Companhia de Saneamento Básico do Estado de São Paulo
 *
 * Empresa mista estadual do governo de SP. Maior empresa de saneamento
 * da AL por população atendida. Sujeita à Lei 13.303/2016 + PNCP.
 * Principais compras: insumos químicos, obras, equipamentos hidráulicos, TI.
 *
 * CNPJ: 43.776.517/0001-80
 */
import { criarScraperPNCPOrgao } from './pncp-orgao'

export const coletarSabesp = criarScraperPNCPOrgao(
  '43776517000180',
  'SABESP — Companhia de Saneamento Básico do Estado de São Paulo',
  'SABESP',
)

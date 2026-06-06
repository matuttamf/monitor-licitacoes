/**
 * Judiciário Federal + Legislativo + Ministério Público — via PNCP CNPJ
 *
 * Todos publicam compras no PNCP (Lei 14.133/2021 + Lei 13.303/2016).
 * Principais compras: TI, mobiliário, segurança, obras civis, serviços gráficos,
 * veículos, assinaturas de bases de dados jurídicas.
 */
import { criarScraperPNCPOrgao } from './pncp-orgao'

// ── Supremo e Superior ─────────────────────────────────────────────────────────
/** STF — Supremo Tribunal Federal */
export const coletarSTF    = criarScraperPNCPOrgao('00531954000104', 'STF — Supremo Tribunal Federal', 'STF')
/** STJ — Superior Tribunal de Justiça */
export const coletarSTJ    = criarScraperPNCPOrgao('00509580000154', 'STJ — Superior Tribunal de Justiça', 'STJ')
/** TST — Tribunal Superior do Trabalho */
export const coletarTST    = criarScraperPNCPOrgao('00698187000183', 'TST — Tribunal Superior do Trabalho', 'TST')
/** TSE — Tribunal Superior Eleitoral */
export const coletarTSE    = criarScraperPNCPOrgao('02551597000174', 'TSE — Tribunal Superior Eleitoral', 'TSE')
/** STM — Superior Tribunal Militar */
export const coletarSTM    = criarScraperPNCPOrgao('00471258000193', 'STM — Superior Tribunal Militar', 'STM')

// ── Conselho Nacional ────────────────────────────────────────────────────────
/** CNJ — Conselho Nacional de Justiça (fiscaliza todo o judiciário + compra) */
export const coletarCNJ    = criarScraperPNCPOrgao('07421906000145', 'CNJ — Conselho Nacional de Justiça', 'CNJ')
/** CNMP — Conselho Nacional do Ministério Público */
export const coletarCNMP   = criarScraperPNCPOrgao('11439520000180', 'CNMP — Conselho Nacional do Ministério Público', 'CNMP')

// ── Poder Legislativo ─────────────────────────────────────────────────────────
/** Câmara dos Deputados — compras bilionárias de TI, obras e serviços */
export const coletarCamara  = criarScraperPNCPOrgao('00530486000101', 'Câmara dos Deputados', 'Câmara dos Deputados')
/** Senado Federal */
export const coletarSenado  = criarScraperPNCPOrgao('00530060000201', 'Senado Federal', 'Senado Federal')

// ── Ministério Público Federal ────────────────────────────────────────────────
/** PGR / MPF — Procuradoria-Geral da República */
export const coletarMPF     = criarScraperPNCPOrgao('26989715000193', 'Ministério Público Federal — PGR', 'MPF')

// ── Defensoria Pública ────────────────────────────────────────────────────────
/** DPU — Defensoria Pública da União */
export const coletarDPU     = criarScraperPNCPOrgao('08036673000146', 'DPU — Defensoria Pública da União', 'DPU')

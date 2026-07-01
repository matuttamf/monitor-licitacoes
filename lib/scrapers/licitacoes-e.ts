/**
 * Scraper: Licitações-e (Banco do Brasil)
 * Desabilitado: endpoint fecha conexão ativamente (anti-bot ou descontinuado)
 */
import type { LicitacaoRaw } from './types'

export async function coletarLicitacoesE(_dataInicio: string): Promise<LicitacaoRaw[]> {
  return []
}

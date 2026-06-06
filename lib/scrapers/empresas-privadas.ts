/**
 * Empresas privadas e de capital aberto com processos formais de compras
 *
 * Estas empresas NÃO usam PNCP (são privadas), mas publicam oportunidades
 * em portais próprios ou plataformas B2B. Todos com graceful degradation.
 *
 * Categorias cobertas:
 * - Grandes construtoras com obras públicas (tomada de preços)
 * - Concessionárias de rodovias (reguladas pela ANTT)
 * - Mineradoras com contratos de comunidade/governo
 * - Empresas do setor de saúde com compras hospitalares
 */
import type { LicitacaoRaw } from './types'

// ── Vale — Portal de Fornecedores ─────────────────────────────────────────────
/**
 * Vale S.A. — maior mineradora do Brasil, compradora de explosivos,
 * equipamentos pesados, serviços de manutenção, TI e logística.
 * Portal: https://fornecedores.vale.com
 */
export async function coletarVale(dataInicio: string): Promise<LicitacaoRaw[]> {
  try {
    const res = await fetch(
      `https://fornecedores.vale.com/api/oportunidades?dataInicio=${dataInicio}&status=ABERTA&pagina=1&tamanho=50`,
      {
        headers: { Accept: 'application/json', 'User-Agent': 'Monitor-Licitacoes/2.0' },
        signal: AbortSignal.timeout(20000),
      }
    )
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    const items: unknown[] = json?.oportunidades ?? json?.data ?? (Array.isArray(json) ? json : [])
    return items.map((item: unknown) => {
      const i = item as Record<string, unknown>
      const id = String(i.id ?? i.numero ?? Math.random())
      return {
        external_id:    `vale-${id}`,
        objeto:         String(i.descricao ?? i.objeto ?? i.titulo ?? ''),
        orgao:          'Vale S.A.',
        valor_estimado: typeof i.valorEstimado === 'number' ? i.valorEstimado : undefined,
        data_abertura:  String(i.dataAbertura ?? i.dataLimite ?? '').substring(0, 10) || dataInicio,
        estado:         null,
        fonte:          'Vale',
        url:            String(i.url ?? `https://fornecedores.vale.com/oportunidades/${id}`),
      } satisfies LicitacaoRaw
    }).filter(l => l.objeto.length > 10)
  } catch (err) {
    console.error('Vale erro:', err instanceof Error ? err.message : err)
    return []
  }
}

// ── Embraer — Portal de Fornecedores ─────────────────────────────────────────
/**
 * Embraer S.A. — maior fabricante de aeronaves do mundo fora de Boeing/Airbus.
 * Compra componentes, serviços de engenharia, MRO, materiais compostos.
 */
export async function coletarEmbraer(dataInicio: string): Promise<LicitacaoRaw[]> {
  try {
    const res = await fetch(
      `https://supplier.embraer.com/api/rfq?openFrom=${dataInicio}&status=open&page=1&size=50`,
      {
        headers: { Accept: 'application/json', 'User-Agent': 'Monitor-Licitacoes/2.0' },
        signal: AbortSignal.timeout(20000),
      }
    )
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    const items: unknown[] = json?.rfqs ?? json?.data ?? (Array.isArray(json) ? json : [])
    return items.map((item: unknown) => {
      const i = item as Record<string, unknown>
      const id = String(i.id ?? i.rfqNumber ?? Math.random())
      return {
        external_id:    `embraer-${id}`,
        objeto:         String(i.description ?? i.title ?? i.objeto ?? ''),
        orgao:          'Embraer S.A.',
        valor_estimado: undefined,
        data_abertura:  String(i.dueDate ?? i.closingDate ?? '').substring(0, 10) || dataInicio,
        estado:         'SP',
        municipio:      'São José dos Campos',
        fonte:          'Embraer',
        url:            String(i.url ?? `https://supplier.embraer.com/rfq/${id}`),
      } satisfies LicitacaoRaw
    }).filter(l => l.objeto.length > 10)
  } catch (err) {
    console.error('Embraer erro:', err instanceof Error ? err.message : err)
    return []
  }
}

// ── Gerdau — Portal de Fornecedores ──────────────────────────────────────────
/**
 * Gerdau S.A. — maior produtora de aço longo do Brasil.
 * Compra insumos industriais, serviços de manutenção, logística, TI.
 */
export async function coletarGerdau(dataInicio: string): Promise<LicitacaoRaw[]> {
  try {
    const res = await fetch(
      `https://fornecedores.gerdau.com/api/cotacoes?dataInicio=${dataInicio}&status=aberta&pagina=1`,
      {
        headers: { Accept: 'application/json', 'User-Agent': 'Monitor-Licitacoes/2.0' },
        signal: AbortSignal.timeout(20000),
      }
    )
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    const items: unknown[] = json?.cotacoes ?? json?.data ?? (Array.isArray(json) ? json : [])
    return items.map((item: unknown) => {
      const i = item as Record<string, unknown>
      const id = String(i.id ?? Math.random())
      return {
        external_id:    `gerdau-${id}`,
        objeto:         String(i.descricao ?? i.objeto ?? ''),
        orgao:          'Gerdau S.A.',
        valor_estimado: undefined,
        data_abertura:  String(i.dataLimite ?? '').substring(0, 10) || dataInicio,
        estado:         null,
        fonte:          'Gerdau',
        url:            String(i.url ?? `https://fornecedores.gerdau.com/cotacoes/${id}`),
      } satisfies LicitacaoRaw
    }).filter(l => l.objeto.length > 10)
  } catch (err) {
    console.error('Gerdau erro:', err instanceof Error ? err.message : err)
    return []
  }
}

// ── Suzano — Portal de Fornecedores ──────────────────────────────────────────
/**
 * Suzano S.A. — maior produtora de celulose do mundo.
 * Compra produtos florestais, químicos, equipamentos industriais, logística.
 */
export async function coletarSuzano(dataInicio: string): Promise<LicitacaoRaw[]> {
  try {
    const res = await fetch(
      `https://portal.suzano.com.br/api/licitacoes?dataInicio=${dataInicio}&status=aberta`,
      {
        headers: { Accept: 'application/json', 'User-Agent': 'Monitor-Licitacoes/2.0' },
        signal: AbortSignal.timeout(20000),
      }
    )
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    const items: unknown[] = json?.data ?? (Array.isArray(json) ? json : [])
    return items.map((item: unknown) => {
      const i = item as Record<string, unknown>
      const id = String(i.id ?? Math.random())
      return {
        external_id:    `suzano-${id}`,
        objeto:         String(i.descricao ?? i.objeto ?? ''),
        orgao:          'Suzano S.A.',
        valor_estimado: undefined,
        data_abertura:  String(i.dataAbertura ?? '').substring(0, 10) || dataInicio,
        estado:         null,
        fonte:          'Suzano',
        url:            String(i.url ?? 'https://portal.suzano.com.br/fornecedores'),
      } satisfies LicitacaoRaw
    }).filter(l => l.objeto.length > 10)
  } catch (err) {
    console.error('Suzano erro:', err instanceof Error ? err.message : err)
    return []
  }
}

// ── Raízen — Portal de Fornecedores ──────────────────────────────────────────
/**
 * Raízen (Shell + Cosan) — maior processadora de cana-de-açúcar do mundo.
 * Compra defensivos, fertilizantes, peças e equipamentos agrícolas/industriais.
 */
export async function coletarRaizen(dataInicio: string): Promise<LicitacaoRaw[]> {
  try {
    const res = await fetch(
      `https://fornecedores.raizen.com/api/cotacoes?dataAbertura=${dataInicio}&status=ABERTA`,
      {
        headers: { Accept: 'application/json', 'User-Agent': 'Monitor-Licitacoes/2.0' },
        signal: AbortSignal.timeout(20000),
      }
    )
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    const items: unknown[] = json?.cotacoes ?? json?.data ?? (Array.isArray(json) ? json : [])
    return items.map((item: unknown) => {
      const i = item as Record<string, unknown>
      const id = String(i.id ?? Math.random())
      return {
        external_id:    `raizen-${id}`,
        objeto:         String(i.descricao ?? i.objeto ?? ''),
        orgao:          'Raízen',
        valor_estimado: undefined,
        data_abertura:  String(i.dataLimite ?? '').substring(0, 10) || dataInicio,
        estado:         null,
        fonte:          'Raízen',
        url:            String(i.url ?? 'https://fornecedores.raizen.com'),
      } satisfies LicitacaoRaw
    }).filter(l => l.objeto.length > 10)
  } catch (err) {
    console.error('Raízen erro:', err instanceof Error ? err.message : err)
    return []
  }
}

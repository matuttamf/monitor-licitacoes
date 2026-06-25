import { createHash } from 'crypto'
import { createServiceClient } from '@/lib/supabase/server'
import { LicitacaoRaw } from './types'

const LOTE = 500

/**
 * Chave de deduplicação estável por edital.
 *
 * Muitos scrapers usam `Math.random()` como fallback de id quando a fonte não
 * traz um identificador estável (`String(x ?? Math.random())`). Isso produz um
 * id diferente a cada coleta — e como (fonte, numero_edital) é a chave única,
 * o MESMO edital vira uma linha nova toda vez, repetindo no dashboard.
 *
 * Aqui detectamos esses ids "aleatórios" (float do Math.random, ou ausência de
 * id) e derivamos uma chave determinística a partir do conteúdo
 * (fonte + órgão + objeto + data), garantindo que o mesmo edital sempre colapse
 * na mesma linha. Ids realmente estáveis (ex.: numeroControlePNCP) são mantidos.
 */
function chaveDedup(l: LicitacaoRaw): string {
  const id = String(l.numero_edital ?? l.external_id ?? '')
  const pareceAleatorio = !id || /0\.\d{4,}/.test(id)  // "...-0.8342913..." => Math.random()
  if (!pareceAleatorio) return id
  const raw = `${l.fonte}|${(l.orgao ?? '').slice(0, 80)}|${(l.objeto ?? '').slice(0, 120)}|${l.data_abertura ?? ''}`
  return 'c-' + createHash('sha1').update(raw).digest('hex').slice(0, 24)
}

/**
 * Sanitiza o valor estimado. O PNCP (e outras fontes) às vezes traz valores
 * digitados com erro pelo próprio órgão — ex.: R$ 10.000.000.000.000 (10 trilhões),
 * o que infla o card e o "volume total" do painel. Nenhuma licitação pública real
 * passa de ~R$ 100 bilhões; acima disso tratamos como "valor não informado" (null).
 * Negativos e zero também viram null.
 */
const TETO_VALOR = 100_000_000_000 // R$ 100 bilhões
function sanitizarValor(v: number | null | undefined): number | null {
  if (typeof v !== 'number' || !Number.isFinite(v)) return null
  if (v <= 0 || v > TETO_VALOR) return null
  return v
}

export async function salvarLicitacoes(licitacoes: LicitacaoRaw[]): Promise<number> {
  if (licitacoes.length === 0) return 0

  const supabase = await createServiceClient()

  const normalizadas = licitacoes.map(l => ({
    fonte:          l.fonte,
    numero_edital:  chaveDedup(l),
    orgao:          l.orgao,
    objeto:         l.objeto,
    valor_estimado: sanitizarValor(l.valor_estimado),
    data_abertura:  l.data_abertura ?? null,
    url:            l.url,
    estado:         l.estado ?? null,
    cidade:         l.cidade ?? l.municipio ?? null,
  }))

  // Dedup dentro do próprio batch: duas linhas com a mesma (fonte, numero_edital)
  // fariam o upsert do Postgres falhar ("cannot affect row a second time").
  // Mantém a última ocorrência de cada chave.
  const vistas = new Map<string, (typeof normalizadas)[number]>()
  for (const n of normalizadas) vistas.set(`${n.fonte}|${n.numero_edital}`, n)
  const unicas = [...vistas.values()]

  // Conta total antes do upsert para calcular novas inserções
  const { count: antes } = await supabase
    .from('licitacoes')
    .select('id', { count: 'exact', head: true })

  // Upsert em lotes de 500 para evitar limite de payload do Supabase
  let erros = 0
  let primeiroErro: string | null = null
  for (let i = 0; i < unicas.length; i += LOTE) {
    const lote = unicas.slice(i, i + LOTE)
    const { error } = await supabase
      .from('licitacoes')
      .upsert(lote, { onConflict: 'fonte,numero_edital', ignoreDuplicates: false })
    if (error) {
      console.error(`Erro ao salvar lote ${i}-${i + lote.length}:`, error.message, JSON.stringify(lote[0]))
      primeiroErro = error.message
      erros++
    }
  }

  if (unicas.length > 0 && erros === Math.ceil(unicas.length / LOTE)) {
    throw new Error(`Todos os lotes falharam: ${primeiroErro}`)
  }

  const { count: depois } = await supabase
    .from('licitacoes')
    .select('id', { count: 'exact', head: true })

  const novas = Math.max(0, (depois ?? 0) - (antes ?? 0))
  console.log(`salvarLicitacoes: ${licitacoes.length} recebidas, ${unicas.length} únicas, ${novas} novas (${erros} lotes com erro)`)
  return novas
}

/**
 * Salva o resultado da última execução de um cron em `configuracoes`.
 * O painel admin lê essas chaves para exibir status de cada cron.
 *
 * Chave: `ultimo_resultado_<cronId>`
 * Valor: JSON { ok, ts, erro?, ...demais campos do resultado }
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function salvarResultadoCron(supabase: any, cronId: string, resultado: Record<string, unknown>) {
  try {
    await supabase.from('configuracoes').upsert(
      { chave: `ultimo_resultado_${cronId}`, valor: JSON.stringify({ ...resultado, ts: new Date().toISOString() }) },
      { onConflict: 'chave' }
    )
  } catch { /* não deixa falha de log derrubar o cron */ }
}

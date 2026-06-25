'use client'

import { useEffect, useState } from 'react'

type Metricas = {
  total: number; pendentes: number; aguardando: number
  liberadas: number; canceladas: number; fraudes: number; diasConcedidos: number
}
type RankItem = {
  id: string; nome: string | null; email: string | null; codigo: string | null
  liberadas: number; diasTotal: number; economia: number; ehAfiliado: boolean
}
type Dados = {
  ativa: boolean
  metricas: Metricas
  ranking: RankItem[]
  candidatos: RankItem[]
  limiarAfiliado: number
}

const moeda = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 })

export function IndicacoesAdmin() {
  const [d, setD] = useState<Dados | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)

  async function carregar() {
    setCarregando(true)
    const r = await fetch('/api/admin/indicacoes')
    if (r.ok) setD(await r.json())
    setCarregando(false)
  }
  useEffect(() => { carregar() }, [])

  async function toggle(ativa: boolean) {
    const acao = ativa ? 'ATIVAR' : 'pausar'
    if (!confirm(
      ativa
        ? 'Ativar o programa de indicações?\n\nAo ativar, todos os usuários aptos receberão e-mail + WhatsApp avisando que estão aptos a participar (na próxima execução do cron).'
        : 'Pausar o programa de indicações? Nenhuma recompensa será liberada enquanto pausado.'
    )) return
    setSalvando(true)
    const r = await fetch('/api/admin/indicacoes', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ativa }),
    })
    setSalvando(false)
    if (!r.ok) { alert('Erro ao ' + acao); return }
    carregar()
  }

  if (carregando || !d) {
    return <div style={{ padding: 40, textAlign: 'center', color: 'var(--cinza)', fontSize: 14 }}>Carregando…</div>
  }

  const m = d.metricas

  return (
    <div style={{ maxWidth: 980 }}>
      {/* Interruptor global */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
        padding: '20px 24px', borderRadius: 16, marginBottom: 20,
        background: d.ativa ? 'rgba(16,185,129,0.07)' : 'rgba(107,15,26,0.05)',
        border: `1px solid ${d.ativa ? 'rgba(16,185,129,0.3)' : 'rgba(107,15,26,0.18)'}`,
      }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--preto)' }}>
            🚀 Programa de Indicações {d.ativa
              ? <span style={{ color: '#10b981' }}>· ATIVO</span>
              : <span style={{ color: '#6B0F1A' }}>· PAUSADO</span>}
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--cinza)', marginTop: 3, maxWidth: 560 }}>
            {d.ativa
              ? 'Usuários aptos veem o link no painel e geram recompensas. Liberação ocorre após 10 dias de carência.'
              : 'Nasce pausado. Ao ativar, os aptos recebem aviso (e-mail + WhatsApp) e o widget aparece no painel deles.'}
          </div>
        </div>
        <button
          onClick={() => toggle(!d.ativa)}
          disabled={salvando}
          style={{
            padding: '12px 26px', borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: salvando ? 'wait' : 'pointer',
            border: 'none', whiteSpace: 'nowrap',
            background: d.ativa ? 'rgba(239,68,68,0.1)' : '#10b981',
            color: d.ativa ? '#ef4444' : 'white',
          }}
        >
          {salvando ? '…' : d.ativa ? 'Pausar campanha' : '✓ Liberar campanha'}
        </button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 sm:grid-cols-4" style={{ gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Indicações totais', val: m.total, cor: '#3b82f6' },
          { label: 'Aguardando carência', val: m.aguardando, cor: '#f59e0b' },
          { label: 'Recompensas liberadas', val: m.liberadas, cor: '#10b981' },
          { label: 'Dias concedidos', val: m.diasConcedidos, cor: '#8b5cf6' },
          { label: 'Pendentes (sem assinar)', val: m.pendentes, cor: '#64748b' },
          { label: 'Canceladas na carência', val: m.canceladas, cor: '#ef4444' },
          { label: 'Bloqueadas (fraude)', val: m.fraudes, cor: '#dc2626' },
        ].map(({ label, val, cor }) => (
          <div key={label} style={{ background: 'white', border: '1px solid var(--cinza-light)', borderRadius: 14, padding: '14px 16px' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: cor, letterSpacing: '-0.02em' }}>{val}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--preto)', marginTop: 3 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Candidatos a afiliado */}
      {d.candidatos.length > 0 && (
        <div style={{ background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.25)', borderRadius: 16, padding: '18px 22px', marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#f97316', marginBottom: 4 }}>
            🤝 {d.candidatos.length} candidato(s) a afiliado ({d.limiarAfiliado}+ indicações convertidas)
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--cinza)', marginBottom: 12 }}>
            Considere convidá-los para o programa de afiliados (comissão financeira). Ao virar afiliado, deixam de acumular os +30 dias.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {d.candidatos.map(c => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '10px 14px', borderRadius: 10, background: 'white', border: '1px solid var(--cinza-light)' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--preto)' }}>{c.nome || '—'}</div>
                  <div style={{ fontSize: 12, color: 'var(--cinza)' }}>{c.email}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#f97316' }}>{c.liberadas}</div>
                  <div style={{ fontSize: 10, color: 'var(--cinza)' }}>convertidas</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ranking */}
      <div style={{ background: 'white', border: '1px solid var(--cinza-light)', borderRadius: 16, padding: '18px 22px' }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--preto)', marginBottom: 12 }}>🏆 Top indicadores</div>
        {d.ranking.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--cinza)', padding: '20px 0', textAlign: 'center' }}>Nenhum indicador ainda.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {d.ranking.slice(0, 20).map((r, i) => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 10px', borderRadius: 8, background: i % 2 ? 'transparent' : 'var(--surface-2)' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--cinza)', width: 24 }}>{i + 1}º</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--preto)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.nome || r.email || '—'} {r.ehAfiliado && <span style={{ fontSize: 10, color: '#f97316', fontWeight: 700 }}>· afiliado</span>}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--cinza)', fontFamily: 'monospace' }}>{r.codigo}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#10b981' }}>{r.liberadas}</span>
                  <span style={{ fontSize: 11, color: 'var(--cinza)' }}> · {r.diasTotal}d · {moeda(r.economia)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

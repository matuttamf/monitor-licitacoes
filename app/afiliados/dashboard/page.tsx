'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Pagamento = {
  mes_ref: string
  valor: number
  status: 'pendente' | 'pago'
  pago_em: string | null
  tipo_gatilho: string | null
}

type Metricas = {
  nome: string
  codigo: string
  link: string
  cliques: number
  conversoes: number
  comissao_pendente: number
  total_pago: number
  comissao_tipo: string
  comissao_valor: number
  pagamentos: Pagamento[]
}

function fmtMoeda(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtMes(mesRef: string) {
  const [ano, mes] = mesRef.split('-')
  const nomes = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
  return `${nomes[parseInt(mes) - 1]}/${ano}`
}

export default function AfiliadorDashboard() {
  const router = useRouter()
  const [dados, setDados] = useState<Metricas | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    async function carregar() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login?redirect=/afiliados/dashboard'); return }

      const res = await fetch('/api/afiliados/metricas')
      if (res.status === 403) { router.push('/dashboard'); return }
      if (!res.ok) { setCarregando(false); return }
      setDados(await res.json())
      setCarregando(false)
    }
    carregar()
  }, [router])

  function copiarLink() {
    if (!dados?.link) return
    navigator.clipboard.writeText(dados.link)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  async function sair() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (carregando) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF6F0' }}>
        <p style={{ color: '#9AA0A6', fontSize: 14 }}>Carregando…</p>
      </div>
    )
  }

  if (!dados) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF6F0' }}>
        <p style={{ color: '#dc2626', fontSize: 14 }}>Erro ao carregar dados.</p>
      </div>
    )
  }

  const taxaConversao = dados.cliques > 0
    ? ((dados.conversoes / dados.cliques) * 100).toFixed(1)
    : '—'

  const descricaoComissao = dados.comissao_tipo === 'percentual'
    ? `${dados.comissao_valor}% do primeiro pagamento`
    : dados.comissao_tipo === 'fixo'
      ? `${fmtMoeda(dados.comissao_valor)} por assinatura`
      : 'Sem comissão configurada'

  return (
    <div style={{ minHeight: '100vh', background: '#FAF6F0', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <header style={{ background: '#6B0F1A', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(201,166,90,0.3)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#C9A65A', fontWeight: 700, fontSize: 11 }}>ML</span>
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 600, fontSize: 14 }}>Monitor de Licitações</div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>Painel de Parceiro</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{dados.nome}</span>
          <button onClick={sair} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)', borderRadius: 8, padding: '6px 14px', fontSize: 12, cursor: 'pointer' }}>
            Sair
          </button>
        </div>
      </header>
      <div style={{ height: 2, background: 'linear-gradient(90deg,#6B0F1A,#C9A65A,transparent)' }} />

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '32px 20px' }}>

        {/* Link de afiliado */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E8E4DC', padding: '24px', marginBottom: 24 }}>
          <div style={{ color: '#C9A65A', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Seu link de parceiro</div>
          {dados.link ? (
            <>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 0, background: '#FAF6F0', border: '1.5px solid #E8E4DC', borderRadius: 10, padding: '11px 16px', fontSize: 14, color: '#1A1A1C', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {dados.link}
                </div>
                <button onClick={copiarLink} style={{
                  background: copiado ? '#059669' : '#6B0F1A', color: 'white', border: 'none',
                  borderRadius: 10, padding: '11px 22px', fontWeight: 700, fontSize: 14,
                  cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background 0.2s',
                }}>
                  {copiado ? '✓ Copiado!' : 'Copiar link'}
                </button>
              </div>
              <p style={{ fontSize: 12, color: '#9AA0A6', margin: '10px 0 0' }}>
                Compartilhe este link. Cada visitante que assinar pelo seu link gera comissão para você.
              </p>
            </>
          ) : (
            <p style={{ fontSize: 14, color: '#9AA0A6', margin: 0 }}>
              Seu link de parceiro será gerado em breve. Entre em contato pelo WhatsApp caso precise de ajuda.
            </p>
          )}
        </div>

        {/* Cards de métricas — linha 1: tráfego */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 14 }}>
          {[
            { label: 'Cliques', valor: dados.cliques.toLocaleString('pt-BR'), sub: 'no seu link' },
            { label: 'Conversões', valor: dados.conversoes.toLocaleString('pt-BR'), sub: 'assinantes via seu link' },
            { label: 'Taxa de conversão', valor: taxaConversao === '—' ? '—' : `${taxaConversao}%`, sub: 'cliques que viraram assinantes' },
          ].map(c => (
            <div key={c.label} style={{ background: 'white', borderRadius: 14, border: '1px solid #E8E4DC', padding: '18px 20px' }}>
              <div style={{ fontSize: 12, color: '#9AA0A6', fontWeight: 600, marginBottom: 6 }}>{c.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#1A1A1C', marginBottom: 3 }}>{c.valor}</div>
              <div style={{ fontSize: 11, color: '#9AA0A6' }}>{c.sub}</div>
            </div>
          ))}
        </div>

        {/* Cards de métricas — linha 2: financeiro */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'Comissão a receber', valor: fmtMoeda(dados.comissao_pendente), sub: descricaoComissao, destaque: dados.comissao_pendente > 0 },
            { label: 'Total recebido', valor: fmtMoeda(dados.total_pago), sub: 'comissões já pagas' },
          ].map(c => (
            <div key={c.label} style={{ background: 'white', borderRadius: 14, border: `1px solid ${c.destaque ? 'rgba(107,15,26,0.2)' : '#E8E4DC'}`, padding: '18px 20px' }}>
              <div style={{ fontSize: 12, color: '#9AA0A6', fontWeight: 600, marginBottom: 6 }}>{c.label}</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: c.destaque ? '#6B0F1A' : '#1A1A1C', marginBottom: 3 }}>{c.valor}</div>
              <div style={{ fontSize: 11, color: '#9AA0A6' }}>{c.sub}</div>
            </div>
          ))}
        </div>

        {/* Histórico de pagamentos */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E8E4DC', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #E8E4DC' }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#1A1A1C' }}>Histórico de pagamentos</div>
          </div>

          {dados.pagamentos.length === 0 ? (
            <div style={{ padding: '32px 24px', textAlign: 'center', color: '#9AA0A6', fontSize: 14 }}>
              Nenhum pagamento registrado ainda.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#FAF6F0' }}>
                  {['Mês', 'Plano', 'Valor', 'Status', 'Pago em'].map(h => (
                    <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#9AA0A6' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dados.pagamentos.map(p => (
                  <tr key={p.mes_ref} style={{ borderTop: '1px solid #E8E4DC' }}>
                    <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 600, color: '#1A1A1C' }}>{fmtMes(p.mes_ref)}</td>
                    <td style={{ padding: '14px 20px', fontSize: 13, color: '#6B7280' }}>
                      {p.tipo_gatilho ? p.tipo_gatilho.charAt(0).toUpperCase() + p.tipo_gatilho.slice(1) : '—'}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 14, color: '#1A1A1C' }}>{fmtMoeda(p.valor)}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 99,
                        background: p.status === 'pago' ? 'rgba(5,150,105,0.1)' : 'rgba(245,158,11,0.1)',
                        color: p.status === 'pago' ? '#059669' : '#b45309',
                      }}>
                        {p.status === 'pago' ? 'Pago' : 'Pendente'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 13, color: '#9AA0A6' }}>
                      {p.pago_em ? new Date(p.pago_em).toLocaleDateString('pt-BR') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </main>
    </div>
  )
}

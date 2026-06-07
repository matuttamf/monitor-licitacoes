'use client'

import { useState } from 'react'
import type { Lead } from '@/app/api/admin/leads/route'

const UFS = [
  'todos','AC','AL','AP','AM','BA','CE','DF','ES','GO',
  'MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ',
  'RN','RS','RO','RR','SC','SP','SE','TO',
]

function csvEscape(v: string) {
  if (v.includes(',') || v.includes('"') || v.includes('\n')) return `"${v.replace(/"/g, '""')}"`
  return v
}

function exportarCSV(leads: Lead[]) {
  const cols: (keyof Lead)[] = ['email','razao_social','nome_fantasia','cnpj','telefone','municipio','uf','porte','cnae','situacao','objeto','valor','data_contrato']
  const header = cols.join(',')
  const rows = leads.map(l => cols.map(c => csvEscape(String(l[c] ?? ''))).join(','))
  const blob = new Blob([header + '\n' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url
  a.download = `leads-licitacoes-${new Date().toISOString().slice(0,10)}.csv`
  a.click(); URL.revokeObjectURL(url)
}

export default function LeadsPage() {
  const [anos,          setAnos]          = useState(2)
  const [uf,            setUf]            = useState('todos')
  const [valorMinimo,   setValorMinimo]   = useState(0)
  const [maxPaginas,    setMaxPaginas]    = useState(5)
  const [somenteEmail,  setSomenteEmail]  = useState(true)
  const [somenteAtivas, setSomenteAtivas] = useState(true)

  const [carregando,    setCarregando]    = useState(false)
  const [resultado,     setResultado]     = useState<{
    total_contratos: number; total_cnpjs: number; total_leads: number; leads: Lead[]
  } | null>(null)
  const [erro,          setErro]          = useState('')
  const [filtroEmail,   setFiltroEmail]   = useState('')

  async function buscar() {
    setCarregando(true); setErro(''); setResultado(null)
    try {
      const res = await fetch('/api/admin/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anos, uf, valorMinimo, maxPaginas, somenteEmail, somenteAtivas }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erro na busca')
      setResultado(data)
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro desconhecido')
    } finally {
      setCarregando(false)
    }
  }

  const leadsFiltrados = resultado?.leads.filter(l =>
    !filtroEmail || l.email.includes(filtroEmail.toLowerCase())
  ) ?? []

  return (
    <div className="max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--preto)' }}>
          Gerador de Leads
        </h1>
        <p className="text-sm" style={{ color: 'var(--cinza)' }}>
          Extrai empresas fornecedoras de contratos públicos (PNCP) e enriquece com e-mail via Receita Federal.
          Ideal para captação de clientes para o Monitor de Licitações.
        </p>
      </div>

      {/* Filtros */}
      <div className="rounded-2xl p-6 mb-6" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
        <h2 className="text-xs font-bold uppercase tracking-wider mb-5" style={{ color: 'var(--cinza)' }}>
          Parâmetros de busca
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-5">
          {/* Anos */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--cinza)' }}>
              Últimos (anos)
            </label>
            <select
              value={anos}
              onChange={e => setAnos(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl text-sm"
              style={{ border: '1.5px solid var(--cinza-light)', background: 'white', color: 'var(--preto)' }}
            >
              {[1,2,3,5].map(a => <option key={a} value={a}>{a} {a===1?'ano':'anos'}</option>)}
            </select>
          </div>

          {/* UF */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--cinza)' }}>
              Estado (UF)
            </label>
            <select
              value={uf}
              onChange={e => setUf(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm"
              style={{ border: '1.5px solid var(--cinza-light)', background: 'white', color: 'var(--preto)' }}
            >
              {UFS.map(u => <option key={u} value={u}>{u === 'todos' ? 'Todos' : u}</option>)}
            </select>
          </div>

          {/* Valor mínimo */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--cinza)' }}>
              Valor mín. (R$)
            </label>
            <input
              type="number"
              value={valorMinimo}
              onChange={e => setValorMinimo(Number(e.target.value))}
              min={0}
              step={10000}
              className="w-full px-3 py-2 rounded-xl text-sm"
              style={{ border: '1.5px solid var(--cinza-light)', background: 'white', color: 'var(--preto)' }}
            />
          </div>

          {/* Páginas PNCP */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--cinza)' }}>
              Páginas PNCP
            </label>
            <select
              value={maxPaginas}
              onChange={e => setMaxPaginas(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl text-sm"
              style={{ border: '1.5px solid var(--cinza-light)', background: 'white', color: 'var(--preto)' }}
            >
              {[1,2,3,5,10].map(p => <option key={p} value={p}>{p} ({p*50} contratos)</option>)}
            </select>
          </div>

          {/* Toggles */}
          <div className="col-span-2 flex flex-col gap-3 justify-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={somenteEmail}
                onChange={e => setSomenteEmail(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm" style={{ color: 'var(--preto)' }}>Somente com e-mail</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={somenteAtivas}
                onChange={e => setSomenteAtivas(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm" style={{ color: 'var(--preto)' }}>Somente empresas ativas</span>
            </label>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={buscar}
            disabled={carregando}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ background: carregando ? 'var(--cinza)' : 'var(--vinho)', border: 'none', cursor: carregando ? 'not-allowed' : 'pointer' }}
          >
            {carregando ? '⏳ Buscando (pode levar 1-2 min)…' : '🔍 Buscar leads'}
          </button>
          {resultado && (
            <span className="text-sm" style={{ color: 'var(--cinza)' }}>
              {resultado.total_contratos} contratos → {resultado.total_cnpjs} CNPJs → <strong style={{ color: 'var(--vinho)' }}>{resultado.total_leads} leads</strong>
            </span>
          )}
        </div>

        {erro && (
          <div className="mt-3 px-4 py-3 rounded-xl text-sm"
            style={{ background: 'rgba(185,28,28,0.06)', border: '1px solid rgba(185,28,28,0.2)', color: '#b91c1c' }}>
            ⚠ {erro}
          </div>
        )}
      </div>

      {/* Resultados */}
      {resultado && resultado.leads.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>

          {/* Toolbar */}
          <div className="px-5 py-3 flex items-center justify-between gap-3 flex-wrap"
            style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--cinza-light)' }}>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--cinza)' }}>
                {leadsFiltrados.length} leads
              </span>
              <input
                placeholder="Filtrar por e-mail…"
                value={filtroEmail}
                onChange={e => setFiltroEmail(e.target.value)}
                className="px-3 py-1.5 rounded-lg text-xs"
                style={{ border: '1px solid var(--cinza-light)', background: 'white', width: 200 }}
              />
            </div>
            <button
              onClick={() => exportarCSV(leadsFiltrados)}
              className="px-4 py-1.5 rounded-lg text-xs font-bold"
              style={{ background: 'var(--vinho)', color: 'white', border: 'none', cursor: 'pointer' }}
            >
              ⬇ Exportar CSV ({leadsFiltrados.length})
            </button>
          </div>

          {/* Tabela */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--cinza-light)', background: 'var(--surface-2)' }}>
                  {['Empresa','E-mail','Telefone','Cidade/UF','Porte','CNAE','Contrato','Valor'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left font-semibold uppercase tracking-wider"
                      style={{ color: 'var(--cinza)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leadsFiltrados.map((l, i) => (
                  <tr key={l.cnpj + i}
                    style={{ borderBottom: '1px solid var(--cinza-light)', background: i % 2 === 0 ? 'white' : 'var(--surface-2)' }}>
                    <td className="px-4 py-2.5 max-w-[200px]">
                      <div className="font-semibold truncate" style={{ color: 'var(--preto)' }} title={l.razao_social}>
                        {l.nome_fantasia || l.razao_social}
                      </div>
                      <div className="truncate" style={{ color: 'var(--cinza)' }} title={l.cnpj}>
                        {l.cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')}
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      {l.email ? (
                        <a href={`mailto:${l.email}`} className="text-blue-600 hover:underline"
                          style={{ color: 'var(--vinho)' }}>{l.email}</a>
                      ) : (
                        <span style={{ color: 'var(--cinza)' }}>—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap" style={{ color: 'var(--preto)' }}>
                      {l.telefone || '—'}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap" style={{ color: 'var(--preto)' }}>
                      {[l.municipio, l.uf].filter(Boolean).join(' / ') || '—'}
                    </td>
                    <td className="px-4 py-2.5" style={{ color: 'var(--preto)' }}>
                      {l.porte ? l.porte.replace('EMPRESA DE ', '').replace('DEMAIS', 'Grande') : '—'}
                    </td>
                    <td className="px-4 py-2.5 max-w-[180px]">
                      <span className="truncate block" title={l.cnae} style={{ color: 'var(--cinza)' }}>
                        {l.cnae ? l.cnae.slice(0, 40) + (l.cnae.length > 40 ? '…' : '') : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 max-w-[200px]">
                      <span className="truncate block" title={l.objeto} style={{ color: 'var(--cinza)' }}>
                        {l.objeto ? l.objeto.slice(0, 50) + (l.objeto.length > 50 ? '…' : '') : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap" style={{ color: 'var(--preto)' }}>
                      {l.valor ? `R$ ${l.valor.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 text-xs" style={{ color: 'var(--cinza)', borderTop: '1px solid var(--cinza-light)' }}>
            Dados públicos: PNCP (contratos adjudicados) + Receita Federal (CNPJ). Máx. 50 empresas por lote — repita a busca com datas diferentes para ampliar.
          </div>
        </div>
      )}

      {resultado && resultado.leads.length === 0 && (
        <div className="rounded-2xl p-10 text-center" style={{ background: 'white', border: '1px solid var(--cinza-light)' }}>
          <p className="text-base font-medium mb-1" style={{ color: 'var(--preto)' }}>Nenhum lead encontrado</p>
          <p className="text-sm" style={{ color: 'var(--cinza)' }}>
            Tente ampliar o período, remover filtros ou aumentar o número de páginas.
          </p>
        </div>
      )}
    </div>
  )
}

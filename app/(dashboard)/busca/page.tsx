'use client'

import { useState } from 'react'

type Licitacao = {
  id: string
  orgao: string
  objeto: string
  valor_estimado?: number
  data_abertura?: string
  url: string
  estado?: string
  cidade?: string
  fonte: string
}

export default function BuscaPage() {
  const [termo, setTermo] = useState('')
  const [estado, setEstado] = useState('')
  const [valorMin, setValorMin] = useState('')
  const [valorMax, setValorMax] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [resultados, setResultados] = useState<Licitacao[]>([])
  const [buscando, setBuscando] = useState(false)
  const [buscandoTempoReal, setBuscandoTempoReal] = useState(false)
  const [buscouUmaVez, setBuscouUmaVez] = useState(false)

  const estados = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

  async function buscar(e: React.FormEvent) {
    e.preventDefault()
    setBuscando(true)
    setBuscouUmaVez(true)

    const params = new URLSearchParams()
    if (termo) params.set('q', termo)
    if (estado) params.set('estado', estado)
    if (valorMin) params.set('valor_min', valorMin)
    if (valorMax) params.set('valor_max', valorMax)
    if (dataInicio) params.set('data_inicio', dataInicio)

    const res = await fetch(`/api/busca?${params}`)
    setResultados(await res.json())
    setBuscando(false)
  }

  async function buscarTempoReal() {
    setBuscandoTempoReal(true)
    await fetch('/api/busca/tempo-real')
    setBuscandoTempoReal(false)
    buscar(new Event('submit') as any)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Busca</h2>

      <form onSubmit={buscar} className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar por objeto</label>
            <input
              value={termo}
              onChange={e => setTermo(e.target.value)}
              placeholder="Ex: notebook, cadeira, retroescavadeira..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={estado}
              onChange={e => setEstado(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Todos</option>
              {estados.map(uf => <option key={uf} value={uf}>{uf}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data de abertura a partir de</label>
            <input
              type="date"
              value={dataInicio}
              onChange={e => setDataInicio(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valor mínimo (R$)</label>
            <input
              type="number"
              value={valorMin}
              onChange={e => setValorMin(e.target.value)}
              placeholder="0"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valor máximo (R$)</label>
            <input
              type="number"
              value={valorMax}
              onChange={e => setValorMax(e.target.value)}
              placeholder="Sem limite"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={buscando}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {buscando ? 'Buscando...' : 'Buscar no banco'}
          </button>
          <button
            type="button"
            onClick={buscarTempoReal}
            disabled={buscandoTempoReal}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 disabled:opacity-50 transition"
          >
            {buscandoTempoReal ? 'Atualizando...' : '🔄 Buscar agora nas fontes'}
          </button>
        </div>
      </form>

      {buscouUmaVez && (
        resultados.length === 0 ? (
          <p className="text-gray-500 text-sm">Nenhum resultado encontrado.</p>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">{resultados.length} resultado(s)</p>
            {resultados.map(l => (
              <div key={l.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{l.fonte}</span>
                      {l.estado && <span className="text-xs text-gray-400">{l.cidade ? `${l.cidade}/${l.estado}` : l.estado}</span>}
                    </div>
                    <p className="font-medium text-gray-900 text-sm">{l.orgao}</p>
                    <p className="text-gray-600 text-sm mt-1">{l.objeto}</p>
                  </div>
                  <div className="text-right shrink-0">
                    {l.valor_estimado && (
                      <p className="font-semibold text-gray-900 text-sm">
                        R$ {l.valor_estimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    )}
                    {l.data_abertura && <p className="text-xs text-gray-500 mt-1">Abertura: {l.data_abertura}</p>}
                    <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-2 block">
                      Ver edital →
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}

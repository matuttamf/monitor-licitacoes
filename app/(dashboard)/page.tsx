'use client'

import { useEffect, useState } from 'react'

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
  alertas: { keywords: { termo: string } }[]
}

export default function DashboardPage() {
  const [licitacoes, setLicitacoes] = useState<Licitacao[]>([])
  const [carregando, setCarregando] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState('')

  async function carregar() {
    setCarregando(true)
    const params = new URLSearchParams()
    if (filtroEstado) params.set('estado', filtroEstado)

    const res = await fetch(`/api/licitacoes?${params}`)
    setLicitacoes(await res.json())
    setCarregando(false)
  }

  useEffect(() => { carregar() }, [filtroEstado])

  const estados = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <select
          value={filtroEstado}
          onChange={e => setFiltroEstado(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Todos os estados</option>
          {estados.map(uf => <option key={uf} value={uf}>{uf}</option>)}
        </select>
      </div>

      {carregando ? (
        <p className="text-gray-500">Carregando licitações...</p>
      ) : licitacoes.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-gray-500">Nenhuma licitação encontrada com match nas palavras-chave.</p>
          <p className="text-gray-400 text-sm mt-2">Cadastre palavras-chave na tela de Palavras-chave para começar.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {licitacoes.map(l => (
            <div key={l.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {l.alertas?.map((a, i) => (
                      <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        {a.keywords?.termo}
                      </span>
                    ))}
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
                  {l.data_abertura && (
                    <p className="text-xs text-gray-500 mt-1">Abertura: {l.data_abertura}</p>
                  )}
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline mt-2 block"
                  >
                    Ver edital →
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

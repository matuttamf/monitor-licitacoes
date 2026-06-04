'use client'

import { useEffect, useState } from 'react'

type Keyword = { id: string; termo: string; ativo: boolean; criado_em: string }

export default function PalavrasChavePage() {
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [novoTermo, setNovoTermo] = useState('')
  const [carregando, setCarregando] = useState(true)

  async function carregar() {
    const res = await fetch('/api/keywords')
    setKeywords(await res.json())
    setCarregando(false)
  }

  useEffect(() => { carregar() }, [])

  async function adicionar(e: React.FormEvent) {
    e.preventDefault()
    await fetch('/api/keywords', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ termo: novoTermo }),
    })
    setNovoTermo('')
    carregar()
  }

  async function toggleAtivo(id: string, ativo: boolean) {
    await fetch('/api/keywords', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ativo: !ativo }),
    })
    carregar()
  }

  async function remover(id: string) {
    if (!confirm('Remover esta palavra-chave?')) return
    await fetch('/api/keywords', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    carregar()
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Palavras-chave</h2>

      <form onSubmit={adicionar} className="flex gap-3 mb-8">
        <input
          value={novoTermo}
          onChange={e => setNovoTermo(e.target.value)}
          placeholder="Ex: notebook, cadeira ergonômica, retroescavadeira"
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Adicionar
        </button>
      </form>

      {carregando ? (
        <p className="text-gray-500">Carregando...</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {keywords.length === 0 && (
            <p className="p-4 text-gray-500 text-sm">Nenhuma palavra-chave cadastrada.</p>
          )}
          {keywords.map(kw => (
            <div key={kw.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <span className={`font-medium ${kw.ativo ? 'text-gray-900' : 'text-gray-400 line-through'}`}>
                  {kw.termo}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${kw.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {kw.ativo ? 'ativo' : 'inativo'}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleAtivo(kw.id, kw.ativo)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {kw.ativo ? 'Desativar' : 'Ativar'}
                </button>
                <button
                  onClick={() => remover(kw.id)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

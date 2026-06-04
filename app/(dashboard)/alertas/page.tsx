'use client'

import { useEffect, useState } from 'react'

type Alerta = {
  id: string
  enviado_em: string
  canais: string[]
  licitacoes: { orgao: string; objeto: string; url: string; estado?: string; cidade?: string }
  keywords: { termo: string }
}

export default function AlertasPage() {
  const [alertas, setAlertas] = useState<Alerta[]>([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    fetch('/api/alertas')
      .then(r => r.json())
      .then(data => { setAlertas(data); setCarregando(false) })
  }, [])

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Histórico de Alertas</h2>

      {carregando ? (
        <p className="text-gray-500">Carregando...</p>
      ) : alertas.length === 0 ? (
        <p className="text-gray-500">Nenhum alerta enviado ainda.</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {alertas.map(a => (
            <div key={a.id} className="p-4 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    {a.keywords?.termo}
                  </span>
                  {a.canais.map(canal => (
                    <span key={canal} className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      {canal}
                    </span>
                  ))}
                </div>
                <p className="font-medium text-gray-900 text-sm">{a.licitacoes?.orgao}</p>
                <p className="text-gray-600 text-sm mt-0.5">{a.licitacoes?.objeto?.substring(0, 120)}...</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-gray-400">
                  {new Date(a.enviado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
                <a href={a.licitacoes?.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-1 block">
                  Ver edital →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const MOTIVOS = [
  'Muito caro',
  'Não encontrei editais relevantes',
  'Não uso o suficiente',
  'Vou usar em outro momento',
  'Fechei o negócio',
  'Prefiro outra solução',
  'Outro',
]

type Etapa = 'save' | 'nps' | 'concluido'

export default function CancelarAssinaturaPage() {
  const router = useRouter()
  const [etapa, setEtapa] = useState<Etapa>('save')
  const [motivo, setMotivo] = useState('')
  const [detalhe, setDetalhe] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  async function pausar() {
    setCarregando(true)
    setErro('')
    const res = await fetch('/api/assinatura/pausar', { method: 'POST' })
    setCarregando(false)
    if (!res.ok) {
      const d = await res.json()
      setErro(d.error ?? 'Erro ao pausar. Tente novamente.')
      return
    }
    router.push('/dashboard?pausa=ok')
  }

  async function confirmarCancelamento() {
    setCarregando(true)
    setErro('')

    // Salva NPS antes de cancelar (não-bloqueante se falhar)
    await fetch('/api/cancelamentos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ motivo: motivo || null, detalhe: detalhe || null }),
    }).catch(() => null)

    const res = await fetch('/api/assinatura/cancelar', { method: 'POST' })
    setCarregando(false)
    if (!res.ok) {
      const d = await res.json()
      setErro(d.error ?? 'Erro ao cancelar. Tente novamente.')
      return
    }
    setEtapa('concluido')
  }

  if (etapa === 'concluido') {
    return (
      <div className="max-w-lg mx-auto pt-16 px-4 text-center">
        <div className="text-4xl mb-4">👋</div>
        <h1 className="text-2xl font-semibold mb-3" style={{ color: 'var(--preto)' }}>
          Assinatura cancelada
        </h1>
        <p className="text-sm mb-8" style={{ color: 'var(--cinza)', lineHeight: '1.7' }}>
          Seu acesso continua até o fim do período já pago. Suas palavras-chave e configurações ficam salvas — se quiser voltar, é só reativar.
        </p>
        <a href="/dashboard"
          className="inline-block px-6 py-3 rounded-xl text-sm font-semibold"
          style={{ background: 'var(--vinho)', color: 'white', textDecoration: 'none' }}>
          Voltar ao painel
        </a>
      </div>
    )
  }

  if (etapa === 'nps') {
    return (
      <div className="max-w-lg mx-auto pt-10 px-4">
        <div className="rounded-2xl p-7" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--preto)' }}>
            Por que você está cancelando?
          </h2>
          <p className="text-sm mb-5" style={{ color: 'var(--cinza)' }}>
            Sua resposta nos ajuda a melhorar. Opcional.
          </p>

          <div className="flex flex-col gap-2 mb-5">
            {MOTIVOS.map(m => (
              <button key={m}
                onClick={() => setMotivo(m)}
                className="text-left px-4 py-3 rounded-xl text-sm transition-colors"
                style={{
                  background: motivo === m ? 'rgba(107,15,26,0.08)' : 'white',
                  border: motivo === m ? '1.5px solid var(--vinho)' : '1px solid var(--border)',
                  color: motivo === m ? 'var(--vinho)' : 'var(--preto)',
                  fontWeight: motivo === m ? 600 : 400,
                  cursor: 'pointer',
                }}>
                {m}
              </button>
            ))}
          </div>

          <textarea
            value={detalhe}
            onChange={e => setDetalhe(e.target.value)}
            placeholder="Quer adicionar algum detalhe? (opcional)"
            rows={3}
            className="w-full px-3 py-2.5 rounded-xl text-sm mb-5 resize-none"
            style={{ border: '1px solid var(--border)', outline: 'none', color: 'var(--preto)', background: 'white' }}
            onFocus={e => { e.target.style.borderColor = 'var(--vinho)' }}
            onBlur={e =>  { e.target.style.borderColor = 'var(--border)' }}
          />

          {erro && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm"
              style={{ background: 'rgba(185,28,28,0.06)', border: '1px solid rgba(185,28,28,0.2)', color: '#b91c1c' }}>
              ⚠ {erro}
            </div>
          )}

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={confirmarCancelamento}
              disabled={carregando}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: '#b91c1c', color: 'white', border: 'none', cursor: carregando ? 'not-allowed' : 'pointer', opacity: carregando ? 0.7 : 1 }}>
              {carregando ? 'Cancelando...' : 'Confirmar cancelamento'}
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              disabled={carregando}
              className="px-5 py-2.5 rounded-xl text-sm"
              style={{ background: 'white', color: 'var(--cinza)', border: '1px solid var(--border)', cursor: 'pointer' }}>
              Desistir
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Etapa 'save' — oferta de pausa
  return (
    <div className="max-w-lg mx-auto pt-10 px-4">
      <div className="rounded-2xl p-7 mb-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="text-3xl mb-4">⏸️</div>
        <h1 className="text-xl font-semibold mb-2" style={{ color: 'var(--preto)' }}>
          Que tal pausar em vez de cancelar?
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--cinza)', lineHeight: '1.7' }}>
          Se você não precisa do Monitor agora mas pode querer usar futuramente, a pausa suspende sua cobrança e mantém tudo salvo — palavras-chave, histórico e configurações.
        </p>

        <div className="rounded-xl px-4 py-3 mb-6 flex items-start gap-3"
          style={{ background: 'rgba(201,166,90,0.08)', border: '1px solid rgba(201,166,90,0.3)' }}>
          <span className="text-lg flex-shrink-0">✨</span>
          <p className="text-xs leading-relaxed" style={{ color: '#78350f' }}>
            Com a pausa, você não é cobrado enquanto não precisar. Quando quiser retomar, basta reativar e as cobranças voltam normalmente.
          </p>
        </div>

        {erro && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm"
            style={{ background: 'rgba(185,28,28,0.06)', border: '1px solid rgba(185,28,28,0.2)', color: '#b91c1c' }}>
            ⚠ {erro}
          </div>
        )}

        <button
          onClick={pausar}
          disabled={carregando}
          className="w-full py-3 rounded-xl text-sm font-semibold mb-3"
          style={{ background: 'var(--vinho)', color: 'white', border: 'none', cursor: carregando ? 'not-allowed' : 'pointer', opacity: carregando ? 0.7 : 1 }}>
          {carregando ? 'Pausando...' : '⏸️ Pausar minha assinatura'}
        </button>

        <button
          onClick={() => setEtapa('nps')}
          disabled={carregando}
          className="w-full py-2.5 rounded-xl text-sm"
          style={{ background: 'transparent', color: 'var(--cinza)', border: '1px solid var(--border)', cursor: 'pointer' }}>
          Quero cancelar mesmo assim
        </button>
      </div>

      <button
        onClick={() => router.back()}
        className="text-xs"
        style={{ background: 'none', border: 'none', color: 'var(--cinza)', cursor: 'pointer' }}>
        ← Voltar
      </button>
    </div>
  )
}

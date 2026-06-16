'use client'

import { useSearchParams } from 'next/navigation'

export default function BannerPausa() {
  const params = useSearchParams()
  if (params.get('pausa') !== 'ok') return null

  return (
    <div className="rounded-2xl px-5 py-4 mb-6 flex items-center gap-3"
      style={{ background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.2)' }}>
      <span className="text-xl flex-shrink-0">⏸️</span>
      <p className="text-sm" style={{ color: '#1d4ed8' }}>
        <strong>Assinatura pausada.</strong> Você não será cobrado enquanto a pausa estiver ativa. Para reativar, acesse Perfil a qualquer momento.
      </p>
    </div>
  )
}

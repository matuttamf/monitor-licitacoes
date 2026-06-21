'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

const SEGMENTOS = { href: '/licitacoes-para', label: 'Por segmento' }

const ARTIGOS = [
  { href: '/como-monitorar-licitacoes', label: 'Como monitorar licitações' },
  { href: '/vale-a-pena-participar-de-licitacoes-publicas', label: 'Vale a pena participar?' },
  { href: '/como-ganhar-primeiro-contrato-publico', label: 'Como ganhar o 1º contrato' },
  { href: '/vale-a-pena-vender-para-o-governo', label: 'Vale a pena vender para o governo?' },
  { href: '/guia-modalidades-licitacao', label: 'Modalidades de licitação' },
  { href: '/alerta-de-licitacao-whatsapp-telegram', label: 'Alertas por WhatsApp e Telegram' },
  { href: '/comprasnet-vs-pncp-vs-bll', label: 'ComprasNet vs PNCP vs BLL' },
  { href: '/documentos-para-habilitacao-em-licitacoes', label: 'Documentos para habilitação' },
]

export function NavArticlesDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative hidden md:block">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1 px-4 py-2 text-sm text-[#4a4a4d] font-medium hover:text-[#6B0F1A] transition-colors"
      >
        Artigos
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M2 4l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-[calc(100%+4px)] left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-[#F0EDE8] p-3 min-w-[280px] z-50">
          {/* Por segmento */}
          <Link
            href={SEGMENTOS.href}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-[#6B0F1A] no-underline hover:bg-[#FAF6F0] transition-colors"
          >
            <span className="w-6 h-6 rounded-md bg-[#6B0F1A] flex items-center justify-center shrink-0">
              <svg className="w-3 h-3 text-[#C9A65A]" viewBox="0 0 12 12" fill="currentColor">
                <rect x="1" y="1" width="4" height="4" rx="1" />
                <rect x="7" y="1" width="4" height="4" rx="1" />
                <rect x="1" y="7" width="4" height="4" rx="1" />
                <rect x="7" y="7" width="4" height="4" rx="1" />
              </svg>
            </span>
            {SEGMENTOS.label}
          </Link>

          <div className="border-t border-[#F0EDE8] my-2" />

          <p className="text-[10px] font-bold uppercase tracking-wider text-[#9AA0A6] px-3 mb-1.5">Artigos e guias</p>

          {ARTIGOS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-[#4a4a4d] no-underline hover:bg-[#FAF6F0] hover:text-[#1A1A1C] transition-colors"
            >
              <span className="text-[#C9A65A] shrink-0 text-xs">→</span>
              {label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

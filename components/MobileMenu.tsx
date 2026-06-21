'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'

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

export function MobileMenu() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const close = () => setOpen(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Bloqueia scroll do body quando drawer está aberto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  const drawer = open && (
    <>
      {/* Backdrop — renderizado no body via portal para escapar do backdrop-filter do header */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm"
        style={{ zIndex: 9998 }}
        onClick={close}
      />

      {/* Painel */}
      <div
        className="fixed top-0 right-0 h-screen w-[280px] bg-white shadow-2xl flex flex-col overflow-y-auto"
        style={{ zIndex: 9999 }}
      >
        {/* Topo */}
        <div className="flex items-center justify-between px-5 h-[64px] border-b border-[#F0EDE8] shrink-0">
          <Link href="/" onClick={close} className="flex items-center gap-2 no-underline">
            <div className="w-7 h-7 rounded-[7px] bg-[#6B0F1A] flex items-center justify-center font-black text-[10px] text-[#C9A65A]">ML</div>
            <span className="font-semibold text-sm text-[#1A1A1C]">Monitor de Licitações</span>
          </Link>
          <button onClick={close} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#9AA0A6] hover:bg-[#FAF6F0]">
            <svg viewBox="0 0 14 14" className="w-4 h-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M1 1l12 12M13 1L1 13" />
            </svg>
          </button>
        </div>

        {/* Links principais */}
        <div className="flex-1 px-3 py-4 space-y-0.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#9AA0A6] px-3 pt-1 pb-2">Navegação</p>

          <Link href="/licitacoes-para" onClick={close} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-[#1A1A1C] no-underline hover:bg-[#FAF6F0] transition-colors">
            <span className="w-7 h-7 rounded-lg bg-[#6B0F1A] flex items-center justify-center shrink-0">
              <svg className="w-3.5 h-3.5 text-[#C9A65A]" viewBox="0 0 12 12" fill="currentColor">
                <rect x="1" y="1" width="4" height="4" rx="1" />
                <rect x="7" y="1" width="4" height="4" rx="1" />
                <rect x="1" y="7" width="4" height="4" rx="1" />
                <rect x="7" y="7" width="4" height="4" rx="1" />
              </svg>
            </span>
            Licitações por Segmento
          </Link>

          <Link href="/assinar" onClick={close} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#4a4a4d] no-underline hover:bg-[#FAF6F0] transition-colors">
            <span className="w-7 h-7 rounded-lg bg-[#FAF6F0] border border-[#F0EDE8] flex items-center justify-center shrink-0 text-[#6B0F1A] text-xs font-bold">R$</span>
            Planos
          </Link>

          <Link href="/contato" onClick={close} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#4a4a4d] no-underline hover:bg-[#FAF6F0] transition-colors">
            <span className="w-7 h-7 rounded-lg bg-[#FAF6F0] border border-[#F0EDE8] flex items-center justify-center shrink-0 text-[#6B0F1A] text-xs">✉</span>
            Contato
          </Link>

          <div className="border-t border-[#F0EDE8] my-3" />

          <p className="text-[10px] font-bold uppercase tracking-wider text-[#9AA0A6] px-3 pb-2">Artigos e guias</p>

          {ARTIGOS.map(({ href, label }) => (
            <Link key={href} href={href} onClick={close} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-[#4a4a4d] no-underline hover:bg-[#FAF6F0] transition-colors">
              <span className="text-[#C9A65A] shrink-0 text-xs font-bold">→</span>
              {label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="px-4 py-4 border-t border-[#F0EDE8] space-y-2 shrink-0">
          <Link href="/login" onClick={close} className="block w-full text-center py-2.5 text-sm font-medium text-[#4a4a4d] no-underline border border-[#F0EDE8] rounded-xl hover:bg-[#FAF6F0] transition-colors">
            Entrar
          </Link>
          <Link href="/cadastro" onClick={close} className="block w-full text-center py-2.5 text-sm font-bold bg-[#6B0F1A] text-white no-underline rounded-xl hover:bg-[#7d1220] transition-colors">
            Começar grátis →
          </Link>
        </div>
      </div>
    </>
  )

  return (
    <div className="md:hidden">
      {/* Hambúrguer */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label={open ? 'Fechar menu' : 'Abrir menu'}
        className="w-9 h-9 flex flex-col items-center justify-center gap-[5px] rounded-lg hover:bg-[#FAF6F0] transition-colors"
      >
        <span className={`block w-5 h-[2px] bg-[#1A1A1C] rounded-full transition-all duration-200 origin-center ${open ? 'rotate-45 translate-y-[7px]' : ''}`} />
        <span className={`block w-5 h-[2px] bg-[#1A1A1C] rounded-full transition-all duration-200 ${open ? 'opacity-0 scale-x-0' : ''}`} />
        <span className={`block w-5 h-[2px] bg-[#1A1A1C] rounded-full transition-all duration-200 origin-center ${open ? '-rotate-45 -translate-y-[7px]' : ''}`} />
      </button>

      {/* Portal: renderizado diretamente no document.body, fora do stacking context do header */}
      {mounted && createPortal(drawer, document.body)}
    </div>
  )
}

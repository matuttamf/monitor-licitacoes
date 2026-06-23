'use client'

import { useState } from 'react'
import Link from 'next/link'

type Plano = {
  id: string
  nome: string
  preco: string | null
  preco_anual?: string
  porDia: string
  porDia_anual?: string
  desc: string
  destaque: boolean
  tag: string | null
  href: string
  btnText: string
  note: string
}

type FeatureRow = Record<string, string | boolean>

export default function TogglePeriodo({ planos, featureRows }: { planos: Plano[]; featureRows: FeatureRow[] }) {
  const [periodo, setPeriodo] = useState<'mensal' | 'anual'>('mensal')

  return (
    <>
      {/* Toggle */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-white border border-[#D5D2C8] shadow-sm">
          <button
            onClick={() => setPeriodo('mensal')}
            className="px-5 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: periodo === 'mensal' ? '#1A1A1C' : 'transparent',
              color: periodo === 'mensal' ? 'white' : '#9AA0A6',
              border: 'none', cursor: 'pointer',
            }}>
            Mensal
          </button>
          <button
            onClick={() => setPeriodo('anual')}
            className="px-5 py-2 rounded-lg text-sm font-semibold flex flex-col items-center gap-1 transition-all"
            style={{
              background: periodo === 'anual' ? '#1A1A1C' : 'transparent',
              color: periodo === 'anual' ? 'white' : '#9AA0A6',
              border: 'none', cursor: 'pointer',
            }}>
            Anual
            <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full" style={{ background: '#C9A65A', color: '#1A1A1C' }}>
              2 MESES GRÁTIS
            </span>
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-stretch">
        {planos.map(p => {
          const isDark = p.destaque
          const precoExibido = periodo === 'anual' && p.preco_anual ? p.preco_anual : p.preco
          const porDiaExibido = periodo === 'anual' && p.porDia_anual ? p.porDia_anual : p.porDia
          const hrefFinal = p.id === 'trial' ? p.href : `${p.href}&periodo=${periodo}`

          return (
            <div key={p.id} className={`rounded-2xl p-6 relative flex flex-col ${
              isDark
                ? 'bg-[#6B0F1A] border-2 border-[#C9A65A] shadow-[0_20px_60px_rgba(107,15,26,0.3)]'
                : p.id === 'trial'
                ? 'bg-white border-2 border-[#C9A65A]'
                : p.id === 'profissional'
                ? 'bg-white border-2 border-[#6B0F1A] shadow-[0_4px_24px_rgba(107,15,26,0.08)]'
                : 'bg-white border border-[#D5D2C8]'
            }`}>
              {p.tag && (
                <div className={`absolute -top-[13px] left-1/2 -translate-x-1/2 text-[10px] font-black px-3.5 py-1 rounded-full whitespace-nowrap tracking-wide ${
                  isDark ? 'bg-[#C9A65A] text-[#1A1A1C]' : p.id === 'profissional' ? 'bg-[#6B0F1A] text-white' : 'bg-[#C9A65A] text-[#1A1A1C]'
                }`}>{p.tag}</div>
              )}

              <div className={`text-[11px] font-bold tracking-[0.08em] uppercase mb-1 text-center ${isDark ? 'text-[#C9A65A]' : p.id === 'profissional' ? 'text-[#6B0F1A]' : 'text-[#9AA0A6]'}`}>{p.nome}</div>
              <div className={`text-xs mb-4 leading-snug text-center ${isDark ? 'text-[rgba(255,255,255,0.45)]' : 'text-[#9AA0A6]'}`}>{p.desc}</div>

              {/* Preço */}
              {precoExibido ? (
                <div className="flex items-end gap-1 mb-1 justify-center">
                  <span className={`text-xs font-medium mb-1 ${isDark ? 'text-[rgba(255,255,255,0.5)]' : 'text-[#9AA0A6]'}`}>R$</span>
                  <span className={`text-[32px] font-black tracking-tight leading-none ${isDark ? 'text-white' : 'text-[#1A1A1C]'}`}>
                    {precoExibido.split(',')[0]}
                    {precoExibido.includes(',') && <span className="text-[18px]">,{precoExibido.split(',')[1]}</span>}
                  </span>
                  <span className={`text-[11px] mb-1 ${isDark ? 'text-[rgba(255,255,255,0.35)]' : 'text-[#9AA0A6]'}`}>
                    {periodo === 'anual' ? '/ano' : '/mês'}
                  </span>
                </div>
              ) : (
                <div className="flex items-end gap-1 mb-1 justify-center">
                  <span className="text-[32px] font-black tracking-tight leading-none text-[#1A1A1C]">7 dias</span>
                </div>
              )}

              <div className="flex flex-col items-center gap-1.5 mb-5">
                <div className={`text-[11px] font-semibold px-2 py-1 rounded text-center ${
                  isDark ? 'text-[rgba(201,166,90,0.8)] bg-[rgba(201,166,90,0.1)]' : 'text-[#6B0F1A] bg-[rgba(107,15,26,0.06)]'
                }`}>{porDiaExibido}</div>
                {periodo === 'anual' && p.id !== 'trial' && (
                  <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full" style={{ background: isDark ? 'rgba(201,166,90,0.2)' : 'rgba(107,15,26,0.08)', color: isDark ? '#C9A65A' : '#6B0F1A' }}>
                    2 MESES GRÁTIS
                  </span>
                )}
              </div>

              <div className="flex-1 mb-5 space-y-2">
                {featureRows.filter(row => row[p.id] !== false).map(row => {
                  const val = row[p.id]
                  const label = typeof val === 'string' && val !== 'true' ? val : row.label as string
                  return (
                    <div key={row.label as string} className="flex items-start gap-2">
                      <span className={`font-bold text-sm shrink-0 mt-0.5 ${isDark ? 'text-[#C9A65A]' : 'text-[#6B0F1A]'}`}>✓</span>
                      <span className={`text-xs leading-snug ${isDark ? 'text-[rgba(255,255,255,0.85)]' : 'text-[#4a4a4d]'}`}>{label}</span>
                    </div>
                  )
                })}
              </div>

              <div className={`h-px mb-4 ${isDark ? 'bg-[rgba(201,166,90,0.2)]' : 'bg-[#E8E4DC]'}`} />

              <Link href={hrefFinal} className={`block text-center py-3 rounded-[10px] text-sm font-bold no-underline transition-opacity hover:opacity-90 ${
                isDark ? 'bg-[#C9A65A] text-[#1A1A1C]'
                : p.id === 'trial' ? 'bg-[#C9A65A] text-[#1A1A1C]'
                : 'bg-[#6B0F1A] text-white'
              }`}>
                {p.btnText}
              </Link>
              <p className={`text-center text-[11px] mt-2.5 mb-0 ${isDark ? 'text-[rgba(255,255,255,0.3)]' : 'text-[#9AA0A6]'}`}>{p.note}</p>
            </div>
          )
        })}
      </div>
    </>
  )
}

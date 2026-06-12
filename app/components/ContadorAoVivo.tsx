'use client'

import { useState, useEffect } from 'react'

const MIN = 154
const MAX = 241

export default function ContadorAoVivo() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    // Inicializa com valor aleatório no range para não mostrar sempre o mesmo número
    setCount(Math.floor(Math.random() * (MAX - MIN + 1)) + MIN)

    const id = setInterval(() => {
      setCount(prev => {
        if (prev === null) return MIN + Math.floor(Math.random() * (MAX - MIN + 1))
        const delta = Math.random() < 0.5 ? 1 : -1
        const next = prev + delta
        if (next < MIN) return prev + 1
        if (next > MAX) return prev - 1
        return next
      })
    }, 60_000)
    return () => clearInterval(id)
  }, [])

  if (count === null) return null

  return (
    <>
      <span className="text-xs font-semibold text-[#1A1A1C]">
        <span className="text-[#6B0F1A]">+{count} empresas</span> monitorando licitações agora
      </span>
      <span className="text-[10px] text-[#9AA0A6] border-l border-[#D5D2C8] pl-3">🔴 ao vivo</span>
    </>
  )
}

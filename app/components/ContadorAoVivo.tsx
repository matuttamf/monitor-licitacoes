'use client'

import { useState, useEffect } from 'react'

const MIN = 218
const MAX = 247

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export default function ContadorAoVivo() {
  const [count, setCount] = useState(230)

  useEffect(() => {
    setCount(randomBetween(MIN, MAX))
    const id = setInterval(() => setCount(randomBetween(MIN, MAX)), 60_000)
    return () => clearInterval(id)
  }, [])

  return (
    <>
      <span className="text-xs font-semibold text-[#1A1A1C]">
        <span className="text-[#6B0F1A]">+{count} empresas</span> monitorando licitações agora
      </span>
      <span className="text-[10px] text-[#9AA0A6] border-l border-[#D5D2C8] pl-3">🔴 ao vivo</span>
    </>
  )
}

'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function SucessoContent() {
  const params = useSearchParams()
  const tipo = params.get('tipo') // 'upgrade' | 'downgrade' | null
  const plano = params.get('plano')

  const nomePlano: Record<string, string> = {
    basic: 'Basic',
    profissional: 'Profissional',
    gestao: 'Gestão',
    empresarial: 'Empresarial',
  }

  let titulo: string
  let subtitulo: string
  let detalhe: string | null = null

  if (tipo === 'upgrade') {
    titulo = 'Plano atualizado com sucesso!'
    subtitulo = plano
      ? `Você agora está no plano ${nomePlano[plano] ?? plano}.`
      : 'Seu novo plano já está ativo.'
    detalhe = 'As funcionalidades adicionais já estão disponíveis no seu painel.'
  } else if (tipo === 'downgrade') {
    titulo = 'Plano alterado com sucesso!'
    subtitulo = plano
      ? `Seu plano foi alterado para ${nomePlano[plano] ?? plano}.`
      : 'Seu plano foi alterado.'
    detalhe = 'A mudança será aplicada no próximo ciclo de cobrança.'
  } else {
    titulo = 'Bem-vindo ao Monitor de Licitações!'
    subtitulo = 'Sua assinatura foi recebida e está sendo ativada.'
    detalhe = 'Você receberá um e-mail de confirmação. Caso o acesso não seja liberado em alguns minutos, entre em contato com o suporte.'
  }

  return (
    <div
      style={{ backgroundColor: '#FAF6F0', minHeight: '100vh' }}
      className="flex items-center justify-center p-4"
    >
      <div
        style={{ backgroundColor: '#fff', border: '1px solid #e8e0d4' }}
        className="rounded-2xl shadow-md p-10 max-w-lg w-full text-center"
      >
        <div className="flex items-center justify-center mb-6">
          <div style={{ background: '#6B0F1A' }} className="w-16 h-16 rounded-full flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C9A65A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>
        <h1
          style={{ color: '#6B0F1A' }}
          className="text-2xl font-bold mb-3"
        >
          {titulo}
        </h1>
        <p style={{ color: '#1A1A1C' }} className="mb-2">
          {subtitulo}
        </p>
        {detalhe && (
          <p style={{ color: '#1A1A1C' }} className="mb-8 text-sm opacity-70">
            {detalhe}
          </p>
        )}
        {!detalhe && <div className="mb-8" />}
        <Link
          href="/dashboard"
          style={{
            backgroundColor: '#6B0F1A',
            color: '#FAF6F0',
            borderBottom: '3px solid #C9A65A',
          }}
          className="inline-block px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          Acessar o painel →
        </Link>
      </div>
    </div>
  )
}

export default function AssinaturaSucessoPage() {
  return (
    <Suspense fallback={null}>
      <SucessoContent />
    </Suspense>
  )
}

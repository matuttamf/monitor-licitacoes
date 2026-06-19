import { ImageResponse } from 'next/og'
import { SEGMENTOS_MAP } from '../data'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OgImage({
  params,
}: {
  params: Promise<{ segmento: string }>
}) {
  const { segmento } = await params
  const data = SEGMENTOS_MAP[segmento]
  const titulo = data?.titulo ?? 'Licitações por Segmento'
  const descricao = data?.descricaoMeta ?? 'Monitore editais públicos em tempo real.'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#FFFDF9',
          padding: '60px 72px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 10,
              background: '#6B0F1A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#C9A65A',
              fontWeight: 900,
              fontSize: 14,
            }}
          >
            ML
          </div>
          <span style={{ color: '#1A1A1C', fontSize: 18, fontWeight: 600 }}>
            Monitor de Licitações
          </span>
        </div>

        {/* Título + descrição */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: '#6B0F1A',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            Guia de segmento
          </div>
          <div
            style={{
              fontSize: 52,
              fontWeight: 900,
              color: '#1A1A1C',
              lineHeight: 1.1,
              maxWidth: 900,
            }}
          >
            {titulo}
          </div>
          <div
            style={{
              fontSize: 22,
              color: '#4a4a4d',
              maxWidth: 820,
              lineHeight: 1.4,
            }}
          >
            {descricao.length > 120 ? descricao.slice(0, 120) + '…' : descricao}
          </div>
        </div>

        {/* Rodapé */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ color: '#9AA0A6', fontSize: 16 }}>
            monitordelicitacoes.com.br
          </span>
          <div
            style={{
              background: '#6B0F1A',
              color: 'white',
              fontSize: 15,
              fontWeight: 700,
              padding: '10px 24px',
              borderRadius: 10,
            }}
          >
            Começar grátis
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}

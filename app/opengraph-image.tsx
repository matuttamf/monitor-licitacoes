import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
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
            Monitoramento de editais públicos
          </div>
          <div
            style={{
              fontSize: 56,
              fontWeight: 900,
              color: '#1A1A1C',
              lineHeight: 1.1,
              maxWidth: 900,
            }}
          >
            Nunca perca um edital do seu segmento
          </div>
          <div style={{ fontSize: 22, color: '#4a4a4d', lineHeight: 1.4, maxWidth: 800 }}>
            Alertas automáticos de licitações do PNCP, portais estaduais e municipais. Teste grátis por 7 dias.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '32px' }}>
            {['PNCP', 'Estados', 'Municípios'].map(label => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ color: '#6B0F1A', fontWeight: 900, fontSize: 20 }}>✓</span>
                <span style={{ color: '#9AA0A6', fontSize: 14 }}>{label}</span>
              </div>
            ))}
          </div>
          <div
            style={{
              background: '#6B0F1A',
              color: 'white',
              fontSize: 15,
              fontWeight: 700,
              padding: '12px 28px',
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

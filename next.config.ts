import type { NextConfig } from "next";

const securityHeaders = [
  // Impede que o browser "adivinhe" o tipo de conteúdo
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Impede que o site seja embutido em iframes (clickjacking)
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // Controla quanto do referrer é enviado ao navegar
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Desativa recursos sensíveis que o site não usa
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  // DNS Prefetch Control
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
]

const nextConfig: NextConfig = {
  headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig

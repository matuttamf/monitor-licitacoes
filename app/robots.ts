import { MetadataRoute } from 'next'

const BASE = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ?? 'https://monitordelicitacoes.com.br'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/api/', '/admin', '/onboarding', '/completar-cadastro', '/assinatura'],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  }
}

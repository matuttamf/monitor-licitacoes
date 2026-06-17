import { MetadataRoute } from 'next'
import { SEGMENTOS } from './licitacoes-para/data'

const BASE = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ?? 'https://monitordelicitacoes.com.br'

const pages: Array<{ path: string; freq: MetadataRoute.Sitemap[0]['changeFrequency']; priority: number }> = [
  { path: '',                           freq: 'weekly',  priority: 1.0 },
  { path: '/como-monitorar-licitacoes', freq: 'monthly', priority: 0.95 },
  { path: '/licitacoes-para',           freq: 'monthly', priority: 0.9 },
  { path: '/assinar',                   freq: 'weekly',  priority: 0.9 },
  { path: '/planos',       freq: 'weekly',  priority: 0.9 },
  { path: '/cadastro',     freq: 'monthly', priority: 0.85 },
  { path: '/contato',      freq: 'monthly', priority: 0.7 },
  { path: '/login',        freq: 'monthly', priority: 0.5 },
  { path: '/privacidade',  freq: 'yearly',  priority: 0.3 },
  { path: '/termos',       freq: 'yearly',  priority: 0.3 },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = pages.map(p => ({
    url: `${BASE}${p.path}`,
    lastModified: new Date(),
    changeFrequency: p.freq,
    priority: p.priority,
  }))

  const segmentoPages = SEGMENTOS.map(s => ({
    url: `${BASE}/licitacoes-para/${s.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as MetadataRoute.Sitemap[0]['changeFrequency'],
    priority: 0.85,
  }))

  return [...staticPages, ...segmentoPages]
}

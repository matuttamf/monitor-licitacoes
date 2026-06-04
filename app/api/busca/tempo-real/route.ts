import { NextResponse } from 'next/server'
import { coletarPNCP } from '@/lib/scrapers/pncp'
import { coletarComprasNet } from '@/lib/scrapers/comprasnet'
import { salvarLicitacoes } from '@/lib/scrapers/salvar'

export async function GET() {
  const hoje = new Date().toISOString().substring(0, 10)

  const [pncp, comprasnet] = await Promise.allSettled([
    coletarPNCP(hoje, hoje),
    coletarComprasNet(hoje),
  ])

  const novas = [
    ...(pncp.status === 'fulfilled' ? pncp.value : []),
    ...(comprasnet.status === 'fulfilled' ? comprasnet.value : []),
  ]

  const salvas = await salvarLicitacoes(novas)

  return NextResponse.json({ ok: true, novas: salvas })
}

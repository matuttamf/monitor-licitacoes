/**
 * Preview do widget de indicações (rodapé do painel) — renderiza o componente
 * REAL (IndicaWidgetView) via react-dom/server e tira screenshot. Não envia nada.
 * Uso: npx tsx scripts/preview-widget.ts
 */
import { config } from 'dotenv'
config({ path: '.env.local' })

import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { IndicaWidgetView } from '../app/(dashboard)/components/IndicaWidget'

async function main() {
  const inner = renderToStaticMarkup(
    React.createElement(IndicaWidgetView, {
      link: 'https://monitordelicitacoes.com.br/r/k7m2p9qd',
      economiaTotal: 147,
      convertidos: 2,
      aguardando: 1,
      creditosDias: 30,
    })
  )
  const html = `<!doctype html><html><head><meta charset="utf-8"></head>
  <body style="margin:0;background:#F5F0E8;font-family:system-ui,-apple-system,sans-serif">
    <div style="max-width:720px;margin:0 auto;padding:40px 24px">
      <div style="font-size:13px;color:#9AA0A6;margin-bottom:8px">(Rodapé do painel — exemplo: 2 indicações convertidas, R$147 economizados, 30 dias de prêmio)</div>
      ${inner}
    </div>
  </body></html>`

  mkdirSync('.preview', { recursive: true })
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 720, height: 600 }, deviceScaleFactor: 2 })
  await page.setContent(html, { waitUntil: 'networkidle' })
  await page.screenshot({ path: '.preview/widget-painel.png', fullPage: true })
  await browser.close()
  console.log('✓ .preview/widget-painel.png')
}

main().catch(e => { console.error('✗', e.message); process.exit(1) })

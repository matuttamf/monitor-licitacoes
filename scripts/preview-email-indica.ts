/**
 * Preview local do e-mail de aptidão de indicação: renderiza o HTML REAL
 * (mesmo template enviado por enviarEmailIndicaApto) num Chromium headless e
 * salva um PNG. Não envia nada.
 *
 * Uso: npx tsx scripts/preview-email-indica.ts
 */
import { config } from 'dotenv'
config({ path: '.env.local' })
process.env.NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://monitordelicitacoes.com.br'

import { chromium } from 'playwright'
import { writeFileSync, mkdirSync } from 'node:fs'
import { htmlIndicaApto } from '../lib/emails/indicacoes'

async function main() {
  const html = htmlIndicaApto('Maria', 'k7m2p9qd') // nome + código de exemplo
  mkdirSync('.preview', { recursive: true })
  const htmlPath = '.preview/email-indica-apto.html'
  const pngPath  = '.preview/email-indica-apto.png'
  writeFileSync(htmlPath, html, 'utf8')

  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 640, height: 900 }, deviceScaleFactor: 2 })
  await page.setContent(html, { waitUntil: 'networkidle' })
  await page.screenshot({ path: pngPath, fullPage: true })
  await browser.close()

  console.log(`✓ HTML:  ${htmlPath}`)
  console.log(`✓ PNG:   ${pngPath}`)
}

main().catch(e => { console.error('✗', e.message); process.exit(1) })

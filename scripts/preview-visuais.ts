/**
 * Preview local: renderiza para PNG os e-mails de feedback (HTML real) e, via dev
 * server, o regulamento e o widget de indicações (componentes reais). Não envia nada.
 *
 * Pré-requisito p/ regulamento e widget: dev server rodando em :3217.
 * Uso: npx tsx scripts/preview-visuais.ts
 */
import { config } from 'dotenv'
config({ path: '.env.local' })
process.env.NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://monitordelicitacoes.com.br'

import { chromium, type Browser } from 'playwright'
import { mkdirSync } from 'node:fs'
import { htmlFeedbackTrial, htmlFeedbackExperiencia } from '../lib/emails/feedback'

const BASE = 'http://localhost:3217'

async function shotHtml(browser: Browser, html: string, png: string) {
  const page = await browser.newPage({ viewport: { width: 640, height: 900 }, deviceScaleFactor: 2 })
  await page.setContent(html, { waitUntil: 'networkidle' })
  await page.screenshot({ path: png, fullPage: true })
  await page.close()
  console.log(`✓ ${png}`)
}

async function shotUrl(browser: Browser, url: string, png: string, width = 900) {
  const page = await browser.newPage({ viewport: { width, height: 1000 }, deviceScaleFactor: 2 })
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })
    await page.waitForTimeout(800)
    await page.screenshot({ path: png, fullPage: true })
    console.log(`✓ ${png}`)
  } catch (e) {
    console.error(`✗ ${url} — ${(e as Error).message} (dev server no ar?)`)
  } finally {
    await page.close()
  }
}

async function main() {
  mkdirSync('.preview', { recursive: true })
  const browser = await chromium.launch()

  // E-mails (HTML real, sem servidor)
  await shotHtml(browser, htmlFeedbackTrial('Carlos'), '.preview/email-feedback-trial.png')
  await shotHtml(browser, htmlFeedbackExperiencia('Carlos'), '.preview/email-feedback-experiencia.png')

  // Páginas reais (dev server)
  await shotUrl(browser, `${BASE}/regulamento-indicacoes`, '.preview/regulamento.png', 900)
  await shotUrl(browser, `${BASE}/__preview-indica`, '.preview/widget-painel.png', 760)

  await browser.close()
}

main().catch(e => { console.error('✗', e.message); process.exit(1) })

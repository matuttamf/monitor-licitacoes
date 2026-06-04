import { chromium } from 'playwright'
import { LicitacaoRaw } from './types'

export async function coletarLicitacoesE(): Promise<LicitacaoRaw[]> {
  const licitacoes: LicitacaoRaw[] = []
  const browser = await chromium.launch({ headless: true })

  try {
    const page = await browser.newPage()
    await page.goto('https://www.licitacoes-e.com.br/aop/pesquisar-licitacao.aop', {
      waitUntil: 'networkidle',
      timeout: 30000,
    })

    // Buscar licitações abertas
    await page.click('#btnPesquisar, button[type="submit"]').catch(() => {})
    await page.waitForLoadState('networkidle')

    const itens = await page.$$eval('table.resultado tbody tr', rows =>
      rows.slice(0, 50).map(row => {
        const colunas = row.querySelectorAll('td')
        return {
          numero: colunas[0]?.textContent?.trim() ?? '',
          orgao: colunas[1]?.textContent?.trim() ?? '',
          objeto: colunas[2]?.textContent?.trim() ?? '',
          data: colunas[3]?.textContent?.trim() ?? '',
          link: row.querySelector('a')?.href ?? '',
        }
      })
    )

    for (const item of itens) {
      if (!item.numero || !item.objeto) continue
      licitacoes.push({
        fonte: 'Licitações-e',
        numero_edital: item.numero,
        orgao: item.orgao,
        objeto: item.objeto,
        data_abertura: item.data || undefined,
        url: item.link || 'https://www.licitacoes-e.com.br',
      })
    }
  } finally {
    await browser.close()
  }

  return licitacoes
}

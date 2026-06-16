// Tipagem mínima para evitar erros de TypeScript com variáveis globais
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    fbq?: (...args: unknown[]) => void
  }
}

// ── GA4 ──────────────────────────────────────────────────────────────────────

function ga(event: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined' || !window.gtag) return
  window.gtag('event', event, params)
}

// ── Meta Pixel ───────────────────────────────────────────────────────────────

function pixel(event: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined' || !window.fbq) return
  window.fbq('track', event, params)
}

// ── Eventos de conversão ─────────────────────────────────────────────────────

export const analytics = {
  /** Usuário completou o cadastro / confirmou e-mail */
  cadastro() {
    ga('sign_up', { method: 'email' })
    pixel('CompleteRegistration')
  },

  /** Usuário fez login */
  login() {
    ga('login', { method: 'email' })
  },

  /** Usuário clicou em "Assinar" / abriu checkout */
  iniciarCheckout(plano: string, valor: number) {
    ga('begin_checkout', { currency: 'BRL', value: valor, items: [{ item_name: plano }] })
    pixel('InitiateCheckout', { currency: 'BRL', value: valor })
  },

  /** Assinatura confirmada (webhook → pode ser disparado server-side via Conversion API, mas aqui é client) */
  assinatura(plano: string, valor: number) {
    ga('purchase', { currency: 'BRL', value: valor, transaction_id: plano + '_' + Date.now(), items: [{ item_name: plano }] })
    pixel('Purchase', { currency: 'BRL', value: valor })
  },

  /** Busca de edital no painel */
  busca(termo: string) {
    ga('search', { search_term: termo })
    pixel('Search', { search_string: termo })
  },

  /** Palavra-chave adicionada */
  palavraChaveAdicionada() {
    ga('keyword_added')
  },

  /** Usuário atingiu o limite e viu o upsell */
  upsellExibido(motivo: 'limite_diario' | 'limite_mensal' | 'limite_keywords') {
    ga('upsell_shown', { motivo })
  },

  /** Usuário clicou no upsell */
  upsellClicado(motivo: string, destino: string) {
    ga('upsell_clicked', { motivo, destino })
    pixel('Lead', { content_name: motivo })
  },
}

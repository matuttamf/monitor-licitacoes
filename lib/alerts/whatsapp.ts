/**
 * Envio de alertas via WhatsApp — Z-API
 *
 * Variáveis de ambiente necessárias:
 *   ZAPI_INSTANCE_ID    — ID da instância (ex: "3DF1234...")
 *   ZAPI_INSTANCE_TOKEN — Token da instância
 *   ZAPI_CLIENT_TOKEN   — Client-Token (header obrigatório na Z-API v2)
 *
 * Endpoint base: https://api.z-api.io/instances/{instanceId}/token/{instanceToken}/send-text
 *
 * Documentação: https://developer.z-api.io/
 */

interface LicitacaoAlerta {
  orgao: string
  objeto: string
  valor_estimado?: number
  data_abertura?: string
  url: string
  estado?: string
  cidade?: string
  keyword: string
  reenvio?: boolean
}

// ─── Helpers ─────────────────────────────────────────────────────────────

function formatarNumero(telefone: string): string {
  const digits = telefone.replace(/\D/g, '')
  // Z-API aceita formato com país: 5531999999999
  if (digits.startsWith('55') && digits.length >= 12) return digits
  return `55${digits}`
}

function formatarValor(v?: number): string {
  if (!v || v === 0) return ''
  return `💰 R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`
}

function formatarData(d?: string): string {
  if (!d) return ''
  const dt = new Date(d.includes('T') ? d : d + 'T12:00:00')
  if (isNaN(dt.getTime())) return ''
  return `📅 Abertura: ${dt.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}\n`
}

// ─── Montagem de mensagem individual ─────────────────────────────────────

function montarMensagemIndividual(l: LicitacaoAlerta, appUrl: string): string {
  const localidade = [l.cidade, l.estado].filter(Boolean).join(' — ')
  const objeto = l.objeto.length > 350 ? l.objeto.substring(0, 350) + '…' : l.objeto

  return (
    `🚨 *OPORTUNIDADE!*\n\n` +
    `🔹 *${l.keyword.toUpperCase()}*${l.reenvio ? ' _(lembrete)_' : ''}\n` +
    `📋 ${l.orgao}\n` +
    (localidade ? `📍 ${localidade}\n` : '') +
    `📝 ${objeto}\n` +
    formatarValor(l.valor_estimado) +
    formatarData(l.data_abertura) +
    `🔗 ${l.url}\n\n` +
    `_Acompanhe todas as licitações no Painel: ${appUrl}/alertas_`
  )
}

// ─── Envio via Z-API ──────────────────────────────────────────────────────

async function enviarMensagemZApi(numero: string, texto: string): Promise<boolean> {
  const instanceId    = process.env.ZAPI_INSTANCE_ID
  const instanceToken = process.env.ZAPI_INSTANCE_TOKEN
  const clientToken   = process.env.ZAPI_CLIENT_TOKEN

  if (!instanceId || !instanceToken) return false

  const url = `https://api.z-api.io/instances/${instanceId}/token/${instanceToken}/send-text`

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(clientToken ? { 'Client-Token': clientToken } : {}),
      },
      body: JSON.stringify({ phone: numero, message: texto }),
      signal: AbortSignal.timeout(15000),
    })

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      console.error(`Z-API erro ${res.status} para ${numero}:`, body)
      return false
    }
    return true
  } catch (err) {
    console.error('Z-API exceção:', err instanceof Error ? err.message : err)
    return false
  }
}

// ─── Funções exportadas ───────────────────────────────────────────────────

/**
 * Envia uma mensagem individual por licitação, estilo sirene.
 * Intervalo de ~3s entre mensagens.
 */
export async function enviarAlertaWhatsApp(
  licitacoes: LicitacaoAlerta[],
  telefone: string,
): Promise<boolean> {
  if (!process.env.ZAPI_INSTANCE_ID || !telefone || licitacoes.length === 0) return false

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://monitordelicitacoes.com.br'
  const numero = formatarNumero(telefone)

  let tudo_ok = true
  for (let i = 0; i < licitacoes.length; i++) {
    const ok = await enviarMensagemZApi(numero, montarMensagemIndividual(licitacoes[i], appUrl))
    if (!ok) tudo_ok = false
    if (i < licitacoes.length - 1) await new Promise(r => setTimeout(r, 3000))
  }
  return tudo_ok
}

/** Resumo semanal via WhatsApp */
export async function enviarResumoSemanalWhatsApp(
  telefone: string,
  totalAlertas: number,
  volumeTotal: number,
  topKeywords: { termo: string; count: number }[],
): Promise<boolean> {
  if (!process.env.ZAPI_INSTANCE_ID || !telefone) return false

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://monitordelicitacoes.com.br'
  const numero = formatarNumero(telefone)

  const volume = volumeTotal > 0
    ? `\n💰 *Volume total estimado:* R$ ${volumeTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    : ''

  const topList = topKeywords.slice(0, 5)
    .map((k, i) => `${i + 1}. ${k.termo} (${k.count})`)
    .join('\n')

  const inicio = (() => {
    const d = new Date(); d.setDate(d.getDate() - 6)
    return d.toLocaleDateString('pt-BR')
  })()

  const texto =
    `📊 *Resumo Semanal — Monitor de Licitações*\n` +
    `Semana: ${inicio} a ${new Date().toLocaleDateString('pt-BR')}\n\n` +
    `🔔 *${totalAlertas} licitaç${totalAlertas !== 1 ? 'ões' : 'ão'}* encontrada${totalAlertas !== 1 ? 's' : ''} para você.` +
    volume +
    (topList ? `\n\n🏆 *Top palavras-chave:*\n${topList}` : '') +
    `\n\n_Ver todas no painel: ${appUrl}/alertas_`

  return enviarMensagemZApi(numero, texto)
}

/** Mensagem de segunda-feira com contagem nacional */
export async function enviarSegundaWhatsApp(
  telefone: string,
  totalNacional: number,
  termos: string[],
): Promise<boolean> {
  if (!process.env.ZAPI_INSTANCE_ID || !telefone) return false

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://monitordelicitacoes.com.br'
  const numero = formatarNumero(telefone)
  const termosStr = termos.slice(0, 3).join(', ') + (termos.length > 3 ? '...' : '')

  const texto =
    `📅 *Bom começo de semana!*\n\n` +
    `🔍 Esta semana há *${totalNacional.toLocaleString('pt-BR')} licitaç${totalNacional !== 1 ? 'ões' : 'ão'}* abertas` +
    (termosStr ? ` para "${termosStr}"` : '') +
    ` em todo o Brasil.\n\n` +
    `_Acompanhe no painel: ${appUrl}/alertas_`

  return enviarMensagemZApi(numero, texto)
}

// ── Onboarding ────────────────────────────────────────────────────────────────

const saudar = (nome: string | null): string =>
  nome ? `Olá, *${nome}!*` : 'Olá!'

export async function enviarWAPerfilIncompleto(telefone: string, nome: string | null): Promise<boolean> {
  if (!process.env.ZAPI_INSTANCE_ID || !telefone) return false
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://monitordelicitacoes.com.br'
  const texto =
    `${saudar(nome)} 👋\n\n` +
    `Uma coisa rápida: seu perfil ainda está incompleto.\n\n` +
    `Perfis completos recebem alertas mais certeiros e aparecem no Diretório de Fornecedores — ` +
    `onde outras empresas que precisam dos seus serviços e produtos podem te encontrar.\n\n` +
    `Leva 2 minutinhos:\n🔗 ${appUrl}/perfil`
  return enviarMensagemZApi(formatarNumero(telefone), texto)
}

export async function enviarWASemKeywords(
  telefone: string,
  nome: string | null,
  intervaloHoras: 12 | 24 | 48 | 72 | 96 | 120,
): Promise<boolean> {
  if (!process.env.ZAPI_INSTANCE_ID || !telefone) return false
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://monitordelicitacoes.com.br'
  const numero = formatarNumero(telefone)
  const url = `${appUrl}/palavras-chave`

  let texto: string
  if (intervaloHoras === 12) {
    texto =
      `${nome ? `Oi, *${nome}!*` : 'Oi!'} 🔔\n\n` +
      `Sua conta está ativa, mas você ainda não configurou nenhuma palavra-chave.\n\n` +
      `Sem elas, o Monitor não consegue buscar licitações para você.\n\n` +
      `⚙️ Configure agora: ${url}`
  } else if (intervaloHoras === 24) {
    texto =
      `${nome ? `*${nome}*, 1 dia sem alertas` : '1 dia sem alertas'} 📭\n\n` +
      `Configure suas palavras-chave e começa a receber em breve.\n\n` +
      `⚙️ ${url}`
  } else if (intervaloHoras === 48) {
    texto =
      `${nome ? `*${nome}* 👋` : 'Uma pergunta rápida 👋'}\n\n` +
      `Que tipo de licitação sua empresa buscaria?\n\n` +
      `🛒 Equipamentos? 🏗️ Obras? 💻 Serviços de TI?\n\n` +
      `Configure em 1 minuto: ${url}`
  } else if (intervaloHoras === 72) {
    texto =
      `${nome ? `*${nome}*, 3 dias sem alertas` : '3 dias sem alertas'} ⏳\n\n` +
      `O Monitor já tem licitações para diferentes tipos de empresas. Configure agora para começar a receber.\n\n` +
      `⚙️ ${url}`
  } else if (intervaloHoras === 96) {
    texto =
      `${nome ? `*${nome}* 🤔` : '4 dias sem alertas 🤔'}\n\n` +
      `Quatro dias sem licitações. Ainda dá tempo.\n\n` +
      `Se sua empresa participa de licitações, o Monitor vai encontrar oportunidades para você — é só configurar.\n\n` +
      `⚙️ ${url}`
  } else {
    texto =
      `${nome ? `*${nome}*, este é meu último lembrete` : 'Este é meu último lembrete'} 🙋\n\n` +
      `Se tiver interesse, configure suas palavras-chave agora:\n` +
      `⚙️ ${url}\n\n` +
      `_O Monitor continuará disponível na sua conta._`
  }

  return enviarMensagemZApi(numero, texto)
}

export async function enviarWAFornecedorD3(telefone: string, nome: string | null): Promise<boolean> {
  if (!process.env.ZAPI_INSTANCE_ID || !telefone) return false
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://monitordelicitacoes.com.br'
  const texto =
    `${nome ? `Olá, *${nome}!*` : 'Atenção!'} 📋\n\n` +
    `Você sabia que outras empresas usam o Monitor para encontrar fornecedores e parceiros?\n\n` +
    `Empresas com perfil no Diretório são encontradas por quem precisa de subcontratados, ` +
    `parceiros ou fornecedores do seu segmento.\n\n` +
    `Crie o seu agora:\n🔗 ${appUrl}/fornecedor`
  return enviarMensagemZApi(formatarNumero(telefone), texto)
}

export async function enviarWATelegramD5(telefone: string, nome: string | null): Promise<boolean> {
  if (!process.env.ZAPI_INSTANCE_ID || !telefone) return false
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://monitordelicitacoes.com.br'
  const texto =
    `${nome ? `Olá, *${nome}!*` : 'Uma dica rápida'} 📲\n\n` +
    `Ative os alertas no Telegram — sem custo extra, já incluído no seu plano.\n\n` +
    `*Como ativar em 3 passos:*\n` +
    `1. Abra o Telegram e busque *@MonitorLicitacoesBot*\n` +
    `2. Envie /start\n` +
    `3. Cole o código que aparece no seu painel\n\n` +
    `_Painel: ${appUrl}/perfil_`
  return enviarMensagemZApi(formatarNumero(telefone), texto)
}

// ── Trial ─────────────────────────────────────────────────────────────────────

export async function enviarWATrialDia3(
  telefone: string,
  nome: string | null,
  count: number,
  termos: string[],
): Promise<boolean> {
  if (!process.env.ZAPI_INSTANCE_ID || !telefone) return false
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://monitordelicitacoes.com.br'
  const numero = formatarNumero(telefone)

  const abertura = nome ? `*${nome}*, 3 dias de Monitor 📊` : '3 dias de Monitor 📊'
  const contagem = count > 0 && termos.length > 0
    ? `Já encontramos *${count.toLocaleString('pt-BR')} licitaç${count !== 1 ? 'ões' : 'ão'}* para "${termos.slice(0, 2).join('", "')}".`
    : 'O Monitor rastreia oportunidades em tempo real — sem você precisar vasculhar portais.'

  const texto =
    `${abertura}\n\n` +
    `${contagem}\n\n` +
    `Continue tendo esse acesso por apenas *a partir de R$ 49,90/mês*.\n\n` +
    `🔗 ${appUrl}/assinar`
  return enviarMensagemZApi(numero, texto)
}

export async function enviarWATrialExpirando(telefone: string, nome: string | null): Promise<boolean> {
  if (!process.env.ZAPI_INSTANCE_ID || !telefone) return false
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://monitordelicitacoes.com.br'
  const texto =
    `⏰ ${nome ? `*${nome}*, seu trial termina amanhã.` : 'Seu trial termina amanhã.'}\n\n` +
    `Não perca o acesso às licitações monitoradas até aqui.\n\n` +
    `Assine agora por *a partir de R$ 49,90/mês*:\n🔗 ${appUrl}/assinar`
  return enviarMensagemZApi(formatarNumero(telefone), texto)
}

// ── Pós-assinatura ────────────────────────────────────────────────────────────

export async function enviarWAPosAssinaturaDia1(telefone: string, nome: string | null): Promise<boolean> {
  if (!process.env.ZAPI_INSTANCE_ID || !telefone) return false
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://monitordelicitacoes.com.br'
  const texto =
    `${nome ? `*${nome}*, seu plano está ativo!` : 'Seu plano está ativo!'} ✅\n\n` +
    `Configure suas palavras-chave para começar a receber alertas de licitações.\n\n` +
    `⚙️ ${appUrl}/palavras-chave`
  return enviarMensagemZApi(formatarNumero(telefone), texto)
}

export async function enviarWAPosAssinaturaDia7(telefone: string, nome: string | null): Promise<boolean> {
  if (!process.env.ZAPI_INSTANCE_ID || !telefone) return false
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://monitordelicitacoes.com.br'
  const texto =
    `${nome ? `*${nome}*, primeira semana completa` : 'Primeira semana completa'} 📈\n\n` +
    `Dica: ative os alertas no Telegram para receber avisos em tempo real, mesmo fora do painel.\n\n` +
    `Busque *@MonitorLicitacoesBot* no Telegram para ativar.\n\n` +
    `_Painel: ${appUrl}/perfil_`
  return enviarMensagemZApi(formatarNumero(telefone), texto)
}

// ── Reconversão ───────────────────────────────────────────────────────────────

export async function enviarWAReconversao(telefone: string, nome: string | null): Promise<boolean> {
  if (!process.env.ZAPI_INSTANCE_ID || !telefone) return false
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://monitordelicitacoes.com.br'
  const texto =
    `${nome ? `*${nome}* 👋` : 'Olá! 👋'}\n\n` +
    `Seu trial encerrou, mas as licitações continuam saindo.\n\n` +
    `Assine agora e retome o monitoramento por *a partir de R$ 49,90/mês*:\n🔗 ${appUrl}/assinar`
  return enviarMensagemZApi(formatarNumero(telefone), texto)
}

/** Notifica o admin sobre novo cadastro */
export async function notificarAdminNovoCadastro(
  emailUsuario: string,
  nomeUsuario?: string,
): Promise<void> {
  const adminPhone = process.env.ADMIN_WHATSAPP
  if (!process.env.ZAPI_INSTANCE_ID || !adminPhone) return

  const nome = nomeUsuario ? `*${nomeUsuario}*` : 'um usuário'
  const agora = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })

  const texto =
    `🆕 *Novo cadastro — Monitor de Licitações*\n\n` +
    `👤 ${nome}\n` +
    `📧 ${emailUsuario}\n` +
    `🕐 ${agora}`

  await enviarMensagemZApi(formatarNumero(adminPhone), texto).catch(() => {})
}

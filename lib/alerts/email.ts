import { Resend } from 'resend'

interface LicitacaoAlerta {
  id: string
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

function formatarValor(v?: number) {
  if (!v) return '—'
  return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
}

function formatarData(d?: string) {
  if (!d) return '—'
  // Aceita yyyy-MM-dd ou ISO
  const dt = new Date(d.includes('T') ? d : d + 'T12:00:00')
  if (isNaN(dt.getTime())) return d
  return dt.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function gerarHtmlAlerta(licitacoes: LicitacaoAlerta[]): string {
  const dataHoje = new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const total = licitacoes.length

  const temReenvios = licitacoes.some(l => l.reenvio)
  const temNovos = licitacoes.some(l => !l.reenvio)

  const cards = licitacoes.map((l, idx) => {
    // Inserir separador quando a seção mudar de novos → lembretes
    const separador = temNovos && temReenvios && l.reenvio && (idx === 0 || !licitacoes[idx - 1].reenvio)
      ? `<div style="margin:24px 0 20px;padding:12px 16px;background:#EEF2FF;border-radius:10px;text-align:center">
           <span style="font-size:12px;font-weight:700;color:#4338CA;letter-spacing:0.5px">🔁 LEMBRETES — licitações enviadas anteriormente ainda dentro do prazo</span>
         </div>`
      : ''
    const valor = formatarValor(l.valor_estimado)
    const abertura = formatarData(l.data_abertura)
    const localidade = [l.cidade, l.estado].filter(Boolean).join(' — ')
    const objeto = l.objeto.length > 200 ? l.objeto.substring(0, 200) + '…' : l.objeto

    return `${separador}
    <!-- Card -->
    <div style="background:#FFFFFF;border:1px solid #E8E0D5;border-radius:12px;margin-bottom:16px;overflow:hidden">
      <!-- Barra lateral colorida via borda esquerda -->
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
        <tr>
          <td width="4" style="background:linear-gradient(180deg,#6B0F1A,#8B1520);border-radius:12px 0 0 12px">&nbsp;</td>
          <td style="padding:20px 24px">

            <!-- Topo: keyword + lembrete + localidade -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px">
              <tr>
                <td>
                  <span style="display:inline-block;background:#FDF5E6;border:1px solid #C9A65A;border-radius:20px;padding:3px 12px;font-size:11px;font-weight:700;color:#8B6914;text-transform:uppercase;letter-spacing:0.5px">${l.keyword}</span>
                  ${l.reenvio ? `<span style="display:inline-block;margin-left:8px;background:#EEF2FF;border:1px solid #C7D2FE;border-radius:20px;padding:3px 10px;font-size:10px;font-weight:700;color:#4338CA;text-transform:uppercase;letter-spacing:0.5px">🔁 Lembrete</span>` : ''}
                </td>
                ${localidade ? `<td align="right" style="font-size:12px;color:#9AA0A6">${localidade}</td>` : '<td></td>'}
              </tr>
            </table>

            <!-- Órgão -->
            <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#6B0F1A;text-transform:uppercase;letter-spacing:0.3px">${l.orgao}</p>

            <!-- Objeto -->
            <p style="margin:0 0 16px;font-size:14px;color:#2C2C2C;line-height:1.55">${objeto}</p>

            <!-- Rodapé do card: valor + abertura + botão -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="vertical-align:middle">
                  <!-- Valor -->
                  <table cellpadding="0" cellspacing="0" style="display:inline-table;margin-right:20px">
                    <tr>
                      <td>
                        <span style="display:block;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#9AA0A6;margin-bottom:2px">Valor estimado</span>
                        <span style="font-size:15px;font-weight:700;color:#2C2C2C">${valor}</span>
                      </td>
                    </tr>
                  </table>
                  <!-- Abertura -->
                  <table cellpadding="0" cellspacing="0" style="display:inline-table">
                    <tr>
                      <td>
                        <span style="display:block;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#9AA0A6;margin-bottom:2px">Abertura</span>
                        <span style="font-size:15px;font-weight:700;color:#2C2C2C">${abertura}</span>
                      </td>
                    </tr>
                  </table>
                </td>
                <td align="right" style="vertical-align:middle">
                  <a href="${l.url}" style="display:inline-block;background:linear-gradient(135deg,#6B0F1A,#8B1520);color:white;padding:10px 22px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:0.3px">Ver edital →</a>
                </td>
              </tr>
            </table>

          </td>
        </tr>
      </table>
    </div>`
  }).join('')

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Novas Licitações — Monitor de Licitações</title>
</head>
<body style="margin:0;padding:0;background:#F2EDE6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
  <div style="max-width:680px;margin:0 auto;padding:32px 16px">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#6B0F1A 0%,#8B1520 100%);border-radius:16px 16px 0 0;padding:36px 40px 32px;text-align:center">
      <!-- Logo badge -->
      <div style="margin-bottom:20px">
        <span style="display:inline-block;background:rgba(201,166,90,0.15);border:1px solid rgba(201,166,90,0.5);border-radius:6px;padding:5px 18px">
          <span style="color:#C9A65A;font-size:10px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase">MONITOR DE LICITAÇÕES</span>
        </span>
      </div>
      <h1 style="margin:0 0 10px;color:#FFFFFF;font-size:28px;font-weight:800;letter-spacing:-0.5px">🔔 Novas Licitações</h1>
      <p style="margin:0 0 24px;color:rgba(255,255,255,0.7);font-size:14px">${dataHoje}</p>
      <!-- Contador -->
      <div style="display:inline-block;background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.2);border-radius:10px;padding:12px 28px">
        <span style="color:#C9A65A;font-size:32px;font-weight:800">${total}</span>
        <span style="display:block;color:rgba(255,255,255,0.65);font-size:12px;font-weight:600;letter-spacing:0.5px;margin-top:2px">${total === 1 ? 'licitação encontrada' : 'licitações encontradas'}</span>
      </div>
    </div>

    <!-- Corpo -->
    <div style="background:#F7F3EE;padding:28px 24px;border-left:1px solid #DDD6CC;border-right:1px solid #DDD6CC">

      <p style="margin:0 0 20px;font-size:14px;color:#5C5C5C;line-height:1.6">
        Encontramos oportunidades que correspondem às suas palavras-chave monitoradas. Analise cada edital com cuidado antes de participar.
      </p>

      ${cards}

      <!-- CTA principal -->
      <div style="text-align:center;margin-top:28px;padding-top:24px;border-top:1px solid #E0D8CF">
        <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://monitor-licitacoes-two.vercel.app'}/alertas"
           style="display:inline-block;background:linear-gradient(135deg,#6B0F1A,#8B1520);color:white;padding:15px 40px;border-radius:10px;text-decoration:none;font-weight:800;font-size:15px;letter-spacing:0.3px">
          Ver todas no painel →
        </a>
        <p style="margin:12px 0 0;font-size:12px;color:#9AA0A6">Acesse o painel para gerenciar alertas e buscar mais editais</p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#1E1E1E;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center">
      <p style="margin:0 0 6px;color:rgba(255,255,255,0.6);font-size:13px;font-weight:600">Matutta Máquinas e Ferramentas</p>
      <p style="margin:0 0 6px;color:rgba(255,255,255,0.35);font-size:12px">Monitor de Licitações — alertas automáticos de editais públicos</p>
      <p style="margin:0;color:rgba(255,255,255,0.2);font-size:11px">Você recebe este e-mail porque cadastrou palavras-chave no sistema.</p>
    </div>

  </div>
</body>
</html>`
}

// Função principal — envia para o email do usuário específico
export async function enviarAlertaEmailUsuario(emailDestino: string, licitacoes: LicitacaoAlerta[]): Promise<boolean> {
  if (licitacoes.length === 0) return false

  const resend = new Resend(process.env.RESEND_API_KEY!)

  const { error } = await resend.emails.send({
    from: process.env.EMAIL_REMETENTE!,
    to: emailDestino,
    subject: `🔔 ${licitacoes.length} nova(s) licitação(ões) para você — ${new Date().toLocaleDateString('pt-BR')}`,
    html: gerarHtmlAlerta(licitacoes),
  })

  if (error) {
    console.error(`Erro ao enviar e-mail para ${emailDestino}:`, error)
    return false
  }

  return true
}

// Mantida para compatibilidade (legado)
export async function enviarAlertaEmail(licitacoes: LicitacaoAlerta[]): Promise<boolean> {
  const destinatarios = (process.env.EMAIL_DESTINATARIOS ?? '').split(',').map(e => e.trim()).filter(Boolean)
  if (destinatarios.length === 0) return false
  let ok = false
  for (const email of destinatarios) {
    const r = await enviarAlertaEmailUsuario(email, licitacoes)
    if (r) ok = true
  }
  return ok
}

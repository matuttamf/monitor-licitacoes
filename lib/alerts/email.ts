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
}

function formatarValor(v?: number) {
  if (!v) return '—'
  return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
}

function gerarHtmlAlerta(licitacoes: LicitacaoAlerta[]): string {
  const linhas = licitacoes.map(l => `
    <tr>
      <td style="padding:10px 8px;border-bottom:1px solid #F0EDE8;font-size:13px;color:#6B0F1A;font-weight:600">${l.keyword}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #F0EDE8;font-size:13px;color:#2C2C2C">${l.orgao}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #F0EDE8;font-size:13px;color:#2C2C2C">${l.objeto.substring(0, 120)}${l.objeto.length > 120 ? '...' : ''}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #F0EDE8;font-size:13px;color:#2C2C2C;white-space:nowrap">${formatarValor(l.valor_estimado)}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #F0EDE8;font-size:13px;color:#2C2C2C;white-space:nowrap">${l.data_abertura ?? '—'}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #F0EDE8;font-size:13px">
        <a href="${l.url}" style="background:#6B0F1A;color:white;padding:4px 12px;border-radius:6px;text-decoration:none;font-size:12px;font-weight:600">Ver edital</a>
      </td>
    </tr>
  `).join('')

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F7F4EF;font-family:Georgia,serif">
  <div style="max-width:900px;margin:0 auto;padding:24px 16px">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#6B0F1A 0%,#8B1520 100%);border-radius:16px 16px 0 0;padding:32px 40px;text-align:center">
      <div style="display:inline-block;background:rgba(201,166,90,0.2);border:1px solid rgba(201,166,90,0.4);border-radius:8px;padding:4px 16px;margin-bottom:16px">
        <span style="color:#C9A65A;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase">Monitor de Licitações</span>
      </div>
      <h1 style="margin:0 0 8px;color:white;font-size:26px;font-weight:700">🔔 Novas Licitações Encontradas</h1>
      <p style="margin:0;color:rgba(255,255,255,0.75);font-size:14px">${new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>

    <!-- Conteúdo -->
    <div style="background:white;padding:32px 40px;border-left:1px solid #E8E0D5;border-right:1px solid #E8E0D5">
      <p style="margin:0 0 24px;color:#4A4A4A;font-size:15px;line-height:1.6">
        Encontramos <strong style="color:#6B0F1A">${licitacoes.length} licitação(ões)</strong> que correspondem às suas palavras-chave monitoradas.
      </p>

      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr style="background:#F7F4EF">
              <th style="padding:10px 8px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9AA0A6;border-bottom:2px solid #E8E0D5">Palavra-chave</th>
              <th style="padding:10px 8px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9AA0A6;border-bottom:2px solid #E8E0D5">Órgão</th>
              <th style="padding:10px 8px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9AA0A6;border-bottom:2px solid #E8E0D5">Objeto</th>
              <th style="padding:10px 8px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9AA0A6;border-bottom:2px solid #E8E0D5">Valor</th>
              <th style="padding:10px 8px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9AA0A6;border-bottom:2px solid #E8E0D5">Abertura</th>
              <th style="padding:10px 8px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9AA0A6;border-bottom:2px solid #E8E0D5">Link</th>
            </tr>
          </thead>
          <tbody>${linhas}</tbody>
        </table>
      </div>

      <div style="text-align:center;margin-top:32px">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display:inline-block;background:linear-gradient(135deg,#6B0F1A,#8B1520);color:white;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px">
          Ver todas no painel →
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#2C2C2C;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center">
      <p style="margin:0 0 4px;color:rgba(255,255,255,0.5);font-size:12px">© Matutta — Monitor de Licitações</p>
      <p style="margin:0;color:rgba(255,255,255,0.3);font-size:11px">Você recebe este e-mail porque monitorou palavras-chave no sistema.</p>
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

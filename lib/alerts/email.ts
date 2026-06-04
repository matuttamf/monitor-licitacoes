import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

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

export async function enviarAlertaEmail(licitacoes: LicitacaoAlerta[]): Promise<boolean> {
  const destinatarios = process.env.EMAIL_DESTINATARIOS!.split(',').map(e => e.trim())

  const linhasTabela = licitacoes.map(l => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #eee">${l.keyword}</td>
      <td style="padding:8px;border-bottom:1px solid #eee">${l.orgao}</td>
      <td style="padding:8px;border-bottom:1px solid #eee">${l.objeto.substring(0, 100)}${l.objeto.length > 100 ? '...' : ''}</td>
      <td style="padding:8px;border-bottom:1px solid #eee">${l.valor_estimado ? `R$ ${l.valor_estimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}</td>
      <td style="padding:8px;border-bottom:1px solid #eee">${l.data_abertura ?? '-'}</td>
      <td style="padding:8px;border-bottom:1px solid #eee"><a href="${l.url}">Ver edital</a></td>
    </tr>
  `).join('')

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:900px;margin:0 auto">
      <h2 style="color:#1d4ed8">Monitor de Licitações — ${new Date().toLocaleDateString('pt-BR')}</h2>
      <p>Encontramos <strong>${licitacoes.length} licitação(ões)</strong> que correspondem às suas palavras-chave.</p>

      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <thead>
          <tr style="background:#f3f4f6">
            <th style="padding:8px;text-align:left">Palavra-chave</th>
            <th style="padding:8px;text-align:left">Órgão</th>
            <th style="padding:8px;text-align:left">Objeto</th>
            <th style="padding:8px;text-align:left">Valor Estimado</th>
            <th style="padding:8px;text-align:left">Abertura</th>
            <th style="padding:8px;text-align:left">Link</th>
          </tr>
        </thead>
        <tbody>${linhasTabela}</tbody>
      </table>

      <p style="color:#6b7280;font-size:12px;margin-top:24px">
        Acesse o <a href="${process.env.NEXT_PUBLIC_APP_URL}">painel completo</a> para ver todas as licitações.
      </p>
    </div>
  `

  const { error } = await resend.emails.send({
    from: process.env.EMAIL_REMETENTE!,
    to: destinatarios,
    subject: `🔔 ${licitacoes.length} nova(s) licitação(ões) — ${new Date().toLocaleDateString('pt-BR')}`,
    html,
  })

  if (error) {
    console.error('Erro ao enviar e-mail:', error)
    return false
  }

  return true
}

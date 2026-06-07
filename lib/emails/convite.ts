import { Resend } from 'resend'

// Lazy — instanciado dentro da função para não quebrar no build (env vars só existem em runtime)
function getResend() { return new Resend(process.env.RESEND_API_KEY!) }

export async function enviarEmailConvite({
  emailConvidado,
  nomeOwner,
  empresaOwner,
  token,
}: {
  emailConvidado: string
  nomeOwner: string
  empresaOwner: string
  token: string
}): Promise<boolean> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://monitor-licitacoes-two.vercel.app'
  const link = `${appUrl}/cadastro?convite=${token}`
  const remetente = process.env.EMAIL_REMETENTE ?? 'Monitor de Licitações <noreply@monitordelicitacoes.com.br>'
  const quemConvidou = empresaOwner || nomeOwner || 'um usuário'

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FAF6F0;font-family:system-ui,sans-serif">
  <div style="max-width:560px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;border:1px solid #E5E1DB">

    <div style="background:#1A1A1C;padding:28px 32px;display:flex;align-items:center;gap:12px">
      <div style="width:36px;height:36px;border-radius:10px;background:#6B0F1A;display:flex;align-items:center;justify-content:center;color:#C9A65A;font-weight:700;font-size:11px;flex-shrink:0">ML</div>
      <span style="color:white;font-size:15px;font-weight:600">Monitor de Licitações</span>
    </div>

    <div style="padding:36px 32px">
      <p style="font-size:13px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#C9A65A;margin:0 0 12px">Convite de equipe</p>
      <h1 style="font-size:26px;font-weight:800;color:#1A1A1C;margin:0 0 16px;line-height:1.2">Você foi convidado para monitorar licitações</h1>
      <p style="font-size:15px;color:#6B7280;margin:0 0 28px;line-height:1.6">
        <strong style="color:#1A1A1C">${quemConvidou}</strong> está te convidando para acessar o painel do Monitor de Licitações. Você terá acesso completo à plataforma para monitorar editais públicos em todo o Brasil.
      </p>

      <div style="text-align:center;margin:32px 0">
        <a href="${link}" style="display:inline-block;background:#6B0F1A;color:white;font-size:15px;font-weight:700;padding:16px 36px;border-radius:12px;text-decoration:none">
          Aceitar convite →
        </a>
      </div>

      <div style="background:#FAF6F0;border-radius:12px;padding:16px 20px;margin:24px 0">
        <p style="font-size:13px;color:#6B7280;margin:0;line-height:1.6">
          ⏰ Este convite expira em <strong>7 dias</strong>. Se não reconhece este convite, ignore este e-mail com segurança.
        </p>
      </div>

      <p style="font-size:12px;color:#9AA0A6;margin:24px 0 0;line-height:1.6">
        Se o botão não funcionar, copie e cole este link no navegador:<br>
        <span style="color:#6B0F1A;word-break:break-all">${link}</span>
      </p>
    </div>

    <div style="background:#F5F2EE;padding:20px 32px;text-align:center">
      <p style="font-size:11px;color:#9AA0A6;margin:0">© ${new Date().getFullYear()} Monitor de Licitações</p>
    </div>
  </div>
</body>
</html>`

  const { error } = await getResend().emails.send({
    from: remetente,
    to: emailConvidado,
    subject: `${quemConvidou} te convidou para o Monitor de Licitações`,
    html,
  })

  if (error) {
    console.error('Erro ao enviar convite:', error)
    return false
  }
  return true
}

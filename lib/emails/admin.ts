import { Resend } from 'resend'

export async function notificarAdminNovoCadastro(
  emailUsuario: string,
  nomeUsuario?: string,
): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail) return

  const resend = new Resend(process.env.RESEND_API_KEY)
  const nome = nomeUsuario || emailUsuario
  const agora = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })

  await resend.emails.send({
    from: 'Monitor de Licitações <noreply@monitordelicitacoes.com.br>',
    to: adminEmail,
    subject: `🆕 Novo cadastro: ${nome}`,
    html: `
      <p><strong>Novo usuário cadastrado</strong></p>
      <p>👤 <strong>${nome}</strong><br>
      📧 ${emailUsuario}<br>
      🕐 ${agora}</p>
      <p><a href="https://monitordelicitacoes.com.br/admin">Ver no painel admin →</a></p>
    `,
  }).catch(err => console.error('[admin email] Erro:', err))
}

import { Resend } from 'resend'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://monitor-licitacoes-two.vercel.app'
const FROM = process.env.EMAIL_REMETENTE || 'onboarding@resend.dev'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY!)
}

// E-mail Dia 1: Boas-vindas
export async function enviarEmailBoasVindas(email: string, nome: string): Promise<void> {
  const resend = getResend()
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: '🎉 Bem-vindo ao Monitor de Licitações — veja como começar',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#FAF6F0">
        <div style="background:#1A1A1C;padding:32px;text-align:center">
          <div style="display:inline-block;background:#6B0F1A;color:#C9A65A;font-weight:bold;padding:8px 16px;border-radius:8px;font-size:14px;letter-spacing:1px">ML</div>
          <h1 style="color:white;font-size:24px;margin:16px 0 4px">Monitor de Licitações</h1>
          <p style="color:rgba(255,255,255,0.5);font-size:14px;margin:0">Alertas inteligentes de licitações públicas</p>
        </div>

        <div style="padding:32px">
          <h2 style="color:#1A1A1C;font-size:22px">Olá! Seja bem-vindo 🎉</h2>
          <p style="color:#4a4a4d;line-height:1.7">
            Sua conta foi criada com sucesso. Você tem <strong>7 dias grátis</strong> para testar o Monitor de Licitações sem nenhum compromisso.
          </p>

          <div style="background:white;border-radius:12px;padding:24px;margin:24px 0;border:1px solid #D5D2C8">
            <h3 style="color:#1A1A1C;margin-top:0">Primeiros passos:</h3>
            <ol style="color:#4a4a4d;line-height:2">
              <li><strong>Cadastre suas palavras-chave</strong> — os produtos que você vende (notebook, cadeira, ar condicionado...)</li>
              <li><strong>Aguarde o primeiro alerta</strong> — enviamos por e-mail e Telegram toda manhã</li>
              <li><strong>Acesse o painel</strong> — veja todas as licitações com match nas suas palavras</li>
            </ol>
          </div>

          <a href="${APP_URL}/palavras-chave" style="display:block;background:#6B0F1A;color:white;text-align:center;padding:16px;border-radius:12px;text-decoration:none;font-weight:bold;font-size:16px;margin-bottom:16px">
            Configurar palavras-chave agora →
          </a>

          <p style="color:#9AA0A6;font-size:13px;margin-top:24px;text-align:center">
            Dúvidas? Fale conosco pelo <a href="https://wa.me/5531998317066" style="color:#6B0F1A">WhatsApp</a>
          </p>
        </div>

        <div style="background:#1A1A1C;padding:16px;text-align:center">
          <p style="color:rgba(255,255,255,0.3);font-size:12px;margin:0">Monitor de Licitações · Matutta</p>
        </div>
      </div>
    `,
  })
}

// E-mail Dia 3: Engajamento
export async function enviarEmailDia3(email: string, totalLicitacoes: number): Promise<void> {
  const resend = getResend()
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `📋 ${totalLicitacoes > 0 ? `${totalLicitacoes} licitações encontradas para você` : 'Suas palavras-chave já estão ativas'}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#FAF6F0">
        <div style="background:#1A1A1C;padding:32px;text-align:center">
          <div style="display:inline-block;background:#6B0F1A;color:#C9A65A;font-weight:bold;padding:8px 16px;border-radius:8px;font-size:14px">ML</div>
        </div>

        <div style="padding:32px">
          ${totalLicitacoes > 0 ? `
            <h2 style="color:#1A1A1C">Encontramos ${totalLicitacoes} licitações para você 🎯</h2>
            <p style="color:#4a4a4d;line-height:1.7">
              Nos últimos dias, identificamos licitações que correspondem às suas palavras-chave. Acesse o painel para ver todas.
            </p>
          ` : `
            <h2 style="color:#1A1A1C">Seu monitor está ativo ✅</h2>
            <p style="color:#4a4a4d;line-height:1.7">
              Suas palavras-chave estão sendo monitoradas. Toda manhã verificamos milhares de editais em todo o Brasil e enviamos os que combinam com o que você vende.
            </p>
          `}

          <div style="background:#6B0F1A;border-radius:12px;padding:24px;margin:24px 0;text-align:center">
            <p style="color:rgba(255,255,255,0.7);margin:0 0 8px;font-size:14px">Cobertura do Monitor</p>
            <p style="color:white;font-size:28px;font-weight:bold;margin:0">5.500+</p>
            <p style="color:#C9A65A;margin:4px 0 0;font-size:14px">municípios monitorados diariamente</p>
          </div>

          <a href="${APP_URL}" style="display:block;background:#6B0F1A;color:white;text-align:center;padding:16px;border-radius:12px;text-decoration:none;font-weight:bold;font-size:16px;margin-bottom:16px">
            Ver licitações no painel →
          </a>
        </div>

        <div style="background:#1A1A1C;padding:16px;text-align:center">
          <p style="color:rgba(255,255,255,0.3);font-size:12px;margin:0">Monitor de Licitações · Matutta</p>
        </div>
      </div>
    `,
  })
}

// E-mail Dia 6: Urgência (trial expira amanhã)
export async function enviarEmailUrgencia(email: string): Promise<void> {
  const resend = getResend()
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: '⚠️ Seu período de teste expira amanhã — garanta seu acesso',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#FAF6F0">
        <div style="background:#1A1A1C;padding:32px;text-align:center">
          <div style="display:inline-block;background:#6B0F1A;color:#C9A65A;font-weight:bold;padding:8px 16px;border-radius:8px;font-size:14px">ML</div>
        </div>

        <div style="padding:32px">
          <h2 style="color:#1A1A1C">Seu teste expira amanhã ⚠️</h2>
          <p style="color:#4a4a4d;line-height:1.7">
            Amanhã seu período de teste gratuito encerra. Para continuar recebendo alertas de licitações, escolha um plano.
          </p>

          <div style="background:white;border-radius:12px;padding:24px;margin:24px 0;border:2px solid #6B0F1A">
            <h3 style="color:#6B0F1A;margin-top:0">Plano Basic — R$ 49,90/mês</h3>
            <ul style="color:#4a4a4d;line-height:2;padding-left:20px">
              <li>10 palavras-chave monitoradas</li>
              <li>Alertas diários por e-mail e Telegram</li>
              <li>Acesso ao painel com busca manual</li>
              <li>Cancele quando quiser</li>
            </ul>
          </div>

          <a href="${APP_URL}/assinar" style="display:block;background:#6B0F1A;color:white;text-align:center;padding:16px;border-radius:12px;text-decoration:none;font-weight:bold;font-size:16px;margin-bottom:16px">
            Assinar agora e continuar →
          </a>

          <p style="color:#9AA0A6;font-size:13px;margin-top:16px;text-align:center">
            Tem dúvidas? <a href="https://wa.me/5531998317066" style="color:#6B0F1A">Fale conosco no WhatsApp</a>
          </p>
        </div>

        <div style="background:#1A1A1C;padding:16px;text-align:center">
          <p style="color:rgba(255,255,255,0.3);font-size:12px;margin:0">Monitor de Licitações · Matutta</p>
        </div>
      </div>
    `,
  })
}

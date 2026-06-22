import { SESClient, SendRawEmailCommand } from '@aws-sdk/client-ses'

const ses = new SESClient({
  region: process.env.AWS_SES_REGION ?? 'us-east-1',
  credentials: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

interface SendEmailParams {
  from:    string
  to:      string
  subject: string
  html:    string
  text:    string
  headers?: Record<string, string>
}

export async function sendEmailSes({ from, to, subject, html, text, headers }: SendEmailParams): Promise<void> {
  const boundary = `boundary_${Date.now()}`

  const extraHeaders = headers
    ? Object.entries(headers).map(([k, v]) => `${k}: ${v}`).join('\r\n')
    : ''

  const raw = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    extraHeaders,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: quoted-printable',
    '',
    text,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: quoted-printable',
    '',
    html,
    '',
    `--${boundary}--`,
  ].join('\r\n')

  await ses.send(new SendRawEmailCommand({
    RawMessage: { Data: Buffer.from(raw) },
  }))
}

-- Sequência de follow-up para leads captados
-- emails_enviados: quantos e-mails de captação já foram enviados (0=nenhum, máx 3)
-- proximo_email_em: quando enviar o próximo follow-up (null = não enviar mais)
-- email_tentativas: quantas vezes enriquecer-emails tentou sem achar e-mail (para descartar após 3 tentativas)

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS emails_enviados    SMALLINT    NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS proximo_email_em   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS email_tentativas   SMALLINT    NOT NULL DEFAULT 0;

-- Migrar leads já enviados: marcar 1 e-mail enviado, agendar follow-up para D+4 a partir do envio
UPDATE leads
SET
  emails_enviados  = 1,
  proximo_email_em = COALESCE(enviado_em, NOW()) + INTERVAL '4 days'
WHERE status = 'enviado'
  AND emails_enviados = 0;

-- Índice para a query de follow-up (proximo_email_em <= now() AND emails_enviados < 3)
CREATE INDEX IF NOT EXISTS idx_leads_followup
  ON leads (proximo_email_em, emails_enviados)
  WHERE status = 'enviado' AND abriu_em IS NULL;

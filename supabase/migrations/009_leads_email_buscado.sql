-- Controle de quando o enriquecimento de e-mail foi tentado pela última vez
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS email_buscado_em timestamptz DEFAULT NULL;

CREATE INDEX IF NOT EXISTS leads_email_buscado_idx ON public.leads (email_buscado_em)
  WHERE email IS NULL AND status = 'invalido';

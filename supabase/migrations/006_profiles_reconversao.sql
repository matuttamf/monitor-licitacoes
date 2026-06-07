-- Rastrear envio do e-mail de reconversão para trials expirados
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS reconversao_email_em timestamptz DEFAULT NULL;

CREATE INDEX IF NOT EXISTS profiles_reconversao_idx ON public.profiles (reconversao_email_em)
  WHERE reconversao_email_em IS NULL;

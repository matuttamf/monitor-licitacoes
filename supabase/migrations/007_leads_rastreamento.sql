-- Rastreamento de abertura e clique em e-mails de captação
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS abriu_em   timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS clicou_em  timestamptz DEFAULT NULL;

CREATE INDEX IF NOT EXISTS leads_abriu_idx  ON public.leads (abriu_em)  WHERE abriu_em  IS NOT NULL;
CREATE INDEX IF NOT EXISTS leads_clicou_idx ON public.leads (clicou_em) WHERE clicou_em IS NOT NULL;

-- Tabela de motivos de cancelamento (churn)
CREATE TABLE IF NOT EXISTS public.cancelamentos (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email      text,
  plano      text,
  motivo     text NOT NULL,
  detalhe    text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cancelamentos DISABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS cancelamentos_created_idx ON public.cancelamentos (created_at DESC);

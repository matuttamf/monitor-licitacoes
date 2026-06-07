-- Migration: tabela de leads para captação automatizada
-- Aplicar via: Supabase Dashboard > SQL Editor

CREATE TABLE IF NOT EXISTS public.leads (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cnpj            varchar(14) NOT NULL UNIQUE,
  razao_social    text NOT NULL,
  nome_fantasia   text,
  email           text,
  telefone        text,
  municipio       text,
  uf              varchar(2),
  situacao        text,
  porte           text,
  cnae            text,
  -- Origem do lead (contrato PNCP)
  objeto          text,
  valor           numeric,
  data_contrato   date,
  -- Controle de envio
  status          text NOT NULL DEFAULT 'pendente'
                    CHECK (status IN ('pendente','enviado','erro','invalido','descadastrado')),
  enviado_em      timestamptz,
  erro_msg        text,
  -- Metadados
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS leads_status_idx  ON public.leads (status);
CREATE INDEX IF NOT EXISTS leads_email_idx   ON public.leads (email);
CREATE INDEX IF NOT EXISTS leads_uf_idx      ON public.leads (uf);
CREATE INDEX IF NOT EXISTS leads_created_idx ON public.leads (created_at DESC);

-- RLS desabilitado (tabela interna, acesso apenas via service_role no cron)
ALTER TABLE public.leads DISABLE ROW LEVEL SECURITY;

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.leads_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS leads_updated_at ON public.leads;
CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.leads_set_updated_at();

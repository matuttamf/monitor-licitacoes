-- Migration: campo origem e cnae_codigo nos leads
-- Aplicar via: Supabase Dashboard > SQL Editor

-- origem distingue como o lead foi coletado:
--   'participante' → coletado de contratos/propostas de licitações
--   'cnae'         → coletado da base de dados abertos da Receita Federal por CNAE similar
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS origem TEXT NOT NULL DEFAULT 'participante'
    CHECK (origem IN ('participante', 'cnae', 'manual')),
  ADD COLUMN IF NOT EXISTS cnae_codigo VARCHAR(10);

CREATE INDEX IF NOT EXISTS leads_origem_idx     ON public.leads (origem);
CREATE INDEX IF NOT EXISTS leads_cnae_codigo_idx ON public.leads (cnae_codigo);

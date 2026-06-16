-- Colunas para limite diário de buscas de preços (basic e trial: 10/dia)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS precos_buscas_dia      INT  NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS precos_buscas_dia_reset DATE NOT NULL DEFAULT CURRENT_DATE;

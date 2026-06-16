-- Contador de buscas de preços por mês (plano Basic: 20/mês)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS precos_buscas_mes     INT  NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS precos_buscas_reset_em DATE DEFAULT CURRENT_DATE;

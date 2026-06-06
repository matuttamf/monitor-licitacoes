-- Score de relevância no alerta (0–100, ferramenta interna, invisível ao usuário)
ALTER TABLE alertas
  ADD COLUMN IF NOT EXISTS score numeric(5,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS score_keyword  numeric(5,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS score_local    numeric(5,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS score_valor    numeric(5,2) NOT NULL DEFAULT 0;

-- Índice para o cron de alertas ordenar por score desc eficientemente
CREATE INDEX IF NOT EXISTS alertas_score_idx ON alertas (score DESC);

-- Valor mínimo de interesse declarado pelo usuário (0 = sem filtro)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS min_valor_interesse numeric NOT NULL DEFAULT 0;

COMMENT ON COLUMN alertas.score IS 'Score 0-100 de relevância. Interno — nunca exibido ao usuário.';
COMMENT ON COLUMN profiles.min_valor_interesse IS 'Valor mínimo (R$) de licitação de interesse declarado pelo usuário.';

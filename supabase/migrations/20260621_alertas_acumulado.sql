-- Adiciona campos denormalizados para acumular stats mesmo após licitações serem deletadas

-- 1. Novos campos
ALTER TABLE alertas ADD COLUMN IF NOT EXISTS valor_estimado NUMERIC;
ALTER TABLE alertas ADD COLUMN IF NOT EXISTS licitacao_id_str TEXT;

-- 2. Popula a partir dos dados atuais
UPDATE alertas a
SET
  licitacao_id_str = a.licitacao_id::TEXT,
  valor_estimado   = (SELECT l.valor_estimado FROM licitacoes l WHERE l.id = a.licitacao_id);

-- 3. Muda FK de CASCADE para SET NULL (preserva alertas quando licitação é removida)
ALTER TABLE alertas DROP CONSTRAINT IF EXISTS alertas_licitacao_id_fkey;
ALTER TABLE alertas ALTER COLUMN licitacao_id DROP NOT NULL;
ALTER TABLE alertas ADD CONSTRAINT alertas_licitacao_id_fkey
  FOREIGN KEY (licitacao_id) REFERENCES licitacoes(id) ON DELETE SET NULL;

-- 4. Índice para licitacao_id_str (usado no stats/roi para deduplicação)
CREATE INDEX IF NOT EXISTS alertas_licitacao_str_profile_idx ON alertas(profile_id, licitacao_id_str);

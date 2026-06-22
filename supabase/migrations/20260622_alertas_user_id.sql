-- Adiciona user_id direto na tabela alertas para não depender do join com keywords
-- Garante que deleção de keyword não zera as stats acumuladas do usuário

ALTER TABLE alertas ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Popular retroativamente via join com keywords
UPDATE alertas a
SET user_id = k.user_id
FROM keywords k
WHERE a.keyword_id = k.id
  AND a.user_id IS NULL;

-- Índice para stats/roi
CREATE INDEX IF NOT EXISTS alertas_user_id_idx ON alertas(user_id);

-- Adiciona colunas de desconto à tabela campanhas
-- Usadas em api/admin/campanhas POST/PATCH para campanhas com desconto
ALTER TABLE campanhas
  ADD COLUMN IF NOT EXISTS desconto_percentual integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS desconto_meses      integer NOT NULL DEFAULT 0;

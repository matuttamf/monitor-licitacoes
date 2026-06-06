-- Adiciona coluna regiao à tabela keywords
-- Valores possíveis: 'brasil' (padrão = qualquer região), 'norte', 'nordeste',
-- 'sudeste', 'sul', 'centro_oeste', ou UF específica (ex: 'SP', 'MG', 'RJ')
ALTER TABLE keywords
  ADD COLUMN IF NOT EXISTS regiao text NOT NULL DEFAULT 'brasil';

COMMENT ON COLUMN keywords.regiao IS
  'Filtro geográfico: brasil (qualquer), norte, nordeste, sudeste, sul, centro_oeste ou UF (ex: SP)';

-- Converte keywords.regiao de text para text[] (multi-região)
-- Mantém retrocompatibilidade: 'brasil' vira '{brasil}'
ALTER TABLE keywords
  ALTER COLUMN regiao TYPE text[]
  USING ARRAY[regiao];

ALTER TABLE keywords
  ALTER COLUMN regiao SET DEFAULT '{brasil}';

COMMENT ON COLUMN keywords.regiao IS
  'Regiões de interesse: ["brasil"] = sem filtro, ou combinação de regioes/UFs. Ex: ["sul","RJ"]';

-- Converte keywords.regiao de text para text[] (multi-região)
-- Mantém retrocompatibilidade: 'brasil' vira '{brasil}'

-- 1. Remove o default antigo (text) antes de mudar o tipo
ALTER TABLE keywords ALTER COLUMN regiao DROP DEFAULT;

-- 2. Muda o tipo, convertendo valores existentes para array
ALTER TABLE keywords
  ALTER COLUMN regiao TYPE text[]
  USING ARRAY[regiao];

-- 3. Define o novo default como array
ALTER TABLE keywords
  ALTER COLUMN regiao SET DEFAULT ARRAY['brasil'];

COMMENT ON COLUMN keywords.regiao IS
  'Regiões de interesse: ["brasil"] = sem filtro, ou combinação de regioes/UFs. Ex: ["sul","RJ"]';

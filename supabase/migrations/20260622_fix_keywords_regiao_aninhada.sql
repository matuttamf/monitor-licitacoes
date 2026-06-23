-- Corrige keywords com regiao aninhada em triplo para todos os usuários
-- Padrão errado: [[["nordeste","sudeste",...]]] → correto: ["nordeste","sudeste",...]
UPDATE keywords
SET regiao = '["brasil"]'::jsonb
WHERE jsonb_typeof(regiao->0) = 'array';

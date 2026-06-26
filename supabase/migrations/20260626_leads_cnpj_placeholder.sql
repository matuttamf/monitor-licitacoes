-- Marca como inválidos leads cuja razão social é o próprio CNPJ (sem nome real).
-- Esses registros não têm nome utilizável para e-mail de captação.
--
-- Casos cobertos:
--   1. razao_social = 14 dígitos raw          ex: "14304386000100"
--   2. razao_social = CNPJ formatado completo  ex: "14.304.386/0001-00"
--   3. razao_social = raiz CNPJ (8 dígitos)    ex: "14304386"
--   4. razao_social = raiz formatada           ex: "14.304.386"
--   5. razao_social == cnpj do próprio lead (normalizado, sem pontuação)
--   6. razao_social == raiz do cnpj do próprio lead
--
-- NÃO afeta MEI com nome após o CNPJ ("14.304.386 REGELIA RODRIGUES") —
-- esses são limpos pelo limparNome() no disparo e permanecem aptos.

UPDATE leads
SET
  status   = 'invalido',
  erro_msg = 'cnpj_como_razao_social'
WHERE
  status IN ('pendente', 'enviado', 'erro')
  AND razao_social IS NOT NULL
  AND (
    -- 14 dígitos raw
    razao_social ~ '^\d{14}$'
    -- CNPJ formatado completo: XX.XXX.XXX/XXXX-XX
    OR razao_social ~ '^\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}$'
    -- Raiz CNPJ (8 dígitos raw)
    OR razao_social ~ '^\d{8}$'
    -- Raiz CNPJ formatada: XX.XXX.XXX
    OR razao_social ~ '^\d{2}\.\d{3}\.\d{3}$'
    -- razao_social normalizada (só dígitos) == cnpj do lead normalizado
    OR regexp_replace(razao_social, '\D', '', 'g') = regexp_replace(cnpj, '\D', '', 'g')
    -- razao_social normalizada == raiz do cnpj (8 primeiros dígitos)
    OR regexp_replace(razao_social, '\D', '', 'g') = left(regexp_replace(cnpj, '\D', '', 'g'), 8)
  );

-- Índice parcial para acelerar queries de paginação que excluem inválidos
-- (provavelmente já existe, mas idempotente com IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS leads_cnpj_placeholder_idx
  ON leads (id)
  WHERE status = 'invalido' AND erro_msg = 'cnpj_como_razao_social';

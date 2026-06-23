-- Corrige URLs rasas/homepages em licitações do PNCP
-- Reconstrói o deep link correto a partir do numero_edital (formato: {cnpj14}-{ano4}-{seq6})
-- URL correta: https://pncp.gov.br/app/editais/{cnpj}/{ano}/{seq}
--
-- Verificar quantas linhas serão afetadas antes de rodar o UPDATE:
-- SELECT count(*), fonte, substring(url from 1 for 60)
-- FROM licitacoes
-- WHERE fonte = 'PNCP'
--   AND numero_edital ~ '^[0-9]{14}-[0-9]{4}-[0-9]{6}$'
--   AND (
--     url ~ '^https?://[^/]+/?$'
--     OR url ~* '/(default|index|home|inicio|login)(\.aspx|\.html|\.php)?/?$'
--     OR length(regexp_replace(url, '^https?://[^/]+', '')) <= 1
--   )
-- GROUP BY fonte, substring(url from 1 for 60)
-- ORDER BY count(*) DESC;

UPDATE licitacoes
SET url = 'https://pncp.gov.br/app/editais/'
       || split_part(numero_edital, '-', 1)   -- cnpj (14 dígitos)
       || '/' || split_part(numero_edital, '-', 2)   -- ano (4 dígitos)
       || '/' || split_part(numero_edital, '-', 3)   -- sequencial (6 dígitos, zero-padded)
WHERE fonte = 'PNCP'
  -- Apenas registros com numero_edital no formato padrão do PNCP
  AND numero_edital ~ '^[0-9]{14}-[0-9]{4}-[0-9]{6}$'
  -- URL com path raso: homepage, /Default.aspx, /index.html etc.
  AND (
    url ~ '^https?://[^/]+/?$'
    OR url ~* '/(default|index|home|inicio|login)(\.aspx|\.html|\.php)?/?$'
    OR length(regexp_replace(url, '^https?://[^/]+', '')) <= 1
  );

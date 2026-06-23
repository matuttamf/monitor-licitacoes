-- Fix v3: corrige registros com formato {cnpj14}-{orgaoId}-{seq6}/{ano4}
-- Exemplo: 39547500000183-1-000030/2026
-- URL correta: https://pncp.gov.br/app/editais/39547500000183/2026/000030

UPDATE licitacoes
SET url = 'https://pncp.gov.br/app/editais/'
       || split_part(numero_edital, '-', 1)                                       -- cnpj (14 dígitos)
       || '/' || split_part(split_part(numero_edital, '-', 3), '/', 2)            -- ano (após /)
       || '/' || split_part(split_part(numero_edital, '-', 3), '/', 1)            -- seq (antes de /)
WHERE fonte = 'PNCP'
  AND url = 'https://pncp.gov.br/app/editais'
  AND numero_edital ~ '^[0-9]{14}-[0-9]+-[0-9]+/[0-9]{4}$';

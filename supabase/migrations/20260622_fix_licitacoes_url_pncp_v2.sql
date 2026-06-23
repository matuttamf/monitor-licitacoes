-- Fix v2: cobre registros que a v1 não pegou por formato diferente de numero_edital
-- Para registros PNCP com URL rasa, tenta reconstruir o deep link ou usa fallback genérico

-- Passo 1: formato padrão {cnpj14}-{ano4}-{seq6}  (já coberto pela v1, idempotente)
UPDATE licitacoes
SET url = 'https://pncp.gov.br/app/editais/'
       || split_part(numero_edital, '-', 1)
       || '/' || split_part(numero_edital, '-', 2)
       || '/' || split_part(numero_edital, '-', 3)
WHERE fonte = 'PNCP'
  AND numero_edital ~ '^[0-9]{14}-[0-9]{4}-[0-9]{6}$'
  AND (
    url ~ '^https?://[^/]+/?$'
    OR url ~* '/(default|index|home|inicio|login)(\.aspx|\.html|\.php)?/?$'
    OR length(regexp_replace(url, '^https?://[^/]+', '')) <= 1
  );

-- Passo 2: formato de fallback {ano4}-{cnpj14}-{seq} (ex: 2026-07359491000110-1)
UPDATE licitacoes
SET url = 'https://pncp.gov.br/app/editais/'
       || split_part(numero_edital, '-', 2)                          -- cnpj
       || '/' || split_part(numero_edital, '-', 1)                   -- ano
       || '/' || lpad(split_part(numero_edital, '-', 3), 6, '0')    -- seq zero-padded
WHERE fonte = 'PNCP'
  AND numero_edital ~ '^[0-9]{4}-[0-9]{14}-[0-9]+$'
  AND (
    url ~ '^https?://[^/]+/?$'
    OR url ~* '/(default|index|home|inicio|login)(\.aspx|\.html|\.php)?/?$'
    OR length(regexp_replace(url, '^https?://[^/]+', '')) <= 1
  );

-- Passo 3: qualquer outro PNCP com URL rasa que não bateu nos formatos acima
-- aponta para o portal PNCP genérico (melhor que homepage de estado)
UPDATE licitacoes
SET url = 'https://pncp.gov.br/app/editais'
WHERE fonte = 'PNCP'
  AND (
    url ~ '^https?://[^/]+/?$'
    OR url ~* '/(default|index|home|inicio|login)(\.aspx|\.html|\.php)?/?$'
    OR length(regexp_replace(url, '^https?://[^/]+', '')) <= 1
  );

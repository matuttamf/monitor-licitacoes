-- Correção de segurança: as policies "service_full"/"service_full_pagamentos"
-- usavam USING(true) SEM cláusula TO, o que aplica a TODOS os roles (anon +
-- authenticated) — abrindo leitura/escrita de TODOS os afiliados (nome, e-mail,
-- CNPJ, PIX, comissões, NF) para qualquer um com a chave anon pública.
-- O service_role IGNORA RLS, então essas policies eram desnecessárias e perigosas.
--
-- Removendo-as, sobram apenas as policies de SELECT do próprio afiliado
-- (afiliado_le_proprio / afiliado_le_pagamentos). Todas as operações do app
-- continuam via service_role (que ignora RLS).

DROP POLICY IF EXISTS "service_full"            ON afiliados;
DROP POLICY IF EXISTS "service_full_pagamentos" ON afiliado_pagamentos;

-- Hardening: search_path fixo na função SECURITY DEFINER (evita sequestro de path)
CREATE OR REPLACE FUNCTION incrementar_cliques_campanha(campanha_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE campanhas SET cliques = cliques + 1 WHERE id = campanha_id;
$$;

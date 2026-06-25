-- Auto-promoção de leads recuperáveis: empresas ATIVAS, com e-mail e cadastro
-- completo (segmento + município + UF) que ficaram presas em status='invalido'.
-- Promove em lotes (p_limite) para o cron drenar sem estourar timeout. Usa o
-- índice parcial leads_recuperaveis_idx (criado à parte) → cada lote é rápido.
CREATE OR REPLACE FUNCTION promover_leads_aptos(p_limite integer DEFAULT 5000)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
SET statement_timeout = '55s'
AS $$
  WITH alvo AS (
    SELECT id FROM leads
    WHERE status='invalido' AND situacao='ATIVA'
      AND email IS NOT NULL AND email <> ''
      AND segmento IS NOT NULL AND municipio IS NOT NULL AND uf IS NOT NULL
    LIMIT p_limite
  ), upd AS (
    UPDATE leads l SET status='pendente'
    FROM alvo WHERE l.id = alvo.id
    RETURNING 1
  )
  SELECT count(*)::integer FROM upd;
$$;

REVOKE ALL ON FUNCTION promover_leads_aptos(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION promover_leads_aptos(integer) TO service_role;

-- Índice que torna a promoção (e a recuperação manual) instantânea.
-- CONCURRENTLY não pode rodar dentro de transação; se o editor reclamar,
-- rode esta linha separadamente. IF NOT EXISTS evita erro se já criou antes.
CREATE INDEX IF NOT EXISTS leads_recuperaveis_idx
ON leads (id)
WHERE status='invalido' AND situacao='ATIVA' AND email IS NOT NULL
  AND segmento IS NOT NULL AND municipio IS NOT NULL AND uf IS NOT NULL;

-- Funções de paginação cursor com statement_timeout próprio (55s).
-- Rodar no Supabase SQL Editor antes de executar os scripts de enriquecimento bulk.

-- Paginação geral: todos os CNPJs da base (para enriquecer-bulk-rfb)
CREATE OR REPLACE FUNCTION get_cnpjs_page(last_id uuid, page_size int DEFAULT 1000)
RETURNS TABLE(id uuid, cnpj text)
LANGUAGE sql SECURITY DEFINER
SET statement_timeout = '55s'
AS $$
  SELECT id, cnpj FROM leads WHERE id > last_id ORDER BY id ASC LIMIT page_size;
$$;

-- Paginação filtrada: CNPJs sem e-mail (para enriquecer-emails-rfb)
CREATE OR REPLACE FUNCTION get_cnpjs_sem_email_page(last_id uuid, page_size int DEFAULT 1000)
RETURNS TABLE(id uuid, cnpj text)
LANGUAGE sql SECURITY DEFINER
SET statement_timeout = '55s'
AS $$
  SELECT id, cnpj FROM leads
  WHERE id > last_id
    AND (email IS NULL OR email = '')
  ORDER BY id ASC
  LIMIT page_size;
$$;

-- Paginação filtrada: CNPJs SEM município (para o backfill de município).
-- Conforme o pipeline preenche município, os leads saem deste filtro e o cursor
-- avança — diferente do get_cnpjs_page (sem filtro), que reprocessaria os mesmos.
-- enable_seqscan=off força o planner a usar o índice parcial leads_sem_municipio_idx.
CREATE OR REPLACE FUNCTION get_cnpjs_sem_municipio_page(last_id uuid, page_size int DEFAULT 1000)
RETURNS TABLE(id uuid, cnpj text)
LANGUAGE plpgsql SECURITY DEFINER
SET statement_timeout = '300s'
SET enable_seqscan = off
AS $$
BEGIN
  RETURN QUERY
  SELECT l.id, l.cnpj FROM leads l
  WHERE l.id > last_id
    AND l.municipio IS NULL
  ORDER BY l.id ASC
  LIMIT page_size;
END;
$$;

GRANT EXECUTE ON FUNCTION get_cnpjs_page(uuid, int) TO service_role;
GRANT EXECUTE ON FUNCTION get_cnpjs_sem_email_page(uuid, int) TO service_role;
GRANT EXECUTE ON FUNCTION get_cnpjs_sem_municipio_page(uuid, int) TO service_role;

-- Índice COVERING (id + cnpj) para a paginação rodar como index-only scan —
-- sem ir ao heap buscar o cnpj (essencial quando o I/O do disco está limitado).
-- Recriar assim se o anterior (só id) estiver causando timeout:
--   DROP INDEX IF EXISTS leads_sem_municipio_idx;
--   CREATE INDEX CONCURRENTLY leads_sem_municipio_idx
--     ON leads (id) INCLUDE (cnpj) WHERE municipio IS NULL;
--   ANALYZE leads;   -- atualiza estatísticas p/ o planner escolher o índice

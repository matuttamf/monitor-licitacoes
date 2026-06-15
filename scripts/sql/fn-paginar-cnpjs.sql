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

GRANT EXECUTE ON FUNCTION get_cnpjs_page(uuid, int) TO service_role;
GRANT EXECUTE ON FUNCTION get_cnpjs_sem_email_page(uuid, int) TO service_role;

-- Função para bulk UPDATE de leads a partir de dados RFB
-- Executar UMA VEZ no Supabase SQL Editor antes de rodar enriquecer-bulk-rfb.ts
--
-- Atualiza até 1000 leads por chamada via RPC.
-- Preserva valores existentes quando o RFB não tem dado melhor.
-- Não altera: status, municipio, telefone, id, created_at.

CREATE OR REPLACE FUNCTION enriquecer_bulk_rfb(batch JSONB)
RETURNS INTEGER
LANGUAGE SQL
SECURITY DEFINER
AS $$
  WITH upd AS (
    UPDATE leads l
    SET
      razao_social  = CASE
                        WHEN u->>'razao_social' IS NOT NULL AND u->>'razao_social' != ''
                          AND (l.razao_social IS NULL OR l.razao_social ~ '^\d+$')
                        THEN u->>'razao_social'
                        ELSE l.razao_social
                      END,
      nome_fantasia = COALESCE(NULLIF(u->>'nome_fantasia', ''), l.nome_fantasia),
      situacao      = COALESCE(NULLIF(u->>'situacao', ''), l.situacao),
      cnae_codigo   = COALESCE(NULLIF(u->>'cnae_codigo', ''), l.cnae_codigo),
      uf            = COALESCE(NULLIF(u->>'uf', ''), l.uf),
      porte         = COALESCE(NULLIF(u->>'porte', ''), l.porte),
      email         = CASE
                        WHEN l.email IS NULL AND u->>'email' IS NOT NULL AND u->>'email' != ''
                        THEN u->>'email'
                        ELSE l.email
                      END
    FROM jsonb_array_elements(batch) AS u
    WHERE l.cnpj = u->>'cnpj'
    RETURNING 1
  )
  SELECT COUNT(*)::INTEGER FROM upd;
$$;

-- Garante que apenas o service_role pode chamar (segurança)
REVOKE ALL ON FUNCTION enriquecer_bulk_rfb(JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION enriquecer_bulk_rfb(JSONB) TO service_role;

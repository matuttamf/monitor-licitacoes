-- RPC para stats de ROI do usuário — COUNT DISTINCT no banco
-- Evita trazer todas as linhas para JS (Supabase limita 1000 sem limit explícito)
CREATE OR REPLACE FUNCTION stats_roi_usuario(p_user_id uuid)
RETURNS json
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'total_licitacoes', COUNT(DISTINCT licitacao_id_str),
    'volume_monitorado', COALESCE(SUM(DISTINCT CASE WHEN licitacao_id_str IS NOT NULL THEN valor_estimado END), 0)
  )
  FROM alertas
  WHERE user_id = p_user_id
    AND licitacao_id_str IS NOT NULL;
$$;

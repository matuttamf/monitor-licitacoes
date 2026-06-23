-- RPC para buscar licitações do usuário evitando .in() com centenas de IDs
-- Faz o JOIN alertas→licitacoes no banco, com paginação e filtros
CREATE OR REPLACE FUNCTION buscar_licitacoes_usuario(
  p_user_id    uuid,
  p_pagina     int     DEFAULT 1,
  p_por_pagina int     DEFAULT 20,
  p_ordenar    text    DEFAULT 'valor',
  p_ufs        text[]  DEFAULT NULL,
  p_valor_min  numeric DEFAULT NULL,
  p_valor_max  numeric DEFAULT NULL,
  p_fonte      text    DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_offset      int  := (p_pagina - 1) * p_por_pagina;
  v_total       bigint;
  v_volume      numeric;
  v_data        json;
BEGIN
  -- Total de licitações distintas que atendem os filtros
  SELECT COUNT(DISTINCT l.id) INTO v_total
  FROM licitacoes l
  JOIN alertas a ON a.licitacao_id = l.id
  WHERE a.user_id = p_user_id
    AND (p_ufs       IS NULL OR l.estado          = ANY(p_ufs))
    AND (p_valor_min IS NULL OR l.valor_estimado  >= p_valor_min)
    AND (p_valor_max IS NULL OR l.valor_estimado  <= p_valor_max)
    AND (p_fonte     IS NULL OR l.fonte            = p_fonte);

  -- Volume total (sem paginação)
  SELECT COALESCE(SUM(sub.valor_estimado), 0) INTO v_volume
  FROM (
    SELECT DISTINCT l.id, l.valor_estimado
    FROM licitacoes l
    JOIN alertas a ON a.licitacao_id = l.id
    WHERE a.user_id = p_user_id
      AND l.valor_estimado IS NOT NULL
      AND (p_ufs       IS NULL OR l.estado         = ANY(p_ufs))
      AND (p_valor_min IS NULL OR l.valor_estimado >= p_valor_min)
      AND (p_valor_max IS NULL OR l.valor_estimado <= p_valor_max)
      AND (p_fonte     IS NULL OR l.fonte           = p_fonte)
  ) sub;

  -- Página de licitações com keywords associadas
  SELECT COALESCE(json_agg(row_to_json(r)), '[]'::json) INTO v_data
  FROM (
    SELECT
      l.id, l.fonte, l.orgao, l.objeto, l.valor_estimado,
      l.data_abertura, l.url, l.estado, l.cidade, l.coletado_em,
      (
        SELECT COALESCE(json_agg(DISTINCT jsonb_build_object(
          'keywords', jsonb_build_object('termo', k.termo)
        )), '[]'::json)
        FROM alertas a2
        JOIN keywords k ON k.id = a2.keyword_id
        WHERE a2.licitacao_id = l.id
          AND a2.user_id = p_user_id
          AND k.ativo = true
      ) AS alertas
    FROM (
      SELECT DISTINCT l2.id, l2.fonte, l2.orgao, l2.objeto, l2.valor_estimado,
        l2.data_abertura, l2.url, l2.estado, l2.cidade, l2.coletado_em
      FROM licitacoes l2
      JOIN alertas a ON a.licitacao_id = l2.id
      WHERE a.user_id = p_user_id
        AND (p_ufs       IS NULL OR l2.estado          = ANY(p_ufs))
        AND (p_valor_min IS NULL OR l2.valor_estimado  >= p_valor_min)
        AND (p_valor_max IS NULL OR l2.valor_estimado  <= p_valor_max)
        AND (p_fonte     IS NULL OR l2.fonte            = p_fonte)
      ORDER BY
        CASE WHEN p_ordenar = 'valor'    THEN l2.valor_estimado       END DESC NULLS LAST,
        CASE WHEN p_ordenar = 'menor'    THEN l2.valor_estimado       END ASC  NULLS LAST,
        CASE WHEN p_ordenar = 'recente'  THEN EXTRACT(EPOCH FROM l2.coletado_em)  END DESC NULLS LAST,
        CASE WHEN p_ordenar = 'abertura' THEN l2.data_abertura::text  END ASC  NULLS LAST,
        l2.coletado_em DESC
      LIMIT  p_por_pagina
      OFFSET v_offset
    ) l
  ) r;

  RETURN json_build_object(
    'data',        v_data,
    'total',       v_total,
    'pagina',      p_pagina,
    'paginas',     GREATEST(1, CEIL(v_total::numeric / p_por_pagina)),
    'volumeTotal', v_volume
  );
END;
$$;

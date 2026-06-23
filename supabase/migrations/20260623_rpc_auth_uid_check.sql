-- Segurança: impede que usuário autenticado passe p_user_id de outro usuário
-- Ambas as funções usam SECURITY DEFINER — sem essa checagem qualquer usuário
-- autenticado poderia ver dados alheios chamando a RPC diretamente pelo client.

CREATE OR REPLACE FUNCTION stats_roi_usuario(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  RETURN (
    SELECT json_build_object(
      'total_licitacoes', COUNT(DISTINCT licitacao_id_str),
      'volume_monitorado', COALESCE(SUM(DISTINCT CASE WHEN licitacao_id_str IS NOT NULL THEN valor_estimado END), 0)
    )
    FROM alertas
    WHERE user_id = p_user_id
      AND licitacao_id_str IS NOT NULL
  );
END;
$$;

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
  v_offset int  := (p_pagina - 1) * p_por_pagina;
  v_total  bigint;
  v_volume numeric;
  v_data   json;
BEGIN
  IF auth.uid() IS NOT NULL AND auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  SELECT COUNT(DISTINCT l.id) INTO v_total
  FROM licitacoes l
  JOIN alertas a ON a.licitacao_id = l.id
  WHERE a.user_id = p_user_id
    AND (p_ufs       IS NULL OR l.estado         = ANY(p_ufs))
    AND (p_valor_min IS NULL OR l.valor_estimado >= p_valor_min)
    AND (p_valor_max IS NULL OR l.valor_estimado <= p_valor_max)
    AND (p_fonte     IS NULL OR l.fonte           = p_fonte);

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

  SELECT COALESCE(json_agg(row_to_json(r)), '[]'::json) INTO v_data
  FROM (
    SELECT
      o.id, o.fonte, o.orgao, o.objeto, o.valor_estimado,
      o.data_abertura, o.url, o.estado, o.cidade, o.coletado_em,
      (
        SELECT COALESCE(json_agg(DISTINCT jsonb_build_object(
          'keywords', jsonb_build_object('termo', k.termo)
        )), '[]'::json)
        FROM alertas a2
        JOIN keywords k ON k.id = a2.keyword_id
        WHERE a2.licitacao_id = o.id
          AND a2.user_id = p_user_id
          AND k.ativo = true
      ) AS alertas
    FROM (
      SELECT * FROM (
        SELECT DISTINCT l.id, l.fonte, l.orgao, l.objeto, l.valor_estimado,
          l.data_abertura, l.url, l.estado, l.cidade, l.coletado_em
        FROM licitacoes l
        JOIN alertas a ON a.licitacao_id = l.id
        WHERE a.user_id = p_user_id
          AND (p_ufs       IS NULL OR l.estado         = ANY(p_ufs))
          AND (p_valor_min IS NULL OR l.valor_estimado >= p_valor_min)
          AND (p_valor_max IS NULL OR l.valor_estimado <= p_valor_max)
          AND (p_fonte     IS NULL OR l.fonte           = p_fonte)
      ) base
      ORDER BY
        CASE WHEN p_ordenar = 'valor'    THEN base.valor_estimado                     END DESC NULLS LAST,
        CASE WHEN p_ordenar = 'menor'    THEN base.valor_estimado                     END ASC  NULLS LAST,
        CASE WHEN p_ordenar = 'recente'  THEN EXTRACT(EPOCH FROM base.coletado_em)    END DESC NULLS LAST,
        CASE WHEN p_ordenar = 'abertura' THEN base.data_abertura::text                END ASC  NULLS LAST,
        base.coletado_em DESC
      LIMIT  p_por_pagina
      OFFSET v_offset
    ) o
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

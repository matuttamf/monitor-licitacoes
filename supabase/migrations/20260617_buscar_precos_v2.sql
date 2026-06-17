-- v2: adiciona cnpj_orgao/ano_compra/seq_compra para link PNCP
--     e stats_precos para cálculo dos últimos 12 meses

-- DROP obrigatório pois o RETURNS TABLE mudou
DROP FUNCTION IF EXISTS buscar_precos(text,text,date,date,integer,integer);
DROP FUNCTION IF EXISTS stats_precos(text,text,date,date);

CREATE OR REPLACE FUNCTION buscar_precos(
  p_termo   TEXT,
  p_estado  TEXT    DEFAULT NULL,
  p_inicio  DATE    DEFAULT NULL,
  p_fim     DATE    DEFAULT NULL,
  p_limite  INT     DEFAULT 50,
  p_offset  INT     DEFAULT 0
)
RETURNS TABLE(
  descricao_item TEXT,
  orgao          TEXT,
  estado         TEXT,
  municipio      TEXT,
  valor_unitario NUMERIC,
  nome_vencedor  TEXT,
  cnpj_vencedor  TEXT,
  unidade_medida TEXT,
  data_resultado DATE,
  score          FLOAT,
  cnpj_orgao     TEXT,
  ano_compra     INT,
  seq_compra     INT,
  fonte          TEXT
)
LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  v_query  tsquery;
  v_termo  TEXT := upper(trim(p_termo));
BEGIN
  BEGIN
    v_query := plainto_tsquery('portuguese', p_termo);
  EXCEPTION WHEN OTHERS THEN
    v_query := NULL;
  END;

  RETURN QUERY
  SELECT
    r.descricao_item,
    r.orgao,
    r.estado,
    r.municipio,
    r.valor_unitario,
    r.nome_vencedor,
    r.cnpj_vencedor,
    r.unidade_medida,
    r.data_resultado,
    CAST(
      coalesce(similarity(upper(r.descricao_item), v_termo), 0) * 0.65 +
      CASE WHEN v_query IS NOT NULL
           THEN ts_rank(r.tsv, v_query) * 0.35
           ELSE 0 END
    AS FLOAT) AS score,
    r.cnpj_orgao,
    r.ano_compra,
    r.seq_compra,
    r.fonte
  FROM resultados_itens r
  WHERE (
    (v_query IS NOT NULL AND r.tsv @@ v_query)
    OR similarity(upper(r.descricao_item), v_termo) > 0.22
  )
  AND (p_estado IS NULL OR r.estado = p_estado)
  AND (p_inicio IS NULL OR r.data_resultado >= p_inicio)
  AND (p_fim    IS NULL OR r.data_resultado <= p_fim)
  ORDER BY score DESC, r.data_resultado DESC NULLS LAST
  LIMIT  p_limite
  OFFSET p_offset;
END;
$$;

-- stats_precos agora aceita p_inicio opcional para filtrar período
CREATE OR REPLACE FUNCTION stats_precos(
  p_termo   TEXT,
  p_estado  TEXT  DEFAULT NULL,
  p_inicio  DATE  DEFAULT NULL,
  p_fim     DATE  DEFAULT NULL
)
RETURNS TABLE(
  total   BIGINT,
  minimo  NUMERIC,
  maximo  NUMERIC,
  media   NUMERIC,
  mediana NUMERIC
)
LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  v_query tsquery;
  v_termo TEXT := upper(trim(p_termo));
BEGIN
  BEGIN
    v_query := plainto_tsquery('portuguese', p_termo);
  EXCEPTION WHEN OTHERS THEN
    v_query := NULL;
  END;

  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT,
    MIN(r.valor_unitario),
    MAX(r.valor_unitario),
    ROUND(AVG(r.valor_unitario), 2),
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY r.valor_unitario)
  FROM resultados_itens r
  WHERE (
    (v_query IS NOT NULL AND r.tsv @@ v_query)
    OR similarity(r.descricao_item, v_termo) > 0.22
  )
  AND (p_estado IS NULL OR r.estado = p_estado)
  AND (p_inicio IS NULL OR r.data_resultado >= p_inicio)
  AND (p_fim    IS NULL OR r.data_resultado <= p_fim);
END;
$$;

GRANT EXECUTE ON FUNCTION buscar_precos TO authenticated;
GRANT EXECUTE ON FUNCTION stats_precos  TO authenticated;

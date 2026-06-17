-- Adiciona filtro de score mínimo (>=0.15) para remover matches periféricos
-- (ex: "CARTÃO DE MEMÓRIA PARA NOTEBOOK" ao buscar "notebook")
-- Corrige também upper() ausente no WHERE de stats_precos

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
    sub.descricao_item,
    sub.orgao,
    sub.estado,
    sub.municipio,
    sub.valor_unitario,
    sub.nome_vencedor,
    sub.cnpj_vencedor,
    sub.unidade_medida,
    sub.data_resultado,
    sub.score,
    sub.cnpj_orgao,
    sub.ano_compra,
    sub.seq_compra,
    sub.fonte
  FROM (
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
      r.cnpj_orgao,
      r.ano_compra,
      r.seq_compra,
      r.fonte,
      CAST(
        coalesce(similarity(upper(r.descricao_item), v_termo), 0) * 0.65 +
        CASE WHEN v_query IS NOT NULL
             THEN ts_rank(r.tsv, v_query) * 0.35
             ELSE 0 END
      AS FLOAT) AS score
    FROM resultados_itens r
    WHERE (
      (v_query IS NOT NULL AND r.tsv @@ v_query)
      OR similarity(upper(r.descricao_item), v_termo) > 0.22
    )
    AND (p_estado IS NULL OR r.estado = p_estado)
    AND (p_inicio IS NULL OR r.data_resultado >= p_inicio)
    AND (p_fim    IS NULL OR r.data_resultado <= p_fim)
  ) sub
  WHERE sub.score >= 0.15
  ORDER BY sub.score DESC, sub.data_resultado DESC NULLS LAST
  LIMIT  p_limite
  OFFSET p_offset;
END;
$$;

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
    MIN(sub.valor_unitario),
    MAX(sub.valor_unitario),
    ROUND(AVG(sub.valor_unitario), 2),
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY sub.valor_unitario)
  FROM (
    SELECT
      r.valor_unitario,
      CAST(
        coalesce(similarity(upper(r.descricao_item), v_termo), 0) * 0.65 +
        CASE WHEN v_query IS NOT NULL
             THEN ts_rank(r.tsv, v_query) * 0.35
             ELSE 0 END
      AS FLOAT) AS score
    FROM resultados_itens r
    WHERE (
      (v_query IS NOT NULL AND r.tsv @@ v_query)
      OR similarity(upper(r.descricao_item), v_termo) > 0.22
    )
    AND (p_estado IS NULL OR r.estado = p_estado)
    AND (p_inicio IS NULL OR r.data_resultado >= p_inicio)
    AND (p_fim    IS NULL OR r.data_resultado <= p_fim)
  ) sub
  WHERE sub.score >= 0.15;
END;
$$;

GRANT EXECUTE ON FUNCTION buscar_precos TO authenticated;
GRANT EXECUTE ON FUNCTION stats_precos  TO authenticated;

-- Reverte a divisão por quantidade: valor_unitario no PNCP já é preço
-- por unidade por definição — dividir pela quantidade detectada na descrição
-- causava distorção (ex: "AQUISIÇÃO DE 75 NOTEBOOKS" a R$4.329 unitário
-- estava sendo dividido por 75, resultando em R$57 por notebook).

DROP FUNCTION IF EXISTS buscar_precos(text,text,date,date,integer,integer);
DROP FUNCTION IF EXISTS stats_precos(text,text,date,date);
DROP FUNCTION IF EXISTS _detectar_qtd_descricao(text);

CREATE OR REPLACE FUNCTION buscar_precos(
  p_termo   TEXT,
  p_estado  TEXT    DEFAULT NULL,
  p_inicio  DATE    DEFAULT NULL,
  p_fim     DATE    DEFAULT NULL,
  p_limite  INT     DEFAULT 50,
  p_offset  INT     DEFAULT 0
)
RETURNS TABLE(
  descricao_item      TEXT,
  orgao               TEXT,
  estado              TEXT,
  municipio           TEXT,
  valor_unitario      NUMERIC,
  nome_vencedor       TEXT,
  cnpj_vencedor       TEXT,
  unidade_medida      TEXT,
  data_resultado      DATE,
  score               FLOAT,
  cnpj_orgao          TEXT,
  ano_compra          INT,
  seq_compra          INT,
  fonte               TEXT,
  quantidade_estimada INT
)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET statement_timeout = '25s'
AS $$
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
    sub.fonte,
    NULL::INT AS quantidade_estimada
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
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET statement_timeout = '25s'
AS $$
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
  WITH scored AS (
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
  ),
  filtrado AS (
    SELECT valor_unitario FROM scored WHERE score >= 0.15
  ),
  pcts AS (
    SELECT
      PERCENTILE_CONT(0.10) WITHIN GROUP (ORDER BY valor_unitario)::NUMERIC AS p10,
      PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY valor_unitario)::NUMERIC AS p25,
      PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY valor_unitario)::NUMERIC AS p50,
      PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY valor_unitario)::NUMERIC AS p75
    FROM filtrado
  )
  SELECT
    (SELECT COUNT(*) FROM filtrado)::BIGINT                             AS total,
    (SELECT p10  FROM pcts)                                             AS minimo,
    (SELECT p75  FROM pcts)                                             AS maximo,
    (SELECT ROUND(AVG(f.valor_unitario), 2)
       FROM filtrado f, pcts
      WHERE f.valor_unitario BETWEEN pcts.p25 AND pcts.p75)            AS media,
    (SELECT p50  FROM pcts)                                             AS mediana;
END;
$$;

GRANT EXECUTE ON FUNCTION buscar_precos TO authenticated;
GRANT EXECUTE ON FUNCTION stats_precos  TO authenticated;

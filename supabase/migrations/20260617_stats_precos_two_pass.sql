-- stats_precos: filtro robusto baseado em P25 como âncora.
-- Outliers são quase sempre valores ALTOS (contratos multi-unidade sem qtd detectada).
-- P25 é pouco afetado por outliers altos, ao contrário da mediana.
-- Filtro: mantém apenas valores <= P25 * 6 (e >= P25 / 4 para remover zeros/centavos).
-- Depois aplica Tukey 1.5×IQR para limpeza fina.

DROP FUNCTION IF EXISTS stats_precos(text,text,date,date);

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
  WITH scored AS (
    SELECT
      ROUND(r.valor_unitario::NUMERIC / extrair_quantidade(r.descricao_item), 2) AS vu,
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
    AND r.valor_unitario > 0
  ),
  filtrado AS (
    SELECT vu AS valor_unitario FROM scored WHERE score >= 0.15 AND vu > 0
  ),
  -- P25 como âncora: influenciado apenas pelos 25% menores → outliers altos não o distorcem.
  -- Corta valores acima de P25×6 (contratos multi-unidade sem qtd detectada)
  -- e abaixo de P25/4 (itens acessórios / erros de cadastro).
  anchor AS (
    SELECT PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY valor_unitario)::NUMERIC AS p25
    FROM filtrado
  ),
  pre_clean AS (
    SELECT f.valor_unitario
    FROM filtrado f, anchor
    WHERE anchor.p25 > 0
      AND f.valor_unitario >= anchor.p25 / 4.0
      AND f.valor_unitario <= anchor.p25 * 3.0
  ),
  -- Tukey 1.5×IQR sobre dados pré-limpos — remove outliers residuais
  fence AS (
    SELECT
      PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY valor_unitario)::NUMERIC AS q1,
      PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY valor_unitario)::NUMERIC AS q3
    FROM pre_clean
  ),
  sem_outliers AS (
    SELECT f.valor_unitario
    FROM pre_clean f, fence
    WHERE fence.q3 > fence.q1
      AND f.valor_unitario >= fence.q1 - 1.5 * (fence.q3 - fence.q1)
      AND f.valor_unitario <= fence.q3 + 1.5 * (fence.q3 - fence.q1)
    UNION ALL
    SELECT f.valor_unitario FROM pre_clean f, fence WHERE fence.q3 = fence.q1
  ),
  pcts AS (
    SELECT
      PERCENTILE_CONT(0.10) WITHIN GROUP (ORDER BY valor_unitario)::NUMERIC AS p10,
      PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY valor_unitario)::NUMERIC AS p25,
      PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY valor_unitario)::NUMERIC AS p50,
      PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY valor_unitario)::NUMERIC AS p75,
      PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY valor_unitario)::NUMERIC AS p90
    FROM sem_outliers
  )
  SELECT
    (SELECT COUNT(*) FROM sem_outliers)::BIGINT AS total,
    (SELECT p25  FROM pcts)                     AS minimo,
    (SELECT p75  FROM pcts)                     AS maximo,
    (SELECT ROUND(AVG(s.valor_unitario), 2)
       FROM sem_outliers s, pcts
      WHERE s.valor_unitario BETWEEN pcts.p25 AND pcts.p75) AS media,
    (SELECT p50  FROM pcts)                     AS mediana;
END;
$$;

GRANT EXECUTE ON FUNCTION stats_precos TO authenticated;

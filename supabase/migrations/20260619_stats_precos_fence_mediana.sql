-- Melhora filtro de outliers em stats_precos.
-- Problema: buscar "impressora" retornava desde cartuchos (R$50) até
-- impressoras industriais (R$100k), distorcendo média e P75.
-- Solução: após o filtro de score, aplica cerca de 1 ordem de magnitude
-- em torno da mediana (mediana/2 até mediana*2).
-- Isso mantém produtos do mesmo cluster de preço sem precisar de
-- categorização manual.

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
  -- 1ª camada: top 100 por relevância (evita que resultados de baixo score
  -- com preços muito díspares distorçam os percentis)
  filtrado AS (
    SELECT valor_unitario
    FROM scored
    WHERE score >= 0.15
    ORDER BY score DESC
    LIMIT 100
  ),
  -- mediana de referência para a cerca de outliers
  ref AS (
    SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY valor_unitario) AS med
    FROM filtrado
  ),
  -- 2ª camada: mantém apenas valores dentro de 2.5x da mediana
  -- ex: mediana R$10k → aceita R$4k–R$25k; exclui cartuchos e industriais
  limpo AS (
    SELECT f.valor_unitario
    FROM filtrado f, ref r
    WHERE r.med > 0
      AND f.valor_unitario BETWEEN r.med / 2 AND r.med * 2
  ),
  -- P10 vem do conjunto pré-fence para mostrar o piso real do mercado
  p10_ref AS (
    SELECT PERCENTILE_CONT(0.10) WITHIN GROUP (ORDER BY valor_unitario)::NUMERIC AS p10
    FROM filtrado
  ),
  pcts AS (
    SELECT
      PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY valor_unitario)::NUMERIC AS p25,
      PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY valor_unitario)::NUMERIC AS p50,
      PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY valor_unitario)::NUMERIC AS p75
    FROM limpo
  )
  SELECT
    (SELECT COUNT(*) FROM limpo)::BIGINT                               AS total,
    (SELECT p10  FROM p10_ref)                                         AS minimo,
    (SELECT p75  FROM pcts)                                            AS maximo,
    (SELECT ROUND(AVG(l.valor_unitario), 2)
       FROM limpo l, pcts
      WHERE l.valor_unitario BETWEEN pcts.p25 AND pcts.p75)           AS media,
    (SELECT p50  FROM pcts)                                            AS mediana;
END;
$$;

GRANT EXECUTE ON FUNCTION stats_precos TO authenticated;

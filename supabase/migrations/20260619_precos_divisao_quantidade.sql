-- Implementa divisão por quantidade detectada na descrição.
-- Padrões detectados:
--   "AQUISIÇÃO DE 50 NOTEBOOKS"  → divide por 50
--   "FORNECIMENTO DE 100 CADEIRAS" → divide por 100
--   "50 NOTEBOOKS" (início)      → divide por 50
-- Limita a 2–4 dígitos (10–9999) para evitar falsos positivos
-- como "8GB", "1,0MM", "A4".

DROP FUNCTION IF EXISTS buscar_precos(text,text,date,date,integer,integer);
DROP FUNCTION IF EXISTS stats_precos(text,text,date,date);

-- Helper: extrai quantidade implícita da descrição (retorna 1 se não detectar)
CREATE OR REPLACE FUNCTION _detectar_qtd_descricao(p_descricao TEXT)
RETURNS INT LANGUAGE sql IMMUTABLE STRICT AS $$
  SELECT COALESCE(
    -- "DE 50 " / "DE 100 " etc.
    (regexp_match(upper(p_descricao), '\yDE\y\s+(\d{2,4})\y'))[1]::int,
    -- número no início: "50 NOTEBOOKS"
    (regexp_match(upper(p_descricao), '^\s*(\d{2,4})\y'))[1]::int,
    1
  )
$$;

GRANT EXECUTE ON FUNCTION _detectar_qtd_descricao TO authenticated;

-- buscar_precos: retorna valor_unitario dividido pela qtd detectada
-- e expõe qtd_detectada para o frontend exibir "estimado · contrato N un."
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
    -- divide pelo maior entre 1 e a quantidade detectada
    ROUND(sub.valor_unitario / GREATEST(sub.qtd, 1), 4) AS valor_unitario,
    sub.nome_vencedor,
    sub.cnpj_vencedor,
    sub.unidade_medida,
    sub.data_resultado,
    sub.score,
    sub.cnpj_orgao,
    sub.ano_compra,
    sub.seq_compra,
    sub.fonte,
    CASE WHEN sub.qtd > 1 THEN sub.qtd ELSE NULL END AS quantidade_estimada
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
      _detectar_qtd_descricao(r.descricao_item) AS qtd,
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

-- stats_precos: aplica a mesma normalização de quantidade antes de calcular percentis
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
      -- valor já normalizado por quantidade
      ROUND(r.valor_unitario / GREATEST(_detectar_qtd_descricao(r.descricao_item), 1), 4) AS valor_norm,
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
    SELECT valor_norm FROM scored WHERE score >= 0.15
  ),
  pcts AS (
    SELECT
      PERCENTILE_CONT(0.10) WITHIN GROUP (ORDER BY valor_norm)::NUMERIC AS p10,
      PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY valor_norm)::NUMERIC AS p25,
      PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY valor_norm)::NUMERIC AS p50,
      PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY valor_norm)::NUMERIC AS p75
    FROM filtrado
  )
  SELECT
    (SELECT COUNT(*) FROM filtrado)::BIGINT                             AS total,
    (SELECT p10  FROM pcts)                                             AS minimo,
    (SELECT p75  FROM pcts)                                             AS maximo,
    (SELECT ROUND(AVG(f.valor_norm), 2)
       FROM filtrado f, pcts
      WHERE f.valor_norm BETWEEN pcts.p25 AND pcts.p75)                AS media,
    (SELECT p50  FROM pcts)                                             AS mediana;
END;
$$;

GRANT EXECUTE ON FUNCTION buscar_precos TO authenticated;
GRANT EXECUTE ON FUNCTION stats_precos  TO authenticated;

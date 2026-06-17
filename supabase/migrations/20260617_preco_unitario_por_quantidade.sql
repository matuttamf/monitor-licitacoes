-- Extrai quantidade estimada da descrição do contrato via regex.
-- Detecta padrões como "AQUISIÇÃO DE 50 NOTEBOOKS" → 50.
-- Retorna 1 quando não encontra quantidade explícita (contrato unitário).
CREATE OR REPLACE FUNCTION extrair_quantidade(desc TEXT)
RETURNS INT LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  m   TEXT[];
  qty INT;
BEGIN
  IF desc IS NULL THEN RETURN 1; END IF;

  -- Padrão: "DE N <PALAVRA>" — ex: "AQUISIÇÃO DE 75 NOTEBOOKS"
  m := regexp_match(
    upper(trim(desc)),
    '\bDE\s+(\d{1,5})\s+[A-ZÁÉÍÓÚÀÂÊÔÃÕÜ]'
  );
  IF m IS NOT NULL THEN
    qty := m[1]::int;
    IF qty >= 2 AND qty <= 99999 THEN RETURN qty; END IF;
  END IF;

  -- Padrão: "N UNIDADES/EQUIPAMENTOS/COMPUTADORES/NOTEBOOKS/ITENS"
  m := regexp_match(
    upper(trim(desc)),
    '\b(\d{1,5})\s+(UNIDADES?|EQUIPAMENTOS?|COMPUTADORES?|NOTEBOOKS?|ITENS?|CONJUNTOS?|KITS?)'
  );
  IF m IS NOT NULL THEN
    qty := m[1]::int;
    IF qty >= 2 AND qty <= 99999 THEN RETURN qty; END IF;
  END IF;

  RETURN 1;
END;
$$;

-- Atualiza buscar_precos para retornar valor_unitario estimado (total ÷ quantidade)
-- e expõe quantidade_estimada para a UI poder exibir aviso.
DROP FUNCTION IF EXISTS buscar_precos(text,text,date,date,integer,integer);

CREATE OR REPLACE FUNCTION buscar_precos(
  p_termo   TEXT,
  p_estado  TEXT    DEFAULT NULL,
  p_inicio  DATE    DEFAULT NULL,
  p_fim     DATE    DEFAULT NULL,
  p_limite  INT     DEFAULT 50,
  p_offset  INT     DEFAULT 0
)
RETURNS TABLE(
  descricao_item       TEXT,
  orgao                TEXT,
  estado               TEXT,
  municipio            TEXT,
  valor_unitario       NUMERIC,
  quantidade_estimada  INT,
  nome_vencedor        TEXT,
  cnpj_vencedor        TEXT,
  unidade_medida       TEXT,
  data_resultado       DATE,
  score                FLOAT,
  cnpj_orgao           TEXT,
  ano_compra           INT,
  seq_compra           INT,
  fonte                TEXT
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
    -- preço unitário estimado (total ÷ quantidade detectada)
    ROUND(sub.valor_raw / sub.qtd, 2)                                AS valor_unitario,
    sub.qtd                                                          AS quantidade_estimada,
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
      r.valor_unitario                                               AS valor_raw,
      extrair_quantidade(r.descricao_item)                          AS qtd,
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

-- Atualiza stats_precos para usar valor unitário estimado nos percentis e médias.
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
      -- valor unitário estimado = total ÷ quantidade detectada na descrição
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
  ),
  filtrado AS (
    SELECT vu AS valor_unitario FROM scored WHERE score >= 0.15
  ),
  pcts AS (
    SELECT
      PERCENTILE_CONT(0.10) WITHIN GROUP (ORDER BY valor_unitario)::NUMERIC AS p10,
      PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY valor_unitario)::NUMERIC AS p25,
      PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY valor_unitario)::NUMERIC AS p50,
      PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY valor_unitario)::NUMERIC AS p75,
      PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY valor_unitario)::NUMERIC AS p90
    FROM filtrado
  )
  SELECT
    (SELECT COUNT(*) FROM filtrado)::BIGINT                             AS total,
    (SELECT p10  FROM pcts)                                             AS minimo,
    (SELECT p90  FROM pcts)                                             AS maximo,
    -- média trimada P25–P75 sobre valores unitários já corrigidos
    (SELECT ROUND(AVG(f.valor_unitario), 2)
       FROM filtrado f, pcts
      WHERE f.valor_unitario BETWEEN pcts.p25 AND pcts.p75)            AS media,
    (SELECT p50  FROM pcts)                                             AS mediana;
END;
$$;

GRANT EXECUTE ON FUNCTION extrair_quantidade   TO authenticated;
GRANT EXECUTE ON FUNCTION buscar_precos        TO authenticated;
GRANT EXECUTE ON FUNCTION stats_precos         TO authenticated;

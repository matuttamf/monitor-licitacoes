-- Corrige buscar_vencedores_licitacoes: incluir registros com data_resultado NULL
-- Muitos contratos PNCP não têm dataAssinatura preenchida, excluindo-os do diretório

DROP FUNCTION IF EXISTS buscar_vencedores_licitacoes(text,text,integer,integer,integer);
DROP FUNCTION IF EXISTS buscar_vencedores_licitacoes(text,text,date,integer);
DROP FUNCTION IF EXISTS buscar_vencedores_licitacoes(text,text,date,date,integer);
DROP FUNCTION IF EXISTS buscar_vencedores_licitacoes(text,text);

CREATE OR REPLACE FUNCTION buscar_vencedores_licitacoes(
  p_termo      TEXT    DEFAULT NULL,
  p_uf         TEXT    DEFAULT NULL,
  p_ano_inicio INT     DEFAULT NULL,
  p_ano_fim    INT     DEFAULT NULL,
  p_limite     INT     DEFAULT 50
)
RETURNS TABLE(
  cnpj_vencedor  TEXT,
  nome_vencedor  TEXT,
  total_vitorias BIGINT,
  valor_medio    NUMERIC,
  valor_total    NUMERIC,
  estados        TEXT[],
  ultima_vitoria DATE
)
LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  v_query      tsquery;
  v_termo      TEXT := upper(trim(coalesce(p_termo, '')));
  v_data_ini   DATE;
  v_data_fim   DATE;
BEGIN
  v_data_ini := CASE
    WHEN p_ano_inicio IS NOT NULL THEN make_date(p_ano_inicio, 1,  1)
    ELSE (CURRENT_DATE - INTERVAL '24 months')::DATE
  END;
  v_data_fim := CASE
    WHEN p_ano_fim IS NOT NULL THEN make_date(p_ano_fim, 12, 31)
    ELSE CURRENT_DATE
  END;

  IF p_termo IS NOT NULL AND trim(p_termo) <> '' THEN
    BEGIN
      v_query := plainto_tsquery('portuguese', p_termo);
    EXCEPTION WHEN OTHERS THEN
      v_query := NULL;
    END;
  END IF;

  RETURN QUERY
  SELECT
    -- CNPJ pode ser null; usa string vazia para o frontend distinguir
    coalesce(r.cnpj_vencedor, '')                                       AS cnpj_vencedor,
    MAX(r.nome_vencedor)                                                AS nome_vencedor,
    COUNT(*)::BIGINT                                                    AS total_vitorias,
    ROUND(AVG(r.valor_unitario), 2)                                     AS valor_medio,
    ROUND(SUM(r.valor_unitario), 2)                                     AS valor_total,
    ARRAY_AGG(DISTINCT r.estado) FILTER (WHERE r.estado IS NOT NULL)   AS estados,
    MAX(r.data_resultado)                                               AS ultima_vitoria
  FROM resultados_itens r
  WHERE r.nome_vencedor IS NOT NULL
    -- NULL data_resultado = sem data de assinatura; incluir pois o item é válido
    AND (r.data_resultado IS NULL OR r.data_resultado BETWEEN v_data_ini AND v_data_fim)
    AND (p_uf IS NULL OR r.estado = p_uf)
    AND (
      p_termo IS NULL OR trim(p_termo) = ''
      OR (v_query IS NOT NULL AND r.tsv @@ v_query)
      OR similarity(upper(r.descricao_item), v_termo) > 0.22
    )
  GROUP BY coalesce(r.cnpj_vencedor, r.nome_vencedor)
  ORDER BY total_vitorias DESC, ultima_vitoria DESC NULLS LAST
  LIMIT p_limite;
END;
$$;

GRANT EXECUTE ON FUNCTION buscar_vencedores_licitacoes TO authenticated;

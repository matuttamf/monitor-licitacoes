-- Materialized view: top vencedores dos últimos 48 meses (sem filtro de busca).
-- Pré-agrega para evitar timeout na query sem termo de busca.
-- Atualizada via REFRESH MATERIALIZED VIEW CONCURRENTLY mv_top_vencedores.

CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_top_vencedores AS
SELECT
  coalesce(MAX(r.cnpj_vencedor), '')                                   AS cnpj_vencedor,
  MAX(r.nome_vencedor)                                                  AS nome_vencedor,
  COUNT(*)::BIGINT                                                      AS total_vitorias,
  ROUND(AVG(r.valor_unitario), 2)                                       AS valor_medio,
  ROUND(SUM(r.valor_unitario), 2)                                       AS valor_total,
  ARRAY_AGG(DISTINCT r.estado) FILTER (WHERE r.estado IS NOT NULL)     AS estados,
  MAX(r.data_resultado)                                                 AS ultima_vitoria
FROM public.resultados_itens r
WHERE r.nome_vencedor IS NOT NULL
  AND r.data_resultado >= (CURRENT_DATE - INTERVAL '48 months')
GROUP BY coalesce(r.cnpj_vencedor, r.nome_vencedor)
ORDER BY total_vitorias DESC, ultima_vitoria DESC NULLS LAST
LIMIT 200;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_top_vencedores_cnpj
  ON public.mv_top_vencedores (cnpj_vencedor);

GRANT SELECT ON public.mv_top_vencedores TO authenticated;

-- Função atualizada: usa mv_top_vencedores quando não há termo de busca
DROP FUNCTION IF EXISTS buscar_vencedores_licitacoes(text,text,integer,integer,integer);

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
  v_termo_up   TEXT := upper(trim(coalesce(p_termo, '')));
  v_data_ini   DATE;
  v_data_fim   DATE;
  v_sem_filtro BOOLEAN;
BEGIN
  v_sem_filtro := (p_termo IS NULL OR trim(p_termo) = '')
               AND p_uf IS NULL
               AND p_ano_inicio IS NULL
               AND p_ano_fim IS NULL;

  -- Sem filtros: usa materialized view (pré-computada, instantânea)
  IF v_sem_filtro THEN
    RETURN QUERY
    SELECT
      mv.cnpj_vencedor,
      mv.nome_vencedor,
      mv.total_vitorias,
      mv.valor_medio,
      mv.valor_total,
      mv.estados,
      mv.ultima_vitoria
    FROM public.mv_top_vencedores mv
    ORDER BY mv.total_vitorias DESC, mv.ultima_vitoria DESC NULLS LAST
    LIMIT p_limite;
    RETURN;
  END IF;

  -- Com filtros: query dinâmica
  v_data_ini := CASE
    WHEN p_ano_inicio IS NOT NULL THEN make_date(p_ano_inicio, 1,  1)
    ELSE (CURRENT_DATE - INTERVAL '48 months')::DATE
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
    coalesce(MAX(r.cnpj_vencedor), '')                                   AS cnpj_vencedor,
    MAX(r.nome_vencedor)                                                  AS nome_vencedor,
    COUNT(*)::BIGINT                                                      AS total_vitorias,
    ROUND(AVG(r.valor_unitario), 2)                                       AS valor_medio,
    ROUND(SUM(r.valor_unitario), 2)                                       AS valor_total,
    ARRAY_AGG(DISTINCT r.estado) FILTER (WHERE r.estado IS NOT NULL)     AS estados,
    MAX(r.data_resultado)                                                 AS ultima_vitoria
  FROM public.resultados_itens r
  WHERE r.nome_vencedor IS NOT NULL
    AND (r.data_resultado IS NULL OR r.data_resultado BETWEEN v_data_ini AND v_data_fim)
    AND (p_uf IS NULL OR r.estado = p_uf)
    AND (
      p_termo IS NULL OR trim(p_termo) = ''
      OR (v_query IS NOT NULL AND r.tsv @@ v_query)
      OR (v_query IS NULL AND upper(r.descricao_item) LIKE '%' || v_termo_up || '%')
    )
  GROUP BY coalesce(r.cnpj_vencedor, r.nome_vencedor)
  ORDER BY total_vitorias DESC, ultima_vitoria DESC NULLS LAST
  LIMIT p_limite;
END;
$$;

GRANT EXECUTE ON FUNCTION buscar_vencedores_licitacoes TO authenticated;

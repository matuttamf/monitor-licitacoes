-- RPCs para o painel de inteligência — evita truncamento PostgREST (max 1000 linhas)
-- Cada função agrega no banco e devolve apenas o resumo.

-- 1. Licitações por estado (top 20)
CREATE OR REPLACE FUNCTION admin_lic_por_estado()
RETURNS TABLE(uf TEXT, total BIGINT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT UPPER(TRIM(estado)) AS uf, COUNT(*) AS total
  FROM licitacoes
  WHERE estado IS NOT NULL AND estado <> ''
  GROUP BY 1
  ORDER BY 2 DESC
  LIMIT 20;
$$;

-- 2. Licitações por fonte (top 15)
CREATE OR REPLACE FUNCTION admin_lic_por_fonte()
RETURNS TABLE(fonte TEXT, total BIGINT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(fonte, 'Desconhecida') AS fonte, COUNT(*) AS total
  FROM licitacoes
  GROUP BY 1
  ORDER BY 2 DESC
  LIMIT 15;
$$;

-- 3. Top 10 órgãos
CREATE OR REPLACE FUNCTION admin_top_orgaos()
RETURNS TABLE(orgao TEXT, total BIGINT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT TRIM(orgao) AS orgao, COUNT(*) AS total
  FROM licitacoes
  WHERE orgao IS NOT NULL AND orgao <> ''
  GROUP BY 1
  ORDER BY 2 DESC
  LIMIT 10;
$$;

-- 4. Distribuição por faixa de valor
CREATE OR REPLACE FUNCTION admin_lic_por_valor()
RETURNS TABLE(faixa TEXT, total BIGINT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    CASE
      WHEN valor_estimado <= 10000        THEN 'ate10k'
      WHEN valor_estimado <= 100000       THEN 'ate100k'
      WHEN valor_estimado <= 1000000      THEN 'ate1m'
      WHEN valor_estimado <= 10000000     THEN 'ate10m'
      ELSE                                     'acima10m'
    END AS faixa,
    COUNT(*) AS total
  FROM licitacoes
  WHERE valor_estimado IS NOT NULL AND valor_estimado > 0
  GROUP BY 1;
$$;

-- 5. Timeline 30 dias — licitações coletadas por dia
CREATE OR REPLACE FUNCTION admin_lic_timeline_30d()
RETURNS TABLE(data TEXT, total BIGINT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT DATE(coletado_em)::TEXT AS data, COUNT(*) AS total
  FROM licitacoes
  WHERE coletado_em >= NOW() - INTERVAL '30 days'
  GROUP BY 1
  ORDER BY 1;
$$;

-- 6. Leads por segmento
CREATE OR REPLACE FUNCTION admin_leads_por_segmento()
RETURNS TABLE(segmento TEXT, total BIGINT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(segmento, 'outros') AS segmento, COUNT(*) AS total
  FROM leads
  WHERE segmento IS NOT NULL
  GROUP BY 1
  ORDER BY 2 DESC;
$$;

-- 7. Leads por UF (top 15)
CREATE OR REPLACE FUNCTION admin_leads_por_uf()
RETURNS TABLE(uf TEXT, total BIGINT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT UPPER(TRIM(uf)) AS uf, COUNT(*) AS total
  FROM leads
  WHERE uf IS NOT NULL
  GROUP BY 1
  ORDER BY 2 DESC
  LIMIT 15;
$$;

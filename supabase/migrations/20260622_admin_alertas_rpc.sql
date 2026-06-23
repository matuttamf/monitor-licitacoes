-- RPC para agregar alertas por usuário no painel admin
-- Evita buscar todas as linhas em JS; faz COUNT DISTINCT no banco
CREATE OR REPLACE FUNCTION admin_alertas_por_usuario()
RETURNS TABLE(
  user_id     uuid,
  ativas      bigint,
  total       bigint,
  ultimo_alerta timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    a.user_id,
    COUNT(DISTINCT CASE
      WHEN l.data_abertura IS NULL OR l.data_abertura >= CURRENT_DATE
      THEN a.licitacao_id_str
    END)                        AS ativas,
    COUNT(DISTINCT a.licitacao_id_str) AS total,
    MAX(a.enviado_em)           AS ultimo_alerta
  FROM alertas a
  LEFT JOIN licitacoes l ON l.id::text = a.licitacao_id_str
  WHERE a.user_id IS NOT NULL
  GROUP BY a.user_id
$$;

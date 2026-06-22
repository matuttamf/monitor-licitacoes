-- Item 1: corrigir ordem de prioridade
--   Antes: pncp_contrato=1, pncp_proposta=2
--   Depois: pncp_proposta=1 (Licitações — participantes), pncp_contrato=2 (Contratos firmados)
-- Nota: GENERATED ALWAYS não pode ser alterado diretamente — precisa dropar e recriar.

ALTER TABLE leads DROP COLUMN IF EXISTS prioridade_disparo;

ALTER TABLE leads ADD COLUMN prioridade_disparo INT GENERATED ALWAYS AS (
  CASE
    WHEN origem = 'cnae'                 THEN 5
    WHEN fonte  = 'pncp_proposta'        THEN 1  -- Licitações (participantes)
    WHEN fonte  = 'pncp_contrato'        THEN 2  -- Contratos firmados
    WHEN fonte  = 'portal_transparencia' THEN 3
    WHEN fonte  = 'busca_manual'         THEN 4
    ELSE 6
  END
) STORED;

-- Item 2: coluna cnae_rank — rank dentro do grupo CNAE (1 = CNAE mais frequente nas licitações)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS cnae_rank INT;

-- Índice atualizado com cnae_rank como ordenação secundária dentro do grupo CNAE
DROP INDEX IF EXISTS idx_leads_fila_disparo;
CREATE INDEX idx_leads_fila_disparo
  ON leads (prioridade_disparo, cnae_rank NULLS LAST, created_at)
  WHERE status = 'pendente' AND email IS NOT NULL;

-- Função para recalcular cnae_rank em todos os leads CNAE
-- Critério: frequência do cnae_codigo nos leads (proxy para demanda do setor)
-- Rank 1 = CNAE mais frequente = maior potencial → disparar primeiro
CREATE OR REPLACE FUNCTION atualizar_cnae_rank()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE leads l
  SET cnae_rank = r.rank
  FROM (
    SELECT cnae_codigo,
           RANK() OVER (ORDER BY COUNT(*) DESC) AS rank
    FROM leads
    WHERE cnae_codigo IS NOT NULL
      AND origem = 'cnae'
    GROUP BY cnae_codigo
  ) r
  WHERE l.cnae_codigo = r.cnae_codigo
    AND l.origem = 'cnae';
END;
$$;

-- Calcula rank inicial para todos os leads CNAE já existentes
SELECT atualizar_cnae_rank();

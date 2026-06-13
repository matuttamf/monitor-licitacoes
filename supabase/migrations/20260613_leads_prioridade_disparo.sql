-- Coluna gerada: prioridade de disparo de e-mails de captação
-- Ordem: contratos PNCP (1) → proponentes (2) → transparência (3) → manual (4) → CNAE/RF (5)
-- IMPORTANTE: origem='cnae' vem primeiro para evitar que leads CNAE com fonte='pncp_contrato'
--             sejam classificados como prioridade 1 (seria incorreto).
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS prioridade_disparo INT GENERATED ALWAYS AS (
    CASE
      WHEN origem  = 'cnae'                THEN 5
      WHEN fonte   = 'pncp_contrato'       THEN 1
      WHEN fonte   = 'pncp_proposta'       THEN 2
      WHEN fonte   = 'portal_transparencia' THEN 3
      WHEN fonte   = 'busca_manual'        THEN 4
      ELSE 6
    END
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_leads_fila_disparo
  ON leads (prioridade_disparo, created_at)
  WHERE status = 'pendente' AND email IS NOT NULL;

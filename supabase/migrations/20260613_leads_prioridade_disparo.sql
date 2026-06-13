-- Coluna gerada: prioridade de disparo de e-mails de captação
-- Ordem: contratos PNCP (1) → proponentes (2) → transparência (3) → manual (4) → CNAE/RF (5)
-- Leads sem fonte/origem conhecida ficam com prioridade 6 (último)
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS prioridade_disparo INT GENERATED ALWAYS AS (
    CASE
      WHEN fonte   = 'pncp_contrato'       THEN 1
      WHEN fonte   = 'pncp_proposta'       THEN 2
      WHEN fonte   = 'portal_transparencia' THEN 3
      WHEN fonte   = 'busca_manual'        THEN 4
      WHEN origem  = 'cnae'                THEN 5
      ELSE 6
    END
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_leads_fila_disparo
  ON leads (prioridade_disparo, created_at)
  WHERE status = 'pendente' AND email IS NOT NULL;

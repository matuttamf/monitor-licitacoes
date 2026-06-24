-- Cupons de desconto granulares: regras por plano/ciclo + flag de resgate por digitação.
-- Reaproveita a tabela campanhas (cada cupom é uma campanha com permite_cupom=true).
-- Os campos legados campanhas.desconto_percentual/desconto_meses continuam servindo
-- como desconto global de campanhas de atribuição por link (retrocompatível).

-- 1) Flag: o código pode ser resgatado digitando no checkout (cupom).
--    Campanhas de atribuição por link (ex: captacao-email) ficam false por padrão.
ALTER TABLE campanhas
  ADD COLUMN IF NOT EXISTS permite_cupom boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN campanhas.permite_cupom IS
  'true = código resgatável digitando no checkout (cupom). false = só atribuição por link.';

-- 2) Regras de desconto por plano e/ou ciclo.
CREATE TABLE IF NOT EXISTS campanha_descontos (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  campanha_id         uuid        NOT NULL REFERENCES campanhas(id) ON DELETE CASCADE,
  plano               text,       -- null = todos os planos
  periodo             text,       -- null = todos os ciclos
  desconto_percentual integer     NOT NULL CHECK (desconto_percentual BETWEEN 1 AND 100),
  desconto_meses      integer     NOT NULL DEFAULT 0 CHECK (desconto_meses >= 0), -- 0 = permanente
  criado_em           timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT periodo_valido CHECK (periodo IS NULL OR periodo IN ('mensal','anual')),
  CONSTRAINT plano_valido   CHECK (plano   IS NULL OR plano   IN ('basic','profissional','gestao','empresarial'))
);

-- Uma regra por escopo (campanha + plano + ciclo). COALESCE para tratar null como '*'.
CREATE UNIQUE INDEX IF NOT EXISTS uq_campanha_desconto_escopo
  ON campanha_descontos (campanha_id, COALESCE(plano,'*'), COALESCE(periodo,'*'));

CREATE INDEX IF NOT EXISTS idx_campanha_descontos_campanha
  ON campanha_descontos (campanha_id);

-- Só service_role acessa (admin via createAdminClient), igual à tabela campanhas.
ALTER TABLE campanha_descontos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sem_acesso_publico_desc" ON campanha_descontos FOR ALL USING (false);

COMMENT ON COLUMN campanha_descontos.plano          IS 'null = todos; senão basic|profissional|gestao|empresarial';
COMMENT ON COLUMN campanha_descontos.periodo        IS 'null = todos os ciclos; senão mensal|anual';
COMMENT ON COLUMN campanha_descontos.desconto_meses IS '0 = permanente; N = aplica nos primeiros N ciclos';

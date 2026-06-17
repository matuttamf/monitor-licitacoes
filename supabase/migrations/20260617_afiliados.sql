-- Migration: programa de afiliados
-- Tabela principal de afiliados (vincula user_id à campanha)
CREATE TABLE IF NOT EXISTS afiliados (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  campanha_id     uuid        REFERENCES campanhas(id),
  nome            text        NOT NULL,
  email           text        NOT NULL,
  status          text        NOT NULL DEFAULT 'pendente',
  -- status: pendente | ativo | bloqueado
  token_convite   text        UNIQUE,
  token_expira_em timestamptz,
  criado_em       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE afiliados ENABLE ROW LEVEL SECURITY;
-- Afiliado autenticado vê apenas seus próprios dados
CREATE POLICY "afiliado_le_proprio" ON afiliados
  FOR SELECT USING (auth.uid() = user_id);
-- Service role faz tudo
CREATE POLICY "service_full" ON afiliados
  FOR ALL USING (true) WITH CHECK (true);

-- Histórico de pagamentos de comissão
CREATE TABLE IF NOT EXISTS afiliado_pagamentos (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  afiliado_id   uuid        NOT NULL REFERENCES afiliados(id) ON DELETE CASCADE,
  mes_ref       text        NOT NULL, -- formato YYYY-MM
  valor         numeric(10,2) NOT NULL,
  status        text        NOT NULL DEFAULT 'pendente',
  -- status: pendente | pago
  pago_em       timestamptz,
  observacao    text,
  criado_em     timestamptz NOT NULL DEFAULT now(),
  UNIQUE(afiliado_id, mes_ref)
);

ALTER TABLE afiliado_pagamentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "afiliado_le_pagamentos" ON afiliado_pagamentos
  FOR SELECT USING (
    afiliado_id IN (SELECT id FROM afiliados WHERE user_id = auth.uid())
  );
CREATE POLICY "service_full_pagamentos" ON afiliado_pagamentos
  FOR ALL USING (true) WITH CHECK (true);

-- Contador de cliques por campanha
ALTER TABLE campanhas
  ADD COLUMN IF NOT EXISTS cliques integer NOT NULL DEFAULT 0;

-- Índices
CREATE INDEX IF NOT EXISTS afiliados_campanha_id_idx ON afiliados(campanha_id);
CREATE INDEX IF NOT EXISTS afiliado_pagamentos_afiliado_id_idx ON afiliado_pagamentos(afiliado_id);

-- RPC para incremento atômico de cliques
CREATE OR REPLACE FUNCTION incrementar_cliques_campanha(campanha_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE campanhas SET cliques = cliques + 1 WHERE id = campanha_id;
$$;

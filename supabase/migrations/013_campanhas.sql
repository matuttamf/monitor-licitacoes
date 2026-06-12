-- Migration 013: sistema de atribuição de origem e campanhas
CREATE TABLE IF NOT EXISTS campanhas (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  nome          text        NOT NULL,
  tipo          text        NOT NULL DEFAULT 'outro',
  -- tipos: influenciador | meta | google | email | organico | parceiro | outro
  codigo        text        UNIQUE NOT NULL,  -- slug para ?ref=CODIGO
  descricao     text,
  url_destino   text,                         -- landing page customizada (opcional)
  comissao_tipo text        NOT NULL DEFAULT 'nenhum',  -- nenhum | percentual | fixo
  comissao_valor numeric(10,2) NOT NULL DEFAULT 0,
  ativo         boolean     NOT NULL DEFAULT true,
  criado_em     timestamptz NOT NULL DEFAULT now()
);

-- Apenas service_role acessa (admin usa createAdminClient)
ALTER TABLE campanhas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sem_acesso_publico" ON campanhas FOR ALL USING (false);

-- Campos de atribuição nos perfis
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS campanha_id   uuid REFERENCES campanhas(id),
  ADD COLUMN IF NOT EXISTS utm_source    text,
  ADD COLUMN IF NOT EXISTS utm_medium    text,
  ADD COLUMN IF NOT EXISTS utm_campaign  text,
  ADD COLUMN IF NOT EXISTS utm_content   text;

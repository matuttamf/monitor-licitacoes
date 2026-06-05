-- =============================================
-- MIGRAÇÃO 007: Equipe multi-usuário + planos
-- Execute no Supabase SQL Editor
-- =============================================

-- 1. Garantir colunas de plano no profiles (webhook já as usa, mas pode não ter rodado migration)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plano text NOT NULL DEFAULT 'basic';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mp_subscription_id text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS max_keywords integer NOT NULL DEFAULT 10;

-- 2. Adicionar nome/empresa se ainda não existirem
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS nome text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS empresa text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS telefone text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS whatsapp text;

-- 3. Tabela de convites
CREATE TABLE IF NOT EXISTS invites (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text        NOT NULL,
  token       text        NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  usado       boolean     NOT NULL DEFAULT false,
  criado_em   timestamptz NOT NULL DEFAULT now(),
  expira_em   timestamptz NOT NULL DEFAULT (now() + interval '7 days')
);

ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner gerencia seus convites"
  ON invites FOR ALL TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "service role gerencia convites"
  ON invites FOR ALL TO service_role USING (true);

-- Nota: leitura do perfil do owner por sub-usuários é feita via service_role
-- no código da aplicação (app/api/keywords/route.ts) para evitar recursão RLS.

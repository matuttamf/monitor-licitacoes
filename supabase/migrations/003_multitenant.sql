-- =============================================
-- MIGRAÇÃO 003: Sistema Multi-tenant
-- Execute no Supabase SQL Editor
-- =============================================

-- 1. Tabela de perfis (trial + assinatura)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  trial_inicio timestamptz NOT NULL DEFAULT now(),
  trial_fim timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  status text NOT NULL DEFAULT 'trial' CHECK (status IN ('trial', 'active', 'expired')),
  criado_em timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usuarios leem proprio perfil"
  ON profiles FOR SELECT TO authenticated USING (id = auth.uid());

CREATE POLICY "service role gerencia perfis"
  ON profiles FOR ALL TO service_role USING (true);

-- 2. Trigger: criar perfil automaticamente ao cadastrar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Adicionar user_id na tabela keywords
ALTER TABLE keywords ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- 4. Atualizar RLS de keywords para filtrar por usuário
DROP POLICY IF EXISTS "usuarios autenticados leem keywords" ON keywords;
DROP POLICY IF EXISTS "usuarios autenticados gerenciam keywords" ON keywords;

CREATE POLICY "usuarios gerenciam proprias keywords"
  ON keywords FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "service role gerencia keywords"
  ON keywords FOR ALL TO service_role USING (true);

-- 5. Atualizar RLS de alertas para filtrar por dono da keyword
DROP POLICY IF EXISTS "usuarios autenticados leem alertas" ON alertas;

CREATE POLICY "usuarios leem proprios alertas"
  ON alertas FOR SELECT TO authenticated
  USING (
    keyword_id IN (
      SELECT id FROM keywords WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "service role gerencia alertas"
  ON alertas FOR ALL TO service_role USING (true);

-- 6. Atualizar RLS de licitacoes (leitura para autenticados com trial/active)
DROP POLICY IF EXISTS "usuarios autenticados leem licitacoes" ON licitacoes;

CREATE POLICY "usuarios autenticados leem licitacoes"
  ON licitacoes FOR SELECT TO authenticated USING (true);

CREATE POLICY "service role gerencia licitacoes"
  ON licitacoes FOR ALL TO service_role USING (true);

-- 7. Criar perfil para usuários já existentes (retroativo)
INSERT INTO profiles (id)
SELECT id FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Marcar usuários existentes como 'active' (já eram clientes)
UPDATE profiles SET status = 'active'
WHERE id IN (SELECT id FROM auth.users);

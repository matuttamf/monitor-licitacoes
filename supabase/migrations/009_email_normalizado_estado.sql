-- Migration 009: email normalizado (anti-abuso trial) + estado do usuário

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_normalizado TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS estado_uf         TEXT;

CREATE INDEX IF NOT EXISTS profiles_email_normalizado_idx ON profiles (email_normalizado);

-- Função que normaliza e-mail (remove pontos no Gmail, remove +alias, lowercase)
CREATE OR REPLACE FUNCTION normalizar_email(email TEXT) RETURNS TEXT AS $$
DECLARE
  local_part TEXT;
  domain_part TEXT;
BEGIN
  email := lower(trim(email));
  local_part  := split_part(email, '@', 1);
  domain_part := split_part(email, '@', 2);

  -- Remove +alias (universal)
  local_part := split_part(local_part, '+', 1);

  -- Remove pontos apenas no Gmail
  IF domain_part = 'gmail.com' THEN
    local_part := replace(local_part, '.', '');
  END IF;

  RETURN local_part || '@' || domain_part;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger: popula email_normalizado e estado_uf automaticamente ao criar/atualizar perfil
CREATE OR REPLACE FUNCTION profiles_set_defaults()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  user_meta  JSONB;
BEGIN
  -- Buscar email e metadata do usuário no auth
  SELECT email, raw_user_meta_data
    INTO user_email, user_meta
    FROM auth.users
   WHERE id = NEW.id;

  -- Definir email_normalizado se ainda não preenchido
  IF NEW.email_normalizado IS NULL AND user_email IS NOT NULL THEN
    NEW.email_normalizado := normalizar_email(user_email);
  END IF;

  -- Definir estado_uf a partir do metadata do signUp se ainda não preenchido
  IF NEW.estado_uf IS NULL AND user_meta ? 'estado_uf' THEN
    NEW.estado_uf := user_meta->>'estado_uf';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_profiles_set_defaults ON profiles;
CREATE TRIGGER trg_profiles_set_defaults
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION profiles_set_defaults();

-- Preencher retroativamente usuários existentes
UPDATE profiles p
SET email_normalizado = normalizar_email(au.email)
FROM auth.users au
WHERE au.id = p.id
  AND p.email_normalizado IS NULL;

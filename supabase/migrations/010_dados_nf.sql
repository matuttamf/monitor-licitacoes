-- Migration 010: Dados fiscais para emissão de NF + CNPJ anti-abuso

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS cnpj           TEXT,
  ADD COLUMN IF NOT EXISTS razao_social   TEXT,
  ADD COLUMN IF NOT EXISTS nome_fantasia  TEXT,
  ADD COLUMN IF NOT EXISTS ie             TEXT,
  ADD COLUMN IF NOT EXISTS cep            TEXT,
  ADD COLUMN IF NOT EXISTS logradouro     TEXT,
  ADD COLUMN IF NOT EXISTS numero         TEXT,
  ADD COLUMN IF NOT EXISTS complemento    TEXT,
  ADD COLUMN IF NOT EXISTS bairro         TEXT,
  ADD COLUMN IF NOT EXISTS cidade         TEXT;
  -- estado_uf já existe (migration 009)

-- Índice único para bloquear reuso do mesmo CNPJ em novos trials
CREATE UNIQUE INDEX IF NOT EXISTS profiles_cnpj_idx ON profiles (cnpj)
  WHERE cnpj IS NOT NULL;

-- Atualizar trigger para propagar todos os campos do metadata do signUp
CREATE OR REPLACE FUNCTION profiles_set_defaults()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  user_meta  JSONB;
BEGIN
  SELECT email, raw_user_meta_data
    INTO user_email, user_meta
    FROM auth.users
   WHERE id = NEW.id;

  -- E-mail normalizado (anti-abuso)
  IF NEW.email_normalizado IS NULL AND user_email IS NOT NULL THEN
    NEW.email_normalizado := normalizar_email(user_email);
  END IF;

  -- Dados fiscais e endereço (vem do signUp metadata)
  IF user_meta IS NOT NULL THEN
    IF NEW.estado_uf    IS NULL AND user_meta ? 'estado_uf'    THEN NEW.estado_uf    := user_meta->>'estado_uf';    END IF;
    IF NEW.cnpj         IS NULL AND user_meta ? 'cnpj'         THEN NEW.cnpj         := user_meta->>'cnpj';         END IF;
    IF NEW.razao_social IS NULL AND user_meta ? 'razao_social' THEN NEW.razao_social := user_meta->>'razao_social'; END IF;
    IF NEW.nome_fantasia IS NULL AND user_meta ? 'nome_fantasia' THEN NEW.nome_fantasia := user_meta->>'nome_fantasia'; END IF;
    IF NEW.ie           IS NULL AND user_meta ? 'ie'           THEN NEW.ie           := user_meta->>'ie';           END IF;
    IF NEW.cep          IS NULL AND user_meta ? 'cep'          THEN NEW.cep          := user_meta->>'cep';          END IF;
    IF NEW.logradouro   IS NULL AND user_meta ? 'logradouro'   THEN NEW.logradouro   := user_meta->>'logradouro';   END IF;
    IF NEW.numero       IS NULL AND user_meta ? 'numero'       THEN NEW.numero       := user_meta->>'numero';       END IF;
    IF NEW.complemento  IS NULL AND user_meta ? 'complemento'  THEN NEW.complemento  := user_meta->>'complemento';  END IF;
    IF NEW.bairro       IS NULL AND user_meta ? 'bairro'       THEN NEW.bairro       := user_meta->>'bairro';       END IF;
    IF NEW.cidade       IS NULL AND user_meta ? 'cidade'       THEN NEW.cidade       := user_meta->>'cidade';       END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar trigger (função já foi substituída acima)
DROP TRIGGER IF EXISTS trg_profiles_set_defaults ON profiles;
CREATE TRIGGER trg_profiles_set_defaults
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION profiles_set_defaults();

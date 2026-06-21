-- Adiciona coluna email em profiles (espelho de auth.users.email)
-- Necessário para o cron sync-assinaturas buscar por payer_email no MercadoPago

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS email text;

-- Popula a partir de auth.users para todos os perfis existentes
UPDATE profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id
  AND p.email IS NULL;

-- Trigger para manter sincronizado ao criar novo usuário
CREATE OR REPLACE FUNCTION public.profiles_sync_email()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
BEGIN
  UPDATE public.profiles SET email = NEW.email WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_email_updated ON auth.users;
CREATE TRIGGER on_auth_user_email_updated
  AFTER INSERT OR UPDATE OF email ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.profiles_sync_email();

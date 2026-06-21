-- Rastreia quando o perfil foi sincronizado com o MercadoPago pela última vez.
-- O cron sync-assinaturas usa este campo para paginar (quem está há mais tempo sem sync vai primeiro).
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS mp_synced_at timestamptz;

-- Index para a query do cron: users sem sync primeiro, depois por tempo
CREATE INDEX IF NOT EXISTS idx_profiles_mp_synced_at
  ON profiles (mp_synced_at ASC NULLS FIRST)
  WHERE status IN ('active', 'trial');

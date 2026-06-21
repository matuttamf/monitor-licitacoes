-- max_usuarios estava sendo referenciado no código mas nunca adicionado via migration.
-- A ausência desta coluna causava falha silenciosa em todos os updates de ativação/sync.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS max_usuarios integer NOT NULL DEFAULT 1;

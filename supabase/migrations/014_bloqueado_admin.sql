-- Migration 014: flag de bloqueio administrativo independente do ciclo de pagamento
-- bloqueado_admin=true bloqueia o acesso mesmo com assinatura ativa/paga.
-- O webhook do MercadoPago NÃO toca neste campo.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS bloqueado_admin boolean NOT NULL DEFAULT false;

-- Index para o layout (verificado em todo request autenticado)
CREATE INDEX IF NOT EXISTS idx_profiles_bloqueado_admin
  ON profiles (id, bloqueado_admin) WHERE bloqueado_admin = true;

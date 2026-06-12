-- Migration 012: data limite de acesso após cancelamento de assinatura
-- Quando o usuário cancela, acesso continua até o fim do período já pago.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS acesso_ate timestamptz;

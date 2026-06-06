-- Adiciona colunas de pausa de notificações por canal
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS email_pausado_ate     timestamptz,
  ADD COLUMN IF NOT EXISTS telegram_pausado_ate  timestamptz,
  ADD COLUMN IF NOT EXISTS whatsapp_pausado_ate  timestamptz;

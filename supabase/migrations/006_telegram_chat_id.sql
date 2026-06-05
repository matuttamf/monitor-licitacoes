-- Adiciona suporte a Telegram por usuário
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT;

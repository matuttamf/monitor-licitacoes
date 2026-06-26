-- Adiciona coluna de mensagem completa ao log de disparos
ALTER TABLE disparos_log ADD COLUMN IF NOT EXISTS mensagem text;

-- Rastreia quando o matching completo foi feito pela primeira vez para cada usuário.
-- NULL = nunca matcheado → próximo matching processa todo o banco para esse usuário.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS matching_inicial_em timestamptz DEFAULT NULL;

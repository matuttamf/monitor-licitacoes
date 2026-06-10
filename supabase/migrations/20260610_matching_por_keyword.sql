-- Tracking de matching inicial por keyword (não por usuário).
-- NULL = nunca matcheada → próximo matching processa todo o banco para essa keyword.
-- Quando usuário existente adiciona nova keyword, ela parte de NULL e varre o banco completo.
ALTER TABLE keywords ADD COLUMN IF NOT EXISTS matching_inicial_em timestamptz DEFAULT NULL;

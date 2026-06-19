ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS exclusao_solicitada_em timestamptz;

-- 'exclusao_pendente' é adicionado como status válido — sem constraint enum no Supabase (texto livre)
-- O cron ou admin verifica status = 'exclusao_pendente' e executa a exclusão manual

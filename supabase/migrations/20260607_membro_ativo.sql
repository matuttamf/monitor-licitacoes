-- Coluna para ativar/desativar sub-usuários da equipe
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS membro_ativo boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN profiles.membro_ativo IS 'Controla acesso de sub-usuários (owner_id != null). Owner sempre tem acesso.';

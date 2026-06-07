-- Migration: adiciona tipo_pessoa e cpf ao profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS tipo_pessoa text NOT NULL DEFAULT 'PJ'
    CHECK (tipo_pessoa IN ('PF', 'PJ')),
  ADD COLUMN IF NOT EXISTS cpf text,
  ADD COLUMN IF NOT EXISTS nome_completo text;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_cpf_idx ON profiles (cpf)
  WHERE cpf IS NOT NULL;

COMMENT ON COLUMN profiles.tipo_pessoa IS 'PF = Pessoa Física, PJ = Pessoa Jurídica';
COMMENT ON COLUMN profiles.cpf IS 'CPF para pessoa física (anti-abuso e emissão de NF)';
COMMENT ON COLUMN profiles.nome_completo IS 'Nome completo para pessoa física';

-- Migration: adiciona colunas de vínculo empregatício para membros de equipe
-- Executar UMA VEZ no Supabase SQL Editor (projeto xuclrhjygwrclxnddibz)
--
-- Objetivo: anti-gaming — impede que grupos de estranhos compartilhem uma conta
-- de equipe (Gestão/Empresarial) em vez de contratar planos individuais.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS cpf_membro      TEXT,
  ADD COLUMN IF NOT EXISTS cnpj_membro     TEXT,
  ADD COLUMN IF NOT EXISTS cargo_membro    TEXT,
  ADD COLUMN IF NOT EXISTS declaracao_vinculo BOOLEAN DEFAULT FALSE;

-- Índice para auditoria rápida por admin
CREATE INDEX IF NOT EXISTS idx_profiles_cpf_membro  ON profiles (cpf_membro)  WHERE cpf_membro IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_cnpj_membro ON profiles (cnpj_membro) WHERE cnpj_membro IS NOT NULL;

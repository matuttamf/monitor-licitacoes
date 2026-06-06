-- Adiciona colunas de preferência de alertas por e-mail na tabela profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS emails_por_dia  int NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS itens_por_email int NOT NULL DEFAULT 10;

-- Garante valores válidos (sem IF NOT EXISTS — não suportado pelo Postgres)
DO $$ BEGIN
  ALTER TABLE profiles ADD CONSTRAINT chk_emails_por_dia
    CHECK (emails_por_dia IN (1,2,3,4,5,6,8,10));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE profiles ADD CONSTRAINT chk_itens_por_email
    CHECK (itens_por_email IN (10,20,30));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Corrige usuários com o antigo default (2) → 5
UPDATE profiles SET emails_por_dia = 5 WHERE emails_por_dia = 2;

-- Planos pagos: padrão de itens sobe para 20
UPDATE profiles
  SET itens_por_email = 20
  WHERE itens_por_email = 10
    AND plano IN ('profissional', 'pro', 'empresarial');

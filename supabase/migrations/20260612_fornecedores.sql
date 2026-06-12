-- Diretório de Fornecedores
-- Qualquer usuário ativo pode se cadastrar como fornecedor.
-- Visualizar o diretório requer plano Profissional ou superior (verificado na API).

CREATE TABLE IF NOT EXISTS fornecedores (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ativo            boolean     NOT NULL DEFAULT false,
  razao_social     text,
  cnpj             text,
  descricao        text        NOT NULL DEFAULT '',
  regioes          text[]      NOT NULL DEFAULT '{}',
  email_contato    text,
  telefone_contato text,
  website          text,
  criado_em        timestamptz NOT NULL DEFAULT now(),
  atualizado_em    timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE fornecedores ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa (inclusive anônima) pode ler fornecedores ativos
CREATE POLICY "fornecedores_public_read" ON fornecedores
  FOR SELECT USING (ativo = true);

-- Usuário autenticado pode criar/editar/deletar o próprio registro
CREATE POLICY "fornecedores_own_manage" ON fornecedores
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS fornecedores_ativo_idx ON fornecedores(ativo);
CREATE INDEX IF NOT EXISTS fornecedores_regioes_idx ON fornecedores USING GIN(regioes);
CREATE INDEX IF NOT EXISTS fornecedores_razao_idx ON fornecedores(razao_social);

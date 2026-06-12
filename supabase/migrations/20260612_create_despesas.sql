-- Tabela de despesas operacionais para contabilidade financeira
CREATE TABLE IF NOT EXISTS despesas (
  id          uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  descricao   text          NOT NULL,
  valor       numeric(10,2) NOT NULL CHECK (valor > 0),
  categoria   text          NOT NULL DEFAULT 'outro',
  recorrente  boolean       NOT NULL DEFAULT false,
  mes         int           CHECK (mes BETWEEN 1 AND 12),
  ano         int,
  criado_em   timestamptz   NOT NULL DEFAULT now()
);

-- recorrente=true  → despesa fixa mensal (ignorar mes/ano, aparece sempre)
-- recorrente=false → despesa pontual do mes/ano informado

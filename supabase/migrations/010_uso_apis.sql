-- Tabela para rastrear uso de APIs externas com limite
CREATE TABLE IF NOT EXISTS uso_apis (
  servico       TEXT NOT NULL,
  periodo       TEXT NOT NULL,  -- 'YYYY-MM-DD' diário | 'YYYY-MM' mensal
  contador      INTEGER NOT NULL DEFAULT 0,
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (servico, periodo)
);

-- Função de incremento atômico (sem race condition)
CREATE OR REPLACE FUNCTION incrementar_uso_api(p_servico TEXT, p_periodo TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE novo INTEGER;
BEGIN
  INSERT INTO uso_apis (servico, periodo, contador)
  VALUES (p_servico, p_periodo, 1)
  ON CONFLICT (servico, periodo)
  DO UPDATE SET
    contador      = uso_apis.contador + 1,
    atualizado_em = NOW()
  RETURNING contador INTO novo;
  RETURN novo;
END;
$$;

-- Extensão para busca fuzzy (trigrama)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Tabela de resultados homologados de itens de licitações (PNCP)
CREATE TABLE IF NOT EXISTS public.resultados_itens (
  id             UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  cnpj_orgao     TEXT         NOT NULL,
  orgao          TEXT,
  ano_compra     INT          NOT NULL,
  seq_compra     INT          NOT NULL,
  num_item       INT          NOT NULL,
  descricao_item TEXT         NOT NULL,
  unidade_medida TEXT,
  cnpj_vencedor  TEXT,
  nome_vencedor  TEXT,
  valor_unitario NUMERIC      NOT NULL,
  quantidade     NUMERIC,
  valor_total    NUMERIC,
  data_resultado DATE,
  estado         TEXT,
  municipio      TEXT,
  coletado_em    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  -- Coluna gerada para full-text search em português
  tsv TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('portuguese', coalesce(descricao_item, ''))
  ) STORED,

  UNIQUE(cnpj_orgao, ano_compra, seq_compra, num_item)
);

-- Índices de performance
CREATE INDEX IF NOT EXISTS idx_ri_tsv      ON public.resultados_itens USING GIN (tsv);
CREATE INDEX IF NOT EXISTS idx_ri_trgm     ON public.resultados_itens USING GIN (descricao_item gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_ri_estado   ON public.resultados_itens (estado);
CREATE INDEX IF NOT EXISTS idx_ri_data     ON public.resultados_itens (data_resultado DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_ri_valor    ON public.resultados_itens (valor_unitario);
CREATE INDEX IF NOT EXISTS idx_ri_coletado ON public.resultados_itens (coletado_em DESC);

-- RLS
ALTER TABLE public.resultados_itens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated read resultados"
  ON public.resultados_itens FOR SELECT TO authenticated USING (true);
CREATE POLICY "service full access resultados"
  ON public.resultados_itens FOR ALL USING (true) WITH CHECK (true);

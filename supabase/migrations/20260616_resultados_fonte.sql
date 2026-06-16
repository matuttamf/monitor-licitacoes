-- Adiciona coluna fonte e id_externo para suportar múltiplas origens de dados
-- (PNCP e Portal da Transparência)

ALTER TABLE public.resultados_itens
  ADD COLUMN IF NOT EXISTS fonte      TEXT NOT NULL DEFAULT 'pncp',
  ADD COLUMN IF NOT EXISTS id_externo TEXT;         -- número do contrato na Transparência

-- Índice único para dados da Transparência (usa id_externo)
CREATE UNIQUE INDEX IF NOT EXISTS idx_ri_unique_externo
  ON public.resultados_itens (fonte, id_externo)
  WHERE id_externo IS NOT NULL;

-- Índice para filtrar por fonte
CREATE INDEX IF NOT EXISTS idx_ri_fonte ON public.resultados_itens (fonte);

-- Colunas extras para captação: segmento CNAE, modalidade da licitação e fonte do lead
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS segmento   text,
  ADD COLUMN IF NOT EXISTS modalidade text,
  ADD COLUMN IF NOT EXISTS fonte      text;

CREATE INDEX IF NOT EXISTS leads_segmento_idx  ON public.leads (segmento);
CREATE INDEX IF NOT EXISTS leads_fonte_idx     ON public.leads (fonte);

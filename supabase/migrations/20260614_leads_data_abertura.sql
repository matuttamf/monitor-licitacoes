ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS data_abertura date;

CREATE INDEX IF NOT EXISTS leads_data_abertura_idx ON public.leads (data_abertura DESC);

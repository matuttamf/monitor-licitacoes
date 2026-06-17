-- Índices para acelerar enriquecimento da tabela leads (1M+ registros)
-- Sem esses índices, every query situacao IS NULL = seq scan full table

-- Partial index para enriquecer-receita e enriquecer-leads
-- Usado em: WHERE situacao IS NULL AND status IN ('invalido','pendente')
CREATE INDEX IF NOT EXISTS leads_situacao_null_idx
  ON public.leads (created_at DESC)
  WHERE situacao IS NULL;

-- Index em situacao para queries de contagem e filtro por valor
CREATE INDEX IF NOT EXISTS leads_situacao_idx
  ON public.leads (situacao)
  WHERE situacao IS NOT NULL;

-- Composite index para disparar-leads: status pendente + email preenchido
CREATE INDEX IF NOT EXISTS leads_disparo_idx
  ON public.leads (status, created_at DESC)
  WHERE status = 'pendente' AND email IS NOT NULL;

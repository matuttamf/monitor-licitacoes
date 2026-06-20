-- Índices parciais para as queries do enriquecer-receita.ts
-- Sem eles, cada SELECT varre 9M+ linhas e dá statement timeout.

-- Passe 1: leads sem e-mail (status invalido ou pendente)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_sem_email
  ON public.leads (id)
  WHERE email IS NULL AND status IN ('invalido', 'pendente');

-- Passe 2: leads inválidos com e-mail e situação ATIVA
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_invalido_com_email
  ON public.leads (id)
  WHERE status = 'invalido' AND situacao = 'ATIVA' AND email IS NOT NULL;

-- Passe 3: leads pendentes sem município
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_pendente_sem_municipio
  ON public.leads (id)
  WHERE status = 'pendente' AND municipio IS NULL;

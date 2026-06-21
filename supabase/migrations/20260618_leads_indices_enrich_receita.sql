-- Índices para acelerar paginação por cursor em enriquecer-receita.ts
-- As queries usam: WHERE <filtro> AND id > $lastId ORDER BY id ASC LIMIT 500
-- Sem índice em (id) com os filtros, PostgreSQL faz seq scan na tabela inteira a cada página.

-- Passe "sem-email": email IS NULL AND status IN ('invalido','pendente')
CREATE INDEX CONCURRENTLY IF NOT EXISTS leads_enrich_sem_email_idx
  ON public.leads (id)
  WHERE email IS NULL AND status IN ('invalido', 'pendente');

-- Passe "invalido-com-email": status='invalido' AND situacao='ATIVA' AND email IS NOT NULL
CREATE INDEX CONCURRENTLY IF NOT EXISTS leads_enrich_invalido_com_email_idx
  ON public.leads (id)
  WHERE status = 'invalido' AND situacao = 'ATIVA' AND email IS NOT NULL;

-- Passe "pendente-sem-cidade": status='pendente' AND municipio IS NULL
CREATE INDEX CONCURRENTLY IF NOT EXISTS leads_enrich_pendente_sem_cidade_idx
  ON public.leads (id)
  WHERE status = 'pendente' AND municipio IS NULL;

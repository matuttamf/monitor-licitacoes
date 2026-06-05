-- =============================================
-- MIGRAÇÃO 004: Limpeza automática de licitações expiradas
-- Mantém apenas licitações abertas até 1 dia após a data de ocorrência
-- Execute no Supabase SQL Editor
-- =============================================

-- Habilitar extensão pg_cron (já vem no Supabase, só precisa ativar)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Agendar limpeza diária às 3h (horário UTC = meia-noite de Brasília)
SELECT cron.schedule(
  'cleanup-licitacoes-expiradas',
  '0 3 * * *',
  $$
    DELETE FROM licitacoes
    WHERE data_abertura IS NOT NULL
      AND data_abertura < CURRENT_DATE - INTERVAL '1 day';
  $$
);

-- Também limpar licitações sem data de abertura que já têm mais de 30 dias coletadas
SELECT cron.schedule(
  'cleanup-licitacoes-antigas',
  '0 3 * * *',
  $$
    DELETE FROM licitacoes
    WHERE data_abertura IS NULL
      AND coletado_em < now() - INTERVAL '30 days';
  $$
);

-- Executar limpeza imediata (remover licitações já vencidas)
DELETE FROM licitacoes
WHERE data_abertura IS NOT NULL
  AND data_abertura < CURRENT_DATE - INTERVAL '1 day';

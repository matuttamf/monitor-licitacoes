-- Migration 008: tabela de logs dos cron jobs
-- Permite monitorar execuções sem depender dos logs da Vercel (limitados no plano Hobby)

CREATE TABLE IF NOT EXISTS cron_logs (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job        TEXT NOT NULL,         -- 'coletar' | 'matching' | 'alertar' | 'emails-trial' | 'expirar-trials'
  status     TEXT NOT NULL,         -- 'ok' | 'erro' | 'ignorado'
  mensagem   TEXT,
  detalhes   JSONB,
  criado_em  TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para consultas rápidas no admin
CREATE INDEX IF NOT EXISTS cron_logs_job_idx       ON cron_logs (job);
CREATE INDEX IF NOT EXISTS cron_logs_criado_em_idx ON cron_logs (criado_em DESC);

-- Limpeza automática: manter apenas os últimos 90 dias
-- (executar manualmente ou via pg_cron se disponível)
-- DELETE FROM cron_logs WHERE criado_em < NOW() - INTERVAL '90 days';

-- Apenas service role pode inserir/ler (crons usam service role)
ALTER TABLE cron_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service role full access" ON cron_logs
  USING (true)
  WITH CHECK (true);

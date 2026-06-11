-- Tabela de cache do Radar de Inteligência
-- Populada pelo cron radar-alertas (diário).
-- Permite que o painel /radar leia do banco em vez de consultar o PNCP em tempo real.

CREATE TABLE IF NOT EXISTS public.radar_contratos (
  id               UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  orgao            TEXT    NOT NULL DEFAULT '',
  objeto           TEXT    NOT NULL DEFAULT '',
  valor            NUMERIC,
  data_vigencia_fim DATE   NOT NULL,
  url              TEXT,
  estado           TEXT,
  cidade           TEXT,
  coletado_em      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_radar_contratos_vigencia
  ON public.radar_contratos (data_vigencia_fim);

-- Sem RLS — acesso apenas via service role (cron) e anon autenticado pelo /api/radar
ALTER TABLE public.radar_contratos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service role full access"
  ON public.radar_contratos
  FOR ALL
  USING (true)
  WITH CHECK (true);

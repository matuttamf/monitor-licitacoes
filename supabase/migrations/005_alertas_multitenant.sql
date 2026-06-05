-- =============================================
-- MIGRAÇÃO 005: Alertas multi-tenant
-- Separa criado_em de enviado_em, e garante rastreio por usuário
-- Execute no Supabase SQL Editor
-- =============================================

-- Adicionar campo criado_em para separar do enviado_em (data do envio real)
ALTER TABLE alertas ADD COLUMN IF NOT EXISTS criado_em timestamptz NOT NULL DEFAULT now();

-- Tornar enviado_em nullable (null = ainda não enviado)
ALTER TABLE alertas ALTER COLUMN enviado_em DROP NOT NULL;
ALTER TABLE alertas ALTER COLUMN enviado_em DROP DEFAULT;
ALTER TABLE alertas ALTER COLUMN enviado_em SET DEFAULT NULL;

-- Alertas recém-criados (canais vazio) não têm enviado_em ainda
-- Zerar enviado_em para alertas não enviados que foram criados incorretamente
UPDATE alertas SET enviado_em = NULL WHERE canais = '{}';

-- Índice para busca de pendentes
CREATE INDEX IF NOT EXISTS alertas_pendentes_idx ON alertas(criado_em DESC) WHERE canais = '{}';

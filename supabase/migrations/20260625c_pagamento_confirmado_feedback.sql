-- ════════════════════════════════════════════════════════════════════════════
-- 1. Aptidão de indicação estritamente atrelada à CONFIRMAÇÃO DO PAGAMENTO.
--    pagamento_confirmado_em é gravado pelo webhook do MercadoPago no momento
--    em que o primeiro pagamento é aprovado. A elegibilidade (+10 dias) passa a
--    contar a partir desta data, não de assinatura_inicio.
-- 2. Marcadores de envio único dos e-mails de feedback.
-- ════════════════════════════════════════════════════════════════════════════

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS pagamento_confirmado_em timestamptz,
  ADD COLUMN IF NOT EXISTS feedback_trial_em       timestamptz,  -- feedback pós-trial enviado
  ADD COLUMN IF NOT EXISTS feedback_uso_em         timestamptz;  -- feedback de experiência (32d) enviado

COMMENT ON COLUMN profiles.pagamento_confirmado_em IS
  'Momento da confirmacao do PRIMEIRO pagamento (webhook MP). Base para a aptidao de indicacao (+10 dias).';

-- Backfill: para assinantes ativos que já pagaram antes desta migration, usa
-- assinatura_inicio como aproximação da confirmação do pagamento.
UPDATE profiles
  SET pagamento_confirmado_em = assinatura_inicio
  WHERE pagamento_confirmado_em IS NULL
    AND assinatura_inicio IS NOT NULL;

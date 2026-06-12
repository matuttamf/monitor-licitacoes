-- Desconto por campanha/parceria (X% por N meses).
-- Permite oferecer desconto temporal a usuários vindos de campanhas ou parcerias.
-- Após desconto_meses meses, o cron sync-assinaturas atualiza o valor no MercadoPago.

-- Campos na tabela campanhas
ALTER TABLE campanhas
  ADD COLUMN IF NOT EXISTS desconto_percentual integer NOT NULL DEFAULT 0 CHECK (desconto_percentual BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS desconto_meses      integer NOT NULL DEFAULT 0 CHECK (desconto_meses >= 0);

-- Campos no profile do usuário (gravados ao ativar assinatura com desconto)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS voucher_desconto_percentual integer,
  ADD COLUMN IF NOT EXISTS voucher_desconto_meses      integer,
  ADD COLUMN IF NOT EXISTS voucher_desconto_ate        timestamptz;

COMMENT ON COLUMN campanhas.desconto_percentual IS '0–100. Ex: 30 = 30% off nos primeiros N meses';
COMMENT ON COLUMN campanhas.desconto_meses      IS 'Quantos meses de desconto. 0 = sem desconto';
COMMENT ON COLUMN profiles.voucher_desconto_ate IS 'Null após expirar ou se não houve desconto';

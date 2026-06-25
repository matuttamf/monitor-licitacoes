-- ════════════════════════════════════════════════════════════════════════════
-- Correção + complemento do Programa de Indicações.
--
-- A migration 20260625_indicacoes.sql foi aplicada ANTES da correção de
-- auditoria de segurança. Esta migration:
--   1. Remove a policy permissiva FOR ALL USING(true) (furo: permitia forjar
--      indicações 'assinou' via PostgREST com a chave anon e ganhar crédito).
--   2. Adiciona a coluna credito_pausa_ate, usada para entregar os dias de
--      prêmio pausando a cobrança recorrente no MercadoPago.
-- ════════════════════════════════════════════════════════════════════════════

-- ── 1. Fechar o furo de RLS ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "service_full_indicacoes" ON indicacoes;
DROP POLICY IF EXISTS "indicador_le_proprias"   ON indicacoes;

-- Somente leitura, somente das próprias indicações. Sem policy de escrita:
-- RLS nega por padrão. service_role (crons/webhook/admin) ignora RLS.
CREATE POLICY "indicador_le_proprias" ON indicacoes
  FOR SELECT TO authenticated USING (auth.uid() = indicador_id);

-- ── 2. Janela de crédito (cobrança MP pausada, coberta por prêmio) ──────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS credito_pausa_ate timestamptz;

COMMENT ON COLUMN profiles.credito_pausa_ate IS
  'Enquanto >= now(), a cobranca recorrente no MercadoPago esta pausada e coberta por dias de premio de indicacao. acesso_ate acompanha esta data.';

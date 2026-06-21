-- webhook_logs: apenas service_role pode ler (crons, webhooks internos)
-- Usuários autenticados não têm acesso — dados de pagamento são sensíveis (LGPD)
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all" ON webhook_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Rastreia uso de cupom por usuário (utilização única por cupom por profile)
CREATE TABLE IF NOT EXISTS cupom_usos (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  campanha_id uuid NOT NULL REFERENCES campanhas(id) ON DELETE CASCADE,
  usado_em    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, campanha_id)
);

ALTER TABLE cupom_usos ENABLE ROW LEVEL SECURITY;

-- Apenas service_role acessa (validação e registro via API server-side)
CREATE POLICY "service_role_cupom_usos" ON cupom_usos
  FOR ALL TO service_role USING (true) WITH CHECK (true);

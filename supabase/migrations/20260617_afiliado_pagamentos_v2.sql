-- Redesign afiliado_pagamentos: comissão one-time por assinante (não recorrente)
-- Adiciona profile_id para rastrear qual assinante gerou cada comissão
ALTER TABLE afiliado_pagamentos
  ADD COLUMN IF NOT EXISTS profile_id  uuid REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS tipo_gatilho text; -- ex: 'profissional_mensal', 'basic_anual'

-- Remove constraint mensal (era para pagamentos recorrentes por mês)
ALTER TABLE afiliado_pagamentos
  DROP CONSTRAINT IF EXISTS afiliado_pagamentos_afiliado_id_mes_ref_key;

-- Nova constraint: uma comissão por assinante por afiliado
CREATE UNIQUE INDEX IF NOT EXISTS afiliado_pagamentos_afiliado_profile_unique
  ON afiliado_pagamentos(afiliado_id, profile_id)
  WHERE profile_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS afiliado_pagamentos_profile_id_idx ON afiliado_pagamentos(profile_id);

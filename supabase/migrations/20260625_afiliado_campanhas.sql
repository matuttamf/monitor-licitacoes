-- Afiliado N campanhas: cada vínculo afiliado↔campanha tem código e comissão próprios.
-- Modelo: 1 afiliado promove N campanhas; 1 campanha pode ter N afiliados; cada afiliado
-- tem um link único por campanha (rastreio por afiliado) com comissão individual.

CREATE TABLE IF NOT EXISTS afiliado_campanhas (
  id             uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  afiliado_id    uuid          NOT NULL REFERENCES afiliados(id) ON DELETE CASCADE,
  campanha_id    uuid          NOT NULL REFERENCES campanhas(id) ON DELETE CASCADE,
  codigo         text          NOT NULL UNIQUE,           -- link de rastreio do afiliado (/r/CODIGO)
  comissao_tipo  text          NOT NULL DEFAULT 'nenhum', -- nenhum | percentual | fixo
  comissao_valor numeric(10,2) NOT NULL DEFAULT 0,
  cliques        integer       NOT NULL DEFAULT 0,
  criado_em      timestamptz   NOT NULL DEFAULT now(),
  UNIQUE (afiliado_id, campanha_id),
  CONSTRAINT comissao_tipo_valido CHECK (comissao_tipo IN ('nenhum','percentual','fixo'))
);

CREATE INDEX IF NOT EXISTS afiliado_campanhas_afiliado_idx ON afiliado_campanhas(afiliado_id);
CREATE INDEX IF NOT EXISTS afiliado_campanhas_campanha_idx ON afiliado_campanhas(campanha_id);
CREATE INDEX IF NOT EXISTS afiliado_campanhas_codigo_idx   ON afiliado_campanhas(codigo);

-- RLS: afiliado lê só os seus vínculos; service_role ignora RLS (sem policy USING(true)).
ALTER TABLE afiliado_campanhas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "afiliado_le_seus_vinculos" ON afiliado_campanhas
  FOR SELECT USING (afiliado_id IN (SELECT id FROM afiliados WHERE user_id = auth.uid()));

-- Atribuição do afiliado específico no perfil do assinante.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS afiliado_id uuid REFERENCES afiliados(id);

-- Qual campanha gerou cada comissão (para breakdown por link no dashboard do afiliado).
ALTER TABLE afiliado_pagamentos ADD COLUMN IF NOT EXISTS campanha_id uuid REFERENCES campanhas(id) ON DELETE SET NULL;

-- Incremento atômico de cliques do vínculo (rastreio por afiliado).
CREATE OR REPLACE FUNCTION incrementar_cliques_afiliado_campanha(vinculo_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE afiliado_campanhas SET cliques = cliques + 1 WHERE id = vinculo_id;
$$;

-- ── Migração dos afiliados existentes ─────────────────────────────────────────
-- Cria um vínculo por afiliado, reaproveitando o código atual da campanha (preserva
-- links em uso) e copiando a comissão da campanha. Se 2+ afiliados na mesma campanha,
-- os seguintes recebem sufixo para manter o código único.
INSERT INTO afiliado_campanhas (afiliado_id, campanha_id, codigo, comissao_tipo, comissao_valor)
SELECT sub.id, sub.campanha_id,
       CASE WHEN sub.rn = 1 THEN c.codigo ELSE c.codigo || '-' || sub.rn END,
       COALESCE(c.comissao_tipo, 'nenhum'),
       COALESCE(c.comissao_valor, 0)
FROM (
  SELECT a.id, a.campanha_id,
         row_number() OVER (PARTITION BY a.campanha_id ORDER BY a.criado_em) AS rn
  FROM afiliados a
  WHERE a.campanha_id IS NOT NULL
) sub
JOIN campanhas c ON c.id = sub.campanha_id
ON CONFLICT DO NOTHING;

-- Backfill: perfis atribuídos a campanhas com exatamente 1 afiliado recebem o afiliado_id.
UPDATE profiles p
SET afiliado_id = ac.afiliado_id
FROM afiliado_campanhas ac
WHERE p.campanha_id = ac.campanha_id
  AND p.afiliado_id IS NULL
  AND (SELECT count(*) FROM afiliado_campanhas x WHERE x.campanha_id = p.campanha_id) = 1;

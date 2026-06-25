-- ════════════════════════════════════════════════════════════════════════════
-- Programa de Indicações ("Convide amigos")
--
-- Cada usuário ativo com +10 dias após confirmação do pagamento recebe um código
-- pessoal de 8 caracteres alfanuméricos, fixo por toda a assinatura. Ao indicar um
-- amigo que assina um plano pago e permanece 10 dias sem cancelar, o indicador
-- ganha +30 dias de crédito (acumulável, sem limite). O amigo recebe 20% de
-- desconto na primeira assinatura.
--
-- A campanha é controlada por um interruptor global em `configuracoes`
-- (chave `indicacoes_ativa`) — nasce PAUSADA; o admin libera no painel.
-- ════════════════════════════════════════════════════════════════════════════

-- ── Campos de indicação no perfil ───────────────────────────────────────────
ALTER TABLE profiles
  -- Código pessoal de 8 caracteres (a-z0-9). Gerado quando o usuário fica apto.
  ADD COLUMN IF NOT EXISTS indica_codigo            text UNIQUE,
  -- Quem indicou este usuário (preenchido no cadastro a partir do ?ref=CODIGO).
  ADD COLUMN IF NOT EXISTS indicado_por             uuid REFERENCES profiles(id) ON DELETE SET NULL,
  -- Quando o usuário passou a ser apto (10 dias após confirmação do pagamento).
  ADD COLUMN IF NOT EXISTS indica_apto_em           timestamptz,
  -- Crédito de dias ainda não consumido (acumulável). Cada recompensa soma 30.
  ADD COLUMN IF NOT EXISTS indica_creditos_dias     integer NOT NULL DEFAULT 0 CHECK (indica_creditos_dias >= 0),
  -- Total de dias já ganhos ao longo da vida (métrica, nunca decresce).
  ADD COLUMN IF NOT EXISTS indica_creditos_total    integer NOT NULL DEFAULT 0,
  -- Economia acumulada exibida na gamificação (R$). Soma a cada recompensa.
  ADD COLUMN IF NOT EXISTS indica_economia_total    numeric(10,2) NOT NULL DEFAULT 0,
  -- Já recebeu o aviso "você está apto"? Evita reenvio no broadcast.
  ADD COLUMN IF NOT EXISTS indica_notificado_apto   boolean NOT NULL DEFAULT false,
  -- Admin já foi alertado de que este usuário virou candidato a afiliado (10+ indicações)?
  ADD COLUMN IF NOT EXISTS indica_afiliado_alertado boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN profiles.indica_codigo         IS 'Código pessoal de indicação (8 chars a-z0-9), fixo por toda a assinatura';
COMMENT ON COLUMN profiles.indica_creditos_dias  IS 'Dias de prêmio ainda não consumidos. Ao cancelar, viram acesso_ate = hoje + estes dias';
COMMENT ON COLUMN profiles.indica_economia_total IS 'R$ economizado acumulado (gamificação), nunca decresce';

-- ── Tabela de indicações (uma linha por amigo indicado) ─────────────────────
CREATE TABLE IF NOT EXISTS indicacoes (
  id                       uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  indicador_id             uuid          NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  -- Um amigo só pode gerar UMA recompensa → unique.
  indicado_id              uuid          NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  codigo                   text          NOT NULL,  -- código usado no convite
  -- pendente: amigo criou conta, ainda não assinou
  -- assinou:  amigo pagou (aguardando carência de 10 dias)
  -- liberada: recompensa creditada ao indicador
  -- cancelada: amigo cancelou dentro da carência → não conta
  -- fraude:   bloqueada pelo antifraude (mesmo CPF/CNPJ, e-mail, telefone, etc.)
  status                   text          NOT NULL DEFAULT 'pendente',
  assinatura_confirmada_em timestamptz,             -- quando o amigo pagou
  recompensa_liberada_em   timestamptz,             -- quando o indicador foi creditado
  recompensa_dias          integer       NOT NULL DEFAULT 30,
  valor_economia           numeric(10,2) NOT NULL DEFAULT 0,  -- R$ que o crédito representa
  motivo_bloqueio          text,                    -- preenchido quando status='fraude'
  criado_em                timestamptz   NOT NULL DEFAULT now(),
  atualizado_em            timestamptz   NOT NULL DEFAULT now()
);

ALTER TABLE indicacoes ENABLE ROW LEVEL SECURITY;
-- O indicador enxerga as próprias indicações — SOMENTE leitura, somente as suas.
-- Nenhuma policy de INSERT/UPDATE/DELETE para usuários: RLS nega por padrão, então
-- ninguém grava direto via PostgREST com a chave anon. Os crons/webhook/admin usam
-- service_role, que IGNORA RLS — por isso não há (nem deve haver) policy permissiva
-- `FOR ALL USING(true)`, que abriria escrita a qualquer usuário autenticado e
-- permitiria forjar indicações 'assinou' para ganhar crédito indevido.
CREATE POLICY "indicador_le_proprias" ON indicacoes
  FOR SELECT TO authenticated USING (auth.uid() = indicador_id);

CREATE INDEX IF NOT EXISTS indicacoes_indicador_idx ON indicacoes(indicador_id);
CREATE INDEX IF NOT EXISTS indicacoes_status_idx    ON indicacoes(status);
CREATE INDEX IF NOT EXISTS indicacoes_carencia_idx  ON indicacoes(status, assinatura_confirmada_em);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.indicacoes_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN NEW.atualizado_em = now(); RETURN NEW; END;
$$;
DROP TRIGGER IF EXISTS indicacoes_updated_at ON indicacoes;
CREATE TRIGGER indicacoes_updated_at
  BEFORE UPDATE ON indicacoes
  FOR EACH ROW EXECUTE FUNCTION public.indicacoes_set_updated_at();

-- ── RPC: crédito atômico ao indicador (evita race em concorrência) ──────────
CREATE OR REPLACE FUNCTION creditar_indicacao(p_indicador uuid, p_dias integer, p_economia numeric)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE profiles SET
    indica_creditos_dias  = indica_creditos_dias  + p_dias,
    indica_creditos_total = indica_creditos_total + p_dias,
    indica_economia_total = indica_economia_total + p_economia
  WHERE id = p_indicador;
$$;

-- ── Interruptor global — nasce PAUSADO ──────────────────────────────────────
INSERT INTO public.configuracoes (chave, valor) VALUES
  ('indicacoes_ativa', 'false'::jsonb)
ON CONFLICT (chave) DO NOTHING;

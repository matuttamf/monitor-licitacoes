-- Log de disparos por canal (começa com WhatsApp). Registra cada mensagem
-- enviada para dar visibilidade/auditoria no painel admin — hoje só dá para ver
-- pelo celular/Z-API. `preview` guarda o início do texto para identificar o tipo
-- do fluxo (trial, onboarding, indicações, alerta, etc.) sem expor dados demais.
CREATE TABLE IF NOT EXISTS disparos_log (
  id        uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  canal     text        NOT NULL,                 -- 'whatsapp' | 'telegram' | ...
  destino   text,                                 -- número/chat de destino
  preview   text,                                 -- primeiros ~120 chars da mensagem
  status    text        NOT NULL DEFAULT 'ok',    -- 'ok' | 'erro'
  erro      text,
  criado_em timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE disparos_log ENABLE ROW LEVEL SECURITY;
-- Sem policy → só service_role (crons/admin) acessa. RLS nega o resto.

CREATE INDEX IF NOT EXISTS disparos_log_canal_data_idx ON disparos_log (canal, criado_em DESC);

-- Limpeza: mantém ~30 dias (evita crescer indefinidamente). Rode quando quiser,
-- ou agende. DELETE pontual:
--   DELETE FROM disparos_log WHERE criado_em < now() - interval '30 days';

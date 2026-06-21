create table if not exists webhook_logs (
  id          bigserial primary key,
  criado_em   timestamptz not null default now(),
  fonte       text not null,           -- 'mercadopago', 'stripe', etc.
  tipo        text,                    -- type do body (subscription_preapproval, payment, etc.)
  data_id     text,                    -- data.id do evento
  status      text not null,           -- 'ok', 'erro', 'ignorado', 'assinatura_invalida'
  user_id     text,
  plano       text,
  mensagem    text,
  payload     jsonb
);

create index if not exists webhook_logs_criado_em_idx on webhook_logs (criado_em desc);
create index if not exists webhook_logs_fonte_idx     on webhook_logs (fonte);
create index if not exists webhook_logs_user_id_idx   on webhook_logs (user_id);

-- Limpa logs com mais de 90 dias automaticamente
comment on table webhook_logs is 'Logs de webhooks recebidos. Retenção: 90 dias.';

-- RPC para o card "Fila de alertas" do painel admin.
-- Conta, por canal, os alertas ainda NÃO enviados naquele canal — considerando
-- apenas licitações ainda abertas (data_abertura nula ou futura), que é o que
-- o cron de fato consegue entregar. Telegram/WhatsApp só contam para usuários
-- que têm o canal configurado.
CREATE OR REPLACE FUNCTION fila_alertas()
RETURNS json
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'email',    count(*) FILTER (WHERE NOT (a.canais @> '{email}')),
    'telegram', count(*) FILTER (WHERE p.telegram_chat_id IS NOT NULL
                                   AND NOT (a.canais @> '{telegram}')),
    'whatsapp', count(*) FILTER (WHERE coalesce(p.whatsapp,'') <> ''
                                   AND NOT (a.canais @> '{whatsapp}')),
    'total',    count(*)
  )
  FROM alertas a
  JOIN keywords  k ON k.id = a.keyword_id
  JOIN profiles  p ON p.id = k.user_id
  JOIN licitacoes l ON l.id = a.licitacao_id
  WHERE (l.data_abertura IS NULL OR l.data_abertura >= current_date);
$$;

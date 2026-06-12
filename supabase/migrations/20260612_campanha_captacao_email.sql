-- Insere a campanha de rastreamento para e-mails de captação outbound.
-- O código 'captacao-email' é referenciado em lib/emails/captacao.ts via ?ref=captacao-email.
INSERT INTO campanhas (nome, tipo, codigo, descricao, comissao_tipo, comissao_valor, ativo)
VALUES (
  'Captação por E-mail',
  'email',
  'captacao-email',
  'Leads captados via e-mail outbound (sequência trial7d + followup1/2)',
  'nenhum',
  0,
  true
)
ON CONFLICT (codigo) DO NOTHING;

-- Bucket para backups automáticos (cron backup-db, domingos às 2h).
-- Acesso público desabilitado — leitura apenas via service role.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'backups',
  'backups',
  false,
  52428800, -- 50 MB por arquivo
  ARRAY['application/json']
)
ON CONFLICT (id) DO NOTHING;

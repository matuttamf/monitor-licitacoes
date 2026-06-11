-- Adiciona 'usuario' ao CHECK constraint de leads.status
-- Necessário para marcar leads que fizeram cadastro como usuários,
-- evitando disparos desnecessários de e-mails de captação.

ALTER TABLE public.leads
  DROP CONSTRAINT IF EXISTS leads_status_check;

ALTER TABLE public.leads
  ADD CONSTRAINT leads_status_check
  CHECK (status IN ('pendente','enviado','erro','invalido','descadastrado','usuario'));

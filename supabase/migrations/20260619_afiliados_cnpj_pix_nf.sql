-- Dados fiscais do afiliado (necessários para pagamento por NF)
ALTER TABLE public.afiliados
  ADD COLUMN IF NOT EXISTS cnpj       TEXT,
  ADD COLUMN IF NOT EXISTS chave_pix  TEXT;

-- Número da NF fiscal recebida ao marcar pagamento
ALTER TABLE public.afiliado_pagamentos
  ADD COLUMN IF NOT EXISTS numero_nf  TEXT;

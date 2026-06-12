-- Migration 011: data de início de assinatura paga + valor registrado
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS assinatura_inicio timestamptz,
  ADD COLUMN IF NOT EXISTS valor_mensalidade numeric(10,2);

-- Controle de pausa de assinatura:
-- ultima_pausa_em: quando o usuário pausou pela última vez (limita 1x a cada 180 dias)
-- pausa_ate: quando a pausa expira automaticamente (14 dias após pausar)

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS ultima_pausa_em  timestamptz,
  ADD COLUMN IF NOT EXISTS pausa_ate        timestamptz;

-- Adiciona 'bloqueado' como status válido em profiles
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_status_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_status_check
  CHECK (status IN ('trial','active','expired','bloqueado'));

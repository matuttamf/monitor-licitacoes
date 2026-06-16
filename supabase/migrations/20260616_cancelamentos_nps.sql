CREATE TABLE IF NOT EXISTS public.cancelamentos (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  motivo      text,
  detalhe     text,
  criado_em   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cancelamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário vê apenas seus cancelamentos"
  ON public.cancelamentos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuário insere seus cancelamentos"
  ON public.cancelamentos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

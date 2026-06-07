-- Tabela de configurações do sistema (chave-valor genérico)
CREATE TABLE IF NOT EXISTS public.configuracoes (
  chave      text PRIMARY KEY,
  valor      jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.configuracoes DISABLE ROW LEVEL SECURITY;

-- Valores iniciais
INSERT INTO public.configuracoes (chave, valor) VALUES
  ('captacao_ativa', 'true'::jsonb)
ON CONFLICT (chave) DO NOTHING;

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.configuracoes_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS configuracoes_updated_at ON public.configuracoes;
CREATE TRIGGER configuracoes_updated_at
  BEFORE UPDATE ON public.configuracoes
  FOR EACH ROW EXECUTE FUNCTION public.configuracoes_set_updated_at();

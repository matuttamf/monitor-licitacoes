ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS periodo VARCHAR(10) DEFAULT 'mensal'
    CHECK (periodo IN ('mensal', 'anual'));

CREATE INDEX IF NOT EXISTS idx_profiles_periodo_status ON public.profiles (periodo, status);

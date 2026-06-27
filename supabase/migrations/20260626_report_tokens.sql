-- Tokens de relatório semanal compartilhável
-- UUID aleatório → URL limpa e segura (nenhuma informação exposta)
create table if not exists public.report_tokens (
  token     uuid primary key default gen_random_uuid(),
  user_id   uuid not null references auth.users(id) on delete cascade,
  semana_inicio date not null,
  criado_em timestamptz default now(),
  unique(user_id, semana_inicio)
);

alter table public.report_tokens enable row level security;

-- Qualquer pessoa com o token pode ver (link compartilhável público)
create policy "report_tokens_public_select"
  on public.report_tokens for select using (true);

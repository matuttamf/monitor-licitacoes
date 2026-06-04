-- IMPORTANTE: Este arquivo deve ser executado manualmente no Supabase SQL Editor
-- Acesse https://supabase.com/dashboard e vá para seu projeto > SQL Editor
-- Copie todo o conteúdo deste arquivo e execute lá

-- Habilitar extensão UUID
create extension if not exists "uuid-ossp";

-- Palavras-chave monitoradas
create table keywords (
  id uuid primary key default uuid_generate_v4(),
  termo text not null,
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

-- Licitações coletadas
create table licitacoes (
  id uuid primary key default uuid_generate_v4(),
  fonte text not null,
  numero_edital text not null,
  orgao text not null,
  objeto text not null,
  valor_estimado numeric,
  data_abertura date,
  url text not null,
  estado text,
  cidade text,
  coletado_em timestamptz not null default now(),
  unique(fonte, numero_edital)
);

-- Alertas enviados (matches)
create table alertas (
  id uuid primary key default uuid_generate_v4(),
  licitacao_id uuid not null references licitacoes(id) on delete cascade,
  keyword_id uuid not null references keywords(id) on delete cascade,
  enviado_em timestamptz not null default now(),
  canais text[] not null default '{}'
);

-- Índices para buscas frequentes
create index licitacoes_data_abertura_idx on licitacoes(data_abertura desc);
create index licitacoes_estado_idx on licitacoes(estado);
create index licitacoes_coletado_em_idx on licitacoes(coletado_em desc);
create index alertas_licitacao_idx on alertas(licitacao_id);
create index alertas_enviado_em_idx on alertas(enviado_em desc);

-- Row Level Security: usuários autenticados podem ler tudo
alter table keywords enable row level security;
alter table licitacoes enable row level security;
alter table alertas enable row level security;

create policy "usuarios autenticados leem keywords"
  on keywords for select to authenticated using (true);

create policy "usuarios autenticados gerenciam keywords"
  on keywords for all to authenticated using (true);

create policy "usuarios autenticados leem licitacoes"
  on licitacoes for select to authenticated using (true);

create policy "usuarios autenticados leem alertas"
  on alertas for select to authenticated using (true);

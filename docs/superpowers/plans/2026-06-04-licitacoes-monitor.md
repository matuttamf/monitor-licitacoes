# Monitor de Licitações — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir um sistema web para monitorar licitações públicas brasileiras, com coleta automática diária, matching semântico via Gemini, alertas por e-mail e Telegram, e painel web com busca manual.

**Architecture:** Monolito Next.js 15 (App Router) hospedado na Vercel. Scrapers rodam via Vercel Cron Jobs uma vez por dia. Dados persistidos no Supabase (PostgreSQL). Gemini faz matching semântico entre licitações coletadas e palavras-chave da empresa.

**Tech Stack:** Next.js 15, TypeScript, Supabase (PostgreSQL + Auth), Google Gemini API, Resend (e-mail), Telegram Bot API, Playwright (scraping headless), Vercel Cron

---

## Estrutura de Arquivos

```
projeto-licitacoes/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                      ← Dashboard principal
│   │   ├── busca/page.tsx                ← Busca manual
│   │   ├── licitacoes/[id]/page.tsx      ← Detalhe da licitação
│   │   ├── palavras-chave/page.tsx       ← Gerenciar keywords
│   │   └── alertas/page.tsx             ← Histórico de alertas
│   └── api/
│       ├── keywords/route.ts
│       ├── licitacoes/route.ts
│       ├── licitacoes/[id]/route.ts
│       ├── busca/route.ts
│       ├── busca/tempo-real/route.ts
│       ├── alertas/route.ts
│       └── cron/
│           ├── coletar/route.ts          ← Disparado pelo Vercel Cron
│           └── alertar/route.ts          ← Disparado após coleta
├── lib/
│   ├── supabase/
│   │   ├── client.ts                     ← Cliente browser
│   │   └── server.ts                     ← Cliente servidor (cookies)
│   ├── scrapers/
│   │   ├── types.ts                      ← Interface LicitacaoRaw
│   │   ├── pncp.ts
│   │   ├── comprasnet.ts
│   │   ├── bll.ts
│   │   ├── licitacoes-e.ts
│   │   └── querido-diario.ts
│   ├── matching/
│   │   └── gemini.ts
│   └── alerts/
│       ├── email.ts
│       └── telegram.ts
├── middleware.ts
├── vercel.json
└── supabase/
    └── migrations/
        └── 001_schema_inicial.sql
```

---

## FASE 1 — Fundação

### Task 1: Criar projeto Next.js e instalar dependências

**Files:**
- Create: `package.json` (gerado pelo create-next-app)
- Create: `.env.local`
- Create: `vercel.json`

- [ ] **Step 1: Criar projeto**

```bash
cd "C:\Claude Code Folder\Projeto Licitações"
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=no --import-alias="@/*"
```

Responder: No para tudo exceto TypeScript, Tailwind e App Router.

- [ ] **Step 2: Instalar dependências**

```bash
npm install @supabase/supabase-js @supabase/ssr @google/generative-ai resend playwright
npm install -D @types/node
```

- [ ] **Step 3: Criar `.env.local`**

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Gemini
GEMINI_API_KEY=

# Resend
RESEND_API_KEY=
EMAIL_DESTINATARIOS=email1@empresa.com,email2@empresa.com
EMAIL_REMETENTE=alertas@seudominio.com

# Telegram
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

# Segurança do Cron
CRON_SECRET=gerar-uma-string-aleatoria-aqui
```

- [ ] **Step 4: Criar `vercel.json`**

```json
{
  "crons": [
    {
      "path": "/api/cron/coletar",
      "schedule": "0 2 * * *"
    }
  ]
}
```

Roda às 2h da manhã (horário UTC = 23h de Brasília).

- [ ] **Step 5: Commit**

```bash
git init
git add .
git commit -m "chore: setup inicial Next.js 15 com dependências"
```

---

### Task 2: Schema do banco de dados no Supabase

**Files:**
- Create: `supabase/migrations/001_schema_inicial.sql`

- [ ] **Step 1: Criar arquivo de migração**

Criar `supabase/migrations/001_schema_inicial.sql`:

```sql
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
```

- [ ] **Step 2: Executar no Supabase**

Acessar o projeto no Supabase → SQL Editor → colar e executar o conteúdo do arquivo acima.

- [ ] **Step 3: Verificar tabelas criadas**

No Supabase → Table Editor, confirmar que as três tabelas aparecem: `keywords`, `licitacoes`, `alertas`.

- [ ] **Step 4: Commit**

```bash
git add supabase/
git commit -m "feat: schema inicial do banco de dados"
```

---

### Task 3: Clientes Supabase

**Files:**
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `middleware.ts`

- [ ] **Step 1: Criar `lib/supabase/client.ts`**

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 2: Criar `lib/supabase/server.ts`**

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}

export async function createServiceClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

- [ ] **Step 3: Criar `middleware.ts`**

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isAuthPage = request.nextUrl.pathname.startsWith('/login')
  const isCronRoute = request.nextUrl.pathname.startsWith('/api/cron')

  if (isCronRoute) {
    return supabaseResponse
  }

  if (!user && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

- [ ] **Step 4: Commit**

```bash
git add lib/ middleware.ts
git commit -m "feat: clientes Supabase e middleware de autenticação"
```

---

### Task 4: Tela de Login

**Files:**
- Create: `app/(auth)/layout.tsx`
- Create: `app/(auth)/login/page.tsx`

- [ ] **Step 1: Criar `app/(auth)/layout.tsx`**

```typescript
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {children}
    </div>
  )
}
```

- [ ] **Step 2: Criar `app/(auth)/login/page.tsx`**

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setCarregando(true)
    setErro('')

    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })

    if (error) {
      setErro('E-mail ou senha incorretos.')
      setCarregando(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Monitor de Licitações</h1>
      <p className="text-gray-500 mb-8">Acesso restrito à equipe</p>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
          <input
            type="password"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {erro && <p className="text-red-600 text-sm">{erro}</p>}

        <button
          type="submit"
          disabled={carregando}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 3: Testar manualmente**

Rodar `npm run dev`, acessar `http://localhost:3000/login`. Confirmar que o formulário aparece. Tentar logar com um usuário criado no Supabase Auth.

- [ ] **Step 4: Commit**

```bash
git add app/
git commit -m "feat: tela de login com Supabase Auth"
```

---

### Task 5: Layout do painel e navegação

**Files:**
- Create: `app/(dashboard)/layout.tsx`
- Create: `app/(dashboard)/page.tsx` (placeholder)

- [ ] **Step 1: Criar `app/(dashboard)/layout.tsx`**

```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="font-bold text-lg text-gray-900">Monitor de Licitações</h1>
          <p className="text-xs text-gray-500 mt-1">{user.email}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <NavItem href="/" label="Dashboard" />
          <NavItem href="/busca" label="Busca" />
          <NavItem href="/palavras-chave" label="Palavras-chave" />
          <NavItem href="/alertas" label="Histórico de Alertas" />
        </nav>

        <form action="/api/auth/logout" method="POST" className="p-4 border-t border-gray-200">
          <button type="submit" className="text-sm text-gray-500 hover:text-gray-700">
            Sair
          </button>
        </form>
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  )
}

function NavItem({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition"
    >
      {label}
    </Link>
  )
}
```

- [ ] **Step 2: Criar `app/api/auth/logout/route.ts`**

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'))
}
```

- [ ] **Step 3: Criar placeholder `app/(dashboard)/page.tsx`**

```typescript
export default function DashboardPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>
      <p className="text-gray-500">Em breve: licitações com match nas suas palavras-chave.</p>
    </div>
  )
}
```

- [ ] **Step 4: Adicionar `NEXT_PUBLIC_APP_URL` ao `.env.local`**

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- [ ] **Step 5: Testar manualmente**

Logar no sistema e confirmar que a navegação lateral aparece e o logout funciona.

- [ ] **Step 6: Commit**

```bash
git add app/ 
git commit -m "feat: layout do painel com navegação e logout"
```

---

### Task 6: Gerenciamento de palavras-chave

**Files:**
- Create: `app/api/keywords/route.ts`
- Create: `app/(dashboard)/palavras-chave/page.tsx`

- [ ] **Step 1: Criar `app/api/keywords/route.ts`**

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('keywords')
    .select('*')
    .order('criado_em', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { termo } = await request.json()

  if (!termo?.trim()) {
    return NextResponse.json({ error: 'Termo obrigatório' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('keywords')
    .insert({ termo: termo.trim().toLowerCase() })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { id, ativo } = await request.json()

  const { error } = await supabase
    .from('keywords')
    .update({ ativo })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { id } = await request.json()

  const { error } = await supabase.from('keywords').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 2: Criar `app/(dashboard)/palavras-chave/page.tsx`**

```typescript
'use client'

import { useEffect, useState } from 'react'

type Keyword = { id: string; termo: string; ativo: boolean; criado_em: string }

export default function PalavrasChavePage() {
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [novoTermo, setNovoTermo] = useState('')
  const [carregando, setCarregando] = useState(true)

  async function carregar() {
    const res = await fetch('/api/keywords')
    setKeywords(await res.json())
    setCarregando(false)
  }

  useEffect(() => { carregar() }, [])

  async function adicionar(e: React.FormEvent) {
    e.preventDefault()
    await fetch('/api/keywords', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ termo: novoTermo }),
    })
    setNovoTermo('')
    carregar()
  }

  async function toggleAtivo(id: string, ativo: boolean) {
    await fetch('/api/keywords', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ativo: !ativo }),
    })
    carregar()
  }

  async function remover(id: string) {
    if (!confirm('Remover esta palavra-chave?')) return
    await fetch('/api/keywords', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    carregar()
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Palavras-chave</h2>

      <form onSubmit={adicionar} className="flex gap-3 mb-8">
        <input
          value={novoTermo}
          onChange={e => setNovoTermo(e.target.value)}
          placeholder="Ex: notebook, cadeira ergonômica, retroescavadeira"
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Adicionar
        </button>
      </form>

      {carregando ? (
        <p className="text-gray-500">Carregando...</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {keywords.length === 0 && (
            <p className="p-4 text-gray-500 text-sm">Nenhuma palavra-chave cadastrada.</p>
          )}
          {keywords.map(kw => (
            <div key={kw.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <span className={`font-medium ${kw.ativo ? 'text-gray-900' : 'text-gray-400 line-through'}`}>
                  {kw.termo}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${kw.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {kw.ativo ? 'ativo' : 'inativo'}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleAtivo(kw.id, kw.ativo)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {kw.ativo ? 'Desativar' : 'Ativar'}
                </button>
                <button
                  onClick={() => remover(kw.id)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Testar manualmente**

Acessar `/palavras-chave`, adicionar alguns termos, ativar/desativar e remover. Confirmar que persiste no Supabase.

- [ ] **Step 4: Commit**

```bash
git add app/
git commit -m "feat: gerenciamento de palavras-chave"
```

---

## FASE 2 — Scrapers e Matching

### Task 7: Tipos compartilhados dos scrapers

**Files:**
- Create: `lib/scrapers/types.ts`

- [ ] **Step 1: Criar `lib/scrapers/types.ts`**

```typescript
export interface LicitacaoRaw {
  fonte: string
  numero_edital: string
  orgao: string
  objeto: string
  valor_estimado?: number
  data_abertura?: string // formato YYYY-MM-DD
  url: string
  estado?: string
  cidade?: string
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/
git commit -m "feat: tipos compartilhados dos scrapers"
```

---

### Task 8: Scraper PNCP (API oficial)

**Files:**
- Create: `lib/scrapers/pncp.ts`

- [ ] **Step 1: Criar `lib/scrapers/pncp.ts`**

```typescript
import { LicitacaoRaw } from './types'

const BASE_URL = 'https://pncp.gov.br/api/pncp/v1'

interface PncpContrato {
  numeroControlePNCP: string
  orgaoEntidade: { razaoSocial: string; ufSigla: string; municipioNome: string }
  objetoCompra: string
  valorTotalEstimado?: number
  dataAberturaProposta?: string
  linkSistemaOrigem: string
}

export async function coletarPNCP(dataInicio: string, dataFim: string): Promise<LicitacaoRaw[]> {
  const licitacoes: LicitacaoRaw[] = []
  let pagina = 1
  const tamanhoPagina = 50

  while (true) {
    const url = `${BASE_URL}/contratacoes/publicacao?dataInicial=${dataInicio}&dataFinal=${dataFim}&pagina=${pagina}&tamanhoPagina=${tamanhoPagina}`

    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 0 },
    })

    if (!res.ok) break

    const json = await res.json()
    const itens: PncpContrato[] = json.data ?? []

    if (itens.length === 0) break

    for (const item of itens) {
      licitacoes.push({
        fonte: 'PNCP',
        numero_edital: item.numeroControlePNCP,
        orgao: item.orgaoEntidade.razaoSocial,
        objeto: item.objetoCompra,
        valor_estimado: item.valorTotalEstimado,
        data_abertura: item.dataAberturaProposta?.substring(0, 10),
        url: item.linkSistemaOrigem || `https://pncp.gov.br/app/editais/${item.numeroControlePNCP}`,
        estado: item.orgaoEntidade.ufSigla,
        cidade: item.orgaoEntidade.municipioNome,
      })
    }

    if (itens.length < tamanhoPagina) break
    pagina++

    // Respeitar rate limit
    await new Promise(r => setTimeout(r, 200))
  }

  return licitacoes
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/scrapers/pncp.ts
git commit -m "feat: scraper PNCP via API oficial"
```

---

### Task 9: Scraper Querido Diário

**Files:**
- Create: `lib/scrapers/querido-diario.ts`

- [ ] **Step 1: Criar `lib/scrapers/querido-diario.ts`**

```typescript
import { LicitacaoRaw } from './types'

const BASE_URL = 'https://queridodiario.ok.org.br/api'

interface QDExcerto {
  edition_number: string
  source_text: string
  territory_name: string
  state_code: string
  date: string
  file_url: string
}

export async function coletarQueridoDiario(termos: string[]): Promise<LicitacaoRaw[]> {
  const licitacoes: LicitacaoRaw[] = []

  // Buscar por termos de licitação nos diários
  const queryTermos = ['licitação', 'pregão', 'tomada de preços', 'concorrência', ...termos]
    .slice(0, 5) // API limita os termos de busca
    .join(' ')

  const url = `${BASE_URL}/gazettes?querystring=${encodeURIComponent(queryTermos)}&size=50&sort_by=descending_date`

  const res = await fetch(url, { next: { revalidate: 0 } })
  if (!res.ok) return licitacoes

  const json = await res.json()
  const excertos: QDExcerto[] = json.gazettes ?? []

  for (const excerto of excertos) {
    // Extrair número do edital do texto (heurística)
    const matchEdital = excerto.source_text.match(/n[°º\.]?\s*(\d+[\/-]\d+)/i)
    const numero = matchEdital?.[1] ?? `QD-${excerto.edition_number}-${Date.now()}`

    licitacoes.push({
      fonte: 'Querido Diário',
      numero_edital: numero,
      orgao: excerto.territory_name,
      objeto: excerto.source_text.substring(0, 500),
      data_abertura: excerto.date,
      url: excerto.file_url,
      estado: excerto.state_code,
      cidade: excerto.territory_name,
    })
  }

  return licitacoes
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/scrapers/querido-diario.ts
git commit -m "feat: scraper Querido Diário (diários oficiais)"
```

---

### Task 10: Scrapers BLL e Licitações-e (Playwright)

**Files:**
- Create: `lib/scrapers/bll.ts`
- Create: `lib/scrapers/licitacoes-e.ts`

- [ ] **Step 1: Criar `lib/scrapers/bll.ts`**

```typescript
import { chromium } from 'playwright'
import { LicitacaoRaw } from './types'

export async function coletarBLL(): Promise<LicitacaoRaw[]> {
  const licitacoes: LicitacaoRaw[] = []
  const browser = await chromium.launch({ headless: true })

  try {
    const page = await browser.newPage()
    await page.goto('https://bll.org.br/pesquisa/', { waitUntil: 'networkidle', timeout: 30000 })

    // Selecionar "Abertas" e buscar
    await page.selectOption('select[name="status"]', 'A').catch(() => {})
    await page.click('button[type="submit"], input[type="submit"]').catch(() => {})
    await page.waitForLoadState('networkidle')

    const itens = await page.$$eval('table tbody tr, .licitacao-item', rows =>
      rows.slice(0, 50).map(row => {
        const colunas = row.querySelectorAll('td')
        return {
          numero: colunas[0]?.textContent?.trim() ?? '',
          orgao: colunas[1]?.textContent?.trim() ?? '',
          objeto: colunas[2]?.textContent?.trim() ?? '',
          data: colunas[3]?.textContent?.trim() ?? '',
          link: row.querySelector('a')?.href ?? '',
        }
      })
    )

    for (const item of itens) {
      if (!item.numero || !item.objeto) continue
      licitacoes.push({
        fonte: 'BLL',
        numero_edital: item.numero,
        orgao: item.orgao,
        objeto: item.objeto,
        data_abertura: item.data || undefined,
        url: item.link || 'https://bll.org.br/pesquisa/',
      })
    }
  } finally {
    await browser.close()
  }

  return licitacoes
}
```

- [ ] **Step 2: Criar `lib/scrapers/licitacoes-e.ts`**

```typescript
import { chromium } from 'playwright'
import { LicitacaoRaw } from './types'

export async function coletarLicitacoesE(): Promise<LicitacaoRaw[]> {
  const licitacoes: LicitacaoRaw[] = []
  const browser = await chromium.launch({ headless: true })

  try {
    const page = await browser.newPage()
    await page.goto('https://www.licitacoes-e.com.br/aop/pesquisar-licitacao.aop', {
      waitUntil: 'networkidle',
      timeout: 30000,
    })

    // Buscar licitações abertas
    await page.click('#btnPesquisar, button[type="submit"]').catch(() => {})
    await page.waitForLoadState('networkidle')

    const itens = await page.$$eval('table.resultado tbody tr', rows =>
      rows.slice(0, 50).map(row => {
        const colunas = row.querySelectorAll('td')
        return {
          numero: colunas[0]?.textContent?.trim() ?? '',
          orgao: colunas[1]?.textContent?.trim() ?? '',
          objeto: colunas[2]?.textContent?.trim() ?? '',
          data: colunas[3]?.textContent?.trim() ?? '',
          link: row.querySelector('a')?.href ?? '',
        }
      })
    )

    for (const item of itens) {
      if (!item.numero || !item.objeto) continue
      licitacoes.push({
        fonte: 'Licitações-e',
        numero_edital: item.numero,
        orgao: item.orgao,
        objeto: item.objeto,
        data_abertura: item.data || undefined,
        url: item.link || 'https://www.licitacoes-e.com.br',
      })
    }
  } finally {
    await browser.close()
  }

  return licitacoes
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/scrapers/bll.ts lib/scrapers/licitacoes-e.ts
git commit -m "feat: scrapers BLL e Licitações-e via Playwright"
```

---

### Task 11: Scraper ComprasNet

**Files:**
- Create: `lib/scrapers/comprasnet.ts`

- [ ] **Step 1: Criar `lib/scrapers/comprasnet.ts`**

```typescript
import { LicitacaoRaw } from './types'

const BASE_URL = 'https://compras.dados.gov.br'

interface ComprasNetLicitacao {
  id_licitacao: string
  nome_unidade_compradora: string
  objeto: string
  valor_estimado_total?: number
  data_abertura_proposta?: string
  link_sistema_origem: string
  codigo_uf?: string
}

export async function coletarComprasNet(dataInicio: string): Promise<LicitacaoRaw[]> {
  const licitacoes: LicitacaoRaw[] = []

  const url = `${BASE_URL}/licitacoes/v1/licitacoes.json?data_abertura_proposta=${dataInicio}&_page=1&_pageSize=50`

  const res = await fetch(url, { next: { revalidate: 0 } })
  if (!res.ok) return licitacoes

  const json = await res.json()
  const itens: ComprasNetLicitacao[] = json._embedded?.licitacoes ?? []

  for (const item of itens) {
    licitacoes.push({
      fonte: 'ComprasNet',
      numero_edital: String(item.id_licitacao),
      orgao: item.nome_unidade_compradora,
      objeto: item.objeto,
      valor_estimado: item.valor_estimado_total,
      data_abertura: item.data_abertura_proposta?.substring(0, 10),
      url: item.link_sistema_origem || `${BASE_URL}/licitacoes`,
      estado: item.codigo_uf,
    })
  }

  return licitacoes
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/scrapers/comprasnet.ts
git commit -m "feat: scraper ComprasNet via API de dados abertos"
```

---

### Task 12: Persistência das licitações coletadas

**Files:**
- Create: `lib/scrapers/salvar.ts`

- [ ] **Step 1: Criar `lib/scrapers/salvar.ts`**

```typescript
import { createServiceClient } from '@/lib/supabase/server'
import { LicitacaoRaw } from './types'

export async function salvarLicitacoes(licitacoes: LicitacaoRaw[]): Promise<number> {
  if (licitacoes.length === 0) return 0

  const supabase = await createServiceClient()

  // upsert com ignorar conflitos (fonte + numero_edital são unique)
  const { data, error } = await supabase
    .from('licitacoes')
    .upsert(licitacoes, { onConflict: 'fonte,numero_edital', ignoreDuplicates: true })
    .select('id')

  if (error) {
    console.error('Erro ao salvar licitações:', error.message)
    return 0
  }

  return data?.length ?? 0
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/scrapers/salvar.ts
git commit -m "feat: persistência de licitações com deduplicação"
```

---

### Task 13: Matching semântico com Gemini

**Files:**
- Create: `lib/matching/gemini.ts`

- [ ] **Step 1: Criar `lib/matching/gemini.ts`**

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

export interface MatchResult {
  licitacao_id: string
  keyword_ids: string[]
}

export async function encontrarMatches(
  licitacoes: { id: string; objeto: string }[],
  keywords: { id: string; termo: string }[]
): Promise<MatchResult[]> {
  if (licitacoes.length === 0 || keywords.length === 0) return []

  const resultados: MatchResult[] = []
  const termosTexto = keywords.map(k => `"${k.termo}"`).join(', ')

  // Processar em lotes de 10 licitações para não exceder o contexto
  for (let i = 0; i < licitacoes.length; i += 10) {
    const lote = licitacoes.slice(i, i + 10)

    const prompt = `
Analise cada licitação abaixo e identifique quais palavras-chave têm relação semântica com o objeto da licitação.
Considere sinônimos, categorias relacionadas e contexto. Seja criterioso — só marque como match se houver relação real.

Palavras-chave: ${termosTexto}

Licitações:
${lote.map((l, idx) => `[${idx}] ${l.objeto}`).join('\n')}

Responda APENAS com JSON no formato:
[{"index": 0, "keywords": ["termo1", "termo2"]}, {"index": 1, "keywords": []}, ...]

Inclua todas as licitações mesmo sem match (keywords vazio).
`

    try {
      const resultado = await model.generateContent(prompt)
      const texto = resultado.response.text()

      // Extrair JSON da resposta
      const jsonMatch = texto.match(/\[[\s\S]*\]/)
      if (!jsonMatch) continue

      const matches: { index: number; keywords: string[] }[] = JSON.parse(jsonMatch[0])

      for (const match of matches) {
        const licitacao = lote[match.index]
        if (!licitacao || match.keywords.length === 0) continue

        const keywordIds = match.keywords
          .map(termo => keywords.find(k => k.termo === termo)?.id)
          .filter(Boolean) as string[]

        if (keywordIds.length > 0) {
          resultados.push({ licitacao_id: licitacao.id, keyword_ids: keywordIds })
        }
      }
    } catch (err) {
      console.error('Erro no matching Gemini:', err)
    }

    // Respeitar rate limit
    await new Promise(r => setTimeout(r, 500))
  }

  return resultados
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/matching/
git commit -m "feat: matching semântico com Gemini"
```

---

### Task 14: Cron job de coleta e matching

**Files:**
- Create: `app/api/cron/coletar/route.ts`

- [ ] **Step 1: Criar `app/api/cron/coletar/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { coletarPNCP } from '@/lib/scrapers/pncp'
import { coletarComprasNet } from '@/lib/scrapers/comprasnet'
import { coletarQueridoDiario } from '@/lib/scrapers/querido-diario'
import { coletarBLL } from '@/lib/scrapers/bll'
import { coletarLicitacoesE } from '@/lib/scrapers/licitacoes-e'
import { salvarLicitacoes } from '@/lib/scrapers/salvar'
import { encontrarMatches } from '@/lib/matching/gemini'
import { createServiceClient } from '@/lib/supabase/server'

export const maxDuration = 300 // 5 minutos (máximo Vercel)

export async function GET(request: Request) {
  // Verificar secret do cron
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const hoje = new Date()
  const ontem = new Date(hoje)
  ontem.setDate(ontem.getDate() - 1)

  const dataInicio = ontem.toISOString().substring(0, 10)
  const dataFim = hoje.toISOString().substring(0, 10)

  console.log(`Iniciando coleta para ${dataInicio} a ${dataFim}`)

  // 1. Coletar de todas as fontes em paralelo (exceto Playwright que é sequencial)
  const [pncp, comprasnet, queridoDiario] = await Promise.allSettled([
    coletarPNCP(dataInicio, dataFim),
    coletarComprasNet(dataInicio),
    coletarQueridoDiario([]),
  ])

  // Playwright sequencial para não sobrecarregar
  const bll = await coletarBLL().catch(() => [])
  const licitacoesE = await coletarLicitacoesE().catch(() => [])

  const todasLicitacoes = [
    ...(pncp.status === 'fulfilled' ? pncp.value : []),
    ...(comprasnet.status === 'fulfilled' ? comprasnet.value : []),
    ...(queridoDiario.status === 'fulfilled' ? queridoDiario.value : []),
    ...bll,
    ...licitacoesE,
  ]

  console.log(`Coletadas ${todasLicitacoes.length} licitações no total`)

  // 2. Salvar no banco (com deduplicação)
  const salvas = await salvarLicitacoes(todasLicitacoes)
  console.log(`${salvas} licitações novas salvas`)

  // 3. Buscar licitações de hoje para fazer matching
  const supabase = await createServiceClient()
  const { data: licitacoesHoje } = await supabase
    .from('licitacoes')
    .select('id, objeto')
    .gte('coletado_em', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

  // 4. Buscar palavras-chave ativas
  const { data: keywords } = await supabase
    .from('keywords')
    .select('id, termo')
    .eq('ativo', true)

  if (!licitacoesHoje?.length || !keywords?.length) {
    return NextResponse.json({ ok: true, salvas, matches: 0 })
  }

  // 5. Encontrar matches com Gemini
  const matches = await encontrarMatches(licitacoesHoje, keywords)

  // 6. Salvar alertas (evitar duplicatas)
  if (matches.length > 0) {
    const alertasParaSalvar = matches.flatMap(m =>
      m.keyword_ids.map(kid => ({
        licitacao_id: m.licitacao_id,
        keyword_id: kid,
        canais: [] as string[],
      }))
    )

    await supabase.from('alertas').upsert(alertasParaSalvar, {
      onConflict: 'licitacao_id,keyword_id',
      ignoreDuplicates: true,
    })
  }

  console.log(`${matches.length} matches encontrados`)

  // 7. Disparar alertas (rota separada)
  if (matches.length > 0) {
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/cron/alertar`, {
      method: 'GET',
      headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
    }).catch(console.error)
  }

  return NextResponse.json({ ok: true, salvas, matches: matches.length })
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/cron/
git commit -m "feat: cron job de coleta e matching"
```

---

## FASE 3 — Alertas e Painel Completo

### Task 15: Alerta por e-mail (Resend)

**Files:**
- Create: `lib/alerts/email.ts`

- [ ] **Step 1: Criar `lib/alerts/email.ts`**

```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

interface LicitacaoAlerta {
  id: string
  orgao: string
  objeto: string
  valor_estimado?: number
  data_abertura?: string
  url: string
  estado?: string
  cidade?: string
  keyword: string
}

export async function enviarAlertaEmail(licitacoes: LicitacaoAlerta[]): Promise<boolean> {
  const destinatarios = process.env.EMAIL_DESTINATARIOS!.split(',').map(e => e.trim())

  const linhasTabela = licitacoes.map(l => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #eee">${l.keyword}</td>
      <td style="padding:8px;border-bottom:1px solid #eee">${l.orgao}</td>
      <td style="padding:8px;border-bottom:1px solid #eee">${l.objeto.substring(0, 100)}${l.objeto.length > 100 ? '...' : ''}</td>
      <td style="padding:8px;border-bottom:1px solid #eee">${l.valor_estimado ? `R$ ${l.valor_estimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}</td>
      <td style="padding:8px;border-bottom:1px solid #eee">${l.data_abertura ?? '-'}</td>
      <td style="padding:8px;border-bottom:1px solid #eee"><a href="${l.url}">Ver edital</a></td>
    </tr>
  `).join('')

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:900px;margin:0 auto">
      <h2 style="color:#1d4ed8">Monitor de Licitações — ${new Date().toLocaleDateString('pt-BR')}</h2>
      <p>Encontramos <strong>${licitacoes.length} licitação(ões)</strong> que correspondem às suas palavras-chave.</p>
      
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <thead>
          <tr style="background:#f3f4f6">
            <th style="padding:8px;text-align:left">Palavra-chave</th>
            <th style="padding:8px;text-align:left">Órgão</th>
            <th style="padding:8px;text-align:left">Objeto</th>
            <th style="padding:8px;text-align:left">Valor Estimado</th>
            <th style="padding:8px;text-align:left">Abertura</th>
            <th style="padding:8px;text-align:left">Link</th>
          </tr>
        </thead>
        <tbody>${linhasTabela}</tbody>
      </table>

      <p style="color:#6b7280;font-size:12px;margin-top:24px">
        Acesse o <a href="${process.env.NEXT_PUBLIC_APP_URL}">painel completo</a> para ver todas as licitações.
      </p>
    </div>
  `

  const { error } = await resend.emails.send({
    from: process.env.EMAIL_REMETENTE!,
    to: destinatarios,
    subject: `🔔 ${licitacoes.length} nova(s) licitação(ões) — ${new Date().toLocaleDateString('pt-BR')}`,
    html,
  })

  if (error) {
    console.error('Erro ao enviar e-mail:', error)
    return false
  }

  return true
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/alerts/email.ts
git commit -m "feat: alerta por e-mail via Resend"
```

---

### Task 16: Alerta pelo Telegram

**Files:**
- Create: `lib/alerts/telegram.ts`

- [ ] **Step 1: Criar `lib/alerts/telegram.ts`**

```typescript
interface LicitacaoAlerta {
  orgao: string
  objeto: string
  valor_estimado?: number
  data_abertura?: string
  url: string
  keyword: string
}

export async function enviarAlertaTelegram(licitacoes: LicitacaoAlerta[]): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN!
  const chatId = process.env.TELEGRAM_CHAT_ID!

  const linhas = licitacoes.map(l =>
    `🔹 *${l.keyword.toUpperCase()}*\n` +
    `📋 ${l.orgao}\n` +
    `📝 ${l.objeto.substring(0, 100)}${l.objeto.length > 100 ? '...' : ''}\n` +
    `${l.valor_estimado ? `💰 R$ ${l.valor_estimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` : ''}` +
    `${l.data_abertura ? `📅 Abertura: ${l.data_abertura}\n` : ''}` +
    `🔗 [Ver edital](${l.url})`
  ).join('\n\n---\n\n')

  const mensagem =
    `🔔 *Monitor de Licitações — ${new Date().toLocaleDateString('pt-BR')}*\n\n` +
    `Encontramos *${licitacoes.length}* nova(s) licitação(ões):\n\n` +
    linhas

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: mensagem,
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
    }),
  })

  if (!res.ok) {
    console.error('Erro ao enviar Telegram:', await res.text())
    return false
  }

  return true
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/alerts/telegram.ts
git commit -m "feat: alerta pelo Telegram Bot"
```

---

### Task 17: Cron job de envio de alertas

**Files:**
- Create: `app/api/cron/alertar/route.ts`

- [ ] **Step 1: Criar `app/api/cron/alertar/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { enviarAlertaEmail } from '@/lib/alerts/email'
import { enviarAlertaTelegram } from '@/lib/alerts/telegram'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const supabase = await createServiceClient()

  // Buscar alertas pendentes (sem canais enviados)
  const { data: alertasPendentes } = await supabase
    .from('alertas')
    .select(`
      id,
      licitacao_id,
      keyword_id,
      canais,
      licitacoes (id, orgao, objeto, valor_estimado, data_abertura, url),
      keywords (termo)
    `)
    .eq('canais', '{}') // ainda não enviado
    .gte('enviado_em', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

  if (!alertasPendentes?.length) {
    return NextResponse.json({ ok: true, enviados: 0 })
  }

  const licitacoesParaEnviar = alertasPendentes.map(a => ({
    id: a.licitacao_id,
    orgao: (a.licitacoes as any).orgao,
    objeto: (a.licitacoes as any).objeto,
    valor_estimado: (a.licitacoes as any).valor_estimado,
    data_abertura: (a.licitacoes as any).data_abertura,
    url: (a.licitacoes as any).url,
    keyword: (a.keywords as any).termo,
  }))

  const canaisEnviados: string[] = []

  const emailOk = await enviarAlertaEmail(licitacoesParaEnviar)
  if (emailOk) canaisEnviados.push('email')

  const telegramOk = await enviarAlertaTelegram(licitacoesParaEnviar)
  if (telegramOk) canaisEnviados.push('telegram')

  // Marcar como enviados
  if (canaisEnviados.length > 0) {
    const ids = alertasPendentes.map(a => a.id)
    await supabase
      .from('alertas')
      .update({ canais: canaisEnviados })
      .in('id', ids)
  }

  return NextResponse.json({ ok: true, enviados: alertasPendentes.length, canais: canaisEnviados })
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/cron/alertar/
git commit -m "feat: cron job de envio de alertas (e-mail + Telegram)"
```

---

### Task 18: API de licitações e busca

**Files:**
- Create: `app/api/licitacoes/route.ts`
- Create: `app/api/busca/route.ts`
- Create: `app/api/busca/tempo-real/route.ts`

- [ ] **Step 1: Criar `app/api/licitacoes/route.ts`**

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const supabase = await createClient()

  let query = supabase
    .from('licitacoes')
    .select(`
      id, fonte, numero_edital, orgao, objeto, valor_estimado,
      data_abertura, url, estado, cidade, coletado_em,
      alertas(keyword_id, keywords(termo))
    `)
    .not('alertas', 'is', null)
    .order('coletado_em', { ascending: false })
    .limit(50)

  if (searchParams.get('estado')) {
    query = query.eq('estado', searchParams.get('estado')!)
  }

  if (searchParams.get('data_inicio')) {
    query = query.gte('data_abertura', searchParams.get('data_inicio')!)
  }

  if (searchParams.get('valor_min')) {
    query = query.gte('valor_estimado', Number(searchParams.get('valor_min')))
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
```

- [ ] **Step 2: Criar `app/api/busca/route.ts`**

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const termo = searchParams.get('q') ?? ''
  const supabase = await createClient()

  let query = supabase
    .from('licitacoes')
    .select('id, fonte, numero_edital, orgao, objeto, valor_estimado, data_abertura, url, estado, cidade')
    .order('coletado_em', { ascending: false })
    .limit(100)

  if (termo) {
    query = query.ilike('objeto', `%${termo}%`)
  }

  if (searchParams.get('estado')) {
    query = query.eq('estado', searchParams.get('estado')!)
  }

  if (searchParams.get('data_inicio')) {
    query = query.gte('data_abertura', searchParams.get('data_inicio')!)
  }

  if (searchParams.get('valor_min')) {
    query = query.gte('valor_estimado', Number(searchParams.get('valor_min')))
  }

  if (searchParams.get('valor_max')) {
    query = query.lte('valor_estimado', Number(searchParams.get('valor_max')))
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
```

- [ ] **Step 3: Criar `app/api/busca/tempo-real/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { coletarPNCP } from '@/lib/scrapers/pncp'
import { coletarComprasNet } from '@/lib/scrapers/comprasnet'
import { salvarLicitacoes } from '@/lib/scrapers/salvar'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const hoje = new Date().toISOString().substring(0, 10)

  const [pncp, comprasnet] = await Promise.allSettled([
    coletarPNCP(hoje, hoje),
    coletarComprasNet(hoje),
  ])

  const novas = [
    ...(pncp.status === 'fulfilled' ? pncp.value : []),
    ...(comprasnet.status === 'fulfilled' ? comprasnet.value : []),
  ]

  const salvas = await salvarLicitacoes(novas)

  return NextResponse.json({ ok: true, novas: salvas })
}
```

- [ ] **Step 4: Commit**

```bash
git add app/api/
git commit -m "feat: APIs de licitações e busca (banco local + tempo real)"
```

---

### Task 19: Dashboard principal

**Files:**
- Modify: `app/(dashboard)/page.tsx`

- [ ] **Step 1: Substituir o placeholder pelo dashboard real**

```typescript
'use client'

import { useEffect, useState } from 'react'

type Licitacao = {
  id: string
  orgao: string
  objeto: string
  valor_estimado?: number
  data_abertura?: string
  url: string
  estado?: string
  cidade?: string
  fonte: string
  alertas: { keywords: { termo: string } }[]
}

export default function DashboardPage() {
  const [licitacoes, setLicitacoes] = useState<Licitacao[]>([])
  const [carregando, setCarregando] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState('')

  async function carregar() {
    setCarregando(true)
    const params = new URLSearchParams()
    if (filtroEstado) params.set('estado', filtroEstado)

    const res = await fetch(`/api/licitacoes?${params}`)
    setLicitacoes(await res.json())
    setCarregando(false)
  }

  useEffect(() => { carregar() }, [filtroEstado])

  const estados = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <select
          value={filtroEstado}
          onChange={e => setFiltroEstado(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Todos os estados</option>
          {estados.map(uf => <option key={uf} value={uf}>{uf}</option>)}
        </select>
      </div>

      {carregando ? (
        <p className="text-gray-500">Carregando licitações...</p>
      ) : licitacoes.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-gray-500">Nenhuma licitação encontrada com match nas palavras-chave.</p>
          <p className="text-gray-400 text-sm mt-2">Cadastre palavras-chave na tela de Palavras-chave para começar.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {licitacoes.map(l => (
            <div key={l.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {l.alertas?.map((a, i) => (
                      <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        {a.keywords?.termo}
                      </span>
                    ))}
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{l.fonte}</span>
                    {l.estado && <span className="text-xs text-gray-400">{l.cidade ? `${l.cidade}/${l.estado}` : l.estado}</span>}
                  </div>
                  <p className="font-medium text-gray-900 text-sm">{l.orgao}</p>
                  <p className="text-gray-600 text-sm mt-1">{l.objeto}</p>
                </div>
                <div className="text-right shrink-0">
                  {l.valor_estimado && (
                    <p className="font-semibold text-gray-900 text-sm">
                      R$ {l.valor_estimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  )}
                  {l.data_abertura && (
                    <p className="text-xs text-gray-500 mt-1">Abertura: {l.data_abertura}</p>
                  )}
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline mt-2 block"
                  >
                    Ver edital →
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/
git commit -m "feat: dashboard com listagem de licitações com match"
```

---

### Task 20: Tela de busca manual

**Files:**
- Create: `app/(dashboard)/busca/page.tsx`

- [ ] **Step 1: Criar `app/(dashboard)/busca/page.tsx`**

```typescript
'use client'

import { useState } from 'react'

type Licitacao = {
  id: string
  orgao: string
  objeto: string
  valor_estimado?: number
  data_abertura?: string
  url: string
  estado?: string
  cidade?: string
  fonte: string
}

export default function BuscaPage() {
  const [termo, setTermo] = useState('')
  const [estado, setEstado] = useState('')
  const [valorMin, setValorMin] = useState('')
  const [valorMax, setValorMax] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [resultados, setResultados] = useState<Licitacao[]>([])
  const [buscando, setBuscando] = useState(false)
  const [buscandoTempoReal, setBuscandoTempoReal] = useState(false)
  const [buscouUmaVez, setBuscouUmaVez] = useState(false)

  const estados = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

  async function buscar(e: React.FormEvent) {
    e.preventDefault()
    setBuscando(true)
    setBuscouUmaVez(true)

    const params = new URLSearchParams()
    if (termo) params.set('q', termo)
    if (estado) params.set('estado', estado)
    if (valorMin) params.set('valor_min', valorMin)
    if (valorMax) params.set('valor_max', valorMax)
    if (dataInicio) params.set('data_inicio', dataInicio)

    const res = await fetch(`/api/busca?${params}`)
    setResultados(await res.json())
    setBuscando(false)
  }

  async function buscarTempoReal() {
    setBuscandoTempoReal(true)
    await fetch('/api/busca/tempo-real')
    setBuscandoTempoReal(false)
    buscar(new Event('submit') as any)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Busca</h2>

      <form onSubmit={buscar} className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar por objeto</label>
            <input
              value={termo}
              onChange={e => setTermo(e.target.value)}
              placeholder="Ex: notebook, cadeira, retroescavadeira..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={estado}
              onChange={e => setEstado(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Todos</option>
              {estados.map(uf => <option key={uf} value={uf}>{uf}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data de abertura a partir de</label>
            <input
              type="date"
              value={dataInicio}
              onChange={e => setDataInicio(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valor mínimo (R$)</label>
            <input
              type="number"
              value={valorMin}
              onChange={e => setValorMin(e.target.value)}
              placeholder="0"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valor máximo (R$)</label>
            <input
              type="number"
              value={valorMax}
              onChange={e => setValorMax(e.target.value)}
              placeholder="Sem limite"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={buscando}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {buscando ? 'Buscando...' : 'Buscar no banco'}
          </button>
          <button
            type="button"
            onClick={buscarTempoReal}
            disabled={buscandoTempoReal}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 disabled:opacity-50 transition"
          >
            {buscandoTempoReal ? 'Atualizando...' : '🔄 Buscar agora nas fontes'}
          </button>
        </div>
      </form>

      {buscouUmaVez && (
        resultados.length === 0 ? (
          <p className="text-gray-500 text-sm">Nenhum resultado encontrado.</p>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">{resultados.length} resultado(s)</p>
            {resultados.map(l => (
              <div key={l.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{l.fonte}</span>
                      {l.estado && <span className="text-xs text-gray-400">{l.cidade ? `${l.cidade}/${l.estado}` : l.estado}</span>}
                    </div>
                    <p className="font-medium text-gray-900 text-sm">{l.orgao}</p>
                    <p className="text-gray-600 text-sm mt-1">{l.objeto}</p>
                  </div>
                  <div className="text-right shrink-0">
                    {l.valor_estimado && (
                      <p className="font-semibold text-gray-900 text-sm">
                        R$ {l.valor_estimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    )}
                    {l.data_abertura && <p className="text-xs text-gray-500 mt-1">Abertura: {l.data_abertura}</p>}
                    <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-2 block">
                      Ver edital →
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/
git commit -m "feat: tela de busca manual com filtros"
```

---

### Task 21: Histórico de alertas

**Files:**
- Create: `app/api/alertas/route.ts`
- Create: `app/(dashboard)/alertas/page.tsx`

- [ ] **Step 1: Criar `app/api/alertas/route.ts`**

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('alertas')
    .select(`
      id, enviado_em, canais,
      licitacoes(orgao, objeto, url, estado, cidade),
      keywords(termo)
    `)
    .order('enviado_em', { ascending: false })
    .limit(100)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
```

- [ ] **Step 2: Criar `app/(dashboard)/alertas/page.tsx`**

```typescript
'use client'

import { useEffect, useState } from 'react'

type Alerta = {
  id: string
  enviado_em: string
  canais: string[]
  licitacoes: { orgao: string; objeto: string; url: string; estado?: string; cidade?: string }
  keywords: { termo: string }
}

export default function AlertasPage() {
  const [alertas, setAlertas] = useState<Alerta[]>([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    fetch('/api/alertas')
      .then(r => r.json())
      .then(data => { setAlertas(data); setCarregando(false) })
  }, [])

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Histórico de Alertas</h2>

      {carregando ? (
        <p className="text-gray-500">Carregando...</p>
      ) : alertas.length === 0 ? (
        <p className="text-gray-500">Nenhum alerta enviado ainda.</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {alertas.map(a => (
            <div key={a.id} className="p-4 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    {a.keywords?.termo}
                  </span>
                  {a.canais.map(canal => (
                    <span key={canal} className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      {canal}
                    </span>
                  ))}
                </div>
                <p className="font-medium text-gray-900 text-sm">{a.licitacoes?.orgao}</p>
                <p className="text-gray-600 text-sm mt-0.5">{a.licitacoes?.objeto?.substring(0, 120)}...</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-gray-400">
                  {new Date(a.enviado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
                <a href={a.licitacoes?.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-1 block">
                  Ver edital →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add app/
git commit -m "feat: histórico de alertas enviados"
```

---

### Task 22: Deploy na Vercel e configuração de variáveis

- [ ] **Step 1: Criar repositório no GitHub**

```bash
git remote add origin https://github.com/SEU_USUARIO/monitor-licitacoes.git
git branch -M main
git push -u origin main
```

- [ ] **Step 2: Conectar projeto na Vercel**

1. Acessar vercel.com → New Project
2. Importar o repositório do GitHub
3. Framework: Next.js (detectado automaticamente)
4. Clicar em Deploy

- [ ] **Step 3: Configurar variáveis de ambiente na Vercel**

No painel da Vercel → Settings → Environment Variables, adicionar todas as variáveis do `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
GEMINI_API_KEY
RESEND_API_KEY
EMAIL_DESTINATARIOS
EMAIL_REMETENTE
TELEGRAM_BOT_TOKEN
TELEGRAM_CHAT_ID
CRON_SECRET
NEXT_PUBLIC_APP_URL  ← usar a URL gerada pela Vercel
```

- [ ] **Step 4: Criar usuários no Supabase**

No Supabase → Authentication → Users → Add User → criar contas para você e sua equipe.

- [ ] **Step 5: Testar o cron manualmente**

```bash
curl -H "Authorization: Bearer SEU_CRON_SECRET" https://SEU_DOMINIO.vercel.app/api/cron/coletar
```

Verificar no Supabase se licitações foram coletadas.

- [ ] **Step 6: Commit final**

```bash
git add .
git commit -m "chore: configuração de deploy Vercel"
git push
```

---

## Serviços externos a configurar (antes de rodar)

| Serviço | O que fazer | Link |
|---|---|---|
| Supabase | Criar projeto gratuito, executar migration SQL | supabase.com |
| Google Gemini | Criar projeto no Google AI Studio, gerar API key | aistudio.google.com |
| Resend | Criar conta, verificar domínio de e-mail | resend.com |
| Telegram | Criar bot com @BotFather, criar grupo, adicionar bot | t.me/BotFather |
| Vercel | Criar conta, conectar GitHub | vercel.com |

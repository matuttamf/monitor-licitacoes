# Monitor de Licitações — Especificação de Design

**Data:** 2026-06-04
**Status:** Aprovado

---

## 1. Objetivo

Sistema web para monitorar licitações públicas brasileiras (prefeituras, estados, governo federal, autarquias, empresas públicas), com alertas automáticos diários e busca manual. Uso interno da empresa — não é uma plataforma pública.

---

## 2. Usuários

- Acesso restrito: contas criadas manualmente pelo administrador no Supabase Auth
- Login via e-mail + senha
- Todos os usuários veem o mesmo painel e as mesmas licitações
- Sem cadastro público, sem planos, sem billing

---

## 3. Arquitetura

**Abordagem:** Monolito Next.js hospedado na Vercel (Abordagem A)

```
Next.js (Vercel)
├── Painel Web (App Router, páginas protegidas por auth)
├── API Routes (autenticação, dados, busca)
└── Cron Jobs (scrapers diários, matching, alertas)
        │
        ├── Supabase (PostgreSQL + Auth)
        ├── Google Gemini API (matching semântico)
        ├── Resend (e-mail)
        └── Telegram Bot API (mensagens)
```

---

## 4. Banco de Dados (Supabase)

### `keywords`
| Campo | Tipo | Descrição |
|---|---|---|
| id | uuid | PK |
| termo | text | Ex: "notebook", "cadeira ergonômica" |
| ativo | boolean | Se está sendo monitorado |
| criado_em | timestamptz | |

### `licitacoes`
| Campo | Tipo | Descrição |
|---|---|---|
| id | uuid | PK |
| fonte | text | PNCP, ComprasNet, BLL, etc. |
| numero_edital | text | Número do edital na fonte |
| orgao | text | Nome do órgão licitante |
| objeto | text | Descrição do que está sendo licitado |
| valor_estimado | numeric | Valor estimado (quando disponível) |
| data_abertura | date | Data de abertura das propostas |
| url | text | Link direto para o edital original |
| estado | text | UF |
| cidade | text | |
| coletado_em | timestamptz | |

### `alertas`
| Campo | Tipo | Descrição |
|---|---|---|
| id | uuid | PK |
| licitacao_id | uuid | FK → licitacoes |
| keyword_id | uuid | FK → keywords |
| enviado_em | timestamptz | |
| canais | text[] | ["email", "telegram"] |

---

## 5. Coleta de Dados (Scrapers)

Um scraper independente por fonte, todos disparados pelo cron diário.

### Fontes com API oficial (estáveis)
- **PNCP** — Portal Nacional de Contratações Públicas (API REST oficial)
- **ComprasNet** — pregões federais

### Fontes via scraping (podem quebrar se o site mudar)
- **BLL** — Bolsa de Licitações e Leilões (muito usada por municípios)
- **Licitações-e** — portal do Banco do Brasil
- **Portais estaduais** — CAUFESP/SP, SEJEL/MG, e outros
- **Querido Diário** — API da Open Knowledge Brasil para diários oficiais (federal + estaduais)

### Cobertura resultante
- ✅ Governo Federal, Estados, Municípios, Autarquias, Empresas Públicas
- ⚠️ ONGs apenas quando operam com recursos públicos
- ❌ Empresas privadas (não licitam)

### Deduplicação
Antes de salvar, verificar se `(fonte + numero_edital)` já existe no banco para evitar duplicatas.

---

## 6. Matching Semântico com Gemini

Após cada coleta, para cada licitação nova:
1. Enviar o campo `objeto` da licitação ao Gemini
2. Perguntar se há relação semântica com alguma das palavras-chave ativas
3. Gemini retorna quais keywords tiveram match e o grau de confiança
4. Salvar matches na tabela `alertas`

O matching semântico permite encontrar licitações por sinônimos e contexto, não apenas texto exato. Ex: keyword "notebook" → match em *"aquisição de computadores portáteis"*.

---

## 7. Alertas

**Frequência:** Uma vez por dia, após a coleta (cron à meia-noite)

**E-mail (Resend):**
- Um único e-mail consolidado por dia com todas as novas licitações com match
- Layout: tabela com objeto, órgão, valor estimado, data de abertura e link
- Destinatários: lista fixa configurada via variável de ambiente
- Cota gratuita: 3.000 e-mails/mês (suficiente)

**Telegram:**
- Bot ligado a um grupo da empresa
- Uma mensagem diária consolidada
- Formato: lista com emoji, nome do órgão, objeto resumido e link

**WhatsApp:** fora do escopo (API oficial tem custo; alternativas não-oficiais são instáveis)

**Controle de duplicatas:** tabela `alertas` registra o que foi enviado; licitações já alertadas não são reenviadas.

---

## 8. Painel Web

### Telas

**Login** — e-mail + senha via Supabase Auth

**Dashboard**
- Lista de licitações com match nas palavras-chave ativas
- Filtros: data de abertura, estado/cidade, palavra-chave, fonte, valor estimado
- Ordenação por data

**Busca Manual**
- Campo de texto livre
- Filtros: estado, cidade, data, valor mínimo/máximo
- Busca primeiro no banco local
- Botão "Buscar agora nas fontes" para consulta em tempo real nas APIs externas

**Detalhe da Licitação**
- Todos os campos + link direto para o edital original

**Palavras-chave**
- Listar, adicionar, editar e desativar termos monitorados

**Histórico de Alertas**
- Log de todos os alertas enviados: data, licitação, keyword, canais utilizados

---

## 9. Stack Tecnológica

| Camada | Tecnologia | Custo |
|---|---|---|
| Frontend + Backend | Next.js 15 (App Router) | Gratuito |
| Deploy | Vercel | Gratuito |
| Banco de dados | Supabase (PostgreSQL) | Gratuito |
| Autenticação | Supabase Auth | Gratuito |
| IA / matching | Google Gemini API | Gratuito |
| E-mail | Resend | Gratuito até 3k/mês |
| Telegram | Bot API | Gratuito |
| Cron jobs | Vercel Cron | Gratuito |
| Scraping | Playwright (headless) | Gratuito |

**Custo total estimado: R$ 0,00/mês**

---

## 10. Fora do Escopo (v1)

- WhatsApp
- Cadastro público de usuários
- Planos / billing
- App mobile
- Exportação de relatórios (PDF/Excel)
- Integração com sistemas de CRM

# Fase 3 — Plano de Refatoração e Modernização

**Projeto:** Obra Integrada
**Data:** 24 de abril de 2026
**Escopo:** Decisões arquiteturais (ADRs), plano de limpeza imediata e roadmap de refatoração incremental (Meses 1-6)

---

## Sumário executivo

Este artefato consolida **10 Architecture Decision Records (ADRs)** no formato de Michael Nygard (*Documenting Architecture Decisions*, 2011), um **plano de limpeza de 2 semanas** para remover débito óbvio, e um **roadmap de 6 meses** de PRs sequenciais em ordem de dependência.

As decisões arquiteturais são apresentadas como **recomendações fundamentadas** — não imposições. Cada ADR lista o problema, pelo menos 2 opções com prós/contras, e a recomendação. O time é livre para discordar em Review, documentando a divergência como ADR-XXX-accepted/superseded.

O plano de refatoração segue o princípio **Strangler Fig Pattern** (Martin Fowler, 2004): em vez de *big-bang rewrite*, refatorações convivem com o código legado; PRs pequenos, reversíveis, com testes que preservam comportamento.

---

## 3.1. Decisões arquiteturais (ADRs propostos)

### ADR-001 — Manter JavaScript ou migrar para TypeScript?

**Status:** Proposto
**Contexto:** O backend é 100% JavaScript ESM. O frontend mistura `.jsx` e `.tsx` (15 arquivos TS de 80+). O linter do frontend ignora `.tsx` (`--ext js,jsx`). O projeto tem 24 meses para crescer de ~15 mil para estimados 50 mil linhas.

#### Opções

**Opção A — Manter JavaScript em ambos**
- Prós: zero custo de migração; equipe não precisa aprender TS; build mais simples
- Contras: sem tipos em domínio crítico (ex: `tb_obra` tem 28 campos; erro de digitação é `undefined` em runtime); refactors grandes são arriscados; IDE oferece menos ajuda; onboarding é mais lento

**Opção B — TypeScript no backend + completar TS no frontend**
- Prós: integração natural com Prisma (já gera tipos); refactors seguros; IDE poderosa; contratos de API compartilháveis (monorepo); atrai desenvolvedores (mercado demanda TS)
- Contras: curva de aprendizado inicial (~2 semanas para dev sem exposição); build mais lento (~30%); complexidade de tsconfig; exige disciplina

**Opção C — TypeScript só em código novo (strangler)**
- Prós: migração incremental; time aprende gradualmente; código existente continua funcionando
- Contras: dois padrões coexistindo por muito tempo; `any` fácil em fronteiras; linter precisa de duas regras

#### Recomendação

**Opção C com meta de migração para Opção B em 12 meses.** Todo código novo (controllers, services, componentes) a partir do Mês 3 deve ser TypeScript. Refatoração de código legado acontece oportunisticamente (quando uma função já será tocada, migra-se o arquivo inteiro). Meta ao fim do Mês 12: >70% dos arquivos `.ts`/`.tsx`.

**Fundamentação:** Reduz risco de big-bang rewrite. Princípio *Make the change easy, then make the easy change* (Kent Beck).

---

### ADR-002 — Storage de uploads (Supabase Storage × Cloudflare R2 × AWS S3)

**Status:** Proposto
**Contexto:** `multer.diskStorage` é incompatível com Vercel. Diário, documentos e comprovantes financeiros dependem de storage persistente. Decisão afeta Features 01, 05, 06, 07, 15 do artefato 02.

#### Opções

**Opção A — Supabase Storage**
- Prós: integra com Postgres da Supabase (se adotado); free tier 1 GB; RLS (Row Level Security) por usuário; SDK maduro; região sa-east-1
- Contras: atrela projeto ao Supabase; custo cresce com egress; menor ecosistema vs AWS

**Opção B — Cloudflare R2**
- Prós: S3-compatível; **egress grátis** (diferencial enorme); barato (US$0.015/GB/mês); ecosistema Cloudflare
- Contras: sem região BR (us-east/eu-west); SDK menos maduro; signed URLs menos flexíveis

**Opção C — AWS S3**
- Prós: padrão da indústria; ecosistema amplo; região sa-east-1
- Contras: custo de egress considerável; setup IAM mais complexo; overkill para projeto acadêmico

#### Recomendação

**Opção A — Supabase Storage**, com interface `IStorageAdapter` em `storageService.js` que permita trocar para R2 em 2-3 dias de trabalho se for necessário. A adoção do Supabase como Postgres (ADR-010 implícito) se alinha com essa escolha.

**Fundamentação:** *Last responsible moment* (Lean Software Development). Começar simples, trocar quando o problema real aparecer. Abstração fina torna a troca possível sem reescrever todo o código.

---

### ADR-003 — Validação de schema (Zod × Joi × Yup × Valibot)

**Status:** Proposto
**Contexto:** Validação hoje é manual com regex dispersa. Vazam erros 500 para o usuário. Toda rota de input precisa de validação declarativa.

#### Opções

**Opção A — Zod**
- Prós: integração TypeScript nativa (tipo inferido); API ergonomica; ecosistema (tRPC, react-hook-form resolver); tamanho razoável (~60 KB min+gzip)
- Contras: um pouco mais lento que Joi em benchmarks sintéticos; sem i18n nativo

**Opção B — Joi**
- Prós: maduro; rico em features; suporte i18n; usado pelo Hapi
- Contras: sem tipos TS bons; API mais verbosa; não "nasceu" TS

**Opção C — Yup**
- Prós: familiaridade no mundo react-hook-form; sintaxe clean
- Contras: menor ecosistema hoje em 2026; tipos TS menos precisos que Zod

**Opção D — Valibot**
- Prós: **menor tamanho** (~2 KB tree-shakeable); API funcional moderna; muito rápido
- Contras: jovem (2024); menor ecosistema; menos material didático

#### Recomendação

**Opção A — Zod.** Padrão de fato em 2026 para stacks TypeScript. Integra com react-hook-form (frontend) e com `@anatine/zod-openapi` para gerar OpenAPI do backend. Compartilhável entre FE e BE em monorepo.

Exemplo de uso esperado:

```typescript
// schemas/obra.schema.ts
import { z } from 'zod';
export const CriarObraSchema = z.object({
  nome: z.string().min(3).max(255),
  tipo_obra: z.enum(['residencial', 'comercial', 'industrial']).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  valor_orcado: z.number().positive().optional(),
});
export type CriarObraInput = z.infer<typeof CriarObraSchema>;

// middleware validate()
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: 'VALIDATION', issues: result.error.issues });
  req.body = result.data;
  next();
};
```

**Fundamentação:** Single Source of Truth (SSoT) — schema vira tipo TS e validador runtime simultaneamente.

---

### ADR-004 — Estratégia de testes (unitário × integração × E2E, meta de cobertura)

**Status:** Proposto
**Contexto:** Testes atuais são mocks; cobertura efetiva é <5%. Definir pirâmide, tooling, meta.

#### Opções

**Opção A — Pirâmide clássica (Mike Cohn)**: 70% unit, 20% integração, 10% E2E
- Prós: padrão maduro; rápido em CI; isolamento bom
- Contras: unit tests com mocks não capturam problemas de integração com Prisma; demanda disciplina

**Opção B — Testing Trophy (Kent C. Dodds)**: 10% static (linter, TS), 20% unit, 50% integração, 20% E2E
- Prós: confiança maior; integração é onde a maioria dos bugs vive; TS + ESLint são "grátis"
- Contras: testes de integração são mais lentos; exige fixtures/seeds consistentes

**Opção C — Pragmático: cobertura alta onde importa, baixa onde não importa**
- Prós: foco em ROI; não persegue métricas vazias
- Contras: subjetivo; difícil de auditar em PR review

#### Recomendação

**Opção B — Testing Trophy**, adaptada:

| Tipo | Ferramenta | Cobertura esperada | Roda em |
|---|---|---|---|
| Static (TS strict, ESLint) | `tsc --noEmit`, `eslint` | 100% | Pre-commit + CI |
| Unit (funções puras, services) | Vitest | ≥70% das services | CI a cada PR |
| Integração API (com Postgres de teste) | Vitest + supertest + testcontainers | ≥60% das rotas | CI a cada PR (pode rodar paralelo) |
| E2E (fluxos críticos) | Playwright | 5 fluxos: login, criar obra, registrar diário com foto, criar tarefa, upload financeiro | CI noturno + pré-merge em `main` |

**Meta ao fim do Mês 6:** cobertura total ≥60% por linhas e ≥80% para módulos críticos (auth, obra, diário).

**Remoção dos testes-mock atuais:** deletar ou reescrever `api.test.js` e `rh.test.js` na Semana 1.

**Fundamentação:** Testing Trophy é o modelo moderno para apps que integram com banco e APIs externas. Cohn Pyramid foi escrita em 2009; web moderna é diferente.

---

### ADR-005 — Gerenciamento de estado no frontend

**Status:** Proposto
**Contexto:** Frontend usa React Context (Auth, Theme, Sidebar) + fetch manual. Não há cache, refetch, retry. Cada página trata 401 individualmente. Não usa TanStack Query, Zustand, Redux.

#### Opções

**Opção A — TanStack Query + Context para sessão**
- Prós: cache automático; stale-while-revalidate; retry; devtools; integra com fetch/axios existente; separação clara: *server state* (TanStack Query) vs *client state* (Context)
- Contras: conceito de queryKey exige disciplina; bundle ~13 KB gzipped

**Opção B — Zustand + fetch manual**
- Prós: leve (~3 KB); API simples; substitui múltiplos Contexts
- Contras: não resolve problema de cache/retry; força o time a implementar manualmente

**Opção C — Redux Toolkit + RTK Query**
- Prós: maduro; padrão corporativo; Redux DevTools famosas
- Contras: boilerplate maior; overkill para escala atual; learning curve

**Opção D — Manter Context + interceptor centralizado**
- Prós: zero nova dependência; foca no problema real (interceptor)
- Contras: não resolve cache; refetch manual continua

#### Recomendação

**Opção A — TanStack Query** para todo server state (obras, tarefas, diário, usuários). **Context permanece para Auth, Theme, Sidebar.** Adicionalmente, criar um `apiClient` com interceptor de 401 que dispara logout e redireciona.

**Fundamentação:** Separar *server state* de *client state* é o consenso de arquitetura frontend moderna (ver Dan Abramov, "*Before You Memo*" e Kent C. Dodds, "*Application State Management*"). Cache automático elimina dezenas de bugs de stale data.

Implementação sugerida (após ADR-001 em TS):

```typescript
// hooks/useObra.ts
export const useObra = (id: number) => useQuery({
  queryKey: ['obra', id],
  queryFn: () => apiClient.get(`/api/obras/${id}`),
  staleTime: 1000 * 30, // 30s
});
```

---

### ADR-006 — Component library

**Status:** Proposto
**Contexto:** Frontend usa Tailwind 4 + componentes customizados. Não há design system externo. Há duplicações (`Header.tsx`, `ThemeToggleButton.tsx` vs `ThemeTogglerTwo.tsx`).

#### Opções

**Opção A — shadcn/ui**
- Prós: **não é lib, são componentes copiados para o repo** — total controle; usa Radix primitives (acessibilidade OOTB); Tailwind-nativo; padrão em 2026 para stacks React modernas; dark mode funcional out-of-the-box
- Contras: exige copiar componentes (CLI `npx shadcn add`); não recebe updates automáticos (é intencional)

**Opção B — Mantine**
- Prós: rico em componentes (150+); ótima documentação; hooks úteis; suporte nativo a dark mode
- Contras: CSS-in-JS próprio (não Tailwind); pesado (~300 KB); travado em decisões visuais

**Opção C — Chakra UI v3**
- Prós: documentação exemplar; componentes acessíveis; sistema de temas flexível
- Contras: v3 reestruturou API (migração de apps em v2 é custosa); Emotion runtime; peso ~250 KB

**Opção D — Construir tudo do zero**
- Prós: zero dependência
- Contras: custo alto de implementar acessibilidade correta (WAI-ARIA, foco, teclado); reinventa roda

#### Recomendação

**Opção A — shadcn/ui**. É a escolha que melhor se alinha ao stack existente (Tailwind 4) e não acrescenta runtime significativo. Cada componente que for adicionado entra em `components/ui/` e pode ser customizado livremente.

Primeiros componentes a migrar/adicionar: `Button`, `Input`, `Dialog`, `Toast` (substituir react-hot-toast), `DropdownMenu`, `Tabs`, `Table`, `Form` (integra com react-hook-form).

**Fundamentação:** Ownership + acessibilidade + Tailwind-nativo. Todas as 3 opções alternativas tem 2-3 anos de maturidade a menos em 2026.

---

### ADR-007 — Estrutura de monorepo

**Status:** Proposto
**Contexto:** Hoje é um "monorepo de fato" sem ferramenta — `package.json` raiz orquestra via concurrently, mas com deps duplicadas. Há apenas 2 apps (backend, frontend); pode chegar a 3-4 (mobile, admin, landing).

#### Opções

**Opção A — Manter estrutura atual sem ferramenta**
- Prós: zero complexidade
- Contras: dev experience ruim; deps duplicadas; builds independentes

**Opção B — npm workspaces**
- Prós: **zero dependência nova** (built-in no npm 7+); simples; `npm install` da raiz instala tudo; `package.json` por app
- Contras: sem cache de tarefas; sem pipeline de builds paralelos sofisticados

**Opção C — pnpm workspaces**
- Prós: mais rápido (~30%); usa menos disco (store global); suporte nativo a workspaces; compatível com npm
- Contras: troca de package manager (exige alinhamento do time e de CI/CD)

**Opção D — Turborepo**
- Prós: cache distribuído; pipeline inteligente (só builda o que mudou); integra com Vercel
- Contras: exige `turbo.json` + disciplina; overkill abaixo de 5 apps

#### Recomendação

**Opção B — npm workspaces**, com possibilidade de adicionar Turborepo no Mês 12+ quando houver 4+ pacotes. Mudança para pnpm é opcional e pode ser considerada mais tarde se builds estiverem lentos.

Estrutura proposta:

```
obra-integrada/
├── package.json              # root workspace
├── package-lock.json         # único lock
├── apps/
│   ├── api/                  # ← backend (renomeado)
│   └── web/                  # ← frontend/vite-project (renomeado)
├── packages/
│   └── shared-schemas/       # schemas Zod + tipos compartilhados FE↔BE
```

**Fundamentação:** Evitar complexidade prematura. npm workspaces atende o caso por 12+ meses.

---

### ADR-008 — Observabilidade

**Status:** Proposto
**Contexto:** Hoje logs vão para console da Vercel, sem contexto; sem alertas; sem APM.

#### Opções

**Opção A — Sentry**
- Prós: líder em error tracking frontend + backend; free tier 5k errors/mês; source maps; breadcrumbs; alertas Slack
- Contras: foca em erros, não em performance/traces completos

**Opção B — Axiom**
- Prós: log aggregation moderno; SQL sobre logs; integrado com Vercel (plugin oficial); free tier generoso
- Contras: menos maduro em error tracking

**Opção C — BetterStack (Logtail + Uptime)**
- Prós: combina logs + uptime + status page; preço competitivo
- Contras: menos recursos que Sentry em error tracking

**Opção D — Datadog**
- Prós: APM completo (traces, métricas, logs, RUM)
- Contras: preço alto (não cabe em projeto acadêmico); setup pesado

#### Recomendação

**Combinação Opção A + Opção B: Sentry para erros + Axiom para logs estruturados.** Ambos tem integrações 1-click com Vercel. Free tiers cobrem o projeto por toda duração.

Configuração esperada:
- Frontend: `@sentry/react` com source maps no build
- Backend: `@sentry/node` + integração Express
- Pino logger exportando para Axiom

**Fundamentação:** Observabilidade é o item mais subestimado no custo de manutenção. Ter Sentry desde cedo evita debugar problemas cegamente.

---

### ADR-009 — CI/CD (GitHub Actions)

**Status:** Proposto
**Contexto:** Sem CI hoje. Workflows necessários detalhados no artefato 04.

#### Opções

**Opção A — GitHub Actions**
- Prós: grátis para repos públicos (2000 min/mês para privados); ecosistema enorme de actions; integra nativamente com GitHub
- Contras: vendor lock-in

**Opção B — CircleCI / GitLab CI**
- Prós: alternativas maduras
- Contras: exige configurar hosting; não agrega valor sobre Actions para este projeto

#### Recomendação

**Opção A — GitHub Actions**. Sem discussão — é o padrão para projetos hospedados no GitHub.

Workflows mínimos (conteúdo completo no artefato 04):
1. **ci.yml** — a cada PR: lint + TS check + unit + integração
2. **preview-comment.yml** — postar URL da preview Vercel no PR
3. **prisma-check.yml** — bloquear merge se há migration não aplicada

Workflows para fases posteriores (Mês 3+):
4. **e2e.yml** — noturno com Playwright contra staging
5. **security.yml** — npm audit + Dependabot

---

### ADR-010 — Ambientes (dev / staging / produção)

**Status:** Proposto
**Contexto:** Hoje há apenas `dev` local + deploys na Vercel (preview + produção). Sem staging separado. Banco é o mesmo para todos os devs.

#### Opções

**Opção A — Mono-ambiente (apenas prod)**
- Prós: simples
- Contras: devs testam em produção; risco inaceitável para dados reais

**Opção B — Dev local + Preview Vercel + Produção**
- Prós: grátis; cada PR tem preview isolado
- Contras: previews compartilham banco com produção por default; confusão de dados

**Opção C — Dev + Staging + Produção com bancos separados**
- Prós: segurança de dados; permite migrations em staging antes de prod
- Contras: exige 2-3 bancos hospedados; complexidade de config

#### Recomendação

**Opção C** com configuração:

| Ambiente | Vercel | Postgres | Branch |
|---|---|---|---|
| Dev | Local (vite + nodemon) | Local Docker ou Neon branch | qualquer |
| Preview | Automático por PR | Neon branch descartável ou Supabase branch | `feature/*`, `fix/*` |
| Staging | `staging.obra-integrada.vercel.app` | DB dedicado | branch `develop` |
| Produção | `obra-integrada.vercel.app` | DB produção | branch `main` |

**Postgres managed providers com "branching":**
- **Neon** ⭐ — primeiro Postgres com branching instantâneo (como Git); cada PR pode ter banco isolado
- **Supabase** — dá branching em beta; combina com ADR-002
- **Railway** — simples, mas sem branching nativo

**Recomendação combinada:** **Neon** para Postgres (diferencial: branching permite preview de PR com banco próprio, sem interferir em staging). Se Supabase for adotado por Storage (ADR-002), pode-se usar também por Postgres para simplificar — trade-off entre menos providers vs features de branching.

**Fundamentação:** 12-Factor App, fator X — "Dev/prod parity"; ambientes devem ser o mais parecidos possível.

---

## 3.2. Plano de limpeza imediata (Semanas 1-2)

Antes de qualquer nova funcionalidade, o repositório deve passar por higiene. Cada item é um PR pequeno (<200 linhas alteradas) em sequência. Tempo total estimado: **2 devs × 1 semana** (ou 1 dev × 2 semanas).

### 3.2.1. Semana 1 — Crítico e bloqueadores

| # | PR | Alvo | Ação | Risco | Verificação |
|---|---|---|---|---|---|
| 1 | `chore: remove orphaned server.js and legacy files` | `server.js` (raiz), `backend/src/database/{obras,users}.json`, `backend/standalone_users_server.js`, `backend/strip_maps.js`, `backend/check_db.mjs` | `git rm` | Baixo — nenhum é importado | `grep -r "server.js" --include='*.js'` não mostra imports |
| 2 | `chore: remove orphaned seed scripts` | `backend/seed_*.mjs` (5 arquivos), `backend/seed_out.txt`, `backend/src/seed.js` duplicado | `git rm`; manter apenas `backend/src/prisma/seed.js` | Baixo | `npm run seed` ainda funciona |
| 3 | `chore: remove legacy schema and dev.db` | `backend/src/prisma/schema.prisma.postgres`, `backend/src/prisma/dev.db` | `git rm --cached dev.db` + add ao `.gitignore` | Baixo | `npx prisma validate` passa |
| 4 | `chore: consolidate .gitignore` | `.gitignore` raiz, `backend/.gitignore`, `backend/src/.gitignore` | Unificar em raiz: `node_modules`, `.env*`, `.vite/`, `coverage/`, `dev.db`, `uploads/*` (com exceção), `dist/`, `build/` | Baixo | `git status` mostra estado esperado |
| 5 | `chore: add .vercelignore` | Novo arquivo `/vercelignore` | `node_modules`, `.env*`, `dev.db`, `coverage/`, `docs/`, `*.md` (exceto README), `backend/uploads/`, `.vite/` | Baixo | Simular deploy em conta Vercel; ver manifest |
| 6 | `chore: add .env.example` | `apps/api/.env.example`, `apps/web/.env.example` | Documentar todas as vars identificadas na Seção 1.5.4 | Baixo | Revisão humana |
| 7 | `fix(security): require JWT_SECRET env var` | `backend/src/middlewares/authMiddleware.js`, `backend/src/controllers/userController.js` | Remover fallback `"SUPER_SECRET"`; startup fails-fast se var ausente | **Médio** — requer adicionar var em todos ambientes antes | Testes de login em cada ambiente |
| 8 | `fix(security): restrict CORS to FRONTEND_URL` | `backend/src/server.js` | `cors({ origin: process.env.FRONTEND_URL, credentials: true })` | Médio — pode quebrar localhost | Adicionar `http://localhost:*` em dev |
| 9 | `fix(security): add requireRole to admin metrics` | `backend/src/routes/adminRoutes.js:20` | Adicionar `requireRole('ADMIN_MASTER', 'ADMIN')` | Baixo | Teste: user comum recebe 403 |
| 10 | `fix(security): add requireObraAccess to DELETE financeiro` | `backend/src/routes/financeiroRoutes.js:43` | Adicionar middleware | Baixo | Teste: user sem acesso recebe 403 |

### 3.2.2. Semana 2 — Reestruturação leve e higiene frontend

| # | PR | Alvo | Ação | Risco |
|---|---|---|---|---|
| 11 | `chore(monorepo): restructure to apps/api and apps/web` | Rename `backend/` → `apps/api/`, `frontend/vite-project/` → `apps/web/` | `git mv` + atualizar scripts raiz + Vercel root directories | Médio — exige atualizar config Vercel dos 2 projetos antes do merge |
| 12 | `chore: enable npm workspaces in root package.json` | `package.json` raiz | Adicionar `"workspaces": ["apps/*", "packages/*"]`; remover deps duplicadas da raiz | Médio — quebra `npm start` legacy |
| 13 | `chore: remove frontend dead code (controllers, models)` | `apps/web/src/controllers/ObraController.js`, `apps/web/src/models/ObraModel.js` | `git rm` | Baixo — sem uso |
| 14 | `chore: add banner.png to public or delete` | Raiz | Mover para `apps/web/public/banner.png` ou deletar | Baixo |
| 15 | `chore: update README.md (real tech stack)` | `README.md` | Reescrever seção tecnologias (Postgres/Prisma, não JSON/MySQL); adicionar setup real | Baixo |
| 16 | `chore: delete mock tests (api.test.js, rh.test.js)` | `backend/tests/*` | Deletar; substituir por 1 teste real de integração (próximo PR) | Baixo |
| 17 | `chore: fix coverage folder (not committed)` | `.gitignore` | Adicionar `coverage/`; remover `backend/coverage/tmp/*` | Baixo |
| 18 | `chore: enable ESLint on .tsx files` | `apps/web/eslint.config.js` | Adicionar `.tsx` ao `--ext`; rodar lint e corrigir | Médio — pode gerar muitos warnings |

**Ao fim da Semana 2**, o repositório estará limpo de débito cosmético e seguro no que tange às 4 vulnerabilidades críticas P0.

---

## 3.3. Plano de refatoração incremental (Meses 1-6)

O roadmap a seguir **converge com o cronograma de features do artefato 02**. Cada item é um PR em sequência de dependência. Estimativa de esforço por PR assume 1 dev sênior ou 2 devs pleno em pair.

### 3.3.1. Mês 1 — Fundação e segurança

**Contexto:** Semanas 1-2 foram limpeza. Semanas 3-4 montam infra CI/CD e observabilidade.

| PR | Título | Fundamentação | Esforço |
|---|---|---|---|
| 19 | `chore(ci): add GitHub Actions workflows` | ADR-009 | M |
| 20 | `feat(observability): integrate Sentry (backend + frontend)` | ADR-008 | S |
| 21 | `feat(observability): integrate Axiom logger via pino` | ADR-008 | S |
| 22 | `feat(security): install helmet and set security headers` | OWASP A05 | S |
| 23 | `feat(security): add express-rate-limit on /login, /register, /formulario` | OWASP A04 | S |
| 24 | `feat(db): create tb_log_auditoria model + migration` | Seção 1.2 auditoria quebrada | S |

**Entregáveis:** CI verde em todo PR, alertas de erro no Sentry, rate limiting ativo, auditoria real.

### 3.3.2. Mês 2 — Padronização de API e validação

| PR | Título | Fundamentação | Esforço |
|---|---|---|---|
| 25 | `feat(api): unified response envelope { data, error, meta }` | REST uniform interface | M |
| 26 | `feat(api): global error middleware` | Remove 40+ catch blocks duplicados | M |
| 27 | `feat(api): Zod validation middleware` | ADR-003 | M |
| 28 | `feat(api): Zod schemas for auth routes (register, login)` | — | S |
| 29 | `feat(api): Zod schemas for obra routes` | — | M |
| 30 | `feat(api): Zod schemas for diario, tarefa, financeiro, rh` | — | L |
| 31 | `feat(storage): migrate uploads to Supabase Storage via IStorageAdapter` | ADR-002, Feature 06 | M |
| 32 | `feat(deploy): first successful production deploy on Vercel` | Milestone | — |

**Entregáveis:** Todas as rotas validadas; uploads funcionam em Vercel; produção ativa.

### 3.3.3. Mês 3 — Service layer + frontend modernizado

| PR | Título | Fundamentação | Esforço |
|---|---|---|---|
| 33 | `refactor(api): extract ObraService from controller` | Ports & Adapters | M |
| 34 | `refactor(api): extract UserService` | — | M |
| 35 | `refactor(api): extract DiarioService` | — | M |
| 36 | `feat(api): add onDelete Cascade to tb_etapa, tb_requisicao, tb_usuario_obra` | Seção 1.2.4 | S |
| 37 | `feat(api): add indexes on tb_financeiro_obra.id_obra etc.` | Seção 1.2.2 | S |
| 38 | `feat(web): TanStack Query setup + interceptor` | ADR-005 | M |
| 39 | `feat(web): migrate useObras to useQuery` | — | S |
| 40 | `feat(web): shadcn/ui setup + Button/Input/Dialog/Toast` | ADR-006 | M |

**Entregáveis:** Arquitetura BE em camadas; FE com cache e interceptor; primeiros shadcn componentes.

### 3.3.4. Mês 4 — TypeScript progressivo + testes

| PR | Título | Fundamentação | Esforço |
|---|---|---|---|
| 41 | `chore(ts): tsconfig.json bases + migrate backend entrypoint` | ADR-001 | M |
| 42 | `refactor(ts): convert UserService, AuthMiddleware to TS` | — | M |
| 43 | `refactor(ts): convert ObraService to TS` | — | M |
| 44 | `feat(test): Vitest setup + testcontainers for Postgres` | ADR-004 | L |
| 45 | `test(api): integration tests for auth routes` | — | M |
| 46 | `test(api): integration tests for obra CRUD` | — | M |
| 47 | `feat(web): DashboardDinamico refactor (split in 5+ files)` | Seção 1.3.6 | L |

**Entregáveis:** 3 services em TS; cobertura de integração ≥30%; Dashboard manutenível.

### 3.3.5. Mês 5 — Conclusão de refatoração e módulo de Materiais

| PR | Título | Fundamentação | Esforço |
|---|---|---|---|
| 48 | `refactor(api): extract TarefaService, FinanceiroService, RhService` | — | L |
| 49 | `refactor(web): consolidate view/ into pages/ (strangler)` | Seção 1.3.6 | L |
| 50 | `feat(materials): CRUD for tb_material, tb_fabricante` | Feature 02 | L |
| 51 | `feat(materials): CRUD for tb_material_fabricante` | — | S |
| 52 | `test(api): integration tests for materials` | — | M |
| 53 | `feat(web): pages for materials CRUD` | — | M |

**Entregáveis:** Service layer completo; frontend unificado; módulo de Materiais no ar.

### 3.3.6. Mês 6 — Consolidação e módulo de Etapas

| PR | Título | Fundamentação | Esforço |
|---|---|---|---|
| 54 | `feat(etapas): CRUD for tb_etapa + tb_etapa_material` | Feature 03 | L |
| 55 | `feat(web): timeline of etapas on ObraPage` | — | L |
| 56 | `feat(obra): progresso físico calculado via tarefas de etapa` | — | M |
| 57 | `test(e2e): Playwright setup + login + criar obra flow` | ADR-004 | L |
| 58 | `feat(ui): adopt shadcn/ui Table, Form, DropdownMenu` | ADR-006 | M |
| 59 | `refactor(ts): coverage ≥70% TS files` | ADR-001 | M |

**Entregáveis:** Etapas funcionais; Playwright cobrindo 1 fluxo crítico; 70% TS.

### 3.3.7. Visão dos meses 7-24 (resumo)

Detalhamento completo está no artefato 04 (Seção 4.7 — cronograma 24 meses). Em suma:

- **Mês 7-8:** Features 04 (curva S), 12 (dashboard BI)
- **Mês 9-10:** Feature 05 (PWA offline), testes E2E restantes
- **Mês 11-12:** Consolidação TypeScript ≥90%, documentação técnica gerada (TypeDoc + Storybook para components)
- **Mês 13-14:** Features 07 (IA RDO), 10 (WhatsApp)
- **Mês 15-16:** Feature 08 (IA SINAPI)
- **Mês 17-18:** Features 09 (Chat IA), 11 (Segurança do trabalho)
- **Mês 19-20:** Features 15 (BIM/plantas), performance (Lighthouse ≥90)
- **Mês 21-22:** Auditoria LGPD, polimento UX, acessibilidade WCAG 2.2 AA
- **Mês 23-24:** Documentação de defesa, vídeo demo, TCC escrito

---

## Conclusão da Fase 3

A refatoração proposta segue 3 princípios orientadores:

1. **Strangler Fig Pattern** — código novo nasce com qualidade; código velho é refatorado oportunisticamente, sem big-bang rewrite.
2. **Last Responsible Moment** — decisões arquiteturais que podem ser adiadas são adiadas (ex: Turborepo no Mês 12+, não agora).
3. **Fail fast, fail cheap** — CI catch 90% dos erros antes do review humano; Sentry catch os 10% restantes em produção.

Os 10 ADRs propostos são **recomendações**, não dogmas. Espera-se que pelo menos 2 sejam revisitados quando a equipe estiver imersa no código e tiver mais contexto. A disciplina de manter os ADRs **versionados no repositório** (em `docs/adr/`) é parte do padrão de maturidade esperado da equipe.

Os detalhes de **quem faz o quê, quando, e como o time se organiza** para executar esse roadmap estão no artefato 04.

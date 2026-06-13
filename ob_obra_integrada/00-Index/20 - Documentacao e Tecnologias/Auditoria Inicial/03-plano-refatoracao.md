# Fase 3 ÔÇö Plano de Refatora├º├úo e Moderniza├º├úo

**Projeto:** Obra Integrada
**Data:** 24 de abril de 2026
**Escopo:** Decis├Áes arquiteturais (ADRs), plano de limpeza imediata e roadmap de refatora├º├úo incremental (Meses 1-6)

---

## Sum├írio executivo

Este artefato consolida **10 Architecture Decision Records (ADRs)** no formato de Michael Nygard (*Documenting Architecture Decisions*, 2011), um **plano de limpeza de 2 semanas** para remover d├®bito ├│bvio, e um **roadmap de 6 meses** de PRs sequenciais em ordem de depend├¬ncia.

As decis├Áes arquiteturais s├úo apresentadas como **recomenda├º├Áes fundamentadas** ÔÇö n├úo imposi├º├Áes. Cada ADR lista o problema, pelo menos 2 op├º├Áes com pr├│s/contras, e a recomenda├º├úo. O time ├® livre para discordar em Review, documentando a diverg├¬ncia como ADR-XXX-accepted/superseded.

O plano de refatora├º├úo segue o princ├¡pio **Strangler Fig Pattern** (Martin Fowler, 2004): em vez de *big-bang rewrite*, refatora├º├Áes convivem com o c├│digo legado; PRs pequenos, revers├¡veis, com testes que preservam comportamento.

---

## 3.1. Decis├Áes arquiteturais (ADRs propostos)

### ADR-001 ÔÇö Manter JavaScript ou migrar para TypeScript?

**Status:** Proposto
**Contexto:** O backend ├® 100% JavaScript ESM. O frontend mistura `.jsx` e `.tsx` (15 arquivos TS de 80+). O linter do frontend ignora `.tsx` (`--ext js,jsx`). O projeto tem 24 meses para crescer de ~15 mil para estimados 50 mil linhas.

#### Op├º├Áes

**Op├º├úo A ÔÇö Manter JavaScript em ambos**
- Pr├│s: zero custo de migra├º├úo; equipe n├úo precisa aprender TS; build mais simples
- Contras: sem tipos em dom├¡nio cr├¡tico (ex: `tb_obra` tem 28 campos; erro de digita├º├úo ├® `undefined` em runtime); refactors grandes s├úo arriscados; IDE oferece menos ajuda; onboarding ├® mais lento

**Op├º├úo B ÔÇö TypeScript no backend + completar TS no frontend**
- Pr├│s: integra├º├úo natural com Prisma (j├í gera tipos); refactors seguros; IDE poderosa; contratos de API compartilh├íveis (monorepo); atrai desenvolvedores (mercado demanda TS)
- Contras: curva de aprendizado inicial (~2 semanas para dev sem exposi├º├úo); build mais lento (~30%); complexidade de tsconfig; exige disciplina

**Op├º├úo C ÔÇö TypeScript s├│ em c├│digo novo (strangler)**
- Pr├│s: migra├º├úo incremental; time aprende gradualmente; c├│digo existente continua funcionando
- Contras: dois padr├Áes coexistindo por muito tempo; `any` f├ícil em fronteiras; linter precisa de duas regras

#### Recomenda├º├úo

**Op├º├úo C com meta de migra├º├úo para Op├º├úo B em 12 meses.** Todo c├│digo novo (controllers, services, componentes) a partir do M├¬s 3 deve ser TypeScript. Refatora├º├úo de c├│digo legado acontece oportunisticamente (quando uma fun├º├úo j├í ser├í tocada, migra-se o arquivo inteiro). Meta ao fim do M├¬s 12: >70% dos arquivos `.ts`/`.tsx`.

**Fundamenta├º├úo:** Reduz risco de big-bang rewrite. Princ├¡pio *Make the change easy, then make the easy change* (Kent Beck).

---

### ADR-002 ÔÇö Storage de uploads (Supabase Storage ├ù Cloudflare R2 ├ù AWS S3)

**Status:** Proposto
**Contexto:** `multer.diskStorage` ├® incompat├¡vel com Vercel. Di├írio, documentos e comprovantes financeiros dependem de storage persistente. Decis├úo afeta Features 01, 05, 06, 07, 15 do artefato 02.

#### Op├º├Áes

**Op├º├úo A ÔÇö Supabase Storage**
- Pr├│s: integra com Postgres da Supabase (se adotado); free tier 1 GB; RLS (Row Level Security) por usu├írio; SDK maduro; regi├úo sa-east-1
- Contras: atrela projeto ao Supabase; custo cresce com egress; menor ecosistema vs AWS

**Op├º├úo B ÔÇö Cloudflare R2**
- Pr├│s: S3-compat├¡vel; **egress gr├ítis** (diferencial enorme); barato (US$0.015/GB/m├¬s); ecosistema Cloudflare
- Contras: sem regi├úo BR (us-east/eu-west); SDK menos maduro; signed URLs menos flex├¡veis

**Op├º├úo C ÔÇö AWS S3**
- Pr├│s: padr├úo da ind├║stria; ecosistema amplo; regi├úo sa-east-1
- Contras: custo de egress consider├ível; setup IAM mais complexo; overkill para projeto acad├¬mico

#### Recomenda├º├úo

**Op├º├úo A ÔÇö Supabase Storage**, com interface `IStorageAdapter` em `storageService.js` que permita trocar para R2 em 2-3 dias de trabalho se for necess├írio. A ado├º├úo do Supabase como Postgres (ADR-010 impl├¡cito) se alinha com essa escolha.

**Fundamenta├º├úo:** *Last responsible moment* (Lean Software Development). Come├ºar simples, trocar quando o problema real aparecer. Abstra├º├úo fina torna a troca poss├¡vel sem reescrever todo o c├│digo.

---

### ADR-003 ÔÇö Valida├º├úo de schema (Zod ├ù Joi ├ù Yup ├ù Valibot)

**Status:** Proposto
**Contexto:** Valida├º├úo hoje ├® manual com regex dispersa. Vazam erros 500 para o usu├írio. Toda rota de input precisa de valida├º├úo declarativa.

#### Op├º├Áes

**Op├º├úo A ÔÇö Zod**
- Pr├│s: integra├º├úo TypeScript nativa (tipo inferido); API ergonomica; ecosistema (tRPC, react-hook-form resolver); tamanho razo├ível (~60 KB min+gzip)
- Contras: um pouco mais lento que Joi em benchmarks sint├®ticos; sem i18n nativo

**Op├º├úo B ÔÇö Joi**
- Pr├│s: maduro; rico em features; suporte i18n; usado pelo Hapi
- Contras: sem tipos TS bons; API mais verbosa; n├úo "nasceu" TS

**Op├º├úo C ÔÇö Yup**
- Pr├│s: familiaridade no mundo react-hook-form; sintaxe clean
- Contras: menor ecosistema hoje em 2026; tipos TS menos precisos que Zod

**Op├º├úo D ÔÇö Valibot**
- Pr├│s: **menor tamanho** (~2 KB tree-shakeable); API funcional moderna; muito r├ípido
- Contras: jovem (2024); menor ecosistema; menos material did├ítico

#### Recomenda├º├úo

**Op├º├úo A ÔÇö Zod.** Padr├úo de fato em 2026 para stacks TypeScript. Integra com react-hook-form (frontend) e com `@anatine/zod-openapi` para gerar OpenAPI do backend. Compartilh├ível entre FE e BE em monorepo.

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

**Fundamenta├º├úo:** Single Source of Truth (SSoT) ÔÇö schema vira tipo TS e validador runtime simultaneamente.

---

### ADR-004 ÔÇö Estrat├®gia de testes (unit├írio ├ù integra├º├úo ├ù E2E, meta de cobertura)

**Status:** Proposto
**Contexto:** Testes atuais s├úo mocks; cobertura efetiva ├® <5%. Definir pir├ómide, tooling, meta.

#### Op├º├Áes

**Op├º├úo A ÔÇö Pir├ómide cl├íssica (Mike Cohn)**: 70% unit, 20% integra├º├úo, 10% E2E
- Pr├│s: padr├úo maduro; r├ípido em CI; isolamento bom
- Contras: unit tests com mocks n├úo capturam problemas de integra├º├úo com Prisma; demanda disciplina

**Op├º├úo B ÔÇö Testing Trophy (Kent C. Dodds)**: 10% static (linter, TS), 20% unit, 50% integra├º├úo, 20% E2E
- Pr├│s: confian├ºa maior; integra├º├úo ├® onde a maioria dos bugs vive; TS + ESLint s├úo "gr├ítis"
- Contras: testes de integra├º├úo s├úo mais lentos; exige fixtures/seeds consistentes

**Op├º├úo C ÔÇö Pragm├ítico: cobertura alta onde importa, baixa onde n├úo importa**
- Pr├│s: foco em ROI; n├úo persegue m├®tricas vazias
- Contras: subjetivo; dif├¡cil de auditar em PR review

#### Recomenda├º├úo

**Op├º├úo B ÔÇö Testing Trophy**, adaptada:

| Tipo | Ferramenta | Cobertura esperada | Roda em |
|---|---|---|---|
| Static (TS strict, ESLint) | `tsc --noEmit`, `eslint` | 100% | Pre-commit + CI |
| Unit (fun├º├Áes puras, services) | Vitest | ÔëÑ70% das services | CI a cada PR |
| Integra├º├úo API (com Postgres de teste) | Vitest + supertest + testcontainers | ÔëÑ60% das rotas | CI a cada PR (pode rodar paralelo) |
| E2E (fluxos cr├¡ticos) | Playwright | 5 fluxos: login, criar obra, registrar di├írio com foto, criar tarefa, upload financeiro | CI noturno + pr├®-merge em `main` |

**Meta ao fim do M├¬s 6:** cobertura total ÔëÑ60% por linhas e ÔëÑ80% para m├│dulos cr├¡ticos (auth, obra, di├írio).

**Remo├º├úo dos testes-mock atuais:** deletar ou reescrever `api.test.js` e `rh.test.js` na Semana 1.

**Fundamenta├º├úo:** Testing Trophy ├® o modelo moderno para apps que integram com banco e APIs externas. Cohn Pyramid foi escrita em 2009; web moderna ├® diferente.

---

### ADR-005 ÔÇö Gerenciamento de estado no frontend

**Status:** Proposto
**Contexto:** Frontend usa React Context (Auth, Theme, Sidebar) + fetch manual. N├úo h├í cache, refetch, retry. Cada p├ígina trata 401 individualmente. N├úo usa TanStack Query, Zustand, Redux.

#### Op├º├Áes

**Op├º├úo A ÔÇö TanStack Query + Context para sess├úo**
- Pr├│s: cache autom├ítico; stale-while-revalidate; retry; devtools; integra com fetch/axios existente; separa├º├úo clara: *server state* (TanStack Query) vs *client state* (Context)
- Contras: conceito de queryKey exige disciplina; bundle ~13 KB gzipped

**Op├º├úo B ÔÇö Zustand + fetch manual**
- Pr├│s: leve (~3 KB); API simples; substitui m├║ltiplos Contexts
- Contras: n├úo resolve problema de cache/retry; for├ºa o time a implementar manualmente

**Op├º├úo C ÔÇö Redux Toolkit + RTK Query**
- Pr├│s: maduro; padr├úo corporativo; Redux DevTools famosas
- Contras: boilerplate maior; overkill para escala atual; learning curve

**Op├º├úo D ÔÇö Manter Context + interceptor centralizado**
- Pr├│s: zero nova depend├¬ncia; foca no problema real (interceptor)
- Contras: n├úo resolve cache; refetch manual continua

#### Recomenda├º├úo

**Op├º├úo A ÔÇö TanStack Query** para todo server state (obras, tarefas, di├írio, usu├írios). **Context permanece para Auth, Theme, Sidebar.** Adicionalmente, criar um `apiClient` com interceptor de 401 que dispara logout e redireciona.

**Fundamenta├º├úo:** Separar *server state* de *client state* ├® o consenso de arquitetura frontend moderna (ver Dan Abramov, "*Before You Memo*" e Kent C. Dodds, "*Application State Management*"). Cache autom├ítico elimina dezenas de bugs de stale data.

Implementa├º├úo sugerida (ap├│s ADR-001 em TS):

```typescript
// hooks/useObra.ts
export const useObra = (id: number) => useQuery({
  queryKey: ['obra', id],
  queryFn: () => apiClient.get(`/api/obras/${id}`),
  staleTime: 1000 * 30, // 30s
});
```

---

### ADR-006 ÔÇö Component library

**Status:** Proposto
**Contexto:** Frontend usa Tailwind 4 + componentes customizados. N├úo h├í design system externo. H├í duplica├º├Áes (`Header.tsx`, `ThemeToggleButton.tsx` vs `ThemeTogglerTwo.tsx`).

#### Op├º├Áes

**Op├º├úo A ÔÇö shadcn/ui**
- Pr├│s: **n├úo ├® lib, s├úo componentes copiados para o repo** ÔÇö total controle; usa Radix primitives (acessibilidade OOTB); Tailwind-nativo; padr├úo em 2026 para stacks React modernas; dark mode funcional out-of-the-box
- Contras: exige copiar componentes (CLI `npx shadcn add`); n├úo recebe updates autom├íticos (├® intencional)

**Op├º├úo B ÔÇö Mantine**
- Pr├│s: rico em componentes (150+); ├│tima documenta├º├úo; hooks ├║teis; suporte nativo a dark mode
- Contras: CSS-in-JS pr├│prio (n├úo Tailwind); pesado (~300 KB); travado em decis├Áes visuais

**Op├º├úo C ÔÇö Chakra UI v3**
- Pr├│s: documenta├º├úo exemplar; componentes acess├¡veis; sistema de temas flex├¡vel
- Contras: v3 reestruturou API (migra├º├úo de apps em v2 ├® custosa); Emotion runtime; peso ~250 KB

**Op├º├úo D ÔÇö Construir tudo do zero**
- Pr├│s: zero depend├¬ncia
- Contras: custo alto de implementar acessibilidade correta (WAI-ARIA, foco, teclado); reinventa roda

#### Recomenda├º├úo

**Op├º├úo A ÔÇö shadcn/ui**. ├ë a escolha que melhor se alinha ao stack existente (Tailwind 4) e n├úo acrescenta runtime significativo. Cada componente que for adicionado entra em `components/ui/` e pode ser customizado livremente.

Primeiros componentes a migrar/adicionar: `Button`, `Input`, `Dialog`, `Toast` (substituir react-hot-toast), `DropdownMenu`, `Tabs`, `Table`, `Form` (integra com react-hook-form).

**Fundamenta├º├úo:** Ownership + acessibilidade + Tailwind-nativo. Todas as 3 op├º├Áes alternativas tem 2-3 anos de maturidade a menos em 2026.

---

### ADR-007 ÔÇö Estrutura de monorepo

**Status:** Proposto
**Contexto:** Hoje ├® um "monorepo de fato" sem ferramenta ÔÇö `package.json` raiz orquestra via concurrently, mas com deps duplicadas. H├í apenas 2 apps (backend, frontend); pode chegar a 3-4 (mobile, admin, landing).

#### Op├º├Áes

**Op├º├úo A ÔÇö Manter estrutura atual sem ferramenta**
- Pr├│s: zero complexidade
- Contras: dev experience ruim; deps duplicadas; builds independentes

**Op├º├úo B ÔÇö npm workspaces**
- Pr├│s: **zero depend├¬ncia nova** (built-in no npm 7+); simples; `npm install` da raiz instala tudo; `package.json` por app
- Contras: sem cache de tarefas; sem pipeline de builds paralelos sofisticados

**Op├º├úo C ÔÇö pnpm workspaces**
- Pr├│s: mais r├ípido (~30%); usa menos disco (store global); suporte nativo a workspaces; compat├¡vel com npm
- Contras: troca de package manager (exige alinhamento do time e de CI/CD)

**Op├º├úo D ÔÇö Turborepo**
- Pr├│s: cache distribu├¡do; pipeline inteligente (s├│ builda o que mudou); integra com Vercel
- Contras: exige `turbo.json` + disciplina; overkill abaixo de 5 apps

#### Recomenda├º├úo

**Op├º├úo B ÔÇö npm workspaces**, com possibilidade de adicionar Turborepo no M├¬s 12+ quando houver 4+ pacotes. Mudan├ºa para pnpm ├® opcional e pode ser considerada mais tarde se builds estiverem lentos.

Estrutura proposta:

```
obra-integrada/
Ôö£ÔöÇÔöÇ package.json              # root workspace
Ôö£ÔöÇÔöÇ package-lock.json         # ├║nico lock
Ôö£ÔöÇÔöÇ apps/
Ôöé   Ôö£ÔöÇÔöÇ api/                  # ÔåÉ backend (renomeado)
Ôöé   ÔööÔöÇÔöÇ web/                  # ÔåÉ frontend/vite-project (renomeado)
Ôö£ÔöÇÔöÇ packages/
Ôöé   ÔööÔöÇÔöÇ shared-schemas/       # schemas Zod + tipos compartilhados FEÔåöBE
```

**Fundamenta├º├úo:** Evitar complexidade prematura. npm workspaces atende o caso por 12+ meses.

---

### ADR-008 ÔÇö Observabilidade

**Status:** Proposto
**Contexto:** Hoje logs v├úo para console da Vercel, sem contexto; sem alertas; sem APM.

#### Op├º├Áes

**Op├º├úo A ÔÇö Sentry**
- Pr├│s: l├¡der em error tracking frontend + backend; free tier 5k errors/m├¬s; source maps; breadcrumbs; alertas Slack
- Contras: foca em erros, n├úo em performance/traces completos

**Op├º├úo B ÔÇö Axiom**
- Pr├│s: log aggregation moderno; SQL sobre logs; integrado com Vercel (plugin oficial); free tier generoso
- Contras: menos maduro em error tracking

**Op├º├úo C ÔÇö BetterStack (Logtail + Uptime)**
- Pr├│s: combina logs + uptime + status page; pre├ºo competitivo
- Contras: menos recursos que Sentry em error tracking

**Op├º├úo D ÔÇö Datadog**
- Pr├│s: APM completo (traces, m├®tricas, logs, RUM)
- Contras: pre├ºo alto (n├úo cabe em projeto acad├¬mico); setup pesado

#### Recomenda├º├úo

**Combina├º├úo Op├º├úo A + Op├º├úo B: Sentry para erros + Axiom para logs estruturados.** Ambos tem integra├º├Áes 1-click com Vercel. Free tiers cobrem o projeto por toda dura├º├úo.

Configura├º├úo esperada:
- Frontend: `@sentry/react` com source maps no build
- Backend: `@sentry/node` + integra├º├úo Express
- Pino logger exportando para Axiom

**Fundamenta├º├úo:** Observabilidade ├® o item mais subestimado no custo de manuten├º├úo. Ter Sentry desde cedo evita debugar problemas cegamente.

---

### ADR-009 ÔÇö CI/CD (GitHub Actions)

**Status:** Proposto
**Contexto:** Sem CI hoje. Workflows necess├írios detalhados no artefato 04.

#### Op├º├Áes

**Op├º├úo A ÔÇö GitHub Actions**
- Pr├│s: gr├ítis para repos p├║blicos (2000 min/m├¬s para privados); ecosistema enorme de actions; integra nativamente com GitHub
- Contras: vendor lock-in

**Op├º├úo B ÔÇö CircleCI / GitLab CI**
- Pr├│s: alternativas maduras
- Contras: exige configurar hosting; n├úo agrega valor sobre Actions para este projeto

#### Recomenda├º├úo

**Op├º├úo A ÔÇö GitHub Actions**. Sem discuss├úo ÔÇö ├® o padr├úo para projetos hospedados no GitHub.

Workflows m├¡nimos (conte├║do completo no artefato 04):
1. **ci.yml** ÔÇö a cada PR: lint + TS check + unit + integra├º├úo
2. **preview-comment.yml** ÔÇö postar URL da preview Vercel no PR
3. **prisma-check.yml** ÔÇö bloquear merge se h├í migration n├úo aplicada

Workflows para fases posteriores (M├¬s 3+):
4. **e2e.yml** ÔÇö noturno com Playwright contra staging
5. **security.yml** ÔÇö npm audit + Dependabot

---

### ADR-010 ÔÇö Ambientes (dev / staging / produ├º├úo)

**Status:** Proposto
**Contexto:** Hoje h├í apenas `dev` local + deploys na Vercel (preview + produ├º├úo). Sem staging separado. Banco ├® o mesmo para todos os devs.

#### Op├º├Áes

**Op├º├úo A ÔÇö Mono-ambiente (apenas prod)**
- Pr├│s: simples
- Contras: devs testam em produ├º├úo; risco inaceit├ível para dados reais

**Op├º├úo B ÔÇö Dev local + Preview Vercel + Produ├º├úo**
- Pr├│s: gr├ítis; cada PR tem preview isolado
- Contras: previews compartilham banco com produ├º├úo por default; confus├úo de dados

**Op├º├úo C ÔÇö Dev + Staging + Produ├º├úo com bancos separados**
- Pr├│s: seguran├ºa de dados; permite migrations em staging antes de prod
- Contras: exige 2-3 bancos hospedados; complexidade de config

#### Recomenda├º├úo

**Op├º├úo C** com configura├º├úo:

| Ambiente | Vercel | Postgres | Branch |
|---|---|---|---|
| Dev | Local (vite + nodemon) | Local Docker ou Neon branch | qualquer |
| Preview | Autom├ítico por PR | Neon branch descart├ível ou Supabase branch | `feature/*`, `fix/*` |
| Staging | `staging.obra-integrada.vercel.app` | DB dedicado | branch `develop` |
| Produ├º├úo | `obra-integrada.vercel.app` | DB produ├º├úo | branch `main` |

**Postgres managed providers com "branching":**
- **Neon** Ô¡É ÔÇö primeiro Postgres com branching instant├óneo (como Git); cada PR pode ter banco isolado
- **Supabase** ÔÇö d├í branching em beta; combina com ADR-002
- **Railway** ÔÇö simples, mas sem branching nativo

**Recomenda├º├úo combinada:** **Neon** para Postgres (diferencial: branching permite preview de PR com banco pr├│prio, sem interferir em staging). Se Supabase for adotado por Storage (ADR-002), pode-se usar tamb├®m por Postgres para simplificar ÔÇö trade-off entre menos providers vs features de branching.

**Fundamenta├º├úo:** 12-Factor App, fator X ÔÇö "Dev/prod parity"; ambientes devem ser o mais parecidos poss├¡vel.

---

## 3.2. Plano de limpeza imediata (Semanas 1-2)

Antes de qualquer nova funcionalidade, o reposit├│rio deve passar por higiene. Cada item ├® um PR pequeno (<200 linhas alteradas) em sequ├¬ncia. Tempo total estimado: **2 devs ├ù 1 semana** (ou 1 dev ├ù 2 semanas).

### 3.2.1. Semana 1 ÔÇö Cr├¡tico e bloqueadores

| # | PR | Alvo | A├º├úo | Risco | Verifica├º├úo |
|---|---|---|---|---|---|
| 1 | `chore: remove orphaned server.js and legacy files` | `server.js` (raiz), `backend/src/database/{obras,users}.json`, `backend/standalone_users_server.js`, `backend/strip_maps.js`, `backend/check_db.mjs` | `git rm` | Baixo ÔÇö nenhum ├® importado | `grep -r "server.js" --include='*.js'` n├úo mostra imports |
| 2 | `chore: remove orphaned seed scripts` | `backend/seed_*.mjs` (5 arquivos), `backend/seed_out.txt`, `backend/src/seed.js` duplicado | `git rm`; manter apenas `backend/src/prisma/seed.js` | Baixo | `npm run seed` ainda funciona |
| 3 | `chore: remove legacy schema and dev.db` | `backend/src/prisma/schema.prisma.postgres`, `backend/src/prisma/dev.db` | `git rm --cached dev.db` + add ao `.gitignore` | Baixo | `npx prisma validate` passa |
| 4 | `chore: consolidate .gitignore` | `.gitignore` raiz, `backend/.gitignore`, `backend/src/.gitignore` | Unificar em raiz: `node_modules`, `.env*`, `.vite/`, `coverage/`, `dev.db`, `uploads/*` (com exce├º├úo), `dist/`, `build/` | Baixo | `git status` mostra estado esperado |
| 5 | `chore: add .vercelignore` | Novo arquivo `/vercelignore` | `node_modules`, `.env*`, `dev.db`, `coverage/`, `docs/`, `*.md` (exceto README), `backend/uploads/`, `.vite/` | Baixo | Simular deploy em conta Vercel; ver manifest |
| 6 | `chore: add .env.example` | `apps/api/.env.example`, `apps/web/.env.example` | Documentar todas as vars identificadas na Se├º├úo 1.5.4 | Baixo | Revis├úo humana |
| 7 | `fix(security): require JWT_SECRET env var` | `backend/src/middlewares/authMiddleware.js`, `backend/src/controllers/userController.js` | Remover fallback `"SUPER_SECRET"`; startup fails-fast se var ausente | **M├®dio** ÔÇö requer adicionar var em todos ambientes antes | Testes de login em cada ambiente |
| 8 | `fix(security): restrict CORS to FRONTEND_URL` | `backend/src/server.js` | `cors({ origin: process.env.FRONTEND_URL, credentials: true })` | M├®dio ÔÇö pode quebrar localhost | Adicionar `http://localhost:*` em dev |
| 9 | `fix(security): add requireRole to admin metrics` | `backend/src/routes/adminRoutes.js:20` | Adicionar `requireRole('ADMIN_MASTER', 'ADMIN')` | Baixo | Teste: user comum recebe 403 |
| 10 | `fix(security): add requireObraAccess to DELETE financeiro` | `backend/src/routes/financeiroRoutes.js:43` | Adicionar middleware | Baixo | Teste: user sem acesso recebe 403 |

### 3.2.2. Semana 2 ÔÇö Reestrutura├º├úo leve e higiene frontend

| # | PR | Alvo | A├º├úo | Risco |
|---|---|---|---|---|
| 11 | `chore(monorepo): restructure to apps/api and apps/web` | Rename `backend/` ÔåÆ `apps/api/`, `frontend/vite-project/` ÔåÆ `apps/web/` | `git mv` + atualizar scripts raiz + Vercel root directories | M├®dio ÔÇö exige atualizar config Vercel dos 2 projetos antes do merge |
| 12 | `chore: enable npm workspaces in root package.json` | `package.json` raiz | Adicionar `"workspaces": ["apps/*", "packages/*"]`; remover deps duplicadas da raiz | M├®dio ÔÇö quebra `npm start` legacy |
| 13 | `chore: remove frontend dead code (controllers, models)` | `apps/web/src/controllers/ObraController.js`, `apps/web/src/models/ObraModel.js` | `git rm` | Baixo ÔÇö sem uso |
| 14 | `chore: add banner.png to public or delete` | Raiz | Mover para `apps/web/public/banner.png` ou deletar | Baixo |
| 15 | `chore: update README.md (real tech stack)` | `README.md` | Reescrever se├º├úo tecnologias (Postgres/Prisma, n├úo JSON/MySQL); adicionar setup real | Baixo |
| 16 | `chore: delete mock tests (api.test.js, rh.test.js)` | `backend/tests/*` | Deletar; substituir por 1 teste real de integra├º├úo (pr├│ximo PR) | Baixo |
| 17 | `chore: fix coverage folder (not committed)` | `.gitignore` | Adicionar `coverage/`; remover `backend/coverage/tmp/*` | Baixo |
| 18 | `chore: enable ESLint on .tsx files` | `apps/web/eslint.config.js` | Adicionar `.tsx` ao `--ext`; rodar lint e corrigir | M├®dio ÔÇö pode gerar muitos warnings |

**Ao fim da Semana 2**, o reposit├│rio estar├í limpo de d├®bito cosm├®tico e seguro no que tange ├ás 4 vulnerabilidades cr├¡ticas P0.

---

## 3.3. Plano de refatora├º├úo incremental (Meses 1-6)

O roadmap a seguir **converge com o cronograma de features do artefato 02**. Cada item ├® um PR em sequ├¬ncia de depend├¬ncia. Estimativa de esfor├ºo por PR assume 1 dev s├¬nior ou 2 devs pleno em pair.

### 3.3.1. M├¬s 1 ÔÇö Funda├º├úo e seguran├ºa

**Contexto:** Semanas 1-2 foram limpeza. Semanas 3-4 montam infra CI/CD e observabilidade.

| PR | T├¡tulo | Fundamenta├º├úo | Esfor├ºo |
|---|---|---|---|
| 19 | `chore(ci): add GitHub Actions workflows` | ADR-009 | M |
| 20 | `feat(observability): integrate Sentry (backend + frontend)` | ADR-008 | S |
| 21 | `feat(observability): integrate Axiom logger via pino` | ADR-008 | S |
| 22 | `feat(security): install helmet and set security headers` | OWASP A05 | S |
| 23 | `feat(security): add express-rate-limit on /login, /register, /formulario` | OWASP A04 | S |
| 24 | `feat(db): create tb_log_auditoria model + migration` | Se├º├úo 1.2 auditoria quebrada | S |

**Entreg├íveis:** CI verde em todo PR, alertas de erro no Sentry, rate limiting ativo, auditoria real.

### 3.3.2. M├¬s 2 ÔÇö Padroniza├º├úo de API e valida├º├úo

| PR | T├¡tulo | Fundamenta├º├úo | Esfor├ºo |
|---|---|---|---|
| 25 | `feat(api): unified response envelope { data, error, meta }` | REST uniform interface | M |
| 26 | `feat(api): global error middleware` | Remove 40+ catch blocks duplicados | M |
| 27 | `feat(api): Zod validation middleware` | ADR-003 | M |
| 28 | `feat(api): Zod schemas for auth routes (register, login)` | ÔÇö | S |
| 29 | `feat(api): Zod schemas for obra routes` | ÔÇö | M |
| 30 | `feat(api): Zod schemas for diario, tarefa, financeiro, rh` | ÔÇö | L |
| 31 | `feat(storage): migrate uploads to Supabase Storage via IStorageAdapter` | ADR-002, Feature 06 | M |
| 32 | `feat(deploy): first successful production deploy on Vercel` | Milestone | ÔÇö |

**Entreg├íveis:** Todas as rotas validadas; uploads funcionam em Vercel; produ├º├úo ativa.

### 3.3.3. M├¬s 3 ÔÇö Service layer + frontend modernizado

| PR | T├¡tulo | Fundamenta├º├úo | Esfor├ºo |
|---|---|---|---|
| 33 | `refactor(api): extract ObraService from controller` | Ports & Adapters | M |
| 34 | `refactor(api): extract UserService` | ÔÇö | M |
| 35 | `refactor(api): extract DiarioService` | ÔÇö | M |
| 36 | `feat(api): add onDelete Cascade to tb_etapa, tb_requisicao, tb_usuario_obra` | Se├º├úo 1.2.4 | S |
| 37 | `feat(api): add indexes on tb_financeiro_obra.id_obra etc.` | Se├º├úo 1.2.2 | S |
| 38 | `feat(web): TanStack Query setup + interceptor` | ADR-005 | M |
| 39 | `feat(web): migrate useObras to useQuery` | ÔÇö | S |
| 40 | `feat(web): shadcn/ui setup + Button/Input/Dialog/Toast` | ADR-006 | M |

**Entreg├íveis:** Arquitetura BE em camadas; FE com cache e interceptor; primeiros shadcn componentes.

### 3.3.4. M├¬s 4 ÔÇö TypeScript progressivo + testes

| PR | T├¡tulo | Fundamenta├º├úo | Esfor├ºo |
|---|---|---|---|
| 41 | `chore(ts): tsconfig.json bases + migrate backend entrypoint` | ADR-001 | M |
| 42 | `refactor(ts): convert UserService, AuthMiddleware to TS` | ÔÇö | M |
| 43 | `refactor(ts): convert ObraService to TS` | ÔÇö | M |
| 44 | `feat(test): Vitest setup + testcontainers for Postgres` | ADR-004 | L |
| 45 | `test(api): integration tests for auth routes` | ÔÇö | M |
| 46 | `test(api): integration tests for obra CRUD` | ÔÇö | M |
| 47 | `feat(web): DashboardDinamico refactor (split in 5+ files)` | Se├º├úo 1.3.6 | L |

**Entreg├íveis:** 3 services em TS; cobertura de integra├º├úo ÔëÑ30%; Dashboard manuten├¡vel.

### 3.3.5. M├¬s 5 ÔÇö Conclus├úo de refatora├º├úo e m├│dulo de Materiais

| PR | T├¡tulo | Fundamenta├º├úo | Esfor├ºo |
|---|---|---|---|
| 48 | `refactor(api): extract TarefaService, FinanceiroService, RhService` | ÔÇö | L |
| 49 | `refactor(web): consolidate view/ into pages/ (strangler)` | Se├º├úo 1.3.6 | L |
| 50 | `feat(materials): CRUD for tb_material, tb_fabricante` | Feature 02 | L |
| 51 | `feat(materials): CRUD for tb_material_fabricante` | ÔÇö | S |
| 52 | `test(api): integration tests for materials` | ÔÇö | M |
| 53 | `feat(web): pages for materials CRUD` | ÔÇö | M |

**Entreg├íveis:** Service layer completo; frontend unificado; m├│dulo de Materiais no ar.

### 3.3.6. M├¬s 6 ÔÇö Consolida├º├úo e m├│dulo de Etapas

| PR | T├¡tulo | Fundamenta├º├úo | Esfor├ºo |
|---|---|---|---|
| 54 | `feat(etapas): CRUD for tb_etapa + tb_etapa_material` | Feature 03 | L |
| 55 | `feat(web): timeline of etapas on ObraPage` | ÔÇö | L |
| 56 | `feat(obra): progresso f├¡sico calculado via tarefas de etapa` | ÔÇö | M |
| 57 | `test(e2e): Playwright setup + login + criar obra flow` | ADR-004 | L |
| 58 | `feat(ui): adopt shadcn/ui Table, Form, DropdownMenu` | ADR-006 | M |
| 59 | `refactor(ts): coverage ÔëÑ70% TS files` | ADR-001 | M |

**Entreg├íveis:** Etapas funcionais; Playwright cobrindo 1 fluxo cr├¡tico; 70% TS.

### 3.3.7. Vis├úo dos meses 7-24 (resumo)

Detalhamento completo est├í no artefato 04 (Se├º├úo 4.7 ÔÇö cronograma 24 meses). Em suma:

- **M├¬s 7-8:** Features 04 (curva S), 12 (dashboard BI)
- **M├¬s 9-10:** Feature 05 (PWA offline), testes E2E restantes
- **M├¬s 11-12:** Consolida├º├úo TypeScript ÔëÑ90%, documenta├º├úo t├®cnica gerada (TypeDoc + Storybook para components)
- **M├¬s 13-14:** Features 07 (IA RDO), 10 (WhatsApp)
- **M├¬s 15-16:** Feature 08 (IA SINAPI)
- **M├¬s 17-18:** Features 09 (Chat IA), 11 (Seguran├ºa do trabalho)
- **M├¬s 19-20:** Features 15 (BIM/plantas), performance (Lighthouse ÔëÑ90)
- **M├¬s 21-22:** Auditoria LGPD, polimento UX, acessibilidade WCAG 2.2 AA
- **M├¬s 23-24:** Documenta├º├úo de defesa, v├¡deo demo, TCC escrito

---

## Conclus├úo da Fase 3

A refatora├º├úo proposta segue 3 princ├¡pios orientadores:

1. **Strangler Fig Pattern** ÔÇö c├│digo novo nasce com qualidade; c├│digo velho ├® refatorado oportunisticamente, sem big-bang rewrite.
2. **Last Responsible Moment** ÔÇö decis├Áes arquiteturais que podem ser adiadas s├úo adiadas (ex: Turborepo no M├¬s 12+, n├úo agora).
3. **Fail fast, fail cheap** ÔÇö CI catch 90% dos erros antes do review humano; Sentry catch os 10% restantes em produ├º├úo.

Os 10 ADRs propostos s├úo **recomenda├º├Áes**, n├úo dogmas. Espera-se que pelo menos 2 sejam revisitados quando a equipe estiver imersa no c├│digo e tiver mais contexto. A disciplina de manter os ADRs **versionados no reposit├│rio** (em `docs/adr/`) ├® parte do padr├úo de maturidade esperado da equipe.

Os detalhes de **quem faz o qu├¬, quando, e como o time se organiza** para executar esse roadmap est├úo no artefato 04.

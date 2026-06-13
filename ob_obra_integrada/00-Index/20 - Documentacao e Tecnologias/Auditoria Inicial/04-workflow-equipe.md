# Fase 4 ÔÇö Integra├º├úo com GitHub e Fluxo de Trabalho da Equipe

**Projeto:** Obra Integrada
**Data:** 24 de abril de 2026
**Escopo:** Branches, divis├úo de responsabilidades, templates GitHub, CI/CD, integra├º├úo Vercel e cronograma macro de 24 meses

---

## Sum├írio executivo

Este artefato formaliza **como uma equipe de 5ÔÇô6 desenvolvedores** (sendo 1 com continuidade incerta) organiza o trabalho di├írio no projeto Obra Integrada, usando GitHub como plataforma de colabora├º├úo e Vercel como plataforma de deploy.

As escolhas privilegiam **fluxos leves, autom├íveis e aprend├¡veis** em at├® 2 semanas: branch model baseado em `main` + feature branches (trunk-based light), prote├º├úo de branches via GitHub Rulesets, Conventional Commits para hist├│rico leg├¡vel, e 3 GitHub Actions workflows enxutos (~50 linhas cada) para garantir qualidade m├¡nima em todo PR.

A divis├úo de responsabilidades ├® **por m├│dulo de neg├│cio** (n├úo por camada), com pap├®is fixos (Tech Lead, DevOps) e pap├®is rotativos (Reviewer da semana, Docs da semana). O cronograma macro de 24 meses vincula entregas a marcos acad├¬micos de TCC.

Todos os templates referenciados (`PULL_REQUEST_TEMPLATE.md`, `ISSUE_TEMPLATE/*.md`, `CODEOWNERS`, 3 workflows YAML e `CONTRIBUTING.md`) **foram criados junto deste artefato** ÔÇö n├úo s├úo descri├º├Áes, s├úo arquivos funcionais na sua localiza├º├úo can├┤nica.

---

## 4.1. Estrutura de branches recomendada

### 4.1.1. Modelo escolhido: trunk-based com feature branches de vida curta

O projeto adotar├í um modelo pr├│ximo ao **Trunk-Based Development** descrito por Paul Hammant (`trunkbaseddevelopment.com`), adaptado para equipe acad├¬mica que ainda n├úo tem maturidade de deploys di├írios.

**Caracter├¡sticas:**

- **Um ├║nico branch de integra├º├úo: `main`**. ├ë sempre deployable (considerado "release-ready").
- **Feature branches de vida curta** (<5 dias idealmente, <2 semanas no limite) ÔÇö quanto mais curto, menos dor em merge.
- **Sem `develop` separado**. Staging ├® um ambiente com deploy autom├ítico de `main` antes de produ├º├úo.
- **Sem `release/*` branches** ÔÇö releases s├úo feitas por tag (`v1.2.0`) diretamente de `main`.
- **`hotfix/*`** apenas para corre├º├Áes urgentes em produ├º├úo (rar├¡ssimo).

### 4.1.2. Conven├º├úo de nomes de branches

| Padr├úo | Exemplo | Quando usar |
|---|---|---|
| `feature/<modulo>-<descricao-curta>` | `feature/diario-exportar-pdf` | Nova funcionalidade |
| `fix/<modulo>-<descricao-curta>` | `fix/auth-jwt-secret-fallback` | Corre├º├úo de bug |
| `chore/<descricao>` | `chore/delete-orphan-files` | Manuten├º├úo, deps, tooling |
| `refactor/<area>-<descricao>` | `refactor/api-extract-obra-service` | Refatora├º├úo sem mudan├ºa funcional |
| `docs/<descricao>` | `docs/update-readme` | S├│ documenta├º├úo |
| `hotfix/<descricao>` | `hotfix/login-500-error` | Bug cr├¡tico em produ├º├úo |

Palavras proibidas em nome de branch: n├║meros de issue como raiz do nome (preferir descri├º├úo), nomes gen├®ricos (`feature/update`, `fix/bug`).

### 4.1.3. Regras de prote├º├úo ÔÇö GitHub Rulesets

A prote├º├úo de `main` deve ser configurada em *Settings ÔåÆ Rules ÔåÆ Rulesets* com as seguintes regras m├¡nimas:

- **Restrict deletions**: impedir delete do branch
- **Require linear history**: preferir `squash merge` (evita merge commits "ru├¡do")
- **Require pull request**:
  - Requer aprova├º├úo de **no m├¡nimo 1 reviewer** (2 para mudan├ºas em ├íreas cr├¡ticas ÔÇö ver Section 4.2)
  - Reviewer n├úo pode ser o autor
  - Aprova├º├Áes s├úo invalidadas em novo push
- **Require status checks to pass**:
  - `CI / lint`
  - `CI / type-check`
  - `CI / test-backend`
  - `CI / test-frontend`
  - `CI / build-frontend`
  - `prisma-check`
- **Require conversation resolution**: resolver todos coment├írios
- **Require signed commits** (opcional mas recomendado): `git commit -S`
- **Block force pushes**

### 4.1.4. Merge strategies

| Situa├º├úo | Estrat├®gia | Racional |
|---|---|---|
| Feature ÔåÆ main | **Squash & merge** | 1 commit limpo por PR; hist├│rico leg├¡vel |
| Fix pequeno ÔåÆ main | **Squash & merge** | Idem |
| Hotfix ÔåÆ main | **Squash & merge** | Idem |
| Release tag | `git tag -a v1.2.0 -m "..."` + `git push --tags` | SemVer |

**Merge commit** e **rebase merge** s├úo **desabilitados** no GitHub para evitar confus├úo.

### 4.1.5. Conventional Commits

Todo commit segue o padr├úo de [Conventional Commits v1.0.0](https://www.conventionalcommits.org/):

```
<tipo>(<escopo opcional>): <descri├º├úo curta no imperativo>

<corpo opcional ÔÇö o porqu├¬>

<rodap├® opcional ÔÇö BREAKING CHANGE, Refs, Co-authored-by>
```

Tipos aceitos:
- `feat`: nova funcionalidade
- `fix`: corre├º├úo de bug
- `chore`: manuten├º├úo, sem impacto em app
- `refactor`: refatora├º├úo sem mudan├ºa funcional
- `docs`: s├│ documenta├º├úo
- `test`: adiciona/ajusta testes
- `perf`: melhoria de performance
- `build`: mudan├ºas de build/deps
- `ci`: mudan├ºas em CI/CD
- `style`: formata├º├úo, sem mudan├ºa de l├│gica

Escopo (opcional): `obras`, `diario`, `tarefas`, `financeiro`, `rh`, `admin`, `auth`, `api`, `web`, `db`, `ci`.

Exemplos v├ílidos:

```
feat(diario): add GPS audit status workflow
fix(auth): remove JWT_SECRET hardcoded fallback
chore(db): add tb_log_auditoria model
refactor(api): extract ObraService from controller
docs(adr): accept ADR-003 Zod for validation
```

Essa disciplina habilita, no futuro, **semantic-release** (versionamento autom├ítico) e **changelog** gerado automaticamente.

---

## 4.2. Divis├úo de responsabilidades entre os 5ÔÇô6 membros

### 4.2.1. Princ├¡pio: divis├úo por m├│dulo, n├úo por camada

Em vez de ter "um dev de backend" e "um dev de frontend", cada desenvolvedor ├® **owner de 1ÔÇô2 m├│dulos de neg├│cio** e escreve c├│digo nas 2 camadas desses m├│dulos. Isso gera:

- **Contexto concentrado**: o dev que faz RDO PDF (Feature 01) entende o fluxo do di├írio fim-a-fim
- **Menos handoff**: n├úo precisa esperar outro dev para avan├ºar
- **Review mais qualificado**: o owner de um m├│dulo revisa mudan├ºas na ├írea alheia com perguntas de neg├│cio

### 4.2.2. Matriz proposta de m├│dulos ├ù pessoas

Dada a incerteza do 6┬║ membro, o planejamento assume **5 devs com owner principal + 1 secund├írio cobrindo**. Se o 6┬║ se confirmar, assume Admin (hoje menor carga).

| M├│dulo | Owner prim├írio | Owner secund├írio (backup) | C├│digo em |
|---|---|---|---|
| **Obras + Materiais + Etapas** | Dev 1 | Dev 2 | `apps/api/controllers/obra*`, `apps/api/controllers/material*`, `apps/web/src/pages/Obra/`, `apps/web/src/pages/Obras/` |
| **Di├írio + Tarefas** | Dev 2 | Dev 1 | `apps/api/controllers/diario*`, `apps/api/controllers/tarefa*`, `apps/web/src/pages/Calendar*`, `apps/web/src/pages/Obra/sections/ObraDiario*` |
| **Financeiro** | Dev 3 | Dev 5 | `apps/api/controllers/financeiro*`, `apps/web/src/pages/Obra/sections/ObraFinanceiro*` |
| **RH + Usu├írios + Auth** | Dev 4 | Dev 3 | `apps/api/controllers/rh*`, `apps/api/controllers/user*`, `apps/api/middlewares/auth*`, `apps/web/src/context/AuthContext*`, `apps/web/src/pages/Operational/GestaoRH*` |
| **Admin + Observabilidade + DevOps** | Dev 5 (Tech Lead/DevOps) | Dev 4 | `apps/api/controllers/admin*`, `.github/`, `docs/`, configs Vercel, Sentry, Axiom |
| **IA + Integra├º├Áes (a partir do M├¬s 13)** | Dev 6 (se existir) OU rotativo | ÔÇö | `apps/api/integrations/`, `packages/ai/` |

### 4.2.3. Pap├®is fixos

| Papel | Pessoa | Responsabilidades |
|---|---|---|
| **Tech Lead** | Dev 5 | Decis├Áes arquiteturais (prop├Áe ADRs), veta/aprova PRs em ├íreas cr├¡ticas (auth, DB schema), treina o time |
| **DevOps / Release Manager** | Dev 5 (acumula no in├¡cio; desacopla no M├¬s 12+) | Mant├®m CI/CD, gerencia Vercel, deploys, monitoring, runbook |
| **Product Owner (acad├¬mico)** | Rotativo mensal entre Dev 1-4 | Prioriza backlog, escreve hist├│rias, interlocutor com professor orientador |

### 4.2.4. Pap├®is rotativos (semanais)

Rota├º├úo semanal entre os 5 devs:

| Papel | Dura├º├úo | Responsabilidade |
|---|---|---|
| **Reviewer da semana** | Seg ÔåÆ Sex | Review priorit├írio de PRs (meta: <24h para 1┬║ review); coordenar com outros reviewers espec├¡ficos quando o PR toca v├írios m├│dulos |
| **Docs da semana** | Seg ÔåÆ Sex | Atualizar docs (README, CONTRIBUTING, ADRs novos se houver); cuidar que PRs mesclados tenham atualiza├º├úo de docs quando necess├írio |
| **Oncall de bugs** | Seg ÔåÆ Sex | Primeira linha para issues abertas com label `bug`; tenta reprodu├º├úo, atribui a owner do m├│dulo se n├úo conseguir resolver |

A rota├º├úo ├® vis├¡vel em `/docs/team-rotation.md` (a ser criado quando a equipe confirmar nomes).

### 4.2.5. Reuni├Áes

| Tipo | Frequ├¬ncia | Dura├º├úo | Participantes |
|---|---|---|---|
| **Daily async no GitHub** | Di├íria | ÔÇö | Todos ÔÇö post no Discussions |
| **Weekly sync** | Segunda 18h | 30 min | Todos ÔÇö review do sprint, impedimentos |
| **ADR review** | Quinzenal (ou sob demanda) | 45 min | Todos ÔÇö discuss├úo de novas decis├Áes |
| **Retrospectiva** | A cada 4 semanas | 1h | Todos ÔÇö melhoria de processo |
| **Demo interna** | A cada 8 semanas | 1h | Todos + orientador | ÔÇö |

---

## 4.3. Templates a criar

**Estes arquivos foram criados junto deste artefato**, nas seguintes localiza├º├Áes:

- [`.github/PULL_REQUEST_TEMPLATE.md`](../../.github/PULL_REQUEST_TEMPLATE.md)
- [`.github/ISSUE_TEMPLATE/bug_report.md`](../../.github/ISSUE_TEMPLATE/bug_report.md)
- [`.github/ISSUE_TEMPLATE/feature_request.md`](../../.github/ISSUE_TEMPLATE/feature_request.md)
- [`.github/CODEOWNERS`](../../.github/CODEOWNERS)
- [`CONTRIBUTING.md`](../../CONTRIBUTING.md)

O conte├║do can├┤nico de cada um est├í nos pr├│prios arquivos; aqui fica o racional de cada se├º├úo.

### 4.3.1. Pull Request Template ÔÇö racional

O template guia o autor do PR a responder 4 perguntas:
1. **O qu├¬**: resumo em 1-2 frases
2. **Por qu├¬**: link para issue ou ADR
3. **Como testar**: passos para reviewer reproduzir
4. **Checklist**: testes, docs, screenshots (se UI)

Justificativa: sem checklist, PRs "passam" com gaps (ex: esquece de atualizar README ou seed). O checklist for├ºa o autor a lembrar.

### 4.3.2. Issue Templates

**Bug report**: for├ºa reprodu├º├úo passo-a-passo, comportamento esperado ├ù observado, environment.
**Feature request**: for├ºa articula├º├úo do problema do usu├írio (n├úo "adicionar X" mas "usu├írio Y quer fazer Z porque W").

### 4.3.3. CODEOWNERS

CODEOWNERS mapeia o owner de cada pasta. GitHub atribui reviewers automaticamente quando um PR toca uma pasta.

Nota importante: os handles nos CODEOWNERS s├úo **placeholders (`@dev1`, `@dev2`, ...)**. A equipe deve substituir pelos handles reais do GitHub antes de ativar prote├º├úo de branch com `CODEOWNERS required`.

### 4.3.4. CONTRIBUTING.md

Documenta o que o dev novo precisa fazer no primeiro dia: setup local, rodar testes, padr├úo de commits, como abrir PR. Substitui "onboarding verbal" por texto que n├úo envelhece de uma troca para outra.

---

## 4.4. GitHub Projects ÔÇö configura├º├úo de board Kanban

### 4.4.1. Estrutura recomendada

Um ├║nico board por projeto (GitHub Projects v2), vinculado ao reposit├│rio.

**Nome:** `Obra Integrada ÔÇö Roadmap`

**Colunas (views):**

| Coluna | Defini├º├úo | Limite (WIP) |
|---|---|---|
| **­ƒôï Backlog** | Ideia registrada, ainda n├úo priorizada | ÔÇö |
| **­ƒÄ» A Fazer (Sprint)** | Priorizada para sprint atual (2 semanas) | ÔÇö |
| **ÔÜÖ´©Å Em Andamento** | Algu├®m pegou e est├í trabalhando | **6** (1.2 por dev, leve overload ├® OK) |
| **­ƒöì Em Revis├úo** | PR aberto, aguardando review | 4 |
| **Ô£à Conclu├¡do** | Merged na main ÔÇö itens mais antigos que 30 dias s├úo arquivados | ÔÇö |
| **Ôøö Bloqueado** | Aguardando depend├¬ncia externa (resposta de usu├írio, API de terceiro) | ÔÇö |

### 4.4.2. Views adicionais

- **Por m├│dulo**: agrupa cards por `Module` (label)
- **Por pessoa**: agrupa por Assignee
- **Roadmap 24 meses**: timeline-view usando campo customizado `Sprint` (com valores Sprint-01 ... Sprint-48, cada sprint = 2 semanas)

### 4.4.3. Labels padr├úo

**Tipo:**
- `type: bug`
- `type: feature`
- `type: chore`
- `type: refactor`
- `type: docs`
- `type: test`

**Prioridade:**
- `priority: P0 ÔÇö critical` (bloqueia produ├º├úo)
- `priority: P1 ÔÇö high`
- `priority: P2 ÔÇö medium`
- `priority: P3 ÔÇö low`

**M├│dulo:**
- `module: obras`
- `module: diario`
- `module: tarefas`
- `module: financeiro`
- `module: rh`
- `module: admin`
- `module: auth`
- `module: devops`
- `module: infra`

**Tamanho (estimativa r├ípida):**
- `size: S` (<1 dia)
- `size: M` (1-3 dias)
- `size: L` (4-7 dias)
- `size: XL` (>1 semana ÔÇö deveria ser quebrado)

**Status especial:**
- `good first issue` (para quando precisarmos onboarding)
- `help wanted`
- `needs ADR` (decis├úo arquitetural necess├íria antes de implementar)

### 4.4.4. Automa├º├Áes recomendadas (GitHub Projects)

GitHub Projects v2 tem automa├º├Áes built-in:

| Trigger | A├º├úo |
|---|---|
| Issue aberta | Auto-add ao board na coluna Backlog |
| Issue fechada | Mover para Conclu├¡do |
| PR aberto | Mover card linkado para Em Revis├úo |
| PR merged | Mover card linkado para Conclu├¡do |
| Draft PR aberto | Manter em Em Andamento |

Configura├º├úo via *Project Settings ÔåÆ Workflows*.

### 4.4.5. Cad├¬ncia de grooming

Toda sexta-feira, 30 min:
- Revisar cards do Backlog
- Triagem de issues novas (atribuir labels, m├│dulo)
- Mover itens priorizados para "A Fazer (Sprint)" para o pr├│ximo sprint
- Arquivar itens "Conclu├¡do" com >30 dias

---

## 4.5. CI/CD workflows (GitHub Actions)

**Os 3 workflows foram criados nos seguintes caminhos** (conte├║do completo em cada arquivo):

- [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) ÔÇö lint, type-check, tests, build em todo PR
- [`.github/workflows/preview-comment.yml`](../../.github/workflows/preview-comment.yml) ÔÇö comenta URL do preview Vercel no PR
- [`.github/workflows/prisma-check.yml`](../../.github/workflows/prisma-check.yml) ÔÇö valida migrations antes de merge em `main`

### 4.5.1. `ci.yml` ÔÇö jobs e racional

```
jobs:
  lint         ÔåÆ ESLint em apps/api e apps/web
  type-check   ÔåÆ tsc --noEmit em apps/api e apps/web (quando TS estiver adotado)
  test-backend ÔåÆ vitest em apps/api com Postgres via services
  test-frontendÔåÆ vitest em apps/web
  build        ÔåÆ vite build em apps/web (garante que bundle compila)
```

Usa:
- `actions/checkout@v4`, `actions/setup-node@v4` com `cache: 'npm'`
- `services.postgres` com image `postgres:16` e `POSTGRES_PASSWORD` / `POSTGRES_DB`
- Timeout: 10 min por job

**Por que separar em m├║ltiplos jobs:** roda em paralelo; se um falha, os outros continuam ÔÇö feedback mais r├ípido ao dev. Custo em minutos do GitHub Actions ├® o mesmo (s├│ somam tempo dentro do limite).

### 4.5.2. `preview-comment.yml` ÔÇö racional

Vercel j├í cria preview automaticamente para todo PR e posta um coment├írio no PR. **Este workflow ├® redundante?** N├úo ÔÇö ele complementa com um coment├írio customizado que inclui:
- URL da preview
- Status do health check (`GET /api/admin/health` do preview)
- Link direto para p├íginas cr├¡ticas (`/login`, `/dashboard`, `/obras`)

Isso reduz atrito do reviewer, que clica direto em "testar o fluxo" em vez de navegar.

### 4.5.3. `prisma-check.yml` ÔÇö racional

Problema a evitar: **PR de feature que adiciona campo ao schema `.prisma` mas esquece de gerar migration**. Se mergeado, produ├º├úo quebra.

Este workflow verifica:
1. Se `schema.prisma` mudou desde a base do PR
2. Se mudou, alguma migration em `prisma/migrations/` tamb├®m foi adicionada?
3. Se `prisma.schema` e migrations est├úo sincronizados (`prisma migrate diff`)

Falha o check (bloqueia merge) se as regras n├úo s├úo atendidas.

---

## 4.6. Integra├º├úo Vercel Ôåö GitHub ÔÇö passo a passo

Vercel permite **2 projetos distintos apontando para o mesmo reposit├│rio**, um para o frontend e outro para o backend. ├ë exatamente o que o Obra Integrada precisa.

### 4.6.1. Criar os projetos

**Projeto 1 ÔÇö Backend (API)**

1. Acesse [vercel.com/new](https://vercel.com/new) e importe o repo `obra-integrada`
2. Em *Configure Project*:
   - **Project Name**: `obra-integrada-api`
   - **Framework Preset**: `Other` (Vercel detecta Express)
   - **Root Directory**: `apps/api` (ap├│s ADR-007 restructure) ou `backend` (antes)
   - **Build Command**: `npm install && npx prisma generate` (postinstall j├í cobre)
   - **Output Directory**: (deixar vazio)
   - **Install Command**: `npm install`
3. Em *Environment Variables*:
   - Adicionar todas as vari├íveis da Se├º├úo 1.5.4 do artefato 01
4. Deploy

**Projeto 2 ÔÇö Frontend (Web)**

1. [vercel.com/new](https://vercel.com/new) novamente, mesmo repo
2. Em *Configure Project*:
   - **Project Name**: `obra-integrada-web`
   - **Framework Preset**: `Vite`
   - **Root Directory**: `apps/web` (ou `frontend/vite-project`)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Vari├íveis de ambiente:
   - `VITE_API_URL` ÔåÆ apontar para URL do projeto 1
   - Outras `VITE_*` conforme a Se├º├úo 1.5.4
4. Deploy

### 4.6.2. Ignored Build Step ÔÇö otimiza├º├úo

Para **n├úo buildar a Vercel inteira quando um PR s├│ toca o outro projeto**, configurar *Ignored Build Step* em cada projeto:

**No projeto `obra-integrada-api`**, colar em *Settings ÔåÆ Git ÔåÆ Ignored Build Step*:

```bash
git diff HEAD^ HEAD --quiet -- apps/api/ backend/
```

Se o comando acima retornar 0 (nenhuma mudan├ºa na pasta), a Vercel pula o build.

**No projeto `obra-integrada-web`**, an├ílogo:

```bash
git diff HEAD^ HEAD --quiet -- apps/web/ frontend/
```

Isso economiza minutos de build em PRs que s├│ tocam um lado.

### 4.6.3. Dom├¡nios e ambientes

| Ambiente | Projeto | Dom├¡nio | Branch |
|---|---|---|---|
| **Produ├º├úo** | obra-integrada-web | `obra-integrada.vercel.app` (e futuro `obraintegrada.com.br`) | `main` |
| **Produ├º├úo** | obra-integrada-api | `obra-integrada-api.vercel.app` (e `api.obraintegrada.com.br`) | `main` |
| **Preview** | ambos | `<project>-<branch>-<team>.vercel.app` (autom├ítico) | qualquer branch |
| **Staging** | ambos | `staging.obra-integrada.vercel.app` | `main` (com domain assignment) |

**ÔÜá Nota sobre dom├¡nios:** os `*.vercel.app` s├úo **placeholders**. Se a equipe registrar um dom├¡nio pr├│prio (ex: `obraintegrada.com.br`), reconfigurar em *Project ÔåÆ Domains*.

### 4.6.4. Vari├íveis de ambiente por ambiente

Em cada projeto Vercel, *Settings ÔåÆ Environment Variables* suporta 3 escopos: **Production**, **Preview**, **Development** (o ├║ltimo ├® injetado ao rodar `vercel dev` localmente).

Estrat├®gia:

| Vari├ível | Production | Preview | Development |
|---|---|---|---|
| `DATABASE_URL` | DB produ├º├úo | DB preview (Neon branch) | DB dev local |
| `JWT_SECRET` | secret real (gerado com `openssl rand -base64 48`) | secret de teste | secret de teste |
| `FRONTEND_URL` | `https://obra-integrada.vercel.app` | `https://*.vercel.app` (padr├úo permissivo para preview) | `http://localhost:5173` |
| `SENTRY_DSN` | DSN produ├º├úo | DSN produ├º├úo (ou ambiente separado) | vazio (desliga) |
| `STORAGE_PROVIDER` | `supabase` | `supabase` | `local` |

### 4.6.5. Deploy autom├ítico por branch

Default da Vercel j├í ├®:
- Push em `main` ÔåÆ deploy para Production
- Push em qualquer outra branch com PR aberto ÔåÆ deploy para Preview

Configura├º├úo adicional recomendada em *Settings ÔåÆ Git*:
- **Production Branch**: `main`
- **Ignore Command**: como em 4.6.2

### 4.6.6. Monitoramento p├│s-deploy

Ap├│s primeiro deploy, integrar:
- **Vercel Analytics** (free tier): m├®tricas b├ísicas de Core Web Vitals
- **Vercel Log Drain ÔåÆ Axiom** (ADR-008): logs estruturados indexados
- **Sentry** (ADR-008): erros em tempo real

---

## 4.7. Cronograma macro de 24 meses

Cada "m├¬s" abaixo equivale a ~4 semanas de trabalho de uma equipe de 5 devs. Os PRs numerados referem-se ao roadmap do artefato 03, se├º├úo 3.3.

### M├¬s 1ÔÇô2 ÔÇö Funda├º├úo (PRs 1ÔÇô32)

**Objetivo:** reposit├│rio limpo, CI verde, primeiro deploy em produ├º├úo.

**Entreg├íveis concretos:**
- [x] Limpeza da Semana 1-2 executada (18 PRs ÔÇö Se├º├Áes 3.2.1 e 3.2.2)
- [x] GitHub Actions funcionando (`ci.yml`, `preview-comment.yml`, `prisma-check.yml`)
- [x] Sentry + Axiom integrados
- [x] Helmet + rate limiting + JWT fix + CORS fix
- [x] Resposta de API padronizada (`{ data, error, meta }`)
- [x] Middleware global de erros
- [x] Zod em todas as rotas
- [x] Migra├º├úo uploads ÔåÆ Supabase Storage
- [x] Primeiro deploy de produ├º├úo com status "verde"
- [x] `CONTRIBUTING.md`, templates, CODEOWNERS em uso

### M├¬s 3ÔÇô8 ÔÇö Features principais (PRs 33ÔÇô80 aprox.)

**Objetivo:** construir diferenciais competitivos identificados na Fase 2.

**Entreg├íveis por m├¬s:**

- **M├¬s 3**: Service layer backend; TanStack Query + shadcn/ui no frontend; Features 13 (Google Maps) e 14 (previs├úo do tempo) ÔÇö quick wins
- **M├¬s 4**: TypeScript progressivo; testes de integra├º├úo Vitest+testcontainers; Feature 01 (RDO PDF)
- **M├¬s 5**: M├│dulo de Materiais e Fabricantes (Feature 02); consolida├º├úo view/ÔåÆpages/
- **M├¬s 6**: M├│dulo de Etapas (Feature 03); primeiros testes E2E Playwright
- **M├¬s 7**: Cronograma f├¡sico-financeiro com curva S (Feature 04)
- **M├¬s 8**: Dashboard BI executivo (Feature 12)

### M├¬s 9ÔÇô10 ÔÇö Refatora├º├úo e consolida├º├úo (PRs 81ÔÇô100 aprox.)

**Objetivo:** preparar base para features avan├ºadas; pagar d├®bito residual.

**Entreg├íveis:**
- PWA offline-first (Feature 05) ÔÇö 3 sprints
- Migra├º├úo TypeScript ÔëÑ80% do c├│digo
- Cobertura de testes ÔëÑ60%
- Refresh token + logout server-side (pagar d├¡vida do artefato 01 item 27)
- Performance: Lighthouse ÔëÑ85 (FE), p95 lat├¬ncia <500ms (API)
- Revis├úo da arquitetura com base em aprendizados acumulados

### M├¬s 11ÔÇô18 ÔÇö Features avan├ºadas e IA (PRs 101ÔÇô180 aprox.)

**Objetivo:** diferenciais de mercado que impressionam banca e destravam ado├º├úo.

**Entreg├íveis por m├¬s:**

- **M├¬s 11**: Storybook dos componentes shadcn/ui; TypeDoc gerando docs de API; acessibilidade WCAG 2.1 A
- **M├¬s 12**: Consolida├º├úo TS 90%+; introdu├º├úo de Turborepo (se necess├írio); primeira release p├║blica 1.0
- **M├¬s 13**: IA ÔÇö gera├º├úo autom├ítica de RDO a partir de texto/voz (Feature 07)
- **M├¬s 14**: WhatsApp Business (Feature 10)
- **M├¬s 15**: IA ÔÇö estimativa autom├ítica de materiais via SINAPI (Feature 08) ÔÇö parte 1
- **M├¬s 16**: IA ÔÇö SINAPI parte 2; integra├º├úo cont├íbil
- **M├¬s 17**: Chat IA para trabalhadores (Feature 09)
- **M├¬s 18**: M├│dulo Seguran├ºa do Trabalho NR-18/EPI (Feature 11)

### M├¬s 19ÔÇô22 ÔÇö Polimento e robustez (PRs 181ÔÇô220 aprox.)

**Objetivo:** transformar produto funcional em produto maduro.

**Entreg├íveis:**
- **M├¬s 19**: Feature 15 (biblioteca de plantas + BIM viewer b├ísico)
- **M├¬s 20**: Performance ÔÇö bundle <400KB FE, p95 <300ms API; cache com Redis
- **M├¬s 21**: Auditoria LGPD completa; termo de consentimento; export de dados (DPO-ready)
- **M├¬s 22**: Acessibilidade WCAG 2.2 AA; i18n se houver demanda (ADR espec├¡fico)

### M├¬s 23ÔÇô24 ÔÇö Apresenta├º├úo final (PRs 221ÔÇô240 aprox.)

**Objetivo:** empacotar para defesa acad├¬mica com qualidade profissional.

**Entreg├íveis:**
- **M├¬s 23**:
  - Documenta├º├úo escrita de TCC ÔÇö ~80 p├íginas, revisada por orientador
  - Arquitetura documentada (diagramas C4 model)
  - V├¡deo demo 5-10 min (roteiro + grava├º├úo + edi├º├úo)
  - Landing page de apresenta├º├úo
  - Prepara├º├úo de infraestrutura para p├║blico (rate limits ajustados, captcha em registro, termos de uso)
- **M├¬s 24**:
  - Apresenta├º├úo ensaiada
  - Bug bash final (time ca├ºa e corrige 20+ bugs de polimento)
  - Tag v1.0 de defesa
  - Backup completo do reposit├│rio
  - P├│s-defesa: retrospectiva e decis├úo sobre futuro do produto

### 4.7.1. Marcos acad├¬micos sugeridos

Alinhados ao cronograma acima. Ajustar conforme calend├írio real da institui├º├úo:

| Marco | Quando | Entreg├ível |
|---|---|---|
| Banca de qualifica├º├úo | M├¬s 6 | Auditoria conclu├¡da + funda├º├úo + 3 features novas (Features 01, 13, 14) + 1 refatora├º├úo completa (m├│dulo Obras) |
| Marco intermedi├írio | M├¬s 12 | MVP 1.0 p├║blico; PWA funcionando; 8 features conclu├¡das |
| Pr├®-banca | M├¬s 22 | Produto completo com IA; testes ÔëÑ70%; LGPD |
| Banca final | M├¬s 24 | Produto + documento + demo + defesa |

---

## Conclus├úo da Fase 4

As escolhas de fluxo deste artefato privilegiam **simplicidade aprend├¡vel** sobre sofistica├º├úo. Branches simples, squash merge, Conventional Commits, 3 workflows CI enxutos, 2 projetos Vercel bem configurados. Nada aqui exige que algu├®m da equipe tenha experi├¬ncia pr├®via com algum tool espec├¡fico ÔÇö tudo ├® document├ível em Ôëñ1 hora de leitura.

A divis├úo por m├│dulo (n├úo por camada) ├® o ponto mais n├úo-├│bvio. Recomenda-se **conscientemente resistir** ├á tenta├º├úo de "Dev A ├® backend, Dev B ├® frontend" quando o time crescer em maturidade. Ownership end-to-end cria engenheiros melhores e entregas mais r├ípidas.

O cronograma de 24 meses ├® **ambicioso mas cab├¡vel** se disciplina de limpeza + testes for mantida desde o M├¬s 1. O maior risco de atraso ├® n├úo fazer a higiene da Semana 1-2 e deixar d├®bito t├®cnico crescer composicionalmente.

Os 8 arquivos referenciados (templates + workflows + CONTRIBUTING + CODEOWNERS) acompanham este artefato como arquivos reais no reposit├│rio. Os placeholders `@dev1`...`@dev5` no CODEOWNERS e nos textos devem ser substitu├¡dos pelos handles reais do GitHub antes do primeiro Ruleset ser ativado em `main`.

Esta fase encerra a Auditoria Inicial. Pr├│ximos passos: aprovar os ADRs em sess├úo de equipe, come├ºar os PRs da Semana 1, configurar os 2 projetos Vercel.

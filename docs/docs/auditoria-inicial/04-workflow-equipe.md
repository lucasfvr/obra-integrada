# Fase 4 — Integração com GitHub e Fluxo de Trabalho da Equipe

**Projeto:** Obra Integrada
**Data:** 24 de abril de 2026
**Escopo:** Branches, divisão de responsabilidades, templates GitHub, CI/CD, integração Vercel e cronograma macro de 24 meses

---

## Sumário executivo

Este artefato formaliza **como uma equipe de 5–6 desenvolvedores** (sendo 1 com continuidade incerta) organiza o trabalho diário no projeto Obra Integrada, usando GitHub como plataforma de colaboração e Vercel como plataforma de deploy.

As escolhas privilegiam **fluxos leves, automáveis e aprendíveis** em até 2 semanas: branch model baseado em `main` + feature branches (trunk-based light), proteção de branches via GitHub Rulesets, Conventional Commits para histórico legível, e 3 GitHub Actions workflows enxutos (~50 linhas cada) para garantir qualidade mínima em todo PR.

A divisão de responsabilidades é **por módulo de negócio** (não por camada), com papéis fixos (Tech Lead, DevOps) e papéis rotativos (Reviewer da semana, Docs da semana). O cronograma macro de 24 meses vincula entregas a marcos acadêmicos de TCC.

Todos os templates referenciados (`PULL_REQUEST_TEMPLATE.md`, `ISSUE_TEMPLATE/*.md`, `CODEOWNERS`, 3 workflows YAML e `CONTRIBUTING.md`) **foram criados junto deste artefato** — não são descrições, são arquivos funcionais na sua localização canônica.

---

## 4.1. Estrutura de branches recomendada

### 4.1.1. Modelo escolhido: trunk-based com feature branches de vida curta

O projeto adotará um modelo próximo ao **Trunk-Based Development** descrito por Paul Hammant (`trunkbaseddevelopment.com`), adaptado para equipe acadêmica que ainda não tem maturidade de deploys diários.

**Características:**

- **Um único branch de integração: `main`**. É sempre deployable (considerado "release-ready").
- **Feature branches de vida curta** (<5 dias idealmente, <2 semanas no limite) — quanto mais curto, menos dor em merge.
- **Sem `develop` separado**. Staging é um ambiente com deploy automático de `main` antes de produção.
- **Sem `release/*` branches** — releases são feitas por tag (`v1.2.0`) diretamente de `main`.
- **`hotfix/*`** apenas para correções urgentes em produção (raríssimo).

### 4.1.2. Convenção de nomes de branches

| Padrão | Exemplo | Quando usar |
|---|---|---|
| `feature/<modulo>-<descricao-curta>` | `feature/diario-exportar-pdf` | Nova funcionalidade |
| `fix/<modulo>-<descricao-curta>` | `fix/auth-jwt-secret-fallback` | Correção de bug |
| `chore/<descricao>` | `chore/delete-orphan-files` | Manutenção, deps, tooling |
| `refactor/<area>-<descricao>` | `refactor/api-extract-obra-service` | Refatoração sem mudança funcional |
| `docs/<descricao>` | `docs/update-readme` | Só documentação |
| `hotfix/<descricao>` | `hotfix/login-500-error` | Bug crítico em produção |

Palavras proibidas em nome de branch: números de issue como raiz do nome (preferir descrição), nomes genéricos (`feature/update`, `fix/bug`).

### 4.1.3. Regras de proteção — GitHub Rulesets

A proteção de `main` deve ser configurada em *Settings → Rules → Rulesets* com as seguintes regras mínimas:

- **Restrict deletions**: impedir delete do branch
- **Require linear history**: preferir `squash merge` (evita merge commits "ruído")
- **Require pull request**:
  - Requer aprovação de **no mínimo 1 reviewer** (2 para mudanças em áreas críticas — ver Section 4.2)
  - Reviewer não pode ser o autor
  - Aprovações são invalidadas em novo push
- **Require status checks to pass**:
  - `CI / lint`
  - `CI / type-check`
  - `CI / test-backend`
  - `CI / test-frontend`
  - `CI / build-frontend`
  - `prisma-check`
- **Require conversation resolution**: resolver todos comentários
- **Require signed commits** (opcional mas recomendado): `git commit -S`
- **Block force pushes**

### 4.1.4. Merge strategies

| Situação | Estratégia | Racional |
|---|---|---|
| Feature → main | **Squash & merge** | 1 commit limpo por PR; histórico legível |
| Fix pequeno → main | **Squash & merge** | Idem |
| Hotfix → main | **Squash & merge** | Idem |
| Release tag | `git tag -a v1.2.0 -m "..."` + `git push --tags` | SemVer |

**Merge commit** e **rebase merge** são **desabilitados** no GitHub para evitar confusão.

### 4.1.5. Conventional Commits

Todo commit segue o padrão de [Conventional Commits v1.0.0](https://www.conventionalcommits.org/):

```
<tipo>(<escopo opcional>): <descrição curta no imperativo>

<corpo opcional — o porquê>

<rodapé opcional — BREAKING CHANGE, Refs, Co-authored-by>
```

Tipos aceitos:
- `feat`: nova funcionalidade
- `fix`: correção de bug
- `chore`: manutenção, sem impacto em app
- `refactor`: refatoração sem mudança funcional
- `docs`: só documentação
- `test`: adiciona/ajusta testes
- `perf`: melhoria de performance
- `build`: mudanças de build/deps
- `ci`: mudanças em CI/CD
- `style`: formatação, sem mudança de lógica

Escopo (opcional): `obras`, `diario`, `tarefas`, `financeiro`, `rh`, `admin`, `auth`, `api`, `web`, `db`, `ci`.

Exemplos válidos:

```
feat(diario): add GPS audit status workflow
fix(auth): remove JWT_SECRET hardcoded fallback
chore(db): add tb_log_auditoria model
refactor(api): extract ObraService from controller
docs(adr): accept ADR-003 Zod for validation
```

Essa disciplina habilita, no futuro, **semantic-release** (versionamento automático) e **changelog** gerado automaticamente.

---

## 4.2. Divisão de responsabilidades entre os 5–6 membros

### 4.2.1. Princípio: divisão por módulo, não por camada

Em vez de ter "um dev de backend" e "um dev de frontend", cada desenvolvedor é **owner de 1–2 módulos de negócio** e escreve código nas 2 camadas desses módulos. Isso gera:

- **Contexto concentrado**: o dev que faz RDO PDF (Feature 01) entende o fluxo do diário fim-a-fim
- **Menos handoff**: não precisa esperar outro dev para avançar
- **Review mais qualificado**: o owner de um módulo revisa mudanças na área alheia com perguntas de negócio

### 4.2.2. Matriz proposta de módulos × pessoas

Dada a incerteza do 6º membro, o planejamento assume **5 devs com owner principal + 1 secundário cobrindo**. Se o 6º se confirmar, assume Admin (hoje menor carga).

| Módulo | Owner primário | Owner secundário (backup) | Código em |
|---|---|---|---|
| **Obras + Materiais + Etapas** | Dev 1 | Dev 2 | `apps/api/controllers/obra*`, `apps/api/controllers/material*`, `apps/web/src/pages/Obra/`, `apps/web/src/pages/Obras/` |
| **Diário + Tarefas** | Dev 2 | Dev 1 | `apps/api/controllers/diario*`, `apps/api/controllers/tarefa*`, `apps/web/src/pages/Calendar*`, `apps/web/src/pages/Obra/sections/ObraDiario*` |
| **Financeiro** | Dev 3 | Dev 5 | `apps/api/controllers/financeiro*`, `apps/web/src/pages/Obra/sections/ObraFinanceiro*` |
| **RH + Usuários + Auth** | Dev 4 | Dev 3 | `apps/api/controllers/rh*`, `apps/api/controllers/user*`, `apps/api/middlewares/auth*`, `apps/web/src/context/AuthContext*`, `apps/web/src/pages/Operational/GestaoRH*` |
| **Admin + Observabilidade + DevOps** | Dev 5 (Tech Lead/DevOps) | Dev 4 | `apps/api/controllers/admin*`, `.github/`, `docs/`, configs Vercel, Sentry, Axiom |
| **IA + Integrações (a partir do Mês 13)** | Dev 6 (se existir) OU rotativo | — | `apps/api/integrations/`, `packages/ai/` |

### 4.2.3. Papéis fixos

| Papel | Pessoa | Responsabilidades |
|---|---|---|
| **Tech Lead** | Dev 5 | Decisões arquiteturais (propõe ADRs), veta/aprova PRs em áreas críticas (auth, DB schema), treina o time |
| **DevOps / Release Manager** | Dev 5 (acumula no início; desacopla no Mês 12+) | Mantém CI/CD, gerencia Vercel, deploys, monitoring, runbook |
| **Product Owner (acadêmico)** | Rotativo mensal entre Dev 1-4 | Prioriza backlog, escreve histórias, interlocutor com professor orientador |

### 4.2.4. Papéis rotativos (semanais)

Rotação semanal entre os 5 devs:

| Papel | Duração | Responsabilidade |
|---|---|---|
| **Reviewer da semana** | Seg → Sex | Review prioritário de PRs (meta: <24h para 1º review); coordenar com outros reviewers específicos quando o PR toca vários módulos |
| **Docs da semana** | Seg → Sex | Atualizar docs (README, CONTRIBUTING, ADRs novos se houver); cuidar que PRs mesclados tenham atualização de docs quando necessário |
| **Oncall de bugs** | Seg → Sex | Primeira linha para issues abertas com label `bug`; tenta reprodução, atribui a owner do módulo se não conseguir resolver |

A rotação é visível em `/docs/team-rotation.md` (a ser criado quando a equipe confirmar nomes).

### 4.2.5. Reuniões

| Tipo | Frequência | Duração | Participantes |
|---|---|---|---|
| **Daily async no GitHub** | Diária | — | Todos — post no Discussions |
| **Weekly sync** | Segunda 18h | 30 min | Todos — review do sprint, impedimentos |
| **ADR review** | Quinzenal (ou sob demanda) | 45 min | Todos — discussão de novas decisões |
| **Retrospectiva** | A cada 4 semanas | 1h | Todos — melhoria de processo |
| **Demo interna** | A cada 8 semanas | 1h | Todos + orientador | — |

---

## 4.3. Templates a criar

**Estes arquivos foram criados junto deste artefato**, nas seguintes localizações:

- [`.github/PULL_REQUEST_TEMPLATE.md`](../../.github/PULL_REQUEST_TEMPLATE.md)
- [`.github/ISSUE_TEMPLATE/bug_report.md`](../../.github/ISSUE_TEMPLATE/bug_report.md)
- [`.github/ISSUE_TEMPLATE/feature_request.md`](../../.github/ISSUE_TEMPLATE/feature_request.md)
- [`.github/CODEOWNERS`](../../.github/CODEOWNERS)
- [`CONTRIBUTING.md`](../../CONTRIBUTING.md)

O conteúdo canônico de cada um está nos próprios arquivos; aqui fica o racional de cada seção.

### 4.3.1. Pull Request Template — racional

O template guia o autor do PR a responder 4 perguntas:
1. **O quê**: resumo em 1-2 frases
2. **Por quê**: link para issue ou ADR
3. **Como testar**: passos para reviewer reproduzir
4. **Checklist**: testes, docs, screenshots (se UI)

Justificativa: sem checklist, PRs "passam" com gaps (ex: esquece de atualizar README ou seed). O checklist força o autor a lembrar.

### 4.3.2. Issue Templates

**Bug report**: força reprodução passo-a-passo, comportamento esperado × observado, environment.
**Feature request**: força articulação do problema do usuário (não "adicionar X" mas "usuário Y quer fazer Z porque W").

### 4.3.3. CODEOWNERS

CODEOWNERS mapeia o owner de cada pasta. GitHub atribui reviewers automaticamente quando um PR toca uma pasta.

Nota importante: os handles nos CODEOWNERS são **placeholders (`@dev1`, `@dev2`, ...)**. A equipe deve substituir pelos handles reais do GitHub antes de ativar proteção de branch com `CODEOWNERS required`.

### 4.3.4. CONTRIBUTING.md

Documenta o que o dev novo precisa fazer no primeiro dia: setup local, rodar testes, padrão de commits, como abrir PR. Substitui "onboarding verbal" por texto que não envelhece de uma troca para outra.

---

## 4.4. GitHub Projects — configuração de board Kanban

### 4.4.1. Estrutura recomendada

Um único board por projeto (GitHub Projects v2), vinculado ao repositório.

**Nome:** `Obra Integrada — Roadmap`

**Colunas (views):**

| Coluna | Definição | Limite (WIP) |
|---|---|---|
| **📋 Backlog** | Ideia registrada, ainda não priorizada | — |
| **🎯 A Fazer (Sprint)** | Priorizada para sprint atual (2 semanas) | — |
| **⚙️ Em Andamento** | Alguém pegou e está trabalhando | **6** (1.2 por dev, leve overload é OK) |
| **🔍 Em Revisão** | PR aberto, aguardando review | 4 |
| **✅ Concluído** | Merged na main — itens mais antigos que 30 dias são arquivados | — |
| **⛔ Bloqueado** | Aguardando dependência externa (resposta de usuário, API de terceiro) | — |

### 4.4.2. Views adicionais

- **Por módulo**: agrupa cards por `Module` (label)
- **Por pessoa**: agrupa por Assignee
- **Roadmap 24 meses**: timeline-view usando campo customizado `Sprint` (com valores Sprint-01 ... Sprint-48, cada sprint = 2 semanas)

### 4.4.3. Labels padrão

**Tipo:**
- `type: bug`
- `type: feature`
- `type: chore`
- `type: refactor`
- `type: docs`
- `type: test`

**Prioridade:**
- `priority: P0 — critical` (bloqueia produção)
- `priority: P1 — high`
- `priority: P2 — medium`
- `priority: P3 — low`

**Módulo:**
- `module: obras`
- `module: diario`
- `module: tarefas`
- `module: financeiro`
- `module: rh`
- `module: admin`
- `module: auth`
- `module: devops`
- `module: infra`

**Tamanho (estimativa rápida):**
- `size: S` (<1 dia)
- `size: M` (1-3 dias)
- `size: L` (4-7 dias)
- `size: XL` (>1 semana — deveria ser quebrado)

**Status especial:**
- `good first issue` (para quando precisarmos onboarding)
- `help wanted`
- `needs ADR` (decisão arquitetural necessária antes de implementar)

### 4.4.4. Automações recomendadas (GitHub Projects)

GitHub Projects v2 tem automações built-in:

| Trigger | Ação |
|---|---|
| Issue aberta | Auto-add ao board na coluna Backlog |
| Issue fechada | Mover para Concluído |
| PR aberto | Mover card linkado para Em Revisão |
| PR merged | Mover card linkado para Concluído |
| Draft PR aberto | Manter em Em Andamento |

Configuração via *Project Settings → Workflows*.

### 4.4.5. Cadência de grooming

Toda sexta-feira, 30 min:
- Revisar cards do Backlog
- Triagem de issues novas (atribuir labels, módulo)
- Mover itens priorizados para "A Fazer (Sprint)" para o próximo sprint
- Arquivar itens "Concluído" com >30 dias

---

## 4.5. CI/CD workflows (GitHub Actions)

**Os 3 workflows foram criados nos seguintes caminhos** (conteúdo completo em cada arquivo):

- [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) — lint, type-check, tests, build em todo PR
- [`.github/workflows/preview-comment.yml`](../../.github/workflows/preview-comment.yml) — comenta URL do preview Vercel no PR
- [`.github/workflows/prisma-check.yml`](../../.github/workflows/prisma-check.yml) — valida migrations antes de merge em `main`

### 4.5.1. `ci.yml` — jobs e racional

```
jobs:
  lint         → ESLint em apps/api e apps/web
  type-check   → tsc --noEmit em apps/api e apps/web (quando TS estiver adotado)
  test-backend → vitest em apps/api com Postgres via services
  test-frontend→ vitest em apps/web
  build        → vite build em apps/web (garante que bundle compila)
```

Usa:
- `actions/checkout@v4`, `actions/setup-node@v4` com `cache: 'npm'`
- `services.postgres` com image `postgres:16` e `POSTGRES_PASSWORD` / `POSTGRES_DB`
- Timeout: 10 min por job

**Por que separar em múltiplos jobs:** roda em paralelo; se um falha, os outros continuam — feedback mais rápido ao dev. Custo em minutos do GitHub Actions é o mesmo (só somam tempo dentro do limite).

### 4.5.2. `preview-comment.yml` — racional

Vercel já cria preview automaticamente para todo PR e posta um comentário no PR. **Este workflow é redundante?** Não — ele complementa com um comentário customizado que inclui:
- URL da preview
- Status do health check (`GET /api/admin/health` do preview)
- Link direto para páginas críticas (`/login`, `/dashboard`, `/obras`)

Isso reduz atrito do reviewer, que clica direto em "testar o fluxo" em vez de navegar.

### 4.5.3. `prisma-check.yml` — racional

Problema a evitar: **PR de feature que adiciona campo ao schema `.prisma` mas esquece de gerar migration**. Se mergeado, produção quebra.

Este workflow verifica:
1. Se `schema.prisma` mudou desde a base do PR
2. Se mudou, alguma migration em `prisma/migrations/` também foi adicionada?
3. Se `prisma.schema` e migrations estão sincronizados (`prisma migrate diff`)

Falha o check (bloqueia merge) se as regras não são atendidas.

---

## 4.6. Integração Vercel ↔ GitHub — passo a passo

Vercel permite **2 projetos distintos apontando para o mesmo repositório**, um para o frontend e outro para o backend. É exatamente o que o Obra Integrada precisa.

### 4.6.1. Criar os projetos

**Projeto 1 — Backend (API)**

1. Acesse [vercel.com/new](https://vercel.com/new) e importe o repo `obra-integrada`
2. Em *Configure Project*:
   - **Project Name**: `obra-integrada-api`
   - **Framework Preset**: `Other` (Vercel detecta Express)
   - **Root Directory**: `apps/api` (após ADR-007 restructure) ou `backend` (antes)
   - **Build Command**: `npm install && npx prisma generate` (postinstall já cobre)
   - **Output Directory**: (deixar vazio)
   - **Install Command**: `npm install`
3. Em *Environment Variables*:
   - Adicionar todas as variáveis da Seção 1.5.4 do artefato 01
4. Deploy

**Projeto 2 — Frontend (Web)**

1. [vercel.com/new](https://vercel.com/new) novamente, mesmo repo
2. Em *Configure Project*:
   - **Project Name**: `obra-integrada-web`
   - **Framework Preset**: `Vite`
   - **Root Directory**: `apps/web` (ou `frontend/vite-project`)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Variáveis de ambiente:
   - `VITE_API_URL` → apontar para URL do projeto 1
   - Outras `VITE_*` conforme a Seção 1.5.4
4. Deploy

### 4.6.2. Ignored Build Step — otimização

Para **não buildar a Vercel inteira quando um PR só toca o outro projeto**, configurar *Ignored Build Step* em cada projeto:

**No projeto `obra-integrada-api`**, colar em *Settings → Git → Ignored Build Step*:

```bash
git diff HEAD^ HEAD --quiet -- apps/api/ backend/
```

Se o comando acima retornar 0 (nenhuma mudança na pasta), a Vercel pula o build.

**No projeto `obra-integrada-web`**, análogo:

```bash
git diff HEAD^ HEAD --quiet -- apps/web/ frontend/
```

Isso economiza minutos de build em PRs que só tocam um lado.

### 4.6.3. Domínios e ambientes

| Ambiente | Projeto | Domínio | Branch |
|---|---|---|---|
| **Produção** | obra-integrada-web | `obra-integrada.vercel.app` (e futuro `obraintegrada.com.br`) | `main` |
| **Produção** | obra-integrada-api | `obra-integrada-api.vercel.app` (e `api.obraintegrada.com.br`) | `main` |
| **Preview** | ambos | `<project>-<branch>-<team>.vercel.app` (automático) | qualquer branch |
| **Staging** | ambos | `staging.obra-integrada.vercel.app` | `main` (com domain assignment) |

**⚠ Nota sobre domínios:** os `*.vercel.app` são **placeholders**. Se a equipe registrar um domínio próprio (ex: `obraintegrada.com.br`), reconfigurar em *Project → Domains*.

### 4.6.4. Variáveis de ambiente por ambiente

Em cada projeto Vercel, *Settings → Environment Variables* suporta 3 escopos: **Production**, **Preview**, **Development** (o último é injetado ao rodar `vercel dev` localmente).

Estratégia:

| Variável | Production | Preview | Development |
|---|---|---|---|
| `DATABASE_URL` | DB produção | DB preview (Neon branch) | DB dev local |
| `JWT_SECRET` | secret real (gerado com `openssl rand -base64 48`) | secret de teste | secret de teste |
| `FRONTEND_URL` | `https://obra-integrada.vercel.app` | `https://*.vercel.app` (padrão permissivo para preview) | `http://localhost:5173` |
| `SENTRY_DSN` | DSN produção | DSN produção (ou ambiente separado) | vazio (desliga) |
| `STORAGE_PROVIDER` | `supabase` | `supabase` | `local` |

### 4.6.5. Deploy automático por branch

Default da Vercel já é:
- Push em `main` → deploy para Production
- Push em qualquer outra branch com PR aberto → deploy para Preview

Configuração adicional recomendada em *Settings → Git*:
- **Production Branch**: `main`
- **Ignore Command**: como em 4.6.2

### 4.6.6. Monitoramento pós-deploy

Após primeiro deploy, integrar:
- **Vercel Analytics** (free tier): métricas básicas de Core Web Vitals
- **Vercel Log Drain → Axiom** (ADR-008): logs estruturados indexados
- **Sentry** (ADR-008): erros em tempo real

---

## 4.7. Cronograma macro de 24 meses

Cada "mês" abaixo equivale a ~4 semanas de trabalho de uma equipe de 5 devs. Os PRs numerados referem-se ao roadmap do artefato 03, seção 3.3.

### Mês 1–2 — Fundação (PRs 1–32)

**Objetivo:** repositório limpo, CI verde, primeiro deploy em produção.

**Entregáveis concretos:**
- [x] Limpeza da Semana 1-2 executada (18 PRs — Seções 3.2.1 e 3.2.2)
- [x] GitHub Actions funcionando (`ci.yml`, `preview-comment.yml`, `prisma-check.yml`)
- [x] Sentry + Axiom integrados
- [x] Helmet + rate limiting + JWT fix + CORS fix
- [x] Resposta de API padronizada (`{ data, error, meta }`)
- [x] Middleware global de erros
- [x] Zod em todas as rotas
- [x] Migração uploads → Supabase Storage
- [x] Primeiro deploy de produção com status "verde"
- [x] `CONTRIBUTING.md`, templates, CODEOWNERS em uso

### Mês 3–8 — Features principais (PRs 33–80 aprox.)

**Objetivo:** construir diferenciais competitivos identificados na Fase 2.

**Entregáveis por mês:**

- **Mês 3**: Service layer backend; TanStack Query + shadcn/ui no frontend; Features 13 (Google Maps) e 14 (previsão do tempo) — quick wins
- **Mês 4**: TypeScript progressivo; testes de integração Vitest+testcontainers; Feature 01 (RDO PDF)
- **Mês 5**: Módulo de Materiais e Fabricantes (Feature 02); consolidação view/→pages/
- **Mês 6**: Módulo de Etapas (Feature 03); primeiros testes E2E Playwright
- **Mês 7**: Cronograma físico-financeiro com curva S (Feature 04)
- **Mês 8**: Dashboard BI executivo (Feature 12)

### Mês 9–10 — Refatoração e consolidação (PRs 81–100 aprox.)

**Objetivo:** preparar base para features avançadas; pagar débito residual.

**Entregáveis:**
- PWA offline-first (Feature 05) — 3 sprints
- Migração TypeScript ≥80% do código
- Cobertura de testes ≥60%
- Refresh token + logout server-side (pagar dívida do artefato 01 item 27)
- Performance: Lighthouse ≥85 (FE), p95 latência <500ms (API)
- Revisão da arquitetura com base em aprendizados acumulados

### Mês 11–18 — Features avançadas e IA (PRs 101–180 aprox.)

**Objetivo:** diferenciais de mercado que impressionam banca e destravam adoção.

**Entregáveis por mês:**

- **Mês 11**: Storybook dos componentes shadcn/ui; TypeDoc gerando docs de API; acessibilidade WCAG 2.1 A
- **Mês 12**: Consolidação TS 90%+; introdução de Turborepo (se necessário); primeira release pública 1.0
- **Mês 13**: IA — geração automática de RDO a partir de texto/voz (Feature 07)
- **Mês 14**: WhatsApp Business (Feature 10)
- **Mês 15**: IA — estimativa automática de materiais via SINAPI (Feature 08) — parte 1
- **Mês 16**: IA — SINAPI parte 2; integração contábil
- **Mês 17**: Chat IA para trabalhadores (Feature 09)
- **Mês 18**: Módulo Segurança do Trabalho NR-18/EPI (Feature 11)

### Mês 19–22 — Polimento e robustez (PRs 181–220 aprox.)

**Objetivo:** transformar produto funcional em produto maduro.

**Entregáveis:**
- **Mês 19**: Feature 15 (biblioteca de plantas + BIM viewer básico)
- **Mês 20**: Performance — bundle <400KB FE, p95 <300ms API; cache com Redis
- **Mês 21**: Auditoria LGPD completa; termo de consentimento; export de dados (DPO-ready)
- **Mês 22**: Acessibilidade WCAG 2.2 AA; i18n se houver demanda (ADR específico)

### Mês 23–24 — Apresentação final (PRs 221–240 aprox.)

**Objetivo:** empacotar para defesa acadêmica com qualidade profissional.

**Entregáveis:**
- **Mês 23**:
  - Documentação escrita de TCC — ~80 páginas, revisada por orientador
  - Arquitetura documentada (diagramas C4 model)
  - Vídeo demo 5-10 min (roteiro + gravação + edição)
  - Landing page de apresentação
  - Preparação de infraestrutura para público (rate limits ajustados, captcha em registro, termos de uso)
- **Mês 24**:
  - Apresentação ensaiada
  - Bug bash final (time caça e corrige 20+ bugs de polimento)
  - Tag v1.0 de defesa
  - Backup completo do repositório
  - Pós-defesa: retrospectiva e decisão sobre futuro do produto

### 4.7.1. Marcos acadêmicos sugeridos

Alinhados ao cronograma acima. Ajustar conforme calendário real da instituição:

| Marco | Quando | Entregável |
|---|---|---|
| Banca de qualificação | Mês 6 | Auditoria concluída + fundação + 3 features novas (Features 01, 13, 14) + 1 refatoração completa (módulo Obras) |
| Marco intermediário | Mês 12 | MVP 1.0 público; PWA funcionando; 8 features concluídas |
| Pré-banca | Mês 22 | Produto completo com IA; testes ≥70%; LGPD |
| Banca final | Mês 24 | Produto + documento + demo + defesa |

---

## Conclusão da Fase 4

As escolhas de fluxo deste artefato privilegiam **simplicidade aprendível** sobre sofisticação. Branches simples, squash merge, Conventional Commits, 3 workflows CI enxutos, 2 projetos Vercel bem configurados. Nada aqui exige que alguém da equipe tenha experiência prévia com algum tool específico — tudo é documentável em ≤1 hora de leitura.

A divisão por módulo (não por camada) é o ponto mais não-óbvio. Recomenda-se **conscientemente resistir** à tentação de "Dev A é backend, Dev B é frontend" quando o time crescer em maturidade. Ownership end-to-end cria engenheiros melhores e entregas mais rápidas.

O cronograma de 24 meses é **ambicioso mas cabível** se disciplina de limpeza + testes for mantida desde o Mês 1. O maior risco de atraso é não fazer a higiene da Semana 1-2 e deixar débito técnico crescer composicionalmente.

Os 8 arquivos referenciados (templates + workflows + CONTRIBUTING + CODEOWNERS) acompanham este artefato como arquivos reais no repositório. Os placeholders `@dev1`...`@dev5` no CODEOWNERS e nos textos devem ser substituídos pelos handles reais do GitHub antes do primeiro Ruleset ser ativado em `main`.

Esta fase encerra a Auditoria Inicial. Próximos passos: aprovar os ADRs em sessão de equipe, começar os PRs da Semana 1, configurar os 2 projetos Vercel.

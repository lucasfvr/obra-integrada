# Auditoria Inicial ÔÇö Obra Integrada

**Data:** 24 de abril de 2026
**Escopo:** Auditoria arquitetural completa + roadmap estrat├®gico de 24 meses
**P├║blico-alvo:** Equipe t├®cnica (5-6 devs), orientador acad├¬mico, banca de TCC

---

## O que ├® isto

Este diret├│rio cont├®m **4 artefatos de auditoria** que formam a base de refer├¬ncia para o desenvolvimento do Obra Integrada nos pr├│ximos 24 meses:

| # | Artefato | Foco | P├íginas estimadas |
|---|---|---|---|
| 1 | [`01-auditoria-tecnica.md`](./01-auditoria-tecnica.md) | Diagn├│stico do c├│digo atual ÔÇö estrutura, schema, qualidade, seguran├ºa, prontid├úo Vercel, d├®bito t├®cnico priorizado | ~18 |
| 2 | [`02-evolucao-produto.md`](./02-evolucao-produto.md) | An├ílise do produto ÔÇö funcionalidades atuais, benchmark competitivo BR, 15 features propostas, oportunidades arquiteturais | ~14 |
| 3 | [`03-plano-refatoracao.md`](./03-plano-refatoracao.md) | 10 ADRs, plano de limpeza 2 semanas, refatora├º├úo incremental 6 meses | ~15 |
| 4 | [`04-workflow-equipe.md`](./04-workflow-equipe.md) | Branches, divis├úo por m├│dulo, templates GitHub, CI/CD, integra├º├úo Vercel, cronograma 24 meses | ~12 |

Complementarmente, foram criados **8 arquivos funcionais** no reposit├│rio durante esta auditoria:

- [`.github/PULL_REQUEST_TEMPLATE.md`](../../.github/PULL_REQUEST_TEMPLATE.md)
- [`.github/ISSUE_TEMPLATE/bug_report.md`](../../.github/ISSUE_TEMPLATE/bug_report.md)
- [`.github/ISSUE_TEMPLATE/feature_request.md`](../../.github/ISSUE_TEMPLATE/feature_request.md)
- [`.github/CODEOWNERS`](../../.github/CODEOWNERS)
- [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)
- [`.github/workflows/preview-comment.yml`](../../.github/workflows/preview-comment.yml)
- [`.github/workflows/prisma-check.yml`](../../.github/workflows/prisma-check.yml)
- [`CONTRIBUTING.md`](../../CONTRIBUTING.md)

---

## S├¡ntese executiva

### Diagn├│stico (Fase 1)

O Obra Integrada ├® **acad├¬mico maduro em escopo funcional** (21 entidades no schema, 10 controllers, RBAC com 8 pap├®is, upload de arquivos, di├írio com GPS), e **imaturo em disciplina de engenharia** (testes s├│ mock, valida├º├úo dispersa por regex, depend├¬ncias duplicadas, 15+ arquivos ├│rf├úos, `dev.db` e cobertura commitados, JWT secret com fallback hardcoded).

**6 problemas cr├¡ticos de seguran├ºa** identificados (todos P0, corrig├¡veis na Semana 1): JWT fallback, CORS aberto, 2 rotas admin sem RBAC, uploads ef├¬meros na Vercel, falta de rate limit em login.

**D├®bito total:** 33 itens catalogados em matriz Esfor├ºo ├ù Impacto. Desses, 9 s├úo P0 (~1 semana), 10 s├úo P1 (~1 m├¬s), 11 s├úo P2 (~2-3 meses).

### Oportunidades de produto (Fase 2)

**2 diferenciais j├í presentes** que superam a m├®dia do mercado para construtoras pequenas: auditoria geogr├ífica do di├írio com GPS + multi-tenancy nativo desde o schema.

**Gaps competitivos principais vs. concorrentes brasileiros** (Sienge, Vobi, Obra Prima, Mobuss):
- Sem RDO (Relat├│rio Di├írio de Obra) export├ível em PDF ÔÇö feature b├ísica do l├¡der em pequenas construtoras (Obra Prima)
- Sem integra├º├úo SINAPI (tabela nacional de insumos) ÔÇö diferencial Vobi
- Sem Agentes de IA ÔÇö diferencial ├║nico da Vobi
- Sem app mobile / PWA offline ÔÇö limita uso em canteiro com conex├úo ruim
- 9 modelos Prisma ociosos (materiais, fabricantes, etapas) prontos para virar m├│dulo

**15 features propostas** cobrindo: paridade de mercado (RDO PDF, cronograma f├¡sico-financeiro, materiais), diferencial mobile (PWA offline, Google Maps, previs├úo do tempo), diferencial IA (RDO autom├ítico por voz, estimativa via SINAPI, chatbot para trabalhadores), lock-in (BI executivo, biblioteca de plantas/BIM, seguran├ºa do trabalho NR-18).

### Plano de evolu├º├úo (Fase 3)

**10 ADRs propostos** para decis├Áes arquiteturais pendentes:
- ADR-001: TypeScript progressivo (strangler, meta 70% em 12 meses)
- ADR-002: Storage com Supabase Storage (interface troc├ível)
- ADR-003: Zod para valida├º├úo
- ADR-004: Testing Trophy (unit + integra├º├úo com testcontainers + E2E Playwright)
- ADR-005: TanStack Query no frontend
- ADR-006: shadcn/ui para componentes
- ADR-007: npm workspaces (escalar para Turborepo no M├¬s 12+)
- ADR-008: Sentry + Axiom
- ADR-009: GitHub Actions
- ADR-010: Ambientes dev/staging/prod com Neon (Postgres com branching)

**Refatora├º├úo incremental** em 59 PRs sequenciais dos Meses 1-6, convergindo com as primeiras features do produto.

### Workflow de equipe (Fase 4)

- **Branches:** trunk-based light, feature branches curtas, squash merge, Conventional Commits
- **Divis├úo por m├│dulo de neg├│cio, n├úo por camada** ÔÇö cada dev owner de 1-2 m├│dulos end-to-end
- **Pap├®is fixos:** Tech Lead + DevOps (Dev 5). **Rotativos:** Reviewer da semana, Docs da semana, Oncall de bugs
- **CI/CD:** 3 workflows ÔÇö ci.yml, preview-comment.yml, prisma-check.yml
- **Vercel:** 2 projetos no mesmo repo (web + api), previews por PR, ignored build step por pasta
- **Cronograma 24 meses:** Meses 1-2 funda├º├úo ÔåÆ 3-8 features principais ÔåÆ 9-10 consolida├º├úo ÔåÆ 11-18 features avan├ºadas e IA ÔåÆ 19-22 polimento ÔåÆ 23-24 defesa

---

## Como ler estes artefatos

**Se voc├¬ ├®:**

- **Gerente / orientador:** comece por este README; v├í direto ├ás conclus├Áes de cada fase.
- **Tech Lead (Dev 5):** leia os 4 documentos em ordem; priorize ADRs da Fase 3 e cronograma da Fase 4.
- **Dev entrando no projeto:** comece por `CONTRIBUTING.md` na raiz; volte aqui para a Se├º├úo 1.1 (mapa do c├│digo) de `01-auditoria-tecnica.md`.
- **Product Owner:** leia `02-evolucao-produto.md` primeiro; volte para 1.1 se precisar entender o que j├í existe.
- **Banca acad├¬mica / avaliador externo:** os 4 documentos em ordem cobrem tudo.

---

## Pontos de aten├º├úo

### Placeholders a substituir antes de ativar prote├º├Áes

- Em `.github/CODEOWNERS`, substituir `@dev1`...`@dev5` pelos handles reais do GitHub
- Em `docs/auditoria-inicial/04-workflow-equipe.md` Se├º├úo 4.2, alinhar nomes reais
- Em `preview-comment.yml` (Se├º├úo 4.5), confirmar nomes dos projetos Vercel reais (`obra-integrada-web`, `obra-integrada-api`) antes de ativar

### Suposi├º├Áes que podem ser reavaliadas pela equipe

- **Stack de Postgres** (ADR-010): escolha entre Neon, Supabase, Railway depende do custo aceit├ível e de decis├úo sobre ADR-002 (storage) ÔÇö se Supabase para storage, natural usar Supabase para Postgres tamb├®m.
- **ADR-001 TypeScript**: alguns membros podem preferir JS puro. Decis├úo final deve ser discutida em reuni├úo antes do M├¬s 3.
- **Divis├úo por m├│dulo vs. por camada** (Se├º├úo 4.2): requer buy-in do time. Se algu├®m tem avers├úo, discutir antes do primeiro sprint.

### Decis├Áes que a equipe ainda precisa tomar

1. **Handles GitHub reais** ÔÇö substituir placeholders em CODEOWNERS
2. **Dom├¡nio do produto** ÔÇö `obra-integrada.vercel.app` ├® placeholder; se houver dom├¡nio pr├│prio, reconfigurar
3. **Provedor de Postgres** ÔÇö Neon ├ù Supabase ├ù Railway
4. **Ado├º├úo de TypeScript** ÔÇö aceitar ADR-001 ou manter JS
5. **6┬║ membro** ÔÇö se confirmar continuidade, atribuir m├│dulo (sugest├úo: Admin + IA/Integra├º├Áes a partir do M├¬s 13)

---

## Pr├│ximos passos imediatos

1. **Sess├úo de equipe** (1 hora) para ler este README e decidir a posi├º├úo sobre os ADRs
2. **Substituir placeholders** no CODEOWNERS e Se├º├úo 4.2
3. **Abrir o primeiro PR da Semana 1** (`chore: remove orphaned server.js and legacy files`) ÔÇö o mais simples da lista P0
4. **Configurar os 2 projetos Vercel** conforme Se├º├úo 4.6
5. **Adicionar `JWT_SECRET` e outras vars** em cada ambiente conforme Se├º├úo 1.5.4
6. **Ativar Rulesets de prote├º├úo** de `main` conforme Se├º├úo 4.1.3

A partir da├¡, os 59 PRs do roadmap dos Meses 1-6 (Se├º├úo 3.3) s├úo o caminho.

---

## Hist├│rico deste documento

| Vers├úo | Data | Autor | Mudan├ºa |
|---|---|---|---|
| 1.0 | 2026-04-24 | Auditoria externa (consultoria) | Cria├º├úo inicial dos 4 artefatos + templates + workflows |

Atualiza├º├Áes futuras desta auditoria devem ser feitas por **complemento** (novos documentos ou se├º├Áes novas), n├úo por reescrita ÔÇö para preservar o registro hist├│rico dos gaps que motivaram cada decis├úo.

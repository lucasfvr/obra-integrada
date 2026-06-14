# Auditoria Inicial — Obra Integrada

**Data:** 24 de abril de 2026
**Escopo:** Auditoria arquitetural completa + roadmap estratégico de 24 meses
**Público-alvo:** Equipe técnica (5-6 devs), orientador acadêmico, banca de TCC

---

## O que é isto

Este diretório contém **4 artefatos de auditoria** que formam a base de referência para o desenvolvimento do Obra Integrada nos próximos 24 meses:

| # | Artefato | Foco | Páginas estimadas |
|---|---|---|---|
| 1 | [`01-auditoria-tecnica.md`](./01-auditoria-tecnica.md) | Diagnóstico do código atual — estrutura, schema, qualidade, segurança, prontidão Vercel, débito técnico priorizado | ~18 |
| 2 | [`02-evolucao-produto.md`](./02-evolucao-produto.md) | Análise do produto — funcionalidades atuais, benchmark competitivo BR, 15 features propostas, oportunidades arquiteturais | ~14 |
| 3 | [`03-plano-refatoracao.md`](./03-plano-refatoracao.md) | 10 ADRs, plano de limpeza 2 semanas, refatoração incremental 6 meses | ~15 |
| 4 | [`04-workflow-equipe.md`](./04-workflow-equipe.md) | Branches, divisão por módulo, templates GitHub, CI/CD, integração Vercel, cronograma 24 meses | ~12 |

Complementarmente, foram criados **8 arquivos funcionais** no repositório durante esta auditoria:

- [`.github/PULL_REQUEST_TEMPLATE.md`](../../.github/PULL_REQUEST_TEMPLATE.md)
- [`.github/ISSUE_TEMPLATE/bug_report.md`](../../.github/ISSUE_TEMPLATE/bug_report.md)
- [`.github/ISSUE_TEMPLATE/feature_request.md`](../../.github/ISSUE_TEMPLATE/feature_request.md)
- [`.github/CODEOWNERS`](../../.github/CODEOWNERS)
- [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)
- [`.github/workflows/preview-comment.yml`](../../.github/workflows/preview-comment.yml)
- [`.github/workflows/prisma-check.yml`](../../.github/workflows/prisma-check.yml)
- [`CONTRIBUTING.md`](../../CONTRIBUTING.md)

---

## Síntese executiva

### Diagnóstico (Fase 1)

O Obra Integrada é **acadêmico maduro em escopo funcional** (21 entidades no schema, 10 controllers, RBAC com 8 papéis, upload de arquivos, diário com GPS), e **imaturo em disciplina de engenharia** (testes só mock, validação dispersa por regex, dependências duplicadas, 15+ arquivos órfãos, `dev.db` e cobertura commitados, JWT secret com fallback hardcoded).

**6 problemas críticos de segurança** identificados (todos P0, corrigíveis na Semana 1): JWT fallback, CORS aberto, 2 rotas admin sem RBAC, uploads efêmeros na Vercel, falta de rate limit em login.

**Débito total:** 33 itens catalogados em matriz Esforço × Impacto. Desses, 9 são P0 (~1 semana), 10 são P1 (~1 mês), 11 são P2 (~2-3 meses).

### Oportunidades de produto (Fase 2)

**2 diferenciais já presentes** que superam a média do mercado para construtoras pequenas: auditoria geográfica do diário com GPS + multi-tenancy nativo desde o schema.

**Gaps competitivos principais vs. concorrentes brasileiros** (Sienge, Vobi, Obra Prima, Mobuss):
- Sem RDO (Relatório Diário de Obra) exportável em PDF — feature básica do líder em pequenas construtoras (Obra Prima)
- Sem integração SINAPI (tabela nacional de insumos) — diferencial Vobi
- Sem Agentes de IA — diferencial único da Vobi
- Sem app mobile / PWA offline — limita uso em canteiro com conexão ruim
- 9 modelos Prisma ociosos (materiais, fabricantes, etapas) prontos para virar módulo

**15 features propostas** cobrindo: paridade de mercado (RDO PDF, cronograma físico-financeiro, materiais), diferencial mobile (PWA offline, Google Maps, previsão do tempo), diferencial IA (RDO automático por voz, estimativa via SINAPI, chatbot para trabalhadores), lock-in (BI executivo, biblioteca de plantas/BIM, segurança do trabalho NR-18).

### Plano de evolução (Fase 3)

**10 ADRs propostos** para decisões arquiteturais pendentes:
- ADR-001: TypeScript progressivo (strangler, meta 70% em 12 meses)
- ADR-002: Storage com Supabase Storage (interface trocável)
- ADR-003: Zod para validação
- ADR-004: Testing Trophy (unit + integração com testcontainers + E2E Playwright)
- ADR-005: TanStack Query no frontend
- ADR-006: shadcn/ui para componentes
- ADR-007: npm workspaces (escalar para Turborepo no Mês 12+)
- ADR-008: Sentry + Axiom
- ADR-009: GitHub Actions
- ADR-010: Ambientes dev/staging/prod com Neon (Postgres com branching)

**Refatoração incremental** em 59 PRs sequenciais dos Meses 1-6, convergindo com as primeiras features do produto.

### Workflow de equipe (Fase 4)

- **Branches:** trunk-based light, feature branches curtas, squash merge, Conventional Commits
- **Divisão por módulo de negócio, não por camada** — cada dev owner de 1-2 módulos end-to-end
- **Papéis fixos:** Tech Lead + DevOps (Dev 5). **Rotativos:** Reviewer da semana, Docs da semana, Oncall de bugs
- **CI/CD:** 3 workflows — ci.yml, preview-comment.yml, prisma-check.yml
- **Vercel:** 2 projetos no mesmo repo (web + api), previews por PR, ignored build step por pasta
- **Cronograma 24 meses:** Meses 1-2 fundação → 3-8 features principais → 9-10 consolidação → 11-18 features avançadas e IA → 19-22 polimento → 23-24 defesa

---

## Como ler estes artefatos

**Se você é:**

- **Gerente / orientador:** comece por este README; vá direto às conclusões de cada fase.
- **Tech Lead (Dev 5):** leia os 4 documentos em ordem; priorize ADRs da Fase 3 e cronograma da Fase 4.
- **Dev entrando no projeto:** comece por `CONTRIBUTING.md` na raiz; volte aqui para a Seção 1.1 (mapa do código) de `01-auditoria-tecnica.md`.
- **Product Owner:** leia `02-evolucao-produto.md` primeiro; volte para 1.1 se precisar entender o que já existe.
- **Banca acadêmica / avaliador externo:** os 4 documentos em ordem cobrem tudo.

---

## Pontos de atenção

### Placeholders a substituir antes de ativar proteções

- Em `.github/CODEOWNERS`, substituir `@dev1`...`@dev5` pelos handles reais do GitHub
- Em `docs/auditoria-inicial/04-workflow-equipe.md` Seção 4.2, alinhar nomes reais
- Em `preview-comment.yml` (Seção 4.5), confirmar nomes dos projetos Vercel reais (`obra-integrada-web`, `obra-integrada-api`) antes de ativar

### Suposições que podem ser reavaliadas pela equipe

- **Stack de Postgres** (ADR-010): escolha entre Neon, Supabase, Railway depende do custo aceitável e de decisão sobre ADR-002 (storage) — se Supabase para storage, natural usar Supabase para Postgres também.
- **ADR-001 TypeScript**: alguns membros podem preferir JS puro. Decisão final deve ser discutida em reunião antes do Mês 3.
- **Divisão por módulo vs. por camada** (Seção 4.2): requer buy-in do time. Se alguém tem aversão, discutir antes do primeiro sprint.

### Decisões que a equipe ainda precisa tomar

1. **Handles GitHub reais** — substituir placeholders em CODEOWNERS
2. **Domínio do produto** — `obra-integrada.vercel.app` é placeholder; se houver domínio próprio, reconfigurar
3. **Provedor de Postgres** — Neon × Supabase × Railway
4. **Adoção de TypeScript** — aceitar ADR-001 ou manter JS
5. **6º membro** — se confirmar continuidade, atribuir módulo (sugestão: Admin + IA/Integrações a partir do Mês 13)

---

## Próximos passos imediatos

1. **Sessão de equipe** (1 hora) para ler este README e decidir a posição sobre os ADRs
2. **Substituir placeholders** no CODEOWNERS e Seção 4.2
3. **Abrir o primeiro PR da Semana 1** (`chore: remove orphaned server.js and legacy files`) — o mais simples da lista P0
4. **Configurar os 2 projetos Vercel** conforme Seção 4.6
5. **Adicionar `JWT_SECRET` e outras vars** em cada ambiente conforme Seção 1.5.4
6. **Ativar Rulesets de proteção** de `main` conforme Seção 4.1.3

A partir daí, os 59 PRs do roadmap dos Meses 1-6 (Seção 3.3) são o caminho.

---

## Histórico deste documento

| Versão | Data | Autor | Mudança |
|---|---|---|---|
| 1.0 | 2026-04-24 | Auditoria externa (consultoria) | Criação inicial dos 4 artefatos + templates + workflows |

Atualizações futuras desta auditoria devem ser feitas por **complemento** (novos documentos ou seções novas), não por reescrita — para preservar o registro histórico dos gaps que motivaram cada decisão.

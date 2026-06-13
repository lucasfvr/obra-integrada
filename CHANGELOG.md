# Changelog — Obra Integrada

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e este projeto adota [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [Unreleased]

## [1.0.0] — 2026-06-13

### Added
- `SECURITY.md` (raiz) — política de divulgação responsável de vulnerabilidades.
- `CONTRIBUTING.md` (raiz) — guia de contribuição e padrões de código para o time.
- `backend/.env.example` — documentação das variáveis de ambiente necessárias.
- `.vercelignore` — mapeamento de arquivos excluídos do deploy.
- **Documentação de Negócios:**
  - `lean-canvas.md` — modelo enxuto de hipóteses de negócio.
  - `business-model-canvas.md` — modelo de negócios tradicional em uma página.
  - `analise-mercado.md` — análise do setor, SWOT e análise de competidores.
  - `estrutura-corporativa-saas.md` — organograma, suporte SLA e faturamento da empresa SaaS.
  - `ob_obra_integrada/00-Index/10 - Produto e Negocios/Empresa/` — diretório com os documentos organizacionais e operacionais da empresa provedora (`Organizacao e RH.md`, `Financeiro e Tributos.md`, `Padroes de Seguranca.md`, `Landing Page de Marketing.md`).
- **Documentação de Requisitos:**
  - `brd.md` (Business Requirements Document) — justificativas de negócio da solução.
  - `prd.md` (Product Requirements Document) — prioridades e mapeamento de features.
  - `srs.md` (Software Requirements Specification) — requisitos funcionais e não-funcionais (norma IEEE 29148).
  - `painel-administracao-superadmin.md` — requisitos e layouts ASCII do painel Super Admin.
- **Decisões de Arquitetura (ADRs):**
  - `ADR-001` — Uso de JWT para Autenticação.
  - `ADR-002` — Troca de storage local por Cloudflare R2/Supabase Storage.
  - `ADR-003` — Adoção do Zod para validação de schemas em TypeScript.
- **Documentação de Segurança:**
  - `threat-model.md` — modelagem de ameaças usando metodologia STRIDE.
  - `owasp-asvs.md` — checklist de conformidade técnica OWASP ASVS v4 Nível 2.
  - `nist-ssdf.md` — mapeamento de práticas seguras NIST SP 800-218.
- **Documentação de Qualidade:**
  - `plano-testes.md` — estratégia de QA (testes unitários, integração, E2E k6, Semgrep).
  - `definition-of-ready.md` (DoR) e `definition-of-done.md` (DoD).
  - `historico-atividades.md` — registro cronológico de todas as entregas do projeto.
  - `regras-desenvolvimento-equipe.md` — guia de regras de desenvolvimento e versionamento de código/documentos para a equipe.
  - `ob_obra_integrada/00-Index/90 - Sistema Obsidian/95 - Propostas de Atualizacao/` — pasta de fluxo de propostas de documentos ("Doc Branching") com template e subpasta para propostas arquivadas.
- **Documentação de DevOps:**
  - `pipeline.md` — fluxograma de deploy e YAML de GitHub Actions.
  - `rollback.md` — plano de reversão segura de código e banco de dados Neon DB.
- **Documentação de Compliance (LGPD):**
  - `lgpd.md` — guia de conformidade e bases legais para dados comuns e sensíveis (PCMSO/NR-7).
  - `politica-exclusao.md` — política de retenção e exclusão física de banco/storage.
- **Documentação de Operação (ITIL):**
  - `drp.md` (Disaster Recovery Plan) e `bcp.md` (Business Continuity Plan).
  - `gestao-riscos.md` — matriz de riscos operacionais e de negócio (ISO 31000).
  - `monitoramento.md` — observabilidade baseada em Sentry e Pino JSON.
  - `catalogo-sistemas.md` — catálogo de sistemas e inventário de componentes.
  - `problem-management.md` — processo ITIL de causa raiz (RCA) e erros conhecidos.
- **Vault Obsidian (`ob_obra_integrada`):**
  - Rascunhos legais completos: Política de Privacidade, Termos de Uso, DPA, SLA e Contrato de Licença SaaS.

### Security
- Mapeamento e correção dos prazos de resposta a incidentes para **6 dias úteis** no Plano de Resposta a Incidentes (PARI), de acordo com a **Resolução CD/ANPD nº 15/2024** e **Resolução nº 2/2022** (agentes de pequeno porte).
- Identificadas vulnerabilidades críticas de backend (CORS aberto, fallback de segredos JWT e ausência de tabela de log no schema Prisma) a serem resolvidas na Sprint 0 (P0).

### Changed
- `02 - Checklist de Conformidade.md` corrigido no cofre Obsidian para refletir o real estado de conformidade técnica da base de código (reduzido de simulated 86% para real ~31%).
- `00-GAP-ANALYSIS-SAAS-LIFECYCLE.md` atualizado para cobertura documental de 96%.


---

## [0.9.0] — 2026-06-12 (Estado atual do MVP)

### Added
- Sistema de autenticação JWT com bcrypt
- RBAC com 7 perfis: `ADMIN_MASTER`, `ADMIN`, `PROPRIETARIO`, `RESPONSAVEL`, `ESTAGIARIO`, `TRABALHADOR`, `CLIENTE`
- Multi-tenancy por `tb_cliente` e `tb_obra_cliente`
- Módulo de Obras: CRUD completo, equipe, estoque, documentos, org-chart
- Módulo de Diário de Obra: foto, GPS, status de auditoria
- Módulo de Tarefas: CRUD, atribuição múltipla, percentual de conclusão
- Módulo de RH: CRUD de funcionários, matrícula automática `MAT-AAAA-NNN`
- Módulo Financeiro (por obra): receitas, despesas, comprovantes
- Dashboard dinâmico adaptado por perfil de usuário
- Painel admin: métricas globais, impersonação de usuários
- Frontend React 19 + Vite 7 + Tailwind CSS 4
- Deploy serverless na Vercel

### Known Issues
- `authMiddleware.js` aceita fallback `SUPER_SECRET` quando `JWT_SECRET` não está configurado
- CORS totalmente aberto (`cors()` sem allowlist)
- Sem Helmet, CSP ou rate limiting
- Tabela `tb_log_auditoria` referenciada no código mas não existe no schema Prisma
- CPF/CNPJ armazenados em texto plano (sem criptografia AES-256)
- Lint do frontend falha (42 erros, 8 warnings)
- Testes são mocks — sem testes de integração reais

---

## [0.8.0] — 2026-04-15

### Added
- Primeira migration de banco (`20260415002034_advanced_features`)
- Seed com dados realistas: 1 construtora, 100 funcionários, 15 obras
- Sistema de upload de arquivos com Multer
- Módulo de documentos por obra
- Módulo de estoque por obra com histórico de movimentações

---

## [0.1.0] — 2024 (Início do TCC)

### Added
- Estrutura inicial do monorepo
- Protótipo com JSON mock (pré-Prisma)
- Login e cadastro básico

---

[Unreleased]: https://github.com/lucasfvr/obra-integrada/compare/v0.9.0...HEAD
[0.9.0]: https://github.com/lucasfvr/obra-integrada/compare/v0.8.0...v0.9.0
[0.8.0]: https://github.com/lucasfvr/obra-integrada/compare/v0.1.0...v0.8.0
[0.1.0]: https://github.com/lucasfvr/obra-integrada/releases/tag/v0.1.0

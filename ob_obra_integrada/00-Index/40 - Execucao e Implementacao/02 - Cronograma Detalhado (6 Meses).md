---
tags: [cronograma, timeline, schedule, gantt]
---
# 📅 Cronograma Detalhado (6 Meses) - Obra Integrada

Timeline semana a semana de junho a novembro de 2026.

---

## 📊 Linha do Tempo Geral

```
JUNHO 2026:   ████████████ (Semanas 1-4)    SETUP + Início CORE
JULHO 2026:   ████████████████████████████ (Semanas 5-9)    CORE
AGOSTO 2026:  ████████████████████████████ (Semanas 10-13) CORE + POLISH
SETEMBRO 2026:████████████████████████████ (Semanas 14-18) POLISH + Piloto
OUTUBRO 2026: ██████████████ (Semanas 19-22)               GO-LIVE Prep
NOVEMBRO 2026:████████ (Semanas 23-26)                     LAUNCH
```

---

## 🔵 FASE 1: SETUP & INFRAESTRUTURA (Semanas 1-3)

### Semana 1 (11-15 de junho)

**Tema**: Kick-off do Projeto

```
Segunda (11/06)
├─ 09:00 Kick-off Meeting (todos os stakeholders)
│  └─ Apresentar roadmap
│  └─ Definir expectativas
│  └─ Q&A
│
├─ 14:00 Setup de Ambiente Dev (equipe backend)
│  └─ Git repository setup
│  └─ Docker compose local
│  └─ VS Code extensions
│
└─ 16:00 Purchase AWS resources (DevOps)
   └─ VPC, Subnets, Security Groups
   └─ RDS PostgreSQL staging
   └─ ECR, S3, IAM roles

Terça (12/06)
├─ 10:00 Node.js project scaffolding
│  └─ Express.js boilerplate
│  └─ TypeScript setup
│  └─ Jest config
│
├─ 14:00 Database local setup
│  └─ PostgreSQL em Docker
│  └─ PgAdmin UI
│  └─ Script de seed
│
└─ 16:00 Frontend setup (equipe web)
   └─ React boilerplate
   └─ Redux store
   └─ Material-UI components

Quarta (13/06)
├─ 10:00 GitHub Actions setup
│  └─ Lint + Format pipeline
│  └─ Unit tests trigger
│  └─ Build Docker automation
│
├─ 14:00 Security baseline
│  └─ .env encryption
│  └─ JWT setup
│  └─ HTTPS everywhere
│
└─ 16:00 Documentation structure
   └─ API docs template (Swagger)
   └─ Setup.md para dev onboarding
   └─ Architecture.md

Quinta (14/06)
├─ 10:00 Mobile setup (equipe react-native)
│  └─ Expo project
│  └─ Navigation structure
│  └─ API client setup
│
├─ 14:00 Monitoring setup
│  └─ Prometheus exporters
│  └─ Grafana dashboards
│  └─ Error tracking (Sentry)
│
└─ 16:00 Sprint Planning #1
   └─ Distribuir tasks
   └─ Estimar story points
   └─ Definir sprint goals

Sexta (15/06)
├─ 10:00 All Systems Check ✓
│  └─ Todos conseguem rodar código
│  └─ CI/CD pipeline funciona
│  └─ DB local conectada
│
├─ 14:00 Sprint Retrospective #0
│  └─ Feedback do setup
│  └─ Identificar bloqueadores
│  └─ Melhorias para próximas semanas
│
└─ 16:00 First Sprint Starts! 🚀
```

**Entregas Esperadas:**
- ✅ Dev environment rodando em 100% da equipe
- ✅ First endpoint dummy respondendo
- ✅ CI/CD pipeline automático
- ✅ Banco de dados local sincronizado

---

### Semana 2 (18-22 de junho)

**Tema**: Infraestrutura + Auth Foundation

```
Seg-Sex
├─ DevOps
│  ├─ AWS setup staging completo
│  ├─ Load balancer + auto-scaling
│  ├─ RDS backup automated
│  └─ CloudWatch alarms
│
├─ Backend
│  ├─ Auth controller (login, signup)
│  ├─ JWT token generation
│  ├─ Password hashing (bcrypt)
│  ├─ 2FA TOTP setup
│  ├─ Middleware de autenticação
│  └─ Unit tests (40+ testes)
│
├─ Database
│  ├─ Tabelas base (USUARIO, TENANT, PAPEL)
│  ├─ Índices iniciais
│  ├─ Constraints FK
│  └─ Seed data para testes
│
├─ Frontend
│  ├─ Login page (wireframe → código)
│  ├─ Form validation
│  ├─ Redux auth reducer
│  ├─ API integration
│  └─ Jest tests
│
└─ Mobile
   ├─ Login screen layout
   ├─ API client setup
   ├─ Token storage (SecureStore)
   └─ Navigation structure

Entregas:
✅ POST /auth/signup (criar conta)
✅ POST /auth/login (autenticar)
✅ GET /auth/verify (validar token)
✅ POST /auth/2fa/verify (TOTP)
✅ Login screen 100% funcional
✅ 80+ testes com cobertura
```

---

### Semana 3 (25-29 de junho)

**Tema**: Primeiro Release (v0.1.0 Alpha)

```
Seg-Sex
├─ Backend
│  ├─ User profile endpoint (GET /users/me)
│  ├─ Tenant endpoints (GET /tenants/:id)
│  ├─ RBAC middleware (verificar permissões)
│  ├─ Error handling standardizado
│  └─ 50+ novos testes
│
├─ Database
│  ├─ Tabelas OBRA e ORDEM_SERVICO
│  ├─ Tabelas APONTAMENTO base
│  ├─ Triggers de auditoria (AUDIT_LOG)
│  └─ Views iniciais
│
├─ Frontend
│  ├─ Dashboard layout skeleton
│  ├─ Navigation menu
│  ├─ User profile page
│  ├─ Settings page
│  └─ Responsive design (mobile)
│
├─ Mobile
│  ├─ Tab navigation bottom
│  ├─ Profile screen
│  ├─ Settings screen
│  └─ Logout functionality
│
├─ DevOps
│  ├─ Primeiro deploy para staging
│  ├─ Blue-green setup
│  ├─ Database migration automation
│  └─ Smoke tests
│
└─ QA
   ├─ Manual testing da auth
   ├─ Security scanning
   ├─ Performance baseline
   └─ Bug report template

Entregas:
✅ v0.1.0-alpha released
✅ Deploy automático para staging
✅ ~100 testes rodam
✅ Documentação técnica v0.1
✅ Equipe 100% onboarded
```

---

## 🟡 FASE 2: CORE & MVP (Semanas 4-12)

### Semana 4-5 (02-13 de julho) - Sprint 2-3

**Tema**: Core APIs de Negócio

```
APIS A IMPLEMENTAR:
├─ POST /obras (criar obra)
├─ GET /obras (listar obras)
├─ GET /obras/:id (detalhes)
├─ PATCH /obras/:id (editar)
├─ GET /obras/:id/progresso (cálculo)
│
├─ POST /apontamentos (criar)
├─ PATCH /apontamentos/:id/validar
├─ PATCH /apontamentos/:id/aprovar
├─ GET /apontamentos (listar por obra)
│
└─ GET /usuarios (listar equipe)
   POST /usuarios (adicionar)
   PATCH /usuarios/:id/role (trocar papel)

FRONTEND:
├─ Dashboard básico (widget cards)
├─ Obras list page
├─ Criar obra wizard (4 steps)
├─ Apontamentos list
├─ Fazer apontamento form

DATABASE:
├─ Tabela VALIDACAO
├─ Tabelas de MATERIAL_*
├─ Table FATURA schema
└─ Performance indexes

TESTES:
├─ 200+ unit tests
├─ 50+ integration tests
├─ E2E flow crítico
└─ Load test baseline (100 reqs/sec)
```

---

### Semana 6-7 (16-27 de julho) - Sprint 4-5

**Tema**: Dashboard + Relatórios

```
FRONTEND:
├─ Dashboard v1 (Admin):
│  ├─ KPIs cards (faturamento, progresso, equipe)
│  ├─ Chart: progresso obras (line chart)
│  ├─ Chart: faturamento (pie chart)
│  ├─ Alertas (toasts)
│  └─ Real-time updates (WebSocket)
│
├─ Dashboard v2 (Gerente):
│  ├─ Minhas obras (cards)
│  ├─ Progresso vs planejado
│  ├─ Material em falta
│  ├─ Equipe hoje (presença)
│  └─ Apontamentos validar
│
├─ Relatório Executivo:
│  ├─ PDF export (ReportLab)
│  ├─ Excel export (SheetJS)
│  ├─ Filtros (data range, obra, operacional)
│  └─ Scheduler (envio automático)
│
└─ Performance otimizações:
   ├─ Code splitting (React lazy)
   ├─ Image optimization
   ├─ CSS minification
   └─ 50%+ reduction no bundle

BACKEND:
├─ Endpoints relatório:
│  ├─ GET /relatorios/executivo
│  ├─ GET /relatorios/financeiro
│  ├─ GET /relatorios/operacional
│  └─ POST /relatorios/export
│
├─ Caching:
│  ├─ Redis para queries pesadas
│  ├─ Cache invalidation strategy
│  └─ 70%+ hit rate target
│
└─ Query otimizações:
   ├─ N+1 queries fixes
   ├─ Índices compostos
   └─ EXPLAIN ANALYZE reviews

DATABASE:
├─ Views para relatórios
├─ Materialized views (refresh nightly)
└─ Archive partition strategy

TESTES: 300+ testes
```

---

### Semana 8-9 (30 de julho - 10 de agosto) - Sprint 6-7

**Tema**: Funcionalidades Críticas - Apontamentos

```
APONTAMENTO FLUXO COMPLETO:
├─ Operacional:
│  ├─ Tela: "Fazer apontamento"
│  ├─ Captura: hora entrada/saída
│  ├─ Captura: GPS (2 pontos)
│  ├─ Captura: fotos (entrada + saída)
│  ├─ Validações: overlap detection
│  ├─ Salva como RASCUNHO local
│  └─ Envio com confirmação biométrica
│
├─ Supervisor:
│  ├─ Tela: "Validar apontamentos"
│  ├─ Visualiza: fotos, GPS, horas
│  ├─ Ação: APROVAR ou REJEITAR
│  ├─ Se rejeitar: motivo obrigatório
│  ├─ Notificação para operacional
│  └─ Se overlap: validação adicional
│
├─ Gerente:
│  ├─ Tela: "Aprovar apontamentos"
│  ├─ Revisão final (cost check)
│  ├─ Ação: FATURAR ou PENDENTE
│  └─ Calcula custo MO automaticamente
│
├─ Backend:
│  ├─ POST /apontamentos (criar)
│  ├─ GET /apontamentos/:id (detalhe)
│  ├─ PATCH /apontamentos/:id/validar
│  ├─ PATCH /apontamentos/:id/aprovar
│  ├─ Validação overlap (query complexa)
│  ├─ Cálculo custo (trigger PL/pgSQL)
│  ├─ Notificações (Bull queue)
│  └─ ~100 testes
│
├─ Mobile:
│  ├─ Tela completa apontamento
│  ├─ Cronômetro integrado
│  ├─ Captura foto (camera API)
│  ├─ GPS (geolocation)
│  ├─ Offline storage (AsyncStorage)
│  ├─ Sincronização ao conectar
│  └─ ~50 testes Detox
│
├─ Web:
│  ├─ Tela validação (supervisor)
│  ├─ Tela aprovação (gerente)
│  ├─ Bulk validation actions
│  ├─ Filter/sort avançado
│  └─ ~50 testes Cypress
│
└─ DATABASE:
   ├─ Otimizações de índices
   ├─ Trigger de atualização progresso
   ├─ View de apontamentos pendentes
   └─ Archive strategy (cleanup antigos)

TESTES TOTAIS: 200+ testes
```

---

### Semana 10-11 (13-24 de agosto) - Sprint 8-9

**Tema**: Gestão de Materiais + Financeiro

```
MATERIAL FLUXO:
├─ Catálogo:
│  ├─ GET /materiais (listar catálogo)
│  ├─ POST /materiais (novo material)
│  ├─ PATCH /materiais/:id (editar)
│  └─ ~50 testes
│
├─ Pedidos:
│  ├─ POST /material-pedidos (solicitar)
│  ├─ GET /material-pedidos (histórico)
│  ├─ PATCH /material-pedidos/:id/receber
│  └─ ~50 testes
│
├─ Consumo:
│  ├─ POST /material-consumo (registrar uso)
│  ├─ GET /material-consumo (listar)
│  └─ ~30 testes
│
└─ Frontend:
   ├─ Tela catalogo (admin)
   ├─ Tela criar pedido (gerente)
   ├─ Tela receber material (supervisor)
   └─ Tela consumo (operacional mobile)

FINANCEIRO FLUXO:
├─ Backend:
│  ├─ POST /faturas (gerar)
│  ├─ GET /faturas (listar)
│  ├─ PATCH /faturas/:id (editar)
│  ├─ POST /faturas/:id/enviar
│  ├─ Cálculo margem (trigger)
│  └─ ~80 testes
│
├─ Frontend:
│  ├─ Tela faturamento (admin)
│  ├─ Preview fatura (PDF)
│  ├─ Envio para cliente
│  ├─ Histórico de faturas
│  └─ ~40 testes
│
└─ Relatório financeiro:
   ├─ Margem por obra
   ├─ Margem por período
   ├─ Previsão vs real
   └─ Dashboard KPI

DATABASE:
├─ Tabelas finalizadas (todas 14)
├─ Todas as views
├─ Triggers finalizados
└─ Performance benchmarks

TESTES TOTAIS: 250+ testes
```

---

### Semana 12 (27-31 de agosto) - Sprint 9

**Tema**: MVP Fechado + Testes Intensivos

```
CHECKLIST MVP:
├─ ✅ Autenticação + RBAC
├─ ✅ Obras (CRUD completo)
├─ ✅ Apontamentos (fluxo 3 níveis)
├─ ✅ Materiais (pedido + consumo)
├─ ✅ Financeiro (faturamento)
├─ ✅ Relatórios básicos
├─ ✅ Dashboard (4 versões)
├─ ✅ 80%+ cobertura testes
└─ ✅ Performance baseline

TESTES INTENSIVOS:
├─ Unit: 600+ testes (Jest)
├─ Integration: 100+ testes (Supertest)
├─ E2E: 20+ fluxos críticos (Cypress)
├─ Load: 10k+ reqs/sec (Autocannon)
├─ Security: OWASP ZAP scan
└─ Accessibility: WCAG AA compliance

BUGS:
├─ Bug bash (full team)
├─ Triage P0/P1/P2/P3
├─ Fixes + re-test
└─ Target: <5 críticos

DOCUMENTATION:
├─ API docs (Swagger)
├─ Architecture docs
├─ Setup.md atualizado
├─ Decision records (ADR)
└─ Runbook operacional

RELEASE:
├─ v0.5.0-beta tagged
├─ Deploy staging
├─ Final smoke tests
└─ ✓ Ready for Phase 3
```

---

## 🟢 FASE 3: POLISH & SCALE (Semanas 13-20)

### Semana 13-14 (03-14 de setembro) - Sprint 10-11

**Tema**: Mobile App v1 + Performance

```
MOBILE APP (React Native):
├─ Auth screens ✓ (from Phase 2)
├─ Dashboard (operacional)
├─ Tarefas do dia (list)
├─ Fazer apontamento (completo)
│  ├─ Cronômetro
│  ├─ Foto captura
│  ├─ GPS tracking
│  └─ Offline support
├─ Validar apontamento (supervisor)
├─ Perfil + settings
├─ Notificações push
├─ ~100+ testes (Detox)
└─ 60% do MVP no mobile

PERFORMANCE OPTIMIZATION:
├─ Backend:
│  ├─ Query optimization (explain analyze)
│  ├─ Lazy loading relationships
│  ├─ Pagination (limit/offset)
│  ├─ Caching strategy (Redis)
│  └─ -60% latência target
│
├─ Database:
│  ├─ Index tuning
│  ├─ Query plan analysis
│  ├─ Connection pooling (PgBouncer)
│  ├─ Archive old data
│  └─ Vacuum + analyze
│
├─ Frontend:
│  ├─ Code splitting
│  ├─ Lazy route loading
│  ├─ Image optimization (WebP)
│  ├─ CSS minification
│  └─ Bundle analysis
│
├─ Infra:
│  ├─ CDN for statics
│  ├─ Database read replicas
│  ├─ Message queue optimization
│  └─ Load test OK
│
└─ Benchmarks:
   ├─ API p95: < 200ms
   ├─ Frontend: < 2s load
   ├─ Mobile: < 3s startup
   └─ DB: < 50ms queries

ENTREGAS: v0.5.0 + Performance -60%
```

---

### Semana 15-17 (17 de set - 01 de outubro) - Sprint 12-14

**Tema**: Clientes Piloto + Feedback

```
ONBOARDING CLIENTES PILOTO:
├─ Cliente #1: Construtora Grande (RJ)
├─ Cliente #2: Construtora Média (SP)
├─ Cliente #3: Construtora Pequena (MG)

TRAINING:
├─ Admin: 2h training + docs
├─ Gerentes: 2h training
├─ Supervisores: 1h training
├─ Operacionais: 1h training

LIVE SUPPORT:
├─ Chat 24/7 (CS team)
├─ Daily standup com cliente
├─ Bug fix SLA: 4h críticos
├─ Weekly retrospective

FEEDBACK COLLECTION:
├─ User interviews (5 por cliente)
├─ Usage analytics
├─ Feature requests (Jira)
├─ Bug reports (triage)

MONITORING:
├─ Error rate < 0.1%
├─ Uptime > 99%
├─ Page speed < 2s
├─ API latency < 200ms

IMPROVEMENTS:
├─ Implement feedback (top 5)
├─ Performance tuning
├─ UX improvements
├─ Documentation updates

ENTREGAS: 3 clientes piloto happy + feedback
```

---

### Semana 18-20 (04-22 de outubro) - Sprint 15

**Tema**: Final Polish + Documentação

```
CODE QUALITY:
├─ SonarQube: > 80% coverage
├─ Lint: 0 errors
├─ Security scan: 0 vulnerabilities
├─ Performance: -60% vs baseline
└─ Accessibility: WCAG AA

TESTING:
├─ Unit: 700+ testes
├─ Integration: 150+ testes
├─ E2E: 30+ fluxos
├─ Load: 10k req/s OK
├─ Security: Pen test OK

DOCUMENTATION:
├─ API docs (100% coverage)
├─ User manuals (por perfil)
├─ Video tutorials (5x)
├─ FAQ database
├─ Troubleshooting guide
├─ Operations runbook

RELEASE:
├─ v1.0.0-rc1 released
├─ Deploy staging final
├─ Final QA pass
├─ Stakeholder approval ✓

ENTREGAS: v1.0.0-rc1 + Full docs
```

---

## 🔴 FASE 4: GO-LIVE (Semanas 21-26)

### Semana 21-22 (25 de outubro - 05 de novembro) - Sprint 16

**Tema**: Produção Setup + Migration

```
INFRASTRUCTURE:
├─ Produção environment setup
├─ RDS multi-AZ (failover)
├─ Load balancer + auto-scaling
├─ Backup + disaster recovery
├─ Monitoring + alerting
└─ ✓ SLA ready

DATA MIGRATION:
├─ Data validation
├─ Test migration (staging)
├─ Rollback procedures
├─ Run production migration
│  ├─ Downtime: 2-4 horas (planning)
│  ├─ Validation checks
│  ├─ Performance verification
│  └─ Rollback ready
└─ ✓ Data integrity OK

SUPPORT TEAM:
├─ Training completo
├─ On-call schedule
├─ Escalation procedures
├─ Runbook + playbooks
├─ Ticket system ready
└─ ✓ Ready for day 1

SECURITY AUDIT:
├─ Final pen test
├─ LGPD compliance check
├─ Data encryption verify
├─ Access control verify
└─ ✓ Security OK

RELEASE v1.0.0:
├─ Tag on Git
├─ Release notes
├─ Changelog complete
└─ ✓ Ready for launch
```

---

### Semana 23-24 (08-19 de novembro)

**Tema**: Customer Launch

```
WEEK 1 - SOFT LAUNCH:
├─ Launch com 5 clientes piloto + 5 novos
├─ Daily monitoring
├─ Chat support 24/7
├─ Incident response team
├─ Collect feedback

MONITORING 24/7:
├─ Error rate < 0.1%
├─ Uptime > 99.5%
├─ API latency < 200ms
├─ DB health OK
└─ Auto-alert on issues

ISSUES:
├─ P0 (crítico): Fix em < 1h
├─ P1 (alto): Fix em < 4h
├─ P2 (médio): Fix em < 1 dia
├─ P3 (baixo): Fix em < 1 semana
└─ All bugs triaged

CUSTOMERS:
├─ Training reforço
├─ Daily standup
├─ Feedback meetings
├─ Feature requests coleta
└─ NPS survey (target: > 40)

MARKETING:
├─ Press release
├─ Social media posts
├─ Customer stories
├─ Blog post
└─ Webinar de launch
```

---

### Semana 25-26 (22-30 de novembro)

**Tema**: Estabilização + Sucesso

```
STABILIZATION:
├─ Continue 24/7 monitoring
├─ Fix remaining bugs
├─ Performance fine-tuning
├─ Customer support excellence
└─ SLA compliance: 99%+

EXPANSION:
├─ Launch para next cohort (10 clientes)
├─ Onboarding processes refined
├─ Customer success plan
├─ Expansion roadmap
└─ Roadmap 2027

CELEBRATION:
├─ Team retrospective
├─ Celebrate success! 🎉
├─ Document learnings
├─ Plan Phase 2 (features)
└─ Next quarter planning

METRICS TARGET:
├─ Clientes ativos: 20+
├─ Obras criadas: 50+
├─ Apontamentos: 5k+
├─ Uptime: 99%+
├─ NPS: > 50
└─ Margem: > 50% (SaaS)
```

---

## 📊 Resumo por Mês

| Mês | Fase | Sprints | Entregas | Status |
|-----|------|---------|----------|--------|
| **Junho** | Setup | 1-3 | Dev environment, v0.1.0-alpha | ✅ |
| **Julho** | Core | 4-6 | Apontamentos, relatórios, v0.2.0 | 🏗️ |
| **Agosto** | Core | 7-9 | Financeiro, materiais, v0.5.0-beta | 🏗️ |
| **Setembro** | Polish | 10-14 | Mobile, performance, v1.0.0-rc1 | ⏳ |
| **Outubro** | Go-Live | 15-17 | Prod setup, migration, v1.0.0 | ⏳ |
| **Novembro** | Launch | 18-20 | Live! 20+ clientes, expanding | 🚀 |

---

## 🎯 Crítico Path (Dependências Chave)

```
Dia 0: Start
  ├─ Setup Dev Env → Semana 1 ✓
  ├─ Auth (backend) → Semana 2
  │  └─ Frontend Auth → Semana 2
  │     └─ RBAC middleware → Semana 3
  │        └─ Core APIs → Semana 4+
  │
  ├─ Database schema → Semana 2-3
  │  └─ Migrations automation → Semana 3
  │     └─ Performance tuning → Semana 10+
  │
  ├─ MVP Funcionalidades → Semana 4-12
  │  └─ Testing (80%+) → Semana 9-11
  │     └─ Code review + QA → Semana 12
  │
  ├─ Mobile app → Semana 13
  │  └─ Mobile + Web parity → Semana 14
  │
  ├─ Clientes piloto → Semana 15
  │  └─ Feedback + Improvements → Semana 16-18
  │
  ├─ Prod infrastructure → Semana 19
  │  └─ Data migration test → Semana 19
  │     └─ Live migration → Semana 20
  │
  └─ Go-live → Semana 21
     └─ Customer launch → Semana 23+
```

---

**Próximo**: [03 - Etapas e Fases de Implementação](03%20-%20Etapas%20e%20Fases%20de%20Implementacao.md)

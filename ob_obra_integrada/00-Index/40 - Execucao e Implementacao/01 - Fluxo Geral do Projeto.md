---
tags: [fluxo, processo, workflow, arquitetura]
---
# 🔄 Fluxo Geral do Projeto - Obra Integrada

Visualização do fluxo completo de execução do projeto.

---

## 📊 Fluxo de Desenvolvimento (High Level)

```
┌──────────────────────────────────────────────────────────────────────┐
│                    OBRA INTEGRADA - FLUXO GERAL                      │
└──────────────────────────────────────────────────────────────────────┘

┌─────────────────────┐
│  FASE 1: SETUP      │
│  (3 Semanas)        │
│                     │
│ • Dev Environment   │
│ • Infra AWS         │
│ • CI/CD             │
│ • Security Baseline │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│  FASE 2: CORE (MVP)                     │
│  (9 Semanas)                            │
│                                         │
│ • Backend APIs (25+ endpoints)          │
│ • Database (14 tabelas)                 │
│ • Frontend Web (15+ telas)              │
│ • Autenticação + RBAC                   │
│ • Testes (80%+ coverage)                │
│                                         │
│ Marcos:                                 │
│ ✓ Sprint 1-2: Setup concluído           │
│ ✓ Sprint 3-4: APIs básicas              │
│ ✓ Sprint 5-6: Dashboard web             │
│ ✓ Sprint 7-8: Apontamentos + Materiais  │
│ ✓ Sprint 9: Testes + Otimizações        │
└──────────┬──────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│  FASE 3: POLISH & SCALE                 │
│  (8 Semanas)                            │
│                                         │
│ • Mobile App (React Native)             │
│ • Performance Tuning                    │
│ • Load Testing                          │
│ • Clientes Piloto                       │
│ • Documentação Completa                 │
│                                         │
│ Marcos:                                 │
│ ✓ Sprint 10: Mobile v1                  │
│ ✓ Sprint 11: Performance (-60%)          │
│ ✓ Sprint 12-13: Testes de carga         │
│ ✓ Sprint 14-15: Onboarding + Feedback   │
└──────────┬──────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│  FASE 4: GO-LIVE                        │
│  (6 Semanas)                            │
│                                         │
│ • Produção Setup                        │
│ • Data Migration                        │
│ • Suporte 24/7                          │
│ • Launch Marketing                      │
│ • Post-Launch Monitoring                │
│                                         │
│ Marcos:                                 │
│ ✓ Sprint 16: Prod Ready                 │
│ ✓ Sprint 17-18: Customer Launch         │
│ ✓ Sprint 19-20: Estabilização           │
└─────────────────────────────────────────┘
```

---

## 🔀 Fluxo de Desenvolvimento (Sprint)

```
┌─────────────────────────────────────────────────────────┐
│             CICLO DE 2 SEMANAS (1 SPRINT)              │
└─────────────────────────────────────────────────────────┘

DAY 1 (Segunda)
├─ 10:00 - Sprint Planning (2h)
│  └─ Selecionar stories de backlog
│  └─ Estimar story points
│  └─ Distribuir entre devs
│
├─ 14:00 - Tech Sync (30 min)
│  └─ Discutir arquitetura
│  └─ Resolver bloqueadores
│
└─ 16:00 - Desenvolvimento inicia

DAYS 2-9 (Terça a Sexta + Segunda a Quinta)
├─ 09:00 - Daily Standup (15 min)
│  └─ O que fiz?
│  └─ O que vou fazer?
│  └─ Bloqueadores?
│
├─ 10:00-17:00 - Desenvolvimento
│  ├─ Code (4-5 horas)
│  ├─ Testing (2-3 horas)
│  ├─ Code Review (1-2 horas)
│  └─ Deployment staging (30 min)
│
└─ 17:00 - Final commit

DAY 10 (Sexta)
├─ 10:00 - Sprint Review (1h)
│  └─ Demo funcionalidades
│  └─ Feedback de stakeholders
│
├─ 11:00 - Retrospectiva (1h)
│  └─ O que foi bem?
│  └─ O que melhorar?
│  └─ Ações para próximo sprint
│
└─ 12:00 - End of Sprint
   └─ Merge to staging
   └─ Deploy to QA
```

---

## 🛠️ Fluxo de Feature Development

```
┌─────────────────────────────────────────────────────────┐
│          CICLO DE DESENVOLVIMENTO DE UMA FEATURE       │
└─────────────────────────────────────────────────────────┘

1. PLANEJAMENTO
   ├─ Ler descrição da story
   ├─ Revisar wireframes
   ├─ Listar dados necessários
   └─ Estimar complexidade

2. DESIGN
   ├─ Desenhar fluxo de dados
   ├─ Definir estrutura de BD
   ├─ Escrever testes (TDD)
   └─ Criar branch: feature/JIRA-123-descricao

3. BACKEND
   ├─ Implementar controller
   ├─ Implementar service
   ├─ Implementar repository
   ├─ Adicionar validações
   ├─ Rodar testes locais
   ├─ Commit + Push
   └─ Criar PR (Pull Request)

4. CODE REVIEW #1
   ├─ Backend Lead revisa
   ├─ Sugestões/aprovação
   └─ Correções se necessário

5. FRONTEND
   ├─ Implementar componentes React
   ├─ Integrar com API
   ├─ Aplicar validações
   ├─ Testes com Jest
   ├─ Commit + Push
   └─ Criar PR

6. CODE REVIEW #2
   ├─ Frontend Lead revisa
   ├─ QA testa fluxo
   └─ Aprovação

7. TESTING
   ├─ QA manual
   ├─ E2E (Cypress)
   ├─ Performance (Lighthouse)
   ├─ Segurança (OWASP)
   └─ Relatório de bugs

8. FIXES
   ├─ Dev corrige bugs encontrados
   ├─ Novo CI/CD run
   └─ Approval final

9. MERGE & DEPLOY
   ├─ Merge para main branch
   ├─ Auto-deploy para staging
   ├─ Testes de smoke rodam
   └─ OK para prod

10. PRODUÇÃO
    ├─ Merge para release branch
    ├─ Blue-green deployment
    ├─ Monitoring 24/7
    └─ Feedback from users
```

---

## 📦 Fluxo de Deployment

```
┌─────────────────────────────────────────────────────────┐
│            CICLO DE DEPLOYMENT (CI/CD)                 │
└─────────────────────────────────────────────────────────┘

DESENVOLVIMENTO LOCAL
├─ Dev escreve código
├─ Roda testes locais
├─ Commit + Push
└─ Cria Pull Request

      ↓

GITHUB CI/CD TRIGGERED
├─ Lint + Format (2 min)
│  └─ ESLint, Prettier
│
├─ Unit Tests (5 min)
│  └─ Jest 80%+ coverage
│
├─ Build Docker (3 min)
│  └─ docker build
│  └─ docker push registry
│
└─ Deploy to Staging (2 min)
   └─ Kubernetes apply
   └─ Health check

      ↓

STAGING ENVIRONMENT
├─ Integration Tests (10 min)
│  └─ Supertest
│
├─ E2E Tests (15 min)
│  └─ Cypress
│
├─ Security Scan (5 min)
│  └─ OWASP ZAP
│
├─ Performance Test (10 min)
│  └─ Autocannon
│
└─ All Green? ✓
   └─ Ready for Production

      ↓

PRODUCTION (Blue-Green)
├─ Health Check (1 min)
│
├─ Run Smoke Tests (5 min)
│
├─ Monitor (5 min)
│  └─ CPU < 60%?
│  └─ Memory < 70%?
│  └─ Error rate < 0.1%?
│
└─ Rollback if needed
   └─ Switch back to Green
```

---

## 💾 Fluxo de Database Migration

```
┌─────────────────────────────────────────────────────────┐
│         CICLO DE DATABASE MIGRATION                    │
└─────────────────────────────────────────────────────────┘

1. DEVELOPER
   └─ Escreve migration file
      └─ migrations/001_criar_tabela_usuario.sql

2. LOCAL
   └─ Roda migration no banco local
   └─ Testa queries
   └─ Testa rollback

3. STAGING
   └─ Roda migration automaticamente
   └─ Valida integridade
   └─ Testa performance

4. BACKUP
   └─ Backup automático de production
   └─ Armazenado em S3
   └─ Retenção: 30 dias

5. PRODUCTION
   └─ Schedule migration
   └─ Backup pré-migration
   └─ Run migration (zero-downtime)
   └─ Verifica integridade
   └─ Monitora performance

6. ROLLBACK (se necessário)
   └─ Restore from backup
   └─ Revert migration
   └─ Notificar suporte
```

---

## 🧪 Fluxo de Testes (Test Pyramid)

```
                    ▲
                   ╱ ╲
                  ╱   ╲ E2E Tests (Cypress)
                 ╱     ╲ 10% - 50 testes
                ╱───────╲
               ╱         ╲
              ╱           ╲ Integration Tests
             ╱             ╲ (Supertest)
            ╱               ╲ 30% - 300 testes
           ╱─────────────────╲
          ╱                   ╲
         ╱                     ╲ Unit Tests
        ╱                       ╲ (Jest)
       ╱_________________________╲ 60% - 600 testes
```

**Estratégia:**
- **Unit Tests** (Jest): Cada function, validation, util
- **Integration Tests** (Supertest): Cada endpoint com database
- **E2E Tests** (Cypress): Fluxos críticos do usuário
- **Performance** (Autocannon): Load testing, JMeter
- **Security** (OWASP ZAP): Scanning automático

---

## 📤 Fluxo de Release

```
┌─────────────────────────────────────────────────────────┐
│            CICLO DE RELEASE (SemVer)                   │
└─────────────────────────────────────────────────────────┘

VERSÃO: X.Y.Z (ex: 1.2.3)
├─ X = Major (breaking changes)
├─ Y = Minor (new features)
└─ Z = Patch (bugfixes)

DESENVOLVIMENTO
├─ Sprint 1-3: v0.1.0 (Alpha)
├─ Sprint 4-9: v0.5.0 (Beta)
├─ Sprint 10-15: v1.0.0-rc1 (Release Candidate)
└─ Sprint 16+: v1.0.0 (Production)

PROCESSO DE RELEASE
├─ Code Freeze (Sprint final)
├─ Tag version no Git
├─ Build docker image
├─ Release notes (CHANGELOG)
├─ Deploy staging
├─ Final validation
├─ Deploy production
├─ Announce release
└─ Monitor 48h

HOTFIX (emergências)
├─ Branch: hotfix/v1.0.1
├─ Fix + test
├─ Quick review
├─ Deploy production
├─ Tag v1.0.1
└─ Merge back para main
```

---

## 📊 Fluxo de Dados (Exemplo: Criar Apontamento)

```
┌──────────────────────────────────────────────────────┐
│  Operacional no Canteiro Faz Apontamento            │
└──────────────────────────────────────────────────────┘

MOBILE APP (React Native)
├─ User input: hora entrada, saída, fotos
├─ Validação local (horas > 0, etc)
├─ Captura GPS + timestamp
└─ POST /api/apontamentos

      ↓

BACKEND (Node.js Express)
├─ Autenticação middleware
│  └─ Verifica JWT token
│  └─ Obtém user_id + tenant_id
│
├─ Validação (Controller)
│  └─ Valida schema
│  └─ Valida regras negócio
│
├─ Lógica (Service)
│  └─ Calcula horas
│  └─ Calcula custo
│  └─ Verifica sobreposição
│
├─ Persistência (Repository)
│  └─ INSERT em APONTAMENTO
│  └─ UPDATE OBRA (progresso)
│  └─ INSERT AUDIT_LOG
│
└─ Response 201 Created

      ↓

ASYNC JOBS (Bull Queue)
├─ Job: "enviar-notificacao"
│  └─ Notifica supervisor
│
└─ Job: "calcular-custo-obra"
   └─ Atualiza margem

      ↓

SUPERVISOR VALIDA
├─ Recebe notificação
├─ Abre mobile app
├─ Review apontamento
├─ Vê GPS + fotos
├─ PATCH /api/apontamentos/:id/validar

      ↓

BANCO ATUALIZA
├─ status = VALIDADO
├─ validado_por = supervisor_id
├─ validado_em = NOW()
└─ Trigger: atualiza progresso

      ↓

GERENTE APROVA
├─ Recebe notificação
├─ Revisa no web
├─ PATCH /api/apontamentos/:id/aprovar

      ↓

BANCO FINALIZA
├─ status = APROVADO
├─ aprovado_por = gerente_id
├─ custo_mao_obra = calculado
├─ Trigger: marca para faturamento
└─ Notifica operacional: ✓ Aprovado!

      ↓

FATURAMENTO
├─ Nightly job: busca apontamentos APROVADO
├─ Agrupa por obra + período
├─ Gera FATURA
├─ Insere ITEM_FATURA
└─ Envia para cliente
```

---

**Próximo**: [02 - Cronograma Detalhado](02%20-%20Cronograma%20Detalhado%20%286%20Meses%29.md)

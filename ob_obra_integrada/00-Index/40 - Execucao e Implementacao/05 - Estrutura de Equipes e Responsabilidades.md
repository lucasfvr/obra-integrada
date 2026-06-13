---
tags: [equipes, raci, responsabilidades, papeis]
---
# 👥 Estrutura de Equipes e Responsabilidades

Organização das equipes e matriz RACI.

---

## 🏢 Estrutura Organizacional

```
                    ┌─── CTO ───┐
                    │             │
        ┌───────────┼───────────┬─┘
        │           │           │
        ▼           ▼           ▼
   Project      Tech Lead   DevOps Lead
   Manager       (Backend)
        │           │           │
    ┌───┴────┐  ┌────┴─────┐  ┌───┴──┐
    │         │  │          │  │      │
    ▼         ▼  ▼          ▼  ▼      ▼
   Product  CS Backend Frontend Mobile DevOps
   Owner    Lead Devs (3) Devs (2) Dev   (1)
    │       │    │        │       │     │
    └───────┴────┴────────┴───────┴─────┘
           Core Team (12 pessoas)
           
        + QA (1)
        + Designer (1) - Part-time
        + Contractor (1) - Infra
```

---

## 👤 Perfis e Responsabilidades

### 1. CTO (Chief Technology Officer)
**Tipo**: Full-time | **Dedicação**: 100%

**Responsabilidades:**
- ✅ Visão técnica geral do projeto
- ✅ Decisões arquiteturais
- ✅ Code review de decisões críticas
- ✅ Performance requirements
- ✅ Security & compliance
- ✅ Escalation de problemas críticos

**Qualificações:**
- 10+ anos desenvolvimento
- 5+ anos liderança técnica
- Experiência SaaS
- Conhecimento de DevOps

**Horário**: Segunda-Sexta 09:00-17:00 + On-call (segunda noite)

---

### 2. Project Manager (PM)
**Tipo**: Full-time | **Dedicação**: 100%

**Responsabilidades:**
- ✅ Planning & scheduling
- ✅ Comunicação stakeholders
- ✅ Risk management
- ✅ Change management
- ✅ Status reporting
- ✅ Sprint ceremonies

**Qualificações:**
- Certificado Scrum Master (CSM)
- 5+ anos project management
- Experiência SaaS/Agile
- Comunicação excelente

**Horário**: Segunda-Sexta 09:00-17:00

---

### 3. Product Owner (PO)
**Tipo**: Part-time | **Dedicação**: 50%

**Responsabilidades:**
- ✅ Backlog prioritization
- ✅ Requirements clarification
- ✅ Stakeholder requirements
- ✅ Feature definition
- ✅ UAT coordination
- ✅ Release planning

**Qualificações:**
- 5+ anos product management
- Conhecimento construção (domínio)
- Experiência SaaS

**Horário**: Segunda-Quarta 09:00-17:00 + meetings

---

### 4. Tech Lead (Backend)
**Tipo**: Full-time | **Dedicação**: 100%

**Responsabilidades:**
- ✅ Backend architecture
- ✅ API design
- ✅ Code review (backend)
- ✅ Pair programming (mentoring)
- ✅ Tech decisions (dentro escopo)
- ✅ Performance tuning

**Qualificações:**
- 8+ anos backend development
- 3+ anos Node.js/Express
- Experência com RBAC/Multi-tenant
- SQL otimização

**Horário**: Segunda-Sexta 09:00-17:00 + On-call (terça noite)

---

### 5-7. Backend Developers (3)
**Tipo**: Full-time | **Dedicação**: 100% cada

**Responsabilidades:**
- ✅ Implementar endpoints
- ✅ Unit testing
- ✅ Database queries
- ✅ Integration testing
- ✅ Bugfixing
- ✅ Code review de peers

**Nível:**
- Dev #1: Senior (8+ anos)
- Dev #2: Mid (5-7 anos)
- Dev #3: Junior (2-4 anos)

**Tech Stack**: Node.js, Express, PostgreSQL, Redis, Jest, TypeScript

---

### 8-9. Frontend Developers (2)
**Tipo**: Full-time | **Dedicação**: 100% cada

**Responsabilidades:**
- ✅ React component development
- ✅ Redux state management
- ✅ Responsive design
- ✅ Unit testing (Jest)
- ✅ E2E testing (Cypress)
- ✅ Performance optimization
- ✅ Accessibility (WCAG)

**Nível:**
- Dev #1: Senior (8+ anos)
- Dev #2: Mid (5-7 anos)

**Tech Stack**: React 18, Redux, Material-UI, Jest, Cypress, TypeScript

---

### 10. Mobile Developer (1)
**Tipo**: Full-time | **Dedicação**: 100%

**Responsabilidades:**
- ✅ React Native development
- ✅ Native module integration
- ✅ Offline-first architecture
- ✅ Push notifications
- ✅ App store deployment
- ✅ Detox testing

**Nível**: Senior (8+ anos mobile)

**Tech Stack**: React Native, Expo, Detox, Firebase, AsyncStorage

---

### 11. DevOps Engineer (1)
**Tipo**: Full-time | **Dedicação**: 100%

**Responsabilidades:**
- ✅ AWS infrastructure
- ✅ CI/CD pipeline
- ✅ Monitoring & alerting
- ✅ Backup & disaster recovery
- ✅ Database performance
- ✅ Security hardening

**Qualificações:**
- 5+ anos DevOps
- AWS certified
- Kubernetes/Docker
- IaC (Terraform/CloudFormation)
- PostgreSQL administration

**Horário**: Segunda-Sexta 09:00-17:00 + On-call (quarta noite)

---

### 12. QA Engineer (1)
**Tipo**: Full-time | **Dedicação**: 100%

**Responsabilidades:**
- ✅ Test strategy
- ✅ Manual testing
- ✅ Test automation (Cypress)
- ✅ Bug triage
- ✅ Performance testing (Autocannon)
- ✅ Security scanning (OWASP ZAP)
- ✅ Accessibility testing

**Qualificações:**
- 5+ anos QA
- Teste manual + automação
- OWASP knowledge
- Cypress/Selenium

---

### 13. Customer Success Lead (1)
**Tipo**: Full-time | **Dedicação**: 100%

**Responsabilidades:**
- ✅ Onboarding clientes piloto
- ✅ Training & documentation
- ✅ Support Tier 1
- ✅ Customer feedback
- ✅ Escalation to dev team
- ✅ Release communication

**Qualificações:**
- 5+ anos customer success
- Comunicação excelente
- Conhecimento técnico básico
- Empatia com usuários

---

### Plus: Contractor/Consultant (as needed)

**Security Specialist**: Pen testing, LGPD compliance
- 2 semanas (semana 5 + semana 18)
- Remote

**Designer**: UI/UX refinement
- 20 horas/semana
- Remote

---

## 🎯 RACI Matrix

```
ATIVIDADE/DECISÃO | CTO | PM | PO | TL | BE | FE | MO | DevOps | QA | CS

ARQUITETURA:
├─ System design | R,A | C | C | R | C | C | C | C | C | -
├─ API design | C | I | C | R,A | R | R | - | - | - | -
├─ Database design | C | I | - | R,A | R | - | - | C | - | -
├─ Security | R,A | I | - | C | C | C | C | C | R | -
└─ DevOps/Infra | C | I | - | C | - | - | - | R,A | - | -

DESENVOLVIMENTO:
├─ Feature implementation | - | - | - | - | R,A | R,A | R,A | - | - | -
├─ Code review | C | - | - | R,A | R | R | R | - | - | -
├─ Unit testing | - | - | - | C | R,A | R,A | R,A | - | - | -
├─ Integration testing | - | - | - | C | R,A | R,A | R,A | - | R | -
└─ Deployment | - | - | - | - | - | - | - | R,A | C | -

QUALIDADE:
├─ Test strategy | C | - | - | C | C | C | C | - | R,A | -
├─ Performance testing | C | - | - | C | C | C | C | C | R,A | -
├─ Security testing | R,A | - | - | C | C | C | C | C | R,A | -
└─ Bug triage | - | - | - | C | R | R | R | - | R,A | -

PLANEJAMENTO:
├─ Sprint planning | C | R,A | R | I | I | I | I | I | I | I
├─ Backlog prioritization | - | C | R,A | I | - | - | - | - | I | I
├─ Release planning | R,A | R,A | R | I | - | - | - | I | I | I
└─ Roadmap | R | C | R,A | I | - | - | - | - | - | -

COMUNICAÇÃO:
├─ Stakeholder updates | C | R,A | I | - | - | - | - | - | - | -
├─ Escalation/Issues | R | I | I | I | - | - | - | - | - | -
├─ Customer feedback | - | I | R | - | - | - | - | - | I | R,A
└─ Treinamento clientes | - | - | I | - | - | - | - | - | - | R,A

LEGENDA:
R = Responsible (faz o trabalho)
A = Accountable (aprova/toma decisão final)
C = Consulted (consultado, opinião importante)
I = Informed (informado dos resultados)
- = Não envolvido
```

---

## 📅 Cronograma de Equipe

### Semana 1-3: SETUP
```
EQUIPE MÍNIMA:
├─ CTO: 100%
├─ PM: 100%
├─ Tech Lead: 100%
├─ Backend Dev (1): 100%
├─ Frontend Dev (1): 100%
└─ DevOps: 100%
TOTAL: 6 pessoas

ATIVIDADES:
├─ Setup dev env
├─ Infra AWS
├─ CI/CD pipeline
└─ Arquitetura decisions
```

---

### Semana 4-9: CORE DEVELOPMENT
```
EQUIPE COMPLETA:
├─ CTO: 50% (disponível para decisions)
├─ PM: 100%
├─ PO: 50%
├─ Tech Lead: 100%
├─ Backend Devs: 3 × 100%
├─ Frontend Devs: 2 × 100%
├─ DevOps: 100%
├─ QA: 100%
└─ CS Lead: 50%
TOTAL: 11 pessoas

ATIVIDADES:
├─ Feature development (sprints)
├─ Testing
├─ Code review
├─ Performance optimization
└─ Documentation
```

---

### Semana 10-14: POLISH & MOBILE
```
EQUIPE + MOBILE:
├─ CTO: 50%
├─ PM: 100%
├─ PO: 50%
├─ Tech Lead: 100%
├─ Backend Devs: 2 × 100% (1 shifts to support)
├─ Frontend Dev: 1 × 100%
├─ Mobile Dev: 100% (join)
├─ DevOps: 100%
├─ QA: 100%
├─ CS Lead: 100%
└─ Designer: 20h/week (hired)
TOTAL: 12 pessoas

ATIVIDADES:
├─ Mobile app development
├─ Performance optimization
├─ Clientes piloto onboarding
├─ Documentation
└─ Bug fixes
```

---

### Semana 15-20: PILOTS & STABILITY
```
MESMO TIME:
├─ Dedicação aumenta para suporte 24/7
├─ Backend dev #2 em support tier 2
├─ QA intensivo (bug bash semana 12)
├─ Performance tuning
└─ Documentação final

ADICIONAL:
├─ Consultant Security (2 semanas)
├─ Contractor DevOps (escalation)
└─ Mais 1 CS (tier 1 chat)
```

---

### Semana 21-26: GO-LIVE
```
SUPORTE 24/7:
├─ On-call rotation (3 devs + 1 ops)
├─ First responders (CS team)
├─ Escalation chain pronto
├─ Post-launch monitoring
└─ Customer success

HIRING:
├─ 2 CSs adicionais
├─ 1 Support agent
└─ Possível 2º backend dev (scaling)
```

---

## 💰 Budget (Indicativo)

### Salários (6 meses)

| Role | Sênioridade | Mês | 6 Meses |
|------|------------|------|---------|
| CTO | Exec | R$ 15k | R$ 90k |
| Project Manager | Mid | R$ 10k | R$ 60k |
| Product Owner | Mid | R$ 10k | R$ 30k |
| Tech Lead | Senior | R$ 12k | R$ 72k |
| Backend Dev #1 | Senior | R$ 10k | R$ 60k |
| Backend Dev #2 | Mid | R$ 8k | R$ 48k |
| Backend Dev #3 | Junior | R$ 6k | R$ 36k |
| Frontend Dev #1 | Senior | R$ 10k | R$ 60k |
| Frontend Dev #2 | Mid | R$ 8k | R$ 48k |
| Mobile Dev | Senior | R$ 10k | R$ 60k |
| DevOps | Senior | R$ 12k | R$ 72k |
| QA | Mid | R$ 7k | R$ 42k |
| CS Lead | Mid | R$ 8k | R$ 48k |
| **TOTAL FOLHA** | | **R$ 126k** | **R$ 726k** |

### Infraestrutura & Outros

| Item | Custo |
|------|--------|
| AWS (dev + staging + prod) | R$ 15k |
| Tools (Jira, Figma, etc) | R$ 5k |
| Consultoria (security, DevOps) | R$ 20k |
| **TOTAL** | **R$ 40k** |

### **ORÇAMENTO TOTAL: ~R$ 766k** (6 meses)

---

## 🤝 Comunicação Interna

### Daily Standup
**Quando**: 09:30 (15 min)
**Quem**: Todo time
**O quê**: 
- O que fiz ontem
- O que vou fazer hoje
- Bloqueadores

### Tech Sync
**Quando**: Terça 14:00 (30 min)
**Quem**: CTO, Tech Lead, Backend Lead, DevOps
**O quê**: Decisões arquiteturais

### Sprint Planning
**Quando**: Segunda 10:00 (2h)
**Quem**: PM, PO, Tech Lead, Desenvolvedores
**O quê**: Selecionar stories, estimar

### Sprint Review
**Quando**: Sexta 10:00 (1h)
**Quem**: PM, PO, Tech Lead, Stakeholders
**O quê**: Demo, feedback

### Sprint Retrospective
**Quando**: Sexta 11:00 (1h)
**Quem**: Todo time
**O quê**: O que melhorar

### Escalação
**Canais**: 
1. Slack #escalation (primeiro)
2. Ping no CTO (se P0)
3. Call/video se crítico

---

**Próximo**: [06 - Checklist de Implementação](06%20-%20Checklist%20de%20Implementacao.md)

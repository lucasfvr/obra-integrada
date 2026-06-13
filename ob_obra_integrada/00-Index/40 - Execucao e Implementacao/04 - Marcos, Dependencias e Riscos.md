---
tags: [marcos, dependencias, riscos, mitigacao]
---
# 🏁 Marcos, Dependências e Riscos

Identificação de critical path, bloqueadores e estratégias de mitigação.

---

## 🎯 Marcos Críticos (Milestones)

### M1: Dev Environment Ready ✓
**Data**: Semana 1 (15 de junho)
**Critério**: 100% equipe consegue rodar código localmente
```
├─ Dev env running ✓
├─ CI/CD pipeline ✓
├─ Database local ✓
└─ First deploy to staging ✓
```
**Impact**: Se não atingir → atraso de 1+ semana em tudo

---

### M2: Autenticação Funcional
**Data**: Semana 2 (22 de junho)
**Critério**: Login + 2FA + RBAC funcionando
```
├─ JWT generation ✓
├─ 2FA TOTP ✓
├─ Permission middleware ✓
├─ Frontend login page ✓
└─ 80+ testes ✓
```
**Impact**: Bloqueia todo resto do projeto

---

### M3: MVP Funcional
**Data**: Semana 12 (31 de agosto)
**Critério**: Todas as features principais implementadas
```
├─ 25+ endpoints ✓
├─ Web dashboard ✓
├─ Apontamentos completo ✓
├─ Financeiro ✓
├─ 80%+ cobertura testes ✓
└─ Performance baseline ✓
```
**Impact**: Go/no-go para clientes piloto

---

### M4: Mobile App v1
**Data**: Semana 14 (14 de setembro)
**Critério**: App no App Store/Play Store
```
├─ React Native buildable ✓
├─ Apontamento funcional ✓
├─ Offline support ✓
├─ Push notifications ✓
└─ 100+ testes ✓
```
**Impact**: Não usar em canteiro sem mobile

---

### M5: SLA 99% Atingido
**Data**: Semana 20 (22 de outubro)
**Critério**: 30 dias uptime > 99%
```
├─ Performance -60% ✓
├─ Caching otimizado ✓
├─ Load test OK ✓
├─ Monitoring alerting ✓
└─ Autoscaling tested ✓
```
**Impact**: Requisito para produção

---

### M6: Produção Ready
**Data**: Semana 21 (29 de outubro)
**Critério**: Ambiente produção pronto para launch
```
├─ Infra AWS prod ✓
├─ Backup + DR tested ✓
├─ Security audit passed ✓
├─ Runbook completed ✓
└─ Support team trained ✓
```
**Impact**: Go/no-go para launch

---

### M7: Go-Live ✅
**Data**: Semana 23 (08 de novembro)
**Critério**: Primeiros clientes live
```
├─ 10 clientes onboarded ✓
├─ 24/7 support active ✓
├─ Monitoring OK ✓
├─ Incident response OK ✓
└─ NPS > 40 ✓
```
**Impact**: Sucesso do projeto

---

## 🔗 Dependências Críticas

### D1: Infraestrutura AWS
**Bloqueado por**: AWS account approval
**Bloqueia**: Staging deployment, CI/CD
**Risco**: ALTO (lead time: 1 semana)
**Mitigação**: 
- Solicitar conta na semana anterior
- Usar template IaC pré-configurado
- Fallback: Deploy local em VPS

---

### D2: Autenticação Funcional
**Bloqueado por**: Design + implementação backend
**Bloqueia**: Todos os outros endpoints, frontend
**Risco**: MÉDIO (1 semana de trabalho)
**Mitigação**:
- Mock JWT para frontend dev em paralelo
- TDD (testes primeiro)
- 2 devs em pair programming

---

### D3: Database Schema
**Bloqueado por**: Finalização de especificação
**Bloqueia**: Backend development
**Risco**: BAIXO (já finalizado na doc)
**Mitigação**:
- Schema já pronto (RN-000 + 30-Esquema.md)
- Migration scripts prontos
- Version control de migrations

---

### D4: API Specification
**Bloqueado por**: Product team
**Bloqueia**: Frontend development
**Risco**: MÉDIO (pode mudar)
**Mitigação**:
- Spec lock na semana 3
- Design meetings semana 1-2
- Mock API para frontend paralelo

---

### D5: Design/Wireframes
**Bloqueado por**: Design team
**Bloqueia**: Frontend development
**Risco**: MÉDIO (iterações de feedback)
**Mitigação**:
- Wireframes já prontos (50-Especificação.md)
- Design system + component lib
- Prototype com Figma + React Storybook

---

### D6: Performance Optimization
**Bloqueado por**: Índices + caching
**Bloqueia**: Launch
**Risco**: ALTO (atraso comum)
**Mitigação**:
- Índices desde início (não adicionar depois)
- Redis cache desde sprint 1
- JMeter tests semana 2
- Performance budget: < 200ms p95

---

### D7: Clientes Piloto Disponíveis
**Bloqueado por**: Sales/CS
**Bloqueia**: Fase 3
**Risco**: MÉDIO (pode não querer participar)
**Mitigação**:
- Contatar clientes semana 1
- Oferecer desconto (50% first 3 months)
- SLA claro: suporte 24/7 durante piloto

---

### D8: Suporte 24/7 Team
**Bloqueado por**: Hiring + training
**Bloqueia**: Go-live
**Risco**: ALTO (pode não ter people)
**Mitigação**:
- Iniciar hiring semana 1
- Outsourcer initial support
- On-call rotation com dev team

---

## ⚠️ Riscos e Mitigação

### R1: Bugs em RBAC (Segurança)
**Probabilidade**: ALTA | **Impacto**: CRÍTICO
**Descrição**: Acesso indevido a dados de outros tenants
**Mitigação**:
- 100% cobertura de testes de segurança (semana 2-3)
- Penetration test com especialista (semana 5)
- Code review 2 devs para todo RBAC (semana 2)
- Row-level security (RLS) PostgreSQL
- Audit log de todos os acessos

---

### R2: Performance Degradação
**Probabilidade**: MÉDIA | **Impacto**: ALTO
**Descrição**: Queries lentas com 10k+ apontamentos
**Mitigação**:
- Índices desde início (não depois)
- Load test semana 2 (1k req/sec)
- Redis caching semana 3
- Database replication semana 10
- Query optimization contínua

---

### R3: Delay na Infraestrutura AWS
**Probabilidade**: BAIXA | **Impacto**: CRÍTICO
**Descrição**: AWS approval demora > 1 semana
**Mitigação**:
- Solicitar na semana anterior
- Usar IaC template (Terraform)
- Fallback: Deploy em VPS DigitalOcean
- Backup: GCP como alternativa

---

### R4: Mudanças nos Requisitos
**Probabilidade**: ALTA | **Impacto**: MÉDIO
**Descrição**: Cliente muda ideia no meio
**Mitigação**:
- Requirements freeze semana 3
- Change request process formal
- Extra time buffer (20% contingency)
- MVP scope escopo bem definido

---

### R5: Falta de DevOps na Equipe
**Probabilidade**: BAIXA | **Impacto**: CRÍTICO
**Descrição**: Ninguém sabe fazer deploy/monitoring
**Mitigação**:
- Contratar DevOps semana 1 (ou consultor)
- Infrastructure as Code (Terraform)
- Documentação de operações
- Runbook automático

---

### R6: Bugs Críticos Pré-Launch
**Probabilidade**: MÉDIA | **Impacto**: CRÍTICO
**Descrição**: P0 bug aparece semana antes do launch
**Mitigação**:
- Bug bash semana 12
- Staging environment idêntico a prod
- Smoke tests pós-deploy
- 1 week pre-launch freeze (apenas bugs)

---

### R7: Clientes Piloto Não Engajarem
**Probabilidade**: BAIXA | **Impacto**: ALTO
**Descrição**: Pilotos não usam sistema/não dão feedback
**Mitigação**:
- Clientes bem selecionados (referências)
- Incentivo financeiro (50% desconto)
- Daily standup com cliente
- Dedicated account manager
- Prêmio para cliente com melhor feedback

---

### R8: Suporte Insuficiente no Launch
**Probabilidade**: MÉDIA | **Impacto**: ALTO
**Descrição**: Não tem pessoas suficientes 24/7
**Mitigação**:
- Hiring semana 1 (2 CSs + 1 escalation dev)
- Outsourcer chat inicial (Zendesk)
- On-call dev rotation
- Auto-recovery playbooks (não chama support)

---

## 📊 Risk Matrix

```
         IMPACTO
         ▲
CRÍTICO  │ R3(AWS) R1(RBAC) R5(DevOps)
    ALTO │ R2(Perf) R6(Bugs) R8(Support)
  MÉDIO  │ R4(Reqs) R7(Pilot)
   BAIXO │
         └──────────────────────────────
           BAIXA  MÉD  ALTA  CRÍTICA
           PROBABILIDADE
```

**Ação**: Focar em R1, R3, R5, R2, R6

---

## 🔄 Change Management

### Change Request Process

```
1. REQUEST
   └─ Descrever mudança
   └─ Justificar impacto
   └─ Estimar esforço (hours)

2. REVIEW
   └─ Product lead revisa
   └─ Tech lead revisa
   └─ Decide: Aceitar/Rejeitar/Adiar

3. SCHEDULING
   └─ Se aceitar: quando executar?
   └─ Impacto em outros sprints?
   └─ Buffer de tempo?

4. EXECUTION
   └─ Implementar
   └─ Testar
   └─ Deploy

5. CLOSE
   └─ Documentar aprendizados
   └─ Update roadmap
```

---

## 🚨 Escalation Path

```
OPERACIONAL ISSUE
  ├─ Developer notificado (Slack)
  │  └─ Investigar em < 15 min
  │  └─ Se P0: chamar lead
  │
├─ TECHNICAL LEAD
  │  └─ Decidir: Hot-fix ou esperar?
  │  └─ Se hot-fix: code review + test
  │  └─ Deploy to production
  │
└─ PROJECT MANAGER
   └─ Se não resolvido em 1h
   └─ Escalar para CTO
   └─ Comunicar stakeholders
```

---

## 📈 Success Metrics

| Métrica | Target | Fase |
|---------|--------|------|
| Team velocity | 40 story points/sprint | Sprint 1+ |
| Bug escape rate | < 2 bugs per release | Sprint 6+ |
| Test coverage | > 80% | Sprint 9 |
| Performance p95 | < 200ms | Sprint 11 |
| Uptime (staging) | > 95% | Sprint 5+ |
| Uptime (prod) | > 99% | Post-launch |
| Customer NPS | > 40 | Post-launch |
| SLA compliance | > 99% | Post-launch |

---

**Próximo**: [05 - Estrutura de Equipes](05%20-%20Estrutura%20de%20Equipes%20e%20Responsabilidades.md)

---
tags: [ci-cd, devops, deploy, pipeline, github-actions, jenkins]
aliases: [Deployment Pipeline, Continuous Integration]
---
# 🚀 Índice - Pipelines de Deploy (CI-CD)

Documentação de pipelines de integração contínua e deployment contínuo.

## Fluxo de Desenvolvimento

### Branches Strategy
- main: Production ready
- staging: Pre-production
- develop: Development
- feature/*: Feature branches
- hotfix/*: Emergency fixes

### Git Workflow
- Feature branches são criadas do develop
- Pull requests para code review
- Merge para staging após aprovação
- Deploy automático para staging
- Manual promotion para production

## 🔄 Pipeline CI

### Trigger
- Push em feature branch
- Pull request opened
- On schedule (nightly builds)

### Etapas

#### 1. Build
- Checkout código
- Install dependencies
- Compile / Bundle
- Run tests (unit)

#### 2. Test
- Unit tests
- Integration tests
- Code coverage (>80%)
- Lint / Code quality

#### 3. Security Scan
- SAST (Static Application Security Testing)
- Dependency scanning
- Secret scanning
- DAST (Dynamic Application Security Testing)

#### 4. Artifact Build
- Docker image build
- Image push to registry
- Version tagging

## 🚀 Pipeline CD

### Automated Deploy to Staging
- Triggered após sucesso do CI
- Deploy da feature branch
- Run smoke tests
- Notify team

### Manual Deploy to Production
- Approval required
- Blue-green deployment
- Canary deployment (opcional)
- Health checks
- Rollback plan

### Deployment Stages

#### Pré-Deploy
- Database backup
- Health check
- Permission validation
- Environment preparation

#### Deploy
- Pull latest image
- Stop old containers
- Start new containers
- Run migrations

#### Pós-Deploy
- Health checks
- Smoke tests
- Performance validation
- Monitoring enable

#### Rollback
- Revert to previous version
- Database rollback
- Cache invalidation
- Notify stakeholders

## 🛠️ Ferramentas

### CI/CD Platform
- GitHub Actions / Jenkins / GitLab CI / CircleCI

### Containerization
- Docker
- Docker Compose
- Docker Registry / ECR / ACR

### Orchestration
- Kubernetes / ECS / App Service

### Configuration Management
- Environment variables
- Secrets management (Vault / Secrets Manager)
- ConfigMaps

### Monitoring
- Deployment tracking
- Release metrics
- Incident tracking

## 📋 Práticas

### Code Review
- Peer review obrigatório
- Aprovação de 2 pessoas para production
- Checklists de review

### Testing
- Test coverage mínimo
- Automated testing required
- Manual testing para features críticas

### Documentation
- Changelog automático
- Release notes
- Deploy runbook
- Rollback procedure

### Notifications
- Slack/Teams integration
- Email notifications
- PagerDuty for incidents

## 📊 Métricas

### DORA Metrics
- Deployment frequency
- Lead time for changes
- Mean time to recovery (MTTR)
- Change failure rate

### Pipeline Metrics
- Build duration
- Test coverage
- Success rate
- Artifact size

## 🔗 Referências Relacionadas
- [[61 - Arquitetura de Nuvem]]
- [[63 - Logs e Monitoramento de Performance]]

---
**Status:** 🔄 Em desenvolvimento
**Última atualização:** 11 de junho de 2026

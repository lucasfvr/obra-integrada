---
tags: [story, sprint, devops, docker, ci-cd, github-actions]
epic: [EPIC-001]
points: 5
status: To Do
---
# US-004 - Configurar Ferramentas de DevOps Locais e CI

## User Story
As a **desenvolvedor ou engenheiro de DevOps**
I want to **ter um ambiente de desenvolvimento local isolado com Docker e uma pipeline de CI configurada**
So that **eu possa rodar a aplicação localmente de forma idêntica à produção e validar as alterações de forma automatizada a cada PR**

## Acceptance Criteria
- [ ] Criar o arquivo `docker-compose.yml` na raiz do repositório para orquestrar os serviços de banco de dados (PostgreSQL), backend e frontend.
- [ ] Criar a pipeline de CI em `.github/workflows/ci.yml` para executar testes e linting no backend e frontend automaticamente em cada Pull Request e push na `main`.

## Definition of Done
- [ ] Docker compose operacional localmente
- [ ] Pipeline do GitHub Actions descrita e válida

## Relacionadas
- [[47 - Mapa de Documentos Reais da Plataforma]]
- [[70 - Setup Agil e Workflow da Equipe]]

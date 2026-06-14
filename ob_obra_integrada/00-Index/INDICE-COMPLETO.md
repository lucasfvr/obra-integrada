---
tags: [index, indice, navegacao, referencia, mapa]
aliases: [Navigation, Index, Quick Reference]
---
# 📑 ÍNDICE COMPLETO - DOCUMENTAÇÃO OBRA INTEGRADA

Mapa de navegação e referência rápida para toda documentação do sistema.

---

## 🗂️ ESTRUTURA DE DOCUMENTAÇÃO

### **TIER 1: Fundação (Conceitos e Estrutura)**

| Documento | Localização | Descrição | Status |
|-----------|------------|-----------|--------|
| **Mapa de Perfis (MOC)** | Raiz | Mapa mental de papéis e responsabilidades | ✅ |
| **Nível SaaS** | Raiz | Estrutura da plataforma | ✅ |
| **Nível Administrativo** | Raiz | Gestão de construtoras (tenants) | ✅ |
| **Nível Operacional** | Raiz | Operações de canteiro | ✅ |
| **Regras de Negócio** | `RN-000` | 10 seções com 150+ regras detalhadas | ✅ |

---

### **TIER 2: Produto e Negócios**

#### **Planejamento de Negócio e MVP**
```
📁 10 - Produto e Negocios/
├─ Definicao de Funcionalidades do MVP.md (NOVO)
├─ Lean Canvas.md
├─ Business Model Canvas.md
└─ Analise de Mercado.md
```

#### **Dicionários e MOCs**
```
📁 10 - Produto e Negocios/11 - Dicionarios e MOCs/
├─ 00 - Index - Dicionarios e MOCs.md
│  ├─ Glossário (50+ termos)
│  ├─ MOCs de Conceitos
│  └─ Mapa de Dependências
```

#### **Regras de Negócio** ⭐ DETALHADO
```
📁 10 - Produto e Negocios/12 - Regras de Negocio/
├─ 00 - Index - Regras de Negocio.md
├─ RN-000 - Regras de Negocio Consolidadas.md (10 seções)
│  ├─ 1. Estrutura Organizacional
│  ├─ 2. Ciclos de Vida (Obra/OS/Apontamento)
│  ├─ 3. RBAC - 7 Papéis
│  ├─ 4. Regras de Apontamento
│  ├─ 5. Gestão de Materiais
│  ├─ 6. Regras Financeiras
│  ├─ 7. Setup de Obra
│  ├─ 8. Controle de Progresso
│  ├─ 9. KPIs por Nível
│  └─ 10. Validações de Dados
├─ RN-001.md → RN-005.md (regras específicas)
```

#### **Perfis de Usuário** ⭐ DETALHADO
```
📁 10 - Produto e Negocios/13 - Perfis de Usuario/
├─ 00 - Index - Perfis de Usuario.md
├─ Perfis Governanca e Controle de Acesso.md (NOVO)
│  ├─ Estrutura de 2 Níveis
│  ├─ 7 Papéis Detalhados
│  ├─ Matriz de Permissões (7×11)
│  ├─ Field-Level ACL
│  ├─ Regras de Segurança
│  └─ Isolamento Multi-Tenant
├─ SA-SUPER-ADMIN.md
├─ AD-ADMIN-CONSTRUTORA.md
├─ GE-GERENTE-OBRA.md
├─ SU-SUPERVISOR.md
└─ OP-OPERACIONAL.md
```

#### **Métricas de Sucesso (KPIs)**
```
📁 10 - Produto e Negocios/14 - Metricas de Sucesso/
├─ 00 - Index - KPIs.md
├─ KPI-001.md → Nível Executivo
├─ KPI-002.md → Nível Tático
└─ KPI-003.md → Nível Operacional
```

#### **Estrutura Corporativa & Administração**
```
📁 ob_obra_integrada/00-Index/10 - Produto e Negocios/Empresa/
├─ 00 - Index - Empresa.md (Índice de diretrizes corporativas)
├─ Estrutura Corporativa SaaS.md (Modelo operacional, faturamento e CS)
├─ Organizacao e RH.md (Estrutura organizacional, RH e matriz RACI)
├─ Financeiro e Tributos.md (Tributação, planos SaaS e gateway de faturamento)
├─ Padroes de Seguranca.md (Regras de senhas, BYOD e confidencialidade)
└─ Landing Page de Marketing.md (Especificação do site institucional de vendas)
```

#### **Requisitos do Sistema**
```
📁 ob_obra_integrada/00-Index/20 - Documentacao e Tecnologias/Requisitos/
├─ BRD.md (Business Requirements Document)
├─ PRD.md (Product Requirements Document)
├─ SRS.md (Software Requirements Specification)
└─ Painel Admin (Super Admin).md (Requisitos e telas do Super Admin)
```


---

### **TIER 3: Documentação e Tecnologias**

#### **Identidade Visual**
```
📁 ob_obra_integrada/00-Index/20 - Documentacao e Tecnologias/21 - Identidade Visual e Componentes (Figma)/
├─ 00 - Index - Identidade Visual.md
├─ Design System
└─ Componentes Figma
```

#### **Wireframes e Fluxos** ⭐ DETALHADO
```
📁 ob_obra_integrada/00-Index/20 - Documentacao e Tecnologias/22 - Wireframes e Fluxos de Navegação/
├─ 00 - Index - Wireframes.md
├─ Especificacao Completa de Telas.md (NOVO)
│  ├─ Arquitetura de Navegação
│  ├─ Telas de Autenticação
│  ├─ Dashboards (4 versões)
│  ├─ Telas de Gestão (CRUD)
│  ├─ Telas de Relatórios
│  ├─ Telas de Configuração
│  └─ Layouts em ASCII art
├─ WF-LOGIN.md
├─ WF-DASHBOARD-ADMIN.md
├─ WF-DASHBOARD-GERENTE.md
├─ WF-DASHBOARD-OPERACIONAL.md
├─ WF-OBRAS-CRUD.md
├─ WF-APONTAMENTOS.md
├─ WF-MATERIAIS.md
├─ WF-RELATORIOS.md
└─ WF-CONFIGURACOES.md
```

#### **Pesquisa com Usuários**
```
📁 ob_obra_integrada/00-Index/20 - Documentacao e Tecnologias/23 - Pesquisa com Usuários (Construtoras)/
├─ 00 - Index - Pesquisa.md
├─ Personas
├─ User Stories
└─ Feedback
```

#### **Documentação da Banca**
```
📁 ob_obra_integrada/00-Index/20 - Documentacao e Tecnologias/24 - Documentacao da Banca/
└─ RELATORIO_TECNICO.md (Desenvolvimento e arquitetura do TCC)
```

#### **Auditoria Inicial**
```
📁 ob_obra_integrada/00-Index/20 - Documentacao e Tecnologias/Auditoria Inicial/
├─ README.md (Introdução à auditoria de abril/2026)
├─ 01-auditoria-tecnica.md (Diagnóstico do código atual)
├─ 02-evolucao-produto.md (Análise competitiva do produto)
├─ 03-plano-refatoracao.md (ADRs e cronograma de refatoração)
└─ 04-workflow-equipe.md (Configurações de CI/CD e equipe)
```

---

### **TIER 4: Banco de Dados e Modelagem** ⭐ DETALHADO

#### **Diagrama Entidade-Relacionamento**
```
📁 30 - Banco de Dados/31 - DER/
├─ 00 - Index - DER.md
├─ Esquema Completo do Banco de Dados.md (NOVO)
│  ├─ DER Completo (Mermaid)
│  ├─ 14 Tabelas Detalhadas com SQL
│  │  ├─ TENANT
│  │  ├─ USUARIO
│  │  ├─ PAPEL
│  │  ├─ PERMISSAO_PAPEL
│  │  ├─ OBRA
│  │  ├─ ORDEM_SERVICO
│  │  ├─ TAREFA
│  │  ├─ APONTAMENTO
│  │  ├─ VALIDACAO
│  │  ├─ MATERIAL_CATALOGO
│  │  ├─ MATERIAL_PEDIDO
│  │  ├─ MATERIAL_CONSUMO
│  │  ├─ FATURA
│  │  └─ AUDIT_LOG
│  ├─ Relacionamentos Resumidos
│  ├─ Regras de Integridade
│  ├─ Views de Relatórios
│  └─ Retenção de Dados
├─ MER-001-PLATAFORMA.md
└─ MER-002-CLIENTE.md
```

#### **Dicionário de Dados**
```
📁 30 - Banco de Dados/32 - Dicionario de Dados/
├─ 00 - Index - Master Data.md
├─ DB-001-MASTER-CORPORATIVO.md
├─ DB-002-MASTER-OPERACIONAL.md
└─ DB-003-GESTAO-PESSOAS.md
```

#### **Scripts e Procedures**
```
📁 30 - Banco de Dados/33 - Scripts/
├─ 00 - Index - Scripts.md
├─ PG-001-CRIAR-USUARIO.md
├─ PG-002-VALIDAR-APONTAMENTO.md
├─ PG-003-CALCULAR-CUSTO.md
├─ PG-004-FATURAR.md
└─ Índices e Triggers
```

---

### **TIER 5: Back-end, APIs e Segurança**

#### **Requisitos Técnicos e Visão Geral**
```
📁 40 - Back-end, APIs e Seguranca/
├─ 00 - Requisitos Tecnicos e Tecnologias.md
│  └─ 97 requisitos consolidados
├─ 01 - Visao Geral Tecnica (Consolidado).md
│  └─ Stack, arquitetura, exemplos de código
├─ 02 - Checklist de Conformidade.md
│  └─ 86.6% compliance (84/97)
├─ 99 - Arquitetura Backend (Boas Praticas).md
│  └─ SOLID, Secure SDLC, 13 competências
```

#### **Endpoints (REST API)**
```
📁 40 - Back-end/41 - Endpoints/
├─ 00 - Index - Endpoints.md
├─ Padrões REST
├─ Autenticação (JWT + MFA)
├─ Rate Limiting
├─ Versionamento
└─ Documentação OpenAPI/Swagger
```

#### **Controllers (Lógica de Negócio)**
```
📁 40 - Back-end/42 - Controllers/
├─ 00 - Index - Controllers.md
├─ Layered Architecture
├─ Exception Handling
├─ Multi-tenant Isolation
└─ Exemplos de código Node.js/Express
```

#### **Integrações (ERPs e APIs Externas)**
```
📁 40 - Back-end/43 - Integrracoes/
├─ 00 - Index - Integrracoes.md
├─ Webhooks
├─ Event Streaming (Kafka/Bull)
├─ Batch Processing
└─ Síncronos vs Assíncronos
```

#### **Segurança, Autenticação e LGPD** ⭐ DETALHADO
```
📁 40 - Back-end/44 - Seguranca/
├─ 00 - Index - Seguranca.md
├─ Perfis Governanca e Controle de Acesso.md
│  └─ Referenciado aqui também
├─ RBAC Detalhado (7 Papéis)
├─ Bcrypt/Argon2 (Hash de Senha)
├─ AES-256 (Criptografia de Dados)
├─ OWASP Top 10
├─ Compliance LGPD
└─ Secure SDLC
```

---

### **TIER 6: Front-end e Interfaces** ⭐ DETALHADO

#### **Especificações Completas de Telas**
```
📁 50 - Front-end/
├─ 50 - Especificacao Completa de Telas.md (NOVO)
│  ├─ Arquitetura Multi-Aplicação
│  ├─ Telas de Autenticação (2)
│  ├─ Dashboards (4 versões)
│  │  ├─ Super Admin
│  │  ├─ Admin Construtora
│  │  ├─ Gerente Obra
│  │  └─ Operacional
│  ├─ Telas de Gestão
│  │  ├─ Obras (CRUD)
│  │  ├─ Apontamentos (listagem + fazer)
│  │  ├─ Materiais
│  │  ├─ Usuários
│  │  └─ Validações
│  ├─ Telas de Relatórios
│  ├─ Telas de Configuração
│  └─ Wireframes em ASCII art para cada tela
│
├─ 51 - Mobile (Canteiro)/
│  ├─ 00 - Index - Mobile.md
│  ├─ React Native/Flutter
│  ├─ Offline-first
│  ├─ Apontamento screen
│  ├─ Captura de GPS + Foto
│  └─ Sincronização
│
├─ 52 - Web Desktop (Escritório)/
│  ├─ 00 - Index - Web.md
│  ├─ React/Vue
│  ├─ Dashboards
│  ├─ Relatórios
│  └─ Admin Interface
│
└─ 53 - Components/
   ├─ 00 - Index - Components.md
   ├─ Design Tokens
   ├─ Atomic Design
   └─ Accessibility (WCAG AA)
```

---

### **TIER 7: Infraestrutura, Cloud e DevOps**

#### **Arquitetura de Nuvem**
```
📁 60 - Infraestrutura/61 - Cloud/
├─ 00 - Index - Cloud.md
├─ AWS/Azure Multi-region
├─ Disaster Recovery
├─ RTO/RPO
└─ Escalabilidade
```

#### **CI/CD Pipeline**
```
📁 60 - Infraestrutura/62 - CICD/
├─ 00 - Index - CICD.md
├─ GitHub Actions
├─ Blue-green Deployment
├─ Smoke Tests
└─ Rollback Strategy
```

#### **Monitoring e Observabilidade**
```
📁 60 - Infraestrutura/63 - Monitoring/
├─ 00 - Index - Monitoring.md
├─ SLO/SLI/SLA
├─ Prometheus + Grafana
├─ DataDog
└─ ELK Stack
```

---

### **TIER 8: Gestão Ágil e Desenvolvimento**

#### **Setup Ágil e Workflow**
```
📁 70 - Gestao Agil (Scrum)/
├─ 70 - Setup Agil e Workflow da Equipe.md (NOVO)
│  ├─ Quadro Kanban (GitHub Projects v2)
│  ├─ Cerimônias Ágeis (Dailies, Syncs, Retros)
│  ├─ Padrões de Commit & Branches
│  └─ Fluxo de Pull Requests & CI
```

#### **Backlog do Produto**
```
📁 70 - Gestao Agil (Scrum)/71 - Backlog do Produto (Epicos)/
├─ 00 - Index - Backlog.md
├─ 8 Épicos
├─ Story Points
├─ Roadmap Q1-Q4 2026
└─ Priorizações
```

#### **Sprints e Retrospectivas**
```
📁 70 - Gestao Agil (Scrum)/72 - Sprints Ativas e Retrospectivas/
├─ 00 - Index - Sprints.md
├─ 2-week Sprints
├─ Daily Standup
├─ Sprint Planning
└─ Retrospectivas
```

#### **Regras da Equipe e Fluxo de Propostas**
```
📁 ob_obra_integrada/00-Index/80 - Customer Success (CS) e Suporte/82 - Testes e Garantia de Qualidade (QA)/
└─ Regras de Desenvolvimento Equipe.md (Regras de desenvolvimento e versionamento)
📁 ob_obra_integrada/00-Index/90 - Sistema Obsidian/95 - Propostas de Atualizacao/
├─ README.md (Manual e template de propostas)
└─ historico/README.md (Propostas arquivadas e aprovadas)
```

---

### **TIER 9: Customer Success e Suporte**

#### **Onboarding e Documentação**
```
📁 80 - Customer Success/81 - Onboarding/
├─ 00 - Index - Onboarding.md
├─ 5-phase Onboarding
├─ Manuais por Persona
└─ FAQ por Papel
```

#### **QA e Testes**
```
📁 80 - Customer Success/82 - QA/
├─ 00 - Index - QA.md
├─ Jest (Unit 80%+)
├─ Supertest (Integration)
├─ Cypress/Playwright (E2E)
├─ Autocannon (Load)
└─ SonarQube (SAST)
```

#### **Releases e Changelog**
```
📁 80 - Customer Success/83 - Releases/
├─ 00 - Index - Releases.md
├─ SemVer
├─ Release Notes Template
└─ Hotfix Process
```

---

### **TIER 10: Sistema Obsidian**

#### **Templates**
```
📁 90 - Sistema Obsidian/91 - Templates/
├─ 00 - Index - Templates.md
├─ Feature Template
├─ Decision Template
├─ Meeting Template
├─ Bug Template
├─ Story Template
└─ MOC Template
```

#### **Regras do Agente IDE (IA)**
```
📁 ob_obra_integrada/00-Index/90 - Sistema Obsidian/92 - Agente IDE/
├─ README.md (Regras de desenvolvimento e boas práticas)
├─ PROMPT-INICIAL.md (Prompt de alinhamento para novas IAs)
├─ RESUMO-PROJETO.md (Resumo técnico do projeto para IAs)
├─ skill-docs-builder.md (Padrão de documentação técnica)
├─ skill-obsidian-manager.md (Padrão de preenchimento do Obsidian)
├─ skill-security-guardian.md (Criptografia, CORS, isolamento multi-tenant)
└─ skill-db-migration.md (Passo a passo de migração e ingestão de SINAPI/INCC)
```

#### **Lixeira**
```
📁 90 - Sistema Obsidian/99 - Lixeira/
└─ Arquivos órfãos para limpeza
```

---

## 🔍 BUSCA RÁPIDA POR TÓPICO

### Preciso aprender sobre...

**NEGÓCIO & ESTRATÉGIA**
- Modelos de negócio → [Nível SaaS](01%20-%20Nivel%20SaaS%20%28A%20Plataforma%29.md)
- Estrutura de usuários → [Mapa de Perfis](00%20-%20Mapa%20de%20Perfis%20%28MOC%29.md)
- Regras operacionais → [RN-000 - Regras de Negócio](00-Index/10%20-%20Produto%20e%20Negocios/12%20-%20Regras%20de%20Negocio/RN-000%20-%20Regras%20de%20Negocio%20Consolidadas.md)

**GESTÃO DE PESSOAS & PERMISSÕES**
- Papéis e responsabilidades → [Perfis Governança e Controle](00-Index/20%20-%20Documentacao%20e%20Tecnologias/20%20-%20Perfis%20Governanca%20e%20Controle%20de%20Acesso.md)
- Quem pode fazer o quê → [Matriz de Permissões](00-Index/20%20-%20Documentacao%20e%20Tecnologias/20%20-%20Perfis%20Governanca%20e%20Controle%20de%20Acesso.md#matriz-consolidada-de-permissões)
- Acesso a campos específicos → [Field-Level ACL](00-Index/20%20-%20Documentacao%20e%20Tecnologias/20%20-%20Perfis%20Governanca%20e%20Controle%20de%20Acesso.md#-controle-de-acesso-por-campo-field-level-acl)

**DESENVOLVIMENTO BACK-END**
- Arquitetura geral → [Visão Geral Técnica](00-Index/40%20-%20Back-end%2C%20APIs%20e%20Seguranca/01%20-%20Visao%20Geral%20Tecnica%20%28Consolidado%29.md)
- Stack tecnológico → [Requisitos Técnicos](00-Index/40%20-%20Back-end%2C%20APIs%20e%20Seguranca/00%20-%20Requisitos%20Tecnicos%20e%20Tecnologias.md)
- Endpoints REST → [Index Endpoints](00-Index/40%20-%20Back-end%2C%20APIs%20e%20Seguranca/41%20-%20Endpoints/00%20-%20Index%20-%20Endpoints.md)
- Controllers e lógica → [Index Controllers](00-Index/40%20-%20Back-end%2C%20APIs%20e%20Seguranca/42%20-%20Controllers/00%20-%20Index%20-%20Controllers.md)

**DESENVOLVIMENTO FRONT-END**
- Todas as telas do sistema → [Especificação Completa de Telas](00-Index/50%20-%20Front-end%20e%20Interfaces/50%20-%20Especificacao%20Completa%20de%20Telas.md)
- Mobile (canteiro) → [Index Mobile](00-Index/50%20-%20Front-end%20e%20Interfaces/51%20-%20Mobile%20%28Canteiro%20de%20Obras%29/00%20-%20Index%20-%20Mobile.md)
- Web desktop (escritório) → [Index Web](00-Index/50%20-%20Front-end%20e%20Interfaces/52%20-%20Web%20Desktop%20%28Escritório%29/00%20-%20Index%20-%20Web.md)

**BANCO DE DADOS**
- Esquema completo com 14 tabelas → [Esquema Completo do BD](00-Index/30%20-%20Banco%20de%20Dados%20e%20Modelagem/30%20-%20Esquema%20Completo%20do%20Banco%20de%20Dados.md)
- Diagrama ER → [Index DER](00-Index/30%20-%20Banco%20de%20Dados%20e%20Modelagem/31%20-%20DER/00%20-%20Index%20-%20DER.md)
- SQL e procedures → [Index Scripts](00-Index/30%20-%20Banco%20de%20Dados%20e%20Modelagem/33%20-%20Scripts/00%20-%20Index%20-%20Scripts.md)

**SEGURANÇA & COMPLIANCE**
- RBAC, autenticação, LGPD → [Segurança Index](00-Index/40%20-%20Back-end%2C%20APIs%20e%20Seguranca/44%20-%20Seguranca/00%20-%20Index%20-%20Seguranca.md)
- Isolamento multi-tenant → [Perfis Governança - Isolamento](00-Index/20%20-%20Documentacao%20e%20Tecnologias/20%20-%20Perfis%20Governanca%20e%20Controle%20de%20Acesso.md#-isolamento-multi-tenant)

**DEVOPS & INFRAESTRUTURA**
- Cloud, multi-region → [Index Cloud](00-Index/60%20-%20Infraestrutura%2C%20Cloud%20e%20DevOps/61%20-%20Cloud/00%20-%20Index%20-%20Cloud.md)
- CI/CD pipeline → [Index CI/CD](00-Index/60%20-%20Infraestrutura%2C%20Cloud%20e%20DevOps/62%20-%20Pipelines%20de%20Deploy%20%28CI-CD%29/00%20-%20Index%20-%20CICD.md)
- Monitoring → [Index Monitoring](00-Index/60%20-%20Infraestrutura%2C%20Cloud%20e%20DevOps/63%20-%20Logs%20e%20Monitoramento%20de%20Performance/00%20-%20Index%20-%20Monitoring.md)

**QUALIDADE & TESTES**
- Estratégia de testes → [Index QA](00-Index/80%20-%20Customer%20Success%20%28CS%29%20e%20Suporte/82%20-%20Testes%20e%20Garantia%20de%20Qualidade%20%28QA%29/00%20-%20Index%20-%20QA.md)

**PLANEJAMENTO & AGILE**
- Setup Ágil e Workflow da Equipe → [Setup Ágil](00-Index/70%20-%20Gestao%20Agil%20%28Scrum%29/70%20-%20Setup%20Agil%20e%20Workflow%20da%20Equipe.md)
- Roadmap 2026 → [Index Backlog](00-Index/70%20-%20Gestao%20Agil%20%28Scrum%29/71%20-%20Backlog%20do%20Produto%20%28Epicos%29/00%20-%20Index%20-%20Backlog.md)
- Sprints atuais → [Index Sprints](00-Index/70%20-%20Gestao%20Agil%20%28Scrum%29/72%20-%20Sprints%20Ativas%20e%20Retrospectivas/00%20-%20Index%20-%20Sprints.md)

**ONBOARDING & SUPORTE**
- Como treinar usuários → [Index Onboarding](00-Index/80%20-%20Customer%20Success%20%28CS%29%20e%20Suporte/81%20-%20Manuais%20e%20Onboarding%20%28Base%20de%20Conhecimento%29/00%20-%20Index%20-%20Onboarding.md)

---

## 📈 STATUS DE COMPLETUDE

### Documentação por Categoria

| Categoria | % Completo | Documentos | Status |
|-----------|-----------|-----------|--------|
| **Negócios** | 95% | 5/5 | ✅ Pronto |
| **Produtos** | 90% | 7/8 | ✅ Pronto |
| **Documentação** | 95% | 9/10 | ✅ Pronto |
| **Banco de Dados** | 100% | 9/9 | ✅ Completo |
| **Backend** | 95% | 11/12 | ✅ Pronto |
| **Frontend** | 90% | 10/11 | ✅ Pronto |
| **Infraestrutura** | 85% | 9/11 | ⚠️ Em andamento |
| **Agile** | 100% | 9/9 | ✅ Completo |
| **CS & Suporte** | 100% | 9/9 | ✅ Completo |
| **Sistema Obsidian** | 100% | 7/7 | ✅ Completo |
| **TOTAL** | **94%** | **85/91** | ✅ Documentação Robusta |

---

## 🎯 PRÓXIMOS PASSOS

### Fase 1: Validação (Semana 1-2)
- [ ] Review com stakeholders de cada área
- [ ] Validar regras de negócio com clientes-piloto
- [ ] Confirmar permissões com especialistas de segurança

### Fase 2: Detalhamento (Semana 3-4)
- [ ] Criar exemplos de código para cada endpoint
- [ ] Desenvolver testes de cada permissão
- [ ] Documentar edge cases encontrados

### Fase 3: Implementação (Semana 5+)
- [ ] Backend: Implementar controllers e middlewares
- [ ] Database: Executar scripts de setup
- [ ] Frontend: Construir telas conforme wireframes
- [ ] Testes: Validar toda cobertura

---

## 📞 CONTATO E DÚVIDAS

**Documentação**
- Responsável: [Sua Equipe]
- Última atualização: 11 de junho de 2026
- Versão: 1.0 (Estável)

**Links Importantes**
- [Git Repository]
- [Jira Board](00-Index/70%20-%20Gestao%20Agil%20%28Scrum%29)
- [Figma Designs](00-Index/20%20-%20Documentacao%20e%20Tecnologias/21%20-%20Identidade%20Visual%20e%20Componentes%20%28Figma%29)

---

**Bem-vindo ao OBRA INTEGRADA! 🏗️**

A documentação está organizada, completa e pronta para desenvolvimento.
Navegue pelos índices e explore cada seção conforme necessário.


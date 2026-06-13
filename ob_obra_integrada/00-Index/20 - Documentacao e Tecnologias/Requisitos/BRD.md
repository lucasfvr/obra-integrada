# BRD — Business Requirements Document
## Obra Integrada — Plataforma SaaS para Gestão de Obras

**Versão:** 1.0  
**Data:** 13 de junho de 2026  
**Referência:** IEEE 29148 — Engenharia de Requisitos  
**Status:** Vigente

---

## 1. Propósito e Escopo

### 1.1 Objetivo do Documento

Este BRD documenta os **requisitos de negócio** da plataforma Obra Integrada — o "porquê" antes do "como". Serve como referência para o time de produto, desenvolvimento e stakeholders.

### 1.2 Problema de Negócio

Construtoras de pequeno e médio porte (5–500 funcionários) dependem de:
- Cadernos físicos para diário de obra → sem comprovação, sem auditoria
- Planilhas Excel espalhadas para financeiro → dado inconsistente
- WhatsApp para gestão de equipes → sem rastreabilidade
- E-mails para documentos → sem controle de versão
- Ferramentas caras (ERP de construção) → inacessíveis para PMEs

**Impacto estimado:** Construtoras perdem em média 20–30% do orçamento por falta de controle e visibilidade em obras.

### 1.3 Solução Proposta

Plataforma SaaS multi-tenant que centraliza:
1. Diário de obra digital (com foto, GPS, auditoria)
2. Gestão de equipes e RBAC por papel
3. Financeiro por obra
4. Tarefas e cronograma
5. Documentos e armazenamento
6. RH e certificações NR

---

## 2. Stakeholders

| Stakeholder | Tipo | Necessidade principal |
|-------------|------|----------------------|
| **Proprietário da construtora** | Primário | Visibilidade total do negócio |
| **Engenheiro responsável** | Primário | Gestão operacional da obra |
| **Mestre de obras / Trabalhador** | Primário | Registro de atividades diárias |
| **Cliente do imóvel** | Primário | Acompanhar progresso da obra |
| **Equipe Obra Integrada** | Interno | Operar e evoluir a plataforma |
| **ANPD** | Regulatório | Conformidade LGPD |
| **CREA / CAU** | Regulatório | Registro de ARTs |

---

## 3. Requisitos de Negócio

### 3.1 Requisitos Essenciais (Must Have)

| ID | Requisito de Negócio | Módulo |
|----|---------------------|--------|
| BR-001 | O sistema deve suportar múltiplas construtoras (multi-tenancy) sem vazamento de dados entre tenants | Core |
| BR-002 | Cada obra deve ter uma equipe com papéis distintos e permissões granulares | RBAC |
| BR-003 | O diário de obra deve registrar data, hora, GPS e foto como prova de presença | Diário |
| BR-004 | O sistema deve calcular e exibir indicadores financeiros por obra em tempo real | Financeiro |
| BR-005 | O gestor deve poder ver o status de todas as obras da empresa em um único painel | Dashboard |
| BR-006 | O sistema deve controlar as certificações NR dos funcionários e alertar sobre vencimentos | RH |
| BR-007 | Documentos da obra devem ser armazenados e acessíveis por link seguro | Documentos |
| BR-008 | O sistema deve gerar relatório de apontamento de horas por funcionário | RH / Apontamentos |

### 3.2 Requisitos Importantes (Should Have)

| ID | Requisito de Negócio | Módulo |
|----|---------------------|--------|
| BR-009 | Integração com índice INCC para reajuste automático de orçamento | Financeiro |
| BR-010 | Exportação do Relatório Diário de Obra (RDO) em PDF | Relatórios |
| BR-011 | Cronograma físico-financeiro com Gantt | Planejamento |
| BR-012 | Integração com SINAPI para referência de preços | Orçamento |
| BR-013 | App mobile com funcionamento offline no canteiro | Mobile |

### 3.3 Requisitos Desejáveis (Could Have)

| ID | Requisito de Negócio | Módulo |
|----|---------------------|--------|
| BR-014 | Integração com eSocial / CNO | Compliance |
| BR-015 | Módulo de licitações (PNCP) | Comercial |
| BR-016 | IA para previsão de desvios orçamentários | Analytics |
| BR-017 | Integração com ERP (SAP, TOTVS) | Integração |

---

## 4. Critérios de Sucesso

| Métrica (KPI) | Meta 6 meses | Meta 12 meses |
|--------------|-------------|--------------|
| Construtoras ativas | 10 | 50 |
| Obras em gestão | 30 | 200 |
| NPS dos usuários | ≥ 50 | ≥ 65 |
| Churn mensal | < 5% | < 3% |
| Uptime da plataforma | ≥ 99,5% | ≥ 99,9% |
| Tempo médio de resposta da API | < 500ms | < 300ms |

---

## 5. Restrições de Negócio

| Restrição | Descrição |
|-----------|-----------|
| **LGPD** | CPF de funcionários e dados de saúde exigem tratamento especial |
| **Orçamento** | MVP com equipe de 6 pessoas em tempo parcial (TCC) |
| **Prazo** | Primeira versão para banca: jul/2026 |
| **Hosting** | Vercel + NeonDB (contas gratuitas/starter) |
| **Tecnologia** | Stack definida: Node.js + React + PostgreSQL + Prisma |

---

## 6. Premissas

- Os usuários têm smartphone com câmera e GPS habilitados
- Acesso à internet no canteiro de obras (4G ou WiFi)
- A construtora tem pelo menos 1 responsável técnico cadastrado

---

## 7. Dependências

| Dependência | Tipo | Impacto se falhar |
|-------------|------|------------------|
| NeonDB (PostgreSQL) | Infraestrutura | Sistema indisponível |
| Vercel (hosting) | Infraestrutura | Sistema indisponível |
| Storage externo (S3/R2) | Funcional | Upload de arquivos falha |
| INCC (FGV) | Funcional | Reajuste manual |
| SINAPI (Caixa) | Funcional | Orçamento sem referência nacional |

---

**Aprovado por:** [Responsável pelo Produto]  
**Versão:** 1.0 | **Data:** 13/06/2026

# PRD — Product Requirements Document
## Obra Integrada — Plataforma SaaS para Gestão de Obras

**Versão:** 1.0 | **Data:** 13/06/2026 | **Referência:** IEEE 29148

---

## 1. Visão do Produto

**Para** construtoras de pequeno e médio porte  
**Que** precisam digitalizar a gestão de obras  
**O Obra Integrada** é uma plataforma SaaS web  
**Que** centraliza diário de obra, equipes, financeiro, tarefas e documentos  
**Diferente de** soluções de ERP caras e complexas  
**Nosso produto** oferece uma interface intuitiva a custo acessível com foco no canteiro

---

## 2. Personas

### 👷 Persona 1 — Paulo, Engenheiro Responsável (35 anos)
- Gerencia 3–5 obras simultaneamente
- Acessa a plataforma no escritório e no canteiro
- Precisa de: visão consolidada, aprovação de diários, alertas de desvio
- Frustração: "Fico ligando para o mestre de obras pra saber o status"

### 🏢 Persona 2 — Renata, Proprietária da Construtora (48 anos)
- Dono do negócio, não está nas obras diariamente
- Precisa de: dashboard executivo, financeiro consolidado
- Frustração: "Não sei quanto cada obra está custando de verdade"

### 🧱 Persona 3 — Carlos, Mestre de Obras (52 anos)
- Usa smartphone básico, pouca experiência com apps
- Precisa de: interface simples para diário e tarefas
- Frustração: "Tenho que preencher papel e depois alguém digita"

### 👔 Persona 4 — Luciana, Cliente da Obra (40 anos)
- Contratou a obra, quer acompanhar o andamento
- Precisa de: acesso read-only, progresso, fotos
- Frustração: "Fico no escuro sobre o que está acontecendo"

---

## 3. Funcionalidades por Módulo

### Módulo 1 — Autenticação e Onboarding
| ID | Feature | Prioridade | Sprint |
|----|---------|-----------|--------|
| F-001 | Cadastro em 2 etapas (validação + formulário completo) | P0 | ✅ Done |
| F-002 | Login com JWT (8h de expiração) | P0 | ✅ Done |
| F-003 | Recuperação de senha por e-mail | P0 | ✅ Done |
| F-004 | MFA (autenticação de dois fatores) | P2 | Sprint 4 |
| F-005 | Refresh token + logout server-side | P2 | Sprint 3 |
| F-006 | SSO (Google/Microsoft) | P3 | Backlog |

### Módulo 2 — Obras
| ID | Feature | Prioridade | Sprint |
|----|---------|-----------|--------|
| F-010 | CRUD completo de obras | P0 | ✅ Done |
| F-011 | Gestão de equipe da obra (adicionar/remover/papéis) | P0 | ✅ Done |
| F-012 | Estoque por obra + histórico de movimentações | P0 | ✅ Done |
| F-013 | Documentos da obra (upload e download) | P0 | ✅ Done |
| F-014 | Org-chart da equipe | P1 | ✅ Done |
| F-015 | Cronograma físico-financeiro (Gantt) | P3 | Backlog |

### Módulo 3 — Diário de Obra
| ID | Feature | Prioridade | Sprint |
|----|---------|-----------|--------|
| F-020 | Registro de entrada com foto + GPS | P0 | ✅ Done |
| F-021 | Status de auditoria (AUTORIZADO / REPROVADO) | P0 | ✅ Done |
| F-022 | Exportação como RDO em PDF | P2 | Sprint 5 |
| F-023 | Diário offline (PWA) | P3 | Backlog |

### Módulo 4 — Tarefas
| ID | Feature | Prioridade | Sprint |
|----|---------|-----------|--------|
| F-030 | CRUD de tarefas com atribuição múltipla | P0 | ✅ Done |
| F-031 | Status e % de conclusão | P0 | ✅ Done |
| F-032 | Calendário visual (FullCalendar) | P1 | ✅ Done |
| F-033 | Notificações de prazo (push/email) | P2 | Sprint 4 |

### Módulo 5 — Financeiro
| ID | Feature | Prioridade | Sprint |
|----|---------|-----------|--------|
| F-040 | Lançamentos financeiros (receitas/despesas) | P0 | ✅ Done |
| F-041 | Upload de comprovantes | P0 | ✅ Done |
| F-042 | Financeiro consolidado (todas as obras) | P2 | Sprint 3 |
| F-043 | Reajuste por INCC | P3 | Backlog |
| F-044 | Integração SINAPI (orçamento) | P3 | Backlog |

### Módulo 6 — RH e Pessoas
| ID | Feature | Prioridade | Sprint |
|----|---------|-----------|--------|
| F-050 | CRUD de funcionários + matrícula automática | P0 | ✅ Done |
| F-051 | Certificações NR (emissão, validade) | P1 | Sprint 2 |
| F-052 | Apontamento de horas | P2 | Sprint 3 |
| F-053 | Gestão de afastamentos | P3 | Backlog |

### Módulo 7 — Admin e Plataforma
| ID | Feature | Prioridade | Sprint |
|----|---------|-----------|--------|
| F-060 | Dashboard de métricas globais | P0 | ✅ Done |
| F-061 | Gestão de tenants (clientes) | P1 | Sprint 2 |
| F-062 | Impersonação de usuário (debug) | P1 | ✅ Done |
| F-063 | Tabela de auditoria persistida | P0 | Sprint 1 |
| F-064 | Log de incidentes de segurança | P1 | Sprint 2 |

---

## 4. Requisitos Não Funcionais (NFRs)

| ID | NFR | Meta | Prioridade |
|----|-----|------|-----------|
| NFR-001 | **Performance** — Tempo de resposta da API | < 500ms (p95) | P0 |
| NFR-002 | **Disponibilidade** — Uptime mensal | ≥ 99,5% | P0 |
| NFR-003 | **Segurança** — JWT sem fallback inseguro | JWT_SECRET obrigatório | P0 |
| NFR-004 | **Segurança** — Rate limiting no login | Max 5 tentativas/min | P0 |
| NFR-005 | **Segurança** — Headers de segurança | Helmet + CSP | P0 |
| NFR-006 | **LGPD** — Criptografia de dados sensíveis | AES-256 para CPF/dados saúde | P1 |
| NFR-007 | **Escalabilidade** — Suporte a tenants concorrentes | Serverless auto-scaling | P1 |
| NFR-008 | **Usabilidade** — Mobile-first | Responsivo, funciona em 360px | P1 |
| NFR-009 | **Acessibilidade** — WCAG 2.1 AA | Contraste, labels, foco | P2 |
| NFR-010 | **Internacionalização** | pt-BR por padrão; en futuro | P3 |

---

## 5. Plano de Release

| Versão | Nome | Data alvo | Features principais |
|--------|------|----------|---------------------|
| **v0.9** | MVP Banca | Jul/2026 | Estado atual + correções P0 de segurança |
| **v1.0** | Produção | Set/2026 | LGPD, rate limiting, RBAC corrigido, uploads S3 |
| **v1.1** | RH+ | Nov/2026 | Certificações NR, apontamentos, financeiro consolidado |
| **v1.2** | Orçamento | Jan/2027 | SINAPI, INCC, cronograma Gantt |
| **v2.0** | Enterprise | 2027+ | SOC 2 readiness, MFA, SSO, mobile PWA |

---

**Versão:** 1.0 | **Data:** 13/06/2026 | **Dono do Produto:** Lucas

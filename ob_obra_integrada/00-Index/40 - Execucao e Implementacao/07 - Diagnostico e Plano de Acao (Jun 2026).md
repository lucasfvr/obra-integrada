# 🔍 Diagnóstico e Plano de Ação — Obra Integrada
**Data:** Junho de 2026 (atualizado)
**Escopo:** Estado atual do código vs. missão SaaS + Prioridade declarada
**Prioridade:** Gestão de Pessoas → Obras → Negócio SaaS

---

## 📌 Resumo Executivo

O projeto possui base sólida de MVP: autenticação JWT/bcrypt, RBAC funcional, multi-tenancy parcial, CRUD de obras, diário GPS/foto, tarefas, RH, financeiro e estoque simples por obra. A plataforma **funciona e está rodando**, mas ainda está em ~35% da visão SaaS documentada.

**Maior lacuna imediata:** Módulo de Gestão de Pessoas (tela `/equipe`, `valor_dia`, NRs) e módulos globais de Financeiro e Materiais ainda em `UnderConstruction`. Nenhum fluxo de Ordem de Serviço ou Apontamento de Horas implementado.

---

## ✅ O que JÁ existe e funciona

### Backend
| Módulo | Status | Observação |
|--------|--------|------------|
| Autenticação JWT | ✅ OK | bcrypt para hash de senha |
| RBAC por role | ✅ OK | 6 roles: ADMIN_MASTER, ADMIN, PROPRIETARIO, RESPONSAVEL, ESTAGIARIO, TRABALHADOR |
| Multi-tenancy base | ⚠️ Parcial | Via `tb_cliente` + `tb_obra_cliente`; sem RLS no PostgreSQL |
| CRUD de Obras | ✅ OK | Listagem paginada, criação, detalhe, update, delete |
| Diário da Obra | ✅ OK | Com foto, GPS, justificativa, auditoria |
| Tarefas por Obra | ✅ OK | CRUD completo, status, prioridade, responsáveis |
| RH básico | ✅ OK | CRUD de funcionários, matrícula automática, soft-delete |
| Financeiro por obra | ✅ OK | Lançamentos com NF e comprovante |
| Estoque por obra | ✅ OK | Movimentações de entrada/saída |
| Documentos por obra | ✅ OK | Upload de arquivos |
| Etapas por obra | ✅ OK | Vínculo de materiais |

### Frontend
| Tela / Rota | Status | Observação |
|-------------|--------|------------|
| Home pública | ✅ OK | Não alterar |
| Login / Cadastro / Recuperação | ✅ OK | Não alterar |
| Formulário completo de cadastro | ✅ OK | Não alterar |
| Dashboard dinâmico por perfil | ✅ OK | Cards por role |
| `/obras` — Minhas Obras | ✅ OK | Listagem com filtros |
| `/obra/:id` — Detalhe | ✅ OK | Abas: Geral, Tarefas, Equipe, Diário, Financeiro, Estoque, Docs |
| `/calendar` | ✅ OK | Tarefas no calendário |
| `/documentos` | ✅ OK | Documentos da obra |
| `/rh` — Gestão RH | ✅ OK | CRUD de funcionários |
| `/profile` — Minha Conta | ✅ OK | Perfil do usuário |
| `/materiais` | ❌ Em Construção | Exibe UnderConstruction |
| `/financeiro` | ❌ Em Construção | Exibe UnderConstruction |
| `/equipe` | ❌ Em Construção | Exibe UnderConstruction |
| `/clientes` | 🔴 Quebrado | Item no menu sem rota definida no App.jsx |

---

## 🐛 Bugs e Riscos Ativos (P0 — corrigir antes de qualquer feature)

| # | Arquivo | Problema | Risco |
|---|---------|----------|-------|
| 1 | `authMiddleware.js` | Fallback `SUPER_SECRET` quando `JWT_SECRET` não existe | Tokens aceitos com segredo padrão |
| 2 | `server.js` | `cors()` aberto para qualquer origem | Qualquer domínio pode chamar a API |
| 3 | `obraRoutes.js` | `/obras/estoque/:idItem/historico` usa `requireObraAccess('parcial')` sem param `:id` | Rota quebrada |
| 4 | `diarioController.js` | Grava em `prisma.tb_log_auditoria` que não existe no schema | Auditoria silenciosa |
| 5 | `App.jsx` | Item `/clientes` no sidebar sem rota definida | Usuário cai no fallback `/` |
| 6 | `PlansPage.jsx` | Erro de parsing no lint | Build pode falhar futuramente |
| 7 | `financeiroRoutes.js` | Upload em path literal `uploads/financeiro` em vez do storage service | Inconsistente em serverless |
| 8 | `frontend/.env.example` | Contém variáveis de backend (`DATABASE_URL`, `JWT_SECRET`) | Confusão de ambiente |

---

## 🚨 O que FALTA — por fase de prioridade

### 🟥 FASE 1 — Gestão de Pessoas

| Item | Onde | Status | Campo no banco |
|------|------|--------|----------------|
| Tela global `/equipe` | Frontend | ❌ Em Construção | `tb_usuario_obra` existe |
| Edição de `valor_dia` e `id_papel` na aba Equipe | ObraTeam.jsx | ❌ Nunca implementado | Campo existe no schema |
| Gestão de NRs/Certificações (data de validade) | RH / Perfil | ❌ Sem interface | Campo `certificacoes` JSON existe |
| Alerta de NR vencida | RH | ❌ Inexistente | — |
| Rate limiting nas rotas de auth | Backend | ❌ Inexistente | — |
| Helmet/CSP no servidor | `server.js` | ❌ Inexistente | — |
| Rota de impersonação no backend | adminRoutes | ⚠️ Sem verificação | Frontend tem banner |

### 🟧 FASE 2 — Gestão de Obras e Operação

| Item | Onde | Status |
|------|------|--------|
| Tela global `/financeiro` | Frontend | ❌ Em Construção |
| Tela global `/materiais` | Frontend | ❌ Em Construção |
| Tela de clientes `/clientes` (ADMIN) | Frontend + Backend | ❌ Link quebrado |
| Apontamento de horas (`tb_apontamento`) | Backend + Frontend | ❌ Inexistente |
| Fluxo supervisor → gerente (aprovação) | Backend | ❌ Inexistente |
| Ordem de Serviço com máquina de estados | Backend + Frontend | ❌ Inexistente |
| Auditoria de queries por `id_cliente` (tenant isolation) | Backend | ⚠️ Parcial |
| Middleware global de erro padronizado | Backend | ❌ Inexistente |

### 🟨 FASE 3 — SaaS e Negócio

| Item | Status |
|------|--------|
| `tb_log_auditoria` persistida | ❌ Schema sem a tabela |
| Feature flags por tenant (`tb_config_tenant`) | ❌ Inexistente |
| Relatórios PDF (RDO) / XLSX (financeiro) | ❌ Inexistente |
| Cálculo automático custo OS (horas × valor_dia) | ❌ Inexistente |
| Curva S por obra (earned value) | ❌ Inexistente |
| 2FA TOTP | ❌ Inexistente |
| Lockout por tentativas de login | ❌ Inexistente |
| Uploads em storage externo (S3) | ❌ Disco local |
| CI/CD com GitHub Actions | ❌ Inexistente |
| Docker Compose local | ❌ Inexistente |

---

## 📋 Backlog Priorizado

### 🔴 P0 — Agora (bugs críticos)
- [ ] Remover fallback `SUPER_SECRET` do `authMiddleware.js`
- [ ] Configurar CORS com allowlist via env
- [ ] Corrigir rota de histórico de estoque (sem `:id`)
- [ ] Criar `tb_log_auditoria` no Prisma schema ou remover referência
- [ ] Criar rota `/clientes` no `App.jsx` ou remover do sidebar
- [ ] Corrigir `PlansPage.jsx` (erro de parsing)
- [ ] Corrigir `frontend/.env.example`
- [ ] Criar `backend/.env.example`

### 🟠 P1 — Gestão de Pessoas (Fase 1)
- [ ] Implementar tela global `/equipe` com listagem do tenant
- [ ] Editar `valor_dia` + `id_papel` na aba Equipe da obra
- [ ] Gestão de NRs/certificações no perfil do funcionário
- [ ] Alerta visual de NR vencida no RH
- [ ] Rate limiting nas rotas de auth
- [ ] Helmet/CSP no `server.js`
- [ ] Verificar e implementar rota de impersonação no backend

### 🟡 P2 — Gestão de Obras (Fase 2)
- [ ] Tela global `/financeiro` (visão consolidada do tenant)
- [ ] Tela global `/materiais` (catálogo + saldo consolidado)
- [ ] Tela + API `/clientes` para ADMIN_MASTER
- [ ] `tb_apontamento` com fluxo de aprovação em 2 níveis
- [ ] Auditoria completa de tenant isolation em todos os endpoints
- [ ] Middleware global de erro padronizado na API

### 🟢 P3 — SaaS Maduro
- [ ] `tb_ordem_servico` com máquina de estados completa
- [ ] `tb_log_auditoria` real no banco
- [ ] Feature flags por tenant
- [ ] Relatórios PDF/XLSX
- [ ] Cálculo automático de custo por OS
- [ ] CI/CD com GitHub Actions
- [ ] Docker Compose local

### 🔵 P4 — Diferenciais
- [ ] Módulo QHS (NRs, bloqueios, checklists)
- [ ] Integração SINAPI
- [ ] BI Executivo / Curva S
- [ ] App Mobile / PWA offline
- [ ] 2FA TOTP + lockout
- [ ] IA para RDO automático
- [ ] Storage externo (S3)

---

## 🗺️ Próximos Passos — Plano de 6 Semanas

```
SEMANA 1: Correção de P0 (bugs e segurança base)
SEMANA 2-3: Gestão de Pessoas (/equipe, valor_dia, NRs)
SEMANA 4: Auth segura (rate limit, Helmet) + /clientes admin
SEMANA 5-6: Apontamento de horas + Financeiro/Materiais globais
```

---

**Versão:** 2.0 (atualizado)
**Responsável:** Antigravity (agente)
**Divisão de tarefas:** Ver [[08 - Divisao de Tarefas por Pessoa (Jun 2026)]]

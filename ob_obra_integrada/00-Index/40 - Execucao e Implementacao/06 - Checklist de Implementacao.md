---
tags: [checklist, validacao, go-live, verificacao]
atualizado: 2026-06-12
---
# ✅ Checklist de Implementação — Atualizado Jun/2026

> **Nota de atualização:** Este checklist foi revisado para refletir o estado real do código em junho de 2026.
> O projeto já possui um MVP parcial (~35% da visão SaaS). Os itens marcados com ✅ já existem no código.
> O restante está organizado por fase de prioridade declarada: Pessoas → Obras → Negócio.

---

## 🔴 SPRINT 0 — Correção de Bugs Críticos (P0)
*Antes de qualquer nova feature. Duração: 1 semana.*

### Segurança e Estabilidade
- [ ] Remover fallback `SUPER_SECRET` do `authMiddleware.js` — falhar o boot se `JWT_SECRET` ausente
- [ ] Configurar CORS com allowlist via variável de ambiente em `server.js`
- [ ] Corrigir rota `/obras/estoque/:idItem/historico` (usa `requireObraAccess` sem param `:id`)
- [ ] Adicionar Helmet/CSP ao `server.js`
- [ ] Adicionar rate limiting nas rotas de autenticação (login, cadastro, recuperação)

### Schema e Dados
- [ ] Criar `tb_log_auditoria` no Prisma schema **ou** remover toda referência a ela no `diarioController.js`
- [ ] Corrigir upload de comprovante em `financeiroRoutes.js` para usar o storage service centralizado

### Frontend
- [ ] Criar rota `/clientes` no `App.jsx` (ou remover item do sidebar `AppSidebar.tsx`)
- [ ] Corrigir erro de parsing em `PlansPage.jsx`
- [ ] Corrigir `frontend/vite-project/.env.example` — remover variáveis de backend
- [ ] Criar `backend/.env.example` com todas as variáveis necessárias documentadas

---

## 🟠 SPRINT 1 — Gestão de Pessoas (P1)
*Prioridade declarada. Duração: 2–3 semanas.*

### Backend
- [ ] Verificar/implementar rota `POST /api/admin/impersonar/:id` (protegida por `ADMIN_MASTER`)
- [ ] Criar endpoint `GET /api/equipe` — lista todos os usuários do tenant com filtros (obra, função, status)
- [ ] Criar endpoint `PATCH /api/obras/:id/equipe/:userId` — atualizar `valor_dia` e `id_papel` de um membro
- [ ] Criar endpoint `POST /api/usuarios/:id/certificacoes` — adicionar/atualizar NRs e certificações
- [ ] Criar endpoint `GET /api/usuarios/:id/certificacoes` — listar certificações com status de validade
- [ ] Criar endpoint `GET /api/rh/alertas-nr` — retornar funcionários com NR vencida ou próxima do vencimento

### Frontend
- [ ] Implementar tela global `/equipe` — listagem de todos os funcionários do tenant
  - Filtros por obra, função, status
  - Ações: vincular a obra, desvincular, editar papel/valor_dia
- [ ] Atualizar aba "Equipe" em `ObraTeam.jsx` — adicionar campo `valor_dia` e seleção de `id_papel`
- [ ] Criar componente de Gestão de Certificações/NRs no perfil do funcionário (`/rh`)
  - Campos: nome da NR, data de emissão, data de validade, arquivo
  - Visual: badge verde/amarelo/vermelho por status de validade
- [ ] Adicionar painel de alertas de NR vencida no dashboard do RH/Admin
- [ ] Remover `<UnderConstruction>` da rota `/equipe` e conectar ao novo componente

### Banco de Dados
- [ ] Verificar se o campo `certificacoes` (JSON) em `tb_usuario` é suficiente ou criar `tb_certificacao` separada
- [ ] Garantir que `tb_usuario_obra.valor_dia` está acessível em todas as consultas de equipe

---

## 🟡 SPRINT 2 — Gestão de Obras e Operação (P2)
*Duração: 3–4 semanas.*

### Backend — Clientes (Admin)
- [ ] Criar endpoint `GET /api/clientes` — listar tenants (somente ADMIN_MASTER/ADMIN)
- [ ] Criar endpoint `POST /api/clientes` — criar novo tenant
- [ ] Criar endpoint `PATCH /api/clientes/:id` — editar tenant (status, validade de plano)
- [ ] Criar endpoint `GET /api/clientes/:id/uso` — estatísticas de uso por tenant

### Frontend — Clientes
- [ ] Implementar tela `/clientes` com listagem de tenants
  - Colunas: nome, CNPJ, status de assinatura, validade do plano, total de obras, total de usuários
  - Ações: ativar, suspender, editar plano

### Backend — Financeiro Global
- [ ] Criar endpoint `GET /api/financeiro/consolidado` — soma de despesas/receitas de todas as obras do tenant com filtros de data

### Frontend — Financeiro Global
- [ ] Implementar tela `/financeiro` com visão consolidada do tenant
  - Total gasto, total previsto, variação por obra
  - Filtro por período e por obra
  - Tabela com detalhamento por lançamento

### Backend — Materiais Global
- [ ] Criar endpoint `GET /api/materiais/catalogo` — catálogo global de materiais do tenant
- [ ] Criar endpoint `GET /api/materiais/saldo` — saldo consolidado por material e por obra

### Frontend — Materiais Global
- [ ] Implementar tela `/materiais` com catálogo + saldo consolidado
  - Visão por material: total em estoque vs. total consumido em todas as obras
  - Filtro por obra

### Backend — Apontamento de Horas
- [ ] Criar tabela `tb_apontamento` no Prisma schema:
  - Campos: `id_usuario`, `id_obra`, `data`, `horas_trabalhadas`, `observacao`, `status` (PENDENTE/APROVADO/REJEITADO), `aprovado_por`, `aprovado_em`
- [ ] Criar endpoint `POST /api/apontamentos` — funcionário registra horas
- [ ] Criar endpoint `GET /api/apontamentos` — listar apontamentos com filtros
- [ ] Criar endpoint `PATCH /api/apontamentos/:id/aprovar` — mestre/gerente aprova
- [ ] Criar endpoint `PATCH /api/apontamentos/:id/rejeitar` — mestre/gerente rejeita

### Backend — Qualidade de API
- [ ] Criar middleware global de erro padronizado em `server.js`
- [ ] Padronizar formato de resposta da API: `{ success, data, error, message }`
- [ ] Auditar todos os endpoints para garantir filtro por `id_cliente` (tenant isolation)

---

## 🟢 SPRINT 3 — SaaS Maduro (P3)
*Duração: 4–6 semanas.*

### Ordem de Serviço
- [ ] Criar `tb_ordem_servico` no Prisma schema com máquina de estados:
  - Status: `PLANEJADA → LIBERADA → EM_EXECUCAO → CONCLUIDA → APROVADA | IMPEDIDA`
  - Campos: `id_obra`, `descricao`, `id_responsavel`, `id_etapa`, `bom_materiais` (JSON), `horas_orcadas`, `status`, histórico de transições
- [ ] Criar endpoints CRUD + transições de status para OS
- [ ] Implementar tela de backlog de sprint (lista de OSs por obra)
- [ ] Implementar tela de detalhe da OS

### Auditoria e Segurança
- [ ] Criar `tb_log_auditoria` no schema Prisma com campos: `tabela`, `operacao`, `id_registro`, `id_usuario`, `dados_antes`, `dados_depois`, `criado_em`
- [ ] Implementar gravação automática de auditoria nos endpoints críticos (obras, usuários, financeiro)
- [ ] Implementar 2FA TOTP (opcional por usuário, obrigatório para ADMIN_MASTER)
- [ ] Implementar lockout temporário após 5 tentativas de login falhas

### Feature Flags e Configurações
- [ ] Criar `tb_config_tenant` no schema (feature flags por construtora)
- [ ] Implementar leitura de feature flags no backend (ex: `modulo_qhs_ativo`, `modulo_os_ativo`)
- [ ] Criar tela de configurações do tenant no painel de clientes

### Relatórios
- [ ] Implementar endpoint `GET /api/relatorios/rdo/:obraId` — gera PDF do Relatório Diário de Obra
- [ ] Implementar endpoint `GET /api/relatorios/financeiro/:obraId` — exporta XLSX de financeiro

### DevOps e Infraestrutura
- [ ] Criar `.github/workflows/ci.yml` — lint + test em todo PR
- [ ] Criar `docker-compose.yml` para desenvolvimento local (PostgreSQL + backend + frontend)
- [ ] Criar `setup.md` com passos testados para rodar o projeto do zero

---

## 🔵 SPRINT 4+ — Diferenciais Competitivos (P4)
*Planejamento futuro.*

- [ ] Módulo QHS (NRs obrigatórias, bloqueios automáticos, checklists de segurança)
- [ ] Integração SINAPI para precificação de insumos
- [ ] BI Executivo completo (Curva S, earned value, margem por obra)
- [ ] App Mobile / PWA offline para canteiro de obras
- [ ] IA para geração automática de RDO
- [ ] Integração com ERPs (SAP, TOTVS)
- [ ] Storage externo para uploads (S3 ou Vercel Blob)
- [ ] Monitoramento e alertas (Sentry, Prometheus)

---

## ✅ O que já está implementado (referência)

### Backend (não refazer)
- ✅ Express + Prisma + PostgreSQL configurados
- ✅ JWT auth + bcrypt
- ✅ Middleware de autenticação e autorização RBAC
- ✅ CRUD obras, diário, tarefas, RH, financeiro (por obra), estoque, documentos
- ✅ Upload com Multer (diário, documentos)
- ✅ Paginação nas listagens principais
- ✅ Seed de dados para desenvolvimento

### Frontend (não refazer)
- ✅ Home, Login, Cadastro, ForgotPassword (NÃO ALTERAR)
- ✅ FormularioCompletoPáge (NÃO ALTERAR)
- ✅ Dashboard dinâmico por perfil
- ✅ Minhas Obras (`/obras`), detalhe da obra (`/obra/:id`)
- ✅ Calendário, Documentos, RH, Perfil
- ✅ PermissaoGuard e ProtectedRoute
- ✅ ImpersonacaoBanner

---

## 🎯 Critérios de Aceite por Sprint

### Sprint 0 (P0 — Bugs)
- [ ] Lint do frontend passa sem erros
- [ ] `JWT_SECRET` ausente causa falha no boot do backend (sem fallback)
- [ ] CORS configurado por allowlist
- [ ] `/clientes` ou funciona ou some do menu

### Sprint 1 (Gestão de Pessoas)
- [ ] Tela `/equipe` lista todos os funcionários do tenant com filtro por obra
- [ ] Membro da obra tem `valor_dia` e `id_papel` editáveis
- [ ] Funcionário com NR vencida aparece com alerta visual no RH

### Sprint 2 (Operação)
- [ ] `/financeiro` exibe consolidado do tenant (não mais UnderConstruction)
- [ ] `/materiais` exibe catálogo + saldo (não mais UnderConstruction)
- [ ] `/clientes` exibe lista de tenants para ADMIN_MASTER
- [ ] Funcionário consegue registrar horas; mestre consegue aprovar

### Sprint 3 (SaaS)
- [ ] OS pode ser criada, liberada e executada com ciclo de vida completo
- [ ] Auditoria persistida no banco para operações críticas
- [ ] CI/CD passando em todo PR

---

**Versão:** 2.0 (atualizado Jun 2026)
**Anterior:** v1.0 — Checklist teórico sem validação de código real
**Divisão de tarefas:** Ver [[08 - Divisao de Tarefas por Pessoa (Jun 2026)]]

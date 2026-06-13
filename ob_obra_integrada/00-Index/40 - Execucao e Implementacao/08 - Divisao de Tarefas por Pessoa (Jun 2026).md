---
tags: [equipe, divisao-tarefas, sprint, responsabilidades]
atualizado: 2026-06-12
---
# 👥 Divisão de Tarefas por Pessoa — Jun 2026

> **Contexto:** 5 pessoas disponíveis. Tarefas divididas por perfil técnico.
> Ordem de prioridade: **P0 → P1 (Pessoas) → P2 (Obras) → P3 (SaaS)**
> Referência completa: [[06 - Checklist de Implementacao]] | [[07 - Diagnostico e Plano de Acao (Jun 2026)]]

---

## 🧑‍💻 Pessoa 1 — Tech Lead / Backend Sênior
**Foco:** Segurança, arquitetura, qualidade de API, itens críticos transversais

### Sprint 0 — P0 (Semana 1)
- [ ] **[CRÍTICO]** Remover fallback `SUPER_SECRET` do `authMiddleware.js`
  - Arquivo: `backend/src/middlewares/authMiddleware.js`
  - Falhar o boot com mensagem clara se `JWT_SECRET` não existir no env
- [ ] **[CRÍTICO]** Configurar CORS com allowlist via env
  - Arquivo: `backend/src/server.js`
  - Ler `CORS_ORIGINS` do `.env` e passar como lista de domínios permitidos
- [ ] Adicionar **Helmet** e **CSP** ao `server.js`
  - Instalar: `npm install helmet --prefix backend`
  - Aplicar `app.use(helmet())` com configuração básica
- [ ] Adicionar **rate limiting** nas rotas de autenticação
  - Instalar: `npm install express-rate-limit --prefix backend`
  - Limitar: 10 tentativas de login por IP por 15 minutos
- [ ] Criar **middleware global de erro padronizado**
  - Formato de resposta: `{ success: false, error: { code, message } }`
  - Capturar erros Prisma e retornar HTTP adequado
- [ ] Criar `backend/.env.example` com todas as variáveis documentadas

### Sprint 1 — P1 (Semanas 2–3)
- [ ] Criar endpoint `GET /api/equipe` — lista funcionários do tenant com filtros
  - Parâmetros: `?id_obra=`, `?status=`, `?funcao=`, `?page=`, `?limit=`
  - Filtrar obrigatoriamente por `id_cliente` do usuário autenticado
- [ ] Criar endpoint `PATCH /api/obras/:id/equipe/:userId` — editar `valor_dia` e `id_papel`
- [ ] Criar endpoint `GET /api/rh/alertas-nr` — retornar funcionários com NR vencida
  - Lógica: ler campo `certificacoes` JSON e comparar datas de validade com `Date.now()`
- [ ] Verificar/implementar rota `POST /api/admin/impersonar/:id` (somente `ADMIN_MASTER`)

### Sprint 2 — P2 (Semanas 4–5)
- [ ] **Auditoria de tenant isolation:** revisar todos os controllers e garantir filtro por `id_cliente`
  - Focar em: `obraController`, `financeiroController`, `documentoController`, `rhController`
- [ ] Criar middleware global de erro (se não feito no Sprint 0)
- [ ] Criar `tb_apontamento` no Prisma schema e rodar migration
  ```
  model tb_apontamento {
    id_apontamento  Int       @id @default(autoincrement())
    id_usuario      Int
    id_obra         Int
    data            DateTime  @db.Date
    horas_trabalhadas Decimal @db.Decimal(5, 2)
    observacao      String?
    status          String    @default("PENDENTE")
    aprovado_por    Int?
    aprovado_em     DateTime?
    criado_em       DateTime  @default(now())
    tb_usuario      tb_usuario @relation(...)
    tb_obra         tb_obra    @relation(...)
  }
  ```

---

## 🧑‍💻 Pessoa 2 — Backend Pleno
**Foco:** APIs de negócio — Clientes (admin), Financeiro global, Materiais global

### Sprint 0 — P0 (Semana 1)
- [ ] Corrigir rota quebrada: `/obras/estoque/:idItem/historico`
  - Arquivo: `backend/src/routes/obraRoutes.js`
  - Remover `requireObraAccess` ou passar o param correto
- [ ] Corrigir upload de comprovante em `financeiroRoutes.js`
  - Substituir path literal `'uploads/financeiro'` pelo `UPLOADS_DIR` do storage service

### Sprint 1 — P1 (Semanas 2–3)
- [ ] Criar endpoints de certificações:
  - `POST /api/usuarios/:id/certificacoes` — adicionar/atualizar NR
  - `GET /api/usuarios/:id/certificacoes` — listar com status de validade calculado
  - Estrutura do item: `{ nome: "NR-35", emissao: "2024-01-10", validade: "2025-01-10", arquivo_url: "..." }`
- [ ] Criar endpoint `PATCH /api/usuarios/:id/certificacoes/:nr` — marcar como renovada

### Sprint 2 — P2 (Semanas 4–6)
- [ ] Criar endpoints de **Clientes / Tenants** (somente `ADMIN_MASTER`/`ADMIN`):
  - `GET /api/clientes` — listar tenants com paginação
  - `POST /api/clientes` — criar novo tenant
  - `PATCH /api/clientes/:id` — editar (nome, status, validade do plano)
  - `GET /api/clientes/:id/uso` — total de obras, usuários, armazenamento usado
- [ ] Criar endpoint de **Financeiro Consolidado**:
  - `GET /api/financeiro/consolidado` — agrupa por obra, com filtro de período
  - Retornar: `{ total_despesas, total_receitas, por_obra: [...] }`
- [ ] Criar endpoints de **Materiais Global**:
  - `GET /api/materiais/catalogo` — lista `tb_material` com filtros
  - `GET /api/materiais/saldo` — saldo por material, por obra, do tenant
- [ ] Criar endpoints de **Apontamento de Horas**:
  - `POST /api/apontamentos` — funcionário registra horas
  - `GET /api/apontamentos` — lista com filtros (`?id_obra=`, `?status=`, `?id_usuario=`)
  - `PATCH /api/apontamentos/:id/aprovar`
  - `PATCH /api/apontamentos/:id/rejeitar`

---

## 🎨 Pessoa 3 — Frontend Sênior
**Foco:** Novas telas globais, correção de bugs de lint e UX das features de pessoas

### Sprint 0 — P0 (Semana 1)
- [ ] Corrigir erro de parsing em `PlansPage.jsx`
  - Verificar o arquivo completo, corrigir o sintax error no JSX
- [ ] Corrigir `frontend/vite-project/.env.example`
  - Remover `DATABASE_URL`, `JWT_SECRET` e outras variáveis de backend
  - Manter apenas: `VITE_API_URL=http://localhost:5000`
- [ ] Resolver todos os `no-unused-vars` e warnings de hooks no lint
  - Rodar: `npm run lint --prefix frontend/vite-project` e corrigir arquivo por arquivo
- [ ] Corrigir auto-atribuição `body.quantidade_nova` em `ObraEstoque.jsx`

### Sprint 1 — P1 (Semanas 2–3)
- [ ] **Implementar tela `/equipe`** (remover `<UnderConstruction />`)
  - Componente: `frontend/vite-project/src/pages/Operational/GestaoEquipe.jsx`
  - UI: tabela de funcionários do tenant com colunas: Nome, Matrícula, Cargo, Obra(s), Valor/Dia, Status
  - Filtros: por obra (dropdown), por função (dropdown), por status
  - Ações por linha: "Vincular a obra", "Editar papel/valor_dia", "Ver perfil"
  - Conectar ao endpoint `GET /api/equipe`
- [ ] **Adicionar campos na aba Equipe da Obra** (`ObraTeam.jsx`)
  - Campo `valor_dia` editável inline por membro
  - Seletor de `id_papel` (dropdown com os papéis do `tb_papel`)
  - Conectar ao endpoint `PATCH /api/obras/:id/equipe/:userId`

### Sprint 2 — P2 (Semanas 4–6)
- [ ] **Implementar tela `/financeiro`** (remover `<UnderConstruction />`)
  - Cards de resumo: Total Despesas, Total Receitas, Saldo, Obras no Vermelho
  - Tabela com filtro por obra e período
  - Conectar ao endpoint `GET /api/financeiro/consolidado`
- [ ] **Implementar tela `/materiais`** (remover `<UnderConstruction />`)
  - Catálogo de materiais do tenant com saldo por obra
  - Filtro por material e por obra
  - Conectar aos endpoints `GET /api/materiais/catalogo` e `/api/materiais/saldo`
- [ ] **Implementar tela `/clientes`** com rota no `App.jsx`
  - Somente visível para `ADMIN_MASTER`/`ADMIN`
  - Tabela de tenants com status de assinatura, validade, nº de obras/usuários
  - Ações: ativar, suspender, editar plano

---

## 🎨 Pessoa 4 — Frontend Pleno
**Foco:** Features de pessoas no RH, NRs/certificações, apontamentos, UX de detalhe de obra

### Sprint 0 — P0 (Semana 1)
- [ ] Criar rota `/clientes` no `App.jsx` apontando para `<UnderConstruction titulo="Clientes" />`
  - Isso resolve o link quebrado no sidebar de forma imediata
  - Proteger com `permissao="gerenciar_clientes"`
- [ ] Auditar sidebar: garantir que itens sem rota definida mostrem `<UnderConstruction>` em vez de cair em redirect

### Sprint 1 — P1 (Semanas 2–3)
- [ ] **Gestão de Certificações/NRs no perfil do funcionário**
  - Localização: nova aba "Certificações" na tela de detalhe do funcionário (em `/rh`)
  - Componente: `CertificacoesNR.jsx`
  - UI: lista de NRs com badge colorido (verde = válida, amarelo = vence em 30 dias, vermelho = vencida)
  - Ações: adicionar NR (modal com campos: nome, data emissão, data validade, upload de arquivo), renovar, remover
  - Conectar aos endpoints de certificações
- [ ] **Painel de alertas de NR vencida**
  - Localização: card no dashboard do RH/Admin
  - Componente: `AlertasNR.jsx`
  - Lista de funcionários com NR vencida ou vencendo nos próximos 30 dias
  - Link direto para o perfil do funcionário
  - Conectar ao endpoint `GET /api/rh/alertas-nr`

### Sprint 2 — P2 (Semanas 4–6)
- [ ] **Tela de Apontamentos de Horas**
  - Localização: nova rota `/apontamentos` ou aba dentro de `/obra/:id`
  - Para funcionário: formulário de registro (data, horas, observação)
  - Para mestre/gerente: lista de apontamentos pendentes com botão de aprovar/rejeitar
  - Status visual: badge PENDENTE (cinza), APROVADO (verde), REJEITADO (vermelho)
  - Conectar aos endpoints de apontamento
- [ ] Refatorar aba "Diário" em `ObraDiary.jsx` para separar visualmente o diário do apontamento de horas
  - Diário: registros descritivos com foto/GPS (atual)
  - Apontamento: horas trabalhadas por funcionário (novo)

---

## 🔧 Pessoa 5 — Fullstack / DevOps
**Foco:** Schema/banco de dados, migrations, infraestrutura básica, documentação técnica, suporte transversal

### Sprint 0 — P0 (Semana 1)
- [ ] Criar `tb_log_auditoria` no `schema.prisma`
  ```prisma
  model tb_log_auditoria {
    id_log      Int      @id @default(autoincrement())
    tabela      String
    operacao    String   // INSERT | UPDATE | DELETE
    id_registro String
    id_usuario  Int?
    dados_antes Json?
    dados_apos  Json?
    criado_em   DateTime @default(now())
    ip_origem   String?
  }
  ```
  - Rodar `npx prisma db push` e validar
- [ ] Criar `backend/.env.example` com estrutura:
  ```
  DATABASE_URL=postgresql://user:pass@localhost:5432/obra_integrada
  JWT_SECRET=sua-chave-secreta-longa-aqui
  PORT=5000
  CORS_ORIGINS=http://localhost:5173
  NODE_ENV=development
  ```
- [ ] Criar `setup.md` com passos testados: clone, `npm run install:all`, configurar `.env`, `db push`, `seed`, `dev`

### Sprint 1 — P1 (Semanas 2–3)
- [ ] Verificar se campo `certificacoes` JSON em `tb_usuario` é suficiente para NRs
  - Se precisar de consultas/filtros por NR: criar `tb_certificacao` separada com campos tipados
  - Proposta de schema:
    ```prisma
    model tb_certificacao {
      id_certificacao Int       @id @default(autoincrement())
      id_usuario      Int
      nome            String    // "NR-35", "NR-10", etc.
      data_emissao    DateTime? @db.Date
      data_validade   DateTime? @db.Date
      arquivo_url     String?
      criado_em       DateTime  @default(now())
      tb_usuario      tb_usuario @relation(...)
    }
    ```
  - Apresentar proposta para Pessoa 1 (Tech Lead) antes de implementar
- [ ] Criar índices necessários após novas tabelas:
  - `tb_certificacao`: índice em `id_usuario` e em `data_validade`
  - `tb_apontamento`: índice em `id_obra`, `id_usuario`, `data`, `status`

### Sprint 2 — P2 (Semanas 4–6)
- [ ] Criar tabela `tb_apontamento` no schema (coordenar com Pessoa 1)
- [ ] Criar migration e rodar em ambiente local e de staging
- [ ] Criar `docker-compose.yml` básico para desenvolvimento local:
  ```yaml
  services:
    db:
      image: postgres:15
      environment:
        POSTGRES_DB: obra_integrada
        POSTGRES_USER: dev
        POSTGRES_PASSWORD: dev123
      ports: ["5432:5432"]
    backend:
      build: ./backend
      env_file: ./backend/.env
      ports: ["5000:5000"]
      depends_on: [db]
    frontend:
      build: ./frontend/vite-project
      ports: ["5173:5173"]
  ```
- [ ] Criar `.github/workflows/ci.yml` com jobs de lint e testes:
  ```yaml
  on: [pull_request]
  jobs:
    lint-frontend:
      runs-on: ubuntu-latest
      steps:
        - npm run lint --prefix frontend/vite-project
    test-backend:
      runs-on: ubuntu-latest
      steps:
        - npm test --prefix backend
  ```
- [ ] Documentar no `README.md` os comandos principais de desenvolvimento

### Sprint 3 — P3 (Semanas 7+)
- [ ] Criar `tb_ordem_servico` no schema (coordenar com Pessoa 1):
  - Campos: `id_obra`, `descricao`, `id_responsavel`, `status`, `horas_orcadas`, `horas_realizadas`, `bom_materiais` (JSON)
  - Status enum: `PLANEJADA | LIBERADA | EM_EXECUCAO | CONCLUIDA | APROVADA | IMPEDIDA`
- [ ] Criar `tb_config_tenant` para feature flags:
  ```prisma
  model tb_config_tenant {
    id_config    Int      @id @default(autoincrement())
    id_cliente   Int      @unique
    modulo_os    Boolean  @default(false)
    modulo_qhs   Boolean  @default(false)
    modulo_bi    Boolean  @default(false)
    criado_em    DateTime @default(now())
    tb_cliente   tb_cliente @relation(...)
  }
  ```

---

## 📅 Cronograma Resumido

| Semana | Pessoa 1 | Pessoa 2 | Pessoa 3 | Pessoa 4 | Pessoa 5 |
|--------|----------|----------|----------|----------|----------|
| **1 (P0)** | Auth/CORS/Helmet/RateLimit | Bugs de rota e upload | Lint/PlansPage/.env.example | Rota /clientes temporária | Schema log_auditoria + setup.md |
| **2–3 (P1)** | API /equipe + valor_dia + alertas-NR | API certificações | Tela /equipe + ObraTeam | NRs no RH + alertas | Tabela tb_certificacao + índices |
| **4–5 (P2)** | Tenant isolation audit + tb_apontamento | APIs clientes/financeiro/materiais/apontamentos | Telas /financeiro + /materiais + /clientes | Tela de apontamentos | Docker + CI + tb_apontamento migration |
| **6+ (P3)** | Middleware padronizado + 2FA plano | Relatórios PDF/XLSX | UX/polimento das telas | Fluxo apontamento completo | OS schema + feature flags |

---

## 🤝 Regras de Colaboração

1. **Ninguém altera** Home, Login, Cadastro, ForgotPassword ou FormularioCompletoPáge
2. **Pessoa 5 é a guardiã do schema:** qualquer nova tabela precisa de aprovação dela antes de rodar migration
3. **Pessoa 1 faz code review** de todos os PRs de backend antes de merge
4. **Pessoa 3 faz code review** de todos os PRs de frontend antes de merge
5. **Todo PR deve ter:** título descritivo, checklist de testes manuais feitos, screenshot se mudança visual
6. **Toda nova rota de API** deve ser adicionada ao `backend/.env.example` se usar nova variável de ambiente

---

**Versão:** 1.0
**Data:** Junho de 2026
**Referências:** [[06 - Checklist de Implementacao]] | [[07 - Diagnostico e Plano de Acao (Jun 2026)]]

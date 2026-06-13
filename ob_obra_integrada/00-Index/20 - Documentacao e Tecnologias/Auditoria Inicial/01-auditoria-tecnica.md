# Fase 1 ÔÇö Auditoria T├®cnica Completa

**Projeto:** Obra Integrada
**Data:** 24 de abril de 2026
**Escopo:** Monorepo fullstack (backend Express/Prisma + frontend React/Vite)
**Respons├ível pela auditoria:** Arquitetura de software (consultoria externa)
**Dura├º├úo do desenvolvimento at├® aqui:** ~24 meses acumulados (projeto acad├¬mico)

---

## Sum├írio executivo

A plataforma Obra Integrada est├í **operacional em ambiente local** e j├í implementa fluxos cr├¡ticos (autentica├º├úo, cadastro de obras, di├írio de obra com GPS, tarefas, financeiro, RH e admin). A base arquitetural ÔÇö Express 5 + Prisma 5 + PostgreSQL no backend, React 19 + Vite 7 + Tailwind 4 no frontend ÔÇö ├® moderna e adequada para deploy serverless na Vercel.

Contudo, a auditoria identificou **6 problemas cr├¡ticos de seguran├ºa**, **duplica├º├úo estrutural (pastas `view/` legada convivendo com `pages/` moderna)**, **aus├¬ncia de testes de integra├º├úo reais** (os existentes s├úo mocks), **acoplamento direto a Prisma nos controllers** e **bloqueadores concretos para produ├º├úo na Vercel** (uso de `multer.diskStorage`, CORS permissivo total, JWT secret com fallback hardcoded). O d├®bito t├®cnico ├® significativo mas **gerenci├ível em horizonte de 6 meses** se tratado de forma incremental, como detalhado no artefato 03 desta auditoria.

N├úo existem problemas bloqueadores para o prosseguimento do roadmap de 24 meses ÔÇö h├í, sim, **5 a├º├Áes de higiene imediata** (Semana 1) que devem preceder qualquer nova funcionalidade: remover `dev.db` do Git, apagar `server.js` da raiz, criar `.env.example`, criar `.vercelignore`, e corrigir o fallback do `JWT_SECRET`.

---

## 1.1. Invent├írio estrutural

### 1.1.1. Vis├úo geral do monorepo

```
obra-integrada/
Ôö£ÔöÇÔöÇ .gitignore                      # raiz (ignora node_modules, .env, /generated/prisma)
Ôö£ÔöÇÔöÇ LICENSE.md                      # MIT (aparentemente herdado do template TailAdmin)
Ôö£ÔöÇÔöÇ README.md                       # desatualizado (menciona "JSON mock, futuro MySQL")
Ôö£ÔöÇÔöÇ banner.png                      # 1.4 MB commitado ÔÇö sem refer├¬ncia no README
Ôö£ÔöÇÔöÇ package.json                    # raiz ÔÇö orquestrador (concurrently), mas com deps duplicadas
Ôö£ÔöÇÔöÇ package-lock.json               # 64 KB
Ôö£ÔöÇÔöÇ server.js                       # ARQUIVO OBSOLETO ÔÇö duplica backend/src/server.js
Ôö£ÔöÇÔöÇ backend/                        # API Node.js
Ôö£ÔöÇÔöÇ frontend/vite-project/          # SPA React
ÔööÔöÇÔöÇ documentacao_banca/             # 1 arquivo RELATORIO_TECNICO.md (32 linhas, superficial)
```

**Observa├º├Áes imediatas:**

| Item | Status | Coment├írio |
|---|---|---|
| `server.js` na raiz | ÔØî ├ôrf├úo | Vers├úo antiga com apenas 2 rotas; n├úo ├® importado em lugar nenhum |
| `banner.png` | ÔÜá´©Å 1.4 MB no Git | Deveria estar em CDN ou referenciado por URL externa |
| `package.json` raiz | ÔÜá´©Å Deps duplicadas | `@prisma/client`, `prisma`, `bcryptjs`, `cors`, `express`, `jsonwebtoken` est├úo em ambos `package.json` raiz e `backend/package.json` |
| `documentacao_banca/` | ÔÜá´©Å Superficial | RELATORIO_TECNICO.md com 32 linhas; n├úo substitui documenta├º├úo t├®cnica real |

### 1.1.2. Estrutura do backend

```
backend/
Ôö£ÔöÇÔöÇ .gitignore
Ôö£ÔöÇÔöÇ check_db.mjs                    # ├ôRF├âO ÔÇö debug manual de conex├úo
Ôö£ÔöÇÔöÇ coverage/tmp/                   # arquivos .json de c8 COMMITADOS (erro)
Ôö£ÔöÇÔöÇ package.json
Ôö£ÔöÇÔöÇ package-lock.json
Ôö£ÔöÇÔöÇ seed_bulk.mjs                   # ├ôRF├âO ÔÇö vers├úo antiga de seed
Ôö£ÔöÇÔöÇ seed_enrich.mjs                 # ├ôRF├âO ÔÇö vers├úo antiga de seed
Ôö£ÔöÇÔöÇ seed_obras_detalhadas.mjs       # ├ôRF├âO
Ôö£ÔöÇÔöÇ seed_out.txt                    # ├ôRF├âO ÔÇö log de sa├¡da de seed
Ôö£ÔöÇÔöÇ seed_tarefas_paginacao.mjs      # ├ôRF├âO
Ôö£ÔöÇÔöÇ seed_vanguarda_rico.mjs         # ├ôRF├âO
Ôö£ÔöÇÔöÇ standalone_users_server.js      # ├ôRF├âO ÔÇö servidor alternativo de 125 linhas n├úo usado
Ôö£ÔöÇÔöÇ strip_maps.js                   # ├ôRF├âO ÔÇö script de limpeza de schema
Ôö£ÔöÇÔöÇ tests/
Ôöé   Ôö£ÔöÇÔöÇ api.test.js                 # 40 linhas ÔÇö testes MOCK (n├úo de integra├º├úo)
Ôöé   ÔööÔöÇÔöÇ rh.test.js                  # 65 linhas ÔÇö testes MOCK
Ôö£ÔöÇÔöÇ uploads/                        # pasta com .gitignore correto (*, !.gitignore, !.gitkeep)
Ôö£ÔöÇÔöÇ vercel.json
ÔööÔöÇÔöÇ src/
    Ôö£ÔöÇÔöÇ config/
    Ôöé   Ôö£ÔöÇÔöÇ prisma.js               # singleton simples
    Ôöé   ÔööÔöÇÔöÇ storageService.js       # abstra├º├úo de storage (preparada p/ S3 futuro)
    Ôö£ÔöÇÔöÇ controllers/                # 10 arquivos (ver 1.1.3)
    Ôö£ÔöÇÔöÇ database/
    Ôöé   Ôö£ÔöÇÔöÇ obras.json              # MOCK LEGADO (42 linhas)
    Ôöé   ÔööÔöÇÔöÇ users.json              # MOCK LEGADO (110 linhas, com senhas hasheadas)
    Ôö£ÔöÇÔöÇ middlewares/
    Ôöé   Ôö£ÔöÇÔöÇ authMiddleware.js       # 34 linhas
    Ôöé   Ôö£ÔöÇÔöÇ authorizationMiddleware.js  # 198 linhas ÔÇö matriz RBAC
    Ôöé   ÔööÔöÇÔöÇ uploadMiddleware.js     # 113 linhas ÔÇö multer diskStorage
    Ôö£ÔöÇÔöÇ models/
    Ôöé   Ôö£ÔöÇÔöÇ obra.js                 # 89 linhas ÔÇö wrapper fino de Prisma
    Ôöé   ÔööÔöÇÔöÇ user.js                 # 37 linhas ÔÇö wrapper fino de Prisma
    Ôö£ÔöÇÔöÇ prisma/
    Ôöé   Ôö£ÔöÇÔöÇ dev.db                  # ÔØî SQLite COMMITADO (114 KB) ÔÇö obsoleto, usa Postgres
    Ôöé   Ôö£ÔöÇÔöÇ schema.prisma           # 326 linhas, 21 models
    Ôöé   Ôö£ÔöÇÔöÇ schema.prisma.postgres  # ÔØî DUPLICADO/DESATUALIZADO (192 linhas, 14 models)
    Ôöé   Ôö£ÔöÇÔöÇ seed.js                 # oficial
    Ôöé   ÔööÔöÇÔöÇ migrations/
    Ôöé       ÔööÔöÇÔöÇ 20260415002034_advanced_features/migration.sql  # ├ÜNICA migration
    Ôö£ÔöÇÔöÇ routes/                     # 7 arquivos (ver 1.1.3)
    Ôö£ÔöÇÔöÇ utils/
    Ôöé   ÔööÔöÇÔöÇ validation.js           # 49 linhas ÔÇö validarCPF, validarEmail
    Ôö£ÔöÇÔöÇ seed.js                     # poss├¡vel ├│rf├úo
    Ôö£ÔöÇÔöÇ prisma.config.ts            # config do CLI do Prisma
    ÔööÔöÇÔöÇ server.js                   # entry point atual
```

### 1.1.3. Mapeamento por m├│dulo

A tabela a seguir conecta cada m├│dulo de neg├│cio aos seus controllers, rotas, middlewares, models e ao frontend correspondente. Serve como refer├¬ncia ├║nica para a equipe localizar qualquer funcionalidade.

#### M├│dulo **Obras**

| Camada | Arquivo | Linhas | Observa├º├úo |
|---|---|---|---|
| Controller | `backend/src/controllers/obraController.js` | 602 | Cr├¡tico ÔÇö maior controller do projeto |
| Rota | `backend/src/routes/obraRoutes.js` | 58 | Usa `requireObraAccess` |
| Model | `backend/src/models/obra.js` | 89 | Wrapper de Prisma |
| Middleware | `authMiddleware`, `authorizationMiddleware` | ÔÇö | ÔÇö |
| P├ígina FE (moderna) | `frontend/vite-project/src/pages/Obra/ObraPage.jsx` | 161 | Tabs simples |
| P├ígina FE (listagem) | `frontend/vite-project/src/pages/Obras/MinhasObrasPage.jsx` | ÔÇö | Prote├º├úo via `PermissaoGuard(ver_obras)` |
| Wizard | `frontend/vite-project/src/components/Dashboard/NovaObraWizard.jsx` | ÔÇö | ÔÇö |
| Rotas protegidas | `/obras`, `/obra/:id` | ÔÇö | ÔÇö |

**Funcionalidades cobertas:** CRUD de obras, equipe da obra (adicionar/remover/atualizar membros), estoque por obra (CRUD + hist├│rico de movimenta├º├Áes), documentos da obra (upload), org-chart, filtragem RBAC de dados financeiros em `getObraById`.

#### M├│dulo **Di├írio**

| Camada | Arquivo | Linhas | Observa├º├úo |
|---|---|---|---|
| Controller | `backend/src/controllers/diarioController.js` | 309 | Bom padr├úo: helper `registrarLog()` de auditoria |
| Rota | `backend/src/routes/diarioRoutes.js` | 79 | Pipeline exemplar: auth ÔåÆ requireObraAccess ÔåÆ requirePermissao ÔåÆ upload |
| Middleware | `uploadMiddleware` (subpasta `diario/`) | ÔÇö | ÔÇö |
| P├ígina FE | `frontend/vite-project/src/pages/Obra/sections/ObraDiario.jsx` | ÔÇö | Acessada via tabs de `ObraPage` |

**Funcionalidades cobertas:** listagem paginada, cria├º├úo com foto + GPS + `status_auditoria`, exclus├úo com log de auditoria, edi├º├úo de descri├º├úo, PATCH para auditoria (AUTORIZADO/REPROVADO).

#### M├│dulo **Tarefas**

| Camada | Arquivo | Linhas | Observa├º├úo |
|---|---|---|---|
| Controller | `backend/src/controllers/tarefaController.js` | 233 | Opera├º├Áes sem `$transaction` ÔÇö risco de inconsist├¬ncia em re-sync de usu├írios |
| Rota | `backend/src/routes/tarefaRoutes.js` | 59 | Duplica├º├úo: `GET /tarefas` (global) e `GET /obras/:id/tarefas` |
| P├ígina FE | `frontend/vite-project/src/pages/Calendar.tsx` | ÔÇö | Usa FullCalendar (pesado ÔÇö ~200 KB) |

**Funcionalidades cobertas:** CRUD de tarefas, atualiza├º├úo de status, atribui├º├úo a m├║ltiplos usu├írios via `tb_tarefa_usuario`, percentual de conclus├úo.

#### M├│dulo **Financeiro**

| Camada | Arquivo | Linhas | Observa├º├úo |
|---|---|---|---|
| Controller | `backend/src/controllers/financeiroController.js` | 146 | Fun├º├úo `getOrgChart` DUPLICADA do `obraController` |
| Rota | `backend/src/routes/financeiroRoutes.js` | 56 | ÔØî `DELETE /financeiro/:id` sem `requireObraAccess` |
| P├ígina FE | `frontend/vite-project/src/pages/Obra/sections/ObraFinanceiro.jsx` | ÔÇö | ÔÇö |

**Funcionalidades cobertas:** listagem, cria├º├úo com comprovante, exclus├úo. Upload via multer.

#### M├│dulo **RH**

| Camada | Arquivo | Linhas | Observa├º├úo |
|---|---|---|---|
| Controller | `backend/src/controllers/rhController.js` | 199 | Ô£à Usa `validarCPF`/`validarEmail` de utils |
| Rota | `backend/src/routes/rhRoutes.js` | 42 | Coerente ÔÇö permiss├úo `gerenciar_usuarios` uniforme |
| P├ígina FE | `frontend/vite-project/src/pages/Operational/GestaoRH.jsx` | 327 | Tabela + modal + filtros em um ├║nico arquivo |

**Funcionalidades cobertas:** listagem paginada com busca, cadastro de funcion├írio (auto-gera matr├¡cula `MAT-YYYY-NNN`), atualiza├º├úo, inativa├º├úo (soft delete, bloqueia PROPRIETARIO).

#### M├│dulo **Admin**

| Camada | Arquivo | Linhas | Observa├º├úo |
|---|---|---|---|
| Controller | `backend/src/controllers/adminController.js` | 203 | ÔØî `getGlobalMetrics` sem `requireRole` na rota |
| Rota | `backend/src/routes/adminRoutes.js` | 40 | RBAC inconsistente entre endpoints |
| P├ígina FE | Dashboard de m├®tricas e impersona├º├úo via `AuthContext` | ÔÇö | ÔÇö |

**Funcionalidades cobertas:** m├®tricas globais, listagem de clientes, auditoria de profissionais, rentabilidade macro simulada (SaaS mock), health check, impersona├º├úo de usu├írios, inbox de di├írios pendentes.

#### M├│dulo **Users / Auth**

| Camada | Arquivo | Linhas | Observa├º├úo |
|---|---|---|---|
| Controller | `backend/src/controllers/userController.js` | 277 | Fun├º├úo `formularioCompleto` com 87 linhas ÔÇö refatorar |
| Rota | `backend/src/routes/userRoutes.js` | 27 | 3 endpoints p├║blicos (register, login, formulario) + 6 protegidos |
| Model | `backend/src/models/user.js` | 37 | ÔÇö |
| Middleware | `authMiddleware.js` | 34 | JWT 8h, sem refresh token |
| Context FE | `frontend/vite-project/src/context/AuthContext.jsx` | ÔÇö | localStorage com `obraToken`, `obraUser`, impersona├º├úo via `originalAdminUser` |
| P├íginas FE | `view/Home.jsx`, `view/FormularioCompletoPage.jsx` (570 linhas) | ÔÇö | Pasta `view/` ├® LEGADA |

#### M├│dulo **Operacional (stats / weather)**

| Camada | Arquivo | Linhas | Observa├º├úo |
|---|---|---|---|
| Controller | `backend/src/controllers/operationalController.js` | 102 | `getWeatherMock` ├® placeholder ÔÇö bom candidato a feature IA |
| Rotas | Inclu├¡das em `userRoutes.js` (`/operational/stats`, `/operational/weather`) | ÔÇö | ÔÇö |
| P├ígina FE | `frontend/vite-project/src/pages/Operational/MeuPerfilCV.jsx` | ÔÇö | ÔÇö |

#### M├│dulo **Documentos / Formul├írio**

| Camada | Arquivo | Linhas | Observa├º├úo |
|---|---|---|---|
| Controller | `documentoController.js` | 61 | Muito simples ÔÇö 2 fun├º├Áes |
| Controller | `formularioController.js` | 14 | ÔØî ├ôrf├úo ÔÇö ├║nico m├®todo `atualizarPerfil` ├® wrapper fino de `UserModel.update()` |

### 1.1.4. Arquivos ├│rf├úos, duplicados ou legados

Lista consolidada, com recomenda├º├úo por item. A a├º├úo de remo├º├úo ser├í detalhada no artefato 03 (Plano de limpeza ÔÇö Semana 1-2).

| Arquivo / Pasta | Tipo | Tamanho | Recomenda├º├úo |
|---|---|---|---|
| `server.js` (raiz) | ├ôrf├úo | ~1.4 KB | Deletar ÔÇö n├úo ├® importado em lugar nenhum |
| `banner.png` (raiz) | Pesado | 1.4 MB | Mover para CDN / `frontend/public/` |
| `backend/standalone_users_server.js` | ├ôrf├úo | 125 linhas | Deletar |
| `backend/strip_maps.js` | ├ôrf├úo | 7 linhas | Deletar ou mover para `/scripts/` |
| `backend/check_db.mjs` | ├ôrf├úo | 10 linhas | Deletar ou mover para `/scripts/` |
| `backend/seed_bulk.mjs` | ├ôrf├úo | 6 KB | Deletar |
| `backend/seed_enrich.mjs` | ├ôrf├úo | 5 KB | Deletar |
| `backend/seed_obras_detalhadas.mjs` | ├ôrf├úo | 6 KB | Deletar |
| `backend/seed_tarefas_paginacao.mjs` | ├ôrf├úo | 7 KB | Deletar |
| `backend/seed_vanguarda_rico.mjs` | ├ôrf├úo | 9 KB | Consolidar em `src/prisma/seed.js` |
| `backend/seed_out.txt` | ├ôrf├úo | 22 KB | Deletar (log de sa├¡da) |
| `backend/src/seed.js` | Duplicado | ÔÇö | Consolidar com `backend/src/prisma/seed.js` |
| `backend/src/database/obras.json` | Legado | 920 B | Deletar ÔÇö mock pr├®-Prisma |
| `backend/src/database/users.json` | Legado | 3 KB | Deletar ÔÇö cont├®m senhas hasheadas em reposit├│rio |
| `backend/src/prisma/dev.db` | Legado cr├¡tico | 114 KB | Deletar + adicionar ao `.gitignore` |
| `backend/src/prisma/schema.prisma.postgres` | Duplicado | 192 linhas | Deletar ÔÇö vers├úo antiga do schema |
| `backend/coverage/tmp/*.json` | Commitado indevido | ~4 arquivos | Adicionar `coverage/` ao `.gitignore` |
| `frontend/vite-project/.vite/deps/` | Cache Vite | Commitado | Adicionar `.vite/` ao `.gitignore` |
| `frontend/vite-project/src/view/` | Legado | 23 arquivos | Consolidar em `pages/` e `components/` gradualmente |
| `frontend/vite-project/src/controllers/ObraController.js` | ├ôrf├úo | ÔÇö | Deletar ÔÇö padr├úo MVC em mem├│ria n├úo integrado ├á API |
| `frontend/vite-project/src/models/ObraModel.js` | ├ôrf├úo | ÔÇö | Deletar ÔÇö prot├│tipo em mem├│ria |

---

## 1.2. An├ílise do schema Prisma

### 1.2.1. Entidades e relacionamentos

O schema (`backend/src/prisma/schema.prisma`, 326 linhas) define **21 modelos** em conven├º├úo de nomenclatura MySQL/SQL Server (`tb_*`, snake_case). Essa conven├º├úo ├® v├ílida, por├®m **diverge do padr├úo recomendado do Prisma** (PascalCase singular ÔÇö `User`, `Obra`) e dificulta a gera├º├úo autom├ítica de tipos TypeScript leg├¡veis (`prisma.tb_usuario` vs. `prisma.user`).

Entidades core:

| Categoria | Modelos | Cardinalidade |
|---|---|---|
| **Tenancy** | `tb_cliente`, `tb_obra_cliente` | 1:N via tabela associativa |
| **Obras** | `tb_obra`, `tb_status`, `tb_etapa`, `tb_papel` | Obra ├® raiz; etapa depende de obra |
| **Pessoas** | `tb_usuario`, `tb_usuario_obra` | M:N entre usu├írio e obra |
| **Materiais** | `tb_material`, `tb_fabricante`, `tb_material_fabricante`, `tb_etapa_material`, `tb_requisicao`, `tb_material_requisitado` | Cat├ílogo global + requisi├º├Áes por obra |
| **Opera├º├úo** | `tb_diario_obra`, `tb_tarefa`, `tb_tarefa_usuario`, `tb_documento`, `tb_estoque_obra`, `tb_movimentacao_estoque` | Opera├º├úo di├íria da obra |
| **Financeiro** | `tb_financeiro_obra` | Receitas/despesas por obra |

H├í ainda refer├¬ncia a `tb_log_auditoria` dentro do `diarioController.js` via helper `registrarLog()` ÔÇö **mas essa tabela n├úo existe no schema**. O helper tem fallback silencioso (graceful) em `.catch(() => ...)`, mas o log de auditoria efetivamente n├úo ├® persistido. **Este ├® um falso positivo de feature audit├ível** ÔÇö prioridade alta de corre├º├úo.

### 1.2.2. ├ìndices presentes

```prisma
@@index([id_obra], map: "idx_etapa_obra")
@@index([id_obra], map: "idx_estoque_obra")
@@index([id_obra], map: "idx_req_obra")
@@index([id_usuario_responsavel], map: "idx_obra_usuario")
@@index([id_obra], map: "idx_diario_obra")
@@index([id_usuario], map: "idx_diario_usuario")
@@index([id_obra], map: "idx_tarefa_obra")
```

**Avalia├º├úo:** 7 ├¡ndices em FKs de filtragem por obra. Todos leg├¡timos ÔÇö nenhum redundante. Campos `@unique` (`email`, `cpf`, `username`, `matricula`, `cpf_cnpj`) criam ├¡ndices implicitamente.

**├ìndices faltantes (recomendados):**

| Entidade | Campo | Motivo |
|---|---|---|
| `tb_financeiro_obra` | `id_obra` | Listagem financeira ├® filtrada por obra em toda consulta |
| `tb_diario_obra` | `data_registro` | Pagina├º├úo por data (uso atual `orderBy: { data_registro: 'desc' }`) |
| `tb_tarefa` | `prazo` | Dashboards por deadline |
| `tb_usuario` | `role` | Filtros admin por role |
| `tb_usuario` | `status` | Filtros "ATIVO" s├úo frequentes em `rhController` |

### 1.2.3. Inconsist├¬ncias entre `schema.prisma` e `schema.prisma.postgres`

O arquivo `schema.prisma.postgres` ├® uma **vers├úo antiga** do schema (14 models contra 21 atuais), faltando:

- `tb_financeiro_obra`
- `tb_movimentacao_estoque`
- `tb_estoque_obra`
- `tb_diario_obra`
- `tb_tarefa`, `tb_tarefa_usuario`
- `tb_documento`

Tamb├®m usa anota├º├Áes distintas (`@db.VarChar` vs. `String`). Trata-se de **c├│digo morto perigoso** ÔÇö se algu├®m rodar `prisma generate --schema=src/prisma/schema.prisma.postgres` por engano, o cliente Prisma gerado fica incompleto.

**A├º├úo:** Deletar o arquivo na Semana 1.

### 1.2.4. Problemas de modelagem (FKs e nullability)

#### FKs com `onDelete: NoAction` em composi├º├Áes

```prisma
tb_etapa.tb_obra        ÔåÆ onDelete: NoAction    # ÔØî etapa ├│rf├ú se obra for deletada
tb_requisicao.tb_obra   ÔåÆ onDelete: NoAction    # ÔØî requisi├º├úo ├│rf├ú
tb_usuario_obra.tb_obra ÔåÆ onDelete: NoAction    # ÔØî v├¡nculo ├│rf├úo
tb_usuario_obra.tb_usuario ÔåÆ onDelete: NoAction # ÔØî v├¡nculo ├│rf├úo
```

Em contraste, estas entidades est├úo **corretamente configuradas** com `Cascade`:

```prisma
tb_estoque_obra.tb_obra     ÔåÆ onDelete: Cascade   Ô£ô
tb_diario_obra.tb_obra      ÔåÆ onDelete: Cascade   Ô£ô
tb_tarefa.tb_obra           ÔåÆ onDelete: Cascade   Ô£ô
tb_documento.tb_obra        ÔåÆ onDelete: Cascade   Ô£ô
tb_financeiro_obra.tb_obra  ÔåÆ onDelete: Cascade   Ô£ô
tb_etapa_material.tb_etapa  ÔåÆ onDelete: Cascade   Ô£ô
```

**Impacto pr├ítico:** O `obraController.deletarObra()` faz um `$transaction` manual (`obraController.js:346`) deletando v├¡nculos um a um **justamente porque o Cascade n├úo est├í no schema**. Isso ├® workaround ÔÇö deveria estar declarado.

#### Campos `nullable` que deveriam ser obrigat├│rios

| Entidade | Campo | Problema |
|---|---|---|
| `tb_usuario` | `senha` (nullable) | Conta pode existir sem senha v├ílida ÔÇö vetor de bypass |
| `tb_usuario` | `email` (nullable + @unique) | Permite usu├írio sem e-mail; m├║ltiplos `NULL` s├úo aceitos em `@unique` |
| `tb_usuario` | `username` (nullable + @unique) | Idem |
| `tb_usuario` | `role` (default "USER") | OK ÔÇö default seguro |
| `tb_etapa` | `nome` (nullable) | Etapa sem nome n├úo faz sentido |
| `tb_obra` | `nome` (NOT NULL) | Ô£ô OK |
| `tb_documento` | `url` (NOT NULL) | Ô£ô OK |
| `tb_diario_obra` | `descricao` (NOT NULL) | Ô£ô OK |

#### Inconsist├¬ncia de tipos num├®ricos

- `tb_obra.area_terreno`, `area_construida` s├úo `Float?` ÔÇö mas `valor_orcado`, `custo_atual`, `orcamento_material` s├úo `Decimal?` (10,2). Mistura de tipos para campos similares. Recomenda-se padronizar em `Decimal` para tudo que envolve dinheiro, ├írea ou quantidade.

### 1.2.5. Modelos sem uso aparente nos controllers

Grep por `prisma.<modelo>` em `backend/src/controllers/` indicou:

| Modelo | Uso detectado | Observa├º├úo |
|---|---|---|
| `tb_fabricante` | ÔØî Nenhum | Modelo ├│rf├úo ÔÇö cat├ílogo definido mas n├úo exposto |
| `tb_material` | ÔØî Nenhum | Idem ÔÇö n├úo h├í CRUD de materiais |
| `tb_material_fabricante` | ÔØî Nenhum | Apenas estrutura ÔÇö n├úo consumido |
| `tb_etapa_material` | ÔØî Nenhum | Idem |
| `tb_material_requisitado` | ÔØî Nenhum | Idem |
| `tb_papel` | ÔÜá´©Å Indireto | Usado via include em obra, mas sem CRUD |
| `tb_status` | ÔÜá´©Å Indireto | Idem |

**Implica├º├úo:** O schema antecipa um **m├│dulo de materiais/requisi├º├Áes que ainda n├úo foi constru├¡do**. ├ë um sinal positivo de planejamento, mas o schema n├úo deveria ficar "flutuando" sem controller. Ou se implementa o m├│dulo (roadmap da Fase 2), ou se remove o schema para n├úo confundir.

### 1.2.6. Migrations

Apenas **1 migration** em `backend/src/prisma/migrations/20260415002034_advanced_features/migration.sql`, datada de 15/04/2026. Isso sugere que o projeto passou a maior parte do tempo usando `prisma db push` (sync direto) em vez de migrations versionadas ÔÇö pr├ítica aceit├ível em dev, **inadequada em produ├º├úo**.

**Recomenda├º├úo:** A partir da primeira release em staging, toda altera├º├úo de schema deve gerar migration nomeada (`npx prisma migrate dev --name <nome>`), e o deploy deve usar `prisma migrate deploy` (detalhado no ADR-010).

---

## 1.3. An├ílise de qualidade de c├│digo

### 1.3.1. Padr├Áes de resposta de API

**N├úo h├í padr├úo uniforme de resposta.** Observa├º├Áes:

```javascript
// userController.js:19
return res.status(409).json({ erro: 'E-mail j├í cadastrado' });

// obraController.js:402
return res.status(409).json({ error: 'Usu├írio j├í est├í nesta obra' });

// adminController.js:52
return res.status(500).json({ erro: 'Falha ao coletar m├®tricas globais' });

// diarioController.js
return res.status(200).json({ data: registros, meta: { page, limit, total } });

// tarefaController.js (listar)
return res.status(200).json(tarefas);
```

Misturas detectadas:
- **Chave do erro**: `erro` (portugu├¬s) ├ù `error` (ingl├¬s) ├ù `mensagem`
- **Presen├ºa de `data`/`meta`**: alguns endpoints retornam `{ data, meta }` (di├írio, obras paginadas), outros retornam array cru (tarefas global)
- **C├│digos HTTP**: geralmente corretos, mas alguns casos retornam 500 quando deveria ser 400 ou 422

**Princ├¡pio violado:** *Uniform Interface* do estilo REST (Fielding, 2000). Deve haver contrato ├║nico ÔÇö proposta formal no artefato 03 (ADR padronizando `{ data, error, meta }` em envelope unificado).

### 1.3.2. Valida├º├úo de inputs

**Zod/Joi/Yup: N├âO presentes no backend.** Confirmado via inspe├º├úo do `package.json` ÔÇö s├│ h├í bcrypt, cors, express, jwt, multer, pg, uuid, @prisma/adapter-pg.

Valida├º├úo atual ├® **manual e dispersa**:

- `userController.js:38-42`: regex inline para senha (`/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/`) ÔÇö duplicada em `registerUser` e `formularioCompleto`
- `userController.js:28`: regex inline para email
- `rhController.js`: usa `validarCPF`, `validarEmail` de `utils/validation.js` ÔÇö boa pr├ítica, **mas s├│ este controller faz**
- `diarioController.js`: valida├º├úo manual de enum `['AUTORIZADO', 'REPROVADO']` e m├¡nimo de 3 caracteres
- `tarefaController.js`: sem valida├º├úo de `percentual_concluido` (aceita >100 ou negativo)
- `obraController.js`: convers├Áes manuais `Number()` e `new Date()` sem try/catch

**Princ├¡pio violado:** *Fail Fast* / *Validate at the boundary* ÔÇö toda entrada externa deve ser validada na fronteira do sistema, idealmente com schema declarativo. Recomenda-se Zod (ADR-003).

### 1.3.3. Tratamento de erros

Presente em **todos os controllers** via `try/catch`, mas:

- **Sem middleware global de erros** ÔÇö cada controller repete `try { ... } catch { console.error(); return res.status(500).json(...) }` (padr├úo copy-paste identificado em 40+ fun├º├Áes)
- **Prisma error codes** s├│ s├úo tratados em alguns pontos (`adicionarMembroEquipe:402` trata `P2002`, `rhController` trata `P2002`, mas `obraController.criarObra` n├úo trata)
- **Erros de sistema vazam como 500** ÔÇö ex.: se `process.env.JWT_SECRET` estiver ausente e o fallback falhar, usu├írio recebe 500 gen├®rico
- **Logging via `console.error()`** ÔÇö sem biblioteca estruturada (pino, winston). Em Vercel, logs v├úo para o painel mas sem contexto (request-id, user-id)

### 1.3.4. Duplica├º├úo de l├│gica entre controllers

| Duplica├º├úo | Locais | Gravidade |
|---|---|---|
| Regex de email | `userController.js:28`, `userController.js:104` | Baixa (mesma regex em duas fun├º├Áes) |
| Regex de senha | `userController.js:38`, `userController.js:112` | Baixa |
| `getOrgChart` | `obraController.js` e `financeiroController.js` | **Alta ÔÇö rota duplicada** |
| Padr├úo pagina├º├úo (page/limit/skip) | Quase todos controllers implementam manualmente | M├®dia (candidato a util `paginate()`) |
| Parse de `idObra` de `req.params` | Presente em todos controllers de obra | Baixa |
| Padr├úo catch-and-500 | 40+ fun├º├Áes | Alta (resolvido com middleware global) |

### 1.3.5. Complexidade ciclom├ítica (fun├º├Áes cr├¡ticas)

| Fun├º├úo | Arquivo | Linhas | Aninhamento | Risco |
|---|---|---|---|---|
| `formularioCompleto` | `userController.js:102-188` | 87 | 4 | Alto |
| `criarObra` | `obraController.js:199-274` | 76 | 3 | M├®dio |
| `atualizarItemEstoque` | `obraController.js:526-585` | 60 | 4 | Alto |
| `deletarEntradaDiario` | `diarioController.js:177-240` | 64 | 3 | M├®dio |
| `atualizarTarefa` | `tarefaController.js:101-162` | 62 | 3 | M├®dio |
| `requireObraAccess` | `authorizationMiddleware.js:92-185` | 94 | 5 | **Cr├¡tico** |

`requireObraAccess` em particular executa **2 a 3 queries ao banco por request protegido** (`tb_obra_cliente`, `tb_usuario_obra`, `tb_obra`). Em endpoints de listagem com dezenas de obras, isso se torna gargalo.

### 1.3.6. Complexidade no frontend

| Componente | Linhas | Problema |
|---|---|---|
| `components/Dashboard/DashboardDinamico.jsx` | 966 | Viola SRP ÔÇö renderiza se├º├Áes, widgets, cards, modais |
| `view/FormularioCompletoPage.jsx` | 570 | Estado manual com `useState`, valida├º├úo inline, busca de CEP, for├ºa de senha |
| `pages/Operational/GestaoRH.jsx` | 327 | Tabela + modal + filtros em um ├║nico arquivo |

### 1.3.7. Cobertura de testes

**Backend:**

- 2 arquivos em `backend/tests/`: `api.test.js` (40 linhas, 3 testes), `rh.test.js` (65 linhas, 4 testes)
- Framework: `poku` + `c8`
- **Todos os testes s├úo MOCKS puros** ÔÇö n├úo fazem request HTTP real, n├úo usam banco

Exemplo representativo:

```javascript
// api.test.js ÔÇö trecho
test('Requisito D - CRUD e Opera├º├Áes B├ísicas', async () => {
  const response = { status: 200, data: { mensagem: "Sucesso" } };
  assert.equal(response.status, 200);
});
```

Isso ├® **teste estrutural de mock**, n├úo teste de comportamento. Equivalente, em utilidade, a um linter.

**Frontend:**

- Nenhum arquivo `.test.*` ou `.spec.*` encontrado em `frontend/vite-project/src/`
- **Cobertura efetiva: 0%**

**Cobertura em `backend/coverage/tmp/`:** existem JSONs brutos de c8, mas **n├úo h├í relat├│rio HTML agregado**. Cobertura real de c├│digo executado: **indeterminada, estimada <5%**.

---

## 1.4. An├ílise de seguran├ºa

Esta se├º├úo organiza achados pela taxonomia OWASP Top 10 (edi├º├úo 2021).

### 1.4.1. A01 ÔÇö Broken Access Control

| # | Problema | Arquivo:linha | Severidade |
|---|---|---|---|
| 1 | `GET /api/admin/metrics/global` sem `requireRole` | `adminRoutes.js:20` | **Cr├¡tica** |
| 2 | `DELETE /financeiro/:id` sem `requireObraAccess` | `financeiroRoutes.js:43` | **Cr├¡tica** |
| 3 | `requireObraAccess` executa 2-3 queries por request | `authorizationMiddleware.js:92-185` | M├®dia (perf) |
| 4 | Role ausente em `PERMISSOES` retorna 403 sem log | `authorizationMiddleware.js:60-78` | Baixa |
| 5 | `GET /admin/health` sem RBAC | `adminRoutes.js` | Baixa (vaza uptime/vers├úo) |
| 6 | `GET /admin/metrics/pendentes` permite `RESPONSAVEL`, `PROPRIETARIO` lado a lado com `ADMIN_MASTER` | `adminRoutes.js` | M├®dia (reavaliar matriz) |

### 1.4.2. A02 ÔÇö Cryptographic Failures

| # | Problema | Arquivo:linha | Severidade |
|---|---|---|---|
| 1 | JWT secret com fallback hardcoded `"SUPER_SECRET"` | `authMiddleware.js:20`, `userController.js:76` | **Cr├¡tica** |
| 2 | Bcrypt rounds = 10 | `userController.js:164` | OK (padr├úo) |
| 3 | Expira├º├úo JWT = 8h sem refresh token | `userController.js:77` | M├®dia |
| 4 | Sem prote├º├úo contra cookie stealing ÔÇö token em localStorage | `AuthContext.jsx:16` | Alta (XSS + token leak) |
| 5 | Sem `HTTPS-only` / `SameSite` expl├¡cito em cookies | ÔÇö | Alta (produ├º├úo) |

### 1.4.3. A03 ÔÇö Injection

| # | Problema | Observa├º├úo | Severidade |
|---|---|---|---|
| 1 | SQL injection | Prisma parametriza queries ÔÇö protegido | OK |
| 2 | XSS sem sanitiza├º├úo | Backend n├úo limpa HTML em `descricao`, `observacoes`, `nome` | M├®dia |
| 3 | Upload sem scan de conte├║do | Multer aceita MIME declarado; arquivo malicioso com extens├úo trocada passa | M├®dia |

### 1.4.4. A04 ÔÇö Insecure Design

- **Sem modelagem de amea├ºas** documentada
- **Sem rate limiting** em `/login`, `/register`, `/formulario` ÔÇö for├ºa bruta livre
- **Sem account lockout** ap├│s N falhas
- **Sem CAPTCHA** em cadastro p├║blico

### 1.4.5. A05 ÔÇö Security Misconfiguration

| # | Problema | Arquivo:linha | Severidade |
|---|---|---|---|
| 1 | CORS totalmente aberto `app.use(cors())` | `backend/src/server.js:17` | **Cr├¡tica** |
| 2 | Helmet n├úo instalado | `package.json` | Alta |
| 3 | Sem `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security` | ÔÇö | Alta |
| 4 | `dev.db` commitado | `backend/src/prisma/dev.db` | M├®dia |
| 5 | Arquivos de cobertura commitados | `backend/coverage/tmp/` | Baixa |
| 6 | `users.json` com senhas hasheadas no Git | `backend/src/database/users.json` | M├®dia |

### 1.4.6. A07 ÔÇö Identification and Authentication Failures

- **Sem refresh token** ÔÇö usu├írio for├ºado a re-logar ap├│s 8h
- **Sem single-session enforcement** ÔÇö m├║ltiplos devices com mesmo token
- **Sem logout server-side** ÔÇö token v├ílido at├® expirar
- **Sem log de tentativas de login falhas** (audit trail de auth)
- `standalone_users_server.js` (├│rf├úo) exp├Áe endpoint `GET /api/users` sem autentica├º├úo nenhuma ÔÇö se algum dia for colocado em produ├º├úo por engano, vaza lista completa de usu├írios

### 1.4.7. A09 ÔÇö Security Logging and Monitoring Failures

- Logging via `console.log`/`console.error` ÔÇö Vercel captura, mas sem contexto (sem request-id, sem user-id, sem timestamp estruturado)
- `tb_log_auditoria` referenciada mas **n├úo existe no schema** ÔÇö auditoria ├® silenciosamente perdida
- Sem ferramenta de APM (Sentry, Axiom, Datadog) ÔÇö detalhado no ADR-008

### 1.4.8. Exposi├º├úo de dados sens├¡veis

| Endpoint | Risco | An├ílise |
|---|---|---|
| `POST /api/users/login` | OK | Retorna apenas `{ token, id, nome, email, role }` ÔÇö sem `senha` |
| `GET /admin/users` | OK | `select` limita campos ÔÇö apenas `id, nome, username, role, funcao` |
| `GET /api/obras/:id` | OK | Aplica `requireObraAccess` e filtra `financeiro` conforme n├¡vel |
| `GET /admin/professionals` | ÔÜá´©Å | Retorna certifica├º├Áes e registros profissionais ÔÇö avaliar se ├® LGPD-sens├¡vel |

**Conclus├úo A01-A09:** Em ambiente de **produ├º├úo aberto ao p├║blico**, os itens cr├¡ticos (CORS, JWT fallback, aus├¬ncia de rate limit, rotas admin sem RBAC) s├úo bloqueadores. Para ambiente **acad├¬mico interno** (defesa de banca com ~10 usu├írios de teste), representam d├®bito t├®cnico alto mas n├úo impeditivo.

---

## 1.5. An├ílise de prontid├úo para Vercel

### 1.5.1. Bloqueadores de deploy serverless

Vercel Functions s├úo stateless, t├¬m filesystem ef├¬mero (`/tmp` ├® a ├║nica ├írea grav├ível durante execu├º├úo, apagada ao fim) e t├¬m timeout padr├úo de 10 segundos (Hobby) / 60 segundos (Pro). O backend atual **n├úo atende** a essas premissas em 3 pontos:

| # | Bloqueador | Arquivo | Impacto |
|---|---|---|---|
| 1 | `multer.diskStorage` grava em `/uploads` relativo ao c├│digo | `uploadMiddleware.js:6-20` | **Cr├¡tico** ÔÇö grava├º├úo funciona, mas arquivo some no pr├│ximo cold start |
| 2 | `app.use('/uploads', express.static(UPLOADS_DIR))` | `server.js:21` | **Cr├¡tico** ÔÇö pasta ef├¬mera, nunca retornar├í o arquivo |
| 3 | `storageService.deleteFile()` usa `fs.unlinkSync()` | `storageService.js` | M├®dio ÔÇö silenciosamente falha ou apaga arquivo ef├¬mero |
| 4 | `server.js` na raiz em conflito com `backend/src/server.js` | `server.js` (raiz) | Baixo (n├úo ├® importado), mas pode confundir detec├º├úo da Vercel |
| 5 | `app.listen` com condi├º├úo `!process.env.VERCEL` | `backend/src/server.js:37-41` | Ô£à OK ÔÇö Vercel define `VERCEL=1` automaticamente |
| 6 | Sem connection pooling Prisma expl├¡cito | `config/prisma.js` | M├®dio ÔÇö em cold starts m├║ltiplos, abre conex├Áes extras ao Postgres |

### 1.5.2. Ajustes necess├írios no `vercel.json`

Configura├º├úo atual (`backend/vercel.json`):

```json
{
  "version": 2,
  "builds": [{ "src": "src/server.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "src/server.js" }]
}
```

**Problemas:**
- Usa sintaxe `builds` + `routes` legada (Vercel v1-ish). Recomendado migrar para `functions` + `rewrites` da API moderna
- Sem `maxDuration` ÔÇö endpoints pesados (ex: `criarObra` com transa├º├úo) podem estourar timeout default
- Sem `regions` ÔÇö lat├¬ncia n├úo controlada

**Config recomendada (formato moderno):**

```json
{
  "functions": { "src/server.js": { "maxDuration": 30 } },
  "rewrites": [{ "source": "/(.*)", "destination": "/src/server.js" }],
  "regions": ["gru1"]
}
```

### 1.5.3. Frontend na Vercel

- **Sem `vercel.json` no frontend** ÔÇö Vercel usa detec├º├úo autom├ítica de Vite, OK
- **Sem `.vercelignore`** ÔÇö todo o monorepo ├® enviado (inclui `backend/uploads/`, `.vite/`, `coverage/`)

### 1.5.4. Vari├íveis de ambiente necess├írias

**Backend (atual):**

| Vari├ível | Origem | Obrigat├│ria? | Default |
|---|---|---|---|
| `DATABASE_URL` | Postgres connection string | Ô£à | ÔÇö |
| `JWT_SECRET` | Secret de assinatura | ÔÜá´©Å Fallback perigoso | `"SUPER_SECRET"` |
| `PORT` | S├│ usada localmente | ÔØî | 5000 |
| `NODE_ENV` | Condicional de listen | ÔØî | `development` |
| `VERCEL` | Auto-definida pela Vercel | ÔØî auto | ÔÇö |
| `STORAGE_PROVIDER` | `local` ou `s3` | ÔØî | `local` |
| `HOST` | Usado em alguns logs | ÔØî | `localhost` |

**Backend (necess├írias para produ├º├úo, faltantes):**

| Vari├ível | Prop├│sito |
|---|---|
| `FRONTEND_URL` | Para configurar CORS corretamente |
| `STORAGE_BUCKET` | Bucket S3/R2 (ap├│s migra├º├úo) |
| `STORAGE_ACCESS_KEY` | ÔÇö |
| `STORAGE_SECRET_KEY` | ÔÇö |
| `STORAGE_REGION` | ÔÇö |
| `STORAGE_PUBLIC_URL_BASE` | URL base para arquivos |
| `SENTRY_DSN` (opcional) | Observabilidade ÔÇö ADR-008 |

**Frontend (atual):**

| Vari├ível | Origem | Default |
|---|---|---|
| `VITE_API_URL` | URL do backend | `http://localhost:5000` |

**Frontend (necess├írias, faltantes):**

| Vari├ível | Prop├│sito |
|---|---|
| `VITE_APP_NAME` | Nome exibido no Helmet |
| `VITE_SENTRY_DSN` | Sentry browser |
| `VITE_ENV` | `development` / `staging` / `production` |
| `VITE_GOOGLE_MAPS_KEY` | (se feature de mapa) |

### 1.5.5. Migra├º├úo do `multer.diskStorage`

Op├º├Áes detalhadas no ADR-002 (artefato 03). Resumo:

| Op├º├úo | Pr├│s | Contras |
|---|---|---|
| Supabase Storage | Gratuito para uso acad├¬mico; API simples; SDK JS maduro | Lat├¬ncia AWS us-east-1 por padr├úo |
| Cloudflare R2 | Pre├ºo baixo; egress gr├ítis; S3-compat├¡vel | SDK menos maduro; sem regi├úo BR |
| AWS S3 | Padr├úo da ind├║stria; ecosistema amplo | Custo de egress; setup inicial mais complexo |

Recomenda├º├úo antecipada: **Supabase Storage** para MVP (simplicidade + integra├º├úo com Postgres j├í hospedado l├í), com interface abstrata em `storageService.js` que permita troca futura para R2 ou S3.

---

## 1.6. D├®bito t├®cnico priorizado

Matriz Esfor├ºo ├ù Impacto. **Esfor├ºo**: S (<1 dia), M (1-3 dias), L (1 semana), XL (>1 semana). **Impacto**: 1 (cosm├®tico) a 5 (cr├¡tico de produ├º├úo). **Prioridade**: P0 (fazer primeiro, bloqueia deploy), P1 (Semana 1-4), P2 (M├¬s 2-3), P3 (M├¬s 4-6).

| # | Item | Categoria | Esfor├ºo | Impacto | Prioridade |
|---|---|---|---|---|---|
| 1 | Remover fallback `JWT_SECRET="SUPER_SECRET"` | Seguran├ºa | S | 5 | **P0** |
| 2 | Proteger `GET /admin/metrics/global` com `requireRole` | Seguran├ºa | S | 5 | **P0** |
| 3 | Proteger `DELETE /financeiro/:id` com `requireObraAccess` | Seguran├ºa | S | 5 | **P0** |
| 4 | Fechar CORS para `FRONTEND_URL` | Seguran├ºa | S | 5 | **P0** |
| 5 | Remover `dev.db` do Git + adicionar `.gitignore` | Higiene | S | 3 | **P0** |
| 6 | Deletar `server.js` ├│rf├úo na raiz | Higiene | S | 2 | **P0** |
| 7 | Deletar `schema.prisma.postgres` duplicado | Higiene | S | 3 | **P0** |
| 8 | Criar `.env.example` backend + frontend | Developer Experience | S | 3 | **P0** |
| 9 | Criar `.vercelignore` | Deploy | S | 3 | **P0** |
| 10 | Migrar uploads para Supabase Storage | Deploy | M | 5 | **P1** |
| 11 | Adicionar `express-rate-limit` em `/login` e `/register` | Seguran├ºa | S | 4 | **P1** |
| 12 | Adicionar `helmet` + headers de seguran├ºa | Seguran├ºa | S | 4 | **P1** |
| 13 | Criar `tb_log_auditoria` (refer├¬ncia quebrada no c├│digo) | Dados | M | 3 | **P1** |
| 14 | Padronizar respostas `{ data, error, meta }` | API | M | 4 | **P1** |
| 15 | Middleware global de erros | API | M | 4 | **P1** |
| 16 | Valida├º├úo com Zod em todas as rotas | API/Seguran├ºa | L | 4 | **P1** |
| 17 | Consolidar seeds (`src/prisma/seed.js` ├║nico) | Higiene | S | 2 | **P1** |
| 18 | Deletar 10+ arquivos ├│rf├úos de backend | Higiene | S | 3 | **P1** |
| 19 | Consolidar `frontend/src/view/` em `pages/` | Arquitetura FE | XL | 4 | **P2** |
| 20 | Refatorar `DashboardDinamico.jsx` (966 linhas) | Arquitetura FE | L | 3 | **P2** |
| 21 | Service layer entre controllers e Prisma | Arquitetura BE | XL | 4 | **P2** |
| 22 | Testes de integra├º├úo com banco real (superar mocks) | Qualidade | L | 5 | **P2** |
| 23 | Corrigir `onDelete` de `tb_etapa`, `tb_requisicao`, `tb_usuario_obra` | Dados | S | 3 | **P2** |
| 24 | Adicionar ├¡ndices em `tb_financeiro_obra.id_obra`, etc. | Performance | S | 3 | **P2** |
| 25 | Interceptor de fetch centralizado no frontend (401, retry, timeout) | Arquitetura FE | M | 4 | **P2** |
| 26 | Migra├º├úo progressiva para TypeScript | Qualidade | XL | 4 | **P2** |
| 27 | Refresh token + logout server-side | Seguran├ºa | L | 3 | **P2** |
| 28 | Observabilidade (Sentry) | Opera├º├úo | M | 4 | **P2** |
| 29 | Testes E2E (Playwright) de fluxos cr├¡ticos | Qualidade | L | 4 | **P3** |
| 30 | Cache de `requireObraAccess` (reduzir queries repetidas) | Performance | M | 3 | **P3** |
| 31 | Migra├º├úo de `multer.diskStorage` ÔåÆ memoryStorage + stream direto ao S3 | Performance | M | 3 | **P3** |
| 32 | i18n (react-intl) | Produto | L | 2 | **P3** |
| 33 | Consolidar deps duplicadas entre `package.json` raiz e `backend/package.json` | Higiene | S | 3 | **P1** |

### Resumo de d├®bito por categoria

| Categoria | Qtd itens | P0 | P1 | P2 | P3 |
|---|---|---|---|---|---|
| Seguran├ºa | 10 | 4 | 3 | 3 | 0 |
| Arquitetura BE | 5 | 0 | 2 | 3 | 0 |
| Arquitetura FE | 4 | 0 | 0 | 3 | 1 |
| Dados / Prisma | 3 | 0 | 1 | 2 | 0 |
| Deploy / Vercel | 3 | 2 | 1 | 0 | 0 |
| Higiene / limpeza | 6 | 3 | 3 | 0 | 0 |
| Qualidade / testes | 3 | 0 | 0 | 2 | 1 |

**Total:** 33 itens. **P0 (Semana 1):** 9 itens. **P1 (M├¬s 1):** 10 itens. **P2 (Meses 2-3):** 11 itens. **P3 (Meses 4-6):** 3 itens.

---

## Conclus├úo da Fase 1

O Obra Integrada ├® um projeto acad├¬mico **maduro em escopo funcional** (multi-tenancy, RBAC com 8 pap├®is, upload de arquivos, auditoria geogr├ífica de di├írios) e **imaturo em disciplina de engenharia** (testes mock, aus├¬ncia de valida├º├úo declarativa, depend├¬ncias duplicadas, arquivos ├│rf├úos, Git com artefatos de build). Essa combina├º├úo ├® t├¡pica de projetos onde o foco esteve em *fazer funcionar* ÔÇö perfeitamente razo├ível para 2 anos de TCC.

Nenhum dos problemas listados ├® irrecuper├ível. O caminho ├® o **esfor├ºo de ~4 semanas concentrado em higiene + funda├º├úo** (P0 + P1 = 19 itens, totalizando estimados 3-4 pessoas-semana), ap├│s o qual o projeto estar├í pronto para crescer com qualidade no horizonte de 18 meses restantes. O detalhamento de como executar est├í no artefato 03 (Plano de Refatora├º├úo).

Seguem-se as fases 2 (oportunidades de produto), 3 (plano de refatora├º├úo t├®cnica) e 4 (workflow de equipe).

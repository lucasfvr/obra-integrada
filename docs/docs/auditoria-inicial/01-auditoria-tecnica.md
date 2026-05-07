# Fase 1 — Auditoria Técnica Completa

**Projeto:** Obra Integrada
**Data:** 24 de abril de 2026
**Escopo:** Monorepo fullstack (backend Express/Prisma + frontend React/Vite)
**Responsável pela auditoria:** Arquitetura de software (consultoria externa)
**Duração do desenvolvimento até aqui:** ~24 meses acumulados (projeto acadêmico)

---

## Sumário executivo

A plataforma Obra Integrada está **operacional em ambiente local** e já implementa fluxos críticos (autenticação, cadastro de obras, diário de obra com GPS, tarefas, financeiro, RH e admin). A base arquitetural — Express 5 + Prisma 5 + PostgreSQL no backend, React 19 + Vite 7 + Tailwind 4 no frontend — é moderna e adequada para deploy serverless na Vercel.

Contudo, a auditoria identificou **6 problemas críticos de segurança**, **duplicação estrutural (pastas `view/` legada convivendo com `pages/` moderna)**, **ausência de testes de integração reais** (os existentes são mocks), **acoplamento direto a Prisma nos controllers** e **bloqueadores concretos para produção na Vercel** (uso de `multer.diskStorage`, CORS permissivo total, JWT secret com fallback hardcoded). O débito técnico é significativo mas **gerenciável em horizonte de 6 meses** se tratado de forma incremental, como detalhado no artefato 03 desta auditoria.

Não existem problemas bloqueadores para o prosseguimento do roadmap de 24 meses — há, sim, **5 ações de higiene imediata** (Semana 1) que devem preceder qualquer nova funcionalidade: remover `dev.db` do Git, apagar `server.js` da raiz, criar `.env.example`, criar `.vercelignore`, e corrigir o fallback do `JWT_SECRET`.

---

## 1.1. Inventário estrutural

### 1.1.1. Visão geral do monorepo

```
obra-integrada/
├── .gitignore                      # raiz (ignora node_modules, .env, /generated/prisma)
├── LICENSE.md                      # MIT (aparentemente herdado do template TailAdmin)
├── README.md                       # desatualizado (menciona "JSON mock, futuro MySQL")
├── banner.png                      # 1.4 MB commitado — sem referência no README
├── package.json                    # raiz — orquestrador (concurrently), mas com deps duplicadas
├── package-lock.json               # 64 KB
├── server.js                       # ARQUIVO OBSOLETO — duplica backend/src/server.js
├── backend/                        # API Node.js
├── frontend/vite-project/          # SPA React
└── documentacao_banca/             # 1 arquivo RELATORIO_TECNICO.md (32 linhas, superficial)
```

**Observações imediatas:**

| Item | Status | Comentário |
|---|---|---|
| `server.js` na raiz | ❌ Órfão | Versão antiga com apenas 2 rotas; não é importado em lugar nenhum |
| `banner.png` | ⚠️ 1.4 MB no Git | Deveria estar em CDN ou referenciado por URL externa |
| `package.json` raiz | ⚠️ Deps duplicadas | `@prisma/client`, `prisma`, `bcryptjs`, `cors`, `express`, `jsonwebtoken` estão em ambos `package.json` raiz e `backend/package.json` |
| `documentacao_banca/` | ⚠️ Superficial | RELATORIO_TECNICO.md com 32 linhas; não substitui documentação técnica real |

### 1.1.2. Estrutura do backend

```
backend/
├── .gitignore
├── check_db.mjs                    # ÓRFÃO — debug manual de conexão
├── coverage/tmp/                   # arquivos .json de c8 COMMITADOS (erro)
├── package.json
├── package-lock.json
├── seed_bulk.mjs                   # ÓRFÃO — versão antiga de seed
├── seed_enrich.mjs                 # ÓRFÃO — versão antiga de seed
├── seed_obras_detalhadas.mjs       # ÓRFÃO
├── seed_out.txt                    # ÓRFÃO — log de saída de seed
├── seed_tarefas_paginacao.mjs      # ÓRFÃO
├── seed_vanguarda_rico.mjs         # ÓRFÃO
├── standalone_users_server.js      # ÓRFÃO — servidor alternativo de 125 linhas não usado
├── strip_maps.js                   # ÓRFÃO — script de limpeza de schema
├── tests/
│   ├── api.test.js                 # 40 linhas — testes MOCK (não de integração)
│   └── rh.test.js                  # 65 linhas — testes MOCK
├── uploads/                        # pasta com .gitignore correto (*, !.gitignore, !.gitkeep)
├── vercel.json
└── src/
    ├── config/
    │   ├── prisma.js               # singleton simples
    │   └── storageService.js       # abstração de storage (preparada p/ S3 futuro)
    ├── controllers/                # 10 arquivos (ver 1.1.3)
    ├── database/
    │   ├── obras.json              # MOCK LEGADO (42 linhas)
    │   └── users.json              # MOCK LEGADO (110 linhas, com senhas hasheadas)
    ├── middlewares/
    │   ├── authMiddleware.js       # 34 linhas
    │   ├── authorizationMiddleware.js  # 198 linhas — matriz RBAC
    │   └── uploadMiddleware.js     # 113 linhas — multer diskStorage
    ├── models/
    │   ├── obra.js                 # 89 linhas — wrapper fino de Prisma
    │   └── user.js                 # 37 linhas — wrapper fino de Prisma
    ├── prisma/
    │   ├── dev.db                  # ❌ SQLite COMMITADO (114 KB) — obsoleto, usa Postgres
    │   ├── schema.prisma           # 326 linhas, 21 models
    │   ├── schema.prisma.postgres  # ❌ DUPLICADO/DESATUALIZADO (192 linhas, 14 models)
    │   ├── seed.js                 # oficial
    │   └── migrations/
    │       └── 20260415002034_advanced_features/migration.sql  # ÚNICA migration
    ├── routes/                     # 7 arquivos (ver 1.1.3)
    ├── utils/
    │   └── validation.js           # 49 linhas — validarCPF, validarEmail
    ├── seed.js                     # possível órfão
    ├── prisma.config.ts            # config do CLI do Prisma
    └── server.js                   # entry point atual
```

### 1.1.3. Mapeamento por módulo

A tabela a seguir conecta cada módulo de negócio aos seus controllers, rotas, middlewares, models e ao frontend correspondente. Serve como referência única para a equipe localizar qualquer funcionalidade.

#### Módulo **Obras**

| Camada | Arquivo | Linhas | Observação |
|---|---|---|---|
| Controller | `backend/src/controllers/obraController.js` | 602 | Crítico — maior controller do projeto |
| Rota | `backend/src/routes/obraRoutes.js` | 58 | Usa `requireObraAccess` |
| Model | `backend/src/models/obra.js` | 89 | Wrapper de Prisma |
| Middleware | `authMiddleware`, `authorizationMiddleware` | — | — |
| Página FE (moderna) | `frontend/vite-project/src/pages/Obra/ObraPage.jsx` | 161 | Tabs simples |
| Página FE (listagem) | `frontend/vite-project/src/pages/Obras/MinhasObrasPage.jsx` | — | Proteção via `PermissaoGuard(ver_obras)` |
| Wizard | `frontend/vite-project/src/components/Dashboard/NovaObraWizard.jsx` | — | — |
| Rotas protegidas | `/obras`, `/obra/:id` | — | — |

**Funcionalidades cobertas:** CRUD de obras, equipe da obra (adicionar/remover/atualizar membros), estoque por obra (CRUD + histórico de movimentações), documentos da obra (upload), org-chart, filtragem RBAC de dados financeiros em `getObraById`.

#### Módulo **Diário**

| Camada | Arquivo | Linhas | Observação |
|---|---|---|---|
| Controller | `backend/src/controllers/diarioController.js` | 309 | Bom padrão: helper `registrarLog()` de auditoria |
| Rota | `backend/src/routes/diarioRoutes.js` | 79 | Pipeline exemplar: auth → requireObraAccess → requirePermissao → upload |
| Middleware | `uploadMiddleware` (subpasta `diario/`) | — | — |
| Página FE | `frontend/vite-project/src/pages/Obra/sections/ObraDiario.jsx` | — | Acessada via tabs de `ObraPage` |

**Funcionalidades cobertas:** listagem paginada, criação com foto + GPS + `status_auditoria`, exclusão com log de auditoria, edição de descrição, PATCH para auditoria (AUTORIZADO/REPROVADO).

#### Módulo **Tarefas**

| Camada | Arquivo | Linhas | Observação |
|---|---|---|---|
| Controller | `backend/src/controllers/tarefaController.js` | 233 | Operações sem `$transaction` — risco de inconsistência em re-sync de usuários |
| Rota | `backend/src/routes/tarefaRoutes.js` | 59 | Duplicação: `GET /tarefas` (global) e `GET /obras/:id/tarefas` |
| Página FE | `frontend/vite-project/src/pages/Calendar.tsx` | — | Usa FullCalendar (pesado — ~200 KB) |

**Funcionalidades cobertas:** CRUD de tarefas, atualização de status, atribuição a múltiplos usuários via `tb_tarefa_usuario`, percentual de conclusão.

#### Módulo **Financeiro**

| Camada | Arquivo | Linhas | Observação |
|---|---|---|---|
| Controller | `backend/src/controllers/financeiroController.js` | 146 | Função `getOrgChart` DUPLICADA do `obraController` |
| Rota | `backend/src/routes/financeiroRoutes.js` | 56 | ❌ `DELETE /financeiro/:id` sem `requireObraAccess` |
| Página FE | `frontend/vite-project/src/pages/Obra/sections/ObraFinanceiro.jsx` | — | — |

**Funcionalidades cobertas:** listagem, criação com comprovante, exclusão. Upload via multer.

#### Módulo **RH**

| Camada | Arquivo | Linhas | Observação |
|---|---|---|---|
| Controller | `backend/src/controllers/rhController.js` | 199 | ✅ Usa `validarCPF`/`validarEmail` de utils |
| Rota | `backend/src/routes/rhRoutes.js` | 42 | Coerente — permissão `gerenciar_usuarios` uniforme |
| Página FE | `frontend/vite-project/src/pages/Operational/GestaoRH.jsx` | 327 | Tabela + modal + filtros em um único arquivo |

**Funcionalidades cobertas:** listagem paginada com busca, cadastro de funcionário (auto-gera matrícula `MAT-YYYY-NNN`), atualização, inativação (soft delete, bloqueia PROPRIETARIO).

#### Módulo **Admin**

| Camada | Arquivo | Linhas | Observação |
|---|---|---|---|
| Controller | `backend/src/controllers/adminController.js` | 203 | ❌ `getGlobalMetrics` sem `requireRole` na rota |
| Rota | `backend/src/routes/adminRoutes.js` | 40 | RBAC inconsistente entre endpoints |
| Página FE | Dashboard de métricas e impersonação via `AuthContext` | — | — |

**Funcionalidades cobertas:** métricas globais, listagem de clientes, auditoria de profissionais, rentabilidade macro simulada (SaaS mock), health check, impersonação de usuários, inbox de diários pendentes.

#### Módulo **Users / Auth**

| Camada | Arquivo | Linhas | Observação |
|---|---|---|---|
| Controller | `backend/src/controllers/userController.js` | 277 | Função `formularioCompleto` com 87 linhas — refatorar |
| Rota | `backend/src/routes/userRoutes.js` | 27 | 3 endpoints públicos (register, login, formulario) + 6 protegidos |
| Model | `backend/src/models/user.js` | 37 | — |
| Middleware | `authMiddleware.js` | 34 | JWT 8h, sem refresh token |
| Context FE | `frontend/vite-project/src/context/AuthContext.jsx` | — | localStorage com `obraToken`, `obraUser`, impersonação via `originalAdminUser` |
| Páginas FE | `view/Home.jsx`, `view/FormularioCompletoPage.jsx` (570 linhas) | — | Pasta `view/` é LEGADA |

#### Módulo **Operacional (stats / weather)**

| Camada | Arquivo | Linhas | Observação |
|---|---|---|---|
| Controller | `backend/src/controllers/operationalController.js` | 102 | `getWeatherMock` é placeholder — bom candidato a feature IA |
| Rotas | Incluídas em `userRoutes.js` (`/operational/stats`, `/operational/weather`) | — | — |
| Página FE | `frontend/vite-project/src/pages/Operational/MeuPerfilCV.jsx` | — | — |

#### Módulo **Documentos / Formulário**

| Camada | Arquivo | Linhas | Observação |
|---|---|---|---|
| Controller | `documentoController.js` | 61 | Muito simples — 2 funções |
| Controller | `formularioController.js` | 14 | ❌ Órfão — único método `atualizarPerfil` é wrapper fino de `UserModel.update()` |

### 1.1.4. Arquivos órfãos, duplicados ou legados

Lista consolidada, com recomendação por item. A ação de remoção será detalhada no artefato 03 (Plano de limpeza — Semana 1-2).

| Arquivo / Pasta | Tipo | Tamanho | Recomendação |
|---|---|---|---|
| `server.js` (raiz) | Órfão | ~1.4 KB | Deletar — não é importado em lugar nenhum |
| `banner.png` (raiz) | Pesado | 1.4 MB | Mover para CDN / `frontend/public/` |
| `backend/standalone_users_server.js` | Órfão | 125 linhas | Deletar |
| `backend/strip_maps.js` | Órfão | 7 linhas | Deletar ou mover para `/scripts/` |
| `backend/check_db.mjs` | Órfão | 10 linhas | Deletar ou mover para `/scripts/` |
| `backend/seed_bulk.mjs` | Órfão | 6 KB | Deletar |
| `backend/seed_enrich.mjs` | Órfão | 5 KB | Deletar |
| `backend/seed_obras_detalhadas.mjs` | Órfão | 6 KB | Deletar |
| `backend/seed_tarefas_paginacao.mjs` | Órfão | 7 KB | Deletar |
| `backend/seed_vanguarda_rico.mjs` | Órfão | 9 KB | Consolidar em `src/prisma/seed.js` |
| `backend/seed_out.txt` | Órfão | 22 KB | Deletar (log de saída) |
| `backend/src/seed.js` | Duplicado | — | Consolidar com `backend/src/prisma/seed.js` |
| `backend/src/database/obras.json` | Legado | 920 B | Deletar — mock pré-Prisma |
| `backend/src/database/users.json` | Legado | 3 KB | Deletar — contém senhas hasheadas em repositório |
| `backend/src/prisma/dev.db` | Legado crítico | 114 KB | Deletar + adicionar ao `.gitignore` |
| `backend/src/prisma/schema.prisma.postgres` | Duplicado | 192 linhas | Deletar — versão antiga do schema |
| `backend/coverage/tmp/*.json` | Commitado indevido | ~4 arquivos | Adicionar `coverage/` ao `.gitignore` |
| `frontend/vite-project/.vite/deps/` | Cache Vite | Commitado | Adicionar `.vite/` ao `.gitignore` |
| `frontend/vite-project/src/view/` | Legado | 23 arquivos | Consolidar em `pages/` e `components/` gradualmente |
| `frontend/vite-project/src/controllers/ObraController.js` | Órfão | — | Deletar — padrão MVC em memória não integrado à API |
| `frontend/vite-project/src/models/ObraModel.js` | Órfão | — | Deletar — protótipo em memória |

---

## 1.2. Análise do schema Prisma

### 1.2.1. Entidades e relacionamentos

O schema (`backend/src/prisma/schema.prisma`, 326 linhas) define **21 modelos** em convenção de nomenclatura MySQL/SQL Server (`tb_*`, snake_case). Essa convenção é válida, porém **diverge do padrão recomendado do Prisma** (PascalCase singular — `User`, `Obra`) e dificulta a geração automática de tipos TypeScript legíveis (`prisma.tb_usuario` vs. `prisma.user`).

Entidades core:

| Categoria | Modelos | Cardinalidade |
|---|---|---|
| **Tenancy** | `tb_cliente`, `tb_obra_cliente` | 1:N via tabela associativa |
| **Obras** | `tb_obra`, `tb_status`, `tb_etapa`, `tb_papel` | Obra é raiz; etapa depende de obra |
| **Pessoas** | `tb_usuario`, `tb_usuario_obra` | M:N entre usuário e obra |
| **Materiais** | `tb_material`, `tb_fabricante`, `tb_material_fabricante`, `tb_etapa_material`, `tb_requisicao`, `tb_material_requisitado` | Catálogo global + requisições por obra |
| **Operação** | `tb_diario_obra`, `tb_tarefa`, `tb_tarefa_usuario`, `tb_documento`, `tb_estoque_obra`, `tb_movimentacao_estoque` | Operação diária da obra |
| **Financeiro** | `tb_financeiro_obra` | Receitas/despesas por obra |

Há ainda referência a `tb_log_auditoria` dentro do `diarioController.js` via helper `registrarLog()` — **mas essa tabela não existe no schema**. O helper tem fallback silencioso (graceful) em `.catch(() => ...)`, mas o log de auditoria efetivamente não é persistido. **Este é um falso positivo de feature auditável** — prioridade alta de correção.

### 1.2.2. Índices presentes

```prisma
@@index([id_obra], map: "idx_etapa_obra")
@@index([id_obra], map: "idx_estoque_obra")
@@index([id_obra], map: "idx_req_obra")
@@index([id_usuario_responsavel], map: "idx_obra_usuario")
@@index([id_obra], map: "idx_diario_obra")
@@index([id_usuario], map: "idx_diario_usuario")
@@index([id_obra], map: "idx_tarefa_obra")
```

**Avaliação:** 7 índices em FKs de filtragem por obra. Todos legítimos — nenhum redundante. Campos `@unique` (`email`, `cpf`, `username`, `matricula`, `cpf_cnpj`) criam índices implicitamente.

**Índices faltantes (recomendados):**

| Entidade | Campo | Motivo |
|---|---|---|
| `tb_financeiro_obra` | `id_obra` | Listagem financeira é filtrada por obra em toda consulta |
| `tb_diario_obra` | `data_registro` | Paginação por data (uso atual `orderBy: { data_registro: 'desc' }`) |
| `tb_tarefa` | `prazo` | Dashboards por deadline |
| `tb_usuario` | `role` | Filtros admin por role |
| `tb_usuario` | `status` | Filtros "ATIVO" são frequentes em `rhController` |

### 1.2.3. Inconsistências entre `schema.prisma` e `schema.prisma.postgres`

O arquivo `schema.prisma.postgres` é uma **versão antiga** do schema (14 models contra 21 atuais), faltando:

- `tb_financeiro_obra`
- `tb_movimentacao_estoque`
- `tb_estoque_obra`
- `tb_diario_obra`
- `tb_tarefa`, `tb_tarefa_usuario`
- `tb_documento`

Também usa anotações distintas (`@db.VarChar` vs. `String`). Trata-se de **código morto perigoso** — se alguém rodar `prisma generate --schema=src/prisma/schema.prisma.postgres` por engano, o cliente Prisma gerado fica incompleto.

**Ação:** Deletar o arquivo na Semana 1.

### 1.2.4. Problemas de modelagem (FKs e nullability)

#### FKs com `onDelete: NoAction` em composições

```prisma
tb_etapa.tb_obra        → onDelete: NoAction    # ❌ etapa órfã se obra for deletada
tb_requisicao.tb_obra   → onDelete: NoAction    # ❌ requisição órfã
tb_usuario_obra.tb_obra → onDelete: NoAction    # ❌ vínculo órfão
tb_usuario_obra.tb_usuario → onDelete: NoAction # ❌ vínculo órfão
```

Em contraste, estas entidades estão **corretamente configuradas** com `Cascade`:

```prisma
tb_estoque_obra.tb_obra     → onDelete: Cascade   ✓
tb_diario_obra.tb_obra      → onDelete: Cascade   ✓
tb_tarefa.tb_obra           → onDelete: Cascade   ✓
tb_documento.tb_obra        → onDelete: Cascade   ✓
tb_financeiro_obra.tb_obra  → onDelete: Cascade   ✓
tb_etapa_material.tb_etapa  → onDelete: Cascade   ✓
```

**Impacto prático:** O `obraController.deletarObra()` faz um `$transaction` manual (`obraController.js:346`) deletando vínculos um a um **justamente porque o Cascade não está no schema**. Isso é workaround — deveria estar declarado.

#### Campos `nullable` que deveriam ser obrigatórios

| Entidade | Campo | Problema |
|---|---|---|
| `tb_usuario` | `senha` (nullable) | Conta pode existir sem senha válida — vetor de bypass |
| `tb_usuario` | `email` (nullable + @unique) | Permite usuário sem e-mail; múltiplos `NULL` são aceitos em `@unique` |
| `tb_usuario` | `username` (nullable + @unique) | Idem |
| `tb_usuario` | `role` (default "USER") | OK — default seguro |
| `tb_etapa` | `nome` (nullable) | Etapa sem nome não faz sentido |
| `tb_obra` | `nome` (NOT NULL) | ✓ OK |
| `tb_documento` | `url` (NOT NULL) | ✓ OK |
| `tb_diario_obra` | `descricao` (NOT NULL) | ✓ OK |

#### Inconsistência de tipos numéricos

- `tb_obra.area_terreno`, `area_construida` são `Float?` — mas `valor_orcado`, `custo_atual`, `orcamento_material` são `Decimal?` (10,2). Mistura de tipos para campos similares. Recomenda-se padronizar em `Decimal` para tudo que envolve dinheiro, área ou quantidade.

### 1.2.5. Modelos sem uso aparente nos controllers

Grep por `prisma.<modelo>` em `backend/src/controllers/` indicou:

| Modelo | Uso detectado | Observação |
|---|---|---|
| `tb_fabricante` | ❌ Nenhum | Modelo órfão — catálogo definido mas não exposto |
| `tb_material` | ❌ Nenhum | Idem — não há CRUD de materiais |
| `tb_material_fabricante` | ❌ Nenhum | Apenas estrutura — não consumido |
| `tb_etapa_material` | ❌ Nenhum | Idem |
| `tb_material_requisitado` | ❌ Nenhum | Idem |
| `tb_papel` | ⚠️ Indireto | Usado via include em obra, mas sem CRUD |
| `tb_status` | ⚠️ Indireto | Idem |

**Implicação:** O schema antecipa um **módulo de materiais/requisições que ainda não foi construído**. É um sinal positivo de planejamento, mas o schema não deveria ficar "flutuando" sem controller. Ou se implementa o módulo (roadmap da Fase 2), ou se remove o schema para não confundir.

### 1.2.6. Migrations

Apenas **1 migration** em `backend/src/prisma/migrations/20260415002034_advanced_features/migration.sql`, datada de 15/04/2026. Isso sugere que o projeto passou a maior parte do tempo usando `prisma db push` (sync direto) em vez de migrations versionadas — prática aceitável em dev, **inadequada em produção**.

**Recomendação:** A partir da primeira release em staging, toda alteração de schema deve gerar migration nomeada (`npx prisma migrate dev --name <nome>`), e o deploy deve usar `prisma migrate deploy` (detalhado no ADR-010).

---

## 1.3. Análise de qualidade de código

### 1.3.1. Padrões de resposta de API

**Não há padrão uniforme de resposta.** Observações:

```javascript
// userController.js:19
return res.status(409).json({ erro: 'E-mail já cadastrado' });

// obraController.js:402
return res.status(409).json({ error: 'Usuário já está nesta obra' });

// adminController.js:52
return res.status(500).json({ erro: 'Falha ao coletar métricas globais' });

// diarioController.js
return res.status(200).json({ data: registros, meta: { page, limit, total } });

// tarefaController.js (listar)
return res.status(200).json(tarefas);
```

Misturas detectadas:
- **Chave do erro**: `erro` (português) × `error` (inglês) × `mensagem`
- **Presença de `data`/`meta`**: alguns endpoints retornam `{ data, meta }` (diário, obras paginadas), outros retornam array cru (tarefas global)
- **Códigos HTTP**: geralmente corretos, mas alguns casos retornam 500 quando deveria ser 400 ou 422

**Princípio violado:** *Uniform Interface* do estilo REST (Fielding, 2000). Deve haver contrato único — proposta formal no artefato 03 (ADR padronizando `{ data, error, meta }` em envelope unificado).

### 1.3.2. Validação de inputs

**Zod/Joi/Yup: NÃO presentes no backend.** Confirmado via inspeção do `package.json` — só há bcrypt, cors, express, jwt, multer, pg, uuid, @prisma/adapter-pg.

Validação atual é **manual e dispersa**:

- `userController.js:38-42`: regex inline para senha (`/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/`) — duplicada em `registerUser` e `formularioCompleto`
- `userController.js:28`: regex inline para email
- `rhController.js`: usa `validarCPF`, `validarEmail` de `utils/validation.js` — boa prática, **mas só este controller faz**
- `diarioController.js`: validação manual de enum `['AUTORIZADO', 'REPROVADO']` e mínimo de 3 caracteres
- `tarefaController.js`: sem validação de `percentual_concluido` (aceita >100 ou negativo)
- `obraController.js`: conversões manuais `Number()` e `new Date()` sem try/catch

**Princípio violado:** *Fail Fast* / *Validate at the boundary* — toda entrada externa deve ser validada na fronteira do sistema, idealmente com schema declarativo. Recomenda-se Zod (ADR-003).

### 1.3.3. Tratamento de erros

Presente em **todos os controllers** via `try/catch`, mas:

- **Sem middleware global de erros** — cada controller repete `try { ... } catch { console.error(); return res.status(500).json(...) }` (padrão copy-paste identificado em 40+ funções)
- **Prisma error codes** só são tratados em alguns pontos (`adicionarMembroEquipe:402` trata `P2002`, `rhController` trata `P2002`, mas `obraController.criarObra` não trata)
- **Erros de sistema vazam como 500** — ex.: se `process.env.JWT_SECRET` estiver ausente e o fallback falhar, usuário recebe 500 genérico
- **Logging via `console.error()`** — sem biblioteca estruturada (pino, winston). Em Vercel, logs vão para o painel mas sem contexto (request-id, user-id)

### 1.3.4. Duplicação de lógica entre controllers

| Duplicação | Locais | Gravidade |
|---|---|---|
| Regex de email | `userController.js:28`, `userController.js:104` | Baixa (mesma regex em duas funções) |
| Regex de senha | `userController.js:38`, `userController.js:112` | Baixa |
| `getOrgChart` | `obraController.js` e `financeiroController.js` | **Alta — rota duplicada** |
| Padrão paginação (page/limit/skip) | Quase todos controllers implementam manualmente | Média (candidato a util `paginate()`) |
| Parse de `idObra` de `req.params` | Presente em todos controllers de obra | Baixa |
| Padrão catch-and-500 | 40+ funções | Alta (resolvido com middleware global) |

### 1.3.5. Complexidade ciclomática (funções críticas)

| Função | Arquivo | Linhas | Aninhamento | Risco |
|---|---|---|---|---|
| `formularioCompleto` | `userController.js:102-188` | 87 | 4 | Alto |
| `criarObra` | `obraController.js:199-274` | 76 | 3 | Médio |
| `atualizarItemEstoque` | `obraController.js:526-585` | 60 | 4 | Alto |
| `deletarEntradaDiario` | `diarioController.js:177-240` | 64 | 3 | Médio |
| `atualizarTarefa` | `tarefaController.js:101-162` | 62 | 3 | Médio |
| `requireObraAccess` | `authorizationMiddleware.js:92-185` | 94 | 5 | **Crítico** |

`requireObraAccess` em particular executa **2 a 3 queries ao banco por request protegido** (`tb_obra_cliente`, `tb_usuario_obra`, `tb_obra`). Em endpoints de listagem com dezenas de obras, isso se torna gargalo.

### 1.3.6. Complexidade no frontend

| Componente | Linhas | Problema |
|---|---|---|
| `components/Dashboard/DashboardDinamico.jsx` | 966 | Viola SRP — renderiza seções, widgets, cards, modais |
| `view/FormularioCompletoPage.jsx` | 570 | Estado manual com `useState`, validação inline, busca de CEP, força de senha |
| `pages/Operational/GestaoRH.jsx` | 327 | Tabela + modal + filtros em um único arquivo |

### 1.3.7. Cobertura de testes

**Backend:**

- 2 arquivos em `backend/tests/`: `api.test.js` (40 linhas, 3 testes), `rh.test.js` (65 linhas, 4 testes)
- Framework: `poku` + `c8`
- **Todos os testes são MOCKS puros** — não fazem request HTTP real, não usam banco

Exemplo representativo:

```javascript
// api.test.js — trecho
test('Requisito D - CRUD e Operações Básicas', async () => {
  const response = { status: 200, data: { mensagem: "Sucesso" } };
  assert.equal(response.status, 200);
});
```

Isso é **teste estrutural de mock**, não teste de comportamento. Equivalente, em utilidade, a um linter.

**Frontend:**

- Nenhum arquivo `.test.*` ou `.spec.*` encontrado em `frontend/vite-project/src/`
- **Cobertura efetiva: 0%**

**Cobertura em `backend/coverage/tmp/`:** existem JSONs brutos de c8, mas **não há relatório HTML agregado**. Cobertura real de código executado: **indeterminada, estimada <5%**.

---

## 1.4. Análise de segurança

Esta seção organiza achados pela taxonomia OWASP Top 10 (edição 2021).

### 1.4.1. A01 — Broken Access Control

| # | Problema | Arquivo:linha | Severidade |
|---|---|---|---|
| 1 | `GET /api/admin/metrics/global` sem `requireRole` | `adminRoutes.js:20` | **Crítica** |
| 2 | `DELETE /financeiro/:id` sem `requireObraAccess` | `financeiroRoutes.js:43` | **Crítica** |
| 3 | `requireObraAccess` executa 2-3 queries por request | `authorizationMiddleware.js:92-185` | Média (perf) |
| 4 | Role ausente em `PERMISSOES` retorna 403 sem log | `authorizationMiddleware.js:60-78` | Baixa |
| 5 | `GET /admin/health` sem RBAC | `adminRoutes.js` | Baixa (vaza uptime/versão) |
| 6 | `GET /admin/metrics/pendentes` permite `RESPONSAVEL`, `PROPRIETARIO` lado a lado com `ADMIN_MASTER` | `adminRoutes.js` | Média (reavaliar matriz) |

### 1.4.2. A02 — Cryptographic Failures

| # | Problema | Arquivo:linha | Severidade |
|---|---|---|---|
| 1 | JWT secret com fallback hardcoded `"SUPER_SECRET"` | `authMiddleware.js:20`, `userController.js:76` | **Crítica** |
| 2 | Bcrypt rounds = 10 | `userController.js:164` | OK (padrão) |
| 3 | Expiração JWT = 8h sem refresh token | `userController.js:77` | Média |
| 4 | Sem proteção contra cookie stealing — token em localStorage | `AuthContext.jsx:16` | Alta (XSS + token leak) |
| 5 | Sem `HTTPS-only` / `SameSite` explícito em cookies | — | Alta (produção) |

### 1.4.3. A03 — Injection

| # | Problema | Observação | Severidade |
|---|---|---|---|
| 1 | SQL injection | Prisma parametriza queries — protegido | OK |
| 2 | XSS sem sanitização | Backend não limpa HTML em `descricao`, `observacoes`, `nome` | Média |
| 3 | Upload sem scan de conteúdo | Multer aceita MIME declarado; arquivo malicioso com extensão trocada passa | Média |

### 1.4.4. A04 — Insecure Design

- **Sem modelagem de ameaças** documentada
- **Sem rate limiting** em `/login`, `/register`, `/formulario` — força bruta livre
- **Sem account lockout** após N falhas
- **Sem CAPTCHA** em cadastro público

### 1.4.5. A05 — Security Misconfiguration

| # | Problema | Arquivo:linha | Severidade |
|---|---|---|---|
| 1 | CORS totalmente aberto `app.use(cors())` | `backend/src/server.js:17` | **Crítica** |
| 2 | Helmet não instalado | `package.json` | Alta |
| 3 | Sem `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security` | — | Alta |
| 4 | `dev.db` commitado | `backend/src/prisma/dev.db` | Média |
| 5 | Arquivos de cobertura commitados | `backend/coverage/tmp/` | Baixa |
| 6 | `users.json` com senhas hasheadas no Git | `backend/src/database/users.json` | Média |

### 1.4.6. A07 — Identification and Authentication Failures

- **Sem refresh token** — usuário forçado a re-logar após 8h
- **Sem single-session enforcement** — múltiplos devices com mesmo token
- **Sem logout server-side** — token válido até expirar
- **Sem log de tentativas de login falhas** (audit trail de auth)
- `standalone_users_server.js` (órfão) expõe endpoint `GET /api/users` sem autenticação nenhuma — se algum dia for colocado em produção por engano, vaza lista completa de usuários

### 1.4.7. A09 — Security Logging and Monitoring Failures

- Logging via `console.log`/`console.error` — Vercel captura, mas sem contexto (sem request-id, sem user-id, sem timestamp estruturado)
- `tb_log_auditoria` referenciada mas **não existe no schema** — auditoria é silenciosamente perdida
- Sem ferramenta de APM (Sentry, Axiom, Datadog) — detalhado no ADR-008

### 1.4.8. Exposição de dados sensíveis

| Endpoint | Risco | Análise |
|---|---|---|
| `POST /api/users/login` | OK | Retorna apenas `{ token, id, nome, email, role }` — sem `senha` |
| `GET /admin/users` | OK | `select` limita campos — apenas `id, nome, username, role, funcao` |
| `GET /api/obras/:id` | OK | Aplica `requireObraAccess` e filtra `financeiro` conforme nível |
| `GET /admin/professionals` | ⚠️ | Retorna certificações e registros profissionais — avaliar se é LGPD-sensível |

**Conclusão A01-A09:** Em ambiente de **produção aberto ao público**, os itens críticos (CORS, JWT fallback, ausência de rate limit, rotas admin sem RBAC) são bloqueadores. Para ambiente **acadêmico interno** (defesa de banca com ~10 usuários de teste), representam débito técnico alto mas não impeditivo.

---

## 1.5. Análise de prontidão para Vercel

### 1.5.1. Bloqueadores de deploy serverless

Vercel Functions são stateless, têm filesystem efêmero (`/tmp` é a única área gravável durante execução, apagada ao fim) e têm timeout padrão de 10 segundos (Hobby) / 60 segundos (Pro). O backend atual **não atende** a essas premissas em 3 pontos:

| # | Bloqueador | Arquivo | Impacto |
|---|---|---|---|
| 1 | `multer.diskStorage` grava em `/uploads` relativo ao código | `uploadMiddleware.js:6-20` | **Crítico** — gravação funciona, mas arquivo some no próximo cold start |
| 2 | `app.use('/uploads', express.static(UPLOADS_DIR))` | `server.js:21` | **Crítico** — pasta efêmera, nunca retornará o arquivo |
| 3 | `storageService.deleteFile()` usa `fs.unlinkSync()` | `storageService.js` | Médio — silenciosamente falha ou apaga arquivo efêmero |
| 4 | `server.js` na raiz em conflito com `backend/src/server.js` | `server.js` (raiz) | Baixo (não é importado), mas pode confundir detecção da Vercel |
| 5 | `app.listen` com condição `!process.env.VERCEL` | `backend/src/server.js:37-41` | ✅ OK — Vercel define `VERCEL=1` automaticamente |
| 6 | Sem connection pooling Prisma explícito | `config/prisma.js` | Médio — em cold starts múltiplos, abre conexões extras ao Postgres |

### 1.5.2. Ajustes necessários no `vercel.json`

Configuração atual (`backend/vercel.json`):

```json
{
  "version": 2,
  "builds": [{ "src": "src/server.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "src/server.js" }]
}
```

**Problemas:**
- Usa sintaxe `builds` + `routes` legada (Vercel v1-ish). Recomendado migrar para `functions` + `rewrites` da API moderna
- Sem `maxDuration` — endpoints pesados (ex: `criarObra` com transação) podem estourar timeout default
- Sem `regions` — latência não controlada

**Config recomendada (formato moderno):**

```json
{
  "functions": { "src/server.js": { "maxDuration": 30 } },
  "rewrites": [{ "source": "/(.*)", "destination": "/src/server.js" }],
  "regions": ["gru1"]
}
```

### 1.5.3. Frontend na Vercel

- **Sem `vercel.json` no frontend** — Vercel usa detecção automática de Vite, OK
- **Sem `.vercelignore`** — todo o monorepo é enviado (inclui `backend/uploads/`, `.vite/`, `coverage/`)

### 1.5.4. Variáveis de ambiente necessárias

**Backend (atual):**

| Variável | Origem | Obrigatória? | Default |
|---|---|---|---|
| `DATABASE_URL` | Postgres connection string | ✅ | — |
| `JWT_SECRET` | Secret de assinatura | ⚠️ Fallback perigoso | `"SUPER_SECRET"` |
| `PORT` | Só usada localmente | ❌ | 5000 |
| `NODE_ENV` | Condicional de listen | ❌ | `development` |
| `VERCEL` | Auto-definida pela Vercel | ❌ auto | — |
| `STORAGE_PROVIDER` | `local` ou `s3` | ❌ | `local` |
| `HOST` | Usado em alguns logs | ❌ | `localhost` |

**Backend (necessárias para produção, faltantes):**

| Variável | Propósito |
|---|---|
| `FRONTEND_URL` | Para configurar CORS corretamente |
| `STORAGE_BUCKET` | Bucket S3/R2 (após migração) |
| `STORAGE_ACCESS_KEY` | — |
| `STORAGE_SECRET_KEY` | — |
| `STORAGE_REGION` | — |
| `STORAGE_PUBLIC_URL_BASE` | URL base para arquivos |
| `SENTRY_DSN` (opcional) | Observabilidade — ADR-008 |

**Frontend (atual):**

| Variável | Origem | Default |
|---|---|---|
| `VITE_API_URL` | URL do backend | `http://localhost:5000` |

**Frontend (necessárias, faltantes):**

| Variável | Propósito |
|---|---|
| `VITE_APP_NAME` | Nome exibido no Helmet |
| `VITE_SENTRY_DSN` | Sentry browser |
| `VITE_ENV` | `development` / `staging` / `production` |
| `VITE_GOOGLE_MAPS_KEY` | (se feature de mapa) |

### 1.5.5. Migração do `multer.diskStorage`

Opções detalhadas no ADR-002 (artefato 03). Resumo:

| Opção | Prós | Contras |
|---|---|---|
| Supabase Storage | Gratuito para uso acadêmico; API simples; SDK JS maduro | Latência AWS us-east-1 por padrão |
| Cloudflare R2 | Preço baixo; egress grátis; S3-compatível | SDK menos maduro; sem região BR |
| AWS S3 | Padrão da indústria; ecosistema amplo | Custo de egress; setup inicial mais complexo |

Recomendação antecipada: **Supabase Storage** para MVP (simplicidade + integração com Postgres já hospedado lá), com interface abstrata em `storageService.js` que permita troca futura para R2 ou S3.

---

## 1.6. Débito técnico priorizado

Matriz Esforço × Impacto. **Esforço**: S (<1 dia), M (1-3 dias), L (1 semana), XL (>1 semana). **Impacto**: 1 (cosmético) a 5 (crítico de produção). **Prioridade**: P0 (fazer primeiro, bloqueia deploy), P1 (Semana 1-4), P2 (Mês 2-3), P3 (Mês 4-6).

| # | Item | Categoria | Esforço | Impacto | Prioridade |
|---|---|---|---|---|---|
| 1 | Remover fallback `JWT_SECRET="SUPER_SECRET"` | Segurança | S | 5 | **P0** |
| 2 | Proteger `GET /admin/metrics/global` com `requireRole` | Segurança | S | 5 | **P0** |
| 3 | Proteger `DELETE /financeiro/:id` com `requireObraAccess` | Segurança | S | 5 | **P0** |
| 4 | Fechar CORS para `FRONTEND_URL` | Segurança | S | 5 | **P0** |
| 5 | Remover `dev.db` do Git + adicionar `.gitignore` | Higiene | S | 3 | **P0** |
| 6 | Deletar `server.js` órfão na raiz | Higiene | S | 2 | **P0** |
| 7 | Deletar `schema.prisma.postgres` duplicado | Higiene | S | 3 | **P0** |
| 8 | Criar `.env.example` backend + frontend | Developer Experience | S | 3 | **P0** |
| 9 | Criar `.vercelignore` | Deploy | S | 3 | **P0** |
| 10 | Migrar uploads para Supabase Storage | Deploy | M | 5 | **P1** |
| 11 | Adicionar `express-rate-limit` em `/login` e `/register` | Segurança | S | 4 | **P1** |
| 12 | Adicionar `helmet` + headers de segurança | Segurança | S | 4 | **P1** |
| 13 | Criar `tb_log_auditoria` (referência quebrada no código) | Dados | M | 3 | **P1** |
| 14 | Padronizar respostas `{ data, error, meta }` | API | M | 4 | **P1** |
| 15 | Middleware global de erros | API | M | 4 | **P1** |
| 16 | Validação com Zod em todas as rotas | API/Segurança | L | 4 | **P1** |
| 17 | Consolidar seeds (`src/prisma/seed.js` único) | Higiene | S | 2 | **P1** |
| 18 | Deletar 10+ arquivos órfãos de backend | Higiene | S | 3 | **P1** |
| 19 | Consolidar `frontend/src/view/` em `pages/` | Arquitetura FE | XL | 4 | **P2** |
| 20 | Refatorar `DashboardDinamico.jsx` (966 linhas) | Arquitetura FE | L | 3 | **P2** |
| 21 | Service layer entre controllers e Prisma | Arquitetura BE | XL | 4 | **P2** |
| 22 | Testes de integração com banco real (superar mocks) | Qualidade | L | 5 | **P2** |
| 23 | Corrigir `onDelete` de `tb_etapa`, `tb_requisicao`, `tb_usuario_obra` | Dados | S | 3 | **P2** |
| 24 | Adicionar índices em `tb_financeiro_obra.id_obra`, etc. | Performance | S | 3 | **P2** |
| 25 | Interceptor de fetch centralizado no frontend (401, retry, timeout) | Arquitetura FE | M | 4 | **P2** |
| 26 | Migração progressiva para TypeScript | Qualidade | XL | 4 | **P2** |
| 27 | Refresh token + logout server-side | Segurança | L | 3 | **P2** |
| 28 | Observabilidade (Sentry) | Operação | M | 4 | **P2** |
| 29 | Testes E2E (Playwright) de fluxos críticos | Qualidade | L | 4 | **P3** |
| 30 | Cache de `requireObraAccess` (reduzir queries repetidas) | Performance | M | 3 | **P3** |
| 31 | Migração de `multer.diskStorage` → memoryStorage + stream direto ao S3 | Performance | M | 3 | **P3** |
| 32 | i18n (react-intl) | Produto | L | 2 | **P3** |
| 33 | Consolidar deps duplicadas entre `package.json` raiz e `backend/package.json` | Higiene | S | 3 | **P1** |

### Resumo de débito por categoria

| Categoria | Qtd itens | P0 | P1 | P2 | P3 |
|---|---|---|---|---|---|
| Segurança | 10 | 4 | 3 | 3 | 0 |
| Arquitetura BE | 5 | 0 | 2 | 3 | 0 |
| Arquitetura FE | 4 | 0 | 0 | 3 | 1 |
| Dados / Prisma | 3 | 0 | 1 | 2 | 0 |
| Deploy / Vercel | 3 | 2 | 1 | 0 | 0 |
| Higiene / limpeza | 6 | 3 | 3 | 0 | 0 |
| Qualidade / testes | 3 | 0 | 0 | 2 | 1 |

**Total:** 33 itens. **P0 (Semana 1):** 9 itens. **P1 (Mês 1):** 10 itens. **P2 (Meses 2-3):** 11 itens. **P3 (Meses 4-6):** 3 itens.

---

## Conclusão da Fase 1

O Obra Integrada é um projeto acadêmico **maduro em escopo funcional** (multi-tenancy, RBAC com 8 papéis, upload de arquivos, auditoria geográfica de diários) e **imaturo em disciplina de engenharia** (testes mock, ausência de validação declarativa, dependências duplicadas, arquivos órfãos, Git com artefatos de build). Essa combinação é típica de projetos onde o foco esteve em *fazer funcionar* — perfeitamente razoável para 2 anos de TCC.

Nenhum dos problemas listados é irrecuperável. O caminho é o **esforço de ~4 semanas concentrado em higiene + fundação** (P0 + P1 = 19 itens, totalizando estimados 3-4 pessoas-semana), após o qual o projeto estará pronto para crescer com qualidade no horizonte de 18 meses restantes. O detalhamento de como executar está no artefato 03 (Plano de Refatoração).

Seguem-se as fases 2 (oportunidades de produto), 3 (plano de refatoração técnica) e 4 (workflow de equipe).

# Matriz de Controle de Acesso (RBAC) — Obra Integrada

**Última atualização:** 2026-05-07
**Versão:** 1.0
**Responsável:** Equipe de desenvolvimento (módulo RBAC + Auth)

---

## 1. O que é este documento

Este documento define **quem pode fazer o quê** na plataforma Obra Integrada. É a **fonte da verdade negocial** do controle de acesso — o código deve refletir o que está aqui, não o contrário.

### Onde a matriz vive no código

A implementação técnica desta matriz está em **dois arquivos espelhados**:

- `backend/src/config/permissions.js` — fonte canônica, lida pelos middlewares
- `frontend/vite-project/src/utils/permissions.js` — espelho usado pelos guards de UI

Ambos são mantidos manualmente sincronizados até o projeto migrar para workspaces. O backend **sempre valida** as permissões reais em cada requisição — o frontend apenas controla a visibilidade dos componentes.

### Princípios do nosso RBAC

1. **Defesa em profundidade** — toda ação restrita é checada no backend, mesmo que o frontend já esconda o botão.
2. **Multi-tenancy nativo** — acesso a uma obra exige *vínculo* (via `tb_usuario_obra` ou `tb_obra_cliente`), independente da role.
3. **Princípio do menor privilégio** — permissão ausente = negada. Não há "default permite".
4. **Roles são planas, permissões granulares** — não usamos hierarquia de roles. Cada perfil tem seu conjunto explícito de permissões.

---

## 2. Catálogo de perfis

A plataforma define **8 perfis ativos** mais um fallback (`USER`) para roles desconhecidas.

| Perfil | Categoria | Quem é | Escopo de atuação |
|---|---|---|---|
| `ADMIN_MASTER` | Plataforma | Equipe interna do SaaS Obra Integrada | Tudo, em todas as construtoras |
| `ADMIN` | Plataforma | Suporte interno do SaaS | Leitura ampla, sem destruir dados |
| `PROPRIETARIO` | Construtora | Dono da empresa cliente | Tudo dentro da própria construtora |
| `RESPONSAVEL` | Obra | Engenheiro responsável técnico | Tudo das obras em que é responsável ou está vinculado |
| `ESTAGIARIO` 🆕 | Obra | Estagiário de engenharia / trainee | Leitura ampla nas obras vinculadas + criar diário |
| `MESTRE` 🚧 | Obra | Mestre de obras | Diário, tarefas e equipe das obras vinculadas |
| `TRABALHADOR` | Obra | Pedreiro, ajudante, eletricista, etc. | Suas tarefas + leitura do diário |
| `CLIENTE` | Cliente | Dono da obra (quem encomendou) | Visualização total da própria obra (read-only) |
| `USER` | Fallback | Qualquer role desconhecida | Apenas próprio perfil |

**Status de implementação:**
- ✅ Implementado: `ADMIN_MASTER`, `ADMIN`, `PROPRIETARIO`, `RESPONSAVEL`, `TRABALHADOR`, `CLIENTE`, `USER`
- 🆕 Próximo PR: `ESTAGIARIO` (`feature/rbac-add-estagiario`)
- 🚧 Futuro: `MESTRE`

### Roles que foram removidas em PRs anteriores

Por simplicidade e para alinhar backend ↔ frontend, removemos perfis que nunca foram usados de verdade ou estavam duplicados:

`MASTER`, `DEV`, `FIN`, `RH`, `SUPORTE`, `ADMIN_DEV`, `ADMIN_FIN`, `ADMIN_RH`, `CONVIDADO_CLIENTE`, `PEDREIRO`, `AJUDANTE`

Se algum dia precisarem voltar, voltam — mas não devem ser revividos sem repensar a matriz.

---

## 3. Vocabulário de permissões

São **21 permissões granulares** organizadas por área. A regra de nomenclatura é:

- `ver_<entidade>` — leitura
- `criar_<entidade>` — criação
- `editar_<entidade>` — edição
- `excluir_<entidade>` — exclusão definitiva
- `gerenciar_<entidade>` — equivale a criar + editar + excluir
- `auditar_<entidade>` — aprovar/reprovar (workflow de auditoria)

### Plataforma

| Permissão | O que destrava |
|---|---|
| `ver_metricas_plataforma` | Dashboard global do SaaS (métricas agregadas de todas as construtoras) |
| `gerenciar_clientes` | CRUD de empresas-cliente (`tb_cliente`) |
| `impersonar` | Logar como outro usuário (modo de suporte/debug) |

### Obras

| Permissão | O que destrava |
|---|---|
| `ver_obras` | Listagem e detalhes de obras |
| `criar_obra` | Botão "Nova Obra", endpoint POST de obra |
| `editar_obra` | Editar dados de uma obra |
| `excluir_obra` | Excluir obra (operação cascata em diário, tarefas, etc.) |

### Diário de obra

| Permissão | O que destrava |
|---|---|
| `ver_diario` | Listar entradas de diário |
| `criar_diario` | Postar nova entrada (com foto, GPS) |
| `auditar_diario` | Aprovar/reprovar entrada (`status_auditoria`) |
| `excluir_diario` | Apagar entrada do diário |

### Tarefas

| Permissão | O que destrava |
|---|---|
| `ver_tarefas` | Listar tarefas |
| `gerenciar_tarefas` | Criar, editar e excluir tarefa |
| `atualizar_status_tarefa` | Mudar status/percentual de tarefas atribuídas a si |

### Financeiro

| Permissão | O que destrava |
|---|---|
| `ver_financeiro` | Ler lançamentos financeiros |
| `gerenciar_financeiro` | Criar, editar e excluir lançamentos |

### Equipe e RH

| Permissão | O que destrava |
|---|---|
| `ver_equipe` | Ver membros vinculados à obra |
| `gerenciar_equipe` | Adicionar/remover membros da obra |
| `ver_rh` | Listar funcionários (módulo RH) |
| `gerenciar_usuarios` | CRUD de funcionários (cadastro, edição, inativação) |

### Conta

| Permissão | O que destrava |
|---|---|
| `ver_perfil` | Visualizar e editar a própria conta |

### Especiais

| Permissão | O que destrava |
|---|---|
| `is_readonly` | Marca usuário como visualizador — desabilita ações de escrita na UI mesmo onde tem permissão de leitura |

---

## 4. Matriz de acessos

Esta é **a tabela canônica** que cruza perfis com permissões.

**Legenda:**
- ✅ tem a permissão
- ❌ não tem
- 👁 leitura apenas (variante de "tem", mas com restrição na UI)

### Permissões da Plataforma

| Permissão | ADMIN_MASTER | ADMIN | PROPRIETARIO | RESPONSAVEL | ESTAGIARIO | MESTRE | TRABALHADOR | CLIENTE | USER |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `ver_metricas_plataforma` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `gerenciar_clientes` | ✅ | 👁 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `impersonar` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Permissões de Obras

| Permissão | ADMIN_MASTER | ADMIN | PROPRIETARIO | RESPONSAVEL | ESTAGIARIO | MESTRE | TRABALHADOR | CLIENTE | USER |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `ver_obras` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| `criar_obra` | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `editar_obra` | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `excluir_obra` | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Permissões de Diário

| Permissão | ADMIN_MASTER | ADMIN | PROPRIETARIO | RESPONSAVEL | ESTAGIARIO | MESTRE | TRABALHADOR | CLIENTE | USER |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `ver_diario` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| `criar_diario` | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `auditar_diario` | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `excluir_diario` | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Permissões de Tarefas

| Permissão | ADMIN_MASTER | ADMIN | PROPRIETARIO | RESPONSAVEL | ESTAGIARIO | MESTRE | TRABALHADOR | CLIENTE | USER |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `ver_tarefas` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| `gerenciar_tarefas` | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `atualizar_status_tarefa` | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |

### Permissões de Financeiro

| Permissão | ADMIN_MASTER | ADMIN | PROPRIETARIO | RESPONSAVEL | ESTAGIARIO | MESTRE | TRABALHADOR | CLIENTE | USER |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `ver_financeiro` | ✅ | 👁 | ✅ | ✅ | ❌ | ❌ | ❌ | 👁 | ❌ |
| `gerenciar_financeiro` | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Permissões de Equipe e RH

| Permissão | ADMIN_MASTER | ADMIN | PROPRIETARIO | RESPONSAVEL | ESTAGIARIO | MESTRE | TRABALHADOR | CLIENTE | USER |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `ver_equipe` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| `gerenciar_equipe` | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `ver_rh` | ✅ | 👁 | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `gerenciar_usuarios` | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Permissões de Conta e Especiais

| Permissão | ADMIN_MASTER | ADMIN | PROPRIETARIO | RESPONSAVEL | ESTAGIARIO | MESTRE | TRABALHADOR | CLIENTE | USER |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `ver_perfil` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `is_readonly` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |

---

## 5. Regras transversais

Algumas regras valem **independente da matriz**:

### 5.1. Vínculo com obra é pré-requisito

Mesmo um `RESPONSAVEL` ou `TRABALHADOR` com todas as permissões só consegue agir em obras às quais está **vinculado** (via `tb_usuario_obra` ou sendo `id_usuario_responsavel` da obra).

O middleware `requireObraAccess` valida esse vínculo ANTES de qualquer permissão de ação.

### 5.2. Multi-tenancy do PROPRIETARIO

`PROPRIETARIO` acessa obras da **própria empresa** via `id_cliente`. A obra precisa estar vinculada à empresa do proprietário (`tb_obra_cliente`). Sem `id_cliente`, o middleware retorna 403.

### 5.3. Roles de plataforma ignoram vínculo

`ADMIN_MASTER` e `ADMIN` **ignoram** a checagem de `tb_usuario_obra` — eles podem acessar qualquer obra, em qualquer construtora, para fins de suporte.

### 5.4. Modo somente leitura (`is_readonly`)

Usuários com `is_readonly = true` (apenas `CLIENTE` por enquanto) têm a UI bloqueada para qualquer ação de escrita, mesmo onde a permissão técnica permitiria. O componente `ReadOnlyGuard` no frontend implementa isso.

### 5.5. Impersonação preserva o admin original

Quando `ADMIN_MASTER` impersona outro usuário, o token do admin original fica preservado em `localStorage` (`originalAdminUser`) e a sessão entra em modo **read-only forçado** — o admin não pode fazer alterações usando a identidade da vítima.

---

## 6. Aplicação no Backend

Cada rota da API recebe a combinação de middlewares conforme a tabela abaixo. **Todas** exigem `authMiddleware` (autenticação JWT) primeiro.

### Auth e Usuários

| Rota | Middlewares adicionais |
|---|---|
| `POST /api/users/register` | (público) |
| `POST /api/users/login` | (público) |
| `POST /api/users/formulario` | (público) |
| `GET /api/users/profile` | `authMiddleware` |
| `GET /api/usuarios-disponiveis` | `authMiddleware` |
| `GET /api/admin/users` | `requirePermissao('gerenciar_usuarios')` |
| `PUT /api/admin/users/:id/role` | `requireRole('ADMIN_MASTER', 'PROPRIETARIO')` |

### Obras

| Rota | Middlewares adicionais |
|---|---|
| `GET /api/obras` | `requirePermissao('ver_obras')` |
| `POST /api/obras` | `requirePermissao('criar_obra')` |
| `GET /api/obras/:id` | `requireObraAccess()` |
| `PUT /api/obras/:id` | `requireObraAccess('total')`, `requirePermissao('editar_obra')` |
| `DELETE /api/obras/:id` | `requireObraAccess('total')`, `requirePermissao('excluir_obra')` |

### Diário

| Rota | Middlewares adicionais |
|---|---|
| `GET /api/obras/:id/diario` | `requireObraAccess()`, `requirePermissao('ver_diario')` |
| `POST /api/obras/:id/diario` | `requireObraAccess()`, `requirePermissao('criar_diario')` |
| `PATCH /api/diario/:id/auditoria` | `requirePermissao('auditar_diario')` |
| `DELETE /api/diario/:id` | `requirePermissao('excluir_diario')` |

### Tarefas

| Rota | Middlewares adicionais |
|---|---|
| `GET /api/obras/:id/tarefas` | `requireObraAccess()`, `requirePermissao('ver_tarefas')` |
| `POST /api/obras/:id/tarefas` | `requireObraAccess()`, `requirePermissao('gerenciar_tarefas')` |
| `PATCH /api/tarefas/:id/status` | `requirePermissao('atualizar_status_tarefa')` |
| `DELETE /api/tarefas/:id` | `requirePermissao('gerenciar_tarefas')` |

### Financeiro

| Rota | Middlewares adicionais |
|---|---|
| `GET /api/obras/:id/financeiro` | `requireObraAccess()`, `requirePermissao('ver_financeiro')` |
| `POST /api/obras/:id/financeiro` | `requireObraAccess('total')`, `requirePermissao('gerenciar_financeiro')` |
| `DELETE /api/financeiro/:id` | `requirePermissao('gerenciar_financeiro')` |

### RH

| Rota | Middlewares adicionais |
|---|---|
| `GET /api/rh/funcionarios` | `requirePermissao('ver_rh')` |
| `POST /api/rh/funcionarios` | `requirePermissao('gerenciar_usuarios')` |
| `PUT /api/rh/funcionarios/:id` | `requirePermissao('gerenciar_usuarios')` |
| `DELETE /api/rh/funcionarios/:id` | `requirePermissao('gerenciar_usuarios')` |

### Admin

| Rota | Middlewares adicionais |
|---|---|
| `GET /api/admin/metrics/global` | `requirePermissao('ver_metricas_plataforma')` |
| `GET /api/admin/health` | `requireRole('ADMIN_MASTER', 'ADMIN')` |
| `POST /api/admin/impersonate` | `requirePermissao('impersonar')` |
| `GET /api/admin/clientes` | `requirePermissao('gerenciar_clientes')` |

> **Status:** A aplicação dessas rotas será feita no PR `feature/rbac-backend-rotas` (próximo na fila após o `feature/rbac-add-estagiario`). Algumas rotas hoje estão sem middleware de autorização e serão corrigidas nesse PR.

---

## 7. Aplicação no Frontend

Cada elemento de UI sensível recebe um `<PermissaoGuard>` ou condicional inline. O componente vive em `frontend/vite-project/src/components/Guards/PermissaoGuard.jsx`.

### Páginas (rotas)

| Rota | Guard de página |
|---|---|
| `/dashboard` | `<ProtectedRoute>` (apenas autenticado) |
| `/obras` | `<PermissaoGuard permissao="ver_obras" redirectToRestricted>` |
| `/obra/:id` | `<PermissaoGuard permissao="ver_obras" redirectToRestricted>` |
| `/calendar` | `<PermissaoGuard permissao="ver_tarefas" redirectToRestricted>` |
| `/documentos` | `<PermissaoGuard permissao="ver_diario" redirectToRestricted>` |
| `/financeiro` | `<PermissaoGuard permissao="ver_financeiro" redirectToRestricted>` |
| `/equipe` | `<PermissaoGuard permissao="ver_equipe" redirectToRestricted>` |
| `/rh` | `<PermissaoGuard permissao="ver_rh" redirectToRestricted>` |
| `/profile` | `<PermissaoGuard permissao="ver_perfil" redirectToRestricted>` |

### Itens da sidebar

A `AppSidebar.tsx` filtra itens por permissão antes de renderizar:

| Item de menu | Mostrar se |
|---|---|
| Dashboard | sempre (autenticado) |
| Minhas Obras | `hasPermissao('ver_obras')` |
| Diário | `hasPermissao('ver_diario')` |
| Tarefas / Calendário | `hasPermissao('ver_tarefas')` |
| Financeiro | `hasPermissao('ver_financeiro')` |
| Equipe | `hasPermissao('ver_equipe')` |
| Gestão RH | `hasPermissao('ver_rh')` |
| Clientes (admin) | `hasPermissao('gerenciar_clientes')` |
| Métricas (admin) | `hasPermissao('ver_metricas_plataforma')` |
| Minha Conta | sempre (autenticado) |

### Botões e ações dentro das páginas

| Tela | Elemento | Guard |
|---|---|---|
| `MinhasObrasPage` | Botão "Nova Obra" | `<PermissaoGuard permissao="criar_obra">` |
| `ObraPage` | Botão "Editar Obra" | `<PermissaoGuard permissao="editar_obra">` |
| `ObraPage` | Botão "Excluir Obra" | `<PermissaoGuard permissao="excluir_obra">` |
| `ObraDiary` | Botão "Nova Entrada" | `<PermissaoGuard permissao="criar_diario">` |
| `ObraDiary` | Ações Aprovar/Reprovar | `<PermissaoGuard permissao="auditar_diario">` |
| `ObraDiary` | Botão "Excluir entrada" | `<PermissaoGuard permissao="excluir_diario">` |
| `ObraTasks` | Botões "Nova Tarefa", "Editar", "Excluir" | `<PermissaoGuard permissao="gerenciar_tarefas">` |
| `ObraTasks` | Marcar tarefa como concluída | `<PermissaoGuard permissao="atualizar_status_tarefa">` |
| `ObraFinanceiro` | Botões CRUD | `<PermissaoGuard permissao="gerenciar_financeiro">` |
| `GestaoRH` | "Cadastrar funcionário", "Editar", "Inativar" | `<PermissaoGuard permissao="gerenciar_usuarios">` |
| `EquipeOrganograma` | Adicionar/remover membro | `<PermissaoGuard permissao="gerenciar_equipe">` |

> **Status:** A aplicação dessas guards será feita no PR `feature/rbac-frontend-guards` (após o backend). Algumas já estão aplicadas; o PR vai padronizar e completar.

---

## 8. Roteiro de testes por perfil

Para validar a matriz, criar 1 usuário de cada perfil no seed e executar este roteiro:

| Conta de teste | Perfil esperado |
|---|---|
| `admin@obras.com` | ADMIN_MASTER |
| `suporte@obras.com` | ADMIN |
| `diretoria@vanguarda.com.br` | PROPRIETARIO |
| `engenheiro@vanguarda.com.br` | RESPONSAVEL |
| `estagiario@vanguarda.com.br` 🆕 | ESTAGIARIO |
| `mestre@vanguarda.com.br` 🚧 | MESTRE |
| `pedreiro@vanguarda.com.br` | TRABALHADOR |
| `cliente@vanguarda.com.br` | CLIENTE |

**Senha padrão para todos:** `Senha123!`

### Casos de teste mínimos

1. Login com cada perfil → menu correto na sidebar
2. Tentar acessar `/rh` com perfil sem `ver_rh` → redirecionar pra `/restricted`
3. Tentar `DELETE /api/obras/1` via curl com cada perfil → 200 só pra quem tem `excluir_obra`, 403 pros demais
4. Estagiário cria diário → ✅. Estagiário tenta auditar diário → ❌
5. Cliente vê tudo da obra → ✅, mas todos os botões de ação estão desabilitados (read-only)
6. Trabalhador atualiza status da própria tarefa → ✅. Tenta criar nova tarefa → ❌

---

## 9. Como adicionar um novo perfil

Suponha que você queira adicionar o perfil `MESTRE`. O processo são **3 arquivos** + 1 documentação:

### 9.1. Adicionar a role no backend

Em `backend/src/config/permissions.js`:

1. Acrescentar em `ROLES`:
   ```js
   MESTRE: 'MESTRE',
   ```
2. Acrescentar em `ROLES_OBRA` (se for role de obra):
   ```js
   export const ROLES_OBRA = [ROLES.RESPONSAVEL, ROLES.MESTRE, ROLES.TRABALHADOR];
   ```
3. Acrescentar label em `ROLE_LABELS`:
   ```js
   MESTRE: 'Mestre de Obras',
   ```
4. Acrescentar entrada em `PERMISSOES`:
   ```js
   MESTRE: {
     ver_obras:               true,
     ver_diario:              true,
     criar_diario:            true,
     ver_tarefas:             true,
     gerenciar_tarefas:       true,
     atualizar_status_tarefa: true,
     ver_equipe:              true,
     ver_perfil:              true,
   },
   ```

### 9.2. Espelhar no frontend

Em `frontend/vite-project/src/utils/permissions.js`, repetir as mesmas mudanças. **Os dois arquivos devem ter conteúdo idêntico** (modulo comentário do topo).

### 9.3. Criar usuário de teste no seed

Em `backend/src/prisma/seed.js`, adicionar um `upsert` similar aos existentes, com `role: 'MESTRE'`.

### 9.4. Atualizar este documento

- Acrescentar linha em [§2 Catálogo de perfis](#2-catálogo-de-perfis)
- Adicionar coluna nas tabelas de [§4 Matriz de acessos](#4-matriz-de-acessos)
- Atualizar [§8 Roteiro de testes](#8-roteiro-de-testes-por-perfil)
- Atualizar a seção "Última atualização" no topo

### 9.5. Abrir PR

Branch: `feature/rbac-add-<nome-da-role>`. Commit: `feat(rbac): adiciona role <NOME>`. PR pequeno (~150 linhas).

---

## 10. Como adicionar uma nova permissão

Mesmo processo, com 1 arquivo a mais:

1. **Adicionar a chave** em todas as roles relevantes em `permissions.js` (backend + frontend)
2. **Aplicar no backend** — adicionar `requirePermissao('nova_permissao')` na rota correspondente
3. **Aplicar no frontend** — adicionar `<PermissaoGuard permissao="nova_permissao">` no botão/menu
4. **Documentar** aqui em [§3 Vocabulário de permissões](#3-vocabulário-de-permissões)

---

## 11. Histórico

| Versão | Data | Autor | Mudança |
|---|---|---|---|
| 1.0 | 2026-05-07 | Pedro Miguel | Versão inicial — documenta a matriz após PR `feature/rbac-fonte-unica` |

Atualizações futuras devem ser feitas neste mesmo arquivo, atualizando a tabela acima.

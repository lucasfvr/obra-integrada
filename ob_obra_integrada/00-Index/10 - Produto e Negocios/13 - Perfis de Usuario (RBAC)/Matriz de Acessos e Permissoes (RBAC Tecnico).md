# Matriz de Controle de Acesso (RBAC) ÔÇö Obra Integrada

**├Ültima atualiza├º├úo:** 2026-05-07
**Vers├úo:** 1.0
**Respons├ível:** Equipe de desenvolvimento (m├│dulo RBAC + Auth)

---

## 1. O que ├® este documento

Este documento define **quem pode fazer o qu├¬** na plataforma Obra Integrada. ├ë a **fonte da verdade negocial** do controle de acesso ÔÇö o c├│digo deve refletir o que est├í aqui, n├úo o contr├írio.

### Onde a matriz vive no c├│digo

A implementa├º├úo t├®cnica desta matriz est├í em **dois arquivos espelhados**:

- `backend/src/config/permissions.js` ÔÇö fonte can├┤nica, lida pelos middlewares
- `frontend/vite-project/src/utils/permissions.js` ÔÇö espelho usado pelos guards de UI

Ambos s├úo mantidos manualmente sincronizados at├® o projeto migrar para workspaces. O backend **sempre valida** as permiss├Áes reais em cada requisi├º├úo ÔÇö o frontend apenas controla a visibilidade dos componentes.

### Princ├¡pios do nosso RBAC

1. **Defesa em profundidade** ÔÇö toda a├º├úo restrita ├® checada no backend, mesmo que o frontend j├í esconda o bot├úo.
2. **Multi-tenancy nativo** ÔÇö acesso a uma obra exige *v├¡nculo* (via `tb_usuario_obra` ou `tb_obra_cliente`), independente da role.
3. **Princ├¡pio do menor privil├®gio** ÔÇö permiss├úo ausente = negada. N├úo h├í "default permite".
4. **Roles s├úo planas, permiss├Áes granulares** ÔÇö n├úo usamos hierarquia de roles. Cada perfil tem seu conjunto expl├¡cito de permiss├Áes.

---

## 2. Cat├ílogo de perfis

A plataforma define **8 perfis ativos** mais um fallback (`USER`) para roles desconhecidas.

| Perfil | Categoria | Quem ├® | Escopo de atua├º├úo |
|---|---|---|---|
| `ADMIN_MASTER` | Plataforma | Equipe interna do SaaS Obra Integrada | Tudo, em todas as construtoras |
| `ADMIN` | Plataforma | Suporte interno do SaaS | Leitura ampla, sem destruir dados |
| `PROPRIETARIO` | Construtora | Dono da empresa cliente | Tudo dentro da pr├│pria construtora |
| `RESPONSAVEL` | Obra | Engenheiro respons├ível t├®cnico | Tudo das obras em que ├® respons├ível ou est├í vinculado |
| `ESTAGIARIO` ­ƒåò | Obra | Estagi├írio de engenharia / trainee | Leitura ampla nas obras vinculadas + criar di├írio |
| `MESTRE` ­ƒÜº | Obra | Mestre de obras | Di├írio, tarefas e equipe das obras vinculadas |
| `TRABALHADOR` | Obra | Pedreiro, ajudante, eletricista, etc. | Suas tarefas + leitura do di├írio |
| `CLIENTE` | Cliente | Dono da obra (quem encomendou) | Visualiza├º├úo total da pr├│pria obra (read-only) |
| `USER` | Fallback | Qualquer role desconhecida | Apenas pr├│prio perfil |

**Status de implementa├º├úo:**
- Ô£à Implementado: `ADMIN_MASTER`, `ADMIN`, `PROPRIETARIO`, `RESPONSAVEL`, `TRABALHADOR`, `CLIENTE`, `USER`
- ­ƒåò Pr├│ximo PR: `ESTAGIARIO` (`feature/rbac-add-estagiario`)
- ­ƒÜº Futuro: `MESTRE`

### Roles que foram removidas em PRs anteriores

Por simplicidade e para alinhar backend Ôåö frontend, removemos perfis que nunca foram usados de verdade ou estavam duplicados:

`MASTER`, `DEV`, `FIN`, `RH`, `SUPORTE`, `ADMIN_DEV`, `ADMIN_FIN`, `ADMIN_RH`, `CONVIDADO_CLIENTE`, `PEDREIRO`, `AJUDANTE`

Se algum dia precisarem voltar, voltam ÔÇö mas n├úo devem ser revividos sem repensar a matriz.

---

## 3. Vocabul├írio de permiss├Áes

S├úo **21 permiss├Áes granulares** organizadas por ├írea. A regra de nomenclatura ├®:

- `ver_<entidade>` ÔÇö leitura
- `criar_<entidade>` ÔÇö cria├º├úo
- `editar_<entidade>` ÔÇö edi├º├úo
- `excluir_<entidade>` ÔÇö exclus├úo definitiva
- `gerenciar_<entidade>` ÔÇö equivale a criar + editar + excluir
- `auditar_<entidade>` ÔÇö aprovar/reprovar (workflow de auditoria)

### Plataforma

| Permiss├úo | O que destrava |
|---|---|
| `ver_metricas_plataforma` | Dashboard global do SaaS (m├®tricas agregadas de todas as construtoras) |
| `gerenciar_clientes` | CRUD de empresas-cliente (`tb_cliente`) |
| `impersonar` | Logar como outro usu├írio (modo de suporte/debug) |

### Obras

| Permiss├úo | O que destrava |
|---|---|
| `ver_obras` | Listagem e detalhes de obras |
| `criar_obra` | Bot├úo "Nova Obra", endpoint POST de obra |
| `editar_obra` | Editar dados de uma obra |
| `excluir_obra` | Excluir obra (opera├º├úo cascata em di├írio, tarefas, etc.) |

### Di├írio de obra

| Permiss├úo | O que destrava |
|---|---|
| `ver_diario` | Listar entradas de di├írio |
| `criar_diario` | Postar nova entrada (com foto, GPS) |
| `auditar_diario` | Aprovar/reprovar entrada (`status_auditoria`) |
| `excluir_diario` | Apagar entrada do di├írio |

### Tarefas

| Permiss├úo | O que destrava |
|---|---|
| `ver_tarefas` | Listar tarefas |
| `gerenciar_tarefas` | Criar, editar e excluir tarefa |
| `atualizar_status_tarefa` | Mudar status/percentual de tarefas atribu├¡das a si |

### Financeiro

| Permiss├úo | O que destrava |
|---|---|
| `ver_financeiro` | Ler lan├ºamentos financeiros |
| `gerenciar_financeiro` | Criar, editar e excluir lan├ºamentos |

### Equipe e RH

| Permiss├úo | O que destrava |
|---|---|
| `ver_equipe` | Ver membros vinculados ├á obra |
| `gerenciar_equipe` | Adicionar/remover membros da obra |
| `ver_rh` | Listar funcion├írios (m├│dulo RH) |
| `gerenciar_usuarios` | CRUD de funcion├írios (cadastro, edi├º├úo, inativa├º├úo) |

### Conta

| Permiss├úo | O que destrava |
|---|---|
| `ver_perfil` | Visualizar e editar a pr├│pria conta |

### Especiais

| Permiss├úo | O que destrava |
|---|---|
| `is_readonly` | Marca usu├írio como visualizador ÔÇö desabilita a├º├Áes de escrita na UI mesmo onde tem permiss├úo de leitura |

---

## 4. Matriz de acessos

Esta ├® **a tabela can├┤nica** que cruza perfis com permiss├Áes.

**Legenda:**
- Ô£à tem a permiss├úo
- ÔØî n├úo tem
- ­ƒæü leitura apenas (variante de "tem", mas com restri├º├úo na UI)

### Permiss├Áes da Plataforma

| Permiss├úo | ADMIN_MASTER | ADMIN | PROPRIETARIO | RESPONSAVEL | ESTAGIARIO | MESTRE | TRABALHADOR | CLIENTE | USER |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `ver_metricas_plataforma` | Ô£à | Ô£à | ÔØî | ÔØî | ÔØî | ÔØî | ÔØî | ÔØî | ÔØî |
| `gerenciar_clientes` | Ô£à | ­ƒæü | ÔØî | ÔØî | ÔØî | ÔØî | ÔØî | ÔØî | ÔØî |
| `impersonar` | Ô£à | ÔØî | ÔØî | ÔØî | ÔØî | ÔØî | ÔØî | ÔØî | ÔØî |

### Permiss├Áes de Obras

| Permiss├úo | ADMIN_MASTER | ADMIN | PROPRIETARIO | RESPONSAVEL | ESTAGIARIO | MESTRE | TRABALHADOR | CLIENTE | USER |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `ver_obras` | Ô£à | Ô£à | Ô£à | Ô£à | Ô£à | Ô£à | Ô£à | Ô£à | ÔØî |
| `criar_obra` | Ô£à | ÔØî | Ô£à | Ô£à | ÔØî | ÔØî | ÔØî | ÔØî | ÔØî |
| `editar_obra` | Ô£à | ÔØî | Ô£à | Ô£à | ÔØî | ÔØî | ÔØî | ÔØî | ÔØî |
| `excluir_obra` | Ô£à | ÔØî | Ô£à | ÔØî | ÔØî | ÔØî | ÔØî | ÔØî | ÔØî |

### Permiss├Áes de Di├írio

| Permiss├úo | ADMIN_MASTER | ADMIN | PROPRIETARIO | RESPONSAVEL | ESTAGIARIO | MESTRE | TRABALHADOR | CLIENTE | USER |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `ver_diario` | Ô£à | Ô£à | Ô£à | Ô£à | Ô£à | Ô£à | Ô£à | Ô£à | ÔØî |
| `criar_diario` | Ô£à | ÔØî | Ô£à | Ô£à | Ô£à | Ô£à | ÔØî | ÔØî | ÔØî |
| `auditar_diario` | Ô£à | ÔØî | Ô£à | Ô£à | ÔØî | ÔØî | ÔØî | ÔØî | ÔØî |
| `excluir_diario` | Ô£à | ÔØî | Ô£à | Ô£à | ÔØî | ÔØî | ÔØî | ÔØî | ÔØî |

### Permiss├Áes de Tarefas

| Permiss├úo | ADMIN_MASTER | ADMIN | PROPRIETARIO | RESPONSAVEL | ESTAGIARIO | MESTRE | TRABALHADOR | CLIENTE | USER |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `ver_tarefas` | Ô£à | Ô£à | Ô£à | Ô£à | Ô£à | Ô£à | Ô£à | Ô£à | ÔØî |
| `gerenciar_tarefas` | Ô£à | ÔØî | Ô£à | Ô£à | ÔØî | Ô£à | ÔØî | ÔØî | ÔØî |
| `atualizar_status_tarefa` | Ô£à | ÔØî | Ô£à | Ô£à | Ô£à | Ô£à | Ô£à | ÔØî | ÔØî |

### Permiss├Áes de Financeiro

| Permiss├úo | ADMIN_MASTER | ADMIN | PROPRIETARIO | RESPONSAVEL | ESTAGIARIO | MESTRE | TRABALHADOR | CLIENTE | USER |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `ver_financeiro` | Ô£à | ­ƒæü | Ô£à | Ô£à | ÔØî | ÔØî | ÔØî | ­ƒæü | ÔØî |
| `gerenciar_financeiro` | Ô£à | ÔØî | Ô£à | Ô£à | ÔØî | ÔØî | ÔØî | ÔØî | ÔØî |

### Permiss├Áes de Equipe e RH

| Permiss├úo | ADMIN_MASTER | ADMIN | PROPRIETARIO | RESPONSAVEL | ESTAGIARIO | MESTRE | TRABALHADOR | CLIENTE | USER |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `ver_equipe` | Ô£à | Ô£à | Ô£à | Ô£à | Ô£à | Ô£à | Ô£à | Ô£à | ÔØî |
| `gerenciar_equipe` | Ô£à | ÔØî | Ô£à | Ô£à | ÔØî | ÔØî | ÔØî | ÔØî | ÔØî |
| `ver_rh` | Ô£à | ­ƒæü | Ô£à | Ô£à | ÔØî | ÔØî | ÔØî | ÔØî | ÔØî |
| `gerenciar_usuarios` | Ô£à | ÔØî | Ô£à | ÔØî | ÔØî | ÔØî | ÔØî | ÔØî | ÔØî |

### Permiss├Áes de Conta e Especiais

| Permiss├úo | ADMIN_MASTER | ADMIN | PROPRIETARIO | RESPONSAVEL | ESTAGIARIO | MESTRE | TRABALHADOR | CLIENTE | USER |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `ver_perfil` | Ô£à | Ô£à | Ô£à | Ô£à | Ô£à | Ô£à | Ô£à | Ô£à | Ô£à |
| `is_readonly` | ÔØî | ÔØî | ÔØî | ÔØî | ÔØî | ÔØî | ÔØî | Ô£à | ÔØî |

---

## 5. Regras transversais

Algumas regras valem **independente da matriz**:

### 5.1. V├¡nculo com obra ├® pr├®-requisito

Mesmo um `RESPONSAVEL` ou `TRABALHADOR` com todas as permiss├Áes s├│ consegue agir em obras ├ás quais est├í **vinculado** (via `tb_usuario_obra` ou sendo `id_usuario_responsavel` da obra).

O middleware `requireObraAccess` valida esse v├¡nculo ANTES de qualquer permiss├úo de a├º├úo.

### 5.2. Multi-tenancy do PROPRIETARIO

`PROPRIETARIO` acessa obras da **pr├│pria empresa** via `id_cliente`. A obra precisa estar vinculada ├á empresa do propriet├írio (`tb_obra_cliente`). Sem `id_cliente`, o middleware retorna 403.

### 5.3. Roles de plataforma ignoram v├¡nculo

`ADMIN_MASTER` e `ADMIN` **ignoram** a checagem de `tb_usuario_obra` ÔÇö eles podem acessar qualquer obra, em qualquer construtora, para fins de suporte.

### 5.4. Modo somente leitura (`is_readonly`)

Usu├írios com `is_readonly = true` (apenas `CLIENTE` por enquanto) t├¬m a UI bloqueada para qualquer a├º├úo de escrita, mesmo onde a permiss├úo t├®cnica permitiria. O componente `ReadOnlyGuard` no frontend implementa isso.

### 5.5. Impersona├º├úo preserva o admin original

Quando `ADMIN_MASTER` impersona outro usu├írio, o token do admin original fica preservado em `localStorage` (`originalAdminUser`) e a sess├úo entra em modo **read-only for├ºado** ÔÇö o admin n├úo pode fazer altera├º├Áes usando a identidade da v├¡tima.

---

## 6. Aplica├º├úo no Backend

Cada rota da API recebe a combina├º├úo de middlewares conforme a tabela abaixo. **Todas** exigem `authMiddleware` (autentica├º├úo JWT) primeiro.

### Auth e Usu├írios

| Rota | Middlewares adicionais |
|---|---|
| `POST /api/users/register` | (p├║blico) |
| `POST /api/users/login` | (p├║blico) |
| `POST /api/users/formulario` | (p├║blico) |
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

### Di├írio

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

> **Status:** A aplica├º├úo dessas rotas ser├í feita no PR `feature/rbac-backend-rotas` (pr├│ximo na fila ap├│s o `feature/rbac-add-estagiario`). Algumas rotas hoje est├úo sem middleware de autoriza├º├úo e ser├úo corrigidas nesse PR.

---

## 7. Aplica├º├úo no Frontend

Cada elemento de UI sens├¡vel recebe um `<PermissaoGuard>` ou condicional inline. O componente vive em `frontend/vite-project/src/components/Guards/PermissaoGuard.jsx`.

### P├íginas (rotas)

| Rota | Guard de p├ígina |
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

A `AppSidebar.tsx` filtra itens por permiss├úo antes de renderizar:

| Item de menu | Mostrar se |
|---|---|
| Dashboard | sempre (autenticado) |
| Minhas Obras | `hasPermissao('ver_obras')` |
| Di├írio | `hasPermissao('ver_diario')` |
| Tarefas / Calend├írio | `hasPermissao('ver_tarefas')` |
| Financeiro | `hasPermissao('ver_financeiro')` |
| Equipe | `hasPermissao('ver_equipe')` |
| Gest├úo RH | `hasPermissao('ver_rh')` |
| Clientes (admin) | `hasPermissao('gerenciar_clientes')` |
| M├®tricas (admin) | `hasPermissao('ver_metricas_plataforma')` |
| Minha Conta | sempre (autenticado) |

### Bot├Áes e a├º├Áes dentro das p├íginas

| Tela | Elemento | Guard |
|---|---|---|
| `MinhasObrasPage` | Bot├úo "Nova Obra" | `<PermissaoGuard permissao="criar_obra">` |
| `ObraPage` | Bot├úo "Editar Obra" | `<PermissaoGuard permissao="editar_obra">` |
| `ObraPage` | Bot├úo "Excluir Obra" | `<PermissaoGuard permissao="excluir_obra">` |
| `ObraDiary` | Bot├úo "Nova Entrada" | `<PermissaoGuard permissao="criar_diario">` |
| `ObraDiary` | A├º├Áes Aprovar/Reprovar | `<PermissaoGuard permissao="auditar_diario">` |
| `ObraDiary` | Bot├úo "Excluir entrada" | `<PermissaoGuard permissao="excluir_diario">` |
| `ObraTasks` | Bot├Áes "Nova Tarefa", "Editar", "Excluir" | `<PermissaoGuard permissao="gerenciar_tarefas">` |
| `ObraTasks` | Marcar tarefa como conclu├¡da | `<PermissaoGuard permissao="atualizar_status_tarefa">` |
| `ObraFinanceiro` | Bot├Áes CRUD | `<PermissaoGuard permissao="gerenciar_financeiro">` |
| `GestaoRH` | "Cadastrar funcion├írio", "Editar", "Inativar" | `<PermissaoGuard permissao="gerenciar_usuarios">` |
| `EquipeOrganograma` | Adicionar/remover membro | `<PermissaoGuard permissao="gerenciar_equipe">` |

> **Status:** A aplica├º├úo dessas guards ser├í feita no PR `feature/rbac-frontend-guards` (ap├│s o backend). Algumas j├í est├úo aplicadas; o PR vai padronizar e completar.

---

## 8. Roteiro de testes por perfil

Para validar a matriz, criar 1 usu├írio de cada perfil no seed e executar este roteiro:

| Conta de teste | Perfil esperado |
|---|---|
| `admin@obras.com` | ADMIN_MASTER |
| `suporte@obras.com` | ADMIN |
| `diretoria@vanguarda.com.br` | PROPRIETARIO |
| `engenheiro@vanguarda.com.br` | RESPONSAVEL |
| `estagiario@vanguarda.com.br` ­ƒåò | ESTAGIARIO |
| `mestre@vanguarda.com.br` ­ƒÜº | MESTRE |
| `pedreiro@vanguarda.com.br` | TRABALHADOR |
| `cliente@vanguarda.com.br` | CLIENTE |

**Senha padr├úo para todos:** `Senha123!`

### Casos de teste m├¡nimos

1. Login com cada perfil ÔåÆ menu correto na sidebar
2. Tentar acessar `/rh` com perfil sem `ver_rh` ÔåÆ redirecionar pra `/restricted`
3. Tentar `DELETE /api/obras/1` via curl com cada perfil ÔåÆ 200 s├│ pra quem tem `excluir_obra`, 403 pros demais
4. Estagi├írio cria di├írio ÔåÆ Ô£à. Estagi├írio tenta auditar di├írio ÔåÆ ÔØî
5. Cliente v├¬ tudo da obra ÔåÆ Ô£à, mas todos os bot├Áes de a├º├úo est├úo desabilitados (read-only)
6. Trabalhador atualiza status da pr├│pria tarefa ÔåÆ Ô£à. Tenta criar nova tarefa ÔåÆ ÔØî

---

## 9. Como adicionar um novo perfil

Suponha que voc├¬ queira adicionar o perfil `MESTRE`. O processo s├úo **3 arquivos** + 1 documenta├º├úo:

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

Em `frontend/vite-project/src/utils/permissions.js`, repetir as mesmas mudan├ºas. **Os dois arquivos devem ter conte├║do id├¬ntico** (modulo coment├írio do topo).

### 9.3. Criar usu├írio de teste no seed

Em `backend/src/prisma/seed.js`, adicionar um `upsert` similar aos existentes, com `role: 'MESTRE'`.

### 9.4. Atualizar este documento

- Acrescentar linha em [┬º2 Cat├ílogo de perfis](#2-cat├ílogo-de-perfis)
- Adicionar coluna nas tabelas de [┬º4 Matriz de acessos](#4-matriz-de-acessos)
- Atualizar [┬º8 Roteiro de testes](#8-roteiro-de-testes-por-perfil)
- Atualizar a se├º├úo "├Ültima atualiza├º├úo" no topo

### 9.5. Abrir PR

Branch: `feature/rbac-add-<nome-da-role>`. Commit: `feat(rbac): adiciona role <NOME>`. PR pequeno (~150 linhas).

---

## 10. Como adicionar uma nova permiss├úo

Mesmo processo, com 1 arquivo a mais:

1. **Adicionar a chave** em todas as roles relevantes em `permissions.js` (backend + frontend)
2. **Aplicar no backend** ÔÇö adicionar `requirePermissao('nova_permissao')` na rota correspondente
3. **Aplicar no frontend** ÔÇö adicionar `<PermissaoGuard permissao="nova_permissao">` no bot├úo/menu
4. **Documentar** aqui em [┬º3 Vocabul├írio de permiss├Áes](#3-vocabul├írio-de-permiss├Áes)

---

## 11. Hist├│rico

| Vers├úo | Data | Autor | Mudan├ºa |
|---|---|---|---|
| 1.0 | 2026-05-07 | Pedro Miguel | Vers├úo inicial ÔÇö documenta a matriz ap├│s PR `feature/rbac-fonte-unica` |

Atualiza├º├Áes futuras devem ser feitas neste mesmo arquivo, atualizando a tabela acima.

/**
 * permissions.js
 *
 * Fonte unica da matriz de RBAC do Obra Integrada.
 * Usado por:
 *   - Backend: middlewares de autorizacao (authorizationMiddleware.js)
 *   - Frontend: copia espelhada em frontend/vite-project/src/utils/permissions.js
 *
 * Ao alterar este arquivo, atualizar a copia do frontend no MESMO PR.
 * Quando o projeto migrar para workspaces, esta duplicacao sera extraida
 * para um pacote compartilhado.
 */

// --- Catalogo de roles ----------------------------------------------------
// USER e fallback para qualquer role desconhecida no banco.

export const ROLES = Object.freeze({
  ADMIN_MASTER: 'ADMIN_MASTER',
  ADMIN:        'ADMIN',
  PROPRIETARIO: 'PROPRIETARIO',
  RESPONSAVEL:  'RESPONSAVEL',
  ESTAGIARIO:   'ESTAGIARIO',
  TRABALHADOR:  'TRABALHADOR',
  CLIENTE:      'CLIENTE',
  USER:         'USER',
});

export const ROLES_PLATAFORMA = [ROLES.ADMIN_MASTER, ROLES.ADMIN];
export const ROLES_OBRA = [ROLES.RESPONSAVEL, ROLES.ESTAGIARIO, ROLES.TRABALHADOR];

// --- Labels para exibicao -------------------------------------------------

export const ROLE_LABELS = Object.freeze({
  ADMIN_MASTER: 'Administrador da Plataforma',
  ADMIN:        'Administrador',
  PROPRIETARIO: 'Proprietario',
  RESPONSAVEL:  'Responsavel Tecnico (Engenheiro)',
  ESTAGIARIO:   'Estagiario(a) de Engenharia',
  TRABALHADOR:  'Trabalhador',
  CLIENTE:      'Cliente',
  USER:         'Usuario',
});

// --- Matriz de permissoes -------------------------------------------------
// true = tem permissao. Permissao ausente do objeto = false.

export const PERMISSOES = Object.freeze({
  ADMIN_MASTER: {
    ver_metricas_plataforma: true,
    gerenciar_clientes:      true,
    impersonar:              true,
    ver_obras:               true,
    criar_obra:              true,
    editar_obra:             true,
    excluir_obra:            true,
    ver_diario:              true,
    criar_diario:            true,
    auditar_diario:          true,
    excluir_diario:          true,
    deletar_diario:          true,
    ver_tarefas:             true,
    gerenciar_tarefas:       true,
    atualizar_status_tarefa: true,
    ver_financeiro:          true,
    gerenciar_financeiro:    true,
    ver_equipe:              true,
    gerenciar_equipe:        true,
    ver_rh:                  true,
    gerenciar_usuarios:      true,
    ver_perfil:              true,
  },
  ADMIN: {
    ver_metricas_plataforma: true,
    ver_obras:               true,
    ver_diario:              true,
    ver_tarefas:             true,
    ver_financeiro:          true,
    ver_equipe:              true,
    ver_rh:                  true,
    ver_perfil:              true,
  },
  PROPRIETARIO: {
    ver_obras:               true,
    criar_obra:              true,
    editar_obra:             true,
    excluir_obra:            true,
    ver_diario:              true,
    criar_diario:            true,
    auditar_diario:          true,
    excluir_diario:          true,
    deletar_diario:          true,
    ver_tarefas:             true,
    gerenciar_tarefas:       true,
    atualizar_status_tarefa: true,
    ver_financeiro:          true,
    gerenciar_financeiro:    true,
    ver_equipe:              true,
    gerenciar_equipe:        true,
    ver_rh:                  true,
    gerenciar_usuarios:      true,
    ver_perfil:              true,
  },
  RESPONSAVEL: {
    ver_obras:               true,
    criar_obra:              true,
    editar_obra:             true,
    ver_diario:              true,
    criar_diario:            true,
    auditar_diario:          true,
    excluir_diario:          true,
    deletar_diario:          true,
    ver_tarefas:             true,
    gerenciar_tarefas:       true,
    atualizar_status_tarefa: true,
    ver_financeiro:          true,
    gerenciar_financeiro:    true,
    ver_equipe:              true,
    gerenciar_equipe:        true,
    ver_rh:                  true,
    ver_perfil:              true,
  },
  ESTAGIARIO: {
    ver_obras:               true,
    ver_diario:              true,
    criar_diario:            true,
    ver_tarefas:             true,
    atualizar_status_tarefa: true,
    ver_equipe:              true,
    ver_perfil:              true,
  },
  TRABALHADOR: {
    ver_obras:               true,
    ver_diario:              true,
    ver_tarefas:             true,
    atualizar_status_tarefa: true,
    ver_equipe:              true,
    ver_perfil:              true,
  },
  CLIENTE: {
    ver_obras:               true,
    ver_diario:              true,
    ver_tarefas:             true,
    ver_financeiro:          true,
    ver_equipe:              true,
    ver_perfil:              true,
    is_readonly:             true,
  },
  USER: {
    ver_perfil:              true,
  },
});

// --- Helpers --------------------------------------------------------------

export function getPermissoes(role) {
  return PERMISSOES[role] || PERMISSOES.USER;
}

export function hasPermissao(role, permissao) {
  const perms = getPermissoes(role);
  return !!perms[permissao];
}

export function hasRole(role, ...rolesPermitidos) {
  return rolesPermitidos.includes(role);
}

export function getRoleLabel(role) {
  return ROLE_LABELS[role] || role || 'Usuario';
}

export function isPlataforma(role) {
  return ROLES_PLATAFORMA.includes(role);
}

export function isObra(role) {
  return ROLES_OBRA.includes(role) || role === ROLES.PROPRIETARIO;
}

export function podeImpersonar(role) {
  return hasPermissao(role, 'impersonar');
}

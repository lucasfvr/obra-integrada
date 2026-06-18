/**
 * permissions.js
 *
 * COPIA ESPELHADA DE: backend/src/config/permissions.js
 *
 * O backend e a fonte unica da verdade. Ao alterar a matriz, atualize
 * OS DOIS arquivos no mesmo PR. Quando o projeto migrar para workspaces,
 * essa duplicacao sera extraida para um pacote compartilhado.
 *
 * O backend SEMPRE valida as permissoes reais em cada request.
 * Este arquivo apenas controla a visibilidade de componentes na UI.
 */

// --- Catalogo de roles ----------------------------------------------------

export const ROLES = Object.freeze({
  ADMIN_MASTER: 'ADMIN_MASTER',
  ADMIN:        'ADMIN',
  PROPRIETARIO: 'PROPRIETARIO',
  RH:           'RH',
  RESPONSAVEL:  'RESPONSAVEL',
  ESTAGIARIO:   'ESTAGIARIO',
  TRABALHADOR:  'TRABALHADOR',
  CLIENTE:      'CLIENTE',
  EMPREITEIRA:  'EMPREITEIRA',
  USER:         'USER',
});

export const ROLES_PLATAFORMA = [ROLES.ADMIN_MASTER, ROLES.ADMIN];
export const ROLES_OBRA = [ROLES.RESPONSAVEL, ROLES.ESTAGIARIO, ROLES.TRABALHADOR, ROLES.EMPREITEIRA];

// --- Labels ---------------------------------------------------------------

export const ROLE_LABELS = Object.freeze({
  ADMIN_MASTER: 'Administrador da Plataforma',
  ADMIN:        'Administrador',
  PROPRIETARIO: 'Proprietario',
  RH:           'Gerente de RH',
  RESPONSAVEL:  'Responsavel Tecnico (Engenheiro)',
  ESTAGIARIO:   'Estagiario(a) de Engenharia',
  TRABALHADOR:  'Trabalhador',
  CLIENTE:      'Cliente',
  EMPREITEIRA:  'Representante da Empreiteira (Terceirizado)',
  USER:         'Usuario',
});

// --- Matriz ---------------------------------------------------------------

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
    gerenciar_salario:       true,
    gerenciar_dados_residenciais: true,
    gerenciar_conta_banco:   true,
    gerenciar_ponto_diaria:  true,
    ver_perfil:              true,
  },
  ADMIN: {
    ver_metricas_plataforma: true,
    ver_obras:               true,
    ver_diario:              true,
    ver_tarefas:             true,
    ver_financeiro:          true,
    ver_equipe:              true,
    gerenciar_equipe:        true,
    ver_rh:                  true,
    gerenciar_usuarios:      true,
    gerenciar_salario:       true,
    gerenciar_dados_residenciais: true,
    gerenciar_conta_banco:   true,
    gerenciar_ponto_diaria:  true,
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
    gerenciar_salario:       true,
    gerenciar_dados_residenciais: true,
    gerenciar_conta_banco:   true,
    gerenciar_ponto_diaria:  true,
    ver_perfil:              true,
  },
  RH: {
    ver_rh:                  true,
    gerenciar_usuarios:      true,
    ver_equipe:              true,
    gerenciar_salario:       true,
    gerenciar_dados_residenciais: true,
    gerenciar_conta_banco:   true,
    gerenciar_ponto_diaria:  true,
    ver_perfil:              true,
    ver_obras:               true,
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
  EMPREITEIRA: {
    ver_obras:               true,
    ver_diario:              true,
    criar_diario:            true,
    ver_tarefas:             true,
    atualizar_status_tarefa: true,
    ver_equipe:              true,
    ver_rh:                  true,
    gerenciar_usuarios:      true,
    ver_perfil:              true,
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

// --- Compat: getProfile (usado em AppSidebar.tsx) -------------------------
// No PR #2 essa funcao ganhara logica baseada em "funcao" (Mestre, Estagiario).
// Por enquanto retorna a role direto.

export function getProfile(role /*, funcao */) {
  return role || ROLES.USER;
}


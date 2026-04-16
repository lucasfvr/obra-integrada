/**
 * permissions.js
 *
 * Espelho do RBAC do backend — define o que cada role pode fazer no frontend.
 * O backend SEMPRE valida as permissoes reais.
 * Este arquivo controla a visibilidade de componentes na UI.
 */

// ─── Grupo de roles (Sincronizado com backend/src/seedTestes.js) ────────────
export const ROLES_PLATAFORMA = [
  'ADMIN_MASTER', 
  'ADMIN_DEV', 
  'ADMIN_FIN', 
  'ADMIN_RH', 
  'ADMIN'
];

export const ROLES_OBRA = [
  'PROPRIETARIO',
  'RESPONSAVEL', 
  'CLIENTE', 
  'TRABALHADOR'
];

// Mapeamento de roles (Backend Keys -> Frontend Labels)
export const ROLE_LABELS = {
  ADMIN_MASTER:      'Administrador Master',
  ADMIN_DEV:         'Desenvolvedor',
  ADMIN_FIN:         'Gestor Financeiro',
  ADMIN_RH:          'Gestor de Pessoas',
  ADMIN:             'Administrador',
  PROPRIETARIO:      'Proprietário',
  RESPONSAVEL:       'Responsável Técnico (Engenheiro)',
  CLIENTE:           'Cliente (Dono)',
  CONVIDADO_CLIENTE: 'Espectador (Convidado)',
  TRABALHADOR:       'Trabalhador',
  MESTRE:            'Mestre de Obras',
  PEDREIRO:          'Pedreiro',
  AJUDANTE:          'Ajudante',
  USER:              'Usuário',
};

// ─── Mapa de permissoes por role ──────────────────────────────────────────────
export const PERMISSOES = {
  ADMIN_MASTER: {
    ver_metricas_plataforma: true,
    ver_metricas_globais:    true,
    ver_clientes:            true,
    gerenciar_usuarios:      true,
    impersonar:              true,
    ver_logs:                true,
    ver_obras:               true, // Global
    criar_obra:              true,
    ver_diario:              true,
    ver_tarefas:             true,
    gerenciar_tarefas:       true,
    atualizar_status_tarefa: true,
    ver_financeiro_global:   true,
    ver_financeiro_obra:     true,
    ver_materiais_obra:      true,
    ver_equipe_obra:         true,
    ver_perfil:              true,
    configuracoes_sistema:   true,
  },
  // Nível 1 - Administrador da Plataforma
  ADMIN: {
    ver_metricas_plataforma: true,
    ver_metricas_globais:    true,
    ver_clientes:            true,
    gerenciar_usuarios:      true,
    impersonar:              true,
    ver_logs:                true,
    ver_obras:               true,
    criar_obra:              true,
    ver_diario:              true,
    ver_tarefas:             true,
    gerenciar_tarefas:       true,
    atualizar_status_tarefa: true,
    ver_financeiro_global:   true,
    ver_financeiro_obra:     true,
    ver_materiais_obra:      true,
    ver_equipe_obra:         true,
    ver_perfil:              true,
    configuracoes_sistema:   true,
  },
  ADMIN_DEV: {
    ver_metricas_plataforma: true,
    ver_obras:               true,
    ver_diario:              true,
    ver_tarefas:             true,
    gerenciar_tarefas:       true,
    atualizar_status_tarefa: true,
    ver_perfil:              true,
    ver_logs:                true,
    configuracoes_sistema:   true,
  },
  ADMIN_FIN: {
    ver_metricas_plataforma: true,
    ver_obras:               true,
    ver_financeiro_global:   true,
    ver_financeiro_obra:     true,
    ver_perfil:              true,
  },
  ADMIN_RH: {
    ver_metricas_plataforma: true,
    ver_obras:               true,
    ver_equipe_obra:         true,
    gerenciar_usuarios:      true,
    ver_perfil:              true,
  },
  // Nível 2 - Dono da Construtora
  PROPRIETARIO: {
    ver_obras:               true,
    criar_obra:              true,
    criar_diario:            true,
    ver_diario:              true,
    ver_financeiro:          true,
    gerenciar_equipe:        true,
    gerenciar_usuarios:      true,
    ver_tarefas:             true,
    gerenciar_tarefas:       true,
    atualizar_status_tarefa: true,
    escrever_diario:         true,
    deletar_diario:          true,
    auditar_diario:          true, 
    ver_materiais_obra:      true,
    ver_financeiro_obra:     true,
    ver_equipe_obra:         true,
    ver_perfil:              true,
    ver_metricas_empresa:    true,
  },
  // Nível 2 - Operacional
  RESPONSAVEL: {
    ver_obras:               true,
    criar_obra:              true,
    criar_diario:            true,
    ver_diario:              true,
    ver_financeiro:          true,
    gerenciar_equipe:        true,
    gerenciar_usuarios:      true,
    ver_tarefas:             true,
    gerenciar_tarefas:       true,
    atualizar_status_tarefa: true,
    escrever_diario:         true,
    deletar_diario:          true,
    auditar_diario:          true, 
    ver_materiais_obra:      true,
    ver_financeiro_obra:     true,
    ver_equipe_obra:         true,
    ver_perfil:              true,
  },
  CLIENTE: {
    ver_obras:               true,
    ver_diario:              true,
    ver_financeiro_obra:     true, // Leitura
    ver_materiais_obra:      true, // Leitura
    ver_equipe_obra:         true, // Leitura
    ver_tarefas:             true,
    convidar_espectador:     true, // Exclusivo
    is_readonly:             true, // Global ReadOnly
  },
  CONVIDADO_CLIENTE: {
    ver_obras:               true,
    ver_diario:              true,
    ver_financeiro_obra:     true,
    ver_materiais_obra:      true,
    ver_equipe_obra:         true,
    ver_tarefas:             true,
    is_readonly:             true,
  },
  MESTRE: {
    ver_obras:               true,
    ver_diario:              true,
    ver_equipe:              true,
    ver_tarefas:             true,
    gerenciar_tarefas:       true,
    atualizar_status_tarefa: true,
    escrever_diario:         true,
    delegar_tarefa:          true,
  },
  PEDREIRO: {
    ver_obras:               true,
    ver_tarefas_proprias:    true,
    atualizar_progresso:     true,
    atualizar_status_tarefa: true,
    ver_perfil:              true,
  },
  AJUDANTE: {
    ver_tarefas_hoje:        true,
    atualizar_status_tarefa: true,
    ver_perfil:              true,
  },
  TRABALHADOR: {
    ver_obras:               true,
    ver_tarefas:             true,
    atualizar_status_tarefa: true,
    ver_diario:              true,
    ver_perfil:              true,
  },
  USER: {
    ver_obras:               true,
    ver_perfil:              true,
  },
};

// ─── Funcoes helper ───────────────────────────────────────────────────────────

/**
 * Retorna o "Perfil Estrutural" simplificado para controle de UI.
 */
export function getProfile(role, funcao) {
  if (role === 'ADMIN_MASTER') return 'ADMIN_MASTER';
  if (role === 'ADMIN')        return 'ADMIN';
  if (role === 'ADMIN_DEV')    return 'ADMIN_DEV';
  if (role === 'ADMIN_FIN')    return 'ADMIN_FIN';
  if (role === 'ADMIN_RH')     return 'ADMIN_RH';
  if (role === 'PROPRIETARIO') return 'PROPRIETARIO';
  if (role === 'CLIENTE')      return 'CLIENTE';
  if (role === 'CONVIDADO_CLIENTE') return 'CONVIDADO_CLIENTE';
  if (role === 'RESPONSAVEL')  return 'RESPONSAVEL';
  if (role === 'TRABALHADOR')  return 'TRABALHADOR';
  
  if (role === 'USER') {
    const f = funcao?.toUpperCase();
    if (f === 'MESTRE') return 'MESTRE';
    if (f === 'PEDREIRO') return 'PEDREIRO';
    if (f === 'AJUDANTE') return 'AJUDANTE';
  }
  
  return role || 'USER';
}

export function getPermissoes(role, funcao) {
  const profile = getProfile(role, funcao);
  return PERMISSOES[profile] || PERMISSOES['USER'];
}


export function hasPermissao(role, permissao, funcao) {
  const perms = getPermissoes(role, funcao);
  return !!perms[permissao];
}

export function hasRole(role, ...rolesPermitidos) {
  return rolesPermitidos.includes(role);
}

export function getRoleLabel(role, funcao) {
  // 1. Prioridade para Nível 1 (Plataforma)
  if (role === 'ADMIN_MASTER') return 'Administrador da Plataforma';
  if (role === 'PROPRIETARIO') return 'Proprietário';
  if (role === 'CLIENTE') return 'Cliente (Dono da Obra)';
  if (role === 'CONVIDADO_CLIENTE') return 'Espectador (Convidado)';

  // 2. Nível 2 (Operacional) - Se for trabalhador e tiver função, exibe função
  if (role === 'TRABALHADOR' && funcao) {
    const operTitle = funcao.toUpperCase();
    return ROLE_LABELS[operTitle] || funcao;
  }

  // 3. Fallback para o label mapeado ou a própria role
  return ROLE_LABELS[role] || role || 'Usuário';
}

export function isPlataforma(role) {
  return ROLES_PLATAFORMA.includes(role);
}

export function isObra(role) {
  return ROLES_OBRA.includes(role) || role === 'TRABALHADOR';
}

export function podeImpersonar(role) {
  return hasPermissao(role, 'impersonar');
}

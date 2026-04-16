/**
 * authorizationMiddleware.js
 *
 * Middlewares reutilizáveis de autorização baseados em RBAC.
 *
 * Uso:
 *   router.get('/rota', authMiddleware, requireRole('ADMIN','MASTER'), controller)
 *   router.get('/obs/:id/diario', authMiddleware, requireObraAccess('leitura'), controller)
 */

import prisma from '../config/prisma.js';

// ─── Mapa de permissões por role ──────────────────────────────────────────────
const ROLES_PLATAFORMA = ['ADMIN_MASTER', 'MASTER', 'ADMIN', 'DEV', 'FIN', 'RH', 'SUPORTE'];
const ROLES_OBRA       = ['PROPRIETARIO', 'RESPONSAVEL', 'CLIENTE', 'CONVIDADO_CLIENTE', 'TRABALHADOR'];

export const PERMISSOES = {
  ADMIN_MASTER: { plataforma: true,  obras: true,  criar_diario: true,  deletar_diario: true,  impersonar: true,  gerenciar_tarefas: true,  atualizar_status_tarefa: true, gerenciar_usuarios: true },
  MASTER:       { plataforma: true,  obras: true,  criar_diario: true,  deletar_diario: true,  impersonar: true,  gerenciar_tarefas: true,  atualizar_status_tarefa: true, gerenciar_usuarios: true },
  ADMIN:        { plataforma: true,  obras: true,  criar_diario: true,  deletar_diario: true,  impersonar: true,  gerenciar_tarefas: true,  atualizar_status_tarefa: true, gerenciar_usuarios: true },
  DEV:          { plataforma: true,  obras: false, criar_diario: false, deletar_diario: true,  impersonar: true,  gerenciar_tarefas: true,  atualizar_status_tarefa: true, gerenciar_usuarios: false },
  FIN:          { plataforma: true,  obras: false, criar_diario: false, deletar_diario: false, impersonar: false, gerenciar_tarefas: false, atualizar_status_tarefa: false, gerenciar_usuarios: false },
  RH:           { plataforma: true,  obras: false, criar_diario: false, deletar_diario: false, impersonar: false, gerenciar_tarefas: false, atualizar_status_tarefa: false, gerenciar_usuarios: true },
  SUPORTE:      { plataforma: true,  obras: false, criar_diario: false, deletar_diario: false, impersonar: false, gerenciar_tarefas: false, atualizar_status_tarefa: false, gerenciar_usuarios: false },
  PROPRIETARIO: { plataforma: false, obras: true,  criar_diario: true,  deletar_diario: true,  impersonar: false, gerenciar_tarefas: true,  atualizar_status_tarefa: true, gerenciar_usuarios: true },
  CLIENTE:      { plataforma: false, obras: true,  criar_diario: false, deletar_diario: false, impersonar: false, gerenciar_tarefas: false, atualizar_status_tarefa: false },
  CONVIDADO_CLIENTE: { plataforma: false, obras: true,  criar_diario: false, deletar_diario: false, impersonar: false, gerenciar_tarefas: false, atualizar_status_tarefa: false },
  RESPONSAVEL:  { plataforma: false, obras: true,  criar_diario: true,  deletar_diario: true,  impersonar: false, gerenciar_tarefas: true,  atualizar_status_tarefa: true, gerenciar_usuarios: true },
  TRABALHADOR:  { plataforma: false, obras: true,  criar_diario: false, deletar_diario: false, impersonar: false, gerenciar_tarefas: false, atualizar_status_tarefa: true  },
  USER:         { plataforma: false, obras: true,  criar_diario: false, deletar_diario: false, impersonar: false, gerenciar_tarefas: false, atualizar_status_tarefa: false },
};

// ─── 1. requireRole — verifica se o usuário tem o cargo necessário ────────────
/**
 * @param {...string} roles - Roles permitidas (ex: 'ADMIN', 'MASTER', 'DEV')
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return res.status(401).json({ erro: 'Nao autenticado' });
    }

    if (!roles.includes(userRole)) {
      _logAcessoNegado(req, `Role '${userRole}' nao autorizada. Necessario: [${roles.join(', ')}]`);
      return res.status(403).json({
        erro: 'Acesso negado. Voce nao tem permissao para esta operacao.',
      });
    }

    next();
  };
}

// ─── 2. requirePermissao — verifica uma permissao especifica do RBAC ──────────
/**
 * @param {string} permissao - Permissao do mapa PERMISSOES (ex: 'criar_diario')
 */
export function requirePermissao(permissao) {
  return (req, res, next) => {
    const role = req.user?.role;
    const perms = PERMISSOES[role];

    if (!perms) {
      return res.status(403).json({ erro: 'Cargo nao reconhecido' });
    }

    if (!perms[permissao]) {
      _logAcessoNegado(req, `Permissao '${permissao}' negada para role '${role}'`);
      return res.status(403).json({
        erro: `Acao nao permitida para seu nivel de acesso.`,
      });
    }

    next();
  };
}

// ─── 3. requireObraAccess — verifica vinculo do usuario com a obra ─────────────
/**
 * Verifica se o usuário está vinculado à obra (:id na rota).
 * Popula req.obraAccess com { idObra, role, nivelAcesso }.
 *
 * Niveis de acesso:
 *   total    → RESPONSAVEL, MASTER, ADMIN, DEV
 *   leitura  → CLIENTE, todos os de plataforma com permissao
 *   nenhum   → qualquer outro
 *
 * @param {'total'|'leitura'|'qualquer'} nivelMinimo
 */
export function requireObraAccess(nivelMinimo = 'qualquer') {
  return async (req, res, next) => {
    try {
      const idObra    = Number(req.params.id);
      const idUsuario = req.user?.id;
      const role      = req.user?.role;

      if (!idObra || isNaN(idObra)) {
        return res.status(400).json({ erro: 'ID da obra invalido' });
      }

      // Usuarios de plataforma com permissao total (MASTER/ADMIN/DEV) ignoram vinculo
      if (['ADMIN_MASTER', 'MASTER', 'ADMIN', 'DEV'].includes(role)) {
        req.obraAccess = { idObra, role, nivelAcesso: 'total' };
        return next();
      }

      // NOVO: Usuarios PROPRIETARIO dependem do vínculo id_cliente (Multi-tenancy)
      if (role === 'PROPRIETARIO') {
        const idClienteUsuario = req.user?.id_cliente;
        if (!idClienteUsuario) {
          return res.status(403).json({ erro: 'Proprietario sem empresa vinculada' });
        }

        // Verifica se esta obra pertence à empresa deste proprietário
        const obraDaEmpresa = await prisma.tb_obra_cliente.findFirst({
          where: {
            id_obra: idObra,
            id_cliente: idClienteUsuario,
          }
        });

        if (obraDaEmpresa) {
          req.obraAccess = { idObra, role, nivelAcesso: 'total' };
          return next();
        }

        // Se o proprietário não for o dono direto, talvez ele esteja vinculado como usuário comum? 
        // (Raro, mas compatível com o fluxo abaixo)
      }

      // Para usuarios de obra: verifica vinculo em tb_usuario_obra
      const vinculo = await prisma.tb_usuario_obra.findFirst({
        where: {
          id_usuario: idUsuario,
          id_obra: idObra,
        },
        include: {
          tb_papel: true,
        },
      });

      // Verifica tambem se seria RESPONSAVEL direto pela obra
      const obraResponsavel = await prisma.tb_obra.findFirst({
        where: {
          id_obra: idObra,
          id_usuario_responsavel: idUsuario,
        },
      });

      const temAcesso = vinculo || obraResponsavel;

      if (!temAcesso) {
        _logAcessoNegado(req, `Usuario ${idUsuario} sem vinculo com obra ${idObra}`);
        return res.status(403).json({
          erro: 'Voce nao tem acesso a esta obra.',
        });
      }

      // Determina nivel de acesso real
      let nivelAcesso = 'leitura';
      if (role === 'RESPONSAVEL' || role === 'PROPRIETARIO' || obraResponsavel) {
        nivelAcesso = 'total';
      }

      // Verifica se atende ao nivel minimo exigido
      const hierarquia = { 'qualquer': 0, 'leitura': 1, 'total': 2 };
      if (hierarquia[nivelAcesso] < hierarquia[nivelMinimo]) {
        _logAcessoNegado(req, `Nivel ${nivelAcesso} insuficiente (necessario: ${nivelMinimo}) para obra ${idObra}`);
        return res.status(403).json({
          erro: 'Voce nao tem permissao suficiente para esta operacao na obra.',
        });
      }

      // Disponibiliza info de acesso para os controllers
      req.obraAccess = { idObra, role, nivelAcesso, vinculo };
      next();

    } catch (error) {
      console.error('[AUTH] Erro ao verificar acesso a obra:', error);
      return res.status(500).json({ erro: 'Erro interno ao verificar permissoes' });
    }
  };
}

// ─── Helper privado: log de acesso negado ─────────────────────────────────────
function _logAcessoNegado(req, motivo) {
  const userId = req.user?.id || 'anonimo';
  const role   = req.user?.role || 'sem-role';
  const rota   = `${req.method} ${req.originalUrl}`;
  const ip     = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'desconhecido';

  console.warn(`[ACESSO NEGADO] Usuario=${userId} Role=${role} IP=${ip} Rota="${rota}" | ${motivo}`);

  // Futuramente: salvar em tb_log_auditoria via prisma
}

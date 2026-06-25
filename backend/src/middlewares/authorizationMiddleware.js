/**
 * authorizationMiddleware.js
 *
 * Middlewares reutilizaveis de autorizacao baseados em RBAC.
 * A matriz de permissoes vive em ../config/permissions.js (fonte unica).
 *
 * Uso:
 *   router.get('/rota', authMiddleware, requireRole('ADMIN_MASTER'), controller)
 *   router.get('/obs/:id/diario', authMiddleware, requireObraAccess('leitura'), controller)
 *   router.post('/diario', authMiddleware, requirePermissao('criar_diario'), controller)
 */

import prisma from '../config/prisma.js';
import { PERMISSOES, hasPermissao } from '../config/permissions.js';

// Re-export para nao quebrar imports antigos de PERMISSOES daqui
export { PERMISSOES };

// --- 1. requireRole -------------------------------------------------------

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

// --- 2. requirePermissao --------------------------------------------------

export function requirePermissao(permissao) {
  return async (req, res, next) => {
    const role = req.user?.role;
    const idUsuario = req.user?.id;

    if (!role || !idUsuario) {
      return res.status(401).json({ erro: 'Nao autenticado' });
    }

    const rhPermissions = [
      'ver_rh', 'gerenciar_usuarios', 'gerenciar_salario', 
      'gerenciar_dados_residenciais', 'gerenciar_conta_banco', 
      'gerenciar_ponto_diaria'
    ];

    if (rhPermissions.includes(permissao)) {
      const dbUser = await prisma.tb_usuario.findUnique({
        where: { id_usuario: idUsuario },
        select: { acesso_rh: true }
      });
      if (!dbUser || !dbUser.acesso_rh) {
        return res.status(403).json({
          erro: 'Acesso negado. Você não tem permissão para acessar a área de RH.',
        });
      }
    }

    if (!hasPermissao(role, permissao)) {
      if (permissao === 'ver_rh') {
        const dbUser = await prisma.tb_usuario.findUnique({
          where: { id_usuario: idUsuario },
          select: { acesso_rh: true }
        });
        if (dbUser && dbUser.acesso_rh) {
          return next();
        }
      }

      _logAcessoNegado(req, `Permissao '${permissao}' negada para role '${role}'`);
      return res.status(403).json({
        erro: 'Acao nao permitida para seu nivel de acesso.',
      });
    }

    next();
  };
}

// --- 3. requireObraAccess -------------------------------------------------
// Verifica se o usuario esta vinculado a obra (:id na rota).
// Popula req.obraAccess com { idObra, role, nivelAcesso }.
//
// Niveis: total, leitura, qualquer

export function requireObraAccess(nivelMinimo = 'qualquer') {
  return async (req, res, next) => {
    try {
      let idObra = Number(req.params.id);
      const idUsuario = req.user?.id;
      const role = req.user?.role;

      if ((!idObra || isNaN(idObra)) && req.params.idItem) {
        const item = await prisma.tb_estoque_obra.findUnique({
          where: { id_estoque: Number(req.params.idItem) },
          select: { id_obra: true }
        });
        if (item) {
          idObra = item.id_obra;
        }
      }

      if (!idObra || isNaN(idObra)) {
        return res.status(400).json({ erro: 'ID da obra invalido' });
      }

      // Roles de plataforma com permissao total ignoram vinculo
      if (['ADMIN_MASTER', 'ADMIN'].includes(role)) {
        req.obraAccess = { idObra, role, nivelAcesso: 'total' };
        return next();
      }

      // PROPRIETARIO acessa obras da propria empresa via id_cliente
      if (role === 'PROPRIETARIO') {
        const idClienteUsuario = req.user?.id_cliente;
        if (!idClienteUsuario) {
          return res.status(403).json({ erro: 'Proprietario sem empresa vinculada' });
        }

        const obraDaEmpresa = await prisma.tb_obra_cliente.findFirst({
          where: { id_obra: idObra, id_cliente: idClienteUsuario }
        });

        if (obraDaEmpresa) {
          req.obraAccess = { idObra, role, nivelAcesso: 'total' };
          return next();
        }
      }

      // Demais usuarios: verifica vinculo em tb_usuario_obra
      const vinculo = await prisma.tb_usuario_obra.findFirst({
        where: { id_usuario: idUsuario, id_obra: idObra },
        include: { tb_papel: true },
      });

      const obraResponsavel = await prisma.tb_obra.findFirst({
        where: { id_obra: idObra, id_usuario_responsavel: idUsuario },
      });

      const temAcesso = vinculo || obraResponsavel;

      if (!temAcesso) {
        _logAcessoNegado(req, `Usuario ${idUsuario} sem vinculo com obra ${idObra}`);
        return res.status(403).json({
          erro: 'Voce nao tem acesso a esta obra.',
        });
      }

      let nivelAcesso = 'leitura';
      if (role === 'RESPONSAVEL' || role === 'PROPRIETARIO' || obraResponsavel) {
        nivelAcesso = 'total';
      }

      const hierarquia = { 'qualquer': 0, 'leitura': 1, 'total': 2 };
      if (hierarquia[nivelAcesso] < hierarquia[nivelMinimo]) {
        _logAcessoNegado(req, `Nivel ${nivelAcesso} insuficiente (necessario: ${nivelMinimo}) para obra ${idObra}`);
        return res.status(403).json({
          erro: 'Voce nao tem permissao suficiente para esta operacao na obra.',
        });
      }

      req.obraAccess = { idObra, role, nivelAcesso, vinculo };
      next();

    } catch (error) {
      console.error('[AUTH] Erro ao verificar acesso a obra:', error);
      return res.status(500).json({ erro: 'Erro interno ao verificar permissoes' });
    }
  };
}

// --- Helper: log de acesso negado -----------------------------------------

function _logAcessoNegado(req, motivo) {
  const userId = req.user?.id || 'anonimo';
  const role = req.user?.role || 'sem-role';
  const rota = `${req.method} ${req.originalUrl}`;
  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'desconhecido';

  console.warn(`[ACESSO NEGADO] Usuario=${userId} Role=${role} IP=${ip} Rota="${rota}" | ${motivo}`);
}

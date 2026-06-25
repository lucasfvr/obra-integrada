import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { requirePermissao } from '../middlewares/authorizationMiddleware.js';
import prisma from '../config/prisma.js';
import {
  listarFuncionarios,
  criarFuncionario,
  atualizarFuncionario,
  inativarFuncionario,
  adicionarCertificacao,
  listarCertificacoes,
  atualizarCertificacao,
  deletarCertificacao,
  obterAlertasNR,
  obterDashboardStats
} from '../controllers/rhController.js';

const router = express.Router();

/**
 * Rotas de Gestão de RH
 * Protegidas por autenticação e permissão 'gerenciar_usuarios'
 */

router.get('/',
  authMiddleware,
  requirePermissao('ver_rh'),
  listarFuncionarios
);

// IMPORTANTE: rotas específicas ANTES de '/:id'. Senão '/:id' captura
// '/dashboard-stats' e '/alertas-nr' → Number('dashboard-stats') = NaN → 400 "ID inválido".
router.get('/alertas-nr',
  authMiddleware,
  requirePermissao('ver_rh'),
  obterAlertasNR
);

router.get('/dashboard-stats',
  authMiddleware,
  requirePermissao('ver_rh'),
  obterDashboardStats
);

router.get('/:id',
  authMiddleware,
  requirePermissao('ver_rh'),
  async (req, res) => {
    try {
      const targetId = Number(req.params.id);
      if (isNaN(targetId)) return res.status(400).json({ erro: 'ID inválido' });

      const funcionario = await prisma.tb_usuario.findUnique({
        where: { id_usuario: targetId },
        select: {
          id_usuario: true, matricula: true, nome: true, cpf: true, cnpj: true,
          email: true, cargo_base: true, funcao: true, status: true,
          data_admissao: true, role: true, is_terceirizado: true,
          cnpj_empreiteira: true, razao_social_empreiteira: true,
          tipo_vinculo: true, lgpd_consentimento: true,
          id_cliente: true
        }
      });

      if (!funcionario) return res.status(404).json({ erro: 'Colaborador não encontrado' });

      // Segurança multi-tenant
      if (req.user?.id_cliente && funcionario.id_cliente !== req.user.id_cliente) {
        return res.status(403).json({ erro: 'Acesso negado.' });
      }
      if (req.user?.role === 'EMPREITEIRA' && funcionario.cnpj_empreiteira !== req.user.cnpj) {
        return res.status(403).json({ erro: 'Acesso negado.' });
      }

      return res.status(200).json(funcionario);
    } catch (error) {
      console.error('[RH] Erro ao buscar colaborador por ID:', error);
      return res.status(500).json({ erro: 'Erro ao buscar colaborador' });
    }
  }
);

router.post('/', 
  authMiddleware, 
  requirePermissao('gerenciar_usuarios'), 
  criarFuncionario
);

router.put('/:id', 
  authMiddleware, 
  requirePermissao('gerenciar_usuarios'), 
  atualizarFuncionario
);

router.patch('/:id/inativar', 
  authMiddleware, 
  requirePermissao('gerenciar_usuarios'), 
  inativarFuncionario
);

// Rotas de Certificações (NRs)
router.post('/usuarios/:id/certificacoes',
  authMiddleware,
  requirePermissao('gerenciar_usuarios'),
  adicionarCertificacao
);

router.get('/usuarios/:id/certificacoes',
  authMiddleware,
  listarCertificacoes
);

router.patch('/usuarios/:id/certificacoes/:idCertificacao',
  authMiddleware,
  requirePermissao('gerenciar_usuarios'),
  atualizarCertificacao
);

router.delete('/usuarios/:id/certificacoes/:idCertificacao',
  authMiddleware,
  requirePermissao('gerenciar_usuarios'),
  deletarCertificacao
);

// --- CONTROLE DE ACESSO AO RH (EXCLUSIVO DO USER 'wh') ---
router.get('/controle-acesso/usuarios',
  authMiddleware,
  async (req, res) => {
    try {
      if (req.user?.username !== 'wh' && req.user?.username !== 'rh_manager') {
        return res.status(403).json({ erro: 'Acesso negado. Apenas usuários autorizados têm permissão para esta funcionalidade.' });
      }

      const usuarios = await prisma.tb_usuario.findMany({
        select: {
          id_usuario: true,
          nome: true,
          username: true,
          email: true,
          role: true,
          status: true,
          acesso_rh: true
        },
        orderBy: {
          nome: 'asc'
        }
      });

      return res.status(200).json(usuarios);
    } catch (error) {
      console.error('[RH CONTROLE ACESSO] Erro ao buscar usuários:', error);
      return res.status(500).json({ erro: 'Erro interno ao carregar controle de acesso.' });
    }
  }
);

router.patch('/controle-acesso/usuarios/:id',
  authMiddleware,
  async (req, res) => {
    try {
      if (req.user?.username !== 'wh' && req.user?.username !== 'rh_manager') {
        return res.status(403).json({ erro: 'Acesso negado. Apenas usuários autorizados têm permissão para esta funcionalidade.' });
      }

      const targetId = Number(req.params.id);
      if (isNaN(targetId)) return res.status(400).json({ erro: 'ID do usuário inválido.' });

      const { acesso_rh } = req.body;
      if (typeof acesso_rh !== 'boolean') {
        return res.status(400).json({ erro: 'O campo acesso_rh é obrigatório e deve ser boleano.' });
      }

      // Evita lockout do próprio wh
      const targetUser = await prisma.tb_usuario.findUnique({
        where: { id_usuario: targetId }
      });
      if (targetUser && (targetUser.username === 'wh' || targetUser.username === 'rh_manager') && !acesso_rh) {
        return res.status(400).json({ erro: 'Não é permitido revogar o próprio acesso de um usuário administrador.' });
      }

      const updatedUser = await prisma.tb_usuario.update({
        where: { id_usuario: targetId },
        data: { acesso_rh },
        select: {
          id_usuario: true,
          nome: true,
          acesso_rh: true
        }
      });

      return res.status(200).json({
        mensagem: `Acesso do usuário ${updatedUser.nome} atualizado com sucesso!`,
        usuario: updatedUser
      });
    } catch (error) {
      console.error('[RH CONTROLE ACESSO] Erro ao atualizar acesso do usuário:', error);
      return res.status(500).json({ erro: 'Erro interno ao atualizar controle de acesso.' });
    }
  }
);

export default router;

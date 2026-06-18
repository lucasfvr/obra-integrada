import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { requirePermissao } from '../middlewares/authorizationMiddleware.js';
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

<<<<<<< HEAD
router.get('/:id',
  authMiddleware,
  requirePermissao('ver_rh'),
  async (req, res) => {
    try {
      const targetId = Number(req.params.id);
      if (isNaN(targetId)) return res.status(400).json({ erro: 'ID inválido' });

      const funcionario = await (await import('../config/prisma.js')).default.tb_usuario.findUnique({
        where: { id_usuario: targetId },
        select: {
          id_usuario: true, matricula: true, nome: true, cpf: true, cnpj: true,
          email: true, cargo_base: true, funcao: true, status: true,
          data_admissao: true, role: true, is_terceirizado: true,
          cnpj_empreiteira: true, razao_social_empreiteira: true,
          tipo_vinculo: true, lgpd_consentimento: true
        }
      });

      if (!funcionario) return res.status(404).json({ erro: 'Colaborador não encontrado' });

      // Segurança multi-tenant
      if (req.user?.id_cliente && funcionario.id_cliente !== undefined) {
        // campo não selecionado, skip
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
=======
>>>>>>> de3e7b597ac8942d033682c7a44bce614241ef4f

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

<<<<<<< HEAD
=======
router.get('/:id',
  authMiddleware,
  requirePermissao('ver_rh'),
  async (req, res) => {
    try {
      const targetId = Number(req.params.id);
      if (isNaN(targetId)) return res.status(400).json({ erro: 'ID inválido' });

      const funcionario = await (await import('../config/prisma.js')).default.tb_usuario.findUnique({
        where: { id_usuario: targetId },
        select: {
          id_usuario: true, matricula: true, nome: true, cpf: true, cnpj: true,
          email: true, cargo_base: true, funcao: true, status: true,
          data_admissao: true, role: true, is_terceirizado: true,
          cnpj_empreiteira: true, razao_social_empreiteira: true,
          tipo_vinculo: true, lgpd_consentimento: true
        }
      });

      if (!funcionario) return res.status(404).json({ erro: 'Colaborador não encontrado' });

      // Segurança multi-tenant
      if (req.user?.id_cliente && funcionario.id_cliente !== undefined) {
        // campo não selecionado, skip
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

>>>>>>> de3e7b597ac8942d033682c7a44bce614241ef4f
export default router;

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
  obterAlertasNR
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

export default router;

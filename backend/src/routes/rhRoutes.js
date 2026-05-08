import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { requirePermissao } from '../middlewares/authorizationMiddleware.js';
import {
  listarFuncionarios,
  criarFuncionario,
  atualizarFuncionario,
  inativarFuncionario
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

export default router;

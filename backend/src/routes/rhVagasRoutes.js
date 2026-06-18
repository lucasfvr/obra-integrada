import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { requirePermissao } from '../middlewares/authorizationMiddleware.js';
import {
  listarVagas,
  obterVaga,
  criarVaga,
  atualizarVaga,
  excluirVaga
} from '../controllers/vagaController.js';

const router = express.Router();

/**
 * Rotas de Gestão de Vagas (RH)
 * Multi-Tenant e protegidas por permissões
 */

router.get('/',
  authMiddleware,
  requirePermissao('ver_rh'),
  listarVagas
);

router.get('/:id',
  authMiddleware,
  requirePermissao('ver_rh'),
  obterVaga
);

router.post('/',
  authMiddleware,
  requirePermissao('gerenciar_usuarios'),
  criarVaga
);

router.put('/:id',
  authMiddleware,
  requirePermissao('gerenciar_usuarios'),
  atualizarVaga
);

router.delete('/:id',
  authMiddleware,
  requirePermissao('gerenciar_usuarios'),
  excluirVaga
);

export default router;

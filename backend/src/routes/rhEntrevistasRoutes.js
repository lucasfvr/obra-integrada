import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { requirePermissao } from '../middlewares/authorizationMiddleware.js';
import {
  listarEntrevistas,
  obterEntrevista,
  criarEntrevista,
  atualizarEntrevista,
  excluirEntrevista
} from '../controllers/entrevistaController.js';

const router = express.Router();

router.get('/',
  authMiddleware,
  requirePermissao('ver_rh'),
  listarEntrevistas
);

router.get('/:id',
  authMiddleware,
  requirePermissao('ver_rh'),
  obterEntrevista
);

router.post('/',
  authMiddleware,
  requirePermissao('gerenciar_usuarios'),
  criarEntrevista
);

router.put('/:id',
  authMiddleware,
  requirePermissao('gerenciar_usuarios'),
  atualizarEntrevista
);

router.delete('/:id',
  authMiddleware,
  requirePermissao('gerenciar_usuarios'),
  excluirEntrevista
);

export default router;

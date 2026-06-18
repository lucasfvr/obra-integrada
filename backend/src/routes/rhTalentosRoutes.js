import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { requirePermissao } from '../middlewares/authorizationMiddleware.js';
import {
  listarTalentos,
  obterTalento,
  criarTalento,
  atualizarTalento,
  excluirTalento
} from '../controllers/talentoController.js';

const router = express.Router();

router.get('/',
  authMiddleware,
  requirePermissao('ver_rh'),
  listarTalentos
);

router.get('/:id',
  authMiddleware,
  requirePermissao('ver_rh'),
  obterTalento
);

router.post('/',
  authMiddleware,
  requirePermissao('gerenciar_usuarios'),
  criarTalento
);

router.put('/:id',
  authMiddleware,
  requirePermissao('gerenciar_usuarios'),
  atualizarTalento
);

router.delete('/:id',
  authMiddleware,
  requirePermissao('gerenciar_usuarios'),
  excluirTalento
);

export default router;

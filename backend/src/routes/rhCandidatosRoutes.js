import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { requirePermissao } from '../middlewares/authorizationMiddleware.js';
import {
  listarCandidatos,
  obterCandidato,
  criarCandidato,
  atualizarCandidato,
  excluirCandidato
} from '../controllers/candidatoController.js';

const router = express.Router();

router.get('/',
  authMiddleware,
  requirePermissao('ver_rh'),
  listarCandidatos
);

router.get('/:id',
  authMiddleware,
  requirePermissao('ver_rh'),
  obterCandidato
);

router.post('/',
  authMiddleware,
  requirePermissao('gerenciar_usuarios'),
  criarCandidato
);

router.put('/:id',
  authMiddleware,
  requirePermissao('gerenciar_usuarios'),
  atualizarCandidato
);

router.delete('/:id',
  authMiddleware,
  requirePermissao('gerenciar_usuarios'),
  excluirCandidato
);

export default router;

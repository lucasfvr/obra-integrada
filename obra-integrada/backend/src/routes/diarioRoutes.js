/**
 * diarioRoutes.js
 *
 * Rotas do Diario da Obra com RBAC completo.
 *
 * Pipeline de seguranca por rota:
 *
 * GET    /api/obras/:id/diario
 *   authMiddleware -> requireObraAccess('leitura') -> listarDiario
 *
 * POST   /api/obras/:id/diario
 *   authMiddleware -> requireObraAccess('total') -> requirePermissao('criar_diario')
 *   -> upload.single('foto') -> handleUploadError -> criarEntradaDiario
 *
 * DELETE /api/obras/:id/diario/:entradaId
 *   authMiddleware -> requireObraAccess('qualquer') -> deletarEntradaDiario
 *   (verificacao adicional de autoria no controller)
 */

import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { requireObraAccess, requirePermissao } from '../middlewares/authorizationMiddleware.js';
import { criarUploadMiddleware, handleUploadError } from '../middlewares/uploadMiddleware.js';
import {
  listarDiario,
  criarEntradaDiario,
  deletarEntradaDiario,
  atualizarStatusAuditoria,
  atualizarEntradaDiario
} from '../controllers/diarioController.js';

const router = express.Router();

const uploadDiario = criarUploadMiddleware('diario');

// ─── GET — listar entradas (acesso de leitura a obra) ─────────────────────────
router.get(
  '/obras/:id/diario',
  authMiddleware,
  requireObraAccess('leitura'),
  listarDiario
);

// ─── POST — criar entrada (apenas RESPONSAVEL ou admin global) ────────────────
router.post(
  '/obras/:id/diario',
  authMiddleware,
  requireObraAccess('total'),
  requirePermissao('criar_diario'),
  uploadDiario.single('foto'),
  handleUploadError,
  criarEntradaDiario
);

// ─── DELETE — remover entrada (autoria verificada no controller) ──────────────
router.delete(
  '/obras/:id/diario/:entradaId',
  authMiddleware,
  requireObraAccess('qualquer'),
  deletarEntradaDiario
);

// ─── PUT — editar conteúdo da entrada (autoria/permissão) ───────────────────
router.put(
  '/obras/:id/diario/:entradaId',
  authMiddleware,
  requireObraAccess('total'),
  atualizarEntradaDiario
);

// ─── PATCH — auditar entrada (RECOMPENSA FINANCEIRA DEPENDE DISSO) ────────────
router.patch(
  '/obras/:id/diario/:entradaId/auditar',
  authMiddleware,
  requireObraAccess('total'),
  atualizarStatusAuditoria
);

export default router;

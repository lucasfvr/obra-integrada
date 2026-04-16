import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { requireObraAccess, requirePermissao } from '../middlewares/authorizationMiddleware.js';
import {
  listarTarefas,
  criarTarefa,
  atualizarTarefa,
  atualizarStatusTarefa,
  deletarTarefa
} from '../controllers/tarefaController.js';

const router = express.Router();

// ─── ROTAS GLOBAIS (Não exigem :id da obra na URL) ───────────────────────────
router.get(
  '/tarefas',
  authMiddleware,
  listarTarefas
);

router.patch(
  '/tarefas/:tarefaId',
  authMiddleware,
  atualizarStatusTarefa
);

// Manter rotas específicas por obra para compatibilidade e organização
router.get(
  '/obras/:id/tarefas',
  authMiddleware,
  requireObraAccess('leitura'),
  listarTarefas
);

router.post(
  '/obras/:id/tarefas',
  authMiddleware,
  requireObraAccess('total'),
  requirePermissao('gerenciar_tarefas'),
  criarTarefa
);

router.put(
  '/obras/:id/tarefas/:tarefaId',
  authMiddleware,
  requireObraAccess('total'),
  requirePermissao('gerenciar_tarefas'),
  atualizarTarefa
);

router.delete(
  '/obras/:id/tarefas/:tarefaId',
  authMiddleware,
  requireObraAccess('total'),
  requirePermissao('gerenciar_tarefas'),
  deletarTarefa
);

export default router;

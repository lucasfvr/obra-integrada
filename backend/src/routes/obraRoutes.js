import express from 'express';
import { 
  listarObras, criarObra, atualizarObra, deletarObra, getObraById,
  adicionarMembroEquipe, removerMembroEquipe, atualizarMembroEquipe,
  adicionarItemEstoque, removerItemEstoque, atualizarItemEstoque,
  listarHistoricoEstoque, getOrgChart
} from '../controllers/obraController.js';
import { uploadDocumento } from '../controllers/documentoController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { requireObraAccess } from '../middlewares/authorizationMiddleware.js';
import { criarUploadMiddleware, handleUploadError } from '../middlewares/uploadMiddleware.js';

const router = express.Router();
const uploadDoc = criarUploadMiddleware('documentos');

// ─── CRUD BÁSICO ─────────────────────────────────────────────────────────────
router.get('/obras', authMiddleware, listarObras);
router.post('/obras', authMiddleware, criarObra);
router.put('/obras/:id', authMiddleware, atualizarObra);
router.delete('/obras/:id', authMiddleware, deletarObra);

// ─── GESTÃO COMPLEMENTAR (EQUIPE & ESTOQUE) ──────────────────────────────────
router.post('/obras/:id/equipe', authMiddleware, requireObraAccess('total'), adicionarMembroEquipe);
router.put('/obras/:id/equipe/:idUsuario', authMiddleware, requireObraAccess('total'), atualizarMembroEquipe);
router.delete('/obras/:id/equipe/:idUsuario', authMiddleware, requireObraAccess('total'), removerMembroEquipe);

router.post('/obras/:id/estoque', authMiddleware, requireObraAccess('total'), adicionarItemEstoque);
router.get('/obras/estoque/:idItem/historico', authMiddleware, requireObraAccess('parcial'), listarHistoricoEstoque);
router.put('/obras/estoque/:idItem', authMiddleware, requireObraAccess('total'), atualizarItemEstoque);
router.delete('/obras/estoque/:idItem', authMiddleware, requireObraAccess('total'), removerItemEstoque);

// ─── DETALHES COMPLETO (API HIDRATADA) ───────────────────────────────────────
router.get(
  '/obras/:id/org-chart',
  authMiddleware,
  requireObraAccess('leitura'),
  getOrgChart
);

router.get(
  '/obras/:id', 
  authMiddleware, 
  requireObraAccess('leitura'), 
  getObraById
);

// ─── DOCUMENTOS ──────────────────────────────────────────────────────────────
router.post(
  '/obras/:id/documentos',
  authMiddleware,
  requireObraAccess('total'), 
  uploadDoc.single('documento'),
  handleUploadError,
  uploadDocumento
);

export default router;

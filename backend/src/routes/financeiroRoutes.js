import { Router } from 'express';
import { 
  listarFinanceiro, 
  criarRegistroFinanceiro, 
  deletarRegistroFinanceiro,
  getOrgChart
} from '../controllers/financeiroController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { requireObraAccess, requirePermissao } from '../middlewares/authorizationMiddleware.js';
import { criarUploadMiddleware, handleUploadError } from '../middlewares/uploadMiddleware.js';

const upload = criarUploadMiddleware('financeiro');

const router = Router();

// Endpoints protegidos por obra e auth
router.get(
  '/obras/:id/financeiro',
  authMiddleware,
  requireObraAccess('leitura'),
  requirePermissao('ver_financeiro'),
  listarFinanceiro
);

router.post(
  '/obras/:id/financeiro',
  authMiddleware,
  requireObraAccess('total'),
  requirePermissao('gerenciar_financeiro'),
  upload.single('comprovante'),
  handleUploadError,
  criarRegistroFinanceiro
);

router.delete(
  '/financeiro/:financeiroId',
  authMiddleware,
  requirePermissao('gerenciar_financeiro'),
  deletarRegistroFinanceiro
);

router.get(
  '/obras/:id/org-chart',
  authMiddleware,
  requireObraAccess('leitura'),
  requirePermissao('ver_equipe'),
  getOrgChart
);

export default router;

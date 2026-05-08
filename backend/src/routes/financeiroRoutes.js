import { Router } from 'express';
import { 
  listarFinanceiro, 
  criarRegistroFinanceiro, 
  deletarRegistroFinanceiro,
  getOrgChart
} from '../controllers/financeiroController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { requireObraAccess, requirePermissao } from '../middlewares/authorizationMiddleware.js';
import multer from 'multer';
import path from 'path';

// Configura multer para comprovantes financeiros
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/financeiro');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'comp-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

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

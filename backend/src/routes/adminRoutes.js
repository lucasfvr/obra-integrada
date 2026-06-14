import express from 'express';
import { 
  getGlobalMetrics, 
  getAllClients, 
  getProfessionalAudit, 
  getMacroProfitability, 
  getSystemHealth,
  getAllUsers,
  getPendingDiaries
} from '../controllers/adminController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/authorizationMiddleware.js';

const router = express.Router();

// Todas as rotas administrativas exigem autenticação básica
router.use(authMiddleware);

// Métricas Globais (Master / Fin / Dev / RH dependendo da granularidade)
router.get('/admin/metrics/global', getGlobalMetrics);

// Gestão de Clientes (Master / Fin)
router.get('/admin/clients', requireRole('ADMIN_MASTER', 'ADMIN_FIN', 'ADMIN'), getAllClients);

// Auditoria Profissional (RH)
router.get('/admin/professionals', requireRole('ADMIN_MASTER', 'ADMIN_RH', 'ADMIN'), getProfessionalAudit);

// Rentabilidade (Fin)
router.get('/admin/metrics/profitability', requireRole('ADMIN_MASTER', 'ADMIN_FIN', 'ADMIN'), getMacroProfitability);

// Gestão de Usuários (MASTER) - Para Impersonação
router.get('/admin/users', requireRole('ADMIN_MASTER'), getAllUsers);

// Inbox de Auditoria (Engenheiro / Master / Proprietário Empresa)
router.get('/admin/metrics/pendentes', requireRole('RESPONSAVEL', 'ADMIN_MASTER', 'ADMIN', 'PROPRIETARIO'), getPendingDiaries);

// Saúde do Sistema (Dev)
router.get('/admin/health', getSystemHealth);

export default router;

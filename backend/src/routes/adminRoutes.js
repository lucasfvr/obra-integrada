import express from 'express';
import { 
  getGlobalMetrics, 
  getAllClients, 
  getProfessionalAudit, 
  getMacroProfitability, 
  getSystemHealth,
  getAllUsers,
  getPendingDiaries,
  impersonarUsuario
} from '../controllers/adminController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { requireRole, requirePermissao } from '../middlewares/authorizationMiddleware.js';

const router = express.Router();

// Todas as rotas administrativas exigem autenticação básica
router.use(authMiddleware);

// Métricas globais da plataforma
router.get('/admin/metrics/global', requirePermissao('ver_metricas_plataforma'), getGlobalMetrics);

// Gestão de clientes (empresas-cliente)
router.get('/admin/clients', requirePermissao('gerenciar_clientes'), getAllClients);

// Auditoria de profissionais (consulta de cadastros profissionais)
router.get('/admin/professionals', requirePermissao('ver_rh'), getProfessionalAudit);

// Rentabilidade macro (visão financeira agregada)
router.get('/admin/metrics/profitability', requirePermissao('ver_metricas_plataforma'), getMacroProfitability);

// Gestão de usuários (lista global — usado para impersonação)
router.get('/admin/users', requirePermissao('gerenciar_usuarios'), getAllUsers);
router.post('/admin/impersonar/:id', requireRole('ADMIN_MASTER'), impersonarUsuario);

// Inbox de diários pendentes de auditoria
router.get('/admin/metrics/pendentes', requireRole('ADMIN_MASTER', 'ADMIN', 'PROPRIETARIO', 'RESPONSAVEL'), getPendingDiaries);

// Saúde do sistema (apenas plataforma)
router.get('/admin/health', requireRole('ADMIN_MASTER', 'ADMIN'), getSystemHealth);

export default router;

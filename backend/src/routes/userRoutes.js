import express from 'express';
import { registerUser, loginUser, forgotPassword, formularioCompleto, getAllUsers, updateUserRole, updateUserRoleAndStatus, getUsuariosDisponiveis, getEquipeGlobal } from '../controllers/userController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { requireRole, requirePermissao } from '../middlewares/authorizationMiddleware.js';
import { getWorkerStats, getWeatherMock, getWorkerPaymentHistory, getWorkerAvailability, getWorkerPerformanceReport, getWorkerActiveTasks } from '../controllers/operationalController.js';

const router = express.Router();

router.post('/users/register', registerUser);
router.post('/users/login', loginUser);
router.post('/users/forgot-password', forgotPassword);
router.post('/users/formulario', formularioCompleto);

router.get('/users/profile', authMiddleware, (req, res) => {
  res.json({ mensagem: "Acesso permitido!", usuario: req.user });
});

router.get('/usuarios-disponiveis', authMiddleware, getUsuariosDisponiveis);
router.get('/equipe', authMiddleware, requirePermissao('ver_equipe'), getEquipeGlobal);
router.put('/usuarios/:id', authMiddleware, requirePermissao('gerenciar_usuarios'), updateUserRoleAndStatus);

// ─── ROTAS OPERACIONAIS DO TRABALHADOR ───────────────────────────────────────
/**
 * GET /operational/stats - Estatísticas gerais do trabalhador
 * Retorna: financeiro, desempenho, certificações
 */
router.get('/operational/stats', authMiddleware, getWorkerStats);

/**
 * GET /operational/weather - Clima e recomendações
 * Query: ?cidade=SãoPaulo
 */
router.get('/operational/weather', authMiddleware, getWeatherMock);

/**
 * GET /operational/pagamentos - Histórico de pagamentos
 * Query: ?userId=1&month=06&year=2026
 */
router.get('/operational/pagamentos', authMiddleware, getWorkerPaymentHistory);

/**
 * GET /operational/disponibilidade - Alocação e disponibilidade
 * Retorna: obras vinculadas e tarefas ativas
 */
router.get('/operational/disponibilidade', authMiddleware, getWorkerAvailability);

/**
 * GET /operational/relatorio - Relatório de desempenho
 * Query: ?dataInicio=2026-05-17&dataFim=2026-06-17
 */
router.get('/operational/relatorio', authMiddleware, getWorkerPerformanceReport);

/**
 * GET /operational/tarefas-ativas - Próximas tarefas a fazer
 * Retorna: tarefas PENDENTE e EM_ANDAMENTO
 */
router.get('/operational/tarefas-ativas', authMiddleware, getWorkerActiveTasks);

// Admin routes — protegidas por autenticacao + permissao
router.get('/admin/users', authMiddleware, requirePermissao('gerenciar_usuarios'), getAllUsers);
router.put('/admin/users/:id/role', authMiddleware, requireRole('ADMIN_MASTER', 'PROPRIETARIO'), updateUserRole);

export default router;

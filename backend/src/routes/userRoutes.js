import express from 'express';
import { registerUser, loginUser, forgotPassword, formularioCompleto, getAllUsers, updateUserRole, updateUserRoleAndStatus, getUsuariosDisponiveis, getEquipeGlobal } from '../controllers/userController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { requireRole, requirePermissao } from '../middlewares/authorizationMiddleware.js';
import { getWorkerStats, getWeatherMock, getWorkerPaymentHistory, getWorkerAvailability, getWorkerPerformanceReport, getWorkerActiveTasks } from '../controllers/operationalController.js';
import { criarAcessoUsuario, getPaginas, getUserPermissions, updateUserPermission, getUsuariosParaAcesso, getMinhasPermissoes } from '../controllers/accessController.js';
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

// Middleware especial para garantir que apenas o rh@vanguarda.com.br (ou admin) tenha acesso a criação rápida
const requireRH = (req, res, next) => {
  if (req.user && (req.user.email === 'rh@vanguarda.com.br' || req.user.role === 'ADMIN_MASTER' || req.user.role === 'RH')) {
    return next();
  }
  return res.status(403).json({ erro: 'Acesso restrito ao RH' });
};

// Rotas de Novo Sistema de Acesso
router.post('/admin/criar-acesso', authMiddleware, requireRH, criarAcessoUsuario);
router.get('/admin/paginas', authMiddleware, requireRH, getPaginas);
router.get('/admin/acesso-usuarios', authMiddleware, requireRH, getUsuariosParaAcesso);
router.get('/admin/permissoes/:id_usuario', authMiddleware, requireRH, getUserPermissions);
router.put('/admin/permissoes', authMiddleware, requireRH, updateUserPermission);

// Permissões de página do próprio usuário (qualquer autenticado) — usado pelo PageAuthGuard
router.get('/me/permissoes', authMiddleware, getMinhasPermissoes);

export default router;

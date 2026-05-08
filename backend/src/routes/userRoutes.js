import express from 'express';
import { registerUser, loginUser, formularioCompleto, getAllUsers, updateUserRole, getUsuariosDisponiveis } from '../controllers/userController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { requireRole, requirePermissao } from '../middlewares/authorizationMiddleware.js';

const router = express.Router();

router.post('/users/register', registerUser);
router.post('/users/login', loginUser);
router.post('/users/formulario', formularioCompleto);

router.get('/users/profile', authMiddleware, (req, res) => {
  res.json({ mensagem: "Acesso permitido!", usuario: req.user });
});

router.get('/usuarios-disponiveis', authMiddleware, getUsuariosDisponiveis);

// Operational / Super App routes
import { getWorkerStats, getWeatherMock } from '../controllers/operationalController.js';
router.get('/operational/stats', authMiddleware, getWorkerStats);
router.get('/operational/weather', authMiddleware, getWeatherMock);

// Admin routes — protegidas por autenticacao + permissao
router.get('/admin/users', authMiddleware, requirePermissao('gerenciar_usuarios'), getAllUsers);
router.put('/admin/users/:id/role', authMiddleware, requireRole('ADMIN_MASTER', 'PROPRIETARIO'), updateUserRole);

export default router;

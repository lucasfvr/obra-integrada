import express from 'express';
import { listarObras, criarObra, atualizarObra, deletarObra } from '../controllers/obraController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Todas as rotas exigem token
router.get('/obras', authMiddleware, listarObras);
router.post('/obras', authMiddleware, criarObra);
router.put('/obras/:id', authMiddleware, atualizarObra);
router.delete('/obras/:id', authMiddleware, deletarObra);

export default router;

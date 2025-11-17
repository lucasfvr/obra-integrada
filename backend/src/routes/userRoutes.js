import express from 'express';
import { registerUser, loginUser, formularioCompleto } from '../controllers/userController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/users/register', registerUser);
router.post('/users/login', loginUser);
router.post('/users/formulario', formularioCompleto);

router.get('/users/profile', authMiddleware, (req, res) => {
  res.json({
    mensagem: "Acesso permitido!",
    usuario: req.user
  });
});

export default router;

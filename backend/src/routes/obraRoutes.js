import express from 'express';
import { listarObras, criarObra, atualizarObra, deletarObra } from '../controllers/obraController.js';

const router = express.Router();

router.get('/obras', listarObras);
router.post('/obras', criarObra);
router.put('/obras/:id', atualizarObra);
router.delete('/obras/:id', deletarObra);

export default router;
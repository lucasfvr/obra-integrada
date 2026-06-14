import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import userRoutes from './routes/userRoutes.js';
import obraRoutes from './routes/obraRoutes.js';
import diarioRoutes from './routes/diarioRoutes.js';
import tarefaRoutes from './routes/tarefaRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import financeiroRoutes from './routes/financeiroRoutes.js';
import rhRoutes from './routes/rhRoutes.js';
import { UPLOADS_DIR } from './config/storageService.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Assets estáticos (Images/Uploads)
app.use('/uploads', express.static(UPLOADS_DIR));

// Agrupamento de Rotas da API
app.use('/api', userRoutes);
app.use('/api', obraRoutes);
app.use('/api', diarioRoutes);
app.use('/api', tarefaRoutes);
app.use('/api', adminRoutes);
app.use('/api', financeiroRoutes);
app.use('/api/rh', rhRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API Obra Integrada — Sistema Online' });
});

// Inicialização do Servidor (Evitar múltiplas instâncias em Serverless)
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Servidor escutando na porta ${PORT}`);
  });
}

export default app;
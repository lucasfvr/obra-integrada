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

// ─── Servir arquivos de upload como estáticos ───────────────────────────────
app.use('/uploads', express.static(UPLOADS_DIR));

app.use('/api', userRoutes);
app.use('/api', obraRoutes);
app.use('/api', diarioRoutes);
app.use('/api', tarefaRoutes);
app.use('/api', adminRoutes);
app.use('/api', financeiroRoutes);
app.use('/api/rh', rhRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API Obra Integrada funcionando' });
});

const server = app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

server.on('error', (e) => {
  console.error("Server Error:", e);
});

server.on('close', () => {
  console.log("Server stopped");
});
import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';
import obraRoutes from './routes/obraRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', userRoutes);
app.use('/api', obraRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

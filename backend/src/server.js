import express from 'express';
import userRoutes from './routes/userRoutes.js'; // Caminho correto para as rotas

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para ler o corpo da requisição em JSON
app.use(express.json());

// Registrar as rotas com o prefixo '/api'
app.use('/api', userRoutes);

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Localização: backend/src/server.js

import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

// Caminhos corrigidos: a partir da pasta 'src', o caminho para 'routes' é './routes'
import obraRoutes from './routes/obraRoutes.js'; 
import userRoutes from './routes/userRoutes.js';

dotenv.config({ path: '../.env' }); // Informa ao dotenv para procurar o .env na pasta acima

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas da API
app.use('/api', obraRoutes);
app.use('/api', userRoutes);

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Backend rodando com sucesso em http://${process.env.HOST || 'localhost'}:${PORT}`);
});
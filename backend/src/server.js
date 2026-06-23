import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import userRoutes from './routes/userRoutes.js';
import obraRoutes from './routes/obraRoutes.js';
import diarioRoutes from './routes/diarioRoutes.js';
import tarefaRoutes from './routes/tarefaRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import financeiroRoutes from './routes/financeiroRoutes.js';
import rhRoutes from './routes/rhRoutes.js';
import rhAvancadoRoutes from './routes/rhAvancadoRoutes.js';
import rhVagasRoutes from './routes/rhVagasRoutes.js';
import rhCandidatosRoutes from './routes/rhCandidatosRoutes.js';
import rhTalentosRoutes from './routes/rhTalentosRoutes.js';
import rhEntrevistasRoutes from './routes/rhEntrevistasRoutes.js';
import { UPLOADS_DIR } from './config/storageService.js';

// Validação de variáveis de ambiente no boot
if (!process.env.JWT_SECRET && process.env.NODE_ENV !== 'test') {
  console.error('ERRO CRÍTICO: A variável de ambiente JWT_SECRET não está configurada.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Configuração de CORS estrita por env var (allowlist)
// Origens separadas por vírgula em CORS_ORIGINS.
// Default de produção: www.obraintegrada.com.br (inclui apex sem www para suportar ambos os acessos).
// Em dev, defina CORS_ORIGINS explicitamente no .env (ex: http://localhost:5173).
// Não há fallback automático para localhost nem bypass por NODE_ENV.
const DEFAULT_PROD_ORIGINS = 'https://www.obraintegrada.com.br,https://obraintegrada.com.br';

const allowedOrigins = (process.env.CORS_ORIGINS || DEFAULT_PROD_ORIGINS)
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

// CORS TEM QUE VIR LOGO APÓS `app = express()` E ANTES DE QUALQUER ROTA / MIDDLEWARE
app.use(cors({
  origin: (origin, callback) => {
    // Requisições sem Origin (mobile nativo, server-to-server) são BLOQUEADAS.
    // Apenas origens da allowlist são aceitas.
    if (!origin || allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('Bloqueado pelas políticas de CORS'));
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400 // 24h — cache do preflight no navegador
}));

// Helmet para reforço de cabeçalhos de segurança HTTP
app.use(helmet());

app.use(express.json());

// Configuração de Rate Limiters
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 100, // Limite de 100 requisições
  message: { erro: 'Muitas requisições vindas deste IP, por favor tente novamente mais tarde.' },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'development', // Desabilita em dev
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 15, // Limite de 15 tentativas
  message: { erro: 'Muitas tentativas de login/cadastro vindas deste IP. Tente novamente em 15 minutos.' },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'development', // Desabilita em dev
});

app.use(generalLimiter);

// Aplicar rate limit estrito nas rotas de autenticação
app.use('/api/users/login', authLimiter);
app.use('/api/users/register', authLimiter);
app.use('/api/users/forgot-password', authLimiter);
app.use('/api/users/formulario', authLimiter);

// Assets estáticos (Images/Uploads)
app.use('/uploads', express.static(UPLOADS_DIR));

// Agrupamento de Rotas da API
app.use('/api', userRoutes);
app.use('/api', obraRoutes);
app.use('/api', diarioRoutes);
app.use('/api', tarefaRoutes);
app.use('/api', adminRoutes);
app.use('/api', financeiroRoutes);
app.use('/api/rh/vagas', rhVagasRoutes);
app.use('/api/rh/candidatos', rhCandidatosRoutes);
app.use('/api/rh/talentos', rhTalentosRoutes);
app.use('/api/rh/entrevistas', rhEntrevistasRoutes);
app.use('/api/rh', rhRoutes);
app.use('/api/rh-avancado', rhAvancadoRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API Obra Integrada — Sistema Online' });
});

// Middleware global de tratamento de erros
app.use((err, req, res, next) => {
  console.error('[Global Error Handler]', err);

  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Ocorreu um erro interno no servidor.'
    : err.message || 'Erro interno no servidor.';

  res.status(status).json({
    erro: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Inicialização do Servidor (Evitar múltiplas instâncias em Serverless)
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Servidor escutando na porta ${PORT}`);
  });
}

export default app;

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

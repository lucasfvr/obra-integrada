import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
console.log("DATABASE_URL loaded?", !!process.env.DATABASE_URL);
import express from 'express';
import cors from 'cors';
import obraRoutes from './routes/obraRoutes.js';
import userRoutes from './routes/userRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });
console.log("ENV PATH:", path.resolve(__dirname, "../.env"));
console.log("DATABASE_URL loaded?", !!process.env.DATABASE_URL);

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

import prisma from "./database/prisma.js";

app.get("/check-tipo", async (req, res) => {
  try {
    const r = await prisma.$queryRawUnsafe(`
      SELECT conname, pg_get_constraintdef(oid) AS definicao
      FROM pg_constraint
      WHERE conname = 'users_tipo_check'
    `);

    res.json({ ok: true, constraint: r });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
});

// Rotas da API
app.use('/', obraRoutes);
app.use('/', userRoutes);

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Backend rodando com sucesso em http://${process.env.HOST || 'localhost'}:${PORT}`);
});


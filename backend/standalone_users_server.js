import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pg from "pg";

dotenv.config({ path: ".env.local" });
if (!process.env.DATABASE_URL) {
  dotenv.config();
}

const DATABASE_URL = process.env.DATABASE_URL;
const PORT = process.env.API_PORT ?? 3000;

if (!DATABASE_URL) {
  console.error("Falta a variável DATABASE_URL no .env.local");
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const app = express();
app.use(cors());
app.use(express.json());

const userTableCandidates = ["tb_usuario", "tb_users", "tb_usuario_obra", "usuarios", "users", "usuario", "user"];
const userFieldPriority = [
  ["id", "id"],
  ["id_usuario", "id"],
  ["user_id", "id"],
  ["nome", "nome"],
  ["name", "nome"],
  ["username", "nome"],
  ["email", "email"],
  ["funcao", "funcao"],
  ["role", "funcao"],
  ["cargo", "funcao"],
  ["position", "funcao"],
  ["status", "status"],
  ["ativo", "status"],
  ["tipo_usuario", "status"],
  ["data_cadastro", "dataCadastro"],
  ["created_at", "dataCadastro"],
  ["createdat", "dataCadastro"],
];

async function findUserTable() {
  for (const table of userTableCandidates) {
    const result = await pool.query(
      `SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1 LIMIT 1`,
      [table]
    );
    if (result.rowCount > 0) {
      return table;
    }
  }

  const fuzzy = await pool.query(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND (table_name ILIKE '%usuario%' OR table_name ILIKE '%user%') ORDER BY table_name LIMIT 1`
  );
  return fuzzy.rowCount > 0 ? fuzzy.rows[0].table_name : null;
}

async function getTableColumns(table) {
  const result = await pool.query(
    `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1`,
    [table]
  );
  return result.rows.map((row) => row.column_name.toLowerCase());
}

function buildSelectQuery(table, columns) {
  const selectFields = [];
  const aliasUsed = new Set();

  for (const [source, alias] of userFieldPriority) {
    if (columns.includes(source) && !aliasUsed.has(alias)) {
      selectFields.push(source === alias ? source : `${source} AS "${alias}"`);
      aliasUsed.add(alias);
    }
  }

  if (!aliasUsed.has("id") || !aliasUsed.has("email")) {
    return null;
  }

  const orderField = columns.includes("nome")
    ? "nome"
    : columns.includes("name")
    ? "name"
    : "id";

  return `SELECT ${selectFields.join(", ")} FROM ${table} ORDER BY ${orderField} ASC LIMIT 200`;
}

app.get("/api/users", async (req, res) => {
  try {
    const table = await findUserTable();
    if (!table) {
      return res.status(404).json({ error: "Tabela de usuários não encontrada." });
    }

    const columns = await getTableColumns(table);
    const query = buildSelectQuery(table, columns);
    if (!query) {
      return res.status(422).json({ error: "Tabela de usuários encontrada, mas não possui colunas esperadas." });
    }

    const result = await pool.query(query);

    return res.json(result.rows);
  } catch (error) {
    console.error("Erro na rota /api/users:", error);
    return res.status(500).json({ error: "Erro ao buscar usuários no banco de dados." });
  }
});

app.listen(PORT, () => {
  console.log(`API de usuários rodando em http://localhost:${PORT}`);
});

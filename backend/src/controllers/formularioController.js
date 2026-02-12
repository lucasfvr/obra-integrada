// controllers/formularioController.js
import fs from "fs/promises";
import path from "path";

const dbPath = path.resolve("src", "database", "users.json");

// Lê o JSON
async function readDB() {
  try {
    const data = await fs.readFile(dbPath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Salva no JSON
async function saveDB(db) {
  await fs.writeFile(dbPath, JSON.stringify(db, null, 2));
}

// ----------------------
// SALVAR FORMULÁRIO
// ----------------------
export async function salvarFormulario(req, res) {
  const {
    userId,
    tipoCadastro,
    nome,
    cpf,
    telefone,
    email,
    endereco,
  } = req.body;

  if (!userId) {
    return res.status(400).json({ erro: "userId é obrigatório" });
  }

  try {
    const db = await readDB();

    const usuario = db.find(u => u.id === userId);

    if (!usuario) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    // Atualiza os dados dentro do usuário
    usuario.formulario = {
      tipoCadastro,
      nome,
      cpf,
      telefone,
      email,
      endereco
    };

    await saveDB(db);

    return res.json({
      mensagem: "Formulário salvo com sucesso!",
      dados: usuario.formulario
    });

  } catch (err) {
    return res.status(500).json({
      erro: "Erro ao salvar formulário",
      detalhes: err.message
    });
  }
}

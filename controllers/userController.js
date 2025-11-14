import { UserModel } from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// ==============================
// CADASTRO DE USUÁRIO
// ==============================
export async function registerUser(req, res) {
  try {
    const { tipo, nome, cpf, razaoSocial, cnpj, email, username, password } = req.body;

    // Validações básicas
    if (tipo === "fisica") {
      if (!nome || !cpf || !email) {
        return res.status(400).json({ erro: "Nome, CPF e email são obrigatórios" });
      }
    } else if (tipo === "juridica") {
      if (!razaoSocial || !cnpj || !email) {
        return res.status(400).json({ erro: "Razão social, CNPJ e email são obrigatórios" });
      }
    } else {
      return res.status(400).json({ erro: "Tipo de pessoa inválido" });
    }

    // Registro completo (com login)
    if (username && password) {
      const existingUser = await UserModel.findByUsername(username);
      if (existingUser) {
        return res.status(409).json({ erro: "Usuário já existe" });
      }

      // 🔐 Criptografa a senha
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = {
        id: Date.now(),
        tipo,
        nome,
        cpf,
        razaoSocial,
        cnpj,
        email,
        username,
        password: hashedPassword
      };

      await UserModel.create(newUser);
      return res.status(201).json({ id: newUser.id, username: newUser.username });
    }

    // Cadastro breve (sem login)
    const newBriefUser = {
      id: Date.now(),
      tipo,
      nome,
      cpf,
      razaoSocial,
      cnpj,
      email,
      isBrief: true
    };

    await UserModel.create(newBriefUser);
    res.status(201).json({ mensagem: "Cadastro breve realizado com sucesso!", id: newBriefUser.id });

  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao registrar usuário" });
  }
}



// ==============================
// LOGIN DO USUÁRIO
// ==============================
export async function loginUser(req, res) {
  try {
    const { username, password } = req.body;

    const user = await UserModel.findByUsername(username);
    if (!user) {
      return res.status(401).json({ erro: "Credenciais inválidas" });
    }

    // 🔐 Compara senha com hash
    const senhaCorreta = await bcrypt.compare(password, user.password);
    if (!senhaCorreta) {
      return res.status(401).json({ erro: "Credenciais inválidas" });
    }

    // 🔑 Cria token JWT
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || 'SUPER_SECRET',
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      mensagem: "Login bem-sucedido!",
      user: { id: user.id, username: user.username },
      token
    });

  } catch (error) {
    console.error("ERRO NO LOGIN:", error);
    res.status(500).json({ erro: "Erro ao fazer login" });
  }
}
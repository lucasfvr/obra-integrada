// controllers/userController.js
import { UserModel } from '../models/user.js';

export async function registerUser(req, res) {
  console.log('>>> CHEGOU NO CONTROLLER DE CADASTRO <<<');
  console.log('Dados recebidos:', req.body);

  try {
    const {
      tipo,          // "fisica" ou "juridica"
      nome,
      cpf,
      razaoSocial,
      cnpj,
      email,
      username,
      password
    } = req.body;

    // Validações básicas de acordo com o tipo
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

    // Se vier username e password, verifica duplicidade e cria cadastro completo
    if (username && password) {
      const existingUser = await UserModel.findByUsername(username);
      if (existingUser) {
        return res.status(409).json({ erro: "Usuário já existe" });
      }

      const newUser = { id: Date.now(), tipo, nome, cpf, razaoSocial, cnpj, email, username, password };
      await UserModel.create(newUser);
      return res.status(201).json({ id: newUser.id, username: newUser.username });
    }

    // Cadastro breve (sem username e senha)
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

export async function loginUser(req, res) {
  console.log('\n--- Nova Tentativa de Login ---');
  try {
    const { username, password } = req.body;
    console.log(`1. Dados recebidos do frontend: Usuário='${username}', Senha='${password}'`);

    const user = await UserModel.findByUsername(username);

    if (!user) {
      console.log('2. Resultado da Busca: Usuário não encontrado.');
      return res.status(401).json({ erro: "Credenciais inválidas" });
    }

    if (user.password !== password) {
      console.log('3. Senhas não conferem.');
      return res.status(401).json({ erro: "Credenciais inválidas" });
    }

    console.log('4. Login permitido.');
    res.status(200).json({ mensagem: "Login bem-sucedido!", user: { id: user.id, username: user.username } });

  } catch (error) {
    console.error('ERRO NO LOGIN:', error);
    res.status(500).json({ erro: "Erro ao fazer login" });
  }
}

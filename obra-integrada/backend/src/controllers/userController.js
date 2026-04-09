import { UserModel } from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


// ==============================
// CADASTRO RÁPIDO
// ==============================
export async function registerUser(req, res) {
  try {
    const { tipo, nome, cpf, razaoSocial, cnpj, email } = req.body;

    if (!email) {
      return res.status(400).json({ erro: "Email é obrigatório" });
    }

    // Verifica se já existe email
    const existingUser = await UserModel.findByUsername(email);
    if (existingUser) {
      return res.status(409).json({ erro: "Este email já está cadastrado!" });
    }

    if (tipo === "fisica") {
      if (!nome || !cpf) {
        return res.status(400).json({ erro: "Nome e CPF são obrigatórios para pessoa física" });
      }
    }

    if (tipo === "juridica") {
      if (!razaoSocial || !cnpj) {
        return res.status(400).json({ erro: "Razão social e CNPJ são obrigatórios para pessoa jurídica" });
      }
    }

    const newUser = {
      id: Date.now(),
      tipo,
      email,
      username: email, // <-- username SEMPRE será o email
      isBrief: true,
      ...(tipo === "fisica"
        ? { nome, cpf }
        : { razaoSocial, cnpj })
    };

    await UserModel.create(newUser);

    return res.status(201).json({
      mensagem: "Cadastro rápido criado com sucesso!",
      id: newUser.id
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: "Erro ao registrar usuário" });
  }
}



// ==============================
// LOGIN (USANDO EMAIL COMO USERNAME)
// ==============================
export async function loginUser(req, res) {
  try {
    const { username, password } = req.body;

    // username = email
    const user = await UserModel.findByUsername(username);

    if (!user) {
      return res.status(401).json({ erro: "Email ou senha inválidos" });
    }

    if (!user.password) {
      return res.status(403).json({ erro: "Usuário não completou o cadastro" });
    }

    const senhaCorreta = await bcrypt.compare(password, user.password);
    if (!senhaCorreta) {
      return res.status(401).json({ erro: "Email ou senha inválidos" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || "SUPER_SECRET",
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      mensagem: "Login bem-sucedido!",
      user: { id: user.id, username: user.username },
      token
    });

  } catch (error) {
    console.error("ERRO NO LOGIN:", error);
    return res.status(500).json({ erro: "Erro ao fazer login" });
  }
}



// ==============================
// FORMULÁRIO COMPLETO
// ==============================
export async function formularioCompleto(req, res) {
  try {
    const {
      userId,
      email,
      confirmarEmail,
      senha,
      confirmarSenha,
      tipoCadastro,
      nome,
      cnpj,
      razaoSocial,
      inscricaoEstadual,
      celular,
      telefone,
      cep,
      endereco,
      numero,
      complemento,
      referencia,
      bairro,
      cidade,
      estado
    } = req.body;

    if (!userId) return res.status(400).json({ erro: "ID do usuário é obrigatório!" });

    if (email !== confirmarEmail) {
      return res.status(400).json({ erro: "Os emails não coincidem" });
    }

    if (senha !== confirmarSenha) {
      return res.status(400).json({ erro: "As senhas não coincidem" });
    }

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ erro: "Usuário não encontrado!" });

    // Criptografa senha
    const hashedPassword = await bcrypt.hash(senha, 10);

    const dadosAtualizados = {
      ...user,
      email,
      username: email,   // <-- login será sempre email
      password: hashedPassword,
      isBrief: false,
      formulario: {
        tipoCadastro,
        nome,
        cnpj,
        razaoSocial,
        inscricaoEstadual,
        celular,
        telefone,
        cep,
        endereco,
        numero,
        complemento,
        referencia,
        bairro,
        cidade,
        estado
      }
    };

    await UserModel.update(userId, dadosAtualizados);

    return res.status(200).json({
      mensagem: "Formulário completo salvo com sucesso!",
      userId
    });

  } catch (error) {
    console.error("ERRO AO SALVAR FORMULÁRIO:", error);
    return res.status(500).json({ erro: "Erro ao enviar formulário" });
  }
}

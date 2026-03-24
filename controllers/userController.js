import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/user.js";

export async function registerUser(req, res) {
  try {
    const { username, email, password, tipo } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        erro: "Username, email e password são obrigatórios"
      });
    }

    const usuarioExistenteEmail = await UserModel.findByEmail(email);
    if (usuarioExistenteEmail) {
      return res.status(400).json({
        erro: "E-mail já cadastrado"
      });
    }

    const usuarioExistenteUsername = await UserModel.findByUsername(username);
    if (usuarioExistenteUsername) {
      return res.status(400).json({
        erro: "Username já cadastrado"
      });
    }

    const senhaHash = await bcrypt.hash(password, 10);

  const tipoFinal = tipo || "user"; 

const novoUsuario = await UserModel.create({
  username,
  email,
  password: senhaHash,
  tipo: tipoFinal
});

    return res.status(201).json({
      mensagem: "Usuário criado com sucesso",
      usuario: {
        id: novoUsuario.id,
        username: novoUsuario.username,
        email: novoUsuario.email,
        tipo: novoUsuario.tipo,
        created_at: novoUsuario.created_at
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      erro: "Erro ao cadastrar usuário"
    });
  }
}

export async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        erro: "E-mail e senha são obrigatórios"
      });
    }

    const usuario = await UserModel.findByEmail(email);

    if (!usuario) {
      return res.status(401).json({
        erro: "Credenciais inválidas"
      });
    }

    const senhaCorreta = await bcrypt.compare(password, usuario.password);

    if (!senhaCorreta) {
      return res.status(401).json({
        erro: "Credenciais inválidas"
      });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        tipo: usuario.tipo
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      mensagem: "Login realizado com sucesso",
      token,
      usuario: {
        id: usuario.id,
        username: usuario.username,
        email: usuario.email,
        tipo: usuario.tipo
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      erro: "Erro ao realizar login"
    });
  }
}
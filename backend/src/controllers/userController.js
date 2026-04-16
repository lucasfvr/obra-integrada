import { UserModel } from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';

// ==============================
// CADASTRO RÁPIDO (VALIDA, NÃO CRIA USUÁRIO AINDA)
// ==============================
export async function registerUser(req, res) {
  try {
    const { tipo, nome, cpf, razaoSocial, cnpj, email } = req.body;

    if (!email) {
      return res.status(400).json({ erro: 'Email é obrigatório' });
    }

    const existingUser = await UserModel.findByUsername(email);
    if (existingUser) {
      return res.status(409).json({ erro: 'Este email já está cadastrado!' });
    }

    // Validações extras para pessoa física/jurídica podem ser feitas aqui
    // (CPF/CNPJ únicos seriam verificados no banco via unique constraint se adicionada)

    // ID temporário para o frontend continuar no fluxo
    const tempId = Date.now().toString();

    return res.status(200).json({
      mensagem: 'Validação inicial ok! Prossiga para o formulário completo.',
      tempId,
      userId: tempId,
      id: tempId,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro na validação inicial' });
  }
}


// ==============================
// LOGIN
// ==============================
export async function loginUser(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
    }

    const user = await UserModel.findByUsername(username);

    if (!user) {
      return res.status(401).json({ erro: 'E-mail ou senha incorretos' });
    }

    if (!user.senha) {
      return res.status(403).json({ erro: 'Usuário não completou o cadastro' });
    }

    const senhaCorreta = await bcrypt.compare(password, user.senha);
    if (!senhaCorreta) {
      return res.status(401).json({ erro: 'E-mail ou senha incorretos' });
    }

    const token = jwt.sign(
      { 
        id: user.id_usuario, 
        username: user.username, 
        role: user.role || 'USER', 
        nome: user.nome,
        funcao: user.funcao,
        id_cliente: user.id_cliente || null
      },
      process.env.JWT_SECRET || 'SUPER_SECRET',
      { expiresIn: '8h' }
    );

    return res.status(200).json({
      mensagem: 'Login bem-sucedido!',
      user: { 
        id: user.id_usuario, 
        username: user.username, 
        role: user.role || 'USER', 
        nome: user.nome, 
        email: user.email,
        id_cliente: user.id_cliente || null
      },
      token,
    });
  } catch (error) {
    console.error('ERRO NO LOGIN:', error);
    return res.status(500).json({ erro: 'Erro ao fazer login' });
  }
}


// ==============================
// FORMULÁRIO COMPLETO — cria o usuário de fato no banco
// ==============================
export async function formularioCompleto(req, res) {
  try {
    const {
      email,
      confirmarEmail,
      senha,
      confirmarSenha,
      tipoCadastro,
      nome,
      razaoSocial,
      cpf,
      cnpj,
      celular,
      telefone,
    } = req.body;


    if (!email || !confirmarEmail) {
      return res.status(400).json({ erro: 'Email e confirmação são obrigatórios' });
    }
    if (email !== confirmarEmail) {
      return res.status(400).json({ erro: 'Os emails não coincidem' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ erro: 'Formato de email inválido' });
    }

    const existingEmail = await UserModel.findByUsername(email);
    if (existingEmail) {
      return res.status(409).json({ erro: 'Este email já está cadastrado!' });
    }

    if (!senha || !confirmarSenha) {
      return res.status(400).json({ erro: 'Senha e confirmação são obrigatórias' });
    }
    if (senha !== confirmarSenha) {
      return res.status(400).json({ erro: 'As senhas não coincidem' });
    }
    if (senha.length < 6) {
      return res.status(400).json({ erro: 'A senha deve ter no mínimo 6 caracteres' });
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(senha)) {
      return res.status(400).json({
        erro: 'A senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número',
      });
    }


    if (tipoCadastro === 'fisica') {
      if (!nome || nome.trim().length < 3) {
        return res.status(400).json({ erro: 'Nome é obrigatório e deve ter pelo menos 3 caracteres' });
      }
    } else if (tipoCadastro === 'juridica') {
      if (!razaoSocial || razaoSocial.trim().length < 3) {
        return res.status(400).json({ erro: 'Razão social é obrigatória e deve ter pelo menos 3 caracteres' });
      }
    } else {
      return res.status(400).json({ erro: 'Tipo de cadastro inválido' });
    }

    const hashedSenha = await bcrypt.hash(senha, 10);


    const novoUsuario = await UserModel.create({
      nome: tipoCadastro === 'fisica' ? nome : razaoSocial,
      email,
      username: email,
      senha: hashedSenha,
      telefone: celular || telefone || null,
      tipo_usuario: tipoCadastro,
      funcao: req.body.funcao || null,
      tipo_registro_profissional: req.body.tipo_registro_profissional || null,
      numero_registro_profissional: req.body.numero_registro_profissional || null,
    });

    return res.status(201).json({
      mensagem: 'Cadastro completo realizado com sucesso!',
      userId: novoUsuario.id_usuario,
      role: novoUsuario.role,
    });
  } catch (error) {
    console.error('ERRO AO SALVAR FORMULÁRIO:', error);
    return res.status(500).json({ erro: 'Erro ao enviar formulário' });
  }
}

// ==============================
// MÉTODOS DE ADMINISTRAÇÃO
// ==============================
export async function getAllUsers(req, res) {
  try {
    const users = await prisma.tb_usuario.findMany({ 
      select: { 
        id_usuario: true, 
        nome: true, 
        email: true, 
        tipo_usuario: true, 
        role: true,
        funcao: true 
      }
    });
    return res.status(200).json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao listar usuários' });
  }
}

export async function updateUserRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!role || (role !== 'USER' && role !== 'ADMIN')) {
      return res.status(400).json({ erro: 'Role inválida' });
    }

    const updatedUser = await prisma.tb_usuario.update({
      where: { id_usuario: Number(id) },
      data: { role },
      select: { id_usuario: true, nome: true, role: true }
    });

    return res.status(200).json({ mensagem: 'Cargo atualizado com sucesso!', user: updatedUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao atualizar cargo' });
  }
}

// ==============================
// OBTÉM USUÁRIOS DISPONÍVEIS (WIZARD ETAPA 3)
// ==============================
export async function getUsuariosDisponiveis(req, res) {
  try {
    const { id_cliente } = req.user;
    
    // Se for associado a uma construtora (Proprietário ou RH), busca da própria construtora
    // Para simplificar: buscar todos que não são admins master.
    // Opcionalmente podemos filtrar por query params: ?funcao=RESPONSAVEL
    
    let whereClause = {
      role: { notIn: ['ADMIN_MASTER', 'ADMIN'] }
    };

    if (id_cliente) {
      whereClause.id_cliente = id_cliente;
    }

    const { funcao } = req.query;
    if (funcao) {
      if (funcao === 'RESPONSAVEL') whereClause.role = 'RESPONSAVEL';
      else if (funcao === 'TRABALHADOR') whereClause.role = 'TRABALHADOR';
      else whereClause.funcao = funcao;
    }

    const users = await prisma.tb_usuario.findMany({
      where: whereClause,
      select: {
        id_usuario: true,
        nome: true,
        role: true,
        funcao: true,
        tipo_registro_profissional: true,
        numero_registro_profissional: true
      }
    });
    
    res.json(users);
  } catch (error) {
    console.error('[USER] Erro ao buscar usuários disponíveis:', error);
    res.status(500).json({ erro: 'Erro ao buscar usuários disponíveis' });
  }
}

import { UserModel } from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';

// Funções de validação
const validateCPF = (cpf) => {
  const cleaned = cpf.replace(/\D/g, "");

  if (cleaned.length !== 11) {
    return { valid: false, message: "CPF deve ter 11 dígitos" };
  }

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleaned)) {
    return { valid: false, message: "CPF inválido" };
  }

  // Calcula primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned[i]) * (10 - i);
  }
  let digit1 = 11 - (sum % 11);
  digit1 = digit1 >= 10 ? 0 : digit1;

  // Calcula segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned[i]) * (11 - i);
  }
  let digit2 = 11 - (sum % 11);
  digit2 = digit2 >= 10 ? 0 : digit2;

  if (
    digit1 !== parseInt(cleaned[9]) ||
    digit2 !== parseInt(cleaned[10])
  ) {
    return { valid: false, message: "CPF inválido" };
  }

  return { valid: true, message: "CPF válido" };
};

const validateCNPJ = (cnpj) => {
  const cleaned = cnpj.replace(/\D/g, "");

  if (cleaned.length !== 14) {
    return { valid: false, message: "CNPJ deve ter 14 dígitos" };
  }

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cleaned)) {
    return { valid: false, message: "CNPJ inválido" };
  }

  // Calcula primeiro dígito verificador
  let sum = 0;
  const firstMultiplier = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned[i]) * firstMultiplier[i];
  }
  let digit1 = 11 - (sum % 11);
  digit1 = digit1 >= 10 ? 0 : digit1;

  // Calcula segundo dígito verificador
  sum = 0;
  const secondMultiplier = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleaned[i]) * secondMultiplier[i];
  }
  let digit2 = 11 - (sum % 11);
  digit2 = digit2 >= 10 ? 0 : digit2;

  if (
    digit1 !== parseInt(cleaned[12]) ||
    digit2 !== parseInt(cleaned[13])
  ) {
    return { valid: false, message: "CNPJ inválido" };
  }

  return { valid: true, message: "CNPJ válido" };
};

const validateRazaoSocial = (razaoSocial) => {
  const trimmed = (razaoSocial || "").trim();
  if (trimmed.length < 3) {
    return { valid: false, message: "Razão Social deve ter no mínimo 3 caracteres" };
  }
  if (/^\d+$/.test(trimmed)) {
    return { valid: false, message: "Razão Social não pode conter apenas números" };
  }
  if (!/[a-zA-Z]/.test(trimmed)) {
    return { valid: false, message: "Razão Social deve conter pelo menos uma letra" };
  }
  return { valid: true };
};

// ==============================
// CADASTRO RÁPIDO (VALIDA, NÃO CRIA USUÁRIO AINDA)
// ==============================
export async function registerUser(req, res) {
  try {
    const { tipo, nome, cpf, razaoSocial, cnpj, email } = req.body;

    if (!email) {
      return res.status(400).json({ erro: 'Email é obrigatório' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const existingEmail = await UserModel.findByUsername(trimmedEmail);
    if (existingEmail) {
      return res.status(409).json({ erro: 'Este email já está cadastrado!' });
    }

    // Validação de duplicidade de CPF/CNPJ
    if (tipo === 'fisica' && cpf) {
      const cleanedCpf = cpf.replace(/\D/g, "");
      const existingCpf = await UserModel.findByUsername(cleanedCpf);
      if (existingCpf) {
        return res.status(409).json({ erro: 'Este CPF já está cadastrado!' });
      }
    } else if (tipo === 'juridica' && cnpj) {
      const cleanedCnpj = cnpj.replace(/\D/g, "");
      const existingCnpj = await UserModel.findByUsername(cleanedCnpj);
      if (existingCnpj) {
        return res.status(409).json({ erro: 'Este CNPJ já está cadastrado!' });
      }
    }

    // Validações adicionais para pessoa física
    if (tipo === 'fisica') {
      if (!nome || nome.trim().length < 3) {
        return res.status(400).json({ erro: 'Nome é obrigatório e deve ter pelo menos 3 caracteres' });
      }
    }

    // Validações adicionais para pessoa jurídica
    if (tipo === 'juridica') {
      const rsValidation = validateRazaoSocial(razaoSocial);
      if (!rsValidation.valid) {
        return res.status(400).json({ erro: rsValidation.message });
      }
    }

    // Validação de email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z][a-zA-Z0-9.-]{2,}\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ erro: 'Formato de email inválido' });
    }

    // Token de pré-cadastro assinado — garante consistência com o formulário final
    // Contém os dados validados para que o backend possa verificá-los na etapa seguinte
    const preRegPayload = {
      email: trimmedEmail,
      tipo,
      cpf:  tipo === 'fisica'   ? (cpf  || '').replace(/\D/g, '') : null,
      cnpj: tipo === 'juridica' ? (cnpj || '').replace(/\D/g, '') : null,
      razaoSocial: tipo === 'juridica' ? (razaoSocial || '').trim() : null,
    };
    const preRegToken = jwt.sign(
      preRegPayload,
      (() => { const secret = process.env.JWT_SECRET; if (!secret) throw new Error('JWT_SECRET not set'); return secret; })(),
      { expiresIn: '2h' }
    );

    const tempId = Date.now().toString();

    return res.status(200).json({
      mensagem: 'Validação inicial ok! Prossiga para o formulário completo.',
      tempId,
      userId: tempId,
      id: tempId,
      preRegToken,
    });
  } catch (error) {
    console.error('ERRO EM registerUser:', error);
    let message = 'Erro na validação inicial';
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0];
      if (field === 'email') message = 'Este email já está cadastrado!';
      else if (field === 'cpf') message = 'Este CPF já está cadastrado!';
      else if (field === 'cnpj') message = 'Este CNPJ já está cadastrado!';
      else message = `Campo único violado: ${field}`;
    } else if (error.message) {
      message = error.message;
    }
    return res.status(500).json({ erro: message });
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
        id_cliente: user.id_cliente || null,
        cnpj: user.cnpj || null,
        razao_social: user.razao_social || null
      },
      (() => { const secret = process.env.JWT_SECRET; if (!secret) throw new Error('JWT_SECRET not set'); return secret; })(),
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
        id_cliente: user.id_cliente || null,
        cnpj: user.cnpj || null,
        razao_social: user.razao_social || null
      },
      token,
    });
  } catch (error) {
    console.error('ERRO NO LOGIN:', error);
    return res.status(500).json({ erro: 'Erro ao fazer login' });
  }
}

export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ erro: 'O email é obrigatório' });
    }

    const user = await UserModel.findByUsername(email.trim());

    // Retorna mensagem genérica para evitar vazamento de existência de conta
    return res.status(200).json({
      mensagem:
        'Se o e-mail existir em nosso sistema, você receberá instruções para redefinir sua senha.',
    });
  } catch (error) {
    console.error('ERRO NO FORGOT PASSWORD:', error);
    return res.status(500).json({ erro: 'Erro ao processar recuperação de senha' });
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
      inscricaoEstadual,
      celular,
      telefone,
      cep,
      endereco,
      numero,
      bairro,
      cidade,
      estado,
      complemento,
      referencia,
      funcao,
      porteEmpresa,
      usoPlataforma,
      tipo_registro_profissional,
      numero_registro_profissional,
      preRegToken,
    } = req.body;

    // ── Validação do token de pré-cadastro (evita bypass da validação do frontend) ──
    if (!preRegToken) {
      return res.status(400).json({ erro: 'Token de pré-cadastro ausente. Inicie o cadastro pelo formulário.' });
    }
    let preRegData;
    try {
      preRegData = jwt.verify(preRegToken, (() => { const secret = process.env.JWT_SECRET; if (!secret) throw new Error('JWT_SECRET not set'); return secret; })());
    } catch {
      return res.status(400).json({ erro: 'Token de pré-cadastro inválido ou expirado. Reinicie o cadastro.' });
    }
    // Extrai e normaliza o email para usar nas verificações subsequentes
    const submittedEmail = (email || '').trim().toLowerCase();
    // Verifica consistência de CPF/CNPJ
    if (preRegData.tipo === 'fisica') {
      const submittedCpf = (cpf || '').replace(/\D/g, '');
      if (submittedCpf !== preRegData.cpf) {
        return res.status(400).json({ erro: 'O CPF informado não corresponde ao pré-cadastro.' });
      }
    } else if (preRegData.tipo === 'juridica') {
      const submittedCnpj = (cnpj || '').replace(/\D/g, '');
      if (submittedCnpj !== preRegData.cnpj) {
        return res.status(400).json({ erro: 'O CNPJ informado não corresponde ao pré-cadastro.' });
      }
      // Verifica consistência de Razão Social
      const submittedRS = (razaoSocial || '').trim().toLowerCase();
      if (preRegData.razaoSocial && submittedRS !== preRegData.razaoSocial.toLowerCase()) {
        return res.status(400).json({ erro: 'A Razão Social informada não corresponde ao pré-cadastro.' });
      }
    }


    if (!email || !confirmarEmail) {
      return res.status(400).json({ erro: 'Email e confirmação são obrigatórios' });
    }
    if (email !== confirmarEmail) {
      return res.status(400).json({ erro: 'Os emails não coincidem' });
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z][a-zA-Z0-9.-]{2,}\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ erro: 'Formato de email inválido' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const existingEmail = await UserModel.findByUsername(trimmedEmail);
    if (existingEmail) {
      return res.status(409).json({ erro: 'Este email já está cadastrado!' });
    }

    if (tipoCadastro === 'fisica') {
      if (!cpf || cpf.replace(/\D/g, "").length !== 11) {
        return res.status(400).json({ erro: 'CPF deve ter 11 dígitos' });
      }
      const cpfValidation = validateCPF(cpf);
      if (!cpfValidation.valid) {
        return res.status(400).json({ erro: cpfValidation.message });
      }
    }

    if (tipoCadastro === 'juridica') {
      if (!razaoSocial || razaoSocial.trim().length < 3) {
        return res.status(400).json({ erro: 'Razão social é obrigatória e deve ter pelo menos 3 caracteres' });
      }
      if (!inscricaoEstadual || inscricaoEstadual.trim().length === 0) {
        return res.status(400).json({ erro: 'Inscrição estadual é obrigatória' });
      }
      const ieDigitos = inscricaoEstadual.replace(/\D/g, "");
      if (ieDigitos.length < 8 || ieDigitos.length > 14) {
        return res.status(400).json({ erro: 'Inscrição estadual deve ter entre 8 e 14 dígitos' });
      }
      if (!cnpj || cnpj.replace(/\D/g, "").length !== 14) {
        return res.status(400).json({ erro: 'CNPJ deve ter 14 dígitos' });
      }
      const cnpjValidation = validateCNPJ(cnpj);
      if (!cnpjValidation.valid) {
        return res.status(400).json({ erro: cnpjValidation.message });
      }
    }

    // Validação de duplicidade final
    if (tipoCadastro === 'fisica' && cpf) {
      const cleanedCpf = cpf.replace(/\D/g, "");
      const existingCpf = await UserModel.findByUsername(cleanedCpf);
      if (existingCpf) return res.status(409).json({ erro: 'Este CPF já está cadastrado!' });
    } else if (tipoCadastro === 'juridica' && cnpj) {
      const cleanedCnpj = cnpj.replace(/\D/g, "");
      const existingCnpj = await UserModel.findByUsername(cleanedCnpj);
      if (existingCnpj) return res.status(409).json({ erro: 'Este CNPJ já está cadastrado!' });
    }

    const cepClean = (cep || "").replace(/\D/g, "");
    if (!cepClean || cepClean.length !== 8) {
      return res.status(400).json({ erro: 'CEP deve ter 8 dígitos' });
    }
    if (!endereco || !endereco.trim()) {
      return res.status(400).json({ erro: 'Endereço é obrigatório' });
    }
    if (!numero || !numero.trim()) {
      return res.status(400).json({ erro: 'Número é obrigatório' });
    }
    if (!bairro || !bairro.trim()) {
      return res.status(400).json({ erro: 'Bairro é obrigatório' });
    }
    if (!cidade || !cidade.trim()) {
      return res.status(400).json({ erro: 'Cidade é obrigatória' });
    }
    if (!estado || !/^[A-Za-z]{2}$/.test(estado.trim())) {
      return res.status(400).json({ erro: 'Estado deve ser a sigla com 2 letras' });
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

    if (!usoPlataforma) {
      return res.status(400).json({ erro: 'A forma de utilização da plataforma é obrigatória' });
    }

    if (tipo_registro_profissional && !numero_registro_profissional) {
      return res.status(400).json({ erro: `Número do ${tipo_registro_profissional} é obrigatório` });
    }


    if (tipoCadastro === 'fisica') {
      if (!nome || nome.trim().length < 3) {
        return res.status(400).json({ erro: 'Nome é obrigatório e deve ter pelo menos 3 caracteres' });
      }
    } else if (tipoCadastro === 'juridica') {
      const rsValidation = validateRazaoSocial(razaoSocial);
      if (!rsValidation.valid) {
        return res.status(400).json({ erro: rsValidation.message });
      }
    } else {
      return res.status(400).json({ erro: 'Tipo de cadastro inválido' });
    }

    const hashedSenha = await bcrypt.hash(senha, 10);

    const userData = {
      nome: tipoCadastro === 'fisica' ? (nome || '').trim() : (razaoSocial || '').trim(),
      email: trimmedEmail,
      username: trimmedEmail,
      senha: hashedSenha,
      cpf: (tipoCadastro === 'fisica' && cpf) ? cpf.replace(/\D/g, "") : null,
      cnpj: (tipoCadastro === 'juridica' && cnpj) ? cnpj.replace(/\D/g, "") : null,
      razao_social: tipoCadastro === 'juridica' ? (razaoSocial || '').trim() : null,
      inscricao_estadual: tipoCadastro === 'juridica' ? (inscricaoEstadual || '').trim() : null,
      telefone: (celular || telefone || '').trim() || null,
      tipo_usuario: tipoCadastro,
      funcao: (funcao || '').trim() || null,
      porte_empresa: (porteEmpresa || '').trim() || null,
      uso_plataforma: (usoPlataforma || '').trim() || null,
      tipo_registro_profissional: (tipo_registro_profissional || '').trim() || null,
      numero_registro_profissional: (numero_registro_profissional || '').trim() || null,
      // Consolida todos os dados de endereço no campo único 'endereco' do schema
      endereco: [
        endereco ? `${endereco}, ${numero}` : null,
        complemento ? complemento.trim() : null,
        bairro ? bairro.trim() : null,
        cidade && estado ? `${cidade.trim()} - ${estado.trim().toUpperCase()}` : (cidade || estado || null),
        cepClean ? `CEP: ${cepClean}` : null,
      ].filter(Boolean).join(' | ') || null,
    };

    const novoUsuario = await UserModel.create(userData);

    return res.status(201).json({
      mensagem: 'Cadastro completo realizado com sucesso!',
      userId: novoUsuario.id_usuario,
      role: novoUsuario.role,
    });
  } catch (error) {
    console.error('ERRO AO SALVAR FORMULÁRIO:', error);
    let message = 'Erro ao enviar formulário';
    if (error.code === 'P2002') {
      // Unique constraint violation
      const field = error.meta?.target?.[0];
      if (field === 'email') message = 'Este email já está cadastrado!';
      else if (field === 'cpf') message = 'Este CPF já está cadastrado!';
      else if (field === 'cnpj') message = 'Este CNPJ já está cadastrado!';
      else message = `Campo único violado: ${field}`;
    } else if (error.message) {
      message = error.message;
    }
    return res.status(500).json({ erro: message });
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

/**
 * Atualiza role e status do usuário (usada pela RH)
 * Requer permissão 'gerenciar_usuarios'
 */
export async function updateUserRoleAndStatus(req, res) {
  try {
    const { id } = req.params;
    const { role, status } = req.body;
    const { id_cliente } = req.user;

    if (!id) {
      return res.status(400).json({ success: false, error: 'ID do usuário é obrigatório' });
    }

    // Validação do novo role
    const validRoles = ['ADMIN', 'RH', 'PROPRIETARIO', 'RESPONSAVEL', 'ESTAGIARIO', 'TRABALHADOR', 'CLIENTE', 'EMPREITEIRA', 'USER'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ success: false, error: 'Role inválida' });
    }

    // Validação do status
    if (status && !['ATIVO', 'INATIVO'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Status inválido' });
    }

    // Verificar se o usuário existe e pertence ao mesmo cliente
    const user = await prisma.tb_usuario.findUnique({
      where: { id_usuario: Number(id) }
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
    }

    // Validação de multi-tenant
    if (id_cliente && user.id_cliente !== id_cliente) {
      return res.status(403).json({ success: false, error: 'Acesso negado: usuário em outro cliente' });
    }

    // Construir dados para atualizar
    const updateData = {};
    if (role) updateData.role = role;
    if (status) updateData.status = status;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, error: 'Nenhum campo para atualizar' });
    }

    const updatedUser = await prisma.tb_usuario.update({
      where: { id_usuario: Number(id) },
      data: updateData,
      select: {
        id_usuario: true,
        nome: true,
        email: true,
        role: true,
        status: true
      }
    });

    return res.status(200).json({
      success: true,
      data: updatedUser,
      message: 'Acesso atualizado com sucesso!'
    });
  } catch (error) {
    console.error('[USER] Erro ao atualizar role/status:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao atualizar acesso do usuário'
    });
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

    const { funcao, cargo_base } = req.query;
    if (funcao) {
      if (funcao === 'RESPONSAVEL') whereClause.role = 'RESPONSAVEL';
      else if (funcao === 'TRABALHADOR') whereClause.role = 'TRABALHADOR';
      else whereClause.funcao = funcao;
    }

    if (cargo_base) {
      whereClause.OR = [
        { cargo_base: cargo_base },
        { funcao: { contains: cargo_base, mode: 'insensitive' } },
        ...(cargo_base === 'Engenheiro' ? [
          { funcao: { contains: 'Arq', mode: 'insensitive' } },
          { cargo_base: { contains: 'Arq', mode: 'insensitive' } }
        ] : [])
      ];
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

/**
 * Retorna todos os usuários do tenant (equipe global) com paginação, busca e filtros
 */
export async function getEquipeGlobal(req, res) {
  try {
    const { id_cliente } = req.user;
    
    // Filtros e paginação
    const { id_obra, status, funcao, busca, page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    let whereClause = {};
    if (id_cliente) {
      whereClause.id_cliente = id_cliente;
    }

    if (status) {
      whereClause.status = status;
    }

    if (funcao) {
      whereClause.OR = [
        { funcao: { contains: funcao, mode: 'insensitive' } },
        { cargo_base: { contains: funcao, mode: 'insensitive' } }
      ];
    }

    if (busca) {
      const searchTerms = { contains: busca, mode: 'insensitive' };
      whereClause.AND = [
        ...(whereClause.AND || []),
        {
          OR: [
            { nome: searchTerms },
            { email: searchTerms },
            { matricula: searchTerms }
          ]
        }
      ];
    }

    if (id_obra) {
      whereClause.tb_usuario_obra = {
        some: {
          id_obra: Number(id_obra)
        }
      };
    }

    const [equipe, total] = await Promise.all([
      prisma.tb_usuario.findMany({
        where: whereClause,
        skip,
        take: limitNumber,
        orderBy: { nome: 'asc' },
        include: {
          tb_usuario_obra: {
            include: {
              tb_obra: {
                select: {
                  id_obra: true,
                  nome: true
                }
              },
              tb_papel: {
                select: {
                  id_papel: true,
                  nome: true
                }
              }
            }
          }
        }
      }),
      prisma.tb_usuario.count({ where: whereClause })
    ]);

    const data = equipe.map(user => {
      return {
        id_usuario: user.id_usuario,
        nome: user.nome,
        matricula: user.matricula,
        email: user.email,
        role: user.role,
        status: user.status,
        funcao: user.funcao || user.cargo_base || 'Sem Função',
        obras: user.tb_usuario_obra.map(uo => ({
          id_obra: uo.tb_obra.id_obra,
          nome: uo.tb_obra.nome,
          id_papel: uo.id_papel,
          papel: uo.tb_papel?.nome || 'Membro',
          valor_dia: Number(uo.valor_dia || 0)
        }))
      };
    });

    res.json({
      data,
      meta: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber)
      }
    });
  } catch (error) {
    console.error('[USER] Erro ao buscar equipe global:', error);
    res.status(500).json({ erro: 'Erro ao buscar equipe global' });
  }
}


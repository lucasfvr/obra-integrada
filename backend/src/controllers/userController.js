import { UserModel } from '../models/user.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import { sendVerificationEmail } from '../services/emailService.js';

// In-memory temporary stores for codes and pending registrations
// Map key conventions:
//  - codes: `${email}:${purpose}` => { code, expiresAt }
//  - pendingRegistrations: tempId => { userData, expiresAt, code }
const codesStore = new Map();
const pendingRegistrations = new Map();
const resendCooldownStore = new Map();

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
}

function setCode(email, purpose, code, ttlMinutes = 15) {
  const key = `${email.toLowerCase()}:${purpose}`;
  const expiresAt = Date.now() + ttlMinutes * 60 * 1000;
  codesStore.set(key, { code, expiresAt });
}

function verifyCode(email, purpose, code) {
  const key = `${email.toLowerCase()}:${purpose}`;
  const entry = codesStore.get(key);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    codesStore.delete(key);
    return false;
  }
  if (entry.code !== String(code)) return false;
  codesStore.delete(key);
  return true;
}

function getResendCooldown(email, purpose, cooldownSeconds = 30) {
  const key = `${email.toLowerCase()}:${purpose}`;
  const entry = resendCooldownStore.get(key);

  if (!entry) {
    return { allowed: true, remainingSeconds: 0 };
  }

  if (Date.now() < entry.expiresAt) {
    return {
      allowed: false,
      remainingSeconds: Math.max(1, Math.ceil((entry.expiresAt - Date.now()) / 1000)),
    };
  }

  resendCooldownStore.delete(key);
  return { allowed: true, remainingSeconds: 0 };
}

function markCodeSent(email, purpose, cooldownSeconds = 30) {
  const key = `${email.toLowerCase()}:${purpose}`;
  resendCooldownStore.set(key, { expiresAt: Date.now() + cooldownSeconds * 1000 });
}

function createSessionForUser(user) {
  return jwt.sign(
    {
      id: user.id_usuario,
      username: user.username,
      role: user.role || 'USER',
      nome: user.nome,
      funcao: user.funcao,
      id_cliente: user.id_cliente || null,
      cnpj: user.cnpj || null,
      razao_social: user.razao_social || null,
      acesso_rh: user.acesso_rh,
    },
    (() => { const secret = process.env.JWT_SECRET; if (!secret) throw new Error('JWT_SECRET not set'); return secret; })(),
    { expiresIn: '8h' }
  );
}

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
// CADASTRO RÁPIDO POR EMAIL (VALIDA, NÃO CRIA USUÁRIO AINDA)
// ==============================
export async function registerUser(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ erro: 'Email é obrigatório' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const existingEmail = await UserModel.findByUsername(trimmedEmail);
    if (existingEmail) {
      return res.status(409).json({ erro: 'Este email já está cadastrado!' });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z][a-zA-Z0-9.-]{2,}\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ erro: 'Formato de email inválido' });
    }

    const allowedDomains = process.env.EMAIL_ALLOWED_DOMAINS
      ? process.env.EMAIL_ALLOWED_DOMAINS.split(',').map((d) => d.trim().toLowerCase()).filter(Boolean)
      : [];

    if (allowedDomains.length > 0) {
      const domain = trimmedEmail.split('@')[1] || '';
      if (!allowedDomains.includes(domain)) {
        return res.status(400).json({ erro: `Domínio de email não permitido. Use: ${allowedDomains.join(', ')}` });
      }
    }

    const preRegPayload = { email: trimmedEmail };
    const preRegToken = jwt.sign(
      preRegPayload,
      (() => { const secret = process.env.JWT_SECRET; if (!secret) throw new Error('JWT_SECRET not set'); return secret; })(),
      { expiresIn: '2h' }
    );

    const tempId = Date.now().toString();

    return res.status(200).json({
      mensagem: 'Pré-cadastro validado. Prossiga para o formulário completo.',
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
        razao_social: user.razao_social || null,
        acesso_rh: user.acesso_rh
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
        razao_social: user.razao_social || null,
        acesso_rh: user.acesso_rh
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

    const normalizedEmail = email.trim().toLowerCase();
    const user = await UserModel.findByUsername(normalizedEmail);

    if (!user) {
      return res.status(404).json({ erro: 'E-mail não cadastrado' });
    }

    try {
      const code = generateCode();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      await prisma.tb_usuario.update({
        where: { id_usuario: user.id_usuario },
        data: {
          password_reset_token: code,
          password_reset_expires: expiresAt,
        },
      });

      await sendVerificationEmail(user.email, code, 'password');
    } catch (e) {
      console.error('Erro ao enviar email de recuperação:', e);
      return res.status(500).json({ erro: 'Erro ao enviar o código de recuperação' });
    }

    return res.status(200).json({
      mensagem: 'O código de recuperação foi enviado para o seu e-mail.',
    });
  } catch (error) {
    console.error('ERRO NO FORGOT PASSWORD:', error);
    return res.status(500).json({ erro: 'Erro ao processar recuperação de senha' });
  }
}

export async function verifyResetCode(req, res) {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ erro: 'Email e código são obrigatórios' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.tb_usuario.findFirst({
      where: {
        email: normalizedEmail,
        password_reset_token: String(code),
      },
    });

    if (!user || !user.password_reset_expires || new Date() > user.password_reset_expires) {
      return res.status(400).json({ erro: 'Código inválido ou expirado' });
    }

    return res.status(200).json({ mensagem: 'Código válido' });
  } catch (error) {
    console.error('ERRO em verifyResetCode:', error);
    return res.status(500).json({ erro: 'Erro ao validar código' });
  }
}

// Endpoint usado pela rota /users/send-code
export async function sendVerificationCode(req, res) {
  try {
    const { email, purpose } = req.body;
    if (!email || !purpose) return res.status(400).json({ erro: 'email e purpose são obrigatórios' });

    const normalizedEmail = email.trim().toLowerCase();
    const cooldown = getResendCooldown(normalizedEmail, purpose);
    if (!cooldown.allowed) {
      return res.status(429).json({ erro: `Aguarde ${cooldown.remainingSeconds} segundos antes de reenviar o código.` });
    }

    const code = generateCode();
    setCode(normalizedEmail, purpose, code, 15);
    markCodeSent(normalizedEmail, purpose, 30);
    await sendVerificationEmail(normalizedEmail, code, purpose === 'password' ? 'password' : 'verification');
    return res.status(200).json({ mensagem: 'Código enviado' });
  } catch (error) {
    console.error('ERRO em sendVerificationCode:', error);
    return res.status(500).json({ erro: 'Erro ao enviar código' });
  }
}

// Confirm registration: cria o usuário real usando a pendingRegistrations store
export async function confirmRegistration(req, res) {
  try {
    const { tempId, code } = req.body;
    if (!tempId || !code) return res.status(400).json({ erro: 'tempId e code são obrigatórios' });
    const pending = pendingRegistrations.get(String(tempId));
    if (!pending) return res.status(400).json({ erro: 'Solicitação de cadastro não encontrada ou expirada' });
    const { email } = pending.userData;
    if (!verifyCode(email, 'register', code)) return res.status(400).json({ erro: 'Código inválido ou expirado' });

    // cria usuário no banco
    const novoUsuario = await UserModel.create(pending.userData);
    pendingRegistrations.delete(String(tempId));
    return res.status(201).json({ mensagem: 'Cadastro confirmado e conta criada', userId: novoUsuario.id_usuario });
  } catch (error) {
    console.error('ERRO em confirmRegistration:', error);
    return res.status(500).json({ erro: 'Erro ao confirmar cadastro' });
  }
}

// Verifica código de recuperação e altera a senha
export async function verifyAndResetPassword(req, res) {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ erro: 'Email, código e newPassword são obrigatórios' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.tb_usuario.findFirst({
      where: {
        email: normalizedEmail,
        password_reset_token: String(code),
      },
    });

    if (!user || !user.password_reset_expires || new Date() > user.password_reset_expires) {
      return res.status(400).json({ erro: 'Código inválido ou expirado' });
    }

    const hashedSenha = await bcrypt.hash(newPassword, 10);
    const updatedUser = await prisma.tb_usuario.update({
      where: { id_usuario: user.id_usuario },
      data: {
        senha: hashedSenha,
        password_reset_token: null,
        password_reset_expires: null,
      },
    });

    const sessionToken = createSessionForUser(updatedUser);
    return res.status(200).json({
      mensagem: 'Senha atualizada com sucesso',
      token: sessionToken,
      user: {
        id: updatedUser.id_usuario,
        username: updatedUser.username,
        role: updatedUser.role || 'USER',
        nome: updatedUser.nome,
        email: updatedUser.email,
        id_cliente: updatedUser.id_cliente || null,
        cnpj: updatedUser.cnpj || null,
        razao_social: updatedUser.razao_social || null,
        acesso_rh: updatedUser.acesso_rh,
      },
    });
  } catch (error) {
    console.error('ERRO em verifyAndResetPassword:', error);
    return res.status(500).json({ erro: 'Erro ao redefinir senha' });
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
    if (!preRegData.email || submittedEmail !== preRegData.email) {
      return res.status(400).json({ erro: 'O email informado não corresponde ao pré-cadastro.' });
    }

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

    const clienteDefault = await prisma.tb_cliente.findFirst();

    const userData = {
      id_cliente: clienteDefault ? clienteDefault.id_cliente : null,
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

    // Em vez de criar o usuário imediatamente, armazenamos temporariamente e
    // enviamos um código para o e-mail para confirmação final.
    const tempId = Date.now().toString() + Math.floor(Math.random() * 10000).toString();
    const expiresAt = Date.now() + 1000 * 60 * 60; // 1 hora para completar cadastro

    // Armazena userData para criação após verificação do código
    pendingRegistrations.set(tempId, { userData, expiresAt });

    // Gera e envia código de verificação
    const code = generateCode();
    setCode(trimmedEmail, 'register', code, 15);
    markCodeSent(trimmedEmail, 'register', 30);
    try {
      await sendVerificationEmail(trimmedEmail, code, 'verification');
    } catch (e) {
      console.error('Falha ao enviar código de verificação:', e);
      return res.status(502).json({ erro: 'Não foi possível enviar o código de verificação. Verifique a configuração de email.' });
    }

    return res.status(200).json({
      mensagem: 'Código de verificação enviado para o e-mail. Confirme para ativar sua conta.',
      tempId,
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

    const validRoles = ['ADMIN', 'RH', 'PROPRIETARIO', 'RESPONSAVEL', 'ESTAGIARIO', 'TRABALHADOR', 'CLIENTE', 'EMPREITEIRA', 'PLANEJADOR', 'ENGENHEIRO', 'USER'];
    if (!role || !validRoles.includes(role)) {
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
    const validRoles = ['ADMIN', 'RH', 'PROPRIETARIO', 'RESPONSAVEL', 'ESTAGIARIO', 'TRABALHADOR', 'CLIENTE', 'EMPREITEIRA', 'PLANEJADOR', 'ENGENHEIRO', 'USER'];
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


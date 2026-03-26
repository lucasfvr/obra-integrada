import { UserModel } from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


// ==============================
// CADASTRO RÁPIDO (AGORA SÓ VALIDA, NÃO CRIA USUÁRIO)
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
      // Verifica se já existe CPF
      const allUsers = await UserModel.findAll();
      const existingCPF = allUsers.find(u => u.cpf === cpf);
      if (existingCPF) {
        return res.status(409).json({ erro: "Este CPF já está cadastrado!" });
      }
    }

    if (tipo === "juridica") {
      if (!razaoSocial || !cnpj) {
        return res.status(400).json({ erro: "Razão social e CNPJ são obrigatórios para pessoa jurídica" });
      }
      // Verifica se já existe CNPJ
      const allUsers = await UserModel.findAll();
      const existingCNPJ = allUsers.find(u => u.cnpj === cnpj);
      if (existingCNPJ) {
        return res.status(409).json({ erro: "Este CNPJ já está cadastrado!" });
      }
    }

    // Gera ID temporário para o formulário
    const tempId = Date.now().toString();

    return res.status(200).json({
      mensagem: "Validação inicial ok! Prossiga para o formulário completo.",
      tempId
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: "Erro na validação inicial" });
  }
}



// ==============================
// LOGIN (USANDO EMAIL COMO USERNAME)
// ==============================
export async function loginUser(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ erro: "Email e senha são obrigatórios" });
    }

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
      tempId,
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

    if (!tempId) return res.status(400).json({ erro: "ID temporário é obrigatório!" });

    // Validações de email
    if (!email || !confirmarEmail) {
      return res.status(400).json({ erro: "Email e confirmação são obrigatórios" });
    }
    if (email !== confirmarEmail) {
      return res.status(400).json({ erro: "Os emails não coincidem" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ erro: "Formato de email inválido" });
    }
    // Verifica se o email já está cadastrado
    const allUsers = await UserModel.findAll();
    const existingEmail = allUsers.find(u => u.email === email);
    if (existingEmail) {
      return res.status(409).json({ erro: "Este email já está cadastrado!" });
    }

    // Validações de senha
    if (!senha || !confirmarSenha) {
      return res.status(400).json({ erro: "Senha e confirmação são obrigatórias" });
    }
    if (senha !== confirmarSenha) {
      return res.status(400).json({ erro: "As senhas não coincidem" });
    }
    if (senha.length < 6) {
      return res.status(400).json({ erro: "A senha deve ter no mínimo 6 caracteres" });
    }
    // Verifica se tem pelo menos uma letra maiúscula, uma minúscula e um número
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(senha)) {
      return res.status(400).json({ erro: "A senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número" });
    }

    // Validações de tipo de cadastro
    if (tipoCadastro === "fisica") {
      if (!nome || nome.trim().length < 3) {
        return res.status(400).json({ erro: "Nome é obrigatório e deve ter pelo menos 3 caracteres" });
      }
    } else if (tipoCadastro === "juridica") {
      if (!razaoSocial || razaoSocial.trim().length < 3) {
        return res.status(400).json({ erro: "Razão social é obrigatória e deve ter pelo menos 3 caracteres" });
      }
      if (!cnpj) {
        return res.status(400).json({ erro: "CNPJ é obrigatório" });
      }
      // Validação básica de CNPJ (14 dígitos)
      const cnpjClean = cnpj.replace(/\D/g, "");
      if (cnpjClean.length !== 14) {
        return res.status(400).json({ erro: "CNPJ deve ter 14 dígitos" });
      }
      // Verifica se CNPJ já está cadastrado
      const existingCNPJ = allUsers.find(u => u.cnpj === cnpj);
      if (existingCNPJ) {
        return res.status(409).json({ erro: "Este CNPJ já está cadastrado!" });
      }
    } else {
      return res.status(400).json({ erro: "Tipo de cadastro inválido" });
    }

    // Validações de contato
    if (!celular) {
      return res.status(400).json({ erro: "Celular é obrigatório" });
    }
    // Validação básica de celular (10 ou 11 dígitos)
    const celularClean = celular.replace(/\D/g, "");
    if (celularClean.length < 10 || celularClean.length > 11) {
      return res.status(400).json({ erro: "Celular deve ter 10 ou 11 dígitos" });
    }

    // Validações de endereço
    if (!cep) {
      return res.status(400).json({ erro: "CEP é obrigatório" });
    }
    const cepClean = cep.replace(/\D/g, "");
    if (cepClean.length !== 8) {
      return res.status(400).json({ erro: "CEP deve ter 8 dígitos" });
    }
    if (!endereco || !numero || !bairro || !cidade || !estado) {
      return res.status(400).json({ erro: "Endereço, número, bairro, cidade e estado são obrigatórios" });
    }

    // Criptografa senha
    const hashedPassword = await bcrypt.hash(senha, 10);

    const newUser = {
      id: tempId,
      tipo: tipoCadastro,
      email,
      username: email,
      password: hashedPassword,
      isBrief: false,
      ...(tipoCadastro === "fisica"
        ? { nome, cpf: "" } // CPF não é coletado no formulário completo
        : { razaoSocial, cnpj }),
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

    await UserModel.create(newUser);

    return res.status(201).json({
      mensagem: "Cadastro completo realizado com sucesso!",
      userId: newUser.id
    });

  } catch (error) {
    console.error("ERRO AO SALVAR FORMULÁRIO:", error);
    return res.status(500).json({ erro: "Erro ao enviar formulário" });
  }
}

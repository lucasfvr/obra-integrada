import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';

/**
 * Retorna todas as páginas cadastradas no sistema.
 */
export async function getPaginas(req, res) {
  try {
    const paginas = await prisma.tb_pagina.findMany({
      orderBy: { nome: 'asc' }
    });
    return res.status(200).json(paginas);
  } catch (error) {
    console.error('[ACCESS] Erro ao listar páginas:', error);
    return res.status(500).json({ error: 'Erro ao listar páginas' });
  }
}

/**
 * Retorna todos os usuários para o painel de controle de acesso do RH.
 */
export async function getUsuariosParaAcesso(req, res) {
  try {
    const usuarios = await prisma.tb_usuario.findMany({
      select: {
        id_usuario: true,
        nome: true,
        email: true,
        role: true,
        status: true,
      },
      orderBy: { nome: 'asc' }
    });
    return res.status(200).json(usuarios);
  } catch (error) {
    console.error('[ACCESS] Erro ao listar usuários:', error);
    return res.status(500).json({ error: 'Erro ao listar usuários' });
  }
}

/**
 * Retorna as permissões de um usuário específico para todas as páginas.
 */
export async function getUserPermissions(req, res) {
  try {
    const { id_usuario } = req.params;

    const [paginas, permissoes] = await Promise.all([
      prisma.tb_pagina.findMany(),
      prisma.tb_permissao_pagina.findMany({
        where: { id_usuario: Number(id_usuario) }
      })
    ]);

    const resultado = paginas.map(pagina => {
      const perm = permissoes.find(p => p.id_pagina === pagina.id_pagina);
      return {
        id_pagina: pagina.id_pagina,
        nome: pagina.nome,
        rota: pagina.rota,
        permitido: perm ? perm.permitido : false
      };
    });

    return res.status(200).json(resultado);
  } catch (error) {
    console.error('[ACCESS] Erro ao buscar permissões do usuário:', error);
    return res.status(500).json({ error: 'Erro ao buscar permissões' });
  }
}

/**
 * Retorna as permissões de PÁGINA do usuário autenticado (ele mesmo).
 * Usado pelo PageAuthGuard no front — NÃO exige RH, pois qualquer usuário
 * precisa consultar as próprias permissões para renderizar suas páginas.
 */
export async function getMinhasPermissoes(req, res) {
  try {
    const id_usuario = req.user?.id;
    if (!id_usuario) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const [paginas, permissoes] = await Promise.all([
      prisma.tb_pagina.findMany(),
      prisma.tb_permissao_pagina.findMany({ where: { id_usuario } })
    ]);

    const resultado = paginas.map(pagina => {
      const perm = permissoes.find(p => p.id_pagina === pagina.id_pagina);
      return {
        id_pagina: pagina.id_pagina,
        nome: pagina.nome,
        rota: pagina.rota,
        permitido: perm ? perm.permitido : false
      };
    });

    return res.status(200).json(resultado);
  } catch (error) {
    console.error('[ACCESS] Erro ao buscar minhas permissões:', error);
    return res.status(500).json({ error: 'Erro ao buscar permissões' });
  }
}

/**
 * Atualiza a permissão de um usuário para uma página específica.
 */
export async function updateUserPermission(req, res) {
  try {
    const { id_usuario, id_pagina, permitido } = req.body;

    if (!id_usuario || !id_pagina || typeof permitido !== 'boolean') {
      return res.status(400).json({ error: 'Dados inválidos' });
    }

    const permissao = await prisma.tb_permissao_pagina.upsert({
      where: {
        idx_unique_user_page: {
          id_usuario: Number(id_usuario),
          id_pagina: Number(id_pagina)
        }
      },
      update: {
        permitido
      },
      create: {
        id_usuario: Number(id_usuario),
        id_pagina: Number(id_pagina),
        permitido
      }
    });

    return res.status(200).json({ message: 'Permissão atualizada com sucesso', permissao });
  } catch (error) {
    console.error('[ACCESS] Erro ao atualizar permissão:', error);
    return res.status(500).json({ error: 'Erro ao atualizar permissão' });
  }
}

/**
 * Cria um novo acesso para um usuário.
 * Exclusivo para o RH (validado na rota).
 */
export async function criarAcessoUsuario(req, res) {
  try {
    const { nome, cpf, role, permissoes } = req.body;

    if (!nome || !cpf) {
      return res.status(400).json({ error: 'Nome e CPF são obrigatórios' });
    }

    // Normaliza a role e decide o flag acesso_rh: sem isso, um usuário
    // criado com role RH nasceria com acesso_rh=false e cairia em
    // "Acesso Restrito" ao entrar — exatamente o bug do módulo de permissão.
    const roleFinal = (role || 'USER').trim().toUpperCase();
    const ROLES_COM_RH = ['RH', 'ADMIN', 'ADMIN_MASTER', 'PROPRIETARIO'];
    const acessoRh = ROLES_COM_RH.includes(roleFinal);

    // Gerar email automático no padrão nome.sobrenome@vanguarda.com
    const nomes = nome.trim().split(' ');
    let emailBase = '';
    if (nomes.length >= 2) {
      emailBase = `${nomes[0].toLowerCase()}.${nomes[nomes.length - 1].toLowerCase()}`;
    } else {
      emailBase = `${nomes[0].toLowerCase()}`;
    }
    
    // Remover acentos e caracteres especiais
    emailBase = emailBase.normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9.]/g, "");

    let emailFinal = `${emailBase}@vanguarda.com`;
    
    // Verificar se email já existe
    let contador = 1;
    while (await prisma.tb_usuario.findUnique({ where: { email: emailFinal } })) {
      emailFinal = `${emailBase}${contador}@vanguarda.com`;
      contador++;
    }

    // Verificar se CPF já existe
    const cpfLimpo = cpf.replace(/\D/g, "");
    if (await prisma.tb_usuario.findUnique({ where: { cpf: cpfLimpo } })) {
      return res.status(409).json({ error: 'Este CPF já está cadastrado no sistema.' });
    }

    // Gerar senha aleatória (6 caracteres alfanuméricos)
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let senhaGerada = '';
    for (let i = 0; i < 6; i++) {
      senhaGerada += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const hashedSenha = await bcrypt.hash(senhaGerada, 10);

    const clienteDefault = await prisma.tb_cliente.findFirst();

    // Criar usuário
    const novoUsuario = await prisma.tb_usuario.create({
      data: {
        id_cliente: clienteDefault ? clienteDefault.id_cliente : null,
        nome: nome.trim(),
        email: emailFinal,
        username: emailFinal,
        senha: hashedSenha,
        cpf: cpfLimpo,
        telefone: null,
        role: roleFinal,
        status: 'ATIVO',
        tipo_usuario: 'fisica',
        acesso_rh: acessoRh,
      }
    });

    // Conceder acessos às páginas marcadas
    if (permissoes && Array.isArray(permissoes) && permissoes.length > 0) {
      const permissoesData = permissoes.map(id_pagina => ({
        id_usuario: novoUsuario.id_usuario,
        id_pagina: Number(id_pagina),
        permitido: true
      }));

      await prisma.tb_permissao_pagina.createMany({
        data: permissoesData
      });
    }

    return res.status(201).json({
      message: 'Acesso criado com sucesso!',
      credenciais: {
        email: emailFinal,
        senha: senhaGerada
      },
      usuario: {
        id_usuario: novoUsuario.id_usuario,
        nome: novoUsuario.nome
      }
    });
  } catch (error) {
    console.error('[ACCESS] Erro ao criar acesso:', error);
    return res.status(500).json({ error: 'Erro ao criar acesso de usuário' });
  }
}

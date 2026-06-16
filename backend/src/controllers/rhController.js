/**
 * rhController.js
 * 
 * Gerenciamento de Recursos Humanos (Funcionários).
 * Atende requisitos acadêmicos de matricula auto-gerada e paginação.
 */

import prisma from '../config/prisma.js';
import { validarCPF, validarEmail } from '../utils/validation.js';

/**
 * Lista funcionários com paginação, busca e ordenação
 */
export async function listarFuncionarios(req, res) {
  try {
    const { 
      page = 1, 
      limit = 10, 
      busca = '', 
      status = 'ATIVO', 
      sortBy = 'nome', 
      sortOrder = 'asc',
      cargo = ''
    } = req.query;
    
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const id_cliente = req.user?.id_cliente;

    const where = {
      id_cliente: id_cliente || undefined,
      status: status !== 'TODOS' ? (status || 'ATIVO') : undefined,
      cargo_base: cargo ? { contains: cargo, mode: 'insensitive' } : undefined,
      OR: busca ? [
        { nome:      { contains: busca, mode: 'insensitive' } },
        { email:     { contains: busca, mode: 'insensitive' } },
        { matricula: { contains: busca, mode: 'insensitive' } }
      ] : undefined
    };

    const [funcionarios, total] = await Promise.all([
      prisma.tb_usuario.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id_usuario: true,
          matricula: true,
          nome: true,
          cpf: true,
          email: true,
          cargo_base: true,
          status: true,
          data_admissao: true,
          role: true
        }
      }),
      prisma.tb_usuario.count({ where })
    ]);

    return res.status(200).json({
      data: funcionarios,
      meta: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber)
      }
    });
  } catch (error) {
    console.error('[RH] Erro ao listar:', error);
    return res.status(500).json({ erro: 'Erro ao buscar funcionários' });
  }
}

/**
 * Cria um novo funcionário com matrícula gerada automaticamente e validações
 */
export async function criarFuncionario(req, res) {
  try {
    const { nome, cpf, email, cargo_base, data_admissao, role, status } = req.body;

    // 1. Validações de obrigatoriedade e formato
    if (!nome || nome.trim().length < 3) {
      return res.status(400).json({ erro: 'Nome completo é obrigatório (mín. 3 caracteres)' });
    }
    
    if (!validarCPF(cpf)) {
      return res.status(400).json({ erro: 'CPF inválido. Verifique os dígitos.' });
    }

    if (!validarEmail(email)) {
      return res.status(400).json({ erro: 'E-mail inválido ou campo vazio.' });
    }

    // 2. Lógica de Matrícula: MAT-YYYY-XXX
    const anoAtual = new Date().getFullYear();
    const totalNoAno = await prisma.tb_usuario.count({
      where: {
        matricula: { startsWith: `MAT-${anoAtual}` }
      }
    });
    
    const sequencial = (totalNoAno + 1).toString().padStart(3, '0');
    const matricula = `MAT-${anoAtual}-${sequencial}`;

    const id_cliente = req.user?.id_cliente;

    const novoFuncionario = await prisma.tb_usuario.create({
      data: {
        nome,
        cpf: cpf.replace(/\D/g, ''),
        email: email.toLowerCase(),
        cargo_base: cargo_base || null,
        data_admissao: data_admissao ? new Date(data_admissao) : new Date(),
        matricula,
        role: role || 'TRABALHADOR',
        status: status || 'ATIVO',
        id_cliente: id_cliente || null
      }
    });

    return res.status(201).json(novoFuncionario);
  } catch (error) {
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] || 'campo';
      const mapField = { cpf: 'CPF', email: 'E-mail', matricula: 'Matrícula' };
      return res.status(400).json({ erro: `O ${mapField[field] || field} informado já está cadastrado.` });
    }
    console.error('[RH] Erro ao criar:', error);
    return res.status(500).json({ erro: 'Erro interno ao cadastrar funcionário' });
  }
}

/**
 * Atualiza dados do funcionário com validações
 */
export async function atualizarFuncionario(req, res) {
  try {
    const { id } = req.params;
    const { nome, cpf, email, cargo_base, data_admissao, role, status } = req.body;

    // Validações básicas na atualização se fornecidos
    if (nome && nome.trim().length < 3) {
      return res.status(400).json({ erro: 'Nome inválido' });
    }
    if (cpf && !validarCPF(cpf)) {
      return res.status(400).json({ erro: 'CPF inválido' });
    }
    if (email && !validarEmail(email)) {
      return res.status(400).json({ erro: 'E-mail inválido' });
    }

    const funcionario = await prisma.tb_usuario.update({
      where: { id_usuario: Number(id) },
      data: {
        nome,
        cpf: cpf ? cpf.replace(/\D/g, '') : undefined,
        email: email ? email.toLowerCase() : undefined,
        cargo_base: cargo_base || null,
        data_admissao: data_admissao ? new Date(data_admissao) : undefined,
        role,
        status
      }
    });

    return res.status(200).json(funcionario);
  } catch (error) {
    console.error('[RH] Erro ao atualizar:', error);
    return res.status(500).json({ erro: 'Erro ao atualizar funcionário' });
  }
}

/**
 * Inativa funcionário (Soft Delete)
 */
export async function inativarFuncionario(req, res) {
  try {
    const { id } = req.params;

    // Segurança: Não permite inativar o Proprietário
    const alvo = await prisma.tb_usuario.findUnique({ where: { id_usuario: Number(id) } });
    if (alvo?.role === 'PROPRIETARIO') {
      return res.status(403).json({ erro: 'O Proprietário não pode ser inativado por segurança.' });
    }

    await prisma.tb_usuario.update({
      where: { id_usuario: Number(id) },
      data: { status: 'INATIVO' }
    });
    return res.status(200).json({ mensagem: 'Funcionário inativado com sucesso' });
  } catch (error) {
    console.error('[RH] Erro ao inativar:', error);
    return res.status(500).json({ erro: 'Erro ao inativar funcionário' });
  }
}

/**
 * Adiciona uma nova certificação/NR para um funcionário
 */
export async function adicionarCertificacao(req, res) {
  try {
    const { id } = req.params;
    const { nome, data_emissao, data_validade, arquivo_url } = req.body;

    if (!nome) {
      return res.status(400).json({ erro: 'Nome da certificação é obrigatório' });
    }

    const novaCertificacao = await prisma.tb_certificacao.create({
      data: {
        id_usuario: Number(id),
        nome,
        data_emissao: data_emissao ? new Date(data_emissao) : null,
        data_validade: data_validade ? new Date(data_validade) : null,
        arquivo_url: arquivo_url || null
      }
    });

    return res.status(201).json(novaCertificacao);
  } catch (error) {
    console.error('[RH] Erro ao adicionar certificacao:', error);
    return res.status(500).json({ erro: 'Erro ao adicionar certificação' });
  }
}

/**
 * Lista as certificações/NRs de um funcionário com status calculado
 */
export async function listarCertificacoes(req, res) {
  try {
    const { id } = req.params;

    // Permissão: ADMIN_MASTER, PROPRIETARIO, ver_rh ou o próprio usuário
    if (req.user.role !== 'ADMIN_MASTER' && req.user.id !== Number(id) && req.user.role !== 'PROPRIETARIO') {
      const { hasPermissao } = await import('../config/permissions.js');
      if (!hasPermissao(req.user.role, 'ver_rh')) {
        return res.status(403).json({ erro: 'Acesso negado. Nível de permissão insuficiente.' });
      }
    }

    const certificacoes = await prisma.tb_certificacao.findMany({
      where: { id_usuario: Number(id) },
      orderBy: { data_validade: 'asc' }
    });

    const hoje = new Date();
    const trintaDias = new Date();
    trintaDias.setDate(hoje.getDate() + 30);

    const data = certificacoes.map(cert => {
      let status = 'valido';
      if (cert.data_validade) {
        const val = new Date(cert.data_validade);
        if (val < hoje) {
          status = 'vencido';
        } else if (val <= trintaDias) {
          status = 'vencendo';
        }
      }
      return {
        ...cert,
        status
      };
    });

    return res.status(200).json(data);
  } catch (error) {
    console.error('[RH] Erro ao listar certificacoes:', error);
    return res.status(500).json({ erro: 'Erro ao listar certificações' });
  }
}

/**
 * Atualiza ou renova uma certificação/NR
 */
export async function atualizarCertificacao(req, res) {
  try {
    const { id, idCertificacao } = req.params;
    const { nome, data_emissao, data_validade, arquivo_url } = req.body;

    const dataUpdate = {};
    if (nome) dataUpdate.nome = nome;
    if (data_emissao !== undefined) dataUpdate.data_emissao = data_emissao ? new Date(data_emissao) : null;
    if (data_validade !== undefined) dataUpdate.data_validade = data_validade ? new Date(data_validade) : null;
    if (arquivo_url !== undefined) dataUpdate.arquivo_url = arquivo_url;

    const atualizada = await prisma.tb_certificacao.update({
      where: {
        id_certificacao: Number(idCertificacao),
        id_usuario: Number(id)
      },
      data: dataUpdate
    });

    return res.status(200).json(atualizada);
  } catch (error) {
    console.error('[RH] Erro ao atualizar certificacao:', error);
    return res.status(500).json({ erro: 'Erro ao atualizar certificação' });
  }
}

/**
 * Exclui uma certificação/NR
 */
export async function deletarCertificacao(req, res) {
  try {
    const { id, idCertificacao } = req.params;

    await prisma.tb_certificacao.delete({
      where: {
        id_certificacao: Number(idCertificacao),
        id_usuario: Number(id)
      }
    });

    return res.status(204).send();
  } catch (error) {
    console.error('[RH] Erro ao deletar certificacao:', error);
    return res.status(500).json({ erro: 'Erro ao excluir certificação' });
  }
}

/**
 * Lista alertas de NRs vencidas ou a vencer em 30 dias para a construtora (tenant)
 */
export async function obterAlertasNR(req, res) {
  try {
    const id_cliente = req.user?.id_cliente;

    const hoje = new Date();
    const trintaDias = new Date();
    trintaDias.setDate(hoje.getDate() + 30);

    const where = {
      id_cliente: id_cliente || undefined,
      status: 'ATIVO',
      tb_certificacao: {
        some: {
          data_validade: {
            lte: trintaDias
          }
        }
      }
    };

    const usersWithExpiredCerts = await prisma.tb_usuario.findMany({
      where,
      include: {
        tb_certificacao: {
          where: {
            data_validade: {
              lte: trintaDias
            }
          },
          orderBy: {
            data_validade: 'asc'
          }
        }
      }
    });

    const alertas = [];
    usersWithExpiredCerts.forEach(user => {
      user.tb_certificacao.forEach(cert => {
        let status = 'vencendo';
        if (cert.data_validade && new Date(cert.data_validade) < hoje) {
          status = 'vencido';
        }
        alertas.push({
          id_usuario: user.id_usuario,
          nome_usuario: user.nome,
          matricula: user.matricula,
          id_certificacao: cert.id_certificacao,
          nome_certificacao: cert.nome,
          data_validade: cert.data_validade,
          status
        });
      });
    });

    // Ordenar alertas pelos mais críticos primeiro (validade antiga)
    alertas.sort((a, b) => new Date(a.data_validade) - new Date(b.data_validade));

    return res.status(200).json(alertas);
  } catch (error) {
    console.error('[RH] Erro ao obter alertas de NRs:', error);
    return res.status(500).json({ erro: 'Erro ao buscar alertas de certificações' });
  }
}


/**
 * rhController.js
 * 
 * Gerenciamento de Recursos Humanos (Funcionários).
 * Atende requisitos acadêmicos de matricula auto-gerada e paginação.
 */

import prisma from '../config/prisma.js';
import { validarCPF, validarEmail, validarCNPJ } from '../utils/validation.js';

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
      cargo = '',
      is_terceirizado,
      cnpj_empreiteira
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

    // Isolamento de Empreiteira / Subempreiteira
    if (req.user?.role === 'EMPREITEIRA') {
      where.cnpj_empreiteira = req.user.cnpj || 'NOT_FOUND';
    } else {
      if (is_terceirizado !== undefined) {
        where.is_terceirizado = is_terceirizado === 'true';
      }
      if (cnpj_empreiteira) {
        where.cnpj_empreiteira = cnpj_empreiteira;
      }
    }

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
          cnpj: true,
          email: true,
          cargo_base: true,
          funcao: true,
          status: true,
          data_admissao: true,
          role: true,
          is_terceirizado: true,
          cnpj_empreiteira: true,
          razao_social_empreiteira: true,
          tipo_vinculo: true,
          lgpd_consentimento: true
        }
      }),
      prisma.tb_usuario.count({ where })
    ]);

    // Trilha de Auditoria LGPD
    await prisma.tb_log_auditoria.create({
      data: {
        id_usuario: req.user?.id || null,
        acao: 'LISTAR_RH',
        detalhes: `Listou colaboradores. Filtros: status=${status}, busca=${busca}, role=${req.user?.role}`
      }
    }).catch(err => console.error('[AUDITORIA] Erro ao gravar log:', err));

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
    const { 
      nome, 
      cpf, 
      cnpj,
      email, 
      cargo_base, 
      data_admissao, 
      role, 
      status, 
      is_terceirizado, 
      cnpj_empreiteira, 
      razao_social_empreiteira, 
      tipo_vinculo, 
      lgpd_consentimento 
    } = req.body;

    // 1. Validações de obrigatoriedade e formato
    if (!lgpd_consentimento) {
      return res.status(400).json({ erro: 'A ciência dos termos de tratamento de dados LGPD é obrigatória.' });
    }

    if (!nome || nome.trim().length < 3) {
      return res.status(400).json({ erro: 'Nome completo é obrigatório (mín. 3 caracteres).' });
    }

    if (!cpf && !cnpj) {
      return res.status(400).json({ erro: 'Pelo menos um documento (CPF ou CNPJ) é obrigatório.' });
    }

    if (cpf && !validarCPF(cpf)) {
      return res.status(400).json({ erro: 'CPF inválido. Verifique os dígitos.' });
    }

    if (cnpj && !validarCNPJ(cnpj)) {
      return res.status(400).json({ erro: 'CNPJ inválido. Verifique os dígitos.' });
    }

    if (email && !validarEmail(email)) {
      return res.status(400).json({ erro: 'E-mail inválido.' });
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

    const isEmpreiteira = req.user?.role === 'EMPREITEIRA';
    const resolvedIsTerceirizado = isEmpreiteira ? true : (is_terceirizado === true || is_terceirizado === 'true');
    const resolvedCnpjEmpreiteira = isEmpreiteira ? req.user.cnpj : (cnpj_empreiteira || null);
    const resolvedRazaoSocialEmpreiteira = isEmpreiteira ? req.user.razao_social : (razao_social_empreiteira || null);
    const resolvedRole = isEmpreiteira ? 'TRABALHADOR' : (role || 'TRABALHADOR');

    const cleanCpf = cpf ? cpf.replace(/\D/g, '') : null;
    const cleanCnpj = cnpj ? cnpj.replace(/\D/g, '') : null;
    const cleanCargo = cargo_base || null;

    const novoFuncionario = await prisma.tb_usuario.create({
      data: {
        nome,
        cpf: cleanCpf,
        cnpj: cleanCnpj,
        email: email ? email.toLowerCase() : null,
        cargo_base: cleanCargo,
        funcao: cleanCargo,
        data_admissao: data_admissao ? new Date(data_admissao) : new Date(),
        matricula,
        role: resolvedRole,
        status: status || 'ATIVO',
        id_cliente: id_cliente || null,
        is_terceirizado: resolvedIsTerceirizado,
        cnpj_empreiteira: resolvedCnpjEmpreiteira,
        razao_social_empreiteira: resolvedRazaoSocialEmpreiteira,
        tipo_vinculo: tipo_vinculo || null,
        lgpd_consentimento: true
      }
    });

    // Trilha de Auditoria LGPD
    await prisma.tb_log_auditoria.create({
      data: {
        id_usuario: req.user?.id || null,
        acao: 'CRIAR_RH_COLABORADOR',
        target_id: novoFuncionario.id_usuario,
        detalhes: `Cadastrou o colaborador ${novoFuncionario.nome} (${novoFuncionario.matricula}). Tipo vínculo: ${novoFuncionario.tipo_vinculo}, Terceirizado: ${novoFuncionario.is_terceirizado}`
      }
    }).catch(err => console.error('[AUDITORIA] Erro ao gravar log:', err));

    return res.status(201).json(novoFuncionario);
  } catch (error) {
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] || 'campo';
      const mapField = { cpf: 'CPF', email: 'E-mail', matricula: 'Matrícula', cnpj: 'CNPJ' };
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
    const { 
      nome, 
      cpf, 
      cnpj,
      email, 
      cargo_base, 
      data_admissao, 
      role, 
      status,
      is_terceirizado,
      cnpj_empreiteira,
      razao_social_empreiteira,
      tipo_vinculo
    } = req.body;

    const targetId = Number(id);
    const existing = await prisma.tb_usuario.findUnique({ where: { id_usuario: targetId } });
    if (!existing) {
      return res.status(404).json({ erro: 'Funcionário não encontrado.' });
    }

    // Segurança: se o usuário for EMPREITEIRA, só edita sua própria equipe
    if (req.user?.role === 'EMPREITEIRA') {
      if (existing.cnpj_empreiteira !== req.user.cnpj) {
        return res.status(403).json({ erro: 'Você não tem permissão para editar colaboradores de outra empreiteira.' });
      }
    }

    // Validações básicas na atualização se fornecidos
    if (nome && nome.trim().length < 3) {
      return res.status(400).json({ erro: 'Nome inválido' });
    }

    const finalCpf = cpf !== undefined ? (cpf ? cpf.replace(/\D/g, '') : null) : existing.cpf;
    const finalCnpj = cnpj !== undefined ? (cnpj ? cnpj.replace(/\D/g, '') : null) : existing.cnpj;

    if (!finalCpf && !finalCnpj) {
      return res.status(400).json({ erro: 'Pelo menos um documento (CPF ou CNPJ) é obrigatório.' });
    }

    if (cpf && !validarCPF(cpf)) {
      return res.status(400).json({ erro: 'CPF inválido.' });
    }

    if (cnpj && !validarCNPJ(cnpj)) {
      return res.status(400).json({ erro: 'CNPJ inválido.' });
    }

    if (email && !validarEmail(email)) {
      return res.status(400).json({ erro: 'E-mail inválido.' });
    }

    const dataUpdate = {
      nome,
      cpf: finalCpf,
      cnpj: finalCnpj,
      email: email ? email.toLowerCase() : undefined,
      cargo_base: cargo_base !== undefined ? cargo_base : undefined,
      funcao: cargo_base !== undefined ? cargo_base : undefined,
      data_admissao: data_admissao ? new Date(data_admissao) : undefined,
      role: req.user?.role === 'EMPREITEIRA' ? undefined : role,
      status,
      tipo_vinculo: tipo_vinculo !== undefined ? tipo_vinculo : undefined
    };

    if (req.user?.role !== 'EMPREITEIRA') {
      if (is_terceirizado !== undefined) dataUpdate.is_terceirizado = is_terceirizado === true || is_terceirizado === 'true';
      if (cnpj_empreiteira !== undefined) dataUpdate.cnpj_empreiteira = cnpj_empreiteira;
      if (razao_social_empreiteira !== undefined) dataUpdate.razao_social_empreiteira = razao_social_empreiteira;
    }

    const funcionario = await prisma.tb_usuario.update({
      where: { id_usuario: targetId },
      data: dataUpdate
    });

    // Trilha de Auditoria LGPD
    await prisma.tb_log_auditoria.create({
      data: {
        id_usuario: req.user?.id || null,
        acao: 'ATUALIZAR_RH_COLABORADOR',
        target_id: targetId,
        detalhes: `Atualizou dados do colaborador ${funcionario.nome} (${funcionario.matricula}).`
      }
    }).catch(err => console.error('[AUDITORIA] Erro ao gravar log:', err));

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
    const targetId = Number(id);

    const alvo = await prisma.tb_usuario.findUnique({ where: { id_usuario: targetId } });
    if (!alvo) {
      return res.status(404).json({ erro: 'Funcionário não encontrado.' });
    }

    // Segurança: se o usuário for EMPREITEIRA, só inativa sua própria equipe
    if (req.user?.role === 'EMPREITEIRA') {
      if (alvo.cnpj_empreiteira !== req.user.cnpj) {
        return res.status(403).json({ erro: 'Você não tem permissão para inativar colaboradores de outra empreiteira.' });
      }
    }

    // Segurança: Não permite inativar o Proprietário
    if (alvo.role === 'PROPRIETARIO') {
      return res.status(403).json({ erro: 'O Proprietário não pode ser inativado por segurança.' });
    }

    await prisma.tb_usuario.update({
      where: { id_usuario: targetId },
      data: { status: 'INATIVO' }
    });

    // Trilha de Auditoria LGPD
    await prisma.tb_log_auditoria.create({
      data: {
        id_usuario: req.user?.id || null,
        acao: 'INATIVAR_RH_COLABORADOR',
        target_id: targetId,
        detalhes: `Inativou (soft delete) o colaborador ${alvo.nome} (${alvo.matricula}).`
      }
    }).catch(err => console.error('[AUDITORIA] Erro ao gravar log:', err));
    return res.status(200).json({ mensagem: 'Funcionário inativado com sucesso' });
  } catch (error) {
    console.error('[RH] Erro ao inativar:', error);
    return res.status(500).json({ erro: 'Erro ao inativar funcionário' });
  }
}

export async function adicionarCertificacao(req, res) {
  try {
    const { id } = req.params;
    const { nome, data_emissao, data_validade, arquivo_url } = req.body;

    if (!nome) {
      return res.status(400).json({ erro: 'Nome da certificação é obrigatório' });
    }

    const targetId = Number(id);
    const targetUser = await prisma.tb_usuario.findUnique({ where: { id_usuario: targetId } });
    if (!targetUser) {
      return res.status(404).json({ erro: 'Funcionário não encontrado.' });
    }

    // Segurança: se for EMPREITEIRA, só adiciona NRs para sua própria equipe
    if (req.user?.role === 'EMPREITEIRA') {
      if (targetUser.cnpj_empreiteira !== req.user.cnpj) {
        return res.status(403).json({ erro: 'Acesso negado. Colaborador pertence a outra empreiteira.' });
      }
    }

    const novaCertificacao = await prisma.tb_certificacao.create({
      data: {
        id_usuario: targetId,
        nome,
        data_emissao: data_emissao ? new Date(data_emissao) : null,
        data_validade: data_validade ? new Date(data_validade) : null,
        arquivo_url: arquivo_url || null
      }
    });

    // Trilha de Auditoria LGPD
    await prisma.tb_log_auditoria.create({
      data: {
        id_usuario: req.user?.id || null,
        acao: 'CRIAR_RH_CERTIFICACAO',
        target_id: targetId,
        detalhes: `Adicionou documento/certificação ${nome} ao colaborador ${targetUser.nome}.`
      }
    }).catch(err => console.error('[AUDITORIA] Erro ao gravar log:', err));

    return res.status(201).json(novaCertificacao);
  } catch (error) {
    console.error('[RH] Erro ao adicionar certificacao:', error);
    return res.status(500).json({ erro: 'Erro ao adicionar certificação' });
  }
}

export async function listarCertificacoes(req, res) {
  try {
    const { id } = req.params;
    const targetId = Number(id);

    const targetUser = await prisma.tb_usuario.findUnique({ where: { id_usuario: targetId } });
    if (!targetUser) {
      return res.status(404).json({ erro: 'Funcionário não encontrado.' });
    }

    // Segurança de Escopo Geral
    if (req.user.role !== 'ADMIN_MASTER' && req.user.id !== targetId && req.user.role !== 'PROPRIETARIO') {
      const { hasPermissao } = await import('../config/permissions.js');
      if (!hasPermissao(req.user.role, 'ver_rh')) {
        return res.status(403).json({ erro: 'Acesso negado. Nível de permissão insuficiente.' });
      }
    }

    // Se for EMPREITEIRA, garantir que o trabalhador é de sua equipe
    if (req.user?.role === 'EMPREITEIRA') {
      if (targetUser.cnpj_empreiteira !== req.user.cnpj) {
        return res.status(403).json({ erro: 'Acesso negado. Colaborador pertence a outra empreiteira.' });
      }
    }

    const certificacoes = await prisma.tb_certificacao.findMany({
      where: { id_usuario: targetId },
      orderBy: { data_validade: 'asc' }
    });

    const hoje = new Date();
    const trintaDias = new Date();
    trintaDias.setDate(hoje.getDate() + 30);

    // LGPD: Verificar privilégio para acessar URLs de arquivos de saúde (ASO)
    // Apenas ADMIN_MASTER, PROPRIETARIO, EMPREITEIRA (dono da equipe) ou o próprio colaborador podem ver o arquivo
    const canSeeSensitiveFiles = 
      req.user.role === 'ADMIN_MASTER' || 
      req.user.role === 'PROPRIETARIO' || 
      req.user.id === targetId ||
      (req.user.role === 'EMPREITEIRA' && targetUser.cnpj_empreiteira === req.user.cnpj);

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

      const isAso = cert.nome.toUpperCase().includes('ASO') || cert.nome.toLowerCase().includes('saude') || cert.nome.toLowerCase().includes('saúde') || cert.nome.toLowerCase().includes('atestado');
      let finalFileUrl = cert.arquivo_url;
      if (isAso && !canSeeSensitiveFiles) {
        finalFileUrl = null; // Oculta o arquivo por privacidade LGPD (dado de saúde sensível)
      }

      return {
        ...cert,
        arquivo_url: finalFileUrl,
        status
      };
    });

    // Trilha de Auditoria LGPD
    await prisma.tb_log_auditoria.create({
      data: {
        id_usuario: req.user?.id || null,
        acao: 'LISTAR_RH_CERTIFICACOES',
        target_id: targetId,
        detalhes: `Acessou lista de documentos do colaborador ${targetUser.nome} (ID ${targetId}).`
      }
    }).catch(err => console.error('[AUDITORIA] Erro ao gravar log:', err));

    return res.status(200).json(data);
  } catch (error) {
    console.error('[RH] Erro ao listar certificacoes:', error);
    return res.status(500).json({ erro: 'Erro ao listar certificações' });
  }
}

export async function atualizarCertificacao(req, res) {
  try {
    const { id, idCertificacao } = req.params;
    const { nome, data_emissao, data_validade, arquivo_url } = req.body;

    const targetId = Number(id);
    const targetUser = await prisma.tb_usuario.findUnique({ where: { id_usuario: targetId } });
    if (!targetUser) {
      return res.status(404).json({ erro: 'Funcionário não encontrado.' });
    }

    // Segurança: se for EMPREITEIRA, só edita NRs para sua própria equipe
    if (req.user?.role === 'EMPREITEIRA') {
      if (targetUser.cnpj_empreiteira !== req.user.cnpj) {
        return res.status(403).json({ erro: 'Acesso negado. Colaborador pertence a outra empreiteira.' });
      }
    }

    const dataUpdate = {};
    if (nome) dataUpdate.nome = nome;
    if (data_emissao !== undefined) dataUpdate.data_emissao = data_emissao ? new Date(data_emissao) : null;
    if (data_validade !== undefined) dataUpdate.data_validade = data_validade ? new Date(data_validade) : null;
    if (arquivo_url !== undefined) dataUpdate.arquivo_url = arquivo_url;

    const atualizada = await prisma.tb_certificacao.update({
      where: {
        id_certificacao: Number(idCertificacao),
        id_usuario: targetId
      },
      data: dataUpdate
    });

    // Trilha de Auditoria LGPD
    await prisma.tb_log_auditoria.create({
      data: {
        id_usuario: req.user?.id || null,
        acao: 'ATUALIZAR_RH_CERTIFICACAO',
        target_id: targetId,
        detalhes: `Atualizou documento/certificação ID ${idCertificacao} do colaborador ${targetUser.nome}.`
      }
    }).catch(err => console.error('[AUDITORIA] Erro ao gravar log:', err));

    return res.status(200).json(atualizada);
  } catch (error) {
    console.error('[RH] Erro ao atualizar certificacao:', error);
    return res.status(500).json({ erro: 'Erro ao atualizar certificação' });
  }
}

export async function deletarCertificacao(req, res) {
  try {
    const { id, idCertificacao } = req.params;
    const targetId = Number(id);

    const targetUser = await prisma.tb_usuario.findUnique({ where: { id_usuario: targetId } });
    if (!targetUser) {
      return res.status(404).json({ erro: 'Funcionário não encontrado.' });
    }

    // Segurança: se for EMPREITEIRA, só deleta NRs para sua própria equipe
    if (req.user?.role === 'EMPREITEIRA') {
      if (targetUser.cnpj_empreiteira !== req.user.cnpj) {
        return res.status(403).json({ erro: 'Acesso negado. Colaborador pertence a outra empreiteira.' });
      }
    }

    await prisma.tb_certificacao.delete({
      where: {
        id_certificacao: Number(idCertificacao),
        id_usuario: targetId
      }
    });

    // Trilha de Auditoria LGPD
    await prisma.tb_log_auditoria.create({
      data: {
        id_usuario: req.user?.id || null,
        acao: 'DELETAR_RH_CERTIFICACAO',
        target_id: targetId,
        detalhes: `Deletou documento/certificação ID ${idCertificacao} do colaborador ${targetUser.nome}.`
      }
    }).catch(err => console.error('[AUDITORIA] Erro ao gravar log:', err));

    return res.status(204).send();
  } catch (error) {
    console.error('[RH] Erro ao deletar certificacao:', error);
    return res.status(500).json({ erro: 'Erro ao excluir certificação' });
  }
}

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

    // Filtrar alertas para Empreiteira
    if (req.user?.role === 'EMPREITEIRA') {
      where.cnpj_empreiteira = req.user.cnpj || 'NOT_FOUND';
    }

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

export async function obterDashboardStats(req, res) {
  try {
    const id_cliente = req.user?.id_cliente;
    if (!id_cliente) return res.status(400).json({ erro: 'id_cliente (tenant) não identificado.' });

    const hoje = new Date();
    const trintaDias = new Date();
    trintaDias.setDate(hoje.getDate() + 30);

    // 1. KPIs principais
    const colaboradoresAtivos = await prisma.tb_usuario.count({
      where: { id_cliente, status: 'ATIVO' }
    });

    // "Admissões em andamento" = contratações recentes (últimos 30 dias). Antes contava
    // status_profissional='PENDENTE', que é o default de todos os colaboradores → inflava
    // o número (mostrava praticamente o total de ativos).
    const trintaDiasAtras = new Date(hoje);
    trintaDiasAtras.setDate(hoje.getDate() - 30);
    const admissoesEmAndamento = await prisma.tb_usuario.count({
      where: { id_cliente, status: 'ATIVO', data_admissao: { gte: trintaDiasAtras } }
    });

    const feriasProgramadas = await prisma.tb_usuario.count({
      where: { id_cliente, status: 'FERIAS' }
    });

    const afastamentos = await prisma.tb_usuario.count({
      where: { id_cliente, status: 'AFASTADO' }
    });

    // Custo de Mão de Obra (Suma de salarios)
    const salariosAgg = await prisma.tb_rh_salario.aggregate({
      where: { id_cliente },
      _sum: {
        salario_base: true,
        bonus: true,
        vale_refeicao: true,
        vale_transporte: true
      }
    });

    const folhaMes = Number(salariosAgg._sum.salario_base || 0);
    const encargos = folhaMes * 0.30; // 30% estimado de encargos
    const beneficios = Number(salariosAgg._sum.vale_refeicao || 0) + Number(salariosAgg._sum.vale_transporte || 0);
    const totalCusto = folhaMes + encargos + beneficios;

    // 2. Alertas Críticos (Baseado em certificações vencidas / vencendo)
    const certsVencidas = await prisma.tb_certificacao.count({
      where: { tb_usuario: { id_cliente }, data_validade: { lt: hoje } }
    });

    const certsVencendo = await prisma.tb_certificacao.count({
      where: { tb_usuario: { id_cliente }, data_validade: { gte: hoje, lte: trintaDias } }
    });

    const semObra = await prisma.tb_usuario.count({
      where: { id_cliente, status: 'ATIVO', tb_usuario_obra: { none: {} } }
    });

    const alertas = [];
    let alertaId = 1;
    if (certsVencidas > 0) {
      alertas.push({ id: alertaId++, text: `${certsVencidas} documentos/certificações vencidos`, severity: 'high', link: '/rh' });
    }
    if (certsVencendo > 0) {
      alertas.push({ id: alertaId++, text: `${certsVencendo} certificações vencem em 30 dias`, severity: 'medium', link: '/rh' });
    }
    if (semObra > 0) {
      alertas.push({ id: alertaId++, text: `${semObra} colaboradores ativos sem obra atribuída`, severity: 'medium', link: '/rh' });
    }
    if (alertas.length === 0) {
      alertas.push({ id: alertaId++, text: 'Nenhum documento vencido hoje', severity: 'medium', link: '/rh' });
      alertas.push({ id: alertaId++, text: 'Todos os colaboradores devidamente alocados', severity: 'medium', link: '/rh' });
    }

    // 3. Movimentações Recentes (Últimos 5 usuários cadastrados)
    const ultimosUsuarios = await prisma.tb_usuario.findMany({
      where: { id_cliente },
      orderBy: { id_usuario: 'desc' },
      take: 5,
      select: { nome: true, cargo_base: true, data_admissao: true }
    });

    const movimentacoesRecentes = ultimosUsuarios.map((u, i) => {
      const time = u.criado_em ? new Date(u.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '08:00';
      return {
        time,
        description: `${u.nome} (${u.cargo_base || 'Colaborador'}) foi cadastrado no sistema.`,
        icon: 'UserPlus',
        color: 'text-green-500'
      };
    });
    if (movimentacoesRecentes.length === 0) {
      movimentacoesRecentes.push({ time: '08:00', description: 'Nenhuma movimentação recente registrada.', icon: 'Circle', color: 'text-muted-foreground' });
    }

    // 4. Distribuição da Mão de Obra por Obra
    const usuarioObras = await prisma.tb_usuario_obra.findMany({
      where: { tb_usuario: { id_cliente } },
      include: { tb_obra: true }
    });

    const distribuicaoMap = {};
    usuarioObras.forEach(uo => {
      if (uo.tb_obra) {
        const name = uo.tb_obra.nome;
        distribuicaoMap[name] = (distribuicaoMap[name] || 0) + 1;
      }
    });

    const distribuicaoMaoObra = Object.entries(distribuicaoMap).map(([name, value]) => ({ name, value }));
    if (distribuicaoMaoObra.length === 0) {
      distribuicaoMaoObra.push({ name: 'Sem Obras com Equipe', value: 0 });
    }

    // 5. Controle de Documentação status
    const totalCerts = await prisma.tb_certificacao.count({ where: { tb_usuario: { id_cliente } } });
    const statusDocumentacao = [
      { name: 'Válidos', value: totalCerts - certsVencidas - certsVencendo, color: 'hsl(var(--success))', icon: 'CheckCircle' },
      { name: 'Próximos ao vencimento', value: certsVencendo, color: 'hsl(var(--warning))', icon: 'AlertTriangle' },
      { name: 'Vencidos', value: certsVencidas, color: 'hsl(var(--destructive))', icon: 'XCircle' },
      { name: 'Não enviados', value: 0, color: 'hsl(var(--muted-foreground))', icon: 'Circle' }
    ];

    // 6. Produtividade por Obra / Lista de Obras
    const obrasDoCliente = await prisma.tb_obra.findMany({
      where: { tb_usuario_obra: { some: { tb_usuario: { id_cliente } } } },
      take: 5
    });

    const produtividadeObra = obrasDoCliente.map(o => {
      const funcionariosCount = usuarioObras.filter(uo => uo.id_obra === o.id_obra).length;
      return {
        obra: o.nome,
        funcionarios: funcionariosCount,
        presencaHoje: 90 + Math.floor(Math.random() * 11)
      };
    });
    if (produtividadeObra.length === 0) {
      produtividadeObra.push({ obra: 'Nenhuma obra alocada', funcionarios: 0, presencaHoje: 0 });
    }

    // 7. Histórico Custos Pessoas
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const currentMonthIdx = hoje.getMonth();
    const historico = [];
    for (let i = 5; i >= 0; i--) {
      const idx = (currentMonthIdx - i + 12) % 12;
      const factor = 1 - (i * 0.03) + (Math.random() * 0.02);
      historico.push({
        name: meses[idx],
        total: Math.round(totalCusto * factor)
      });
    }

    return res.status(200).json({
      stats: {
        colaboradoresAtivos,
        admissoesEmAndamento,
        feriasProgramadas,
        afastamentos,
        examesPendentes: certsVencidas + certsVencendo,
        custoMaoObra: totalCusto
      },
      alertas,
      movimentacoesRecentes,
      distribuicaoMaoObra,
      statusDocumentacao,
      custosPessoas: {
        folhaMes,
        encargos,
        beneficios,
        total: totalCusto,
        historico
      },
      produtividadeObra,
      vagasRecrutamento: {
        abertas: 4,
        candidatos: 24,
        entrevistasAgendadas: 5,
        contratacoesPrevistas: 2,
        kanban: [
          { status: 'Triagem', count: 12 },
          { status: 'Entrevista', count: 5 },
          { status: 'Proposta', count: 5 },
          { status: 'Contratados', count: 2 }
        ]
      },
      treinamentosStatus: [
        { treinamento: 'NR10', concluido: 95, pendente: 5 },
        { treinamento: 'NR35', concluido: 88, pendente: 12 },
        { treinamento: 'Integração', concluido: 100, pendente: 0 }
      ],
      feriasAfastamentos: {
        iniciamFerias: feriasProgramadas,
        retornamFerias: Math.floor(feriasProgramadas * 0.5),
        afastamentosEncerram: Math.floor(afastamentos * 0.3),
        novasLicencas: 1
      }
    });
  } catch (error) {
    console.error('[RH DASHBOARD] Erro ao buscar estatísticas do painel:', error);
    return res.status(500).json({ erro: 'Erro interno ao calcular dados do painel de RH.' });
  }
}

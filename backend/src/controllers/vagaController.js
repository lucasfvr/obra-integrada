import prisma from '../config/prisma.js';

/**
 * Lista todas as vagas do cliente logado (multi-tenant)
 */
export async function listarVagas(req, res) {
  try {
    const id_cliente = req.user?.id_cliente;
    if (!id_cliente) {
      return res.status(400).json({ erro: 'id_cliente (tenant) não identificado.' });
    }

    const { 
      page = 1, 
      limit = 10, 
      busca = '', 
      status = 'TODOS',
      tipo_contrato = 'TODOS',
      id_obra = ''
    } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const where = {
      id_cliente,
      status: status !== 'TODOS' ? status : undefined,
      tipo_contrato: tipo_contrato !== 'TODOS' ? tipo_contrato : undefined,
      id_obra: id_obra ? Number(id_obra) : undefined,
      OR: busca ? [
        { titulo: { contains: busca, mode: 'insensitive' } },
        { descricao: { contains: busca, mode: 'insensitive' } }
      ] : undefined
    };

    const [vagas, total] = await Promise.all([
      prisma.tb_vaga.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy: { criado_em: 'desc' },
        include: {
          tb_obra: {
            select: {
              id_obra: true,
              nome: true
            }
          }
        }
      }),
      prisma.tb_vaga.count({ where })
    ]);

    return res.status(200).json({
      data: vagas,
      meta: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber)
      }
    });
  } catch (error) {
    console.error('[RH VAGAS] Erro ao listar vagas:', error);
    return res.status(500).json({ erro: 'Erro ao buscar vagas de emprego' });
  }
}

/**
 * Obtém detalhes de uma vaga específica
 */
export async function obterVaga(req, res) {
  try {
    const id_cliente = req.user?.id_cliente;
    if (!id_cliente) {
      return res.status(400).json({ erro: 'id_cliente (tenant) não identificado.' });
    }

    const id_vaga = Number(req.params.id);
    if (isNaN(id_vaga)) {
      return res.status(400).json({ erro: 'ID de vaga inválido.' });
    }

    const vaga = await prisma.tb_vaga.findFirst({
      where: {
        id_vaga,
        id_cliente
      },
      include: {
        tb_obra: {
          select: {
            id_obra: true,
            nome: true
          }
        }
      }
    });

    if (!vaga) {
      return res.status(404).json({ erro: 'Vaga não encontrada ou não pertence ao seu tenant.' });
    }

    return res.status(200).json(vaga);
  } catch (error) {
    console.error('[RH VAGAS] Erro ao obter vaga:', error);
    return res.status(500).json({ erro: 'Erro ao obter vaga de emprego' });
  }
}

/**
 * Cria uma nova vaga associada ao cliente logado
 */
export async function criarVaga(req, res) {
  try {
    const id_cliente = req.user?.id_cliente;
    if (!id_cliente) {
      return res.status(400).json({ erro: 'id_cliente (tenant) não identificado.' });
    }

    const { 
      titulo, 
      descricao, 
      requisitos, 
      salario, 
      tipo_contrato, 
      status, 
      id_obra 
    } = req.body;

    if (!titulo || titulo.trim().length < 3) {
      return res.status(400).json({ erro: 'Título da vaga é obrigatório (mín. 3 caracteres).' });
    }

    const novaVaga = await prisma.tb_vaga.create({
      data: {
        id_cliente,
        titulo: titulo.trim(),
        descricao: descricao ? descricao.trim() : null,
        requisitos: requisitos ? requisitos.trim() : null,
        salario: salario ? Number(salario) : null,
        tipo_contrato: tipo_contrato || 'CLT',
        status: status || 'ABERTA',
        id_obra: id_obra ? Number(id_obra) : null
      }
    });

    // Auditoria LGPD / Ação
    await prisma.tb_log_auditoria.create({
      data: {
        id_usuario: req.user?.id || null,
        acao: 'CRIAR_VAGA',
        target_id: novaVaga.id_vaga,
        detalhes: `Criou a vaga "${novaVaga.titulo}" vinculada ao id_cliente ${id_cliente}. Obra: ${novaVaga.id_obra || 'Nenhuma'}`
      }
    }).catch(err => console.error('[AUDITORIA] Erro ao gravar log de vaga:', err));

    return res.status(201).json(novaVaga);
  } catch (error) {
    console.error('[RH VAGAS] Erro ao criar vaga:', error);
    return res.status(500).json({ erro: 'Erro interno ao criar vaga de emprego' });
  }
}

/**
 * Atualiza dados de uma vaga do tenant
 */
export async function atualizarVaga(req, res) {
  try {
    const id_cliente = req.user?.id_cliente;
    if (!id_cliente) {
      return res.status(400).json({ erro: 'id_cliente (tenant) não identificado.' });
    }

    const id_vaga = Number(req.params.id);
    if (isNaN(id_vaga)) {
      return res.status(400).json({ erro: 'ID de vaga inválido.' });
    }

    const existing = await prisma.tb_vaga.findFirst({
      where: {
        id_vaga,
        id_cliente
      }
    });

    if (!existing) {
      return res.status(404).json({ erro: 'Vaga não encontrada ou não pertence ao seu tenant.' });
    }

    const { 
      titulo, 
      descricao, 
      requisitos, 
      salario, 
      tipo_contrato, 
      status, 
      id_obra 
    } = req.body;

    if (titulo && titulo.trim().length < 3) {
      return res.status(400).json({ erro: 'Título inválido' });
    }

    const vagaAtualizada = await prisma.tb_vaga.update({
      where: { id_vaga },
      data: {
        titulo: titulo !== undefined ? titulo.trim() : undefined,
        descricao: descricao !== undefined ? (descricao ? descricao.trim() : null) : undefined,
        requisitos: requisitos !== undefined ? (requisitos ? requisitos.trim() : null) : undefined,
        salario: salario !== undefined ? (salario ? Number(salario) : null) : undefined,
        tipo_contrato: tipo_contrato !== undefined ? tipo_contrato : undefined,
        status: status !== undefined ? status : undefined,
        id_obra: id_obra !== undefined ? (id_obra ? Number(id_obra) : null) : undefined
      }
    });

    // Auditoria
    await prisma.tb_log_auditoria.create({
      data: {
        id_usuario: req.user?.id || null,
        acao: 'ATUALIZAR_VAGA',
        target_id: id_vaga,
        detalhes: `Atualizou a vaga "${vagaAtualizada.titulo}". Status: ${vagaAtualizada.status}`
      }
    }).catch(err => console.error('[AUDITORIA] Erro ao gravar log de vaga:', err));

    return res.status(200).json(vagaAtualizada);
  } catch (error) {
    console.error('[RH VAGAS] Erro ao atualizar vaga:', error);
    return res.status(500).json({ erro: 'Erro ao atualizar vaga de emprego' });
  }
}

/**
 * Exclui fisicamente a vaga do tenant
 */
export async function excluirVaga(req, res) {
  try {
    const id_cliente = req.user?.id_cliente;
    if (!id_cliente) {
      return res.status(400).json({ erro: 'id_cliente (tenant) não identificado.' });
    }

    const id_vaga = Number(req.params.id);
    if (isNaN(id_vaga)) {
      return res.status(400).json({ erro: 'ID de vaga inválido.' });
    }

    const existing = await prisma.tb_vaga.findFirst({
      where: {
        id_vaga,
        id_cliente
      }
    });

    if (!existing) {
      return res.status(404).json({ erro: 'Vaga não encontrada ou não pertence ao seu tenant.' });
    }

    await prisma.tb_vaga.delete({
      where: { id_vaga }
    });

    // Auditoria
    await prisma.tb_log_auditoria.create({
      data: {
        id_usuario: req.user?.id || null,
        acao: 'EXCLUIR_VAGA',
        target_id: id_vaga,
        detalhes: `Excluiu permanentemente a vaga "${existing.titulo}"`
      }
    }).catch(err => console.error('[AUDITORIA] Erro ao gravar log de vaga:', err));

    return res.status(200).json({ mensagem: 'Vaga de emprego excluída com sucesso.' });
  } catch (error) {
    console.error('[RH VAGAS] Erro ao excluir vaga:', error);
    return res.status(500).json({ erro: 'Erro ao excluir vaga de emprego' });
  }
}

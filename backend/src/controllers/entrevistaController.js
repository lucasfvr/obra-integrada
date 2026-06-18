import prisma from '../config/prisma.js';

/**
 * Lista todas as entrevistas do cliente logado (multi-tenant)
 */
export async function listarEntrevistas(req, res) {
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
      id_candidato = '',
      id_vaga = '',
      data_inicio = '',
      data_fim = ''
    } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    // Filtros de Data
    let dateFilter = undefined;
    if (data_inicio || data_fim) {
      dateFilter = {};
      if (data_inicio) dateFilter.gte = new Date(data_inicio);
      if (data_fim) dateFilter.lte = new Date(data_fim);
    }

    const where = {
      id_cliente,
      status: status !== 'TODOS' ? status : undefined,
      id_candidato: id_candidato ? Number(id_candidato) : undefined,
      id_vaga: id_vaga ? Number(id_vaga) : undefined,
      data_hora: dateFilter,
      OR: busca ? [
        { entrevistador: { contains: busca, mode: 'insensitive' } },
        { tb_candidato: { nome: { contains: busca, mode: 'insensitive' } } },
        { tb_vaga: { titulo: { contains: busca, mode: 'insensitive' } } }
      ] : undefined
    };

    const [entrevistas, total] = await Promise.all([
      prisma.tb_entrevista.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy: { data_hora: 'desc' },
        include: {
          tb_candidato: {
            select: {
              id_candidato: true,
              nome: true,
              email: true,
              telefone: true
            }
          },
          tb_vaga: {
            select: {
              id_vaga: true,
              titulo: true
            }
          }
        }
      }),
      prisma.tb_entrevista.count({ where })
    ]);

    return res.status(200).json({
      data: entrevistas,
      meta: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber)
      }
    });
  } catch (error) {
    console.error('[RH ENTREVISTAS] Erro ao listar entrevistas:', error);
    return res.status(500).json({ erro: 'Erro ao buscar entrevistas' });
  }
}

/**
 * Obtém detalhes de uma entrevista específica
 */
export async function obterEntrevista(req, res) {
  try {
    const id_cliente = req.user?.id_cliente;
    if (!id_cliente) {
      return res.status(400).json({ erro: 'id_cliente (tenant) não identificado.' });
    }

    const id_entrevista = Number(req.params.id);
    if (isNaN(id_entrevista)) {
      return res.status(400).json({ erro: 'ID de entrevista inválido.' });
    }

    const entrevista = await prisma.tb_entrevista.findFirst({
      where: {
        id_entrevista,
        id_cliente
      },
      include: {
        tb_candidato: {
          select: {
            id_candidato: true,
            nome: true,
            email: true,
            telefone: true
          }
        },
        tb_vaga: {
          select: {
            id_vaga: true,
            titulo: true
          }
        }
      }
    });

    if (!entrevista) {
      return res.status(404).json({ erro: 'Entrevista não encontrada ou não pertence ao seu tenant.' });
    }

    return res.status(200).json(entrevista);
  } catch (error) {
    console.error('[RH ENTREVISTAS] Erro ao obter entrevista:', error);
    return res.status(500).json({ erro: 'Erro ao obter entrevista' });
  }
}

/**
 * Cria uma nova entrevista
 */
export async function criarEntrevista(req, res) {
  try {
    const id_cliente = req.user?.id_cliente;
    if (!id_cliente) {
      return res.status(400).json({ erro: 'id_cliente (tenant) não identificado.' });
    }

    const {
      id_candidato,
      id_vaga,
      entrevistador,
      tipo,
      status,
      data_hora,
      duracao_minutos,
      local_ou_link,
      feedback,
      nota
    } = req.body;

    if (!id_candidato) {
      return res.status(400).json({ erro: 'Candidato associado é obrigatório.' });
    }

    if (!data_hora) {
      return res.status(400).json({ erro: 'Data e hora da entrevista são obrigatórias.' });
    }

    // Valida se o candidato pertence ao tenant
    const cand = await prisma.tb_candidato.findFirst({
      where: { id_candidato: Number(id_candidato), id_cliente }
    });
    if (!cand) {
      return res.status(400).json({ erro: 'Candidato inválido ou não pertence ao seu tenant.' });
    }

    // Valida se a vaga pertence ao tenant
    if (id_vaga) {
      const vg = await prisma.tb_vaga.findFirst({
        where: { id_vaga: Number(id_vaga), id_cliente }
      });
      if (!vg) {
        return res.status(400).json({ erro: 'Vaga inválida ou não pertence ao seu tenant.' });
      }
    }

    const novaEntrevista = await prisma.tb_entrevista.create({
      data: {
        id_cliente,
        id_candidato: Number(id_candidato),
        id_vaga: id_vaga ? Number(id_vaga) : null,
        entrevistador: entrevistador ? entrevistador.trim() : null,
        tipo: tipo || 'ONLINE',
        status: status || 'AGENDADA',
        data_hora: new Date(data_hora),
        duracao_minutos: duracao_minutos ? Number(duracao_minutos) : 60,
        local_ou_link: local_ou_link ? local_ou_link.trim() : null,
        feedback: feedback ? feedback.trim() : null,
        nota: nota !== undefined ? Number(nota) : null
      }
    });

    // Auditoria
    await prisma.tb_log_auditoria.create({
      data: {
        id_usuario: req.user?.id || null,
        acao: 'CRIAR_ENTREVISTA',
        target_id: novaEntrevista.id_entrevista,
        detalhes: `Agendou entrevista para o candidato "${cand.nome}" no dia ${novaEntrevista.data_hora.toLocaleString('pt-BR')}.`
      }
    }).catch(err => console.error('[AUDITORIA] Erro ao gravar log de entrevista:', err));

    return res.status(201).json(novaEntrevista);
  } catch (error) {
    console.error('[RH ENTREVISTAS] Erro ao criar entrevista:', error);
    return res.status(500).json({ erro: 'Erro interno ao criar entrevista' });
  }
}

/**
 * Atualiza dados de uma entrevista do tenant
 */
export async function atualizarEntrevista(req, res) {
  try {
    const id_cliente = req.user?.id_cliente;
    if (!id_cliente) {
      return res.status(400).json({ erro: 'id_cliente (tenant) não identificado.' });
    }

    const id_entrevista = Number(req.params.id);
    if (isNaN(id_entrevista)) {
      return res.status(400).json({ erro: 'ID de entrevista inválido.' });
    }

    const existing = await prisma.tb_entrevista.findFirst({
      where: {
        id_entrevista,
        id_cliente
      }
    });

    if (!existing) {
      return res.status(404).json({ erro: 'Entrevista não encontrada ou não pertence ao seu tenant.' });
    }

    const {
      id_candidato,
      id_vaga,
      entrevistador,
      tipo,
      status,
      data_hora,
      duracao_minutos,
      local_ou_link,
      feedback,
      nota
    } = req.body;

    // Valida se candidato e vaga novos pertencem ao tenant
    if (id_candidato !== undefined) {
      const cand = await prisma.tb_candidato.findFirst({
        where: { id_candidato: Number(id_candidato), id_cliente }
      });
      if (!cand) {
        return res.status(400).json({ erro: 'Candidato inválido ou não pertence ao seu tenant.' });
      }
    }

    if (id_vaga !== undefined && id_vaga !== null) {
      const vg = await prisma.tb_vaga.findFirst({
        where: { id_vaga: Number(id_vaga), id_cliente }
      });
      if (!vg) {
        return res.status(400).json({ erro: 'Vaga inválida ou não pertence ao seu tenant.' });
      }
    }

    const entrevistaAtualizada = await prisma.tb_entrevista.update({
      where: { id_entrevista },
      data: {
        id_candidato: id_candidato !== undefined ? Number(id_candidato) : undefined,
        id_vaga: id_vaga !== undefined ? (id_vaga ? Number(id_vaga) : null) : undefined,
        entrevistador: entrevistador !== undefined ? (entrevistador ? entrevistador.trim() : null) : undefined,
        tipo: tipo !== undefined ? tipo : undefined,
        status: status !== undefined ? status : undefined,
        data_hora: data_hora !== undefined ? new Date(data_hora) : undefined,
        duracao_minutos: duracao_minutos !== undefined ? (duracao_minutos ? Number(duracao_minutos) : null) : undefined,
        local_ou_link: local_ou_link !== undefined ? (local_ou_link ? local_ou_link.trim() : null) : undefined,
        feedback: feedback !== undefined ? (feedback ? feedback.trim() : null) : undefined,
        nota: nota !== undefined ? (nota ? Number(nota) : null) : undefined
      }
    });

    // Auditoria
    await prisma.tb_log_auditoria.create({
      data: {
        id_usuario: req.user?.id || null,
        acao: 'ATUALIZAR_ENTREVISTA',
        target_id: id_entrevista,
        detalhes: `Atualizou dados da entrevista. Novo Status: ${entrevistaAtualizada.status}. Nota: ${entrevistaAtualizada.nota || 'Sem nota'}`
      }
    }).catch(err => console.error('[AUDITORIA] Erro ao gravar log de entrevista:', err));

    return res.status(200).json(entrevistaAtualizada);
  } catch (error) {
    console.error('[RH ENTREVISTAS] Erro ao atualizar entrevista:', error);
    return res.status(500).json({ erro: 'Erro ao atualizar entrevista' });
  }
}

/**
 * Exclui fisicamente a entrevista do tenant
 */
export async function excluirEntrevista(req, res) {
  try {
    const id_cliente = req.user?.id_cliente;
    if (!id_cliente) {
      return res.status(400).json({ erro: 'id_cliente (tenant) não identificado.' });
    }

    const id_entrevista = Number(req.params.id);
    if (isNaN(id_entrevista)) {
      return res.status(400).json({ erro: 'ID de entrevista inválido.' });
    }

    const existing = await prisma.tb_entrevista.findFirst({
      where: {
        id_entrevista,
        id_cliente
      }
    });

    if (!existing) {
      return res.status(404).json({ erro: 'Entrevista não encontrada ou não pertence ao seu tenant.' });
    }

    await prisma.tb_entrevista.delete({
      where: { id_entrevista }
    });

    // Auditoria
    await prisma.tb_log_auditoria.create({
      data: {
        id_usuario: req.user?.id || null,
        acao: 'EXCLUIR_ENTREVISTA',
        target_id: id_entrevista,
        detalhes: `Cancelou/excluiu permanentemente a entrevista agendada para o ID de candidato ${existing.id_candidato}`
      }
    }).catch(err => console.error('[AUDITORIA] Erro ao gravar log de entrevista:', err));

    return res.status(200).json({ mensagem: 'Entrevista excluída com sucesso.' });
  } catch (error) {
    console.error('[RH ENTREVISTAS] Erro ao excluir entrevista:', error);
    return res.status(500).json({ erro: 'Erro ao excluir entrevista' });
  }
}

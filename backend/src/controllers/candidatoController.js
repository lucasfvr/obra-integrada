import prisma from '../config/prisma.js';

/**
 * Lista todos os candidatos do cliente logado (multi-tenant)
 */
export async function listarCandidatos(req, res) {
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
      id_vaga = ''
    } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const where = {
      id_cliente,
      status: status !== 'TODOS' ? status : undefined,
      id_vaga: id_vaga ? Number(id_vaga) : undefined,
      OR: busca ? [
        { nome: { contains: busca, mode: 'insensitive' } },
        { email: { contains: busca, mode: 'insensitive' } },
        { telefone: { contains: busca, mode: 'insensitive' } },
        { cpf: { contains: busca, mode: 'insensitive' } }
      ] : undefined
    };

    const [candidatos, total] = await Promise.all([
      prisma.tb_candidato.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy: { criado_em: 'desc' },
        include: {
          tb_vaga: {
            select: {
              id_vaga: true,
              titulo: true
            }
          }
        }
      }),
      prisma.tb_candidato.count({ where })
    ]);

    return res.status(200).json({
      data: candidatos,
      meta: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber)
      }
    });
  } catch (error) {
    console.error('[RH CANDIDATOS] Erro ao listar candidatos:', error);
    return res.status(500).json({ erro: 'Erro ao buscar candidatos' });
  }
}

/**
 * Obtém detalhes de um candidato específico
 */
export async function obterCandidato(req, res) {
  try {
    const id_cliente = req.user?.id_cliente;
    if (!id_cliente) {
      return res.status(400).json({ erro: 'id_cliente (tenant) não identificado.' });
    }

    const id_candidato = Number(req.params.id);
    if (isNaN(id_candidato)) {
      return res.status(400).json({ erro: 'ID de candidato inválido.' });
    }

    const candidato = await prisma.tb_candidato.findFirst({
      where: {
        id_candidato,
        id_cliente
      },
      include: {
        tb_vaga: {
          select: {
            id_vaga: true,
            titulo: true
          }
        },
        tb_entrevista: {
          orderBy: { data_hora: 'desc' }
        }
      }
    });

    if (!candidato) {
      return res.status(404).json({ erro: 'Candidato não encontrado ou não pertence ao seu tenant.' });
    }

    return res.status(200).json(candidato);
  } catch (error) {
    console.error('[RH CANDIDATOS] Erro ao obter candidato:', error);
    return res.status(500).json({ erro: 'Erro ao obter candidato' });
  }
}

/**
 * Cria um novo candidato associado ao cliente logado
 */
export async function criarCandidato(req, res) {
  try {
    const id_cliente = req.user?.id_cliente;
    if (!id_cliente) {
      return res.status(400).json({ erro: 'id_cliente (tenant) não identificado.' });
    }

    const {
      nome,
      email,
      telefone,
      cpf,
      linkedin_url,
      curriculo_url,
      fonte,
      status,
      observacoes,
      id_vaga
    } = req.body;

    if (!nome || nome.trim().length < 3) {
      return res.status(400).json({ erro: 'Nome do candidato é obrigatório (mín. 3 caracteres).' });
    }

    const novoCandidato = await prisma.tb_candidato.create({
      data: {
        id_cliente,
        nome: nome.trim(),
        email: email ? email.trim() : null,
        telefone: telefone ? telefone.trim() : null,
        cpf: cpf ? cpf.trim() : null,
        linkedin_url: linkedin_url ? linkedin_url.trim() : null,
        curriculo_url: curriculo_url ? curriculo_url.trim() : null,
        fonte: fonte || 'OUTRO',
        status: status || 'NOVO',
        observacoes: observacoes ? observacoes.trim() : null,
        id_vaga: id_vaga ? Number(id_vaga) : null
      }
    });

    // Auditoria
    await prisma.tb_log_auditoria.create({
      data: {
        id_usuario: req.user?.id || null,
        acao: 'CRIAR_CANDIDATO',
        target_id: novoCandidato.id_candidato,
        detalhes: `Cadastrou o candidato "${novoCandidato.nome}" vinculado ao id_cliente ${id_cliente}.`
      }
    }).catch(err => console.error('[AUDITORIA] Erro ao gravar log de candidato:', err));

    return res.status(201).json(novoCandidato);
  } catch (error) {
    console.error('[RH CANDIDATOS] Erro ao criar candidato:', error);
    return res.status(500).json({ erro: 'Erro interno ao criar candidato' });
  }
}

/**
 * Atualiza dados de um candidato do tenant
 */
export async function atualizarCandidato(req, res) {
  try {
    const id_cliente = req.user?.id_cliente;
    if (!id_cliente) {
      return res.status(400).json({ erro: 'id_cliente (tenant) não identificado.' });
    }

    const id_candidato = Number(req.params.id);
    if (isNaN(id_candidato)) {
      return res.status(400).json({ erro: 'ID de candidato inválido.' });
    }

    const existing = await prisma.tb_candidato.findFirst({
      where: {
        id_candidato,
        id_cliente
      }
    });

    if (!existing) {
      return res.status(404).json({ erro: 'Candidato não encontrado ou não pertence ao seu tenant.' });
    }

    const {
      nome,
      email,
      telefone,
      cpf,
      linkedin_url,
      curriculo_url,
      fonte,
      status,
      observacoes,
      id_vaga
    } = req.body;

    if (nome && nome.trim().length < 3) {
      return res.status(400).json({ erro: 'Nome inválido' });
    }

    const candidatoAtualizado = await prisma.tb_candidato.update({
      where: { id_candidato },
      data: {
        nome: nome !== undefined ? nome.trim() : undefined,
        email: email !== undefined ? (email ? email.trim() : null) : undefined,
        telefone: telefone !== undefined ? (telefone ? telefone.trim() : null) : undefined,
        cpf: cpf !== undefined ? (cpf ? cpf.trim() : null) : undefined,
        linkedin_url: linkedin_url !== undefined ? (linkedin_url ? linkedin_url.trim() : null) : undefined,
        curriculo_url: curriculo_url !== undefined ? (curriculo_url ? curriculo_url.trim() : null) : undefined,
        fonte: fonte !== undefined ? fonte : undefined,
        status: status !== undefined ? status : undefined,
        observacoes: observacoes !== undefined ? (observacoes ? observacoes.trim() : null) : undefined,
        id_vaga: id_vaga !== undefined ? (id_vaga ? Number(id_vaga) : null) : undefined
      }
    });

    // Auditoria
    await prisma.tb_log_auditoria.create({
      data: {
        id_usuario: req.user?.id || null,
        acao: 'ATUALIZAR_CANDIDATO',
        target_id: id_candidato,
        detalhes: `Atualizou dados do candidato "${candidatoAtualizado.nome}". Status: ${candidatoAtualizado.status}`
      }
    }).catch(err => console.error('[AUDITORIA] Erro ao gravar log de candidato:', err));

    return res.status(200).json(candidatoAtualizado);
  } catch (error) {
    console.error('[RH CANDIDATOS] Erro ao atualizar candidato:', error);
    return res.status(500).json({ erro: 'Erro ao atualizar candidato' });
  }
}

/**
 * Exclui fisicamente o candidato do tenant
 */
export async function excluirCandidato(req, res) {
  try {
    const id_cliente = req.user?.id_cliente;
    if (!id_cliente) {
      return res.status(400).json({ erro: 'id_cliente (tenant) não identificado.' });
    }

    const id_candidato = Number(req.params.id);
    if (isNaN(id_candidato)) {
      return res.status(400).json({ erro: 'ID de candidato inválido.' });
    }

    const existing = await prisma.tb_candidato.findFirst({
      where: {
        id_candidato,
        id_cliente
      }
    });

    if (!existing) {
      return res.status(404).json({ erro: 'Candidato não encontrado ou não pertence ao seu tenant.' });
    }

    await prisma.tb_candidato.delete({
      where: { id_candidato }
    });

    // Auditoria
    await prisma.tb_log_auditoria.create({
      data: {
        id_usuario: req.user?.id || null,
        acao: 'EXCLUIR_CANDIDATO',
        target_id: id_candidato,
        detalhes: `Excluiu permanentemente o candidato "${existing.nome}"`
      }
    }).catch(err => console.error('[AUDITORIA] Erro ao gravar log de candidato:', err));

    return res.status(200).json({ mensagem: 'Candidato excluído com sucesso.' });
  } catch (error) {
    console.error('[RH CANDIDATOS] Erro ao excluir candidato:', error);
    return res.status(500).json({ erro: 'Erro ao excluir candidato' });
  }
}

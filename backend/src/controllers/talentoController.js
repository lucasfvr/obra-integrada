import prisma from '../config/prisma.js';

/**
 * Lista todos os talentos do cliente logado (multi-tenant)
 */
export async function listarTalentos(req, res) {
  try {
    const id_cliente = req.user?.id_cliente;
    if (!id_cliente) {
      return res.status(400).json({ erro: 'id_cliente (tenant) não identificado.' });
    }

    const {
      page = 1,
      limit = 10,
      busca = '',
      ativo = 'TODOS', // 'TODOS', 'ATIVOS', 'INATIVOS'
      tipo_contrato = 'TODOS',
      disponibilidade = 'TODOS',
      cargo_desejado = ''
    } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    // Converte status de atividade
    let activeFilter = undefined;
    if (ativo === 'ATIVOS') activeFilter = true;
    if (ativo === 'INATIVOS') activeFilter = false;

    const where = {
      id_cliente,
      ativo: activeFilter,
      tipo_contrato: tipo_contrato !== 'TODOS' ? tipo_contrato : undefined,
      disponibilidade: disponibilidade !== 'TODOS' ? disponibilidade : undefined,
      cargo_desejado: cargo_desejado ? { contains: cargo_desejado, mode: 'insensitive' } : undefined,
      OR: busca ? [
        { nome: { contains: busca, mode: 'insensitive' } },
        { email: { contains: busca, mode: 'insensitive' } },
        { telefone: { contains: busca, mode: 'insensitive' } },
        { habilidades: { contains: busca, mode: 'insensitive' } }
      ] : undefined
    };

    const [talentos, total] = await Promise.all([
      prisma.tb_talento.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy: { criado_em: 'desc' }
      }),
      prisma.tb_talento.count({ where })
    ]);

    return res.status(200).json({
      data: talentos,
      meta: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber)
      }
    });
  } catch (error) {
    console.error('[RH TALENTOS] Erro ao listar talentos:', error);
    return res.status(500).json({ erro: 'Erro ao buscar banco de talentos' });
  }
}

/**
 * Obtém detalhes de um talento específico
 */
export async function obterTalento(req, res) {
  try {
    const id_cliente = req.user?.id_cliente;
    if (!id_cliente) {
      return res.status(400).json({ erro: 'id_cliente (tenant) não identificado.' });
    }

    const id_talento = Number(req.params.id);
    if (isNaN(id_talento)) {
      return res.status(400).json({ erro: 'ID de talento inválido.' });
    }

    const talento = await prisma.tb_talento.findFirst({
      where: {
        id_talento,
        id_cliente
      }
    });

    if (!talento) {
      return res.status(404).json({ erro: 'Talento não encontrado ou não pertence ao seu tenant.' });
    }

    return res.status(200).json(talento);
  } catch (error) {
    console.error('[RH TALENTOS] Erro ao obter talento:', error);
    return res.status(500).json({ erro: 'Erro ao obter talento' });
  }
}

/**
 * Cria um novo talento associado ao cliente logado
 */
export async function criarTalento(req, res) {
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
      cargo_desejado,
      tipo_contrato,
      pretensao_salarial,
      disponibilidade,
      habilidades,
      observacoes,
      ativo
    } = req.body;

    if (!nome || nome.trim().length < 3) {
      return res.status(400).json({ erro: 'Nome do talento é obrigatório (mín. 3 caracteres).' });
    }

    const novoTalento = await prisma.tb_talento.create({
      data: {
        id_cliente,
        nome: nome.trim(),
        email: email ? email.trim() : null,
        telefone: telefone ? telefone.trim() : null,
        cpf: cpf ? cpf.trim() : null,
        linkedin_url: linkedin_url ? linkedin_url.trim() : null,
        curriculo_url: curriculo_url ? curriculo_url.trim() : null,
        cargo_desejado: cargo_desejado ? cargo_desejado.trim() : null,
        tipo_contrato: tipo_contrato || 'CLT',
        pretensao_salarial: pretensao_salarial ? Number(pretensao_salarial) : null,
        disponibilidade: disponibilidade || 'IMEDIATA',
        habilidades: habilidades ? habilidades.trim() : null,
        observacoes: observacoes ? observacoes.trim() : null,
        ativo: ativo !== undefined ? Boolean(ativo) : true
      }
    });

    // Auditoria
    await prisma.tb_log_auditoria.create({
      data: {
        id_usuario: req.user?.id || null,
        acao: 'CRIAR_TALENTO',
        target_id: novoTalento.id_talento,
        detalhes: `Cadastrou o talento "${novoTalento.nome}" no Banco de Talentos do id_cliente ${id_cliente}.`
      }
    }).catch(err => console.error('[AUDITORIA] Erro ao gravar log de talento:', err));

    return res.status(201).json(novoTalento);
  } catch (error) {
    console.error('[RH TALENTOS] Erro ao criar talento:', error);
    return res.status(500).json({ erro: 'Erro interno ao cadastrar talento' });
  }
}

/**
 * Atualiza dados de um talento do tenant
 */
export async function atualizarTalento(req, res) {
  try {
    const id_cliente = req.user?.id_cliente;
    if (!id_cliente) {
      return res.status(400).json({ erro: 'id_cliente (tenant) não identificado.' });
    }

    const id_talento = Number(req.params.id);
    if (isNaN(id_talento)) {
      return res.status(400).json({ erro: 'ID de talento inválido.' });
    }

    const existing = await prisma.tb_talento.findFirst({
      where: {
        id_talento,
        id_cliente
      }
    });

    if (!existing) {
      return res.status(404).json({ erro: 'Talento não encontrado ou não pertence ao seu tenant.' });
    }

    const {
      nome,
      email,
      telefone,
      cpf,
      linkedin_url,
      curriculo_url,
      cargo_desejado,
      tipo_contrato,
      pretensao_salarial,
      disponibilidade,
      habilidades,
      observacoes,
      ativo
    } = req.body;

    if (nome && nome.trim().length < 3) {
      return res.status(400).json({ erro: 'Nome inválido' });
    }

    const talentoAtualizado = await prisma.tb_talento.update({
      where: { id_talento },
      data: {
        nome: nome !== undefined ? nome.trim() : undefined,
        email: email !== undefined ? (email ? email.trim() : null) : undefined,
        telefone: telefone !== undefined ? (telefone ? telefone.trim() : null) : undefined,
        cpf: cpf !== undefined ? (cpf ? cpf.trim() : null) : undefined,
        linkedin_url: linkedin_url !== undefined ? (linkedin_url ? linkedin_url.trim() : null) : undefined,
        curriculo_url: curriculo_url !== undefined ? (curriculo_url ? curriculo_url.trim() : null) : undefined,
        cargo_desejado: cargo_desejado !== undefined ? (cargo_desejado ? cargo_desejado.trim() : null) : undefined,
        tipo_contrato: tipo_contrato !== undefined ? tipo_contrato : undefined,
        pretensao_salarial: pretensao_salarial !== undefined ? (pretensao_salarial ? Number(pretensao_salarial) : null) : undefined,
        disponibilidade: disponibilidade !== undefined ? disponibilidade : undefined,
        habilidades: habilidades !== undefined ? (habilidades ? habilidades.trim() : null) : undefined,
        observacoes: observacoes !== undefined ? (observacoes ? observacoes.trim() : null) : undefined,
        ativo: ativo !== undefined ? Boolean(ativo) : undefined
      }
    });

    // Auditoria
    await prisma.tb_log_auditoria.create({
      data: {
        id_usuario: req.user?.id || null,
        acao: 'ATUALIZAR_TALENTO',
        target_id: id_talento,
        detalhes: `Atualizou os dados do talento "${talentoAtualizado.nome}". Ativo: ${talentoAtualizado.ativo}`
      }
    }).catch(err => console.error('[AUDITORIA] Erro ao gravar log de talento:', err));

    return res.status(200).json(talentoAtualizado);
  } catch (error) {
    console.error('[RH TALENTOS] Erro ao atualizar talento:', error);
    return res.status(500).json({ erro: 'Erro ao atualizar talento' });
  }
}

/**
 * Exclui fisicamente o talento do tenant
 */
export async function excluirTalento(req, res) {
  try {
    const id_cliente = req.user?.id_cliente;
    if (!id_cliente) {
      return res.status(400).json({ erro: 'id_cliente (tenant) não identificado.' });
    }

    const id_talento = Number(req.params.id);
    if (isNaN(id_talento)) {
      return res.status(400).json({ erro: 'ID de talento inválido.' });
    }

    const existing = await prisma.tb_talento.findFirst({
      where: {
        id_talento,
        id_cliente
      }
    });

    if (!existing) {
      return res.status(404).json({ erro: 'Talento não encontrado ou não pertence ao seu tenant.' });
    }

    await prisma.tb_talento.delete({
      where: { id_talento }
    });

    // Auditoria
    await prisma.tb_log_auditoria.create({
      data: {
        id_usuario: req.user?.id || null,
        acao: 'EXCLUIR_TALENTO',
        target_id: id_talento,
        detalhes: `Excluiu permanentemente o talento "${existing.nome}" do banco de talentos`
      }
    }).catch(err => console.error('[AUDITORIA] Erro ao gravar log de talento:', err));

    return res.status(200).json({ mensagem: 'Talento excluído com sucesso.' });
  } catch (error) {
    console.error('[RH TALENTOS] Erro ao excluir talento:', error);
    return res.status(500).json({ erro: 'Erro ao excluir talento' });
  }
}

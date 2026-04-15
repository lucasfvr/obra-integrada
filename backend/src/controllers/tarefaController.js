/**
 * tarefaController.js
 *
 * Gerenciamento de tarefas da obra com RBAC.
 */

import prisma from '../config/prisma.js';

/**
 * Cria uma nova tarefa vinculada a obra
 */
export async function criarTarefa(req, res) {
  try {
    const idObra = req.obraAccess?.idObra || Number(req.params.id);
    const { titulo, descricao, id_usuarios, prioridade, prazo } = req.body;

    if (!titulo) {
      return res.status(400).json({ erro: 'O titulo e obrigatorio' });
    }

    const novaTarefa = await prisma.tb_tarefa.create({
      data: {
        id_obra: idObra,
        titulo,
        descricao,
        prioridade: prioridade || 'NORMAL',
        prazo: prazo ? new Date(prazo) : null,
        status: 'PENDENTE',
        tb_tarefa_usuario: {
          create: Array.isArray(id_usuarios) 
            ? id_usuarios.map(id => ({ id_usuario: Number(id) }))
            : []
        }
      },
      include: {
        tb_tarefa_usuario: {
          include: {
            tb_usuario: { select: { id_usuario: true, nome: true } }
          }
        }
      }
    });

    return res.status(201).json(novaTarefa);
  } catch (error) {
    console.error('[TAREFA] Erro ao criar:', error);
    return res.status(500).json({ erro: 'Erro ao criar tarefa' });
  }
}

/**
 * Atualiza status da tarefa e percentual (Liberado para Trabalhadores e Responsaveis)
 */
export async function atualizarStatusTarefa(req, res) {
  try {
    const { tarefaId } = req.params;
    const { status, percentual_concluido } = req.body;

    const data = {};
    if (status) {
      const statusesValidos = ['PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA'];
      if (!statusesValidos.includes(status)) {
        return res.status(400).json({ erro: 'Status invalido' });
      }
      data.status = status;
    }

    if (percentual_concluido !== undefined) {
      data.percentual_concluido = Number(percentual_concluido);
    }

    const tarefa = await prisma.tb_tarefa.update({
      where: { id_tarefa: Number(tarefaId) },
      data
    });

    return res.status(200).json(tarefa);
  } catch (error) {
    console.error('[TAREFA] Erro ao atualizar status:', error);
    return res.status(500).json({ erro: 'Erro ao atualizar status da tarefa' });
  }
}

/**
 * Atualiza dados da tarefa (Apenas Responsaveis e Admins)
 */
export async function atualizarTarefa(req, res) {
  try {
    const { tarefaId } = req.params;
    const { titulo, descricao, id_usuarios, prioridade, prazo, percentual_concluido } = req.body;

    const updateData = {
      titulo,
      descricao,
      prioridade,
      prazo: prazo ? new Date(prazo) : undefined,
      percentual_concluido: percentual_concluido !== undefined ? Number(percentual_concluido) : undefined
    };

    // Se id_usuarios for enviado, sincronizamos a tabela pivot
    if (id_usuarios !== undefined) {
      updateData.tb_tarefa_usuario = {
        deleteMany: {},
        create: Array.isArray(id_usuarios) 
          ? id_usuarios.map(id => ({ id_usuario: Number(id) }))
          : []
      };
    }

    const tarefa = await prisma.tb_tarefa.update({
      where: { id_tarefa: Number(tarefaId) },
      data: updateData,
      include: {
        tb_tarefa_usuario: {
          include: {
            tb_usuario: { select: { id_usuario: true, nome: true } }
          }
        }
      }
    });

    return res.status(200).json(tarefa);
  } catch (error) {
    console.error('[TAREFA] Erro ao atualizar:', error);
    return res.status(500).json({ erro: 'Erro ao atualizar tarefa' });
  }
}

/**
 * Deleta uma tarefa
 */
export async function deletarTarefa(req, res) {
  try {
    const { tarefaId } = req.params;
    await prisma.tb_tarefa.delete({
      where: { id_tarefa: Number(tarefaId) }
    });
    return res.status(200).json({ mensagem: 'Tarefa removida com sucesso' });
  } catch (error) {
    console.error('[TAREFA] Erro ao deletar:', error);
    return res.status(500).json({ erro: 'Erro ao deletar tarefa' });
  }
}

/**
 * Lista tarefas (Suporta filtro por obra ou por usuario)
 */
export async function listarTarefas(req, res) {
  try {
    const { id } = req.params; // id da obra
    const { userId } = req.query; // id do usuario (opcional)

    const where = {};
    if (id) where.id_obra = Number(id);
    
    // Se userId for fornecido, filtramos tarefas que tenham esse usuario vinculado
    if (userId) {
      where.tb_tarefa_usuario = {
        some: { id_usuario: Number(userId) }
      };
    }

    const tarefas = await prisma.tb_tarefa.findMany({
      where,
      orderBy: { criado_em: 'desc' },
      include: {
        tb_tarefa_usuario: {
          include: {
            tb_usuario: { select: { id_usuario: true, nome: true } }
          }
        },
        tb_obra: { select: { nome: true } }
      }
    });

    return res.status(200).json(tarefas);
  } catch (error) {
    console.error('[TAREFA] Erro ao listar:', error);
    return res.status(500).json({ erro: 'Erro ao buscar tarefas' });
  }
}

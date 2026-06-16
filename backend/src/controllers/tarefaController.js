/**
 * tarefaController.js
 *
 * Gerenciamento de tarefas da obra com RBAC.
 */

import prisma from '../config/prisma.js';
import { getPublicUrl } from '../config/storageService.js';

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

    // Validar se os usuários pertencem à equipe da obra
    if (id_usuarios && Array.isArray(id_usuarios) && id_usuarios.length > 0) {
      const membrosEquipe = await prisma.tb_usuario_obra.findMany({
        where: { id_obra: idObra },
        select: { id_usuario: true }
      });
      const idsEquipe = membrosEquipe.map(m => m.id_usuario);
      const invalidos = id_usuarios.filter(id => !idsEquipe.includes(Number(id)));

      if (invalidos.length > 0) {
        return res.status(400).json({ erro: 'Um ou mais usuários selecionados não pertencem à equipe desta obra.' });
      }
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
    const { status, percentual_concluido, motivo_pausa, foto_comprovante } = req.body;

    const data = {};
    if (status) {
      const statusesValidos = ['PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA'];
      if (!statusesValidos.includes(status)) {
        return res.status(400).json({ erro: 'Status invalido' });
      }
      data.status = status;

      // Se iniciar, limpa motivo_pausa
      if (status === 'EM_ANDAMENTO') {
        data.motivo_pausa = null;
      }
      // Se concluir, força o progresso em 100%
      if (status === 'CONCLUIDA') {
        data.percentual_concluido = 100;
      }
    }

    if (percentual_concluido !== undefined) {
      data.percentual_concluido = Number(percentual_concluido);
    }

    if (motivo_pausa !== undefined) {
      data.motivo_pausa = motivo_pausa;
    }

    if (foto_comprovante !== undefined) {
      data.foto_comprovante = foto_comprovante;
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

    // Se for atualizar usuários, validar se pertencem à equipe da obra
    if (id_usuarios && Array.isArray(id_usuarios)) {
      const tarefaAtual = await prisma.tb_tarefa.findUnique({
        where: { id_tarefa: Number(tarefaId) },
        select: { id_obra: true }
      });

      if (tarefaAtual) {
        const membrosEquipe = await prisma.tb_usuario_obra.findMany({
          where: { id_obra: tarefaAtual.id_obra },
          select: { id_usuario: true }
        });
        const idsEquipe = membrosEquipe.map(m => m.id_usuario);
        const invalidos = id_usuarios.filter(id => !idsEquipe.includes(Number(id)));

        if (invalidos.length > 0) {
          return res.status(400).json({ erro: 'Um ou mais usuários selecionados não pertencem à equipe desta obra.' });
        }
      }
    }

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
    const { userId, page = 1, limit = 10 } = req.query; // id do usuario ou paginacao

    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const where = {
      tb_obra: {
        id_cliente: req.user?.id_cliente || undefined
      }
    };
    if (id) where.id_obra = Number(id);
    
    // Isolamento de Empreiteira / Subempreiteira
    if (req.user?.role === 'EMPREITEIRA') {
      where.tb_tarefa_usuario = {
        some: {
          tb_usuario: {
            cnpj_empreiteira: req.user.cnpj || 'NOT_FOUND'
          }
        }
      };
    } else if (userId) {
      // Se userId for fornecido, filtramos tarefas que tenham esse usuario vinculado
      where.tb_tarefa_usuario = {
        some: { id_usuario: Number(userId) }
      };
    }

    const [tarefas, total] = await Promise.all([
      prisma.tb_tarefa.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy: { criado_em: 'desc' },
        include: {
          tb_tarefa_usuario: {
            include: {
              tb_usuario: { select: { id_usuario: true, nome: true } }
            }
          },
          tb_obra: { select: { nome: true } }
        }
      }),
      prisma.tb_tarefa.count({ where })
    ]);

    return res.status(200).json({
      data: tarefas,
      meta: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber)
      }
    });
  } catch (error) {
    console.error('[TAREFA] Erro ao listar:', error);
    return res.status(500).json({ erro: 'Erro ao buscar tarefas' });
  }
}

/**
 * Anexa foto de comprovante de conclusão à tarefa
 */
export async function adicionarComprovanteTarefa(req, res) {
  try {
    const { tarefaId } = req.params;

    if (!req.file) {
      return res.status(400).json({ erro: 'Nenhuma foto enviada' });
    }

    const fotoUrl = getPublicUrl(`tarefa/${req.file.filename}`);

    const tarefa = await prisma.tb_tarefa.update({
      where: { id_tarefa: Number(tarefaId) },
      data: {
        foto_comprovante: fotoUrl,
        status: 'CONCLUIDA',
        percentual_concluido: 100
      }
    });

    return res.status(200).json({
      mensagem: 'Comprovante técnico anexado com sucesso!',
      tarefa
    });
  } catch (error) {
    console.error('[TAREFA] Erro ao anexar comprovante:', error);
    return res.status(500).json({ erro: 'Erro ao anexar comprovante técnico' });
  }
}

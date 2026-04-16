/**
 * diarioController.js
 *
 * CRUD do Diario da Obra com:
 *   - Verificacao de vinculo (via requireObraAccess no router)
 *   - Permissoes por role (RBAC)
 *   - Log de auditoria em todas as acoes sensiveis
 *
 * Permissoes:
 *   GET    -> Todos os membros vinculados a obra
 *   POST   -> Apenas RESPONSAVEL (ou ADMIN/MASTER)
 *   DELETE -> Criador da entrada OU ADMIN/MASTER/DEV
 */

import prisma from '../config/prisma.js';
import { getPublicUrl, deleteFile } from '../config/storageService.js';

// ─── Helper: registra auditoria ───────────────────────────────────────────────
async function registrarLog({ idUsuario, acao, targetId = null, detalhes = null, ip = null }) {
  try {
    // Tenta salvar no banco. Se a tabela nao existir ainda, apenas loga no console.
    await prisma.tb_log_auditoria.create({
      data: {
        id_usuario: idUsuario,
        acao,
        target_id: targetId,
        detalhes: detalhes ? JSON.stringify(detalhes) : null,
        ip_address: ip,
      },
    }).catch(() => {
      // Tabela ainda nao criada — apenas loga no console sem quebrar
      console.info(`[AUDIT] ${acao} | usuario=${idUsuario} target=${targetId} | ${JSON.stringify(detalhes)}`);
    });
  } catch {
    console.info(`[AUDIT] ${acao} | usuario=${idUsuario}`);
  }
}

function getIp(req) {
  return req.headers['x-forwarded-for'] || req.socket?.remoteAddress || null;
}

// ─── GET /api/obras/:id/diario ────────────────────────────────────────────────
export async function listarDiario(req, res) {
  try {
    const idObra = req.obraAccess?.idObra || Number(req.params.id);

    // REQUISITO B: Paginação
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip  = (page - 1) * limit;

    const [entradas, total] = await Promise.all([
      prisma.tb_diario_obra.findMany({
        where: { id_obra: idObra },
        orderBy: { data_registro: 'desc' },
        skip,
        take: limit,
        include: {
          tb_usuario: {
            select: { id_usuario: true, nome: true, funcao: true },
          },
        },
      }),
      prisma.tb_diario_obra.count({ where: { id_obra: idObra } })
    ]);

    const data = entradas.map((e) => ({
      id_diario:        e.id_diario,
      descricao:        e.descricao,
      data_registro:    e.data_registro,
      foto_url:         e.foto_url,
      latitude:         e.latitude ? Number(e.latitude) : null,
      longitude:        e.longitude ? Number(e.longitude) : null,
      status_auditoria: e.status_auditoria,
      justificativa_gps: e.justificativa_gps,
      autor: {
        id:     e.tb_usuario.id_usuario,
        nome:   e.tb_usuario.nome,
        funcao: e.tb_usuario.funcao,
      },
    }));

    return res.status(200).json({
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('[DIARIO] Erro ao listar:', error);
    return res.status(500).json({ erro: 'Erro ao buscar diario da obra' });
  }
}

// ─── POST /api/obras/:id/diario ───────────────────────────────────────────────
export async function criarEntradaDiario(req, res) {
  try {
    const idObra    = req.obraAccess?.idObra || Number(req.params.id);
    const { descricao, latitude, longitude, status_auditoria, justificativa_gps } = req.body;

    if (!descricao || descricao.trim().length < 3) {
      return res.status(400).json({ erro: 'Descricao e obrigatoria (minimo 3 caracteres)' });
    }

    let fotoUrl = null;
    if (req.file) {
      fotoUrl = getPublicUrl(`diario/${req.file.filename}`);
    }

    const idUsuario = req.user?.id;

    const novaEntrada = await prisma.tb_diario_obra.create({
      data: {
        id_obra:           idObra,
        id_usuario:        idUsuario,
        descricao:         descricao.trim(),
        foto_url:          fotoUrl,
        latitude:          latitude ? Number(latitude) : null,
        longitude:         longitude ? Number(longitude) : null,
        status_auditoria:  status_auditoria || 'PENDENTE',
        justificativa_gps: justificativa_gps || null,
      },
      include: {
        tb_usuario: { select: { nome: true, funcao: true } },
      },
    });

    // Auditoria
    await registrarLog({
      idUsuario,
      acao: 'DIARIO_CRIAR_ENTRADA',
      targetId: novaEntrada.id_diario,
      detalhes: { id_obra: idObra, tem_foto: !!fotoUrl },
      ip: getIp(req),
    });

    return res.status(201).json({
      mensagem: 'Entrada adicionada ao diario com sucesso!',
      entrada: {
        id_diario:     novaEntrada.id_diario,
        descricao:     novaEntrada.descricao,
        foto_url:      novaEntrada.foto_url,
        data_registro: novaEntrada.data_registro,
        autor:         novaEntrada.tb_usuario.nome,
      },
    });
  } catch (error) {
    console.error('[DIARIO] Erro ao criar entrada:', error);
    return res.status(500).json({ erro: 'Erro ao adicionar entrada no diario' });
  }
}

// ─── DELETE /api/obras/:id/diario/:entradaId ──────────────────────────────────
export async function deletarEntradaDiario(req, res) {
  try {
    const idObra      = req.obraAccess?.idObra || Number(req.params.id);
    const idEntrada   = Number(req.params.entradaId);
    const idUsuario   = req.user?.id;
    const roleUsuario = req.user?.role;

    if (!idEntrada || isNaN(idEntrada)) {
      return res.status(400).json({ erro: 'ID da entrada invalido' });
    }

    const entrada = await prisma.tb_diario_obra.findUnique({
      where: { id_diario: idEntrada },
    });

    if (!entrada) {
      return res.status(404).json({ erro: 'Entrada nao encontrada' });
    }

    if (entrada.id_obra !== idObra) {
      return res.status(400).json({ erro: 'Entrada nao pertence a esta obra' });
    }

    // Regra de exclusao: apenas criador OU admin/master/dev
    const isAdminGlobal = ['ADMIN', 'MASTER', 'DEV'].includes(roleUsuario);
    const isCriador     = entrada.id_usuario === idUsuario;

    if (!isCriador && !isAdminGlobal) {
      await registrarLog({
        idUsuario,
        acao: 'DIARIO_DELECAO_NEGADA',
        targetId: idEntrada,
        detalhes: { motivo: 'Nao e criador nem admin', role: roleUsuario },
        ip: getIp(req),
      });
      return res.status(403).json({ erro: 'Sem permissao para deletar esta entrada' });
    }

    // Remove arquivo do disco
    if (entrada.foto_url) {
      try {
        const relativePath = entrada.foto_url.replace('/uploads/', '');
        await deleteFile(relativePath);
      } catch (fileError) {
        console.warn('[DIARIO] Aviso: nao foi possivel deletar o arquivo:', fileError.message);
      }
    }

    await prisma.tb_diario_obra.delete({ where: { id_diario: idEntrada } });

    // Auditoria
    await registrarLog({
      idUsuario,
      acao: 'DIARIO_DELETAR_ENTRADA',
      targetId: idEntrada,
      detalhes: { id_obra: idObra, deletado_por_admin: isAdminGlobal, era_criador: isCriador },
      ip: getIp(req),
    });
    res.status(204).send();
  } catch (error) {
    console.error('[DIARIO] Erro ao deletar entrada:', error);
    res.status(500).json({ erro: 'Erro ao deletar entrada do diario' });
  }
}

// ─── PATCH /api/obras/:id/diario/:entradaId/auditar ───────────────────────
export async function atualizarStatusAuditoria(req, res) {
  try {
    const idObra    = req.obraAccess?.idObra || Number(req.params.id);
    const idEntrada   = Number(req.params.entradaId);
    const { status }  = req.body;

    if (!['AUTORIZADO', 'REPROVADO'].includes(status)) {
      return res.status(400).json({ erro: 'Status de auditoria invalido' });
    }

    const entrada = await prisma.tb_diario_obra.findUnique({
      where: { id_diario: idEntrada },
    });

    if (!entrada || entrada.id_obra !== idObra) {
      return res.status(404).json({ erro: 'Entrada nao encontrada nesta obra' });
    }

    const entradaAtualizada = await prisma.tb_diario_obra.update({
      where: { id_diario: idEntrada },
      data: { status_auditoria: status },
    });

    // Auditoria
    await registrarLog({
      idUsuario: req.user?.id,
      acao: 'DIARIO_AUDITAR_ENTRADA',
      targetId: idEntrada,
      detalhes: { status, id_obra: idObra },
      ip: getIp(req),
    });

    return res.status(200).json({
      mensagem: `Entrada ${status.toLowerCase()} com sucesso!`,
      entrada: entradaAtualizada,
    });
  } catch (error) {
    console.error('[DIARIO] Erro ao auditar entrada:', error);
    return res.status(500).json({ erro: 'Erro ao atualizar status de auditoria' });
  }
}

export async function atualizarEntradaDiario(req, res) {
  try {
    const idObra    = req.obraAccess?.idObra || Number(req.params.id);
    const idEntrada   = Number(req.params.entradaId);
    const { descricao } = req.body;

    const entrada = await prisma.tb_diario_obra.findUnique({
      where: { id_diario: idEntrada },
    });

    if (!entrada || entrada.id_obra !== idObra) {
      return res.status(404).json({ erro: 'Entrada não encontrada nesta obra' });
    }

    const entradaAtualizada = await prisma.tb_diario_obra.update({
      where: { id_diario: idEntrada },
      data: { descricao },
    });

    return res.status(200).json(entradaAtualizada);
  } catch (error) {
    console.error('[DIARIO] Erro ao atualizar entrada:', error);
    return res.status(500).json({ erro: 'Erro ao atualizar entrada do diario' });
  }
}

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
      clima:            e.clima,
      efetivo:          e.efetivo,
      ocorrencias:      e.ocorrencias,
      data_registro:    e.data_registro,
      foto_url:         e.foto_url,
      latitude:         e.latitude ? Number(e.latitude) : null,
      longitude:        e.longitude ? Number(e.longitude) : null,
      status_auditoria: e.status_auditoria,
      justificativa_gps: e.justificativa_gps,
      motivo_reprovacao: e.motivo_reprovacao,
      id_usuario_auditor: e.id_usuario_auditor,
      auditado_em: e.auditado_em,
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
    const { descricao, latitude, longitude, clima, efetivo, ocorrencias } = req.body;
    if (typeof descricao !== 'string') {
      return res.status(400).json({ erro: 'Descricao deve ser texto.' });
    }
    const lat = latitude === undefined || latitude === null || latitude === '' ? null : Number(latitude);
    const lon = longitude === undefined || longitude === null || longitude === '' ? null : Number(longitude);
    if ((lat === null) !== (lon === null) ||
        (lat !== null && (!Number.isFinite(lat) || lat < -90 || lat > 90)) ||
        (lon !== null && (!Number.isFinite(lon) || lon < -180 || lon > 180))) {
      return res.status(400).json({ erro: 'Latitude e longitude devem ser validas e informadas juntas.' });
    }

    if (descricao.trim().length < 3) {
      return res.status(400).json({ erro: 'Descricao e obrigatoria (minimo 3 caracteres)' });
    }

    const climaText = typeof clima === 'string' ? clima.trim() : '';
    const ocorrenciasText = typeof ocorrencias === 'string' ? ocorrencias.trim() : '';
    const efetivoNum = efetivo === undefined || efetivo === null || efetivo === '' ? null : Number(efetivo);
    if (climaText.length > 80 || ocorrenciasText.length > 300 ||
        (efetivoNum !== null && (!Number.isSafeInteger(efetivoNum) || efetivoNum < 0 || efetivoNum > 9999999))) {
      return res.status(400).json({ erro: 'Dados de clima, efetivo ou ocorrencias invalidos.' });
    }

    let fotoUrl = null;
    if (req.file) {
      fotoUrl = getPublicUrl(`diario/${req.file.filename}`);
    }

    const idUsuario = req.user?.id;
    const role      = req.user?.role;

    // 1. Validar se o usuário pertence à equipe da obra, é gestor técnico, proprietário ou admin
    const isPlatformAdmin = ['ADMIN', 'MASTER', 'ADMIN_MASTER'].includes(role);
    let autorizado = isPlatformAdmin;

    if (!autorizado) {
      const isMembro = await prisma.tb_usuario_obra.findUnique({
        where: {
          id_usuario_id_obra: {
            id_usuario: Number(idUsuario),
            id_obra: Number(idObra)
          }
        }
      });
      if (isMembro) autorizado = true;
    }

    if (!autorizado) {
      const obra = await prisma.tb_obra.findUnique({
        where: { id_obra: Number(idObra) },
        select: { id_usuario_responsavel: true }
      });
      if (obra && obra.id_usuario_responsavel === Number(idUsuario)) {
        autorizado = true;
      }
    }

    if (!autorizado && role === 'PROPRIETARIO') {
      const idClienteUsuario = req.user?.id_cliente;
      if (idClienteUsuario) {
        const obraDaEmpresa = await prisma.tb_obra_cliente.findFirst({
          where: { id_obra: Number(idObra), id_cliente: Number(idClienteUsuario) }
        });
        if (obraDaEmpresa) autorizado = true;
      }
    }

    if (!autorizado) {
      return res.status(403).json({ erro: 'Apenas membros da equipe, responsáveis ou gestores da obra podem registrar no diário.' });
    }

    const novaEntrada = await prisma.tb_diario_obra.create({
      data: {
        id_obra:           idObra,
        id_usuario:        idUsuario,
        descricao:         descricao.trim(),
        clima:             climaText || null,
        efetivo:           efetivoNum,
        ocorrencias:       ocorrenciasText || null,
        foto_url:          fotoUrl,
        latitude:          lat,
        longitude:         lon,
        // A decisão de auditoria pertence exclusivamente ao servidor.
        status_auditoria:  'PENDENTE',
        justificativa_gps: null,
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
        clima:         novaEntrada.clima,
        efetivo:       novaEntrada.efetivo,
        ocorrencias:   novaEntrada.ocorrencias,
        foto_url:      novaEntrada.foto_url,
        data_registro: novaEntrada.data_registro,
        status_auditoria: novaEntrada.status_auditoria,
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
    const idObra = req.obraAccess?.idObra || Number(req.params.id);
    const idEntrada = Number(req.params.entradaId);
    const idAuditor = Number(req.user?.id);
    const { status, motivo } = req.body || {};
    if (!Number.isInteger(idEntrada) || idEntrada <= 0 || !Number.isInteger(idAuditor) || idAuditor <= 0) {
      return res.status(400).json({ erro: 'Identificador invalido.' });
    }
    if (!['AUTORIZADO', 'REPROVADO'].includes(status)) {
      return res.status(400).json({ erro: 'Status de auditoria invalido.' });
    }
    const motivoLimpo = typeof motivo === 'string' ? motivo.trim() : '';
    if (status === 'REPROVADO' && (!motivoLimpo || motivoLimpo.length > 2000)) {
      return res.status(400).json({ erro: 'Informe o motivo da reprovacao (ate 2000 caracteres).' });
    }
    const entrada = await prisma.tb_diario_obra.findUnique({ where: { id_diario: idEntrada } });
    if (!entrada || entrada.id_obra !== idObra) {
      return res.status(404).json({ erro: 'Entrada nao encontrada nesta obra.' });
    }
    if (entrada.id_usuario === idAuditor) {
      return res.status(403).json({ erro: 'O autor nao pode auditar seu proprio diario.' });
    }
    if (!['PENDENTE', 'AUTOMATICO'].includes(entrada.status_auditoria)) {
      return res.status(409).json({ erro: 'Este diario ja foi analisado.' });
    }
    // updateMany com condicao impede duas decisoes simultaneas no mesmo registro.
    const result = await prisma.tb_diario_obra.updateMany({
      where: {
        id_diario: idEntrada,
        id_obra: idObra,
        id_usuario: { not: idAuditor },
        status_auditoria: { in: ['PENDENTE', 'AUTOMATICO'] },
      },
      data: {
        status_auditoria: status,
        motivo_reprovacao: status === 'REPROVADO' ? motivoLimpo : null,
        id_usuario_auditor: idAuditor,
        auditado_em: new Date(),
      },
    });
    if (result.count !== 1) {
      return res.status(409).json({ erro: 'O diario foi alterado por outro usuario. Atualize a lista.' });
    }
    const entradaAtualizada = await prisma.tb_diario_obra.findUnique({ where: { id_diario: idEntrada } });
    await registrarLog({
      idUsuario: idAuditor,
      acao: 'DIARIO_AUDITAR_ENTRADA',
      targetId: idEntrada,
      detalhes: { status, id_obra: idObra, motivo: status === 'REPROVADO' ? motivoLimpo : null },
      ip: getIp(req),
    });
    return res.status(200).json({
      mensagem: 'Auditoria registrada com sucesso.',
      entrada: entradaAtualizada,
    });
  } catch (error) {
    console.error('[DIARIO] Erro ao auditar:', error);
    return res.status(500).json({ erro: 'Erro ao atualizar auditoria.' });
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

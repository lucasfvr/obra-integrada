import prisma from '../config/prisma.js';

/**
 * Registra uma ação no log de auditoria (tb_log_auditoria)
 */
export async function registrarLog({ idUsuario, acao, targetId = null, detalhes = null, ip = null }) {
  try {
    // Garante que se idUsuario ou targetId forem passados mas inválidos, não dê erro de tipo no Prisma
    const id_usuario = idUsuario ? Number(idUsuario) : null;
    const target_id = targetId ? Number(targetId) : null;

    await prisma.tb_log_auditoria.create({
      data: {
        id_usuario: isNaN(id_usuario) ? null : id_usuario,
        acao,
        target_id: isNaN(target_id) ? null : target_id,
        detalhes: detalhes ? JSON.stringify(detalhes) : null,
        ip_address: ip,
      },
    }).catch((err) => {
      console.info(`[AUDIT] Falha ao persistir: ${err.message}. Salvando em console: ${acao} | usuario=${idUsuario} | target=${targetId}`);
    });
  } catch (err) {
    console.info(`[AUDIT] Falha crítica no logger: ${err.message}. Ação: ${acao}`);
  }
}

/**
 * Retorna o IP do cliente a partir da requisição Express
 */
export function getIp(req) {
  return req.headers['x-forwarded-for'] || req.socket?.remoteAddress || null;
}

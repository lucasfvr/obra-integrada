import prisma from '../config/prisma.js';

export class ObraModel {

  static async findAll() {
    return await prisma.tb_obra.findMany();
  }

  static async findById(id) {
    return await prisma.tb_obra.findUnique({
      where: { id_obra: Number(id) },
      include: {
        tb_status: true,
        tb_usuario: { // Usuario responsavel
          select: { id_usuario: true, nome: true, email: true, role: true }
        },
        tb_usuario_obra: { // Equipe
          include: {
            tb_usuario: {
              select: { id_usuario: true, nome: true, email: true, role: true }
            },
            tb_papel: true
          }
        },
        tb_diario_obra: { // Diario (limitado aos ultimos 5 para o "Hydrated" view)
          take: 5,
          orderBy: { data_registro: 'desc' },
          include: {
            tb_usuario: { select: { nome: true } }
          }
        },
        tb_documento: {
          orderBy: { data_upload: 'desc' }
        },
        tb_tarefa: {
          orderBy: { criado_em: 'desc' },
          include: {
            tb_tarefa_usuario: {
              include: {
                tb_usuario: { select: { id_usuario: true, nome: true } }
              }
            }
          }
        },
        tb_estoque_obra: {
          orderBy: { nome_material: 'asc' }
        }
      }
    });
  }

  static async findByUserId(userId) {
    return await prisma.tb_obra.findMany({
      where: { id_usuario_responsavel: Number(userId) },
    });
  }

  static async findByClientId(clientId) {
    return await prisma.tb_obra.findMany({
      where: {
        tb_obra_cliente: {
          some: {
            id_cliente: Number(clientId)
          }
        }
      },
      include: {
        tb_status: true
      }
    });
  }

  static async create(data) {
    return await prisma.tb_obra.create({ data });
  }

  static async update(id, data) {
    return await prisma.tb_obra.update({
      where: { id_obra: Number(id) },
      data,
    });
  }

  static async delete(id) {
    return await prisma.tb_obra.delete({
      where: { id_obra: Number(id) },
    });
  }
}

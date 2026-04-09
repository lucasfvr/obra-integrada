import prisma from '../config/prisma.js';

export class ObraModel {

  static async findAll() {
    return await prisma.tb_obra.findMany();
  }

  static async findById(id) {
    return await prisma.tb_obra.findUnique({
      where: { id_obra: Number(id) },
    });
  }

  static async findByUserId(userId) {
    return await prisma.tb_obra.findMany({
      where: { id_usuario_responsavel: Number(userId) },
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

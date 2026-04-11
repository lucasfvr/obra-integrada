import prisma from '../config/prisma.js';

export class UserModel {

  static async findAll() {
    return await prisma.tb_usuario.findMany();
  }

  static async findById(id) {
    return await prisma.tb_usuario.findUnique({
      where: { id_usuario: Number(id) },
    });
  }

  // Busca por username ou email
  static async findByUsername(usernameOrEmail) {
    return await prisma.tb_usuario.findFirst({
      where: {
        OR: [
          { username: usernameOrEmail },
          { email: usernameOrEmail },
        ],
      },
    });
  }

  static async create(data) {
    return await prisma.tb_usuario.create({ data });
  }

  static async update(id, data) {
    return await prisma.tb_usuario.update({
      where: { id_usuario: Number(id) },
      data,
    });
  }
}

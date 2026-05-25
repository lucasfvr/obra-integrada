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

  // Busca por identificador (E-mail, Username, CPF ou CNPJ)
  static async findByUsername(identifier) {
    if (!identifier) return null;
    const normalized = identifier.trim().toLowerCase();
    const cleaned = identifier.replace(/\D/g, "");

    const conditions = [
      { username: normalized },
      { email: normalized }
    ];

    if (cleaned.length === 11) conditions.push({ cpf: cleaned });
    if (cleaned.length === 14) conditions.push({ cnpj: cleaned });

    // Fallback para o valor original se for um documento formatado
    if (normalized !== cleaned && normalized.length <= 20) {
      if (normalized.includes('.') || normalized.includes('-') || normalized.includes('/')) {
         conditions.push({ cpf: normalized });
         conditions.push({ cnpj: normalized });
      }
    }

    try {
      return await prisma.tb_usuario.findFirst({
        where: {
          OR: conditions,
        },
      });
    } catch (error) {
      console.error('Erro em findByUsername:', error);
      return null;
    }
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

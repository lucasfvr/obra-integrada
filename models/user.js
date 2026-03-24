import prisma from "../database/prisma.js";

export const UserModel = {
  async findAll() {
    return await prisma.users.findMany();
  },

  async findById(id) {
    return await prisma.users.findUnique({
      where: { id }
    });
  },

  async findByEmail(email) {
    return await prisma.users.findUnique({
      where: { email }
    });
  },

  async findByUsername(username) {
    return await prisma.users.findUnique({
      where: { username }
    });
  },

  async create(data) {
    return await prisma.users.create({
      data
    });
  }
};
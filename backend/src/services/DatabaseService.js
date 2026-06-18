const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class DatabaseService {
  /**
   * Executa query raw com parâmetros seguros
   * @param {string} query - Template SQL
   * @param {Array} params - Parâmetros para evitar SQL injection
   * @returns {Promise<Array>}
   */
  static async queryRaw(query, params = []) {
    try {
      return await prisma.$queryRaw(query, ...params);
    } catch (error) {
      console.error('[DatabaseService] Erro na query raw:', error);
      throw error;
    }
  }

  /**
   * Executa comando raw (INSERT/UPDATE/DELETE)
   */
  static async executeRaw(query, params = []) {
    try {
      return await prisma.$executeRaw(query, ...params);
    } catch (error) {
      console.error('[DatabaseService] Erro no comando raw:', error);
      throw error;
    }
  }

  /**
   * Inicia transação manual (quando necessário)
   * @param {Function} callback - Função que contém as operações da transação
   * @returns {Promise<any>}
   */
  static async transaction(callback) {
    return await prisma.$transaction(callback);
  }

  /**
   * Obtém uma instância do Prisma Client (para uso em repositórios)
   * @returns {PrismaClient}
   */
  static getPrisma() {
    return prisma;
  }
}

module.exports = DatabaseService;
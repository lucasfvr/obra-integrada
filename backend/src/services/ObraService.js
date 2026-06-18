const DatabaseService = require('./DatabaseService');

class ObraService {
  /**
   * Calcula o custo total de uma obra usando stored procedure
   * @param {number} idObra - ID da obra
   * @returns {Promise<Object>} - Objeto com o custo calculado
   */
  static async calcularCustoObra(idObra) {
    try {
      // Chamando a stored procedure criada em sql/procedures/calcular_custo_obra.sql
      const result = await DatabaseService.queryRaw(
        'SELECT calcular_custo_obra($1) AS custo_total',
        [idObra]
      );

      return {
        idObra,
        custoTotal: Number(result[0].custo_total) || 0
      };
    } catch (error) {
      console.error('[ObraService] Erro ao calcular custo da obra:', error);
      throw error;
    }
  }

  /**
   * Atualiza o status financeiro de uma obra baseado em lançamentos
   * @param {number} idObra - ID da obra
   * @returns {Promise<Object>} - Status financeiro atualizado
   */
  static async atualizarStatusFinanceiro(idObra) {
    return await DatabaseService.transaction(async (prisma) => {
      // Calculando totais por tipo
      const gastos = await prisma.$queryRaw`
        SELECT
          f.tipo,
          SUM(f.valor) AS total
        FROM tb_financeiro_obra f
        WHERE f.id_obra = ${idObra}
          AND f.data_pagamento IS NOT NULL
        GROUP BY f.tipo
      `;

      // Atualizando os campos na tabela tb_obra
      const orcamentoMaterial = gastos.find(g => g.tipo === 'MATERIAL')?.total || 0;
      const orcamentoMaoObra = gastos.find(g => g.tipo === 'MAO_OBRA')?.total || 0;
      const orcamentoTaxas = gastos.find(g => g.tipo === 'TAXA')?.total || 0;
      const custoAtual = orcamentoMaterial + orcamentoMaoObra + orcamentoTaxas;

      // Atualizando a obra com os novos valores
      const obraAtualizada = await prisma.tb_obra.update({
        where: { id_obra: idObra },
        data: {
          orcamento_material: orcamentoMaterial,
          orcamento_mao_obra: orcamentoMaoObra,
          orcamento_taxas: orcamentoTaxas,
          custo_atual: custoAtual
        }
      });

      return obraAtualizada;
    });
  }

  /**
   * Verifica se há etapas pendentes em uma obra
   * @param {number} idObra - ID da obra
   * @returns {Promise<boolean>} - True se há etapas pendentes
   */
  static async temEtapasPendentes(idObra) {
    const result = await DatabaseService.queryRaw(
      'SELECT COUNT(*) AS count FROM tb_etapa WHERE id_obra = $1 AND id_status != 3',
      [idObra]
    );

    return Number(result[0].count) > 0;
  }
}

module.exports = ObraService;
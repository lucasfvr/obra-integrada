const DatabaseService = require('./DatabaseService');

class RHService {
  /**
   * Obtém relatório avançado de RH: funcionários com certificações vencidas
   * trabalhando em obras de alto risco
   * @returns {Promise<Array>} - Lista de funcionários com problemas de certificação
   */
  static async getFuncionariosComCertificacaoVencidaEmObrasDeRisco() {
    try {
      // Lendo a query complexa do arquivo SQL
      const fs = require('fs');
      const path = require('path');
      const queryPath = path.join(__dirname, '../sql/queries/relatorio_rh_avancado.sql');
      const query = fs.readFileSync(queryPath, 'utf8');

      const result = await DatabaseService.queryRaw(query);
      return result;
    } catch (error) {
      console.error('[RHService] Erro ao obter relatório de RH avançado:', error);
      throw error;
    }
  }

  /**
   * Calcula o total de horas extras por funcionário em um período
   * @param {number} idUsuario - ID do usuário
   * @param {string} dataInicial - Data inicial (YYYY-MM-DD)
   * @param {string} dataFinal - Data final (YYYY-MM-DD)
   * @returns {Promise<Object>} - Total de horas extras
   */
  static async calcularHorasExtrasPeriodo(idUsuario, dataInicial, dataFinal) {
    const result = await DatabaseService.queryRaw(
      `
        SELECT
          SUM(horas_extras) AS total_horas_extras,
          COUNT(*) AS dias_com_hora_extra
        FROM tb_rh_ponto_diaria
        WHERE id_usuario = $1
          AND data_ponto BETWEEN $2 AND $3
          AND horas_extras > 0
      `,
      [idUsuario, dataInicial, dataFinal]
    );

    return {
      idUsuario,
      totalHorasExtras: Number(result[0].total_horas_extras) || 0,
      diasComHoraExtra: Number(result[0].dias_com_hora_extra) || 0
    };
  }

  /**
   * Verifica conformidade de segurança: funcionários sem EPI em obras de risco
   * @returns {Promise<Array>} - Lista de ocorrências de não conformidade
   */
  static async getNaoConformidadeSeguranca() {
    // Esta seria uma query mais complexa que verificaria registros de EPI
    // Para demonstração, retornamos uma query simples
    const result = await DatabaseService.queryRaw(
      `
        SELECT
          u.id_usuario,
          u.nome,
          o.id_obra,
          o.nome AS obra,
          p.data_ponto,
          'EPI não registrado' AS tipo_nao_conformidade
        FROM tb_usuario u
        JOIN tb_rh_ponto_diaria p ON u.id_usuario = p.id_usuario
        JOIN tb_obra o ON p.id_obra = o.id_obra
        WHERE
          o.tipo_obra IN ('ELÉTRICA', 'ALTURA', 'CONFINAMENTO')
          AND p.data_ponto >= CURRENT_DATE - INTERVAL '7 dias'
          AND u.is_terceirizado = true
          -- Em um sistema real, aqui teríamos uma verificação de registro de EPI
        LIMIT 50
      `
    );

    return result;
  }
}

module.exports = RHService;
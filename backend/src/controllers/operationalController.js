/**
 * operationalController.js
 * 
 * Lógicas específicas para a visão operacional (Nível 2).
 */
import prisma from '../config/prisma.js';

/**
 * Retorna estatísticas financeiras e de desempenho para o trabalhador
 */
export async function getWorkerStats(req, res) {
  try {
    // Busca o ID do usuário da query ou decodificado do token
    const userId = Number(req.query.userId) || req.user?.id_usuario;
    
    if (!userId) return res.status(400).json({ erro: 'userId é obrigatório' });

    // 1. Buscar valor_dia do trabalhador (pegamos da primeira obra vinculada por simplicidade)
    const vinculo = await prisma.tb_usuario_obra.findFirst({
      where: { id_usuario: userId },
      select: { valor_dia: true }
    });
    const valorDia = Number(vinculo?.valor_dia || 0);

    // 2. Contar dias únicos com diários de obra (Presença Confirmada e Auditada)
    const diarios = await prisma.tb_diario_obra.findMany({
      where: { 
        id_usuario: userId,
        status_auditoria: { in: ['AUTOMATICO', 'AUTORIZADO'] }
      },
      select: { data_registro: true }
    });

    // Filtramos apenas as datas únicas (sem considerar o horário)
    const datasUnicas = new Set(diarios.map(d => d.data_registro.toISOString().split('T')[0]));
    const diasTrabalhados = datasUnicas.size;

    // 3. Status de Tarefas (usa junction table tb_tarefa_usuario)
    const tarefas = await prisma.tb_tarefa.findMany({
      where: {
        tb_tarefa_usuario: { some: { id_usuario: userId } }
      },
      select: { status: true, percentual_concluido: true }
    });

    const totalTarefas = tarefas.length;
    const concluidas = tarefas.filter(t => t.status === 'CONCLUIDA').length;
    const pendentes = totalTarefas - concluidas;
    const mediaProgresso = totalTarefas > 0 
      ? tarefas.reduce((acc, t) => acc + (t.percentual_concluido || 0), 0) / totalTarefas 
      : 0;

    return res.status(200).json({
      financeiro: {
        valorDia,
        diasTrabalhados,
        proximoPagamento: diasTrabalhados * valorDia,
      },
      desempenho: {
        total: totalTarefas,
        concluidas,
        pendentes,
        mediaProgresso: Math.round(mediaProgresso)
      }
    });
  } catch (error) {
    console.error('[OPERATIONAL] Erro ao buscar stats:', error);
    return res.status(500).json({ erro: 'Erro ao calcular estatísticas operacionais' });
  }
}

/**
 * Mock de clima com inteligência de negócio (Alertas de chuva)
 */
export async function getWeatherMock(req, res) {
  try {
    const { cidade } = req.query;
    
    // Simulação baseada na cidade
    const mocks = {
      'São Paulo': { temp: 24, condicao: 'Chuvoso', chanceChuva: 80 },
      'Campinas':  { temp: 28, condicao: 'Ensolarado', chanceChuva: 10 },
      'Default':   { temp: 22, condicao: 'Nublado', chanceChuva: 40 }
    };

    const weather = mocks[cidade] || mocks['Default'];
    
    // Lógica sugerida pelo usuário: Alerta para atividades externas
    let alerta = null;
    if (weather.chanceChuva > 50) {
      alerta = "⚠️ Alerta de Chuva: Atividades de concretagem ou pintura externa não recomendadas hoje.";
    }

    return res.status(200).json({
      ...weather,
      cidade: cidade || 'Obra Atual',
      alerta
    });
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao buscar clima' });
  }
}

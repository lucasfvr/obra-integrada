/**
 * operationalController.js
 * 
 * Lógicas específicas para a visão operacional (Nível 2).
 * Gerencia estatísticas, desempenho e dados operacionais do trabalhador.
 */
import prisma from '../config/prisma.js';

/**
 * Retorna estatísticas financeiras e de desempenho para o trabalhador
 * Inclui: salário, dias trabalhados, tarefas, certificações, obras
 */
export async function getWorkerStats(req, res) {
  try {
    // Busca o ID do usuário da query ou decodificado do token
    const userId = Number(req.query.userId) || req.user?.id_usuario;
    
    if (!userId) return res.status(400).json({ erro: 'userId é obrigatório' });

    // 1. Buscar dados do trabalhador
    const usuario = await prisma.tb_usuario.findUnique({
      where: { id_usuario: userId },
      select: { 
        nome: true, 
        cpf: true, 
        email: true,
        data_admissao: true,
        status: true,
        tipo_vinculo: true
      }
    });

    if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado' });

    // 2. Buscar valor_dia (pega de todos os vínculos e usa a média)
    const vinculos = await prisma.tb_usuario_obra.findMany({
      where: { id_usuario: userId },
      select: { valor_dia: true, id_obra: true }
    });
    
    const valorDia = vinculos.length > 0 
      ? vinculos.reduce((acc, v) => acc + Number(v.valor_dia || 0), 0) / vinculos.length 
      : 0;
    
    const totalObras = vinculos.length;

    // 3. Contar dias únicos com diários de obra (Presença Confirmada e Auditada)
    const diarios = await prisma.tb_diario_obra.findMany({
      where: { 
        id_usuario: userId,
        status_auditoria: { in: ['AUTOMATICO', 'AUTORIZADO'] }
      },
      select: { data_registro: true, id_obra: true }
    });

    const datasUnicas = new Set(diarios.map(d => d.data_registro.toISOString().split('T')[0]));
    const diasTrabalhados = datasUnicas.size;

    // 4. Status de Tarefas (usa junction table tb_tarefa_usuario)
    const tarefas = await prisma.tb_tarefa.findMany({
      where: {
        tb_tarefa_usuario: { some: { id_usuario: userId } }
      },
      select: { status: true, percentual_concluido: true, id_tarefa: true }
    });

    const totalTarefas = tarefas.length;
    const concluidas = tarefas.filter(t => t.status === 'CONCLUIDA').length;
    const emAndamento = tarefas.filter(t => t.status === 'EM_ANDAMENTO').length;
    const pendentes = tarefas.filter(t => t.status === 'PENDENTE').length;
    const mediaProgresso = totalTarefas > 0 
      ? tarefas.reduce((acc, t) => acc + (t.percentual_concluido || 0), 0) / totalTarefas 
      : 0;

    // 5. Certificações
    const certificacoes = await prisma.tb_certificacao.findMany({
      where: { id_usuario: userId },
      select: { 
        nome: true, 
        data_validade: true,
        numero_certificado: true,
        status: true
      }
    });

    const certsValidas = certificacoes.filter(c => new Date(c.data_validade) > new Date()).length;
    const certsVencidas = certificacoes.filter(c => new Date(c.data_validade) <= new Date()).length;

    // 6. Calcular taxa de presença (dias únicos vs dias com tarefas)
    const diasComTarefas = new Set(diarios.map(d => d.id_obra)).size || 1;
    const taxaPresenca = (diasTrabalhados / (diasTrabalhados + 5)) * 100; // Normalizado

    return res.status(200).json({
      usuario: {
        id: userId,
        nome: usuario.nome,
        email: usuario.email,
        status: usuario.status,
        tipoVinculo: usuario.tipo_vinculo,
        dataAdmissao: usuario.data_admissao
      },
      financeiro: {
        valorDia: parseFloat(valorDia.toFixed(2)),
        diasTrabalhados,
        proximoPagamento: parseFloat((diasTrabalhados * valorDia).toFixed(2)),
        totalObras,
        previsaoMensal: parseFloat(((diasTrabalhados / (new Date().getDate())) * 30 * valorDia).toFixed(2))
      },
      desempenho: {
        tarefas: {
          total: totalTarefas,
          concluidas,
          emAndamento,
          pendentes,
          taxaConclusao: totalTarefas > 0 ? Math.round((concluidas / totalTarefas) * 100) : 0,
          mediaProgresso: Math.round(mediaProgresso)
        },
        presenca: {
          diasTrabalhados,
          taxaPresenca: Math.round(taxaPresenca),
          diasComTarefas
        }
      },
      certificacoes: {
        total: certificacoes.length,
        validas: certsValidas,
        vencidas: certsVencidas,
        items: certificacoes.map(c => ({
          nome: c.nome,
          dataValidade: c.data_validade,
          status: new Date(c.data_validade) > new Date() ? 'VÁLIDA' : 'VENCIDA'
        }))
      }
    });
  } catch (error) {
    console.error('[OPERATIONAL] Erro ao buscar stats:', error);
    return res.status(500).json({ erro: 'Erro ao calcular estatísticas operacionais' });
  }
}

/**
 * Retorna histórico de pagamentos do trabalhador
 */
export async function getWorkerPaymentHistory(req, res) {
  try {
    const userId = Number(req.query.userId) || req.user?.id_usuario;
    const { month, year } = req.query;
    
    if (!userId) return res.status(400).json({ erro: 'userId é obrigatório' });

    // Buscar diários de obra agrupados por mês
    const diarios = await prisma.tb_diario_obra.findMany({
      where: { 
        id_usuario: userId,
        status_auditoria: { in: ['AUTOMATICO', 'AUTORIZADO'] }
      },
      select: { data_registro: true, id_obra: true }
    });

    // Agrupar por mês
    const meses = {};
    diarios.forEach(d => {
      const data = new Date(d.data_registro);
      const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
      meses[chave] = (meses[chave] || 0) + 1;
    });

    const vinculo = await prisma.tb_usuario_obra.findFirst({
      where: { id_usuario: userId },
      select: { valor_dia: true }
    });

    const valorDia = Number(vinculo?.valor_dia || 0);

    const pagamentos = Object.entries(meses).map(([mesAno, dias]) => {
      const [ano, mes] = mesAno.split('-');
      return {
        mesAno: `${mes}/${ano}`,
        diasTrabalhados: dias,
        valorTotal: parseFloat((dias * valorDia).toFixed(2)),
        status: 'Processado'
      };
    });

    return res.status(200).json(pagamentos.reverse());
  } catch (error) {
    console.error('[OPERATIONAL] Erro ao buscar histórico:', error);
    return res.status(500).json({ erro: 'Erro ao buscar histórico de pagamentos' });
  }
}

/**
 * Retorna disponibilidade e alocação do trabalhador
 */
export async function getWorkerAvailability(req, res) {
  try {
    const userId = Number(req.query.userId) || req.user?.id_usuario;
    
    if (!userId) return res.status(400).json({ erro: 'userId é obrigatório' });

    // Obras onde está vinculado
    const vinculos = await prisma.tb_usuario_obra.findMany({
      where: { id_usuario: userId },
      select: { 
        id_obra: true, 
        valor_dia: true,
        tb_obra: { select: { nome: true, localizacao: true, status: true } }
      }
    });

    // Tarefas ativas
    const tarefasAtivas = await prisma.tb_tarefa.findMany({
      where: {
        tb_tarefa_usuario: { some: { id_usuario: userId } },
        status: { in: ['PENDENTE', 'EM_ANDAMENTO'] }
      },
      select: { 
        id_tarefa: true,
        titulo: true,
        status: true,
        id_obra: true,
        percentual_concluido: true
      }
    });

    return res.status(200).json({
      alocacoes: vinculos.map(v => ({
        obraId: v.id_obra,
        obra: v.tb_obra.nome,
        localizacao: v.tb_obra.localizacao,
        statusObra: v.tb_obra.status,
        valorDia: parseFloat(v.valor_dia),
        tarefasNessa: tarefasAtivas.filter(t => t.id_obra === v.id_obra).length
      })),
      tarefasAtivas: tarefasAtivas.length,
      disponivel: tarefasAtivas.length === 0
    });
  } catch (error) {
    console.error('[OPERATIONAL] Erro ao buscar disponibilidade:', error);
    return res.status(500).json({ erro: 'Erro ao buscar disponibilidade' });
  }
}

/**
 * Mock de clima com inteligência de negócio (Alertas de chuva)
 * Retorna clima e recomendações para atividades de obra
 */
export async function getWeatherMock(req, res) {
  try {
    const { cidade, obraId } = req.query;
    
    // Simulação baseada na cidade
    const mocks = {
      'São Paulo': { 
        temp: 24, 
        condicao: 'Chuvoso', 
        chanceChuva: 80,
        umidade: 85,
        vento: 15
      },
      'Campinas':  { 
        temp: 28, 
        condicao: 'Ensolarado', 
        chanceChuva: 10,
        umidade: 45,
        vento: 5
      },
      'Default':   { 
        temp: 22, 
        condicao: 'Nublado', 
        chanceChuva: 40,
        umidade: 60,
        vento: 10
      }
    };

    const weather = mocks[cidade] || mocks['Default'];
    
    // Recomendações por tipo de atividade
    const recomendacoes = [];
    
    if (weather.chanceChuva > 60) {
      recomendacoes.push({
        tipo: 'ALERTA_CRITICO',
        mensagem: '⚠️ ALERTA: Não é recomendado realizar atividades de concretagem, pintura ou trabalhos em altura'
      });
    } else if (weather.chanceChuva > 30) {
      recomendacoes.push({
        tipo: 'ALERTA_MODERADO',
        mensagem: '⚠️ PRECAUÇÃO: Há risco de chuva. Use proteção extra em atividades expostas'
      });
    } else {
      recomendacoes.push({
        tipo: 'BOM',
        mensagem: '✅ Condições adequadas para todas as atividades'
      });
    }

    if (weather.temp > 30) {
      recomendacoes.push({
        tipo: 'TEMPERATURA_ALTA',
        mensagem: '🌡️ Temperatura alta. Intensifique hidratação e pausas dos trabalhadores'
      });
    }

    if (weather.vento > 20) {
      recomendacoes.push({
        tipo: 'VENTO_FORTE',
        mensagem: '💨 Vento forte. Evite trabalhos em altura e estruturas instáveis'
      });
    }

    return res.status(200).json({
      clima: {
        cidade: cidade || 'Obra Atual',
        temperatura: weather.temp,
        condicao: weather.condicao,
        chanceChuva: weather.chanceChuva,
        umidade: weather.umidade,
        vento: weather.vento
      },
      recomendacoes,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao buscar clima' });
  }
}

/**
 * Retorna relatório de desempenho detalhado do trabalhador
 */
export async function getWorkerPerformanceReport(req, res) {
  try {
    const userId = Number(req.query.userId) || req.user?.id_usuario;
    const { dataInicio, dataFim } = req.query;
    
    if (!userId) return res.status(400).json({ erro: 'userId é obrigatório' });

    const inicio = dataInicio ? new Date(dataInicio) : new Date(new Date().setDate(new Date().getDate() - 30));
    const fim = dataFim ? new Date(dataFim) : new Date();

    // 1. Tarefas completadas no período
    const tarefas = await prisma.tb_tarefa.findMany({
      where: {
        tb_tarefa_usuario: { some: { id_usuario: userId } },
        updated_at: { gte: inicio, lte: fim }
      },
      select: { 
        id_tarefa: true,
        titulo: true, 
        status: true, 
        percentual_concluido: true,
        created_at: true,
        updated_at: true
      }
    });

    // 2. Diários registrados
    const diarios = await prisma.tb_diario_obra.findMany({
      where: { 
        id_usuario: userId,
        data_registro: { gte: inicio, lte: fim }
      },
      select: { data_registro: true, status_auditoria: true }
    });

    const diasUnicos = new Set(diarios.map(d => d.data_registro.toISOString().split('T')[0])).size;

    // 3. Score de desempenho
    const taxaConclusao = tarefas.length > 0 
      ? (tarefas.filter(t => t.status === 'CONCLUIDA').length / tarefas.length) * 100 
      : 0;
    
    const mediaProgresso = tarefas.length > 0
      ? tarefas.reduce((acc, t) => acc + (t.percentual_concluido || 0), 0) / tarefas.length
      : 0;

    const score = Math.round((taxaConclusao * 0.6 + mediaProgresso * 0.4));

    return res.status(200).json({
      periodo: { inicio, fim },
      resumo: {
        diasTrabalhados: diasUnicos,
        tarefasAssignadas: tarefas.length,
        tarefasConcluidas: tarefas.filter(t => t.status === 'CONCLUIDA').length,
        diariosCom: diarios.length,
        scoreDesempenho: score,
        performanceLabel: score >= 90 ? 'EXCELENTE' : score >= 75 ? 'BOM' : score >= 60 ? 'ADEQUADO' : 'BAIXO'
      },
      tarefas: tarefas.map(t => ({
        id: t.id_tarefa,
        titulo: t.titulo,
        status: t.status,
        progresso: t.percentual_concluido,
        dataConclusao: t.updated_at
      }))
    });
  } catch (error) {
    console.error('[OPERATIONAL] Erro ao gerar relatório:', error);
    return res.status(500).json({ erro: 'Erro ao gerar relatório de desempenho' });
  }
}

/**
 * Retorna lista de tarefas ativas do trabalhador (próximas a fazer)
 */
export async function getWorkerActiveTasks(req, res) {
  try {
    const userId = Number(req.query.userId) || req.user?.id_usuario;
    
    if (!userId) return res.status(400).json({ erro: 'userId é obrigatório' });

    const tarefasAtivas = await prisma.tb_tarefa.findMany({
      where: {
        tb_tarefa_usuario: { some: { id_usuario: userId } },
        status: { in: ['PENDENTE', 'EM_ANDAMENTO'] }
      },
      select: { 
        id_tarefa: true,
        titulo: true, 
        descricao: true,
        status: true,
        percentual_concluido: true,
        tb_obra: { select: { nome: true } }
      },
      orderBy: { created_at: 'asc' },
      take: 10
    });

    return res.status(200).json({
      total: tarefasAtivas.length,
      tarefas: tarefasAtivas.map(t => ({
        id: t.id_tarefa,
        titulo: t.titulo,
        descricao: t.descricao,
        status: t.status,
        progresso: t.percentual_concluido,
        obra: t.tb_obra?.nome || 'Sem obra'
      }))
    });
  } catch (error) {
    console.error('[OPERATIONAL] Erro ao buscar tarefas ativas:', error);
    return res.status(500).json({ erro: 'Erro ao buscar tarefas ativas' });
  }
}

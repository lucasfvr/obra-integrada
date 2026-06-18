/**
 * workerService.js
 * 
 * Serviço frontend para consumir as APIs de trabalhador
 * Integrar em Dashboard, Mobile App, RH, etc.
 */

const API_BASE = '/api';

export class WorkerService {
  constructor(apiFetch) {
    this.apiFetch = apiFetch; // Função que faz fetch com autenticação
  }

  /**
   * 1️⃣ Obtém estatísticas consolidadas do trabalhador
   * @param {number} userId - ID do usuário (optional, usa autenticado se não informar)
   * @returns {Promise} { usuario, financeiro, desempenho, certificacoes }
   */
  async getStats(userId = null) {
    const url = new URL(`${API_BASE}/operational/stats`, window.location.origin);
    if (userId) url.searchParams.append('userId', userId);
    
    const res = await this.apiFetch(url.toString());
    if (!res.ok) throw new Error('Erro ao buscar estatísticas');
    return res.json();
  }

  /**
   * 2️⃣ Obtém histórico de pagamentos (mensal)
   * @param {number} userId - ID do usuário
   * @param {string} month - Mês (MM) opcional
   * @param {string} year - Ano (YYYY) opcional
   * @returns {Promise} Array de pagamentos
   */
  async getPaymentHistory(userId = null, month = null, year = null) {
    const url = new URL(`${API_BASE}/operational/pagamentos`, window.location.origin);
    if (userId) url.searchParams.append('userId', userId);
    if (month) url.searchParams.append('month', month);
    if (year) url.searchParams.append('year', year);

    const res = await this.apiFetch(url.toString());
    if (!res.ok) throw new Error('Erro ao buscar pagamentos');
    return res.json();
  }

  /**
   * 3️⃣ Obtém disponibilidade e alocações do trabalhador
   * @returns {Promise} { alocacoes[], tarefasAtivas, disponivel }
   */
  async getAvailability() {
    const res = await this.apiFetch(`${API_BASE}/operational/disponibilidade`);
    if (!res.ok) throw new Error('Erro ao buscar disponibilidade');
    return res.json();
  }

  /**
   * 4️⃣ Obtém relatório de desempenho em período
   * @param {string} dataInicio - YYYY-MM-DD (optional, default últimos 30 dias)
   * @param {string} dataFim - YYYY-MM-DD (optional)
   * @param {number} userId - ID do usuário (optional)
   * @returns {Promise} { periodo, resumo, tarefas[] }
   */
  async getPerformanceReport(dataInicio = null, dataFim = null, userId = null) {
    const url = new URL(`${API_BASE}/operational/relatorio`, window.location.origin);
    if (dataInicio) url.searchParams.append('dataInicio', dataInicio);
    if (dataFim) url.searchParams.append('dataFim', dataFim);
    if (userId) url.searchParams.append('userId', userId);

    const res = await this.apiFetch(url.toString());
    if (!res.ok) throw new Error('Erro ao buscar relatório');
    return res.json();
  }

  /**
   * 5️⃣ Obtém tarefas ativas (PENDENTE + EM_ANDAMENTO)
   * @returns {Promise} { total, tarefas[] }
   */
  async getActiveTasks() {
    const res = await this.apiFetch(`${API_BASE}/operational/tarefas-ativas`);
    if (!res.ok) throw new Error('Erro ao buscar tarefas');
    return res.json();
  }

  /**
   * 6️⃣ Obtém clima e recomendações
   * @param {string} cidade - Nome da cidade (optional)
   * @returns {Promise} { clima, recomendacoes[], timestamp }
   */
  async getWeatherAndRecommendations(cidade = 'São Paulo') {
    const url = new URL(`${API_BASE}/operational/weather`, window.location.origin);
    url.searchParams.append('cidade', cidade);

    const res = await this.apiFetch(url.toString());
    if (!res.ok) throw new Error('Erro ao buscar clima');
    return res.json();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// EXEMPLOS DE USO
// ─────────────────────────────────────────────────────────────────────────────

export async function exemploPainelTrabalhador(apiFetch) {
  const worker = new WorkerService(apiFetch);

  try {
    // 1. Carrega tudo ao abrir o painel
    const [stats, tarefas, clima, pagamentos] = await Promise.all([
      worker.getStats(),
      worker.getActiveTasks(),
      worker.getWeatherAndRecommendations(),
      worker.getPaymentHistory()
    ]);

    return {
      // Seção de Boas-vindas
      bemVindo: {
        nome: stats.usuario.nome,
        cargo: stats.usuario.tipoVinculo,
        status: stats.usuario.status
      },

      // Seção Financeira
      financeiro: {
        valorDia: stats.financeiro.valorDia,
        diasMes: stats.financeiro.diasTrabalhados,
        proximoPagamento: stats.financeiro.proximoPagamento,
        previsaoMensal: stats.financeiro.previsaoMensal,
        historicoMeses: pagamentos.slice(0, 6) // Últimos 6 meses
      },

      // Seção de Tarefas
      tarefas: {
        ativas: tarefas.total,
        lista: tarefas.tarefas,
        progresso: stats.desempenho.tarefas.mediaProgresso,
        taxaConclusao: stats.desempenho.tarefas.taxaConclusao
      },

      // Seção de Certificações
      certificacoes: {
        validas: stats.certificacoes.validas,
        vencidas: stats.certificacoes.vencidas,
        alertas: stats.certificacoes.items
          .filter(c => c.status === 'VENCIDA')
          .map(c => `${c.nome} venceu!`)
      },

      // Seção de Clima
      clima: {
        temperatura: clima.clima.temperatura,
        condicao: clima.clima.condicao,
        chance_chuva: clima.clima.chanceChuva,
        recomendacoes: clima.recomendacoes
      },

      // Seção de Presença
      presenca: {
        diasTrabalhados: stats.desempenho.presenca.diasTrabalhados,
        taxaPresenca: stats.desempenho.presenca.taxaPresenca
      },

      // KPI - Pontuação Geral (0-100)
      scoreGeral: stats.desempenho.tarefas.mediaProgresso
    };
  } catch (error) {
    console.error('Erro ao carregar painel:', error);
    throw error;
  }
}

export async function exemploRelatorioRH(apiFetch, mesAno) {
  const worker = new WorkerService(apiFetch);
  
  // Calcular datas do mês
  const [mes, ano] = mesAno.split('/');
  const dataInicio = `${ano}-${mes}-01`;
  const dataFim = new Date(ano, mes, 0).toISOString().split('T')[0];

  const [relatorio, pagamento] = await Promise.all([
    worker.getPerformanceReport(dataInicio, dataFim),
    worker.getPaymentHistory(null, mes, ano)
  ]);

  return {
    mes: mesAno,
    desempenho: {
      score: relatorio.resumo.scoreDesempenho,
      label: relatorio.resumo.performanceLabel,
      tarefasFeitas: relatorio.resumo.tarefasConcluidas,
      diasTrabalhados: relatorio.resumo.diasTrabalhados
    },
    pagamento: pagamento[0] || null,
    tarefasDetalhadas: relatorio.tarefas
  };
}

export async function exemploAlocacaoObra(apiFetch) {
  const worker = new WorkerService(apiFetch);

  const disponibilidade = await worker.getAvailability();

  // Verificar se pode alocar em nova obra
  const podeAlocar = disponibilidade.disponivel;
  const cargaAtual = disponibilidade.tarefasAtivas;
  const obrasVinculadas = disponibilidade.alocacoes.length;

  return {
    status: podeAlocar ? '✅ DISPONÍVEL' : '❌ OCUPADO',
    cargaAtual,
    obrasVinculadas,
    alocacoes: disponibilidade.alocacoes
  };
}

export async function exemploAlertaClima(apiFetch, cidade) {
  const worker = new WorkerService(apiFetch);

  const { clima, recomendacoes } = await worker.getWeatherAndRecommendations(cidade);

  const temAlerta = recomendacoes.some(r => r.tipo.includes('ALERTA'));
  
  return {
    cidade: clima.cidade,
    temperatura: clima.temperatura,
    condicao: clima.condicao,
    chanceChuva: clima.chanceChuva,
    temAlerta,
    recomendacoes: recomendacoes.map(r => ({
      tipo: r.tipo,
      msg: r.mensagem,
      urgente: r.tipo.includes('CRITICO')
    }))
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTS REACT (Exemplo)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Exemplo de componente React para exibir estatísticas
 */
export function PainelTrabalhador({ apiFetch }) {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    exemploPainelTrabalhador(apiFetch)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [apiFetch]);

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error.message}</div>;
  if (!data) return <div>Sem dados</div>;

  return (
    <div className="painel-trabalhador">
      {/* Bem-vindo */}
      <section className="bem-vindo">
        <h1>Bem-vindo, {data.bemVindo.nome}!</h1>
        <p>Status: {data.bemVindo.status}</p>
      </section>

      {/* Clima - Com Alerta */}
      {data.clima.recomendacoes.some(r => r.tipo.includes('ALERTA')) && (
        <section className="alerta-clima">
          ⚠️ {data.clima.recomendacoes.find(r => r.tipo.includes('ALERTA')).recomendacoes}
        </section>
      )}

      {/* Financeiro */}
      <section className="financeiro">
        <h2>💰 Financeiro</h2>
        <div className="card">
          <p>Dias este mês: {data.financeiro.diasMes}</p>
          <p>Valor/dia: R$ {data.financeiro.valorDia.toFixed(2)}</p>
          <p className="destaque">Próximo pagamento: R$ {data.financeiro.proximoPagamento.toFixed(2)}</p>
        </div>
      </section>

      {/* Tarefas */}
      <section className="tarefas">
        <h2>✅ Tarefas ({data.tarefas.ativas} ativas)</h2>
        {data.tarefas.lista.map(t => (
          <div key={t.id} className="tarefa">
            <p>{t.titulo}</p>
            <progress value={t.progresso} max={100}></progress>
            <span>{t.progresso}%</span>
          </div>
        ))}
      </section>

      {/* Certificações com alerta */}
      {data.certificacoes.alertas.length > 0 && (
        <section className="alertas">
          <h3>⚠️ Certificações Vencidas</h3>
          {data.certificacoes.alertas.map((alerta, i) => (
            <p key={i} className="alerta">{alerta}</p>
          ))}
        </section>
      )}

      {/* Score Geral */}
      <section className="score">
        <h3>Desempenho Geral</h3>
        <div className="circular-progress">
          {Math.round(data.scoreGeral)}%
        </div>
      </section>
    </div>
  );
}

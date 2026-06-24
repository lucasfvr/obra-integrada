import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import API_BASE_URL from '../../config/api.js';
import {
  Search, Plus, AlertCircle, Clock, Users, UserPlus, UserCheck, AlertTriangle, DollarSign, Heart, Briefcase,
  BarChart2, Calendar, ClipboardList, FileText, LayoutDashboard, TrendingUp, XCircle, CheckCircle, Circle, Bell
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

export default function RHDashboard() {
  const { user, apiFetch } = useAuth();
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const [stats, setStats] = useState({
    colaboradoresAtivos: 0,
    admissoesEmAndamento: 0,
    feriasProgramadas: 0,
    afastamentos: 0,
    examesPendentes: 0,
    custoMaoObra: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [distribuicaoMaoObra, setDistribuicaoMaoObra] = useState([]);
  const [movimentacoesRecentes, setMovimentacoesRecentes] = useState([]);
  const [vagasRecrutamento, setVagasRecrutamento] = useState({ abertas: 0, candidatos: 0, entrevistasAgendadas: 0, contratacoesPrevistas: 0, kanban: [] });
  const [statusDocumentacao, setStatusDocumentacao] = useState([]);
  const [treinamentosStatus, setTreinamentosStatus] = useState([]);
  const [feriasAfastamentos, setFeriasAfastamentos] = useState({ iniciamFerias: 0, retornamFerias: 0, afastamentosEncerram: 0, novasLicencas: 0 });
  const [custosPessoas, setCustosPessoas] = useState({ folhaMes: 0, encargos: 0, beneficios: 0, total: 0, historico: [] });
  const [produtividadeObra, setProdutividadeObra] = useState([]);
  const [loading, setLoading] = useState(true);

  const IconMap = {
    Search, Plus, AlertCircle, Clock, Users, UserPlus, UserCheck, AlertTriangle, DollarSign, Heart, Briefcase,
    BarChart2, Calendar, ClipboardList, FileText, LayoutDashboard, TrendingUp, XCircle, CheckCircle, Circle, Bell
  };

  const currentDate = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = currentDate.toLocaleDateString('pt-BR', options);
  const totalPendencias = alertas.length;

  const saudacao = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  // Carrega os indicadores reais do dashboard (endpoint ja existente).
  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        setLoading(true);
        const res = await apiFetch(`${API_BASE_URL}/api/rh/dashboard-stats`);
        if (!res.ok) throw new Error('Erro ao carregar o dashboard');
        const d = await res.json();
        if (!ativo) return;
        if (d.stats) setStats(d.stats);
        setAlertas(d.alertas || []);
        setMovimentacoesRecentes(d.movimentacoesRecentes || []);
        setDistribuicaoMaoObra(d.distribuicaoMaoObra || []);
        setStatusDocumentacao(d.statusDocumentacao || []);
        if (d.custosPessoas) setCustosPessoas(d.custosPessoas);
        setProdutividadeObra(d.produtividadeObra || []);
        if (d.vagasRecrutamento) setVagasRecrutamento(d.vagasRecrutamento);
        setTreinamentosStatus(d.treinamentosStatus || []);
        if (d.feriasAfastamentos) setFeriasAfastamentos(d.feriasAfastamentos);
      } catch (e) {
        console.error(e);
      } finally {
        if (ativo) setLoading(false);
      }
    })();
    return () => { ativo = false; };
  }, [apiFetch]);

  // Busca global real (debounce) — substitui os dados ficticios.
  useEffect(() => {
    if (searchQuery.trim().length < 2) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      try {
        const res = await apiFetch(`${API_BASE_URL}/api/rh?busca=${encodeURIComponent(searchQuery)}&limit=5&status=TODOS`);
        if (!res.ok) return;
        const d = await res.json();
        setSearchResults((d.data || []).map((u) => ({
          id: u.id_usuario,
          nome: u.nome,
          cpf: u.cpf || '—',
          cargo: u.cargo_base || '—',
          obra: u.obra_atual || '—',
        })));
      } catch (e) {
        console.error(e);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery, apiFetch]);

  const acoesRapidasButtons = [
    { icon: UserPlus, label: 'Novo Colaborador', action: '/rh/colaboradores' },
    { icon: FileText, label: 'Enviar Documento', action: '/rh/documentacao' },
    { icon: Briefcase, label: 'Abrir Vaga', action: '/rh/vagas' },
    { icon: Calendar, label: 'Registrar Férias', action: '/rh/ferias' },
    { icon: Heart, label: 'Agendar Exame', action: '/rh/exames' },
    { icon: LayoutDashboard, label: 'Criar Treinamento', action: '/rh/treinamentos' },
    { icon: BarChart2, label: 'Alocar em Obra', action: '/rh/equipes-obra' }
  ];

  return (
    <div className="min-h-screen bg-background" aria-busy={loading}>
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex flex-col">
            <p className="text-xl font-bold text-foreground">{saudacao()}, {user?.nome?.split(' ')[0] || 'User'}.</p>
            <p className="text-muted-foreground text-sm capitalize">Hoje é {formattedDate}.</p>
            <p className="text-muted-foreground text-sm mt-1">
              Você possui <span className="font-semibold text-primary">{totalPendencias} pendências</span> que exigem atenção.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => document.getElementById('alertas-criticos')?.scrollIntoView({ behavior: 'smooth' })}
              className="p-2 rounded-full hover:bg-accent transition-colors relative"
              title="Ver alertas"
            >
              <Bell size={20} className="text-foreground" />
              {totalPendencias > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
              )}
            </button>
            <button
              onClick={() => searchInputRef.current?.focus()}
              className="p-2 rounded-full hover:bg-accent transition-colors"
              title="Buscar"
            >
              <Search size={20} className="text-foreground" />
            </button>
            <button
              onClick={() => navigate('/rh/colaboradores')}
              className="p-2 rounded-full hover:bg-accent transition-colors"
              title="Novo colaborador"
            >
              <Plus size={20} className="text-foreground" />
            </button>
          </div>
        </div>

        {/* Busca Global */}
        <div className="max-w-7xl mx-auto px-6 pb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={20} className="text-muted-foreground" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Pesquisar pessoa, documento ou processo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />

            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-20">
                {searchResults.map((result) => (
                  <Link
                    key={result.id}
                    to={`/rh/colaboradores/${result.id}`}
                    onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-accent border-b border-border last:border-b-0 cursor-pointer transition-colors"
                  >
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-primary font-semibold">{result.nome.charAt(0)}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{result.nome}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{result.cpf}</span>
                        <span>•</span>
                        <span>{result.cargo}</span>
                        <span>•</span>
                        <span>{result.obra}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">Indicadores Principais</h2>
        
        {/* Cards de KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <Link to="/rh/colaboradores" className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-lg transition-all cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Colaboradores Ativos</p>
                <p className="text-3xl font-bold text-foreground mt-2">{stats.colaboradoresAtivos}</p>
              </div>
              <Users size={40} className="text-primary/30" />
            </div>
          </Link>

          <Link to="/rh/contratacoes" className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-lg transition-all cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Admissões em Andamento</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.admissoesEmAndamento}</p>
              </div>
              <UserCheck size={40} className="text-yellow-600/30" />
            </div>
          </Link>

          <Link to="/rh/ferias" className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-lg transition-all cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Férias Programadas</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.feriasProgramadas}</p>
              </div>
              <Clock size={40} className="text-blue-600/30" />
            </div>
          </Link>

          <Link to="/rh/afastamentos" className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-lg transition-all cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Afastamentos</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{stats.afastamentos}</p>
              </div>
              <Heart size={40} className="text-orange-600/30" />
            </div>
          </Link>

          <Link to="/rh/exames" className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-lg transition-all cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Exames Pendentes</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats.examesPendentes}</p>
              </div>
              <AlertTriangle size={40} className="text-red-600/30" />
            </div>
          </Link>

          <Link to="/rh/folha-pagamento" className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-lg transition-all cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Custo de Mão de Obra</p>
                <p className="text-3xl font-bold text-green-600 mt-2">R$ {(stats.custoMaoObra / 1000000).toFixed(1)}M</p>
              </div>
              <DollarSign size={40} className="text-green-600/30" />
            </div>
          </Link>
        </div>

        {/* Alertas Críticos e Movimentações Recentes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Alertas Críticos */}
          <div id="alertas-criticos">
            <h2 className="text-2xl font-bold text-foreground mb-4">Alertas Críticos</h2>
            <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
              <div className="space-y-3">
                {alertas.map((alerta) => (
                  <Link
                    key={alerta.id}
                    to={alerta.link}
                    className={`p-4 rounded-lg border flex items-start gap-3 hover:bg-accent/50 transition-colors ${
                      alerta.severity === 'high'
                        ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
                        : 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800'
                    }`}
                  >
                    <AlertTriangle
                      size={18}
                      className={`flex-shrink-0 mt-0.5 ${
                        alerta.severity === 'high' ? 'text-red-600' : 'text-yellow-600'
                      }`}
                    />
                    <p className="text-sm text-foreground">{alerta.text}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Movimentações Recentes */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Movimentações Recentes</h2>
            <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
              <div className="relative pl-4">
                {movimentacoesRecentes.map((item, index) => {
                  const Icon = typeof item.icon === 'string' ? (IconMap[item.icon] || Circle) : item.icon;
                  return (
                    <div key={index} className="mb-6 flex items-start last:mb-0">
                      <div className="absolute -left-2 top-0 flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.color}`}>
                          <Icon size={16} />
                        </div>
                        {index < movimentacoesRecentes.length - 1 && (
                          <div className="h-full w-0.5 bg-border mt-2" />
                        )}
                      </div>
                      <div className="ml-8">
                        <p className="text-xs text-muted-foreground">{item.time}</p>
                        <p className="text-sm text-foreground font-medium">{item.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Distribuição da Mão de Obra e Recrutamento */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Distribuição da Mão de Obra */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Distribuição da Mão de Obra</h2>
            <div className="bg-card border border-border rounded-lg p-6 h-[300px] shadow-sm">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distribuicaoMaoObra} layout="vertical" margin={{ top: 20, right: 30, left: 120, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Mini Painel de Vagas */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Recrutamento</h2>
            <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <p className="text-muted-foreground text-sm">Vagas Abertas</p>
                  <p className="text-3xl font-bold text-primary mt-1">{vagasRecrutamento.abertas}</p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground text-sm">Candidatos</p>
                  <p className="text-3xl font-bold text-primary mt-1">{vagasRecrutamento.candidatos}</p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground text-sm">Entrevistas</p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">{vagasRecrutamento.entrevistasAgendadas}</p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground text-sm">Contratações</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">{vagasRecrutamento.contratacoesPrevistas}</p>
                </div>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-3">Kanban Resumido</h3>
              <div className="grid grid-cols-4 gap-3">
                {vagasRecrutamento.kanban.map((stage, idx) => (
                  <div key={idx} className="bg-accent p-3 rounded-lg text-center shadow-inner">
                    <p className="text-xs text-muted-foreground">{stage.status}</p>
                    <p className="text-xl font-bold text-foreground mt-1">{stage.count}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Controle de Documentação e Treinamentos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Documentação */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Controle de Documentação</h2>
            <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
              <div className="space-y-4">
                {statusDocumentacao.map((doc, idx) => {
                  const Icon = typeof doc.icon === 'string' ? (IconMap[doc.icon] || Circle) : doc.icon;
                  return (
                    <div key={idx} className="flex items-center justify-between p-2 hover:bg-accent/40 rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        <Icon size={20} style={{ color: doc.color }} />
                        <p className="text-foreground">{doc.name}</p>
                      </div>
                      <p className="text-foreground font-bold">{doc.value}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Treinamentos */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Status de Treinamentos</h2>
            <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-muted-foreground text-xs border-b border-border">
                    <th className="pb-3">Treinamento</th>
                    <th className="pb-3 text-center">Concluído</th>
                    <th className="pb-3 text-center">Pendente</th>
                  </tr>
                </thead>
                <tbody>
                  {treinamentosStatus.map((t, idx) => (
                    <tr key={idx} className="border-b border-border last:border-b-0 hover:bg-accent/20 transition-colors">
                      <td className="py-3 px-2 text-foreground font-medium">{t.treinamento}</td>
                      <td className="py-3 text-center text-green-600 font-medium">{t.concluido}%</td>
                      <td className="py-3 text-center text-red-600 font-medium">{t.pendente}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Férias e Afastamentos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Férias e Afastamentos (30 dias)</h2>
            <div className="bg-card border border-border rounded-lg p-6 space-y-3 shadow-sm">
              <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                <p className="flex items-center gap-2"><Calendar size={18} className="text-blue-500" /> Iniciam férias</p>
                <p className="font-bold">{feriasAfastamentos.iniciamFerias}</p>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                <p className="flex items-center gap-2"><Clock size={18} className="text-green-500" /> Retornam de férias</p>
                <p className="font-bold">{feriasAfastamentos.retornamFerias}</p>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                <p className="flex items-center gap-2"><ClipboardList size={18} className="text-orange-500" /> Afastamentos encerram</p>
                <p className="font-bold">{feriasAfastamentos.afastamentosEncerram}</p>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                <p className="flex items-center gap-2"><Plus size={18} className="text-purple-500" /> Novas licenças</p>
                <p className="font-bold">{feriasAfastamentos.novasLicencas}</p>
              </div>
            </div>
          </div>

          {/* Custos de Pessoas */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Custos de Pessoas</h2>
            <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-3 bg-muted/20 rounded-lg">
                  <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-tight">Folha</p>
                  <p className="text-lg font-bold text-foreground mt-1">R$ {(custosPessoas.folhaMes / 1000).toFixed(0)}k</p>
                </div>
                <div className="text-center p-3 bg-muted/20 rounded-lg">
                  <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-tight">Encargos</p>
                  <p className="text-lg font-bold text-foreground mt-1">R$ {(custosPessoas.encargos / 1000).toFixed(0)}k</p>
                </div>
                <div className="text-center p-3 bg-muted/20 rounded-lg">
                  <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-tight">Benefícios</p>
                  <p className="text-lg font-bold text-foreground mt-1">R$ {(custosPessoas.beneficios / 1000).toFixed(0)}k</p>
                </div>
                <div className="text-center p-3 bg-primary/10 border border-primary/20 rounded-lg">
                  <p className="text-primary text-[10px] uppercase font-bold tracking-tight">Total</p>
                  <p className="text-lg font-bold text-primary mt-1">R$ {(custosPessoas.total / 1000).toFixed(0)}k</p>
                </div>
              </div>
              <h3 className="text-sm font-bold text-foreground mb-3">Comparativo Mensal</h3>
              <div className="h-[100px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={custosPessoas.historico}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis hide />
                    <Tooltip formatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                    <Line type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Produtividade por Obra */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Produtividade por Obra</h2>
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-muted-foreground text-xs border-b border-border">
                  <th className="pb-3 px-2">Obra</th>
                  <th className="pb-3 text-center">Funcionários</th>
                  <th className="pb-3 text-center">Presença Hoje</th>
                </tr>
              </thead>
              <tbody>
                {produtividadeObra.map((obra, idx) => (
                  <tr key={idx} className="border-b border-border last:border-b-0 hover:bg-accent/20 transition-colors">
                    <td className="py-3 px-2 text-foreground font-medium">{obra.obra}</td>
                    <td className="py-3 text-center">{obra.funcionarios}</td>
                    <td className="py-3 text-center font-medium"><span className="text-green-600">{obra.presencaHoje}%</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Painel de Ações Rápidas Flutuante */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="group">
          <button className="flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all group-hover:rotate-45">
            <Plus size={24} />
          </button>
          <div className="absolute bottom-16 right-0 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col items-end space-y-2">
            {acoesRapidasButtons.map((acao, idx) => {
              const Icon = acao.icon;
              return (
                <Link
                  key={idx}
                  to={acao.action}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg shadow-md hover:bg-primary/90 transition-colors whitespace-nowrap text-xs font-medium"
                >
                  <Icon size={16} />
                  {acao.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

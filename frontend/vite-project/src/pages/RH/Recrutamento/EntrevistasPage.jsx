import React, { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare, Plus, Filter, Search, X,
  AlertTriangle, Pencil, Trash2, Calendar, Clock,
  Link as LinkIcon, MapPin, User, Star, Award, CheckCircle, Video
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import API_BASE_URL from '../../../config/api.js';
import { StatusBadge } from '../../../components/RH/rhUi.jsx';
import RHRecrutamentoNav from '../../../components/RH/RHRecrutamentoNav.jsx';

const TIPO_OPCOES = [
  { id: 'ONLINE', label: 'Online / Videoconferência' },
  { id: 'PRESENCIAL', label: 'Presencial (Escritório ou Obra)' },
  { id: 'TECNICA', label: 'Entrevista Técnica' },
  { id: 'RH', label: 'Entrevista de Comportamento / RH' },
];

const STATUS_OPCOES = [
  { id: 'TODOS', label: 'Todos os status' },
  { id: 'AGENDADA', label: 'Agendada' },
  { id: 'REALIZADA', label: 'Realizada' },
  { id: 'CANCELADA', label: 'Cancelada' },
  { id: 'NO_SHOW', label: 'Não Compareceu (No-Show)' },
];

export default function EntrevistasPage() {
  const { apiFetch } = useAuth();

  // --- Estados ---
  const [entrevistas, setEntrevistas] = useState([]);
  const [candidatos, setCandidatos] = useState([]);
  const [vagas, setVagas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFiltros, setShowFiltros] = useState(false);
  const [filtros, setFiltros] = useState({
    status: 'TODOS',
    data_inicio: '',
    data_fim: '',
  });

  // --- Modais ---
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedEntrevista, setSelectedEntrevista] = useState(null);

  // --- Form Criar/Editar ---
  const [formData, setFormData] = useState({
    id_candidato: '',
    id_vaga: '',
    entrevistador: '',
    tipo: 'ONLINE',
    status: 'AGENDADA',
    data_hora: '',
    duracao_minutos: '60',
    local_ou_link: '',
  });

  // --- Form Feedback ---
  const [feedbackData, setFeedbackData] = useState({
    status: 'REALIZADA',
    feedback: '',
    nota: 0,
  });

  // --- Carregar Candidatos e Vagas ---
  const carregarApoio = useCallback(async () => {
    try {
      const [resCands, resVagas] = await Promise.all([
        apiFetch(`${API_BASE_URL}/api/rh/candidatos?limit=100`),
        apiFetch(`${API_BASE_URL}/api/rh/vagas?limit=100`)
      ]);
      
      if (resCands.ok) {
        const cData = await resCands.json();
        setCandidatos(cData.data || []);
      }
      if (resVagas.ok) {
        const vData = await resVagas.json();
        setVagas(vData.data || []);
      }
    } catch (err) {
      console.error('Erro ao carregar dados de apoio para entrevistas:', err);
    }
  }, [apiFetch]);

  // --- Carregar Entrevistas ---
  const carregarEntrevistas = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: '1',
        limit: '100',
        busca: searchTerm,
        status: filtros.status,
      });
      if (filtros.data_inicio) params.set('data_inicio', filtros.data_inicio);
      if (filtros.data_fim) params.set('data_fim', filtros.data_fim);

      const res = await apiFetch(`${API_BASE_URL}/api/rh/entrevistas?${params}`);
      if (!res.ok) throw new Error('Erro ao carregar entrevistas');
      const data = await res.json();
      setEntrevistas(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [apiFetch, searchTerm, filtros]);

  useEffect(() => {
    carregarApoio();
  }, [carregarApoio]);

  useEffect(() => {
    const t = setTimeout(carregarEntrevistas, 300);
    return () => clearTimeout(t);
  }, [carregarEntrevistas]);

  // --- Handlers ---
  const handleOpenCreateModal = () => {
    setSelectedEntrevista(null);
    setFormData({
      id_candidato: candidatos[0]?.id_candidato ? String(candidatos[0].id_candidato) : '',
      id_vaga: '',
      entrevistador: '',
      tipo: 'ONLINE',
      status: 'AGENDADA',
      data_hora: '',
      duracao_minutos: '60',
      local_ou_link: '',
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (entr, e) => {
    e.stopPropagation();
    setSelectedEntrevista(entr);
    
    // Formatar data para datetime-local input (YYYY-MM-DDTHH:MM)
    const d = new Date(entr.data_hora);
    const tzoffset = d.getTimezoneOffset() * 60000; 
    const localISOTime = (new Date(d.getTime() - tzoffset)).toISOString().slice(0, 16);

    setFormData({
      id_candidato: String(entr.id_candidato),
      id_vaga: entr.id_vaga ? String(entr.id_vaga) : '',
      entrevistador: entr.entrevistador || '',
      tipo: entr.tipo || 'ONLINE',
      status: entr.status || 'AGENDADA',
      data_hora: localISOTime,
      duracao_minutos: String(entr.duracao_minutos || 60),
      local_ou_link: entr.local_ou_link || '',
    });
    setShowModal(true);
  };

  const handleOpenFeedbackModal = (entr, e) => {
    e.stopPropagation();
    setSelectedEntrevista(entr);
    setFeedbackData({
      status: entr.status === 'AGENDADA' ? 'REALIZADA' : entr.status,
      feedback: entr.feedback || '',
      nota: entr.nota || 0,
    });
    setShowFeedbackModal(true);
  };

  const handleOpenDeleteModal = (entr, e) => {
    e.stopPropagation();
    setSelectedEntrevista(entr);
    setShowDeleteModal(true);
  };

  const handleSaveEntrevista = async (e) => {
    e.preventDefault();
    if (!formData.id_candidato || !formData.data_hora) return;

    try {
      const isEdit = !!selectedEntrevista;
      const url = isEdit
        ? `${API_BASE_URL}/api/rh/entrevistas/${selectedEntrevista.id_entrevista}`
        : `${API_BASE_URL}/api/rh/entrevistas`;
      const method = isEdit ? 'PUT' : 'POST';

      const bodyData = {
        ...formData,
        id_candidato: Number(formData.id_candidato),
        id_vaga: formData.id_vaga ? Number(formData.id_vaga) : null,
        duracao_minutos: Number(formData.duracao_minutos),
      };

      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.erro || 'Erro ao agendar entrevista');
      }

      setShowModal(false);
      carregarEntrevistas();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaveFeedback = async (e) => {
    e.preventDefault();
    if (!selectedEntrevista) return;

    try {
      const res = await apiFetch(`${API_BASE_URL}/api/rh/entrevistas/${selectedEntrevista.id_entrevista}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackData),
      });

      if (!res.ok) throw new Error('Erro ao salvar parecer técnico');
      
      // Se a entrevista foi aprovada, e quisermos atualizar o status do candidato para APROVADO ou manter ENTREVISTA
      // isso pode ser feito manualmente pelo recrutador na tela de Candidatos.
      
      setShowFeedbackModal(false);
      carregarEntrevistas();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteEntrevista = async () => {
    if (!selectedEntrevista) return;
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/rh/entrevistas/${selectedEntrevista.id_entrevista}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Erro ao remover entrevista');
      setShowDeleteModal(false);
      carregarEntrevistas();
    } catch (err) {
      alert(err.message);
    }
  };

  // --- Estatísticas ---
  const total = entrevistas.length;
  const agendadas = entrevistas.filter(e => e.status === 'AGENDADA').length;
  const realizadas = entrevistas.filter(e => e.status === 'REALIZADA').length;
  const noShow = entrevistas.filter(e => e.status === 'NO_SHOW').length;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <RHRecrutamentoNav />

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 mt-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
            <MessageSquare size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Agenda de Entrevistas</h1>
            <p className="text-sm text-muted-foreground">Planejamento de reuniões técnicas/comportamentais, registro de notas e feedback de avaliação.</p>
          </div>
        </div>
        <button
          onClick={handleOpenCreateModal}
          disabled={candidatos.length === 0}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition text-sm font-semibold shadow-sm shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          title={candidatos.length === 0 ? 'Cadastre candidatos antes de agendar' : ''}
        >
          <Plus size={16} /> Agendar Reunião
        </button>
      </div>

      {/* Grid de Estatísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Geral', value: total, color: 'border-border' },
          { label: 'Agendadas', value: agendadas, color: 'border-blue-500/30 bg-blue-500/5 text-blue-600 dark:text-blue-400' },
          { label: 'Realizadas', value: realizadas, color: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400' },
          { label: 'Faltaram (No-Show)', value: noShow, color: 'border-orange-500/30 bg-orange-500/5 text-orange-600 dark:text-orange-400' }
        ].map((stat, idx) => (
          <div key={idx} className={`rounded-xl border p-4 shadow-sm ${stat.color}`}>
            <span className="text-xs font-semibold text-muted-foreground block mb-1">{stat.label}</span>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por entrevistador, candidato ou cargo da vaga..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFiltros(!showFiltros)}
            className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm transition shadow-sm ${
              showFiltros || filtros.status !== 'TODOS' || filtros.data_inicio || filtros.data_fim
                ? 'bg-primary/10 border-primary text-primary font-medium'
                : 'bg-card border-border text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            <Filter size={14} /> Filtros
          </button>
        </div>
      </div>

      {/* Painel de Filtros */}
      {showFiltros && (
        <div className="mb-6 p-4 bg-card border border-border rounded-xl shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in duration-200">
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Status da Reunião</label>
            <select
              value={filtros.status}
              onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
              className="w-full mt-1.5 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {STATUS_OPCOES.map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Data Inicial</label>
            <input
              type="date"
              value={filtros.data_inicio}
              onChange={(e) => setFiltros({ ...filtros, data_inicio: e.target.value })}
              className="w-full mt-1.5 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Data Final</label>
            <input
              type="date"
              value={filtros.data_fim}
              onChange={(e) => setFiltros({ ...filtros, data_fim: e.target.value })}
              className="w-full mt-1.5 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      )}

      {/* Lista de Reuniões */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="bg-card border border-border rounded-xl p-5 shadow-sm animate-pulse h-24"></div>
          ))}
        </div>
      ) : entrevistas.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <Calendar size={40} className="mx-auto text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-base font-semibold text-foreground mb-1">Nenhuma entrevista agendada</h3>
          <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto">
            Não existem agendamentos para o período ou filtros selecionados.
          </p>
          <button
            onClick={handleOpenCreateModal}
            disabled={candidatos.length === 0}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition shadow-sm disabled:opacity-50"
          >
            <Plus size={16} /> Agendar Primeira Entrevista
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {entrevistas.map((entr) => {
            const dt = new Date(entr.data_hora);
            return (
              <div
                key={entr.id_entrevista}
                className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition duration-200"
              >
                <div className="flex items-start gap-4">
                  {/* Bloco Data */}
                  <div className="bg-primary/5 text-primary rounded-xl p-3 flex flex-col items-center justify-center shrink-0 border border-primary/10 w-16 text-center">
                    <span className="text-[10px] font-bold uppercase">{dt.toLocaleString('pt-BR', { month: 'short' })}</span>
                    <span className="text-xl font-extrabold tracking-tight">{dt.getDate()}</span>
                    <span className="text-[9px] font-mono mt-0.5">{dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  {/* Informações */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-foreground">
                        {entr.tb_candidato?.nome || 'Candidato Desconhecido'}
                      </h3>
                      <StatusBadge status={entr.status} />
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      {entr.tb_vaga && (
                        <span className="flex items-center gap-1 font-medium text-foreground/80">
                          <Award size={13} className="text-primary/70" /> Vaga: {entr.tb_vaga.titulo}
                        </span>
                      )}
                      {entr.entrevistador && (
                        <span className="flex items-center gap-1">
                          <User size={13} /> Entrevistador: {entr.entrevistador}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock size={13} /> {entr.duracao_minutos} min
                      </span>
                    </div>

                    {/* Endereço / Link */}
                    {entr.local_ou_link && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1.5">
                        {entr.tipo === 'ONLINE' ? (
                          <>
                            <Video size={13} className="text-blue-500 shrink-0" />
                            <a
                              href={entr.local_ou_link.startsWith('http') ? entr.local_ou_link : `https://${entr.local_ou_link}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary hover:underline font-medium truncate max-w-xs"
                            >
                              Acessar videoconferência
                            </a>
                          </>
                        ) : (
                          <>
                            <MapPin size={13} className="text-orange-500 shrink-0" />
                            <span className="truncate max-w-xs">{entr.local_ou_link}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Score & Ações */}
                <div className="flex flex-row md:flex-col items-end gap-3 justify-between md:justify-center border-t md:border-t-0 border-border/50 pt-3 md:pt-0">
                  {entr.status === 'REALIZADA' && (
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={14}
                          className={s <= (entr.nota || 0) ? 'text-amber-500 fill-amber-500' : 'text-muted/60'}
                        />
                      ))}
                      {entr.feedback && (
                        <button
                          onClick={() => alert(`Parecer Técnico:\n\n"${entr.feedback}"`)}
                          className="text-xs text-primary hover:underline font-semibold ml-2"
                        >
                          Ver Parecer
                        </button>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-1 ml-auto">
                    {entr.status === 'AGENDADA' && (
                      <button
                        onClick={(e) => handleOpenFeedbackModal(entr, e)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-semibold transition"
                      >
                        <CheckCircle size={13} /> Avaliar
                      </button>
                    )}
                    {entr.status === 'REALIZADA' && (
                      <button
                        onClick={(e) => handleOpenFeedbackModal(entr, e)}
                        className="p-2 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition"
                        title="Editar Parecer"
                      >
                        <MessageSquare size={14} />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleOpenEditModal(entr, e)}
                      className="p-2 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition"
                      title="Editar agendamento"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={(e) => handleOpenDeleteModal(entr, e)}
                      className="p-2 hover:bg-red-500/10 rounded-lg text-muted-foreground hover:text-red-500 transition"
                      title="Remover"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Criar / Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-card rounded-xl max-w-lg w-full p-6 border border-border shadow-2xl animate-in scale-in duration-200 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  {selectedEntrevista ? 'Editar Agendamento' : 'Agendar Nova Entrevista'}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">Informe os detalhes da reunião e participantes</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEntrevista} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Candidato *</label>
                <select
                  required
                  value={formData.id_candidato}
                  onChange={(e) => setFormData({ ...formData, id_candidato: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="" disabled>Selecione o candidato</option>
                  {candidatos.map((c) => (
                    <option key={c.id_candidato} value={c.id_candidato}>{c.nome} ({c.email || 'sem e-mail'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Vaga Relacionada</label>
                <select
                  value={formData.id_vaga}
                  onChange={(e) => setFormData({ ...formData, id_vaga: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Selecione a vaga (opcional)</option>
                  {vagas.map((v) => (
                    <option key={v.id_vaga} value={v.id_vaga}>{v.titulo}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Entrevistador / Responsável</label>
                  <input
                    type="text"
                    placeholder="Ex: Engenheiro Carlos, RH Juliana"
                    value={formData.entrevistador}
                    onChange={(e) => setFormData({ ...formData, entrevistador: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Tipo de Reunião</label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {TIPO_OPCOES.map((opt) => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Data & Hora *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.data_hora}
                    onChange={(e) => setFormData({ ...formData, data_hora: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Duração (Minutos)</label>
                  <input
                    type="number"
                    value={formData.duracao_minutos}
                    onChange={(e) => setFormData({ ...formData, duracao_minutos: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Link da Reunião (Online) ou Endereço (Presencial)</label>
                <input
                  type="text"
                  placeholder="Ex: meet.google.com/abc-def-ghi ou Auditório da Obra X"
                  value={formData.local_ou_link}
                  onChange={(e) => setFormData({ ...formData, local_ou_link: e.target.value })}
                  className="w-full px-3.5 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {selectedEntrevista && (
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Status do Agendamento</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="AGENDADA">Agendada</option>
                    <option value="REALIZADA">Realizada</option>
                    <option value="CANCELADA">Cancelada</option>
                    <option value="NO_SHOW">Não compareceu (No-show)</option>
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-border mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:bg-accent transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition shadow-sm"
                >
                  {selectedEntrevista ? 'Salvar Alterações' : 'Agendar Reunião'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Feedback (Conduzir Avaliação) */}
      {showFeedbackModal && selectedEntrevista && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-card rounded-xl max-w-md w-full p-6 border border-border shadow-2xl animate-in scale-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">Parecer da Entrevista</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Registre a avaliação final do candidato</p>
              </div>
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveFeedback} className="space-y-4">
              <div className="p-3 bg-muted/40 border border-border rounded-lg text-xs space-y-1.5">
                <p><span className="font-bold text-muted-foreground">Candidato:</span> <span className="font-semibold text-foreground">{selectedEntrevista.tb_candidato?.nome}</span></p>
                {selectedEntrevista.tb_vaga && <p><span className="font-bold text-muted-foreground">Vaga:</span> <span className="font-semibold text-foreground">{selectedEntrevista.tb_vaga.titulo}</span></p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Resultado da Entrevista</label>
                <select
                  value={feedbackData.status}
                  onChange={(e) => setFeedbackData({ ...feedbackData, status: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="REALIZADA">Realizada com Sucesso</option>
                  <option value="CANCELADA">Cancelada</option>
                  <option value="NO_SHOW">Candidato Não Compareceu (No-Show)</option>
                </select>
              </div>

              {feedbackData.status === 'REALIZADA' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Avaliação Técnica / Comportamental</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFeedbackData({ ...feedbackData, nota: star })}
                          className="p-1 hover:scale-110 transition"
                        >
                          <Star
                            size={24}
                            className={
                              star <= feedbackData.nota
                                ? 'text-amber-500 fill-amber-500'
                                : 'text-muted-foreground/45 hover:text-amber-500'
                            }
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-foreground/80 ml-2">
                        {feedbackData.nota > 0 ? `${feedbackData.nota} / 5` : 'Sem nota'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Parecer Técnico (Feedback)</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Candidato respondeu bem às perguntas de leitura de projetos, demonstrou boa liderança no canteiro. Recomendado para a etapa de contratação."
                      value={feedbackData.feedback}
                      onChange={(e) => setFeedbackData({ ...feedbackData, feedback: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-2 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:bg-accent transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition shadow-sm"
                >
                  Registrar Avaliação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Deletar */}
      {showDeleteModal && selectedEntrevista && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-card rounded-xl max-w-sm w-full p-5 border border-border shadow-2xl animate-in scale-in duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10 shrink-0">
                <AlertTriangle size={18} className="text-destructive" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">Confirmar Exclusão</h2>
                <p className="text-xs text-muted-foreground">Esta ação não pode ser revertida</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Tem certeza que deseja cancelar e excluir o agendamento da reunião com <strong className="text-foreground">"{selectedEntrevista.tb_candidato?.nome}"</strong>?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:bg-accent transition"
              >
                Voltar
              </button>
              <button
                onClick={handleDeleteEntrevista}
                className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-semibold hover:bg-destructive/90 transition shadow-sm"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

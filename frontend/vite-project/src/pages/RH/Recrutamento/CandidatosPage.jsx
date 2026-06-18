import React, { useState, useEffect, useCallback } from 'react';
import {
  UserCheck, Plus, Filter, Search, X,
  AlertTriangle, Pencil, Trash2, Calendar,
  Mail, Phone, FileText, Briefcase, Award, ArrowRight, CheckCircle
} from 'lucide-react';
import { FaLinkedin } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import API_BASE_URL from '../../../config/api.js';
import { StatusBadge } from '../../../components/RH/rhUi.jsx';
import RHRecrutamentoNav from '../../../components/RH/RHRecrutamentoNav.jsx';

const STATUS_OPCOES = [
  { id: 'TODOS', label: 'Todos os status' },
  { id: 'NOVO', label: 'Novo' },
  { id: 'EM_ANALISE', label: 'Em Análise' },
  { id: 'ENTREVISTA', label: 'Entrevista' },
  { id: 'APROVADO', label: 'Aprovado' },
  { id: 'REPROVADO', label: 'Reprovado' },
  { id: 'DESISTIU', label: 'Desistiu' },
];

const FONTE_OPCOES = [
  { id: 'LINKEDIN', label: 'LinkedIn' },
  { id: 'INDICACAO', label: 'Indicação' },
  { id: 'SITE', label: 'Site / Trabalhe Conosco' },
  { id: 'WALK_IN', label: 'Entrega Presencial' },
  { id: 'OUTRO', label: 'Outro' },
];

const parseObservacoes = (obsText) => {
  const nrMatch = (obsText || '').match(/^\[NRs: ([^\]]+)\]\s*(.*)/s);
  let nrs = [];
  let cleanObs = obsText || '';
  if (nrMatch) {
    nrs = nrMatch[1].split(', ').map(n => n.trim());
    cleanObs = nrMatch[2];
  }
  const consentMatch = cleanObs.match(/^\[CONSENTIMENTO_LGPD\]\s*(.*)/s);
  let consent = false;
  if (consentMatch) {
    consent = true;
    cleanObs = consentMatch[1];
  }
  return { nrs, cleanObs, consent };
};

export default function CandidatosPage() {
  const { apiFetch } = useAuth();

  // --- Estados ---
  const [candidatos, setCandidatos] = useState([]);
  const [vagas, setVagas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFiltros, setShowFiltros] = useState(false);
  const [filtros, setFiltros] = useState({
    status: 'TODOS',
    id_vaga: '',
  });

  // --- Modais ---
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCandidato, setSelectedCandidato] = useState(null);
  const [detailsCandidato, setDetailsCandidato] = useState(null);

  // --- Form ---
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    linkedin_url: '',
    curriculo_url: '',
    fonte: 'OUTRO',
    status: 'NOVO',
    observacoes: '',
    id_vaga: '',
    nrs: [],
    consentimento: false,
  });

  // --- Carregar Vagas para preenchimento ---
  const carregarVagas = useCallback(async () => {
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/rh/vagas?limit=100`);
      if (res.ok) {
        const data = await res.json();
        setVagas(data.data || []);
      }
    } catch (err) {
      console.error('Erro ao carregar vagas:', err);
    }
  }, [apiFetch]);

  // --- Carregar Candidatos ---
  const carregarCandidatos = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: '1',
        limit: '100',
        busca: searchTerm,
        status: filtros.status,
      });
      if (filtros.id_vaga) {
        params.set('id_vaga', filtros.id_vaga);
      }

      const res = await apiFetch(`${API_BASE_URL}/api/rh/candidatos?${params}`);
      if (!res.ok) throw new Error('Erro ao carregar candidatos');
      const data = await res.json();
      setCandidatos(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [apiFetch, searchTerm, filtros]);

  useEffect(() => {
    carregarVagas();
  }, [carregarVagas]);

  useEffect(() => {
    const t = setTimeout(carregarCandidatos, 300);
    return () => clearTimeout(t);
  }, [carregarCandidatos]);

  // --- Handlers ---
  const handleOpenCreateModal = () => {
    setSelectedCandidato(null);
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      cpf: '',
      linkedin_url: '',
      curriculo_url: '',
      fonte: 'OUTRO',
      status: 'NOVO',
      observacoes: '',
      id_vaga: '',
      nrs: [],
      consentimento: false,
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (cand, e) => {
    e.stopPropagation();
    setSelectedCandidato(cand);
    const { nrs: parsedNrs, cleanObs, consent } = parseObservacoes(cand.observacoes);

    setFormData({
      nome: cand.nome || '',
      email: cand.email || '',
      telefone: cand.telefone || '',
      cpf: cand.cpf || '',
      linkedin_url: cand.linkedin_url || '',
      curriculo_url: cand.curriculo_url || '',
      fonte: cand.fonte || 'OUTRO',
      status: cand.status || 'NOVO',
      observacoes: cleanObs,
      id_vaga: cand.id_vaga ? String(cand.id_vaga) : '',
      nrs: parsedNrs,
      consentimento: consent,
    });
    setShowModal(true);
  };

  const handleOpenDeleteModal = (cand, e) => {
    e.stopPropagation();
    setSelectedCandidato(cand);
    setShowDeleteModal(true);
  };

  const handleSaveCandidato = async (e) => {
    e.preventDefault();
    if (!formData.nome.trim()) return;

    try {
      const isEdit = !!selectedCandidato;
      const url = isEdit
        ? `${API_BASE_URL}/api/rh/candidatos/${selectedCandidato.id_candidato}`
        : `${API_BASE_URL}/api/rh/candidatos`;
      const method = isEdit ? 'PUT' : 'POST';

      let finalObs = '';
      if (formData.nrs && formData.nrs.length > 0) {
        finalObs += `[NRs: ${formData.nrs.join(', ')}] `;
      }
      if (formData.consentimento) {
        finalObs += `[CONSENTIMENTO_LGPD] `;
      }
      finalObs += formData.observacoes.trim();

      const bodyData = {
        ...formData,
        observacoes: finalObs,
        id_vaga: formData.id_vaga ? Number(formData.id_vaga) : null,
      };
      delete bodyData.nrs;
      delete bodyData.consentimento;

      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.erro || 'Erro ao salvar candidato');
      }

      setShowModal(false);
      carregarCandidatos();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteCandidato = async () => {
    if (!selectedCandidato) return;
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/rh/candidatos/${selectedCandidato.id_candidato}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.erro || 'Erro ao excluir candidato');
      }

      setShowDeleteModal(false);
      carregarCandidatos();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAvancarStatus = async (cand, e) => {
    e.stopPropagation();
    const pipeline = ['NOVO', 'EM_ANALISE', 'ENTREVISTA', 'APROVADO'];
    const idx = pipeline.indexOf(cand.status);
    if (idx !== -1 && idx < pipeline.length - 1) {
      const nextStatus = pipeline[idx + 1];
      try {
        const res = await apiFetch(`${API_BASE_URL}/api/rh/candidatos/${cand.id_candidato}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: nextStatus }),
        });
        if (!res.ok) throw new Error('Erro ao atualizar status');
        carregarCandidatos();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  // --- Estatísticas ---
  const total = candidatos.length;
  const novos = candidatos.filter(c => c.status === 'NOVO').length;
  const emAnalise = candidatos.filter(c => c.status === 'EM_ANALISE').length;
  const entrevista = candidatos.filter(c => c.status === 'ENTREVISTA').length;
  const aprovados = candidatos.filter(c => c.status === 'APROVADO').length;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <RHRecrutamentoNav />

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 mt-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
            <UserCheck size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Gestão de Candidatos</h1>
            <p className="text-sm text-muted-foreground">Triagem, movimentação de etapas de contratação e histórico do processo de recrutamento.</p>
          </div>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition text-sm font-semibold shadow-sm shrink-0"
        >
          <Plus size={16} /> Novo Candidato
        </button>
      </div>

      {/* Grid de Estatísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Total Geral', value: total, color: 'border-border' },
          { label: 'Novos', value: novos, color: 'border-blue-500/30 bg-blue-500/5 text-blue-600 dark:text-blue-400' },
          { label: 'Em Análise', value: emAnalise, color: 'border-amber-500/30 bg-amber-500/5 text-amber-600 dark:text-amber-400' },
          { label: 'Entrevista', value: entrevista, color: 'border-purple-500/30 bg-purple-500/5 text-purple-600 dark:text-purple-400' },
          { label: 'Aprovados', value: aprovados, color: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400' }
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
            placeholder="Buscar por nome, e-mail, telefone ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFiltros(!showFiltros)}
            className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm transition shadow-sm ${
              showFiltros || filtros.status !== 'TODOS' || filtros.id_vaga
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
        <div className="mb-6 p-4 bg-card border border-border rounded-xl shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-200">
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Status do Processo</label>
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
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Vaga Alocada</label>
            <select
              value={filtros.id_vaga}
              onChange={(e) => setFiltros({ ...filtros, id_vaga: e.target.value })}
              className="w-full mt-1.5 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Todas as Vagas</option>
              {vagas.map((vaga) => (
                <option key={vaga.id_vaga} value={vaga.id_vaga}>{vaga.titulo}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Lista de Candidatos */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-card border border-border rounded-xl p-4 shadow-sm animate-pulse flex items-center justify-between">
              <div className="space-y-2 w-1/3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
              <div className="h-6 bg-muted rounded-full w-20"></div>
            </div>
          ))}
        </div>
      ) : candidatos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <UserCheck size={40} className="mx-auto text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-base font-semibold text-foreground mb-1">Nenhum candidato encontrado</h3>
          <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto">
            Não há candidatos cadastrados correspondentes a esta busca ou filtros ativos.
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition shadow-sm"
          >
            <Plus size={16} /> Cadastrar Candidato
          </button>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/40 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Nome / Contato</th>
                  <th className="px-6 py-4">Vaga Vinculada</th>
                  <th className="px-6 py-4">Origem</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {candidatos.map((cand) => {
                  const { nrs: candNrs } = parseObservacoes(cand.observacoes);
                  return (
                    <tr
                      key={cand.id_candidato}
                      onClick={() => setDetailsCandidato(cand)}
                      className="hover:bg-accent/30 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground group-hover:text-primary transition-colors">{cand.nome}</span>
                          {candNrs.length > 0 && (
                            <div className="flex gap-0.5">
                              {candNrs.slice(0, 3).map(n => (
                                <span key={n} className="bg-primary/10 border border-primary/20 px-1 py-0.2 rounded text-[9px] font-bold text-primary">
                                  {n}
                                </span>
                              ))}
                              {candNrs.length > 3 && (
                                <span className="bg-muted px-1 py-0.2 rounded text-[9px] font-bold text-muted-foreground">
                                  +{candNrs.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                          {cand.email && (
                            <span className="flex items-center gap-1">
                              <Mail size={12} /> {cand.email}
                            </span>
                          )}
                          {cand.telefone && (
                            <span className="flex items-center gap-1">
                              <Phone size={12} /> {cand.telefone}
                            </span>
                          )}
                        </div>
                      </td>
                    <td className="px-6 py-4">
                      {cand.tb_vaga ? (
                        <div className="flex items-center gap-1.5 text-foreground">
                          <Briefcase size={14} className="text-primary/70 shrink-0" />
                          <span className="font-medium">{cand.tb_vaga.titulo}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">Sem vaga alocada</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-muted-foreground">
                      {cand.fonte || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={cand.status} />
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        {['NOVO', 'EM_ANALISE', 'ENTREVISTA'].includes(cand.status) && (
                          <button
                            onClick={(e) => handleAvancarStatus(cand, e)}
                            className="p-1.5 hover:bg-accent rounded-lg text-primary transition"
                            title="Avançar Etapa"
                          >
                            <ArrowRight size={14} />
                          </button>
                        )}
                        <button
                          onClick={(e) => handleOpenEditModal(cand, e)}
                          className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition"
                          title="Editar"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={(e) => handleOpenDeleteModal(cand, e)}
                          className="p-1.5 hover:bg-red-500/10 rounded-lg text-muted-foreground hover:text-red-500 transition"
                          title="Excluir"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Criar / Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-card rounded-xl max-w-lg w-full p-6 border border-border shadow-2xl animate-in scale-in duration-200 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  {selectedCandidato ? 'Editar Candidato' : 'Cadastrar Novo Candidato'}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">Registre informações e vincule ao processo de seleção</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCandidato} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João Silva de Souza"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-3.5 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">E-mail</label>
                  <input
                    type="email"
                    placeholder="joao.silva@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Telefone</label>
                  <input
                    type="text"
                    placeholder="Ex: (11) 99999-9999"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">CPF</label>
                  <input
                    type="text"
                    placeholder="Ex: 000.000.000-00"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Fonte / Origem</label>
                  <select
                    value={formData.fonte}
                    onChange={(e) => setFormData({ ...formData, fonte: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {FONTE_OPCOES.map((f) => (
                      <option key={f.id} value={f.id}>{f.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Vaga Alvo</label>
                  <select
                    value={formData.id_vaga}
                    onChange={(e) => setFormData({ ...formData, id_vaga: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Nenhuma Vaga (Candidato Geral)</option>
                    {vagas.map((vg) => (
                      <option key={vg.id_vaga} value={vg.id_vaga}>{vg.titulo}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Status do Processo</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="NOVO">Novo</option>
                    <option value="EM_ANALISE">Em Análise</option>
                    <option value="ENTREVISTA">Entrevista</option>
                    <option value="APROVADO">Aprovado</option>
                    <option value="REPROVADO">Reprovado</option>
                    <option value="DESISTIU">Desistiu</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Link do LinkedIn</label>
                <div className="relative">
                  <FaLinkedin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/perfil"
                    value={formData.linkedin_url}
                    onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                    className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Link / URL do Currículo</label>
                <div className="relative">
                  <FileText size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="url"
                    placeholder="https://exemplo.com/curriculo.pdf"
                    value={formData.curriculo_url}
                    onChange={(e) => setFormData({ ...formData, curriculo_url: e.target.value })}
                    className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Certificações NR Ativas (QHS)</label>
                <div className="grid grid-cols-3 gap-2 bg-muted/40 p-3 rounded-lg border border-border/50">
                  {['NR-10', 'NR-12', 'NR-18', 'NR-33', 'NR-35', 'ASO'].map((nr) => {
                    const checked = formData.nrs.includes(nr);
                    return (
                      <label key={nr} className="flex items-center gap-1.5 text-xs text-foreground cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            const newNrs = e.target.checked
                              ? [...formData.nrs, nr]
                              : formData.nrs.filter((n) => n !== nr);
                            setFormData({ ...formData, nrs: newNrs });
                          }}
                          className="rounded border-border text-primary focus:ring-primary/20 h-3.5 w-3.5"
                        />
                        <span>{nr}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Observações do Recrutador</label>
                <textarea
                  rows={2}
                  placeholder="Informações adicionais sobre o candidato..."
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 space-y-2">
                <label className="flex items-start gap-2 text-xs font-medium text-amber-800 dark:text-amber-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    required
                    checked={formData.consentimento}
                    onChange={(e) => setFormData({ ...formData, consentimento: e.target.checked })}
                    className="rounded border-amber-500/30 text-amber-600 focus:ring-amber-500/20 h-4 w-4 mt-0.5 shrink-0"
                  />
                  <span>
                    Confirmar consentimento do candidato para tratamento de dados pessoais conforme a LGPD e políticas de privacidade da empresa pelo período de até 2 anos.
                  </span>
                </label>
                <p className="text-[10px] text-muted-foreground leading-relaxed pl-6">
                  🔒 Conforme as regras do *Obra Integrada*, dados de candidatos inativos ou não contratados devem ser guardados por no máximo 2 anos para legítimo interesse trabalhista antes da sua eliminação ou anonimização.
                </p>
              </div>

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
                  {selectedCandidato ? 'Salvar Alterações' : 'Cadastrar Candidato'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Deletar */}
      {showDeleteModal && selectedCandidato && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-card rounded-xl max-w-sm w-full p-5 border border-border shadow-2xl animate-in scale-in duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10 shrink-0">
                <AlertTriangle size={18} className="text-destructive" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">Confirmar Exclusão</h2>
                <p className="text-xs text-muted-foreground">Esta ação apagará permanentemente o candidato</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Tem certeza que deseja excluir o candidato <strong className="text-foreground">"{selectedCandidato.nome}"</strong>? Todos os dados associados a este processo de recrutamento serão perdidos.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:bg-accent transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteCandidato}
                className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-semibold hover:bg-destructive/90 transition shadow-sm"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalhes / Processo */}
      {detailsCandidato && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-card rounded-xl max-w-md w-full p-6 border border-border shadow-2xl animate-in scale-in duration-200 overflow-y-auto max-h-[85vh]">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">{detailsCandidato.nome}</h2>
                <span className="text-xs text-muted-foreground mt-0.5 inline-block">
                  Origem: {detailsCandidato.fonte || 'Indefinida'}
                </span>
              </div>
              <button
                onClick={() => setDetailsCandidato(null)}
                className="p-1 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center p-3 bg-muted/40 border border-border rounded-lg">
                <div>
                  <span className="text-xs text-muted-foreground block">Etapa Atual</span>
                  <StatusBadge status={detailsCandidato.status} />
                </div>
                {detailsCandidato.tb_vaga && (
                  <div>
                    <span className="text-xs text-muted-foreground block">Vaga Alvo</span>
                    <span className="font-semibold text-foreground text-xs">{detailsCandidato.tb_vaga.titulo}</span>
                  </div>
                )}
              </div>

              {detailsCandidato.cpf && (
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">CPF</span>
                  <p className="font-medium text-foreground mt-0.5">{detailsCandidato.cpf}</p>
                </div>
              )}

              <div className="flex gap-4">
                {detailsCandidato.email && (
                  <div className="flex-1">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">E-mail</span>
                    <a href={`mailto:${detailsCandidato.email}`} className="text-primary hover:underline text-xs block truncate mt-0.5">
                      {detailsCandidato.email}
                    </a>
                  </div>
                )}
                {detailsCandidato.telefone && (
                  <div className="flex-1">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Telefone</span>
                    <a href={`tel:${detailsCandidato.telefone}`} className="text-foreground text-xs block font-medium mt-0.5">
                      {detailsCandidato.telefone}
                    </a>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-1">
                {detailsCandidato.linkedin_url && (
                  <a
                    href={detailsCandidato.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 border border-border bg-card rounded-lg text-xs font-semibold hover:bg-accent transition"
                  >
                    <FaLinkedin size={13} className="text-blue-500" /> LinkedIn
                  </a>
                )}
                {detailsCandidato.curriculo_url && (
                  <a
                    href={detailsCandidato.curriculo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 border border-border bg-card rounded-lg text-xs font-semibold hover:bg-accent transition"
                  >
                    <FileText size={13} className="text-emerald-500" /> Currículo
                  </a>
                )}
              </div>

              {(() => {
                const { nrs, cleanObs, consent } = parseObservacoes(detailsCandidato.observacoes);
                return (
                  <>
                    {nrs.length > 0 && (
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block mb-1">Certificações NR Validadas (QHS)</span>
                        <div className="flex flex-wrap gap-1">
                          {nrs.map(n => (
                            <span key={n} className="bg-primary/10 border border-primary/20 px-2 py-0.5 rounded text-xs font-bold text-primary">
                              {n}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Observações do Processo</span>
                      <p className="text-muted-foreground mt-1 leading-relaxed bg-muted/20 p-3 rounded-lg border border-border/50 text-xs whitespace-pre-line">
                        {cleanObs || 'Sem observações adicionais.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 p-2 bg-emerald-500/5 border border-emerald-500/10 rounded-lg text-emerald-700 dark:text-emerald-400 text-xs font-medium">
                      <CheckCircle size={14} className="shrink-0 text-emerald-500" />
                      <span>
                        {consent 
                          ? 'Consentimento LGPD confirmado para guarda de dados de recrutamento (2 anos).'
                          : 'Aviso: Confirme o consentimento LGPD deste candidato na edição do perfil.'}
                      </span>
                    </div>
                  </>
                );
              })()}

              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <button
                  onClick={() => setDetailsCandidato(null)}
                  className="px-4 py-2 bg-accent hover:bg-accent/80 rounded-lg text-xs font-semibold text-foreground transition"
                >
                  Fechar
                </button>
                <button
                  onClick={(e) => {
                    const c = detailsCandidato;
                    setDetailsCandidato(null);
                    handleOpenEditModal(c, e);
                  }}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:bg-primary/90 transition shadow-sm flex items-center gap-1"
                >
                  <Pencil size={12} /> Editar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

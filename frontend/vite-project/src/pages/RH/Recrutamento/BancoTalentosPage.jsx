import React, { useState, useEffect, useCallback } from 'react';
import {
  Award, Plus, Filter, Search, X,
  AlertTriangle, Pencil, Trash2, Calendar,
  Mail, Phone, FileText, Briefcase, DollarSign, Clock, Check, ToggleLeft, ToggleRight, CheckCircle
} from 'lucide-react';
import { FaLinkedin } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import API_BASE_URL from '../../../config/api.js';
import { StatusBadge } from '../../../components/RH/rhUi.jsx';
import RHRecrutamentoNav from '../../../components/RH/RHRecrutamentoNav.jsx';

const CONTRATO_OPCOES = [
  { id: 'TODOS', label: 'Todos os tipos' },
  { id: 'CLT', label: 'CLT' },
  { id: 'PJ', label: 'PJ / Contrato' },
  { id: 'TEMPORARIO', label: 'Temporário' },
  { id: 'DIARISTA', label: 'Diarista' },
];

const DISPONIBILIDADE_OPCOES = [
  { id: 'TODOS', label: 'Qualquer disponibilidade' },
  { id: 'IMEDIATA', label: 'Imediata' },
  { id: '15_DIAS', label: 'Aviso Prévio (15 dias)' },
  { id: '30_DIAS', label: 'Aviso Prévio (30 dias)' },
  { id: '60_DIAS', label: 'Acima de 60 dias' },
];

const ATIVO_OPCOES = [
  { id: 'TODOS', label: 'Ativos & Inativos' },
  { id: 'ATIVOS', label: 'Apenas Ativos' },
];

const LISTA_NRS = ['NR-10', 'NR-12', 'NR-18', 'NR-33', 'NR-35', 'ASO'];

const parseTalentoData = (talento) => {
  const skillsList = (talento.habilidades || '').split(',').map(s => s.trim()).filter(Boolean);
  const nrs = skillsList.filter(s => LISTA_NRS.map(n => n.toUpperCase()).includes(s.toUpperCase()));
  const cleanSkills = skillsList.filter(s => !LISTA_NRS.map(n => n.toUpperCase()).includes(s.toUpperCase())).join(', ');
  
  const obsText = talento.observacoes || '';
  const consentMatch = obsText.match(/^\[CONSENTIMENTO_LGPD\]\s*(.*)/s);
  let consent = false;
  let cleanObs = obsText;
  if (consentMatch) {
    consent = true;
    cleanObs = consentMatch[1];
  }
  return { nrs, cleanSkills, consent, cleanObs };
};

export default function BancoTalentosPage() {
  const { apiFetch } = useAuth();

  // --- Estados ---
  const [talentos, setTalentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFiltros, setShowFiltros] = useState(false);
  const [filtros, setFiltros] = useState({
    tipo_contrato: 'TODOS',
    disponibilidade: 'TODOS',
    ativo: 'ATIVOS',
  });

  // --- Modais ---
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTalento, setSelectedTalento] = useState(null);
  const [detailsTalento, setDetailsTalento] = useState(null);

  // --- Form ---
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    linkedin_url: '',
    curriculo_url: '',
    cargo_desejado: '',
    tipo_contrato: 'CLT',
    pretensao_salarial: '',
    disponibilidade: 'IMEDIATA',
    habilidades: '',
    observacoes: '',
    ativo: true,
    nrs: [],
    consentimento: false,
  });

  // --- Carregar Talentos ---
  const carregarTalentos = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: '1',
        limit: '100',
        busca: searchTerm,
        tipo_contrato: filtros.tipo_contrato,
        disponibilidade: filtros.disponibilidade,
        ativo: filtros.ativo,
      });

      const res = await apiFetch(`${API_BASE_URL}/api/rh/talentos?${params}`);
      if (!res.ok) throw new Error('Erro ao carregar talentos');
      const data = await res.json();
      setTalentos(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [apiFetch, searchTerm, filtros]);

  useEffect(() => {
    const t = setTimeout(carregarTalentos, 300);
    return () => clearTimeout(t);
  }, [carregarTalentos]);

  // --- Handlers ---
  const handleOpenCreateModal = () => {
    setSelectedTalento(null);
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      cpf: '',
      linkedin_url: '',
      curriculo_url: '',
      cargo_desejado: '',
      tipo_contrato: 'CLT',
      pretensao_salarial: '',
      disponibilidade: 'IMEDIATA',
      habilidades: '',
      observacoes: '',
      ativo: true,
      nrs: [],
      consentimento: false,
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (talento, e) => {
    e.stopPropagation();
    setSelectedTalento(talento);
    const { nrs: parsedNrs, cleanSkills, consent, cleanObs } = parseTalentoData(talento);
    setFormData({
      nome: talento.nome || '',
      email: talento.email || '',
      telefone: talento.telefone || '',
      cpf: talento.cpf || '',
      linkedin_url: talento.linkedin_url || '',
      curriculo_url: talento.curriculo_url || '',
      cargo_desejado: talento.cargo_desejado || '',
      tipo_contrato: talento.tipo_contrato || 'CLT',
      pretensao_salarial: talento.pretensao_salarial ? String(talento.pretensao_salarial) : '',
      disponibilidade: talento.disponibilidade || 'IMEDIATA',
      habilidades: cleanSkills,
      observacoes: cleanObs,
      ativo: talento.ativo !== undefined ? talento.ativo : true,
      nrs: parsedNrs,
      consentimento: consent,
    });
    setShowModal(true);
  };

  const handleOpenDeleteModal = (talento, e) => {
    e.stopPropagation();
    setSelectedTalento(talento);
    setShowDeleteModal(true);
  };

  const handleSaveTalento = async (e) => {
    e.preventDefault();
    if (!formData.nome.trim()) return;

    try {
      const isEdit = !!selectedTalento;
      const url = isEdit
        ? `${API_BASE_URL}/api/rh/talentos/${selectedTalento.id_talento}`
        : `${API_BASE_URL}/api/rh/talentos`;
      const method = isEdit ? 'PUT' : 'POST';

      let combinedSkills = [];
      if (formData.nrs && formData.nrs.length > 0) {
        combinedSkills = [...formData.nrs];
      }
      if (formData.habilidades.trim()) {
        combinedSkills = [...combinedSkills, ...formData.habilidades.split(',').map(s => s.trim()).filter(Boolean)];
      }

      let finalObs = '';
      if (formData.consentimento) {
        finalObs += `[CONSENTIMENTO_LGPD] `;
      }
      finalObs += formData.observacoes.trim();

      const bodyData = {
        ...formData,
        habilidades: combinedSkills.join(', '),
        observacoes: finalObs,
        pretensao_salarial: formData.pretensao_salarial ? Number(formData.pretensao_salarial) : null,
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
        throw new Error(err.erro || 'Erro ao salvar perfil');
      }

      setShowModal(false);
      carregarTalentos();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteTalento = async () => {
    if (!selectedTalento) return;
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/rh/talentos/${selectedTalento.id_talento}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.erro || 'Erro ao excluir perfil');
      }

      setShowDeleteModal(false);
      carregarTalentos();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleAtivo = async (talento, e) => {
    e.stopPropagation();
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/rh/talentos/${talento.id_talento}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo: !talento.ativo }),
      });
      if (!res.ok) throw new Error('Erro ao alterar atividade do talento');
      carregarTalentos();
    } catch (err) {
      alert(err.message);
    }
  };

  // --- Estatísticas ---
  const total = talentos.length;
  const ativos = talentos.filter(t => t.ativo).length;
  const imediata = talentos.filter(t => t.disponibilidade === 'IMEDIATA').length;
  const clt = talentos.filter(t => t.tipo_contrato === 'CLT').length;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <RHRecrutamentoNav />

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 mt-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
            <Award size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Banco de Talentos</h1>
            <p className="text-sm text-muted-foreground">Catálogo de profissionais interessados, mapeamento de habilidades e contatos para futuras contratações.</p>
          </div>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition text-sm font-semibold shadow-sm shrink-0"
        >
          <Plus size={16} /> Cadastrar Talento
        </button>
      </div>

      {/* Grid de Estatísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total de Talentos', value: total, color: 'border-border' },
          { label: 'Ativos', value: ativos, color: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400' },
          { label: 'Disponibilidade Imediata', value: imediata, color: 'border-blue-500/30 bg-blue-500/5 text-blue-600 dark:text-blue-400' },
          { label: 'Preferem CLT', value: clt, color: 'border-purple-500/30 bg-purple-500/5 text-purple-600 dark:text-purple-400' }
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
            placeholder="Buscar por nome, e-mail, telefone ou habilidades..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFiltros(!showFiltros)}
            className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm transition shadow-sm ${
              showFiltros || filtros.tipo_contrato !== 'TODOS' || filtros.disponibilidade !== 'TODOS' || filtros.ativo !== 'ATIVOS'
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
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Preferência Contratual</label>
            <select
              value={filtros.tipo_contrato}
              onChange={(e) => setFiltros({ ...filtros, tipo_contrato: e.target.value })}
              className="w-full mt-1.5 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {CONTRATO_OPCOES.map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Disponibilidade</label>
            <select
              value={filtros.disponibilidade}
              onChange={(e) => setFiltros({ ...filtros, disponibilidade: e.target.value })}
              className="w-full mt-1.5 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {DISPONIBILIDADE_OPCOES.map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Exibição</label>
            <select
              value={filtros.ativo}
              onChange={(e) => setFiltros({ ...filtros, ativo: e.target.value })}
              className="w-full mt-1.5 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {ATIVO_OPCOES.map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Grid de Cards dos Talentos */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-card border border-border rounded-xl p-5 shadow-sm animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-2/3"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
              <div className="h-10 bg-muted rounded"></div>
            </div>
          ))}
        </div>
      ) : talentos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <Award size={40} className="mx-auto text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-base font-semibold text-foreground mb-1">Nenhum talento encontrado</h3>
          <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto">
            Não há cadastros que correspondam aos filtros de contratação ou termos buscados.
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition shadow-sm"
          >
            <Plus size={16} /> Cadastrar Primeiro Talento
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {talentos.map((talento) => (
            <div
              key={talento.id_talento}
              onClick={() => setDetailsTalento(talento)}
              className={`bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 flex flex-col justify-between cursor-pointer group relative overflow-hidden ${
                !talento.ativo ? 'opacity-65' : ''
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {talento.nome}
                    </h3>
                    <p className="text-xs text-primary font-medium mt-0.5">{talento.cargo_desejado || 'Cargo não especificado'}</p>
                  </div>
                  <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                    talento.ativo ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-zinc-500/10 text-zinc-500'
                  }`}>
                    {talento.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground py-2 border-t border-b border-border/40 my-3">
                  <div className="flex items-center gap-1">
                    <Clock size={12} className="text-muted-foreground shrink-0" />
                    <span className="truncate">{talento.disponibilidade === 'IMEDIATA' ? 'Imediata' : 'Com aviso'}</span>
                  </div>
                  <div className="flex items-center gap-1 justify-end text-foreground font-semibold">
                    <DollarSign size={12} className="text-emerald-500 shrink-0" />
                    <span>
                      {talento.pretensao_salarial
                        ? Number(talento.pretensao_salarial).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
                        : 'A combinar'}
                    </span>
                  </div>
                </div>

                {(() => {
                  const { nrs: tNrs, cleanSkills } = parseTalentoData(talento);
                  return (
                    <div className="space-y-2 mb-4">
                      {tNrs.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {tNrs.map(n => (
                            <span key={n} className="bg-primary/10 border border-primary/20 px-1.5 py-0.2 rounded text-[9px] font-bold text-primary">
                              {n}
                            </span>
                          ))}
                        </div>
                      )}
                      {cleanSkills && (
                        <div className="flex flex-wrap gap-1">
                          {cleanSkills.split(',').map((skill, index) => (
                            <span
                              key={index}
                              className="bg-muted px-2 py-0.5 rounded text-[10px] font-medium text-muted-foreground"
                            >
                              {skill.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-border/60 flex items-center justify-between mt-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex gap-2">
                  {talento.linkedin_url && (
                    <a href={talento.linkedin_url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-blue-500 transition">
                      <FaLinkedin size={14} />
                    </a>
                  )}
                  {talento.curriculo_url && (
                    <a href={talento.curriculo_url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-emerald-500 transition">
                      <FileText size={14} />
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => handleToggleAtivo(talento, e)}
                    className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition"
                    title={talento.ativo ? 'Inativar cadastro' : 'Ativar cadastro'}
                  >
                    {talento.ativo ? <ToggleRight size={16} className="text-emerald-500" /> : <ToggleLeft size={16} />}
                  </button>
                  <button
                    onClick={(e) => handleOpenEditModal(talento, e)}
                    className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition"
                    title="Editar"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={(e) => handleOpenDeleteModal(talento, e)}
                    className="p-1.5 hover:bg-red-500/10 rounded-lg text-muted-foreground hover:text-red-500 transition"
                    title="Excluir"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Criar / Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-card rounded-xl max-w-lg w-full p-6 border border-border shadow-2xl animate-in scale-in duration-200 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  {selectedTalento ? 'Editar Dados do Talento' : 'Adicionar Novo Talento'}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">Cadastre o perfil profissional no banco de dados interno</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTalento} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Ferreira"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-3.5 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Cargo Desejado *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Pedreiro, Almoxarife"
                    value={formData.cargo_desejado}
                    onChange={(e) => setFormData({ ...formData, cargo_desejado: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Pretensão Salarial (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ex: 2800.00"
                    value={formData.pretensao_salarial}
                    onChange={(e) => setFormData({ ...formData, pretensao_salarial: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">E-mail</label>
                  <input
                    type="email"
                    placeholder="carlos@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Telefone</label>
                  <input
                    type="text"
                    placeholder="(11) 98888-8888"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Tipo de Contrato</label>
                  <select
                    value={formData.tipo_contrato}
                    onChange={(e) => setFormData({ ...formData, tipo_contrato: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="CLT">CLT</option>
                    <option value="PJ">PJ / Prestador de Serviço</option>
                    <option value="TEMPORARIO">Temporário</option>
                    <option value="DIARISTA">Diarista</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Disponibilidade</label>
                  <select
                    value={formData.disponibilidade}
                    onChange={(e) => setFormData({ ...formData, disponibilidade: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="IMEDIATA">Imediata</option>
                    <option value="15_DIAS">Aviso Prévio (15 dias)</option>
                    <option value="30_DIAS">Aviso Prévio (30 dias)</option>
                    <option value="60_DIAS">Acima de 60 dias</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Certificações NR Ativas (QHS)</label>
                <div className="grid grid-cols-3 gap-2 bg-muted/40 p-3 rounded-lg border border-border/50 mb-3">
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
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Outras Habilidades (Separadas por vírgula)</label>
                <input
                  type="text"
                  placeholder="Ex: Alvenaria, Reboco, Drywall, Carpintaria"
                  value={formData.habilidades}
                  onChange={(e) => setFormData({ ...formData, habilidades: e.target.value })}
                  className="w-full px-3.5 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">CPF</label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.ativo}
                      onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                      className="rounded border-border text-primary focus:ring-primary/20"
                    />
                    <span>Manter Talento Ativo</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Link do LinkedIn</label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/perfil"
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                  className="w-full px-3.5 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Link do Currículo</label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/exemplo"
                  value={formData.curriculo_url}
                  onChange={(e) => setFormData({ ...formData, curriculo_url: e.target.value })}
                  className="w-full px-3.5 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Histórico / Observações do Talento</label>
                <textarea
                  rows={2}
                  placeholder="Trabalhou na Construtora X. Indicação de fulano. Perfil muito comunicativo..."
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
                    Confirmar consentimento do profissional para arquivamento do perfil no Banco de Talentos conforme a LGPD por até 2 anos.
                  </span>
                </label>
                <p className="text-[10px] text-muted-foreground leading-relaxed pl-6">
                  🔒 Conforme a LGPD e a conformidade do *Obra Integrada*, o profissional autoriza o arquivamento seguro de currículos e qualificações de modo que possamos convidá-lo para futuros processos de seleção.
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
                  {selectedTalento ? 'Confirmar Edição' : 'Salvar no Banco'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Deletar */}
      {showDeleteModal && selectedTalento && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-card rounded-xl max-w-sm w-full p-5 border border-border shadow-2xl animate-in scale-in duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10 shrink-0">
                <AlertTriangle size={18} className="text-destructive" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">Confirmar Exclusão</h2>
                <p className="text-xs text-muted-foreground">Esta ação não pode ser desfeita</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Tem certeza que deseja remover <strong className="text-foreground">"{selectedTalento.nome}"</strong> permanentemente do Banco de Talentos?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:bg-accent transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteTalento}
                className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-semibold hover:bg-destructive/90 transition shadow-sm"
              >
                Remover Talento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalhes */}
      {detailsTalento && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-card rounded-xl max-w-md w-full p-6 border border-border shadow-2xl animate-in scale-in duration-200 overflow-y-auto max-h-[85vh]">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">{detailsTalento.nome}</h2>
                <span className="text-xs text-primary font-semibold mt-0.5 inline-block bg-primary/10 px-2 py-0.5 rounded">
                  {detailsTalento.cargo_desejado}
                </span>
              </div>
              <button
                onClick={() => setDetailsTalento(null)}
                className="p-1 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs p-3 bg-muted/40 border border-border rounded-lg">
                <div>
                  <span className="text-muted-foreground block mb-0.5">Disponibilidade</span>
                  <span className="font-bold text-foreground">{detailsTalento.disponibilidade === 'IMEDIATA' ? 'Imediata' : 'Com aviso'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-0.5">Pretensão</span>
                  <span className="font-bold text-foreground">
                    {detailsTalento.pretensao_salarial
                      ? Number(detailsTalento.pretensao_salarial).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                      : 'A combinar'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-0.5">Vínculo</span>
                  <span className="font-bold text-foreground">{detailsTalento.tipo_contrato}</span>
                </div>
              </div>

              {(() => {
                const { nrs, cleanSkills, consent, cleanObs } = parseTalentoData(detailsTalento);
                return (
                  <>
                    {nrs.length > 0 && (
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block mb-1">Certificações NR Ativas (QHS)</span>
                        <div className="flex flex-wrap gap-1">
                          {nrs.map(n => (
                            <span key={n} className="bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded text-xs font-bold text-primary">
                              {n}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {cleanSkills && (
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Habilidades do Candidato</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {cleanSkills.split(',').map((h, i) => (
                            <span key={i} className="bg-muted px-2.5 py-0.5 rounded text-xs font-medium text-muted-foreground">
                              {h.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Observações Profissionais</span>
                      <p className="text-muted-foreground mt-1 leading-relaxed bg-muted/20 p-3 rounded-lg border border-border/50 text-xs whitespace-pre-line">
                        {cleanObs || 'Nenhuma observação ou histórico inserido.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 p-2 bg-emerald-500/5 border border-emerald-500/10 rounded-lg text-emerald-700 dark:text-emerald-400 text-xs font-medium">
                      <CheckCircle size={14} className="shrink-0 text-emerald-500" />
                      <span>
                        {consent 
                          ? 'Consentimento LGPD confirmado para armazenamento no Banco de Talentos (2 anos).'
                          : 'Aviso: Confirme o consentimento LGPD deste profissional na edição do perfil.'}
                      </span>
                    </div>
                  </>
                );
              })()}

              {detailsTalento.cpf && (
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">CPF</span>
                  <p className="text-xs font-semibold text-foreground mt-0.5">{detailsTalento.cpf}</p>
                </div>
              )}

              <div className="flex gap-4 text-xs">
                {detailsTalento.email && (
                  <div className="flex-1">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">E-mail</span>
                    <a href={`mailto:${detailsTalento.email}`} className="text-primary hover:underline block truncate mt-0.5">
                      {detailsTalento.email}
                    </a>
                  </div>
                )}
                {detailsTalento.telefone && (
                  <div className="flex-1">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Telefone</span>
                    <a href={`tel:${detailsTalento.telefone}`} className="text-foreground font-semibold block mt-0.5">
                      {detailsTalento.telefone}
                    </a>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {detailsTalento.linkedin_url && (
                  <a
                    href={detailsTalento.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 border border-border bg-card rounded-lg text-xs font-semibold hover:bg-accent transition"
                  >
                    <FaLinkedin size={13} className="text-blue-500" /> LinkedIn
                  </a>
                )}
                {detailsTalento.curriculo_url && (
                  <a
                    href={detailsTalento.curriculo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 border border-border bg-card rounded-lg text-xs font-semibold hover:bg-accent transition"
                  >
                    <FileText size={13} className="text-emerald-500" /> Currículo
                  </a>
                )}
              </div>

              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Observações Profissionais</span>
                <p className="text-muted-foreground mt-1 leading-relaxed bg-muted/20 p-3 rounded-lg border border-border/50 text-xs whitespace-pre-line">
                  {detailsTalento.observacoes || 'Nenhuma observação ou histórico inserido.'}
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <button
                  onClick={() => setDetailsTalento(null)}
                  className="px-4 py-2 bg-accent hover:bg-accent/80 rounded-lg text-xs font-semibold text-foreground transition"
                >
                  Fechar
                </button>
                <button
                  onClick={(e) => {
                    const t = detailsTalento;
                    setDetailsTalento(null);
                    handleOpenEditModal(t, e);
                  }}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:bg-primary/90 transition shadow-sm flex items-center gap-1"
                >
                  <Pencil size={12} /> Editar Perfil
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import {
  Briefcase, Plus, Filter, Search, X,
  AlertTriangle, Pencil, Trash2, Calendar,
  DollarSign, Building2, Eye, Play, Pause, ArrowRight
} from 'lucide-react';
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

const STATUS_OPCOES = [
  { id: 'TODOS', label: 'Todos os status' },
  { id: 'ABERTA', label: 'Aberta' },
  { id: 'PAUSADA', label: 'Pausada' },
  { id: 'FECHADA', label: 'Fechada' },
];

export default function VagasPage() {
  const { apiFetch } = useAuth();

  // --- Estados Principais ---
  const [vagas, setVagas] = useState([]);
  const [obras, setObras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFiltros, setShowFiltros] = useState(false);
  const [filtros, setFiltros] = useState({
    status: 'TODOS',
    tipo_contrato: 'TODOS',
    id_obra: '',
  });

  // --- Modais ---
  const [showVagaModal, setShowVagaModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedVaga, setSelectedVaga] = useState(null); // Usado para Edição / Exclusão
  const [vagaDetailsModal, setVagaDetailsModal] = useState(null); // Visualização rápida

  // --- Form Vaga (Criar/Editar) ---
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    requisitos: '',
    salario: '',
    tipo_contrato: 'CLT',
    status: 'ABERTA',
    id_obra: '',
  });

  // --- Carregar Obras para o select ---
  const carregarObras = useCallback(async () => {
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/obras`);
      if (res.ok) {
        const data = await res.json();
        // data pode ser array ou { data: [...] } dependendo do endpoint
        setObras(Array.isArray(data) ? data : data.data || []);
      }
    } catch (err) {
      console.error('Erro ao carregar obras:', err);
    }
  }, [apiFetch]);

  // --- Carregar Vagas do Backend ---
  const carregarVagas = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: '1',
        limit: '100',
        busca: searchTerm,
        status: filtros.status,
        tipo_contrato: filtros.tipo_contrato,
      });
      if (filtros.id_obra) {
        params.set('id_obra', filtros.id_obra);
      }

      const res = await apiFetch(`${API_BASE_URL}/api/rh/vagas?${params}`);
      if (!res.ok) throw new Error('Erro ao carregar vagas');
      const data = await res.json();
      setVagas(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [apiFetch, searchTerm, filtros]);

  // Carregar inicial
  useEffect(() => {
    carregarObras();
  }, [carregarObras]);

  // Debounce na busca
  useEffect(() => {
    const t = setTimeout(carregarVagas, 300);
    return () => clearTimeout(t);
  }, [carregarVagas]);

  // --- Handlers de Ações ---
  const handleOpenCreateModal = () => {
    setSelectedVaga(null);
    setFormData({
      titulo: '',
      descricao: '',
      requisitos: '',
      salario: '',
      tipo_contrato: 'CLT',
      status: 'ABERTA',
      id_obra: '',
    });
    setShowVagaModal(true);
  };

  const handleOpenEditModal = (vaga, e) => {
    e.stopPropagation();
    setSelectedVaga(vaga);
    setFormData({
      titulo: vaga.titulo || '',
      descricao: vaga.descricao || '',
      requisitos: vaga.requisitos || '',
      salario: vaga.salario ? String(vaga.salario) : '',
      tipo_contrato: vaga.tipo_contrato || 'CLT',
      status: vaga.status || 'ABERTA',
      id_obra: vaga.id_obra ? String(vaga.id_obra) : '',
    });
    setShowVagaModal(true);
  };

  const handleOpenDeleteModal = (vaga, e) => {
    e.stopPropagation();
    setSelectedVaga(vaga);
    setShowDeleteModal(true);
  };

  const handleSaveVaga = async (e) => {
    e.preventDefault();
    if (!formData.titulo.trim()) return;

    try {
      const isEdit = !!selectedVaga;
      const url = isEdit 
        ? `${API_BASE_URL}/api/rh/vagas/${selectedVaga.id_vaga}`
        : `${API_BASE_URL}/api/rh/vagas`;
      const method = isEdit ? 'PUT' : 'POST';

      const bodyData = {
        ...formData,
        id_obra: formData.id_obra ? Number(formData.id_obra) : null,
        salario: formData.salario ? Number(formData.salario) : null,
      };

      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.erro || 'Erro ao salvar vaga');
      }

      setShowVagaModal(false);
      carregarVagas();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteVaga = async () => {
    if (!selectedVaga) return;
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/rh/vagas/${selectedVaga.id_vaga}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.erro || 'Erro ao excluir vaga');
      }

      setShowDeleteModal(false);
      carregarVagas();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleStatus = async (vaga, e) => {
    e.stopPropagation();
    const newStatus = vaga.status === 'ABERTA' ? 'PAUSADA' : 'ABERTA';
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/rh/vagas/${vaga.id_vaga}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Erro ao alterar status');
      carregarVagas();
    } catch (err) {
      alert(err.message);
    }
  };

  // --- Estatísticas ---
  const totalVagas = vagas.length;
  const abertas = vagas.filter(v => v.status === 'ABERTA').length;
  const pausadas = vagas.filter(v => v.status === 'PAUSADA').length;
  const fechadas = vagas.filter(v => v.status === 'FECHADA').length;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      {/* Sub-nav de Recrutamento */}
      <RHRecrutamentoNav />

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 mt-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
            <Briefcase size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Vagas de Emprego</h1>
            <p className="text-sm text-muted-foreground">Gerenciamento de posições em aberto, alocação de contratação e monitoramento de status.</p>
          </div>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition text-sm font-semibold shadow-sm shrink-0"
        >
          <Plus size={16} /> Nova Vaga
        </button>
      </div>

      {/* Grid de Estatísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total de Vagas', value: totalVagas, color: 'border-border' },
          { label: 'Abertas', value: abertas, color: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400' },
          { label: 'Pausadas', value: pausadas, color: 'border-amber-500/30 bg-amber-500/5 text-amber-600 dark:text-amber-400' },
          { label: 'Fechadas', value: fechadas, color: 'border-red-500/30 bg-red-500/5 text-red-600 dark:text-red-400' }
        ].map((stat, idx) => (
          <div key={idx} className={`rounded-xl border p-4 shadow-sm ${stat.color}`}>
            <span className="text-xs font-semibold text-muted-foreground block mb-1">{stat.label}</span>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por cargo, descrição ou requisitos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFiltros(!showFiltros)}
            className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm transition shadow-sm ${
              showFiltros || filtros.status !== 'TODOS' || filtros.tipo_contrato !== 'TODOS' || filtros.id_obra
                ? 'bg-primary/10 border-primary text-primary font-medium'
                : 'bg-card border-border text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            <Filter size={14} /> Filtros
          </button>
        </div>
      </div>

      {/* Painel de Filtros Avançados */}
      {showFiltros && (
        <div className="mb-6 p-4 bg-card border border-border rounded-xl shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in duration-200">
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Status</label>
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
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Tipo de Contrato</label>
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
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Obra Vinculada</label>
            <select
              value={filtros.id_obra}
              onChange={(e) => setFiltros({ ...filtros, id_obra: e.target.value })}
              className="w-full mt-1.5 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Todas as obras</option>
              {obras.map((obra) => (
                <option key={obra.id_obra} value={obra.id_obra}>{obra.nome}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Grid de Vagas */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-card border border-border rounded-xl p-5 shadow-sm animate-pulse space-y-4">
              <div className="flex justify-between items-center">
                <div className="h-4 bg-muted rounded w-2/3"></div>
                <div className="h-6 bg-muted rounded-full w-16"></div>
              </div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
              <div className="h-10 bg-muted rounded"></div>
              <div className="flex justify-between pt-4 border-t border-border">
                <div className="h-6 bg-muted rounded w-20"></div>
                <div className="h-6 bg-muted rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      ) : vagas.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <Briefcase size={40} className="mx-auto text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-base font-semibold text-foreground mb-1">Nenhuma vaga encontrada</h3>
          <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto">
            Não há vagas cadastradas correspondentes aos filtros atuais ou para o seu tenant de RH.
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition shadow-sm"
          >
            <Plus size={16} /> Cadastrar Primeira Vaga
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vagas.map((vaga) => (
            <div
              key={vaga.id_vaga}
              onClick={() => setVagaDetailsModal(vaga)}
              className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 flex flex-col justify-between cursor-pointer group relative overflow-hidden"
            >
              <div>
                {/* Cabeçalho do Card */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="text-base font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                    {vaga.titulo}
                  </h3>
                  <StatusBadge status={vaga.status} />
                </div>

                {/* Subinfo */}
                <div className="space-y-1.5 mb-4 text-xs text-muted-foreground">
                  {vaga.tb_obra ? (
                    <div className="flex items-center gap-1.5">
                      <Building2 size={13} className="shrink-0 text-primary/70" />
                      <span className="truncate font-medium">{vaga.tb_obra.nome}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <Building2 size={13} className="shrink-0" />
                      <span>Vaga Geral (Sem Obra)</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Calendar size={13} className="shrink-0" />
                    <span>Publicado em: {new Date(vaga.criado_em).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>

                {/* Descrição Curta */}
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed bg-muted/30 p-2.5 rounded-lg border border-border/50">
                  {vaga.descricao || 'Nenhuma descrição fornecida.'}
                </p>
              </div>

              {/* Rodapé do Card */}
              <div className="pt-4 border-t border-border/60 flex items-center justify-between mt-auto">
                <div>
                  <span className="text-[10px] text-muted-foreground block uppercase font-bold tracking-wider">Salário Oferecido</span>
                  <span className="text-sm font-bold text-foreground flex items-center gap-0.5">
                    <DollarSign size={14} className="text-emerald-500 shrink-0" />
                    {vaga.salario 
                      ? Number(vaga.salario).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                      : 'A combinar'}
                  </span>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => handleToggleStatus(vaga, e)}
                    className="p-2 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition"
                    title={vaga.status === 'ABERTA' ? 'Pausar Vaga' : 'Reabrir Vaga'}
                  >
                    {vaga.status === 'ABERTA' ? <Pause size={14} /> : <Play size={14} />}
                  </button>
                  <button
                    onClick={(e) => handleOpenEditModal(vaga, e)}
                    className="p-2 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition"
                    title="Editar Vaga"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={(e) => handleOpenDeleteModal(vaga, e)}
                    className="p-2 hover:bg-red-500/10 rounded-lg text-muted-foreground hover:text-red-500 transition"
                    title="Excluir Vaga"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Criar / Editar Vaga */}
      {showVagaModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-card rounded-xl max-w-lg w-full p-6 border border-border shadow-2xl animate-in scale-in duration-200 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  {selectedVaga ? 'Editar Vaga de Emprego' : 'Cadastrar Nova Vaga'}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">Informe as características do cargo procurado</p>
              </div>
              <button 
                onClick={() => setShowVagaModal(false)} 
                className="p-1.5 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveVaga} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Título da Vaga *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Mestre de Obras, Pedreiro de Acabamento..."
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  className="w-full px-3.5 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
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
                    <option value="PJ">PJ / Prestação de Serviço</option>
                    <option value="TEMPORARIO">Temporário</option>
                    <option value="DIARISTA">Diarista</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Status inicial</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="ABERTA">Aberta</option>
                    <option value="PAUSADA">Pausada</option>
                    <option value="FECHADA">Fechada</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Salário Oferecido (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ex: 3500.00"
                    value={formData.salario}
                    onChange={(e) => setFormData({ ...formData, salario: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Obra Associada</label>
                  <select
                    value={formData.id_obra}
                    onChange={(e) => setFormData({ ...formData, id_obra: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Nenhuma (Vaga Geral da Empresa)</option>
                    {obras.map((obra) => (
                      <option key={obra.id_obra} value={obra.id_obra}>{obra.nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Descrição das Atividades</label>
                <textarea
                  rows={3}
                  placeholder="Descreva as responsabilidades e o escopo de trabalho da posição..."
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Requisitos & Benefícios</label>
                <textarea
                  rows={3}
                  placeholder="Ex: Experiência na carteira, NR10 ativo, CNH B. Oferecemos Vale Alimentação."
                  value={formData.requisitos}
                  onChange={(e) => setFormData({ ...formData, requisitos: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-border mt-6">
                <button
                  type="button"
                  onClick={() => setShowVagaModal(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:bg-accent transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition shadow-sm"
                >
                  {selectedVaga ? 'Confirmar Alterações' : 'Criar Vaga'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmar Exclusão */}
      {showDeleteModal && selectedVaga && (
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
              Tem certeza que deseja excluir permanentemente a vaga <strong className="text-foreground">"{selectedVaga.titulo}"</strong>? Todos os dados vinculados a esta posição serão apagados.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:bg-accent transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteVaga}
                className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-semibold hover:bg-destructive/90 transition shadow-sm"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalhes da Vaga (Visualização Rápida) */}
      {vagaDetailsModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-card rounded-xl max-w-md w-full p-6 border border-border shadow-2xl animate-in scale-in duration-200 overflow-y-auto max-h-[85vh]">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  {vagaDetailsModal.titulo}
                </h2>
                <span className="text-xs text-primary font-semibold mt-1 inline-block bg-primary/10 px-2 py-0.5 rounded">
                  {vagaDetailsModal.tipo_contrato}
                </span>
              </div>
              <button 
                onClick={() => setVagaDetailsModal(null)} 
                className="p-1 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm p-3 bg-muted/40 border border-border rounded-lg">
                <div>
                  <span className="text-xs text-muted-foreground block">Salário</span>
                  <span className="font-bold text-foreground">
                    {vagaDetailsModal.salario 
                      ? Number(vagaDetailsModal.salario).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                      : 'A combinar'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Status</span>
                  <StatusBadge status={vagaDetailsModal.status} />
                </div>
              </div>

              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Obra Alocada</span>
                <p className="text-sm font-semibold text-foreground mt-0.5">
                  {vagaDetailsModal.tb_obra ? vagaDetailsModal.tb_obra.nome : 'Empresa Geral'}
                </p>
              </div>

              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Descrição do Cargo</span>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed whitespace-pre-line bg-muted/20 p-3 rounded-lg border border-border/50">
                  {vagaDetailsModal.descricao || 'Nenhuma descrição fornecida.'}
                </p>
              </div>

              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Requisitos da Vaga</span>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed whitespace-pre-line bg-muted/20 p-3 rounded-lg border border-border/50">
                  {vagaDetailsModal.requisitos || 'Nenhum requisito especificado.'}
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <button
                  onClick={() => setVagaDetailsModal(null)}
                  className="px-4 py-2 bg-accent hover:bg-accent/80 rounded-lg text-sm text-foreground transition"
                >
                  Fechar
                </button>
                <button
                  onClick={(e) => {
                    const v = vagaDetailsModal;
                    setVagaDetailsModal(null);
                    handleOpenEditModal(v, e);
                  }}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition shadow-sm flex items-center gap-1.5"
                >
                  <Pencil size={14} /> Editar Vaga
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

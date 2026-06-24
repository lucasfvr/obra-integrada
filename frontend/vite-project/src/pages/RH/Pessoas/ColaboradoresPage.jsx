import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Plus, Filter, Download, Search, X,
  TrendingUp, UserMinus, ChevronDown, ChevronUp,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import API_BASE_URL from '../../../config/api.js';
import { StatusBadge } from '../../../components/RH/rhUi.jsx';
import ColaboradorPerfil from '../../../components/RH/ColaboradorPerfil.jsx';
import RHPessoasNav from '../../../components/RH/RHPessoasNav.jsx';

const STATUS_OPCOES = [
  { id: 'TODOS', label: 'Todos' },
  { id: 'ATIVO', label: 'Ativos' },
  { id: 'AFASTADO', label: 'Afastados' },
  { id: 'FERIAS', label: 'Férias' },
  { id: 'DESLIGADO', label: 'Desligados' },
  { id: 'INATIVO', label: 'Inativos' },
];

export default function ColaboradoresPage() {
  const { apiFetch } = useAuth();

  // --- estado da lista ---
  const [searchTerm, setSearchTerm] = useState('');
  const [colaboradores, setColaboradores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFiltros, setShowFiltros] = useState(false);
  const [actionMenu, setActionMenu] = useState(null);
  const [filtros, setFiltros] = useState({
    status: 'TODOS', cargo: '', obra: '', gestor: '', tipoContrato: '',
  });

  // --- perfil inline (substitui navigate) ---
  const [perfilAtivo, setPerfilAtivo] = useState(null); // colaborador object

  // --- modais ---
  const [showNovoModal, setShowNovoModal] = useState(false);
  const [desligarTarget, setDesligarTarget] = useState(null);
  const [promoverTarget, setPromoverTarget] = useState(null);
  const [promoverForm, setPromoverForm] = useState({ cargo_base: '' });
  const [formData, setFormData] = useState({
    nome: '', cpf: '', email: '', cargo_base: '',
    data_admissao: new Date().toISOString().split('T')[0],
    tipo_vinculo: 'CLT', lgpd_consentimento: true,
  });

  // ------------------------------------------------------------------ lista
  const carregarColaboradores = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: '1', limit: '500', busca: searchTerm,
        status: 'TODOS', sortBy: 'nome', sortOrder: 'asc',
      });
      if (filtros.cargo) params.set('cargo', filtros.cargo);

      const res = await apiFetch(`${API_BASE_URL}/api/rh?${params}`);
      if (!res.ok) throw new Error('Erro ao carregar colaboradores');
      const data = await res.json();
      const lista = (data.data || []).filter((c) => !c.is_terceirizado);
      setColaboradores(lista);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [apiFetch, searchTerm, filtros.cargo]);

  useEffect(() => {
    const t = setTimeout(carregarColaboradores, 300);
    return () => clearTimeout(t);
  }, [carregarColaboradores]);

  // Filtros client-side (obra/gestor/contrato) sobre a base completa.
  const baseList = colaboradores.filter((c) => {
    if (filtros.obra && !(c.obra_atual || '').toLowerCase().includes(filtros.obra.toLowerCase())) return false;
    if (filtros.gestor && !(c.gestor || '').toLowerCase().includes(filtros.gestor.toLowerCase())) return false;
    if (filtros.tipoContrato && c.tipo_vinculo !== filtros.tipoContrato) return false;
    return true;
  });

  // Lista exibida = base filtrada pelo status. As contagens usam a base,
  // então não zeram ao trocar de aba.
  const colaboradoresFiltrados =
    filtros.status === 'TODOS' ? baseList : baseList.filter((c) => c.status === filtros.status);

  // Opções distintas para os dropdowns (da base completa, independem dos filtros).
  const obrasDisponiveis = [...new Set(colaboradores.map((c) => c.obra_atual).filter(Boolean))].sort();
  const gestoresDisponiveis = [...new Set(colaboradores.map((c) => c.gestor).filter(Boolean))].sort();

  // ---------------------------------------------------------------- handlers
  const handleCriar = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/rh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.erro || 'Erro ao criar'); }
      setShowNovoModal(false);
      setFormData({ nome: '', cpf: '', email: '', cargo_base: '', data_admissao: new Date().toISOString().split('T')[0], tipo_vinculo: 'CLT', lgpd_consentimento: true });
      carregarColaboradores();
    } catch (err) { alert(err.message); }
  };

  const handleDesligar = async () => {
    if (!desligarTarget) return;
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/rh/${desligarTarget.id_usuario}/inativar`, { method: 'PATCH' });
      if (!res.ok) { const err = await res.json(); throw new Error(err.erro || 'Erro ao desligar'); }
      setDesligarTarget(null);
      carregarColaboradores();
    } catch (err) { alert(err.message); }
  };

  const handlePromover = async (e) => {
    e.preventDefault();
    if (!promoverTarget || !promoverForm.cargo_base.trim()) { alert('Informe o novo cargo.'); return; }
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/rh/${promoverTarget.id_usuario}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cargo_base: promoverForm.cargo_base.trim() }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.erro || 'Erro ao promover'); }
      setPromoverTarget(null);
      setPromoverForm({ cargo_base: '' });
      carregarColaboradores();
    } catch (err) { alert(err.message); }
  };

  const handleExportar = () => {
    const csv = [
      ['Nome', 'Matrícula', 'Cargo', 'Status', 'Admissão', 'Email'],
      ...colaboradoresFiltrados.map((c) => [
        c.nome, c.matricula, c.cargo_base || '', c.status,
        c.data_admissao ? new Date(c.data_admissao).toLocaleDateString('pt-BR') : '', c.email || '',
      ]),
    ].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `colaboradores_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const contagemStatus = (s) => s === 'TODOS' ? baseList.length : baseList.filter((c) => c.status === s).length;

  const abrirPerfil = (col) => { setActionMenu(null); setPerfilAtivo(col); };

  // ----------------------------------------------------------------- perfil inline
  if (perfilAtivo) {
    return (
      <ColaboradorPerfil
        colaborador={perfilAtivo}
        onBack={() => { setPerfilAtivo(null); carregarColaboradores(); }}
      />
    );
  }

  // ----------------------------------------------------------------- lista
  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      {/* Sub-nav do módulo RH > Pessoas (padrão Dashboard Dinamico v1.2) */}
      <RHPessoasNav />

      {/* Cabeçalho da página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 mt-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
            <Users size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Colaboradores</h1>
            <p className="text-sm text-muted-foreground">Gestão de funcionários — consultar, contratar, transferir e acompanhar histórico</p>
          </div>
        </div>
        <button
          onClick={() => setShowNovoModal(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:bg-primary/90 transition text-sm font-semibold shadow-sm shrink-0"
        >
          <Plus size={16} /> Contratar
        </button>
      </div>

      {/* Pesquisa */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar por nome, CPF, matrícula, e-mail ou cargo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-xl text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 shadow-sm"
        />
      </div>

      {/* Filtros status */}
      <div className="flex flex-wrap gap-2 mb-4">
        {STATUS_OPCOES.map((s) => (
          <button
            key={s.id}
            onClick={() => setFiltros((f) => ({ ...f, status: s.id }))}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              filtros.status === s.id
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/40'
            }`}
          >
            {s.label} <span className="opacity-70">({contagemStatus(s.id)})</span>
          </button>
        ))}
      </div>

      {/* Ações da barra */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button
          onClick={() => setShowFiltros(!showFiltros)}
          className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg hover:bg-accent transition text-sm text-muted-foreground hover:text-foreground shadow-sm"
        >
          <Filter size={14} /> Filtros
          {showFiltros ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
        <button
          onClick={handleExportar}
          className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg hover:bg-accent transition text-sm text-muted-foreground hover:text-foreground shadow-sm"
        >
          <Download size={14} /> Exportar CSV
        </button>
      </div>

      {/* Filtros avançados */}
      {showFiltros && (
        <div className="mb-4 p-4 bg-card border border-border rounded-xl shadow-sm grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <div>
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Cargo</label>
            <input
              type="text"
              placeholder="Ex: Pedreiro"
              value={filtros.cargo}
              onChange={(e) => setFiltros((prev) => ({ ...prev, cargo: e.target.value }))}
              className="w-full mt-1 px-3 py-1.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Obra</label>
            <input
              type="text"
              list="obras-list"
              placeholder="Todas as obras"
              value={filtros.obra}
              onChange={(e) => setFiltros((prev) => ({ ...prev, obra: e.target.value }))}
              className="w-full mt-1 px-3 py-1.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
            <datalist id="obras-list">
              {obrasDisponiveis.map((o) => (
                <option key={o} value={o} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Gestor</label>
            <input
              type="text"
              list="gestores-list"
              placeholder="Todos os gestores"
              value={filtros.gestor}
              onChange={(e) => setFiltros((prev) => ({ ...prev, gestor: e.target.value }))}
              className="w-full mt-1 px-3 py-1.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
            <datalist id="gestores-list">
              {gestoresDisponiveis.map((g) => (
                <option key={g} value={g} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Contrato</label>
            <select
              value={filtros.tipoContrato}
              onChange={(e) => setFiltros((f) => ({ ...f, tipoContrato: e.target.value }))}
              className="w-full mt-1 px-3 py-1.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
            >
              <option value="">Todos</option>
              <option value="CLT">CLT</option>
              <option value="CONTRATO">PJ / Contrato</option>
            </select>
          </div>
        </div>
      )}

      {/* Tabela — padrão OB: rounded-xl border bg-card shadow-sm */}
      <div className="rounded-xl overflow-hidden border border-border bg-card shadow-sm mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Nome</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Cargo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden md:table-cell">Obra</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden lg:table-cell">Gestor</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden sm:table-cell">Admissão</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">Carregando...</td></tr>
              ) : colaboradoresFiltrados.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">Nenhum colaborador encontrado</td></tr>
              ) : (
                colaboradoresFiltrados.map((col) => (
                  <tr
                    key={col.id_usuario}
                    className="hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => abrirPerfil(col)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                          {col.nome?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{col.nome}</p>
                          <p className="text-xs text-muted-foreground font-mono">{col.matricula || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{col.cargo_base || '—'}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">{col.obra_atual || '—'}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">{col.gestor || '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={col.status} /></td>
                    <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                      {col.data_admissao ? new Date(col.data_admissao).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="relative inline-block">
                        <button
                          onClick={() => setActionMenu(actionMenu === col.id_usuario ? null : col.id_usuario)}
                          className="px-2.5 py-1.5 rounded-lg hover:bg-accent text-xs font-medium text-primary border border-transparent hover:border-border transition"
                        >
                          Ações ▾
                        </button>
                        {actionMenu === col.id_usuario && (
                          <div className="absolute right-0 top-full mt-1 z-30 w-44 bg-card border border-border rounded-xl shadow-lg py-1">
                            {[
                              { label: 'Visualizar perfil', action: () => abrirPerfil(col) },
                              { label: 'Editar dados', action: () => abrirPerfil(col) },
                              { label: 'Promover', action: () => { setPromoverTarget(col); setPromoverForm({ cargo_base: col.cargo_base || '' }); } },
                              { label: 'Desligar', action: () => setDesligarTarget(col), danger: true },
                            ].map((item) => (
                              <button
                                key={item.label}
                                onClick={() => { setActionMenu(null); item.action(); }}
                                className={`w-full px-3 py-2 text-xs text-left transition hover:bg-muted/50 ${item.danger ? 'text-destructive' : 'text-foreground'}`}
                              >
                                {item.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nova Contratação */}
      {showNovoModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl max-w-md w-full p-5 border border-border shadow-lg">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="text-base font-semibold text-foreground">Nova Contratação</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Preencha os dados básicos do colaborador</p>
              </div>
              <button onClick={() => setShowNovoModal(false)} className="text-muted-foreground hover:text-foreground transition"><X size={18} /></button>
            </div>
            <form onSubmit={handleCriar} className="space-y-3">
              {[
                { key: 'nome', label: 'Nome Completo *', type: 'text', required: true },
                { key: 'cpf', label: 'CPF *', type: 'text', required: true },
                { key: 'email', label: 'E-mail', type: 'email' },
                { key: 'cargo_base', label: 'Cargo', type: 'text' },
                { key: 'data_admissao', label: 'Data de Admissão', type: 'date' },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">{f.label}</label>
                  <input
                    type={f.type} required={f.required}
                    value={formData[f.key]}
                    onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Tipo de Contrato</label>
                <select value={formData.tipo_vinculo} onChange={(e) => setFormData({ ...formData, tipo_vinculo: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring/30">
                  <option value="CLT">CLT</option>
                  <option value="CONTRATO">PJ / Contrato</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2 border-t border-border mt-4">
                <button type="button" onClick={() => setShowNovoModal(false)} className="flex-1 px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:bg-accent transition">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition">Contratar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Desligar */}
      {desligarTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl max-w-sm w-full p-5 border border-border shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10 shrink-0">
                <AlertTriangle size={18} className="text-destructive" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">Confirmar Desligamento</h2>
                <p className="text-xs text-muted-foreground">Esta ação pode ser revertida pelo administrador</p>
              </div>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg border border-border mb-4">
              <p className="text-sm font-medium text-foreground">{desligarTarget.nome}</p>
              <p className="text-xs text-muted-foreground">{desligarTarget.cargo_base || 'Sem cargo definido'}</p>
            </div>
            <p className="text-xs text-muted-foreground mb-5">O colaborador será marcado como <strong className="text-foreground">Inativo</strong> e perderá acesso ao sistema.</p>
            <div className="flex gap-2">
              <button onClick={() => setDesligarTarget(null)} className="flex-1 px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:bg-accent transition">Cancelar</button>
              <button onClick={handleDesligar} className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium hover:bg-destructive/90 transition">Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Promover */}
      {promoverTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl max-w-md w-full p-5 border border-border shadow-lg">
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                  <TrendingUp size={18} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground">Promover Colaborador</h2>
                  <p className="text-xs text-muted-foreground">{promoverTarget.nome}</p>
                </div>
              </div>
              <button onClick={() => setPromoverTarget(null)} className="text-muted-foreground hover:text-foreground transition"><X size={18} /></button>
            </div>
            <form onSubmit={handlePromover} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Cargo Atual</label>
                <input type="text" disabled value={promoverTarget.cargo_base || '—'} className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm text-muted-foreground" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Novo Cargo *</label>
                <input
                  type="text" required placeholder="Ex: Encarregado, Mestre de Obras..."
                  value={promoverForm.cargo_base}
                  onChange={(e) => setPromoverForm({ cargo_base: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>
              <div className="flex gap-2 pt-2 border-t border-border mt-4">
                <button type="button" onClick={() => { setPromoverTarget(null); setPromoverForm({ cargo_base: '' }); }} className="flex-1 px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:bg-accent transition">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition">Confirmar Promoção</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

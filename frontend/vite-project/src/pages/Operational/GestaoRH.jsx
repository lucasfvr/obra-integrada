import API_BASE_URL from "../../config/api.js";
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { PermissaoGuard, ReadOnlyGuard } from '../../components/Guards/PermissaoGuard.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export default function GestaoRH() {
  const { apiFetch } = useAuth();
  const { toast, showConfirm } = useToast();
  const [funcionarios, setFuncionarios] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingFunc, setEditingFunc] = useState(null);

  // Filtros e Ordenação
  const [filtros, setFiltros] = useState({
    status: 'ATIVO',
    cargo: '',
    sortBy: 'nome',
    sortOrder: 'asc'
  });
  
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    email: '',
    cargo_base: '',
    data_admissao: '',
    role: 'TRABALHADOR',
    status: 'ATIVO'
  });

  const [errors, setErrors] = useState({});

  const fetchFuncionarios = async (page = 1) => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page,
        limit: 10,
        busca,
        status: filtros.status,
        cargo: filtros.cargo,
        sortBy: filtros.sortBy,
        sortOrder: filtros.sortOrder
      }).toString();

      const res = await apiFetch(`${API_BASE_URL}/api/rh?${query}`);
      if (res.ok) {
        const result = await res.json();
        setFuncionarios(result.data);
        setMeta(result.meta);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFuncionarios(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [busca, filtros]);

  const validate = () => {
    const newErrors = {};
    if (!formData.nome || formData.nome.length < 3) newErrors.nome = "Nome muito curto";
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "E-mail inválido";
    if (!formData.cpf || formData.cpf.replace(/\D/g, '').length !== 11) newErrors.cpf = "CPF deve ter 11 dígitos";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const method = editingFunc ? 'PUT' : 'POST';
    const url = editingFunc 
      ? `${API_BASE_URL}/api/rh/${editingFunc.id_usuario}`
      : `${API_BASE_URL}/api/rh`;

    try {
      const res = await apiFetch(url, {
        method,
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast.success(editingFunc ? 'Cadastro atualizado com sucesso!' : 'Funcionário cadastrado com sucesso!', editingFunc ? 'Atualizado' : 'Cadastrado');
        setShowModal(false);
        setEditingFunc(null);
        setFormData({ nome: '', cpf: '', email: '', cargo_base: '', data_admissao: '', role: 'TRABALHADOR', status: 'ATIVO' });
        setErrors({});
        fetchFuncionarios(meta.page);
      } else {
        const err = await res.json();
        toast.error(err.erro || 'Erro ao salvar cadastro.', 'Erro');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleInativar = async (id) => {
    const confirmed = await showConfirm({
      title: 'Inativar Colaborador',
      message: 'Deseja realmente inativar este funcionário? Esta ação pode ser revertida depois.',
      confirmLabel: 'Sim, inativar',
      cancelLabel: 'Cancelar',
      type: 'danger'
    });
    if (!confirmed) return;
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/rh/${id}/inativar`, { method: 'PATCH' });
      if (res.ok) {
        toast.success('Funcionário inativado com sucesso.', 'Inativado');
        fetchFuncionarios(meta.page);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSort = (field) => {
    setFiltros(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Gestão de RH</h1>
          <p className="text-sm text-muted-foreground mt-1">Controle de colaboradores com validação e filtros avançados.</p>
        </div>
        
        <PermissaoGuard permissao="gerenciar_usuarios">
          <button
            onClick={() => { setEditingFunc(null); setShowModal(true); setFormData({ nome: '', cpf: '', email: '', cargo_base: '', data_admissao: '', role: 'TRABALHADOR', status: 'ATIVO' }); setErrors({}); }}
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <span className="text-lg">+</span> Novo Colaborador
          </button>
        </PermissaoGuard>
      </div>

      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex-1 min-w-[250px] relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">🔍</span>
            <input 
              type="text" 
              placeholder="Buscar por nome, matrícula ou CPF..."
              className="w-full bg-card border border-border rounded-lg py-2 pl-9 pr-3 text-xs text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          <select 
            className="bg-card border border-border rounded-lg px-3 py-2 text-xs font-medium text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
            value={filtros.status}
            onChange={(e) => setFiltros({...filtros, status: e.target.value})}
          >
            <option value="ATIVO">Ativos</option>
            <option value="INATIVO">Inativos</option>
            <option value="TODOS">Todos</option>
          </select>

          <input 
            type="text"
            placeholder="Filtrar Cargo..."
            className="bg-card border border-border rounded-lg px-3 py-2 text-xs font-medium text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
            value={filtros.cargo}
            onChange={(e) => setFiltros({...filtros, cargo: e.target.value})}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('matricula')}>
                   <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase">
                    Matrícula {filtros.sortBy === 'matricula' && (filtros.sortOrder === 'asc' ? '↑' : '↓')}
                   </div>
                </th>
                <th className="pb-3 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('nome')}>
                   <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase">
                    Colaborador {filtros.sortBy === 'nome' && (filtros.sortOrder === 'asc' ? '↑' : '↓')}
                   </div>
                </th>
                <th className="pb-3 text-xs font-semibold text-muted-foreground uppercase">Cargo</th>
                <th className="pb-3 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('data_admissao')}>
                   <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase">
                    Admissão {filtros.sortBy === 'data_admissao' && (filtros.sortOrder === 'asc' ? '↑' : '↓')}
                   </div>
                </th>
                <th className="pb-3 text-xs font-semibold text-muted-foreground uppercase text-center">Status</th>
                <th className="pb-3 text-xs font-semibold text-muted-foreground uppercase text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan="6" className="py-12 text-center text-muted-foreground font-semibold text-xs animate-pulse">Sincronizando dados...</td></tr>
              ) : funcionarios.length === 0 ? (
                <tr><td colSpan="6" className="py-12 text-center text-muted-foreground font-semibold text-xs">Nenhum funcionário encontrado.</td></tr>
              ) : funcionarios.map(f => (
                <tr key={f.id_usuario} className="group hover:bg-muted/30 transition-colors">
                  <td className="py-4 text-sm font-semibold text-primary">{f.matricula}</td>
                  <td className="py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-foreground">{f.nome}</span>
                      <span className="text-[10px] text-muted-foreground font-medium mt-0.5">{f.email || 'Sem e-mail'}</span>
                    </div>
                  </td>
                  <td className="py-4 text-sm text-muted-foreground">{f.cargo_base || 'Não definido'}</td>
                  <td className="py-4 text-sm text-muted-foreground">
                    {f.data_admissao ? new Date(f.data_admissao).toLocaleDateString() : '-'}
                  </td>
                  <td className="py-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${f.status === 'ATIVO' ? 'bg-emerald-500/10 text-emerald-600 border-transparent' : 'bg-muted text-muted-foreground border-transparent'}`}>
                      {f.status}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <PermissaoGuard permissao="gerenciar_usuarios">
                      <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => { setEditingFunc(f); setFormData({ ...f, data_admissao: f.data_admissao?.split('T')[0] || '' }); setErrors({}); setShowModal(true); }}
                          className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                          title="Editar Colaborador"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                        </button>

                        {f.role !== 'PROPRIETARIO' && (
                          <button
                            onClick={() => handleInativar(f.id_usuario)}
                            className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                            title="Inativar Colaborador"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        )}
                      </div>
                    </PermissaoGuard>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {meta.totalPages > 1 && (
          <div className="flex justify-center gap-1.5 mt-6">
             {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map(p => (
               <button 
                 key={p} 
                 onClick={() => fetchFuncionarios(p)}
                 className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${meta.page === p ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/70'}`}
               >
                 {p}
               </button>
             ))}
          </div>
        )}
      </div>

      {showModal && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-card rounded-xl w-full max-w-2xl shadow-lg overflow-hidden border border-border animate-slide-up">
            <div className="p-5 border-b border-border flex justify-between items-center bg-muted/30">
              <div>
                <h3 className="text-base font-semibold text-foreground tracking-tight">
                  {editingFunc ? 'Editar Cadastro' : 'Novo Colaborador'}
                </h3>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase mt-0.5">Módulo de RH e Integração</p>
              </div>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto max-h-[70vh]">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1">Nome Completo</label>
                <input required type="text" className={`w-full bg-card border ${errors.nome ? 'border-destructive' : 'border-border'} rounded-lg p-2 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all`} value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
                {errors.nome && <span className="text-[10px] text-destructive font-semibold mt-1 block">{errors.nome}</span>}
              </div>
              
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">CPF (Apenas números)</label>
                <input required type="text" maxLength="11" className={`w-full bg-card border ${errors.cpf ? 'border-destructive' : 'border-border'} rounded-lg p-2 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all`} value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} />
                {errors.cpf && <span className="text-[10px] text-destructive font-semibold mt-1 block">{errors.cpf}</span>}
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">E-mail Corporativo</label>
                <input type="email" className={`w-full bg-card border ${errors.email ? 'border-destructive' : 'border-border'} rounded-lg p-2 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all`} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                {errors.email && <span className="text-[10px] text-destructive font-semibold mt-1 block">{errors.email}</span>}
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Função / Cargo</label>
                <input type="text" className="w-full bg-card border border-border rounded-lg p-2 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="Ex: Engenheiro Junior" value={formData.cargo_base} onChange={e => setFormData({...formData, cargo_base: e.target.value})} />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Data de Admissão</label>
                <input type="date" className="w-full bg-card border border-border rounded-lg p-2 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all" value={formData.data_admissao} onChange={e => setFormData({...formData, data_admissao: e.target.value})} />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Status do Colaborador</label>
                <select 
                  className="w-full bg-card border border-border rounded-lg p-2 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                >
                  <option value="ATIVO">Ativo</option>
                  <option value="INATIVO">Inativo</option>
                </select>
              </div>

              <div className="md:col-span-2 pt-4 flex gap-3 justify-end border-t border-border">
                <button type="button" onClick={() => setShowModal(false)} className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold rounded-lg transition-colors">Salvar Colaborador</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

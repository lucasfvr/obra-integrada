import API_BASE_URL from "../../config/api.js";
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { PermissaoGuard, ReadOnlyGuard } from '../../components/Guards/PermissaoGuard.jsx';

export default function GestaoRH() {
  const { apiFetch } = useAuth();
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
        alert(editingFunc ? "Cadastro atualizado!" : "Funcionário cadastrado com sucesso!");
        setShowModal(false);
        setEditingFunc(null);
        setFormData({ nome: '', cpf: '', email: '', cargo_base: '', data_admissao: '', role: 'TRABALHADOR', status: 'ATIVO' });
        setErrors({});
        fetchFuncionarios(meta.page);
      } else {
        const err = await res.json();
        alert(err.erro || "Erro ao salvar");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleInativar = async (id) => {
    if (!window.confirm("Deseja realmente inativar este funcionário?")) return;
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/rh/${id}/inativar`, { method: 'PATCH' });
      if (res.ok) {
        alert("Funcionário inativado");
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
    <div className="p-8 space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Gestão de RH</h1>
          <p className="text-slate-500 font-medium">Controle de colaboradores com validação e filtros avançados.</p>
        </div>
        
        <PermissaoGuard permissao="gerenciar_usuarios">
          <button
            onClick={() => { setEditingFunc(null); setShowModal(true); setFormData({ nome: '', cpf: '', email: '', cargo_base: '', data_admissao: '', role: 'TRABALHADOR', status: 'ATIVO' }); setErrors({}); }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-200 active:scale-95 flex items-center gap-2"
          >
            <span className="text-xl">+</span> Novo Colaborador
          </button>
        </PermissaoGuard>
      </div>

      <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-[2.5rem] p-8 shadow-sm">
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex-1 min-w-[300px] relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input 
              type="text" 
              placeholder="Buscar por nome, matrícula ou CPF..."
              className="w-full bg-slate-50 dark:bg-gray-800 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          <select 
            className="bg-slate-50 dark:bg-gray-800 border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10"
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
            className="bg-slate-50 dark:bg-gray-800 border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10"
            value={filtros.cargo}
            onChange={(e) => setFiltros({...filtros, cargo: e.target.value})}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b dark:border-gray-800">
                <th className="pb-4 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => handleSort('matricula')}>
                   <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Matrícula {filtros.sortBy === 'matricula' && (filtros.sortOrder === 'asc' ? '↑' : '↓')}
                   </div>
                </th>
                <th className="pb-4 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => handleSort('nome')}>
                  <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Colaborador {filtros.sortBy === 'nome' && (filtros.sortOrder === 'asc' ? '↑' : '↓')}
                  </div>
                </th>
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cargo</th>
                <th className="pb-4 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => handleSort('data_admissao')}>
                  <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Admissão {filtros.sortBy === 'data_admissao' && (filtros.sortOrder === 'asc' ? '↑' : '↓')}
                  </div>
                </th>
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-800">
              {loading ? (
                <tr><td colSpan="6" className="py-20 text-center text-slate-400 font-black animate-pulse">Sincronizando dados...</td></tr>
              ) : funcionarios.length === 0 ? (
                <tr><td colSpan="6" className="py-20 text-center text-slate-400 font-black">Nenhum funcionário encontrado.</td></tr>
              ) : funcionarios.map(f => (
                <tr key={f.id_usuario} className="group hover:bg-slate-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="py-6 text-sm font-black text-indigo-600">{f.matricula}</td>
                  <td className="py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{f.nome}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{f.email || 'Sem e-mail'}</span>
                    </div>
                  </td>
                  <td className="py-6 text-sm font-bold text-slate-600 dark:text-slate-400">{f.cargo_base || 'Não definido'}</td>
                  <td className="py-6 text-sm font-medium text-slate-500">
                    {f.data_admissao ? new Date(f.data_admissao).toLocaleDateString() : '-'}
                  </td>
                  <td className="py-6 text-center">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${f.status === 'ATIVO' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                      {f.status}
                    </span>
                  </td>
                  <td className="py-6 text-right">
                    <PermissaoGuard permissao="gerenciar_usuarios">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => { setEditingFunc(f); setFormData({ ...f, data_admissao: f.data_admissao?.split('T')[0] || '' }); setErrors({}); setShowModal(true); }}
                          className="p-2 hover:bg-white rounded-xl shadow-sm text-slate-400 hover:text-indigo-600 transition-all"
                        >
                          ✏️
                        </button>

                        {f.role !== 'PROPRIETARIO' && (
                          <button
                            onClick={() => handleInativar(f.id_usuario)}
                            className="p-2 hover:bg-white rounded-xl shadow-sm text-slate-400 hover:text-rose-600 transition-all"
                          >
                            🗑️
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
          <div className="flex justify-center gap-2 mt-8">
             {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map(p => (
               <button 
                 key={p} 
                 onClick={() => fetchFuncionarios(p)}
                 className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${meta.page === p ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
               >
                 {p}
               </button>
             ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-950 rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-slide-up">
            <div className="p-8 border-b dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  {editingFunc ? 'Editar Cadastro' : 'Novo Colaborador'}
                </h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Módulo de RH e Integração</p>
              </div>
              <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-rose-600 transition-colors shadow-sm">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto max-h-[70vh]">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Nome Completo</label>
                <input required type="text" className={`w-full bg-slate-50 dark:bg-gray-900 border ${errors.nome ? 'border-rose-500' : 'dark:border-gray-800'} rounded-2xl p-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all`} value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
                {errors.nome && <span className="text-[10px] text-rose-500 font-bold mt-2 ml-1">{errors.nome}</span>}
              </div>
              
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">CPF (Apenas números)</label>
                <input required type="text" maxLength="11" className={`w-full bg-slate-50 dark:bg-gray-900 border ${errors.cpf ? 'border-rose-500' : 'dark:border-gray-800'} rounded-2xl p-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all`} value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} />
                {errors.cpf && <span className="text-[10px] text-rose-500 font-bold mt-2 ml-1">{errors.cpf}</span>}
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">E-mail Corporativo</label>
                <input type="email" className={`w-full bg-slate-50 dark:bg-gray-900 border ${errors.email ? 'border-rose-500' : 'dark:border-gray-800'} rounded-2xl p-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all`} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                {errors.email && <span className="text-[10px] text-rose-500 font-bold mt-2 ml-1">{errors.email}</span>}
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Função / Cargo</label>
                <input type="text" className="w-full bg-slate-50 dark:bg-gray-900 border dark:border-gray-800 rounded-2xl p-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all" placeholder="Ex: Engenheiro Junior" value={formData.cargo_base} onChange={e => setFormData({...formData, cargo_base: e.target.value})} />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Data de Admissão</label>
                <input type="date" className="w-full bg-slate-50 dark:bg-gray-900 border dark:border-gray-800 rounded-2xl p-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all" value={formData.data_admissao} onChange={e => setFormData({...formData, data_admissao: e.target.value})} />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Status do Colaborador</label>
                <select 
                  className="w-full bg-slate-50 dark:bg-gray-900 border dark:border-gray-800 rounded-2xl p-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                >
                  <option value="ATIVO">Ativo</option>
                  <option value="INATIVO">Inativo</option>
                </select>
              </div>

              <div className="md:col-span-2 pt-6 flex gap-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 active:scale-95">Salvar Colaborador</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

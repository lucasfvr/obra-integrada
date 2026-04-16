import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth.js';
import { ReadOnlyGuard } from '../../../components/Guards/PermissaoGuard.jsx';
import { TaskSkeleton } from "../../../components/common/SkeletonLoaders.jsx";

export function ObraTasks({ initialTasks = [], idObra, team = [], onRefresh }) {
  const { apiFetch, hasPermissao } = useAuth();
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState('TODAS');
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    id_usuarios: [],
    prioridade: 'NORMAL',
    prazo: ''
  });

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`http://localhost:5000/api/obras/${idObra}/tarefas`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [idObra]);

  const handleStatusChange = async (tarefaId, newStatus) => {
    try {
      const res = await apiFetch(`http://localhost:5000/api/tarefas/${tarefaId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setTasks(tasks.map(t => t.id_tarefa === tarefaId ? { ...t, status: newStatus } : t));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingTask ? 'PUT' : 'POST';
    const url = editingTask 
      ? `http://localhost:5000/api/obras/${idObra}/tarefas/${editingTask.id_tarefa}`
      : `http://localhost:5000/api/obras/${idObra}/tarefas`;

    try {
      const res = await apiFetch(url, {
        method,
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        setEditingTask(null);
        setFormData({ titulo: '', descricao: '', id_usuarios: [], prioridade: 'NORMAL', prazo: '' });
        fetchTasks();
        if (onRefresh) onRefresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (tarefaId) => {
    if (!window.confirm("Deseja realmente excluir esta tarefa?")) return;
    try {
      const res = await apiFetch(`http://localhost:5000/api/obras/${idObra}/tarefas/${tarefaId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchTasks();
        if (onRefresh) onRefresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredTasks = tasks.filter(t => filter === 'TODAS' || t.status === filter);

  if (loading) return <TaskSkeleton />;

  return (
    <div className="space-y-8">
      {/* Controles Superiores */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-1">
        <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-gray-900/50 rounded-2xl w-fit border dark:border-gray-800">
          {['TODAS', 'PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-white dark:bg-gray-800 text-indigo-600 shadow-sm border border-slate-200 dark:border-gray-700' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {f === 'EM_ANDAMENTO' ? 'ANDAMENTO' : f === 'CONCLUIDA' ? 'CONCLUÍDAS' : f}
            </button>
          ))}
        </div>

        {hasPermissao('gerenciar_tarefas') && (
          <ReadOnlyGuard>
            <button 
              onClick={() => { 
                setEditingTask(null); 
                setFormData({ titulo: '', descricao: '', id_usuarios: [], prioridade: 'NORMAL', prazo: '' }); 
                setShowModal(true); 
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20 active:scale-95 flex items-center gap-2 justify-center"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="M12 4.5v15m7.5-7.5h-15" /></svg>
              Nova Tarefa
            </button>
          </ReadOnlyGuard>
        )}
      </div>

      {/* Grid de Tarefas Overhaul */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.length === 0 ? (
          <div className="col-span-full py-24 text-center text-gray-400 font-bold bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-[2rem] border-dashed">
            Nenhuma tarefa encontrada neste status.
          </div>
        ) : (
          filteredTasks.map(task => (
            <div key={task.id_tarefa} className="relative group bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all border-l-8 flex flex-col h-full" style={{ borderLeftColor: task.status === 'CONCLUIDA' ? '#10b981' : task.status === 'EM_ANDAMENTO' ? '#3b82f6' : '#94a3b8' }}>
              <div className="flex justify-between items-start mb-4">
                 <div className="flex gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${task.status === 'CONCLUIDA' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : task.status === 'EM_ANDAMENTO' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-gray-50 dark:bg-gray-800 text-gray-400 border dark:border-gray-700`}>
                      {task.prioridade}
                    </span>
                 </div>
                 {hasPermissao('gerenciar_tarefas') && (
                   <div className="flex gap-1">
                      <button onClick={() => { 
                        setEditingTask(task); 
                        setFormData({
                          ...task, 
                          id_usuarios: task.tb_tarefa_usuario?.map(v => v.id_usuario.toString()) || [],
                          prazo: task.prazo ? task.prazo.split('T')[0] : ''
                        }); 
                        setShowModal(true); 
                      }} className="text-gray-300 hover:text-indigo-600 transition-colors p-1">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                      </button>
                      <button onClick={() => handleDelete(task.id_tarefa)} className="text-gray-300 hover:text-rose-600 transition-colors p-1">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                   </div>
                 )}
              </div>
              
              <h4 className="text-lg font-black text-gray-900 dark:text-white mb-2 leading-tight tracking-tight">{task.titulo}</h4>
              <p className="text-sm text-gray-500 line-clamp-2 mb-6 font-medium leading-relaxed">{task.descricao || 'Sem detalhes técnicos.'}</p>
              
              <div className="flex items-center justify-between mt-auto pt-6 border-t dark:border-gray-800">
                <div className="flex -space-x-3 overflow-hidden">
                  {task.tb_tarefa_usuario?.slice(0, 3).map((v, i) => (
                    <div 
                      key={v.id_usuario} 
                      title={v.tb_usuario?.nome}
                      className="inline-block h-8 w-8 rounded-full ring-4 ring-white dark:ring-gray-900 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 border dark:border-transparent flex items-center justify-center text-[10px] font-black"
                    >
                      {v.tb_usuario?.nome?.charAt(0).toUpperCase() || '?'}
                    </div>
                  ))}
                  {task.tb_tarefa_usuario?.length > 3 && (
                    <div className="flex items-center justify-center h-8 w-8 rounded-full ring-4 ring-white dark:ring-gray-900 bg-gray-100 text-gray-500 text-[10px] font-bold">
                      +{task.tb_tarefa_usuario.length - 3}
                    </div>
                  )}
                  {(!task.tb_tarefa_usuario || task.tb_tarefa_usuario.length === 0) && (
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ninguém listado</span>
                  )}
                </div>
                
                <div className="flex gap-2">
                  {hasPermissao('atualizar_status_tarefa') && (
                    <ReadOnlyGuard>
                       {task.status === 'PENDENTE' && (
                          <button 
                            onClick={() => handleStatusChange(task.id_tarefa, 'EM_ANDAMENTO')}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all shadow-md shadow-indigo-500/10 active:scale-90"
                          >
                             Iniciar
                          </button>
                       )}
                       {task.status === 'EM_ANDAMENTO' && (
                          <button 
                            onClick={() => handleStatusChange(task.id_tarefa, 'CONCLUIDA')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all shadow-md shadow-emerald-500/10 active:scale-90"
                          >
                             Concluir
                          </button>
                       )}
                    </ReadOnlyGuard>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Nova/Editar Tarefa */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-950 rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-slide-up">
            <div className="p-8 border-b dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
              <h3 className="text-xl font-black text-indigo-950 dark:text-white tracking-tight">
                {editingTask ? 'Ajustar Planejamento' : 'Novo Planejamento'}
              </h3>
              <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-rose-600 transition-colors shadow-sm">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">O que precisa ser feito?</label>
                <input 
                  type="text"
                  required
                  className="w-full bg-slate-50 dark:bg-gray-900 border dark:border-gray-800 rounded-2xl p-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                  placeholder="Ex: Instalação das esquadrias da fachada"
                  value={formData.titulo}
                  onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Instruções Técnicas (Opcional)</label>
                <textarea 
                  className="w-full bg-slate-50 dark:bg-gray-900 border dark:border-gray-800 rounded-2xl p-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all min-h-[100px]"
                  placeholder="Descreva aqui o que deve ser feito com detalhes..."
                  value={formData.descricao}
                  onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Quem fará? (Selecione um ou mais)</label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
                  {team.map(m => {
                    const isSelected = formData.id_usuarios.includes(m.id_usuario);
                    return (
                      <button
                        key={m.id_usuario}
                        type="button"
                        onClick={() => {
                          const newIds = isSelected 
                            ? formData.id_usuarios.filter(id => id !== m.id_usuario)
                            : [...formData.id_usuarios, m.id_usuario];
                          setFormData({ ...formData, id_usuarios: newIds });
                        }}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                          isSelected 
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200' 
                            : 'bg-white dark:bg-gray-900 text-gray-400 border-gray-100 dark:border-gray-800 hover:border-indigo-200'
                        }`}
                      >
                        {m.tb_usuario.nome}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Importância</label>
                <select 
                  className="w-full bg-slate-50 dark:bg-gray-900 border dark:border-gray-800 rounded-2xl p-4 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all dark:text-white"
                  value={formData.prioridade}
                  onChange={(e) => setFormData({...formData, prioridade: e.target.value})}
                >
                  <option value="BAIXA">🧊 BAIXA</option>
                  <option value="NORMAL">⚡ NORMAL</option>
                  <option value="ALTA">🔥 ALTA</option>
                  <option value="URGENTE">🚨 URGENTE</option>
                </select>
              </div>
              <div className="pt-6 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-500 hover:bg-slate-50 transition-colors"
                >
                  Sair
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
                >
                  {editingTask ? 'Salvar Plano' : 'Ativar Tarefa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


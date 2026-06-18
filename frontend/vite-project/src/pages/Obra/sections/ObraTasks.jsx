import API_BASE_URL from "../../../config/api.js";
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../../hooks/useAuth.js';
import { ReadOnlyGuard } from '../../../components/Guards/PermissaoGuard.jsx';
import { TaskSkeleton } from "../../../components/common/SkeletonLoaders.jsx";
import { useToast } from '../../../context/ToastContext.jsx';

export function ObraTasks({ initialTasks = [], idObra, team = [], manager = null, onRefresh }) {
  const { apiFetch, hasPermissao } = useAuth();
  const { toast, showConfirm } = useToast();
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState('TODAS');
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 9; // 3x3 grid looks better with 9 or 12 items

  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    id_usuarios: [],
    prioridade: 'NORMAL',
    prazo: ''
  });
  
  // Consolida o pessoal disponível (Gerente + Equipe)
  const availableStaff = [
    ...(manager ? [{ id_usuario: manager.id_usuario, nome: manager.nome, papel: 'Responsável' }] : []),
    ...(team.map(m => ({ id_usuario: m.id_usuario, nome: m.tb_usuario?.nome, papel: m.tb_papel?.nome || 'Membro' })))
  ].filter((v, i, a) => a.findIndex(t => t.id_usuario === v.id_usuario) === i); // Remove duplicatas se o gerente estiver na equipe

  const fetchTasks = async () => {
    try {
      setLoading(true);
      // Inclui paginação e filtro na query
      const url = `${API_BASE_URL}/api/obras/${idObra}/tarefas?page=${page}&limit=${LIMIT}`;
      const res = await apiFetch(url);
      if (res.ok) {
        const result = await res.json();
        // O backend retorna { data: [], meta: { totalPages, ... } }
        setTasks(result.data || []);
        setTotalPages(result.meta?.totalPages || 1);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [idObra, page]); // Recarrega ao mudar obra ou página

  // Resetar para página 1 ao trocar o filtro (embora o filtro atual seja local no frontend, no ideal seria via backend se houvesse muitas tarefas)
  useEffect(() => {
    setPage(1);
  }, [filter]);

  const handleStatusChange = async (tarefaId, newStatus) => {
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/tarefas/${tarefaId}`, {
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
      ? `${API_BASE_URL}/api/obras/${idObra}/tarefas/${editingTask.id_tarefa}`
      : `${API_BASE_URL}/api/obras/${idObra}/tarefas`;

    try {
      // Limpamos o payload para enviar apenas o necessário e evitar erros de estrutura
      const payload = {
        titulo: formData.titulo,
        descricao: formData.descricao,
        id_usuarios: formData.id_usuarios.map(id => Number(id)),
        prioridade: formData.prioridade,
        prazo: formData.prazo
      };

      const res = await apiFetch(url, {
        method,
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast.success(editingTask ? 'Tarefa atualizada com sucesso!' : 'Tarefa criada com sucesso!', editingTask ? 'Atualizada' : 'Criada');
        setShowModal(false);
        setEditingTask(null);
        setFormData({ titulo: '', descricao: '', id_usuarios: [], prioridade: 'NORMAL', prazo: '' });
        fetchTasks();
        if (onRefresh) onRefresh();
      } else {
        const errData = await res.json();
        toast.error('Erro ao salvar tarefa: ' + (errData.erro || 'Verifique os dados'), 'Erro');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (tarefaId) => {
    const confirmed = await showConfirm({
      title: 'Excluir Tarefa',
      message: 'Deseja realmente excluir esta tarefa? Esta ação não pode ser desfeita.',
      confirmLabel: 'Sim, excluir',
      cancelLabel: 'Cancelar',
      type: 'danger'
    });
    if (!confirmed) return;
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/obras/${idObra}/tarefas/${tarefaId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        toast.success('Tarefa excluída com sucesso!', 'Excluída');
        fetchTasks();
        if (onRefresh) onRefresh();
      } else {
        toast.error('Erro ao excluir tarefa.', 'Erro');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredTasks = tasks.filter(t => filter === 'TODAS' || t.status === filter);

  if (loading) return <TaskSkeleton />;

  return (
    <div className="space-y-6">
      {/* Controles Superiores */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-1 p-1 bg-muted/50 rounded-lg w-fit border border-border">
          {['TODAS', 'PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                filter === f 
                  ? 'bg-card text-foreground border border-border shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
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
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 justify-center"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M12 4.5v15m7.5-7.5h-15" /></svg>
              Nova Tarefa
            </button>
          </ReadOnlyGuard>
        )}
      </div>

      {/* Grid de Tarefas Overhaul */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.length === 0 ? (
          <div className="col-span-full py-16 text-center text-muted-foreground font-semibold bg-card border border-dashed border-border rounded-xl">
            Nenhuma tarefa encontrada neste status.
          </div>
        ) : (
          filteredTasks.map(task => (
            <div 
              key={task.id_tarefa} 
              className="relative bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all border-l-4 flex flex-col h-full" 
              style={{ borderLeftColor: task.status === 'CONCLUIDA' ? 'var(--success)' : task.status === 'EM_ANDAMENTO' ? 'var(--primary)' : 'var(--muted-foreground)' }}
            >
              <div className="flex justify-between items-start mb-4">
                 <div className="flex gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      task.status === 'CONCLUIDA' 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-inset ring-emerald-500/20' 
                        : task.status === 'EM_ANDAMENTO' 
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-1 ring-inset ring-blue-500/20' 
                          : 'bg-muted text-muted-foreground ring-1 ring-inset ring-border'
                    }`}>
                      {task.status === 'EM_ANDAMENTO' ? 'Andamento' : task.status === 'CONCLUIDA' ? 'Concluída' : 'Pendente'}
                    </span>
                    <span className="rounded-full px-2 py-0.5 text-xs font-semibold bg-muted text-muted-foreground">
                      {task.prioridade}
                    </span>
                 </div>
                 {hasPermissao('gerenciar_tarefas') && (
                   <div className="flex gap-1">
                      <button onClick={() => { 
                        setEditingTask(task); 
                        setFormData({
                          ...task, 
                          id_usuarios: task.tb_tarefa_usuario?.map(v => Number(v.id_usuario)) || [],
                          prazo: task.prazo ? task.prazo.split('T')[0] : ''
                        }); 
                        setShowModal(true); 
                      }} className="text-muted-foreground hover:text-primary transition-colors p-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                      </button>
                      <button onClick={() => handleDelete(task.id_tarefa)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                   </div>
                 )}
              </div>
              
              <h4 className="text-sm font-semibold text-foreground mb-1 leading-tight">{task.titulo}</h4>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-4 font-normal leading-relaxed">{task.descricao || 'Sem detalhes técnicos.'}</p>
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                <div className="flex -space-x-2 overflow-hidden">
                  {task.tb_tarefa_usuario?.slice(0, 3).map((v) => (
                    <div 
                      key={v.id_usuario} 
                      title={v.tb_usuario?.nome}
                      className="inline-block h-6 w-6 rounded-full ring-2 ring-card bg-muted text-muted-foreground border border-border flex items-center justify-center text-[10px] font-semibold"
                    >
                      {v.tb_usuario?.nome?.charAt(0).toUpperCase() || '?'}
                    </div>
                  ))}
                  {task.tb_tarefa_usuario?.length > 3 && (
                    <div className="flex items-center justify-center h-6 w-6 rounded-full ring-2 ring-card bg-muted text-muted-foreground text-[9px] font-semibold">
                      +{task.tb_tarefa_usuario.length - 3}
                    </div>
                  )}
                  {(!task.tb_tarefa_usuario || task.tb_tarefa_usuario.length === 0) && (
                    <span className="text-xs text-muted-foreground">Não atribuída</span>
                  )}
                </div>
                
                <div className="flex gap-2">
                  {hasPermissao('atualizar_status_tarefa') && (
                    <ReadOnlyGuard>
                       {task.status === 'PENDENTE' && (
                          <button 
                            onClick={() => handleStatusChange(task.id_tarefa, 'EM_ANDAMENTO')}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                          >
                             Iniciar
                          </button>
                       )}
                       {task.status === 'EM_ANDAMENTO' && (
                          <button 
                            onClick={() => handleStatusChange(task.id_tarefa, 'CONCLUIDA')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
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

      {/* Paginação UI */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8 pb-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              page === 1 
                ? 'bg-muted text-muted-foreground cursor-not-allowed border border-border' 
                : 'bg-card text-foreground hover:bg-muted border border-border shadow-sm'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
            Anterior
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Página</span>
            <span className="h-8 w-8 flex items-center justify-center bg-primary text-primary-foreground rounded-lg text-xs font-semibold">
              {page}
            </span>
            <span className="text-xs text-muted-foreground">de {totalPages}</span>
          </div>

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              page === totalPages 
                ? 'bg-muted text-muted-foreground cursor-not-allowed border border-border' 
                : 'bg-card text-foreground hover:bg-muted border border-border shadow-sm'
            }`}
          >
            Próxima
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
          </button>
        </div>
      )}

      {/* Modal Nova/Editar Tarefa */}
      {showModal && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-card rounded-xl w-full max-w-lg shadow-lg border border-border overflow-hidden animate-slide-up">
            <div className="p-5 border-b border-border flex justify-between items-center bg-muted/30">
              <h3 className="text-base font-semibold text-foreground tracking-tight">
                {editingTask ? 'Ajustar Planejamento' : 'Novo Planejamento'}
              </h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1 block">O que precisa ser feito?</label>
                <input 
                  type="text"
                  required
                  className="w-full bg-card border border-border rounded-lg p-2 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="Ex: Instalação das esquadrias da fachada"
                  value={formData.titulo}
                  onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1 block">Instruções Técnicas (Opcional)</label>
                <textarea 
                  className="w-full bg-card border border-border rounded-lg p-2 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all min-h-[80px]"
                  placeholder="Descreva aqui o que deve ser feito com detalhes..."
                  value={formData.descricao}
                  onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1 block">Quem fará? (Selecione um ou mais)</label>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-1 border border-border rounded-lg bg-muted/10">
                  {availableStaff.length === 0 ? (
                    <p className="text-xs text-amber-600 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 w-full">
                      Nenhum membro vinculado à obra.
                    </p>
                  ) : (
                    availableStaff.map(m => {
                      const isSelected = formData.id_usuarios.map(id => Number(id)).includes(Number(m.id_usuario));
                      return (
                        <button
                          key={m.id_usuario}
                          type="button"
                          onClick={() => {
                            const userId = Number(m.id_usuario);
                            const isSelected = formData.id_usuarios.map(id => Number(id)).includes(userId);
                            
                            const newIds = isSelected 
                              ? formData.id_usuarios.filter(id => Number(id) !== userId)
                              : [...formData.id_usuarios, userId];
                            
                            setFormData({ ...formData, id_usuarios: newIds });
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border flex flex-col items-start ${
                            isSelected 
                              ? 'bg-primary text-primary-foreground border-primary' 
                              : 'bg-card text-muted-foreground border-border hover:border-primary'
                          }`}
                        >
                          <span>{m.nome}</span>
                          <span className={`text-[10px] opacity-70 ${isSelected ? 'text-primary-foreground' : 'text-primary'}`}>{m.papel}</span>
                        </button>
                      )
                    })
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1 block">Importância</label>
                <select 
                  className="w-full bg-card border border-border rounded-lg p-2 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  value={formData.prioridade}
                  onChange={(e) => setFormData({...formData, prioridade: e.target.value})}
                >
                  <option value="BAIXA">🧊 BAIXA</option>
                  <option value="NORMAL">⚡ NORMAL</option>
                  <option value="ALTA">🔥 ALTA</option>
                  <option value="URGENTE">🚨 URGENTE</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3 justify-end border-t border-border">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sair
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold rounded-lg transition-colors"
                >
                  {editingTask ? 'Salvar Plano' : 'Ativar Tarefa'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}


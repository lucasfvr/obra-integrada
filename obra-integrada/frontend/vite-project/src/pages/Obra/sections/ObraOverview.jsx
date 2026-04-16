import React from 'react';
import { useAuth } from '../../../hooks/useAuth.js';

function StatCard({ label, value, subvalue, icon, color }) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800',
    amber:  'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
    green:  'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
    rose:   'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-800',
  };
  const c = colors[color] || colors.indigo;

  return (
    <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-[2rem] p-6 shadow-sm hover-lift group">
      <div className="flex items-center gap-4 mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:rotate-6 ${c}`}>
          {icon}
        </div>
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
          <p className="text-xl font-black text-gray-900 dark:text-white leading-tight mt-0.5">{value}</p>
        </div>
      </div>
      <p className="text-xs font-bold text-gray-500 flex items-center gap-1.5 px-1 truncate">
         <span className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-gray-700"></span>
         {subvalue}
      </p>
    </div>
  );
}

export function ObraOverview({ obra: initialObra, onRefresh }) {
  const { apiFetch } = useAuth();
  const [obra, setObra] = React.useState(initialObra);
  const [isEditing, setIsEditing] = React.useState(false);
  const [availableResponsibles, setAvailableResponsibles] = React.useState([]);
  const [editForm, setEditForm] = React.useState({
    nome_proprietario_obra: initialObra.nome_proprietario_obra || '',
    objetivo: initialObra.objetivo || '',
    observacoes: initialObra.observacoes || '',
    id_usuario_responsavel: initialObra.id_usuario_responsavel || ''
  });
  const [saving, setSaving] = React.useState(false);

  const dataInicio = obra.data_inicio ? new Date(obra.data_inicio).toLocaleDateString('pt-BR') : 'N/A';
  const previsaoTermino = obra.previsao_termino ? new Date(obra.previsao_termino).toLocaleDateString('pt-BR') : 'N/A';
  
  const tarefasPendentes = obra.tb_tarefa ? obra.tb_tarefa.filter(t => t.status === 'PENDENTE').length : 0;

  const fetchResponsibles = async () => {
    try {
      const res = await apiFetch('http://localhost:5000/api/usuarios-disponiveis?funcao=RESPONSAVEL');
      if (res.ok) {
        const data = await res.json();
        setAvailableResponsibles(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleStartEdit = () => {
    fetchResponsibles();
    setIsEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await apiFetch(`http://localhost:5000/api/obras/${obra.id_obra}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...editForm,
          id_usuario_responsavel: Number(editForm.id_usuario_responsavel)
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setObra({ ...obra, ...updated });
        setIsEditing(false);
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error("Erro ao salvar obra:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Grid de Stats Overhaul */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Status Geral" 
          value="No Prazo" 
          subvalue="Sincronizado com Cronograma"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
          color="indigo"
        />
        <StatCard 
          label="Início do Projeto" 
          value={dataInicio} 
          subvalue="Data Fixada em Contrato"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A1.125 1.125 0 0120.25 10.125V21" /></svg>}
          color="amber"
        />
        <StatCard 
          label="Entrega Estimada" 
          value={previsaoTermino} 
          subvalue="Previsão de Habite-se"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          color="green"
        />
        <StatCard 
          label="Pendências" 
          value={tarefasPendentes.toString()} 
          subvalue={tarefasPendentes === 1 ? "1 tarefa aguardando" : `${tarefasPendentes} tarefas aguardando`}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          color="rose"
        />
      </div>

      {/* Info Adicional */}
      <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-[2.5rem] p-8 md:p-12 shadow-sm relative overflow-hidden">
         <div className="absolute top-8 right-8 flex gap-2">
            {isEditing ? (
              <>
                <button 
                  onClick={() => setIsEditing(false)} 
                  className="px-4 py-2 text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSave} 
                  disabled={saving}
                  className="px-6 py-2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                >
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </>
            ) : (
              <button 
                onClick={handleStartEdit} 
                className="flex items-center gap-2 px-6 py-2 bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-300 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                Editar Informações
              </button>
            )}
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
               <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Empreendimento</h3>
               
               <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Dono / Cliente</p>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={editForm.nome_proprietario_obra}
                        onChange={(e) => setEditForm({...editForm, nome_proprietario_obra: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-gray-800 border-b-2 border-indigo-500 py-2 px-3 text-sm font-bold text-slate-900 dark:text-white outline-none rounded-lg"
                      />
                    ) : (
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{obra.nome_proprietario_obra || 'Vanguarda Empreendimentos'}</p>
                    )}
                  </div>

                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Engenheiro Responsável</p>
                    {isEditing ? (
                      <select 
                        value={editForm.id_usuario_responsavel}
                        onChange={(e) => setEditForm({...editForm, id_usuario_responsavel: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-gray-800 border-b-2 border-indigo-500 py-2 px-3 text-sm font-bold text-slate-900 dark:text-white outline-none rounded-lg"
                      >
                         <option value="">Selecione...</option>
                         {availableResponsibles.map(u => (
                           <option key={u.id_usuario} value={u.id_usuario}>{u.nome}</option>
                         ))}
                      </select>
                    ) : (
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{obra.tb_usuario?.nome || 'Nenhum'}</p>
                    )}
                  </div>
               </div>
               
               <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 mt-8">Localização</h3>
               <p className="text-sm font-bold text-gray-900 dark:text-white leading-snug">
                  {obra.logradouro}, {obra.numero}<br/>
                  {obra.bairro} — {obra.cidade}/{obra.estado}
               </p>
            </div>

            <div className="md:col-span-2">
               <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-4">Objetivo da Obra</h3>
               <div className="bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-500/20 p-5 rounded-2xl mb-6">
                 {isEditing ? (
                   <textarea 
                     rows="4"
                     value={editForm.objetivo}
                     onChange={(e) => setEditForm({...editForm, objetivo: e.target.value})}
                     className="w-full bg-transparent text-sm text-indigo-900 dark:text-indigo-200 font-medium leading-relaxed outline-none resize-none"
                   />
                 ) : (
                   <p className="text-sm text-indigo-900 dark:text-indigo-200 font-medium leading-relaxed">
                      {obra.objetivo || 'Objetivo do empreendimento não documentado.'}
                   </p>
                 )}
               </div>
               
               <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Observações Técnicas</h3>
               {isEditing ? (
                 <textarea 
                   rows="2"
                   value={editForm.observacoes}
                   onChange={(e) => setEditForm({...editForm, observacoes: e.target.value})}
                   className="w-full bg-slate-50 dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 p-3 text-xs text-gray-500 italic leading-relaxed outline-none rounded-lg"
                 />
               ) : (
                 <p className="text-xs text-gray-500 italic leading-relaxed">
                    {obra.observacoes || 'Nenhuma observação técnica registrada.'}
                 </p>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}


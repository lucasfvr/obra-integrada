import API_BASE_URL from "../../../config/api.js";
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth.js';
import toast from 'react-hot-toast';

function UserAvatar({ nome, role }) {
  const initial = nome ? nome.charAt(0).toUpperCase() : 'U';
  return (
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-sm border dark:border-transparent shadow-sm">
        {initial}
      </div>
      <div className="flex flex-col">
        <p className="text-sm font-black text-indigo-950 dark:text-white leading-tight tracking-tight">{nome}</p>
        <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-[0.15em] font-black">{role}</p>
      </div>
    </div>
  );
}

export function ObraTeam({ team = [], manager, idObra, onRefresh }) {
  const { apiFetch } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  const [formData, setFormData] = useState({
    id_usuario: '',
    email: '',
    nome: '',
    id_papel: 1, // Default: Membro
    valor_dia: 0
  });
  const [inviteMode, setInviteMode] = useState('platform'); // 'platform' or 'email'

  const papéis = [
    { id: 1, nome: 'Membro' },
    { id: 2, nome: 'Mestre' },
    { id: 3, nome: 'Engenheiro' },
    { id: 4, nome: 'Pedreiro' },
    { id: 5, nome: 'Ajudante' },
    { id: 6, nome: 'Eletricista' },
    { id: 7, nome: 'Encanador' },
  ];

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await apiFetch('${API_BASE_URL}/api/usuarios-disponiveis');
      if (res.ok) {
        const data = await res.json();
        setAvailableUsers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingMember(null);
    setFormData({ id_usuario: '', id_papel: 1, valor_dia: 0 });
    setShowModal(true);
    fetchUsers();
  };

  const handleOpenEdit = (member) => {
    setEditingMember(member);
    setFormData({ 
      id_usuario: member.id_usuario, 
      id_papel: member.id_papel, 
      valor_dia: Number(member.valor_dia || 0) 
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEdit = !!editingMember;
    const url = isEdit 
      ? `${API_BASE_URL}/api/obras/${idObra}/equipe/${editingMember.id_usuario}`
      : `${API_BASE_URL}/api/obras/${idObra}/equipe`;
    
    try {
      const res = await apiFetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success(isEdit ? "Membro atualizado!" : "Membro adicionado!");
        setShowModal(false);
        onRefresh();
      } else {
        const err = await res.json();
        toast.error(err.erro || "Erro na operação");
      }
    } catch (err) {
      toast.error("Erro de conexão");
    }
  };

  const handleDelete = async (idUsuario) => {
    if (!window.confirm("Remover este membro da equipe?")) return;
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/obras/${idObra}/equipe/${idUsuario}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        toast.success("Membro removido");
        onRefresh();
      }
    } catch (err) {
      toast.error("Erro ao remover");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-slide-up">
      {/* Gestor da Obra - Hero Style */}
      <div className="lg:col-span-1 space-y-6">
        <div>
           <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Gestão do Projeto</h3>
           <div className="relative overflow-hidden bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-[2.5rem] p-8 shadow-sm group">
             <div className="absolute top-0 right-0 p-4 opacity-5">
                <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
             </div>
             <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] mb-6">Responsável Técnico</p>
             {manager ? (
               <div className="space-y-6">
                 <UserAvatar nome={manager.nome} role={manager.role || 'Engenheiro Responsável'} />
                 <div className="pt-6 border-t dark:border-gray-800 space-y-4">
                   <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:text-indigo-600 transition-colors">
                         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                      </div>
                      <span className="text-sm font-bold text-slate-700 dark:text-gray-300">{manager.email}</span>
                   </div>
                   <button className="w-full bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 text-slate-900 dark:text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95">
                      Abrir Chamado
                   </button>
                 </div>
               </div>
             ) : (
               <p className="text-sm text-gray-400 font-bold uppercase tracking-widest italic py-4">Equipe técnica pendente.</p>
             )}
           </div>
        </div>
      </div>

      {/* Lista da Equipe - Modern Table */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between mb-4 px-2">
           <div>
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Membros da Equipe</h3>
              <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mt-1">{team.length} {team.length === 1 ? 'colaborador ativo' : 'colaboradores ativos'}</p>
           </div>
           <button 
             onClick={handleOpenAdd}
             className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
           >
              Adicionar Profissional
           </button>
        </div>
        
        <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-[2.5rem] overflow-hidden shadow-sm">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 dark:bg-gray-800/30 border-b dark:border-gray-800">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Colaborador</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Papel Operacional</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-800 font-medium">
                {team.length > 0 ? team.map((member, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-gray-800/20 transition-colors group">
                    <td className="px-8 py-6 whitespace-nowrap">
                      <UserAvatar nome={member.tb_usuario?.nome} role={member.tb_usuario?.email} />
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-center">
                      <div className="flex flex-col items-center">
                        <span className="px-4 py-1.5 bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-400 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border dark:border-gray-700">
                          {member.tb_papel?.nome || 'Membro'}
                        </span>
                        {member.valor_dia > 0 && (
                          <span className="text-[8px] font-bold text-gray-400 mt-1 uppercase">R$ {member.valor_dia}/dia</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-right space-x-2">
                      <button 
                        onClick={() => handleOpenEdit(member)}
                        className="text-gray-300 hover:text-indigo-600 transition-all transform hover:scale-110 p-2"
                      >
                         <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                      </button>
                      <button 
                         onClick={() => handleDelete(member.id_usuario)}
                         className="text-gray-300 hover:text-rose-600 transition-all transform hover:scale-110 p-2"
                      >
                         <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={3} className="px-8 py-16 text-center text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                      Aguardando vinculação de colaboradores.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL DE GESTÃO DE MEMBRO */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-950 rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-slide-up border dark:border-gray-800">
             <div className="p-8 border-b dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex justify-between items-center">
                <h3 className="text-xl font-black text-indigo-950 dark:text-white tracking-tight">
                  {editingMember ? 'Editar Colaborador' : 'Vincular Profissional'}
                </h3>
                <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-rose-600 transition-colors">✕</button>
             </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                {!editingMember && (
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Selecionar do RH</label>
                    <select 
                      className="w-full bg-slate-50 dark:bg-gray-900 border dark:border-gray-800 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      required
                      value={formData.id_usuario}
                      onChange={(e) => setFormData({...formData, id_usuario: e.target.value})}
                    >
                      <option value="">Escolha um profissional do seu RH...</option>
                      {availableUsers.map(u => (
                        <option key={u.id_usuario} value={u.id_usuario}>{u.nome} ({u.cargo_base || u.role})</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Papel na Obra</label>
                  <select 
                    className="w-full bg-slate-50 dark:bg-gray-900 border dark:border-gray-800 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                    required
                    value={formData.id_papel}
                    onChange={(e) => setFormData({...formData, id_papel: e.target.value})}
                  >
                    {papéis.map(p => (
                      <option key={p.id} value={p.id}>{p.nome}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Valor da Diária (R$)</label>
                  <input 
                    type="number"
                    className="w-full bg-slate-50 dark:bg-gray-900 border dark:border-gray-800 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                    placeholder="0.00"
                    value={formData.valor_dia}
                    onChange={(e) => setFormData({...formData, valor_dia: e.target.value})}
                  />
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-400 hover:bg-slate-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/30 active:scale-95"
                  >
                    Salvar Alterações
                  </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}


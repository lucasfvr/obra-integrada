import API_BASE_URL from "../../../config/api.js";
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../../hooks/useAuth.js';
import { useToast } from '../../../context/ToastContext.jsx';

function UserAvatar({ nome, role }) {
  const initial = nome ? nome.charAt(0).toUpperCase() : 'U';
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-muted text-muted-foreground flex items-center justify-center font-semibold text-sm border border-border">
        {initial}
      </div>
      <div className="flex flex-col">
        <p className="text-sm font-semibold text-foreground leading-none">{nome}</p>
        <p className="text-xs text-muted-foreground mt-1 font-medium">{role}</p>
      </div>
    </div>
  );
}

export function ObraTeam({ team = [], manager, idObra, onRefresh }) {
  const { apiFetch } = useAuth();
  const { toast, showConfirm } = useToast();
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

  const [papéis, setPapéis] = useState([
    { id_papel: 1, nome: 'Membro' },
    { id_papel: 2, nome: 'Mestre' },
    { id_papel: 3, nome: 'Engenheiro' },
    { id_papel: 4, nome: 'Pedreiro' },
    { id_papel: 5, nome: 'Ajudante' },
    { id_papel: 6, nome: 'Eletricista' },
    { id_papel: 7, nome: 'Encanador' },
  ]);

  useEffect(() => {
    apiFetch(`${API_BASE_URL}/api/papeis`)
      .then(res => {
        if (res.ok) return res.json();
      })
      .then(data => {
        if (data && data.length > 0) {
          // Map id_papel to id for select compatibility
          const formatted = data.map(p => ({ id: p.id_papel, nome: p.nome }));
          setPapéis(formatted);
        }
      })
      .catch(err => console.error('[OBRA] Erro ao buscar papeis:', err));
  }, [apiFetch]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await apiFetch(`${API_BASE_URL}/api/usuarios-disponiveis`);
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
      id_papel: member.id_papel || 1,
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
        toast.success(isEdit ? 'Membro atualizado com sucesso!' : 'Membro adicionado com sucesso!', isEdit ? 'Atualizado' : 'Adicionado');
        setShowModal(false);
        onRefresh();
      } else {
        const err = await res.json();
        toast.error(err.erro || 'Erro na operação', 'Erro');
      }
    } catch (err) {
      toast.error('Erro de conexão', 'Erro');
    }
  };

  const handleDelete = async (idUsuario) => {
    const confirmed = await showConfirm({
      title: 'Remover Membro',
      message: 'Deseja remover este membro da equipe? Ele poderá ser readicionado depois.',
      confirmLabel: 'Sim, remover',
      cancelLabel: 'Cancelar',
      type: 'danger'
    });
    if (!confirmed) return;
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/obras/${idObra}/equipe/${idUsuario}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        toast.success('Membro removido da equipe.', 'Removido');
        onRefresh();
      }
    } catch (err) {
      toast.error('Erro ao remover membro.', 'Erro');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up">
      {/* Gestor da Obra */}
      <div className="lg:col-span-1 space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-4">Gestão do Projeto</h3>
          <div className="relative overflow-hidden bg-card border border-border rounded-xl p-5 shadow-sm group">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-4">Responsável Técnico</p>
            {manager ? (
              <div className="space-y-4">
                <UserAvatar nome={manager.nome} role={manager.role || 'Engenheiro Responsável'} />
                <div className="pt-4 border-t border-border space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                    </div>
                    <span className="text-xs text-muted-foreground truncate">{manager.email}</span>
                  </div>
                  <button className="w-full bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/70 py-2 rounded-lg text-xs font-semibold transition-all">
                    Abrir Chamado
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic py-2">Equipe técnica pendente.</p>
            )}
          </div>
        </div>
      </div>

      {/* Lista da Equipe */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between mb-4 px-1">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Membros da Equipe</h3>
            <p className="text-xs text-muted-foreground mt-1">{team.length} {team.length === 1 ? 'colaborador ativo' : 'colaboradores ativos'}</p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Adicionar Profissional
          </button>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left">
              <thead className="bg-muted/30 border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase">Colaborador</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase text-center">Papel Operacional</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {team.length > 0 ? team.map((member, i) => (
                  <tr key={i} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <UserAvatar nome={member.tb_usuario?.nome} role={member.tb_usuario?.email} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="px-2.5 py-1 bg-muted text-muted-foreground rounded-full text-xs font-semibold">
                          {member.tb_papel?.nome || 'Membro'}
                        </span>
                        {member.valor_dia > 0 && (
                          <span className="text-[10px] text-muted-foreground font-medium">R$ {member.valor_dia}/dia</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(member)}
                        className="text-muted-foreground hover:text-primary transition-colors p-1"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                      </button>
                      <button
                        onClick={() => handleDelete(member.id_usuario)}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground font-semibold text-xs">
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
      {showModal && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-card rounded-xl w-full max-w-md shadow-lg overflow-hidden animate-slide-up border border-border">
            <div className="p-5 border-b border-border bg-muted/30 flex justify-between items-center">
              <h3 className="text-base font-semibold text-foreground tracking-tight">
                {editingMember ? 'Editar Colaborador' : 'Vincular Profissional'}
              </h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {!editingMember && (
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Selecionar do RH</label>
                  <select
                    className="w-full bg-card border border-border rounded-lg p-2 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    required
                    value={formData.id_usuario}
                    onChange={(e) => setFormData({ ...formData, id_usuario: e.target.value })}
                  >
                    <option value="">Escolha um profissional do seu RH...</option>
                    {availableUsers.map(u => (
                      <option key={u.id_usuario} value={u.id_usuario}>{u.nome} ({u.cargo_base || u.role})</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Papel na Obra</label>
                <select
                  className="w-full bg-card border border-border rounded-lg p-2 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  required
                  value={formData.id_papel}
                  onChange={(e) => setFormData({ ...formData, id_papel: e.target.value })}
                >
                  {papéis.map(p => (
                    <option key={p.id} value={p.id}>{p.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Valor da Diária (R$)</label>
                <input
                  type="number"
                  className="w-full bg-card border border-border rounded-lg p-2 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="0.00"
                  value={formData.valor_dia}
                  onChange={(e) => setFormData({ ...formData, valor_dia: e.target.value })}
                />
              </div>

              <div className="pt-4 flex gap-3 justify-end border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold rounded-lg transition-colors"
                >
                  Salvar Alterações
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

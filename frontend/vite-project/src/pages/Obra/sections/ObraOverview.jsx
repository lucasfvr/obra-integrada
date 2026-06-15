import API_BASE_URL from "../../../config/api.js";
import React from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../../hooks/useAuth.js';
import { PermissaoGuard } from '../../../components/Guards/PermissaoGuard.jsx';
import { toast } from 'react-hot-toast';

function StatCard({ label, value, subvalue, icon, color }) {
  const colors = {
    indigo: { soft: 'bg-primary/10 text-primary', valueText: 'text-foreground' },
    amber:  { soft: 'bg-amber-500/15 text-amber-600 dark:text-amber-400', valueText: 'text-foreground' },
    green:  { soft: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', valueText: 'text-foreground' },
    rose:   { soft: 'bg-destructive/10 text-destructive', valueText: 'text-destructive' },
  };
  const c = colors[color] || colors.indigo;

  return (
    <div className={`rounded-xl border bg-card p-5 shadow-sm transition-all duration-200 ${color === 'rose' ? 'border-destructive/30' : 'border-border'}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${c.soft}`}>
          {React.cloneElement(icon, { className: 'h-[18px] w-[18px]' })}
        </div>
      </div>
      <p className={`mt-4 text-3xl font-semibold tracking-tight ${c.valueText}`}>
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{subvalue}</p>
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
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const dataInicio = obra.data_inicio ? new Date(obra.data_inicio).toLocaleDateString('pt-BR') : 'N/A';
  const previsaoTermino = obra.previsao_termino ? new Date(obra.previsao_termino).toLocaleDateString('pt-BR') : 'N/A';
  const tarefasPendentes = obra.tb_tarefa ? obra.tb_tarefa.filter(t => t.status === 'PENDENTE').length : 0;

  const fetchResponsibles = async () => {
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/usuarios-disponiveis?funcao=RESPONSAVEL&cargo_base=Engenheiro`);
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
      const res = await apiFetch(`${API_BASE_URL}/api/obras/${obra.id_obra}`, {
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
        toast.success('Alterações salvas!');
        if (onRefresh) onRefresh();
      } else {
        toast.error('Erro ao salvar alterações.');
      }
    } catch (err) {
      console.error("Erro ao salvar obra:", err);
      toast.error("Erro de conexão.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/obras/${obra.id_obra}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        toast.success("Obra excluída com sucesso.");
        window.location.href = '/dashboard';
      } else {
        const err = await res.json();
        toast.error(err.erro || "Erro ao excluir obra.");
      }
    } catch (err) {
      console.error("Erro ao excluir obra:", err);
      toast.error("Erro de conexão ao excluir.");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Status Geral"
          value="No Prazo"
          subvalue="Sincronizado com Cronograma"
          icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
          color="indigo"
        />
        <StatCard
          label="Início do Projeto"
          value={dataInicio}
          subvalue="Data Fixada em Contrato"
          icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5" /></svg>}
          color="amber"
        />
        <StatCard
          label="Entrega Estimada"
          value={previsaoTermino}
          subvalue="Previsão de Habite-se"
          icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          color="green"
        />
        <StatCard
          label="Pendências"
          value={tarefasPendentes.toString()}
          subvalue={tarefasPendentes === 1 ? "1 tarefa aguardando" : `${tarefasPendentes} tarefas aguardando`}
          icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          color="rose"
        />
      </div>

      {/* Info Card */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm relative">
        {/* Ações */}
        <div className="absolute top-5 right-5 flex gap-2">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              <PermissaoGuard permissao="editar_obra">
                <button
                  onClick={handleStartEdit}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-muted text-muted-foreground hover:text-foreground text-xs font-medium rounded-lg transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  Editar
                </button>
              </PermissaoGuard>
              <PermissaoGuard permissao="excluir_obra">
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground text-xs font-medium rounded-lg transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  Excluir
                </button>
              </PermissaoGuard>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pr-40">
          {/* Coluna esquerda */}
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">Empreendimento</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Dono / Cliente</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.nome_proprietario_obra}
                      onChange={(e) => setEditForm({...editForm, nome_proprietario_obra: e.target.value})}
                      className="w-full bg-background border border-border rounded-lg py-2 px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  ) : (
                    <p className="text-sm font-medium text-foreground">{obra.nome_proprietario_obra || '—'}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Engenheiro Responsável</label>
                  {isEditing ? (
                    <select
                      value={editForm.id_usuario_responsavel}
                      onChange={(e) => setEditForm({...editForm, id_usuario_responsavel: e.target.value})}
                      className="w-full bg-background border border-border rounded-lg py-2 px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    >
                      <option value="">Selecione...</option>
                      {availableResponsibles.map(u => (
                        <option key={u.id_usuario} value={u.id_usuario}>{u.nome}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-sm font-medium text-foreground">{obra.tb_usuario?.nome || '—'}</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Localização</label>
              <p className="text-sm text-foreground leading-snug">
                {obra.logradouro}, {obra.numero}<br/>
                {obra.bairro} — {obra.cidade}/{obra.estado}
              </p>
            </div>
          </div>

          {/* Coluna direita */}
          <div className="md:col-span-2 space-y-5">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Objetivo da Obra</label>
              <div className="bg-muted/30 border border-border p-4 rounded-xl">
                {isEditing ? (
                  <textarea
                    rows="4"
                    value={editForm.objetivo}
                    onChange={(e) => setEditForm({...editForm, objetivo: e.target.value})}
                    className="w-full bg-transparent text-sm text-foreground leading-relaxed outline-none resize-none placeholder:text-muted-foreground"
                    placeholder="Descreva o objetivo da obra..."
                  />
                ) : (
                  <p className="text-sm text-foreground leading-relaxed">
                    {obra.objetivo || 'Objetivo do empreendimento não documentado.'}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Observações Técnicas</label>
              {isEditing ? (
                <textarea
                  rows="3"
                  value={editForm.observacoes}
                  onChange={(e) => setEditForm({...editForm, observacoes: e.target.value})}
                  className="w-full bg-background border border-border rounded-xl p-3 text-sm text-muted-foreground leading-relaxed outline-none resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="Observações técnicas relevantes..."
                />
              ) : (
                <p className="text-sm text-muted-foreground italic leading-relaxed">
                  {obra.observacoes || 'Nenhuma observação técnica registrada.'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-card rounded-xl w-full max-w-sm shadow-2xl border border-border p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-destructive/10 text-destructive rounded-xl flex items-center justify-center mx-auto">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground tracking-tight">Confirmar exclusão</h3>
              <p className="text-xs text-muted-foreground mt-1">Esta ação é permanente e removerá todos os dados vinculados a esta obra.</p>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                {deleting ? 'Excluindo...' : 'Sim, excluir'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

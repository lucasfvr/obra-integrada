import API_BASE_URL from "../../../config/api.js";
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../../hooks/useAuth.js';
import { useToast } from '../../../context/ToastContext.jsx';

export function ObraEstoque({ items = [], idObra, onRefresh }) {
  const { apiFetch } = useAuth();
  const { toast, showConfirm } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    nome_material: '',
    unidade_medida: 'Unidade',
    quantidade: 0,
    valor_total: '',
    fornecedor: '',
    justificativa: ''
  });
  const [showHistory, setShowHistory] = useState(false);
  const [activeHistory, setActiveHistory] = useState([]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({ nome_material: '', unidade_medida: 'Unidade', quantidade: 0, valor_total: '', fornecedor: '', justificativa: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({ 
      nome_material: item.nome_material, 
      unidade_medida: item.unidade_medida, 
      quantidade_nova: item.quantidade,
      valor_total: '',
      fornecedor: '',
      justificativa: ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEdit = !!editingItem;
    const url = isEdit 
      ? `${API_BASE_URL}/api/obras/estoque/${editingItem.id_estoque}`
      : `${API_BASE_URL}/api/obras/${idObra}/estoque`;
    
    // Preparar corpo - se for edit, usamos quantidade_nova como esperado pelo backend
    const body = { ...formData };
    if (isEdit) {
      delete body.quantidade;
    }

    try {
      const res = await apiFetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        body: JSON.stringify(body)
      });

      if (res.ok) {
        toast.success(isEdit ? 'Movimentação registrada com sucesso!' : 'Item adicionado com sucesso!', isEdit ? 'Registrado' : 'Adicionado');
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

  const fetchHistory = async (idItem) => {
    try {
      // Endpoint que retorna tb_movimentacao_estoque vinculada
      const res = await apiFetch(`${API_BASE_URL}/api/obras/estoque/${idItem}/historico`);
      if (res.ok) {
        const data = await res.json();
        setActiveHistory(data);
        setShowHistory(true);
      }
    } catch (e) {
      toast.error('Erro ao carregar histórico.', 'Erro');
    }
  };

  const handleDelete = async (idItem) => {
    const confirmed = await showConfirm({
      title: 'Remover Material',
      message: 'Deseja remover este material permanentemente do estoque? Esta ação não pode ser desfeita.',
      confirmLabel: 'Sim, remover',
      cancelLabel: 'Cancelar',
      type: 'danger'
    });
    if (!confirmed) return;
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/obras/estoque/${idItem}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        toast.success('Material removido do estoque.', 'Removido');
        onRefresh();
      }
    } catch (err) {
      toast.error('Erro ao remover material.', 'Erro');
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Estoque e Insumos</h2>
          <p className="text-xs text-muted-foreground mt-1">Controle de materiais alocados no canteiro</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-card p-2 rounded-xl border border-border shadow-sm">
            <div className="text-right">
              <p className="text-[10px] font-medium text-muted-foreground">Total de Itens</p>
              <p className="text-sm font-semibold text-primary">{items.length}</p>
            </div>
            <div className="w-px h-6 bg-border" />
            <div className="text-right">
              <p className="text-[10px] font-medium text-muted-foreground">Status Almoxarifado</p>
              <p className="text-[10px] font-semibold text-emerald-600 uppercase">Operacional</p>
            </div>
          </div>
          <button 
            onClick={handleOpenAdd}
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Novo Material
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center">
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-xl mx-auto mb-4 grayscale opacity-60">📦</div>
          <p className="text-muted-foreground font-semibold text-xs">Nenhum material registrado no estoque desta obra.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="bg-muted/30 border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase">Material</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase">Unidade</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase">Qtd. em Canteiro</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{item.nome_material}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 bg-muted text-muted-foreground border border-border rounded-md text-[10px] font-semibold uppercase">
                        {item.unidade_medida}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                         <p className="text-sm font-semibold text-foreground">{Number(item.quantidade).toLocaleString('pt-BR')}</p>
                         <div className={`w-1.5 h-1.5 rounded-full ${item.quantidade > 50 ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                      <button 
                        onClick={() => fetchHistory(item.id_estoque)}
                        className="text-muted-foreground hover:text-emerald-600 transition-colors p-1"
                        title="Ver Histórico"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </button>
                      <button 
                        onClick={() => handleOpenEdit(item)}
                        className="text-muted-foreground hover:text-primary transition-colors p-1"
                        title="Movimentar"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id_estoque)}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1"
                        title="Excluir"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL DE MATERIAL */}
      {showModal && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-card rounded-xl w-full max-w-md shadow-lg overflow-hidden animate-slide-up border border-border">
             <div className="p-5 border-b border-border bg-muted/30 flex justify-between items-center">
                <h3 className="text-base font-semibold text-foreground tracking-tight">
                  {editingItem ? 'Editar Material' : 'Novo Material em Canteiro'}
                </h3>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors">✕</button>
             </div>

             <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Nome do Material / Insumo</label>
                  <input 
                    className="w-full bg-card border border-border rounded-lg p-2 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    required
                    placeholder="Ex: Cimento CP-II 50kg"
                    value={formData.nome_material}
                    onChange={(e) => setFormData({...formData, nome_material: e.target.value})}
                  />
                </div>

                 <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Unidade</label>
                    <select 
                      className="w-full bg-card border border-border rounded-lg p-2 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      value={formData.unidade_medida}
                      onChange={(e) => setFormData({...formData, unidade_medida: e.target.value})}
                    >
                      <option>Unidade</option>
                      <option>Saco</option>
                      <option>Kg</option>
                      <option>m³</option>
                      <option>m²</option>
                      <option>Barra</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      {editingItem ? 'Nova Quantidade' : 'Quantidade Inicial'}
                    </label>
                    <input 
                      type="number"
                      step="0.001"
                      className="w-full bg-card border border-border rounded-lg p-2 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      required
                      value={editingItem ? formData.quantidade_nova : formData.quantidade}
                      onChange={(e) => setFormData({...formData, [editingItem ? 'quantidade_nova' : 'quantidade']: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Fornecedor (Opcional)</label>
                    <input 
                      className="w-full bg-card border border-border rounded-lg p-2 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="Ex: Leroy Merlin"
                      value={formData.fornecedor}
                      onChange={(e) => setFormData({...formData, fornecedor: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Valor Gasto (Opcional)</label>
                    <input 
                      type="number"
                      step="0.01"
                      className="w-full bg-card border border-border rounded-lg p-2 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="Somente se Entrada"
                      value={formData.valor_total}
                      onChange={(e) => setFormData({...formData, valor_total: e.target.value})}
                    />
                  </div>
                </div>

                {editingItem && (
                   <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Motivo da Movimentação</label>
                    <input 
                      className="w-full bg-card border border-border rounded-lg p-2 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="Ex: Saída para concretagem do pilar B1"
                      value={formData.justificativa}
                      onChange={(e) => setFormData({...formData, justificativa: e.target.value})}
                    />
                  </div>
                )}

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
                    Salvar Dados
                  </button>
                </div>
             </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL DE HISTÓRICO */}
      {showHistory && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-card rounded-xl w-full max-w-2xl shadow-lg overflow-hidden animate-slide-up border border-border">
             <div className="p-5 border-b border-border bg-muted/30 flex justify-between items-center">
                <div>
                   <h3 className="text-base font-semibold text-foreground tracking-tight">Histórico de Movimentação</h3>
                   <p className="text-[10px] font-semibold text-muted-foreground uppercase mt-0.5">Audit trail do material selecionado</p>
                </div>
                <button onClick={() => setShowHistory(false)} className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors">✕</button>
             </div>

             <div className="p-5 max-h-[60vh] overflow-y-auto space-y-3">
                {activeHistory.length === 0 ? (
                   <p className="text-center text-muted-foreground py-6 font-semibold text-xs">Nenhuma movimentação registrada.</p>
                ) : (
                   activeHistory.map((log, i) => (
                     <div key={i} className="flex items-center justify-between p-3.5 bg-muted/30 rounded-xl border border-border">
                        <div className="flex items-center gap-3">
                           <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-semibold text-sm ${log.tipo === 'ENTRADA' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-destructive/10 text-destructive'}`}>
                              {log.tipo === 'ENTRADA' ? '+' : '-'}
                           </div>
                           <div>
                              <p className="text-sm font-semibold text-foreground">
                                 {log.tipo} de {Number(log.quantidade).toLocaleString('pt-BR')} unidades
                              </p>
                              <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                                 {new Date(log.data_registro).toLocaleString('pt-BR')} • {log.tb_usuario?.nome}
                              </p>
                           </div>
                        </div>
                        {log.origem_fornecedor && (
                           <div className="text-right">
                              <p className="text-[9px] font-medium text-muted-foreground uppercase">Origem</p>
                              <p className="text-xs font-semibold text-foreground mt-0.5">{log.origem_fornecedor}</p>
                           </div>
                        )}
                     </div>
                   ))
                )}
             </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}


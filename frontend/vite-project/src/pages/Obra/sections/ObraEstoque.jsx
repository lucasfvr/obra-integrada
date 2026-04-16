import API_BASE_URL from "../../../config/api.js";
import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth.js';
import toast from 'react-hot-toast';

export function ObraEstoque({ items = [], idObra, onRefresh }) {
  const { apiFetch } = useAuth();
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
      body.quantidade_nova = body.quantidade_nova;
      delete body.quantidade;
    }

    try {
      const res = await apiFetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        body: JSON.stringify(body)
      });

      if (res.ok) {
        toast.success(isEdit ? "Movimentação registrada!" : "Item adicionado!");
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
      toast.error("Erro ao carregar historico");
    }
  };

  const handleDelete = async (idItem) => {
    if (!window.confirm("Deseja remover este material permanentemente?")) return;
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/obras/estoque/${idItem}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        toast.success("Material removido");
        onRefresh();
      }
    } catch (err) {
      toast.error("Erro ao remover");
    }
  };

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Estoque e Insumos</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 ml-1">Controle de materiais alocados no canteiro</p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 bg-white dark:bg-gray-950 p-3 rounded-2xl border border-slate-200 dark:border-gray-800 shadow-sm">
            <div className="text-right">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total de Itens</p>
              <p className="text-xl font-black text-indigo-600">{items.length}</p>
            </div>
            <div className="w-px h-8 bg-slate-100 dark:bg-gray-800" />
            <div className="text-right">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Status Almoxarifado</p>
              <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-tight">Operacional</p>
            </div>
          </div>
          <button 
            onClick={handleOpenAdd}
            className="h-full bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/30 active:scale-95"
          >
            Novo Material
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-white dark:bg-gray-950 border-2 border-dashed dark:border-gray-800 rounded-[2.5rem] p-24 text-center">
          <div className="w-20 h-20 bg-slate-50 dark:bg-gray-900 rounded-full flex items-center justify-center text-3xl mx-auto mb-6 grayscale opacity-20">📦</div>
          <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Nenhum material registrado no estoque desta obra</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-950 border dark:border-gray-800 rounded-[2.5rem] overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-gray-900/50 border-b dark:border-gray-800">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Material</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Unidade</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Qtd. em Canteiro</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-800">
              {items.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-gray-900/30 transition-colors group">
                  <td className="px-8 py-5">
                    <p className="text-sm font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors uppercase">{item.nome_material}</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-2.5 py-1 bg-slate-100 dark:bg-gray-800 border dark:border-gray-700 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-widest">
                      {item.unidade_medida}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                       <p className="text-base font-black text-slate-700 dark:text-slate-300">{Number(item.quantidade).toLocaleString('pt-BR')}</p>
                       <div className={`w-1.5 h-1.5 rounded-full ${item.quantidade > 50 ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right space-x-2">
                    <button 
                      onClick={() => fetchHistory(item.id_estoque)}
                      className="text-gray-300 hover:text-emerald-600 transition-all p-2"
                      title="Ver Histórico"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </button>
                    <button 
                      onClick={() => handleOpenEdit(item)}
                      className="text-gray-300 hover:text-indigo-600 transition-all p-2"
                      title="Movimentar"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id_estoque)}
                      className="text-gray-300 hover:text-rose-600 transition-all p-2"
                      title="Excluir"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL DE MATERIAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-950 rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-slide-up border dark:border-gray-800">
             <div className="p-8 border-b dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex justify-between items-center">
                <h3 className="text-xl font-black text-indigo-950 dark:text-white tracking-tight">
                  {editingItem ? 'Editar Material' : 'Novo Material em Canteiro'}
                </h3>
                <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-rose-600 transition-colors">✕</button>
             </div>

             <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Nome do Material / Insumo</label>
                  <input 
                    className="w-full bg-slate-50 dark:bg-gray-900 border dark:border-gray-800 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                    required
                    placeholder="Ex: Cimento CP-II 50kg"
                    value={formData.nome_material}
                    onChange={(e) => setFormData({...formData, nome_material: e.target.value})}
                  />
                </div>

                 <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Unidade</label>
                    <select 
                      className="w-full bg-slate-50 dark:bg-gray-900 border dark:border-gray-800 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
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
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                      {editingItem ? 'Nova Quantidade' : 'Quantidade Inicial'}
                    </label>
                    <input 
                      type="number"
                      step="0.001"
                      className="w-full bg-slate-50 dark:bg-gray-900 border dark:border-gray-800 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      required
                      value={editingItem ? formData.quantidade_nova : formData.quantidade}
                      onChange={(e) => setFormData({...formData, [editingItem ? 'quantidade_nova' : 'quantidade']: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Fornecedor (Opcional)</label>
                    <input 
                      className="w-full bg-slate-50 dark:bg-gray-900 border dark:border-gray-800 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      placeholder="Ex: Leroy Merlin"
                      value={formData.fornecedor}
                      onChange={(e) => setFormData({...formData, fornecedor: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Valor Gasto (Opcional)</label>
                    <input 
                      type="number"
                      step="0.01"
                      className="w-full bg-slate-50 dark:bg-gray-900 border dark:border-gray-800 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      placeholder="Somente se Entrada"
                      value={formData.valor_total}
                      onChange={(e) => setFormData({...formData, valor_total: e.target.value})}
                    />
                  </div>
                </div>

                {editingItem && (
                   <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Motivo da Movimentação</label>
                    <input 
                      className="w-full bg-slate-50 dark:bg-gray-900 border dark:border-gray-800 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      placeholder="Ex: Saída paraconcretagem do pilar B1"
                      value={formData.justificativa}
                      onChange={(e) => setFormData({...formData, justificativa: e.target.value})}
                    />
                  </div>
                )}

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
                    Salvar Dados
                  </button>
                </div>
             </form>
          </div>
        </div>
      )}
      {/* MODAL DE HISTÓRICO */}
      {showHistory && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-950 rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-slide-up border dark:border-gray-800">
             <div className="p-8 border-b dark:border-gray-800 bg-emerald-50/50 dark:bg-emerald-900/20 flex justify-between items-center">
                <div>
                   <h3 className="text-xl font-black text-emerald-950 dark:text-white tracking-tight">Histórico de Movimentação</h3>
                   <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1">Audit trail do material selecionado</p>
                </div>
                <button onClick={() => setShowHistory(false)} className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-rose-600 transition-colors">✕</button>
             </div>

             <div className="p-8 max-h-[60vh] overflow-y-auto">
                <div className="space-y-4">
                   {activeHistory.length === 0 ? (
                      <p className="text-center text-gray-400 py-10 font-bold">Nenhuma movimentação registrada.</p>
                   ) : (
                      activeHistory.map((log, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-gray-900 rounded-2xl border dark:border-gray-800">
                           <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${log.tipo === 'ENTRADA' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                 {log.tipo === 'ENTRADA' ? '+' : '-'}
                              </div>
                              <div>
                                 <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">
                                    {log.tipo} de {Number(log.quantidade).toLocaleString('pt-BR')} unidades
                                 </p>
                                 <p className="text-[10px] text-slate-400 font-bold">
                                    {new Date(log.data_registro).toLocaleString('pt-BR')} • {log.tb_usuario?.nome}
                                 </p>
                              </div>
                           </div>
                           {log.origem_fornecedor && (
                              <div className="text-right">
                                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Origem</p>
                                 <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300">{log.origem_fornecedor}</p>
                              </div>
                           )}
                        </div>
                      ))
                   )}
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}


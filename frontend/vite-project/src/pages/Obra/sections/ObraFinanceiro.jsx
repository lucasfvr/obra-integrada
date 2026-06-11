import API_BASE_URL from "../../../config/api.js";
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth.js';
import toast from 'react-hot-toast';

export function ObraFinanceiro({ idObra, obra, onRefresh }) {
  const { apiFetch, hasPermissao } = useAuth();
  const podeExcluir = hasPermissao('gerenciar_financeiro');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showOrcamentoModal, setShowOrcamentoModal] = useState(false);
  const [orcamentoData, setOrcamentoData] = useState({
    orcamento_material: 0,
    orcamento_mao_obra: 0,
    orcamento_taxas: 0
  });
  const [formData, setFormData] = useState({
    tipo: 'DESPESA',
    valor: '',
    descricao: '',
    data_pagamento: new Date().toISOString().split('T')[0],
    numero_nota_fiscal: ''
  });
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });

  const handleDeleteFinanceiro = async (idFinanceiro) => {
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/financeiro/${idFinanceiro}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        toast.success("Lançamento excluído!");
        fetchFinanceiro();
        if (onRefresh) onRefresh();
      } else {
        const err = await res.json();
        toast.error(err.erro || "Erro ao excluir");
      }
    } catch (e) {
      toast.error("Erro de conexão");
    }
  };

  const fetchFinanceiro = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`${API_BASE_URL}/api/obras/${idObra}/financeiro`);
      if (res.ok) {
        const data = await res.json();
        setRecords(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  };

  useEffect(() => {
    if (idObra) fetchFinanceiro();
  }, [idObra]);

  const handleSalvarOrcamento = async (e) => {
    e.preventDefault();
    const total = Number(orcamentoData.orcamento_material || 0) + Number(orcamentoData.orcamento_mao_obra || 0) + Number(orcamentoData.orcamento_taxas || 0);

    try {
      const res = await apiFetch(`${API_BASE_URL}/api/obras/${idObra}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...obra,
          valor_orcado: total
        })
      });
      if (res.ok) {
        toast.success("Orçamento atualizado!");
        setShowOrcamentoModal(false);
        if (onRefresh) onRefresh();
      } else {
        toast.error("Erro ao atualizar orçamento");
      }
    } catch (err) {
      toast.error("Erro de conexão");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/obras/${idObra}/financeiro`, {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast.success("Lançamento realizado!");
        setShowModal(false);
        setFormData({ tipo: 'DESPESA', valor: '', descricao: '', data_pagamento: new Date().toISOString().split('T')[0], numero_nota_fiscal: '' });
        fetchFinanceiro();
      }
    } catch (e) {
      toast.error("Erro ao lançar");
    }
  };

  const totals = records.reduce((acc, curr) => {
    if (curr.tipo === 'RECEITA') acc.receitas += Number(curr.valor);
    else acc.despesas += Number(curr.valor);
    return acc;
  }, { receitas: 0, despesas: 0 });

  const saldo = totals.receitas - totals.despesas;

  if (loading) return (
     <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-40 bg-gray-100 dark:bg-gray-800 rounded-[2.5rem]" />
        <div className="h-96 bg-gray-50 dark:bg-gray-900 rounded-[2.5rem]" />
     </div>
  );

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Cards de Resumo Financeiro */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-950 p-8 rounded-[2.5rem] border dark:border-gray-800 shadow-sm group">
           <div className="flex justify-between items-start">
             <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Orçamento Planejado</p>
               <h4 className="text-2xl font-black text-slate-800 dark:text-white">R$ {Number(obra?.valor_orcado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h4>
             </div>
             <button onClick={() => setShowOrcamentoModal(true)} className="p-2 bg-slate-50 dark:bg-gray-900 rounded-xl text-gray-400 group-hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100">
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
             </button>
           </div>
        </div>
        <div className="bg-white dark:bg-gray-950 p-8 rounded-[2.5rem] border dark:border-gray-800 shadow-sm">
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Receitas</p>
           <h4 className="text-2xl font-black text-emerald-600">R$ {totals.receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h4>
        </div>
        <div className="bg-white dark:bg-gray-950 p-8 rounded-[2.5rem] border dark:border-gray-800 shadow-sm">
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Despesas</p>
           <h4 className="text-2xl font-black text-rose-600">R$ {totals.despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h4>
        </div>
        <div className="bg-indigo-600 p-8 rounded-[2.5rem] shadow-xl shadow-indigo-500/20">
           <p className="text-[10px] font-black text-indigo-100 uppercase tracking-widest mb-2">Saldo de Caixa</p>
           <h4 className="text-2xl font-black text-white">R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h4>
        </div>
      </div>

      <div className="flex justify-between items-center px-2">
         <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Fluxo de Caixa da Obra</h3>
         <button 
           onClick={() => setShowModal(true)}
           className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
         >
           Novo Lançamento
         </button>
      </div>

      {/* Tabela de Lançamentos */}
      <div className="bg-white dark:bg-gray-950 border dark:border-gray-800 rounded-[2.5rem] overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-gray-900 border-b dark:border-gray-800">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Data / Doc</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Justificativa</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tipo</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Valor</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-800">
            {records.length === 0 ? (
               <tr>
                 <td colSpan={5} className="px-8 py-16 text-center text-gray-400 font-bold uppercase tracking-widest text-[10px]">Aguardando lançamentos...</td>
               </tr>
            ) : (
              records.map(rec => (
                <tr key={rec.id_financeiro} className="hover:bg-slate-50/50 dark:hover:bg-gray-900 transition-colors">
                  <td className="px-8 py-6">
                    <p className="text-xs font-black text-slate-800 dark:text-white uppercase">
                      {new Date(rec.data_pagamento || rec.criado_em).toLocaleDateString()}
                    </p>
                    {rec.numero_nota_fiscal && (
                       <p className="text-[9px] font-bold text-indigo-500 uppercase mt-1">NF: {rec.numero_nota_fiscal}</p>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold text-gray-600 dark:text-gray-400">{rec.descricao}</p>
                    <p className="text-[9px] text-gray-400 uppercase font-black mt-1">Lançado por: {rec.tb_usuario?.nome}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${rec.tipo === 'RECEITA' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                      {rec.tipo}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <p className={`text-sm font-black ${rec.tipo === 'RECEITA' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
                      {rec.tipo === 'RECEITA' ? '+' : '-'} R$ {Number(rec.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    {podeExcluir && (
                      <button 
                        onClick={() => setDeleteConfirm({ show: true, id: rec.id_financeiro })}
                        className="text-gray-300 hover:text-rose-600 transition-all p-2"
                        title="Excluir Lançamento"
                      >
                        <svg className="w-5 h-5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Orçamento Planejado */}
      {showOrcamentoModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
           <div className="bg-white dark:bg-gray-950 rounded-[2.5rem] w-full max-w-md shadow-2xl animate-slide-up border dark:border-gray-800">
              <div className="p-8 border-b dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex justify-between items-center">
                 <h3 className="text-xl font-black text-indigo-950 dark:text-white tracking-tight">Composição do Orçamento</h3>
                 <button onClick={() => setShowOrcamentoModal(false)} className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-rose-600 transition-colors">✕</button>
              </div>
              <form onSubmit={handleSalvarOrcamento} className="p-8 space-y-6">
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Material de Construção (R$)</label>
                    <input type="number" step="0.01" className="w-full bg-slate-50 dark:bg-gray-900 border dark:border-gray-800 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" value={orcamentoData.orcamento_material} onChange={(e) => setOrcamentoData({...orcamentoData, orcamento_material: e.target.value})} />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Mão de Obra e Equipe (R$)</label>
                    <input type="number" step="0.01" className="w-full bg-slate-50 dark:bg-gray-900 border dark:border-gray-800 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" value={orcamentoData.orcamento_mao_obra} onChange={(e) => setOrcamentoData({...orcamentoData, orcamento_mao_obra: e.target.value})} />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Taxas e Legalização (R$)</label>
                    <input type="number" step="0.01" className="w-full bg-slate-50 dark:bg-gray-900 border dark:border-gray-800 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" value={orcamentoData.orcamento_taxas} onChange={(e) => setOrcamentoData({...orcamentoData, orcamento_taxas: e.target.value})} />
                 </div>
                 <div className="pt-4 border-t dark:border-gray-800 flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Total Calculado</span>
                    <span className="text-xl font-black text-indigo-600">R$ {(Number(orcamentoData.orcamento_material || 0) + Number(orcamentoData.orcamento_mao_obra || 0) + Number(orcamentoData.orcamento_taxas || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                 </div>
                 <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 active:scale-95">Salvar Orçamento</button>
              </form>
           </div>
        </div>
      )}

      {/* Modal Lançamento */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
           <div className="bg-white dark:bg-gray-950 rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-slide-up border dark:border-gray-800">
              <div className="p-8 border-b dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex justify-between items-center">
                 <h3 className="text-xl font-black text-indigo-950 dark:text-white tracking-tight">Novo Lançamento Financeiro</h3>
                 <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-rose-600 transition-colors">✕</button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                 <div className="flex gap-2 p-1 bg-slate-100 dark:bg-gray-900 rounded-2xl border dark:border-gray-800">
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, tipo: 'RECEITA'})}
                      className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.tipo === 'RECEITA' ? 'bg-white dark:bg-gray-800 text-emerald-600 shadow-sm' : 'text-gray-400'}`}
                    >
                      Receita
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, tipo: 'DESPESA'})}
                      className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.tipo === 'DESPESA' ? 'bg-white dark:bg-gray-800 text-rose-600 shadow-sm' : 'text-gray-400'}`}
                    >
                      Despesa
                    </button>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Valor (R$)</label>
                       <input 
                         type="number"
                         step="0.01"
                         className="w-full bg-slate-50 dark:bg-gray-900 border dark:border-gray-800 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                         required
                         value={formData.valor}
                         onChange={(e) => setFormData({...formData, valor: e.target.value})}
                       />
                    </div>
                    <div>
                       <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Data Pagamento</label>
                       <input 
                         type="date"
                         className="w-full bg-slate-50 dark:bg-gray-900 border dark:border-gray-800 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                         required
                         value={formData.data_pagamento}
                         onChange={(e) => setFormData({...formData, data_pagamento: e.target.value})}
                       />
                    </div>
                 </div>

                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Justificativa / Descrição</label>
                    <input 
                      className="w-full bg-slate-50 dark:bg-gray-900 border dark:border-gray-800 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      required
                      placeholder="Ex: Pagamento de diárias - Equipe A"
                      value={formData.descricao}
                      onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                    />
                 </div>

                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Nº Nota Fiscal (Opcional)</label>
                    <input 
                      className="w-full bg-slate-50 dark:bg-gray-900 border dark:border-gray-800 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      placeholder="Ex: 556/2026"
                      value={formData.numero_nota_fiscal}
                      onChange={(e) => setFormData({...formData, numero_nota_fiscal: e.target.value})}
                    />
                 </div>

                 <button 
                   type="submit"
                   className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 ${formData.tipo === 'RECEITA' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'} text-white`}
                 >
                    Confirmar Lançamento
                 </button>
               </form>
            </div>
         </div>
      )}

      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-950 rounded-[2.5rem] w-full max-w-sm shadow-2xl overflow-hidden border dark:border-gray-800 p-8 text-center space-y-6 animate-slide-up">
            <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/20 text-rose-600 rounded-2xl flex items-center justify-center text-3xl mx-auto">⚠️</div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Confirmar Exclusão</h3>
              <p className="text-xs text-slate-500 font-bold mt-2 uppercase tracking-wide">Esta ação é irreversível.</p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setDeleteConfirm({ show: false, id: null })}
                className="flex-1 py-4 bg-slate-50 dark:bg-gray-900 text-gray-500 hover:text-slate-950 dark:hover:text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  handleDeleteFinanceiro(deleteConfirm.id);
                  setDeleteConfirm({ show: false, id: null });
                }}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-rose-500/20 active:scale-95"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

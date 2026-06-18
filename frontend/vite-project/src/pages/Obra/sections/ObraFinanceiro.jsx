import API_BASE_URL from "../../../config/api.js";
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
        <div className="h-40 bg-muted rounded-xl" />
        <div className="h-96 bg-muted rounded-xl" />
     </div>
  );

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Cards de Resumo Financeiro */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm group">
           <div className="flex justify-between items-start">
             <div>
               <p className="text-sm font-medium text-muted-foreground mb-1">Orçamento Planejado</p>
               <h4 className="text-2xl font-semibold tracking-tight text-foreground">R$ {Number(obra?.valor_orcado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h4>
             </div>
             <button onClick={() => {
               setOrcamentoData({
                 orcamento_material: Number(obra?.valor_orcado || 0) * 0.5,
                 orcamento_mao_obra: Number(obra?.valor_orcado || 0) * 0.4,
                 orcamento_taxas: Number(obra?.valor_orcado || 0) * 0.1
               });
               setShowOrcamentoModal(true);
             }} className="p-1.5 bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-all opacity-0 group-hover:opacity-100">
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
             </button>
           </div>
        </div>
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
           <p className="text-sm font-medium text-muted-foreground mb-1">Total Receitas</p>
           <h4 className="text-2xl font-semibold tracking-tight text-emerald-600">R$ {totals.receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h4>
        </div>
        <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
           <p className="text-sm font-medium text-muted-foreground mb-1">Total Despesas</p>
           <h4 className="text-2xl font-semibold tracking-tight text-destructive">R$ {totals.despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h4>
        </div>
        <div className="bg-primary p-5 rounded-xl text-primary-foreground shadow-sm">
           <p className="text-sm font-medium text-primary-foreground/80 mb-1">Saldo de Caixa</p>
           <h4 className="text-2xl font-semibold tracking-tight">R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h4>
        </div>
      </div>

      <div className="flex justify-between items-center px-1">
         <h3 className="text-sm font-semibold text-foreground">Fluxo de Caixa da Obra</h3>
         <button 
           onClick={() => setShowModal(true)}
           className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
         >
           Novo Lançamento
         </button>
      </div>

      {/* Tabela de Lançamentos */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase">Data / Doc</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase">Justificativa</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase">Tipo</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase text-right">Valor</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {records.length === 0 ? (
                 <tr>
                   <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground font-semibold text-xs">Aguardando lançamentos...</td>
                 </tr>
              ) : (
                records.map(rec => (
                  <tr key={rec.id_financeiro} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-semibold text-foreground leading-none">
                        {new Date(rec.data_pagamento || rec.criado_em).toLocaleDateString()}
                      </p>
                      {rec.numero_nota_fiscal && (
                         <p className="text-[10px] font-medium text-primary mt-1">NF: {rec.numero_nota_fiscal}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-foreground">{rec.descricao}</p>
                      <p className="text-[10px] text-muted-foreground font-medium mt-1">Lançado por: {rec.tb_usuario?.nome}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${rec.tipo === 'RECEITA' ? 'bg-emerald-500/10 text-emerald-600 border-transparent' : 'bg-destructive/10 text-destructive border-transparent'}`}>
                        {rec.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <p className={`text-sm font-semibold ${rec.tipo === 'RECEITA' ? 'text-emerald-600' : 'text-foreground'}`}>
                        {rec.tipo === 'RECEITA' ? '+' : '-'} R$ {Number(rec.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                      {podeExcluir && (
                        <button 
                          onClick={() => setDeleteConfirm({ show: true, id: rec.id_financeiro })}
                          className="text-muted-foreground hover:text-destructive transition-colors p-1"
                          title="Excluir Lançamento"
                        >
                          <svg className="w-4 h-4 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Orçamento Planejado */}
      {showOrcamentoModal && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
           <div className="bg-card rounded-xl w-full max-w-md shadow-lg overflow-hidden border border-border animate-slide-up">
              <div className="p-5 border-b border-border bg-muted/30 flex justify-between items-center">
                 <h3 className="text-base font-semibold text-foreground tracking-tight">Composição do Orçamento</h3>
                 <button onClick={() => setShowOrcamentoModal(false)} className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors">✕</button>
              </div>
              <form onSubmit={handleSalvarOrcamento} className="p-5 space-y-4">
                 <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Material de Construção (R$)</label>
                    <input type="number" step="0.01" className="w-full bg-card border border-border rounded-lg p-2 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all" value={orcamentoData.orcamento_material} onChange={(e) => setOrcamentoData({...orcamentoData, orcamento_material: e.target.value})} />
                 </div>
                 <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Mão de Obra e Equipe (R$)</label>
                    <input type="number" step="0.01" className="w-full bg-card border border-border rounded-lg p-2 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all" value={orcamentoData.orcamento_mao_obra} onChange={(e) => setOrcamentoData({...orcamentoData, orcamento_mao_obra: e.target.value})} />
                 </div>
                 <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Taxas e Legalização (R$)</label>
                    <input type="number" step="0.01" className="w-full bg-card border border-border rounded-lg p-2 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all" value={orcamentoData.orcamento_taxas} onChange={(e) => setOrcamentoData({...orcamentoData, orcamento_taxas: e.target.value})} />
                 </div>
                 <div className="pt-4 border-t border-border flex justify-between items-center">
                    <span className="text-xs font-medium text-muted-foreground">Total Calculado</span>
                    <span className="text-lg font-semibold text-primary">R$ {(Number(orcamentoData.orcamento_material || 0) + Number(orcamentoData.orcamento_mao_obra || 0) + Number(orcamentoData.orcamento_taxas || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                 </div>
                 <div className="pt-4 flex gap-3 justify-end border-t border-border">
                    <button 
                      type="button" 
                      onClick={() => setShowOrcamentoModal(false)} 
                      className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold rounded-lg transition-colors"
                    >
                      Salvar Orçamento
                    </button>
                 </div>
              </form>
           </div>
        </div>,
        document.body
      )}

      {/* Modal Lançamento */}
      {showModal && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
           <div className="bg-card rounded-xl w-full max-w-lg shadow-lg overflow-hidden border border-border animate-slide-up">
              <div className="p-5 border-b border-border bg-muted/30 flex justify-between items-center">
                 <h3 className="text-base font-semibold text-foreground tracking-tight">Novo Lançamento Financeiro</h3>
                 <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors">✕</button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                 <div className="flex gap-2 p-1 bg-muted rounded-lg border border-border">
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, tipo: 'RECEITA'})}
                      className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all ${formData.tipo === 'RECEITA' ? 'bg-card text-emerald-600 shadow-sm' : 'text-muted-foreground'}`}
                    >
                      Receita
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, tipo: 'DESPESA'})}
                      className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all ${formData.tipo === 'DESPESA' ? 'bg-card text-destructive shadow-sm' : 'text-muted-foreground'}`}
                    >
                      Despesa
                    </button>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-xs font-medium text-muted-foreground mb-1">Valor (R$)</label>
                       <input 
                         type="number"
                         step="0.01"
                         className="w-full bg-card border border-border rounded-lg p-2 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                         required
                         value={formData.valor}
                         onChange={(e) => setFormData({...formData, valor: e.target.value})}
                       />
                    </div>
                    <div>
                       <label className="block text-xs font-medium text-muted-foreground mb-1">Data Pagamento</label>
                       <input 
                         type="date"
                         className="w-full bg-card border border-border rounded-lg p-2 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                         required
                         value={formData.data_pagamento}
                         onChange={(e) => setFormData({...formData, data_pagamento: e.target.value})}
                       />
                    </div>
                 </div>

                 <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Justificativa / Descrição</label>
                    <input 
                      className="w-full bg-card border border-border rounded-lg p-2 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      required
                      placeholder="Ex: Pagamento de diárias - Equipe A"
                      value={formData.descricao}
                      onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                    />
                 </div>

                 <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Nº Nota Fiscal (Opcional)</label>
                    <input 
                      className="w-full bg-card border border-border rounded-lg p-2 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="Ex: 556/2026"
                      value={formData.numero_nota_fiscal}
                      onChange={(e) => setFormData({...formData, numero_nota_fiscal: e.target.value})}
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
                      Confirmar Lançamento
                    </button>
                 </div>
               </form>
           </div>
        </div>,
        document.body
      )}

      {deleteConfirm.show && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-card rounded-xl w-full max-w-sm shadow-lg border border-border p-6 text-center space-y-4 animate-slide-up">
            <div className="w-12 h-12 bg-destructive/10 text-destructive rounded-full flex items-center justify-center text-xl mx-auto">⚠️</div>
            <div>
              <h3 className="text-base font-semibold text-foreground tracking-tight">Confirmar Exclusão</h3>
              <p className="text-xs text-muted-foreground mt-1">Esta ação é irreversível.</p>
            </div>
            <div className="flex gap-3 justify-center pt-2">
              <button 
                onClick={() => setDeleteConfirm({ show: false, id: null })}
                className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  handleDeleteFinanceiro(deleteConfirm.id);
                  setDeleteConfirm({ show: false, id: null });
                }}
                className="px-4 py-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs font-semibold rounded-lg transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

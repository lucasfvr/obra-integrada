import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth.js";

const IcoStock = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

function MaterialCalculator() {
    const { isImpersonating } = useAuth();
    
    // Mock de Estoque
    const [estoque, setEstoque] = useState([
      { id: 1, nome: "Cimento CP-II (Sacos)", atual: 45, minimo: 10, unidade: "un" },
      { id: 2, nome: "Areia Grossa", atual: 8, minimo: 3, unidade: "m³" },
      { id: 3, nome: "Vergalhão 10mm", atual: 120, minimo: 50, unidade: "barras" },
      { id: 4, nome: "Tijolo Baiano", atual: 2500, minimo: 500, unidade: "un" },
    ]);

    const [consumoLog, setConsumoLog] = useState([
      { id: 101, material: "Cimento CP-II", qtd: 5, data: "Hoje, 08:30", user: "José Pedreiro" },
      { id: 102, material: "Areia Grossa", qtd: 2, data: "Ontem, 16:15", user: "Maria Azulejista" },
    ]);

    return (
        <div className="max-w-5xl mx-auto space-y-10 pb-20 animate-slide-up">
            <header className="flex justify-between items-end mb-4">
                <div>
                   <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Materiais e Insumos</h1>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Gestão de estoque e fluxo de consumo</p>
                </div>
                <div className="hidden md:flex gap-4">
                    <div className="bg-white dark:bg-gray-950 p-4 px-6 rounded-2xl border dark:border-gray-800 shadow-sm text-center">
                       <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Última Entrada</p>
                       <p className="text-sm font-black text-indigo-600">12/04/2026</p>
                    </div>
                </div>
            </header>

            {/* Painel de Estoque Principal */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {estoque.map(item => {
                  const percent = Math.min(100, (item.atual / (item.minimo * 3)) * 100);
                  const isLow = item.atual <= item.minimo;

                  return (
                    <div key={item.id} className="bg-white dark:bg-gray-900 rounded-[2rem] p-6 border border-slate-100 dark:border-gray-800 shadow-sm flex flex-col gap-4">
                       <div className="flex justify-between items-start">
                          <IcoStock />
                          {isLow && <span className="text-[8px] font-black bg-rose-500 text-white px-2 py-0.5 rounded-full animate-pulse">ESTOQUE BAIXO</span>}
                       </div>
                       <div className="flex-1">
                          <h3 className="font-black text-sm text-slate-900 dark:text-white mb-1 uppercase tracking-tight">{item.nome}</h3>
                          <p className="text-3xl font-black text-slate-950 dark:text-white">
                             {item.atual} <span className="text-xs font-bold text-slate-400">{item.unidade}</span>
                          </p>
                       </div>
                       <div className="w-full h-1.5 bg-slate-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div className={`h-full transition-all duration-1000 ${isLow ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${percent}%` }} />
                       </div>
                    </div>
                  );
               })}
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Registro de Consumo */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-950 rounded-[2.5rem] p-10 border dark:border-gray-800 shadow-sm">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6">Log de Consumo</h3>
                    <div className="space-y-4">
                       {consumoLog.map(log => (
                         <div key={log.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-gray-900 rounded-2xl border border-slate-100 dark:border-gray-800 transition-hover hover:bg-white dark:hover:bg-gray-800 duration-300">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500">
                                 📦
                               </div>
                               <div>
                                  <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{log.material}</p>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{log.user} • {log.data}</p>
                               </div>
                            </div>
                            <p className="text-lg font-black text-rose-500">-{log.qtd}</p>
                         </div>
                       ))}
                    </div>
                    {isImpersonating ? (
                       <button disabled className="w-full mt-8 py-4 border-2 border-dashed dark:border-gray-800 text-slate-400 text-xs font-black uppercase tracking-widest rounded-3xl opacity-50 cursor-not-allowed">
                          Somente Leitura
                       </button>
                    ) : (
                       <button className="w-full mt-8 py-4 border-2 border-dashed border-indigo-200 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-xs font-black uppercase tracking-widest rounded-3xl transition-all active:scale-[0.98]">
                          + Registrar Retirada de Material
                       </button>
                    )}
                </div>

                {/* Banner Calculadora Inteligente */}
                <div className="relative bg-gradient-to-br from-indigo-950 to-indigo-900 rounded-[2.5rem] p-10 text-white overflow-hidden shadow-2xl flex flex-col justify-between group">
                    <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700">
                       <svg className="w-32 h-32" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                    </div>
                    
                    <div className="relative z-10">
                       <span className="bg-amber-500 text-gray-900 text-[8px] font-black uppercase px-3 py-1 rounded-full mb-6 inline-block">LABS</span>
                       <h3 className="text-3xl font-black tracking-tight mb-4">Calculadora de Traço Inteligente</h3>
                       <p className="text-sm font-medium text-white/60 leading-relaxed mb-10">
                          Em breve: Informe o m³ da concretagem e calcularemos automaticamente os sacos de cimento, areia e brita necessários para o traço 1:2:3.
                       </p>
                    </div>

                    <div className="relative z-10 bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/20 text-center">
                       <p className="text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Lançamento em Breve</p>
                    </div>
                </div>
            </div>

            {/* Alerta de Auditoria */}
            <div className="bg-amber-50 dark:bg-amber-950/20 p-6 rounded-[2rem] border border-amber-100 dark:border-amber-900/50 flex items-start gap-5">
               <div className="text-2xl">📑</div>
               <p className="text-[11px] font-bold text-amber-900/70 dark:text-amber-400/70 leading-relaxed">
                  Todos os registros de retirada de material são auditados e vinculados ao seu CPF. 
                  Em caso de divergência no inventário, contate o Mestre Gilberto imediatamente.
               </p>
            </div>
        </div>
    );
}

export default MaterialCalculator;

import API_BASE_URL from "../../config/api.js";
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.js';

const IcoUser = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const IcoPhone = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

export function EquipeOrganograma() {
  const { apiFetch, user } = useAuth();
  const [equipe, setEquipe] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Busca todos os usuários da admin console (no projeto real buscaríamos vinculados à obra do usuário)
    apiFetch(`${API_BASE_URL}/api/admin/users`)
      .then(res => res.json())
      .then(data => {
        setEquipe(data);
        setLoading(false);
      });
  }, [apiFetch]);

  // Lógica de Hierarquia Simplificada por Funcao
  const niveis = [
    { label: 'Gestão Técnica', cargos: ['Administrador', 'Engenheiro Civil', 'Arquiteta'] },
    { label: 'Supervisão de Campo', cargos: ['Mestre'] },
    { label: 'Execução Especializada', cargos: ['Pedreiro', 'Eletricista', 'Azulejista'] },
    { label: 'Apoio Operacional', cargos: ['Ajudante'] }
  ];

  const renderCard = (membro) => {
    const isMe = membro.id_usuario === user?.id_usuario;
    const isDirectChain = ['RESPONSAVEL', 'ADMIN_MASTER'].includes(membro.role) || membro.funcao === 'Mestre';

    return (
      <div 
        key={membro.id_usuario} 
        className={`
          relative p-5 rounded-3xl border transition-all duration-300
          ${isMe ? 'bg-amber-500 text-gray-950 border-amber-600 shadow-lg scale-105 z-10' : 'bg-white dark:bg-gray-900 border-slate-200 dark:border-gray-800 text-slate-900 dark:text-white'}
          ${isDirectChain && !isMe ? 'ring-2 ring-indigo-500/20 border-indigo-500/30' : ''}
        `}
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${isMe ? 'bg-white/20' : 'bg-slate-100 dark:bg-gray-800 text-indigo-500'}`}>
            {membro.nome[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-sm truncate uppercase tracking-tight">{membro.nome} {isMe && "(VOCÊ)"}</p>
            <p className={`text-[10px] font-bold uppercase tracking-widest ${isMe ? 'text-gray-950/60' : 'text-slate-400'}`}>
              {membro.funcao}
            </p>
          </div>
        </div>
        
        <div className={`mt-4 pt-4 border-t flex items-center justify-between ${isMe ? 'border-gray-950/10' : 'border-slate-100 dark:border-gray-800'}`}>
           <div className="flex items-center gap-2">
              <IcoPhone />
              <span className="text-[10px] font-bold">{membro.telefone || '(11) 99999-0000'}</span>
           </div>
           <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${isMe ? 'bg-black/10' : 'bg-slate-100 dark:bg-gray-800'}`}>
             Ativo
           </span>
        </div>
      </div>
    );
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-slate-400">Desenhando organograma...</div>;

  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-12 animate-slide-up">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">Hierarquia da Obra</h2>
        <p className="text-sm text-slate-500 font-medium mt-2">Mapa completo de profissionais e canais de emergência.</p>
      </div>

      {niveis.map((nivel, idx) => {
        const membrosNivel = equipe.filter(m => nivel.cargos.includes(m.funcao));
        if (membrosNivel.length === 0) return null;

        return (
          <div key={nivel.label} className="relative">
            {/* Linha conectora visual entre níveis */}
            {idx > 0 && (
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-0.5 h-12 bg-gradient-to-b from-slate-200 to-transparent dark:from-gray-800 hidden md:block" />
            )}
            
            <div className="mb-6 flex items-center gap-4">
               <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 rounded-full uppercase tracking-widest">Nível {idx + 1}</span>
               <h3 className="text-xs font-black text-slate-400 dark:text-gray-600 uppercase tracking-[0.2em]">{nivel.label}</h3>
               <div className="flex-1 h-[1px] bg-slate-100 dark:bg-gray-800" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {membrosNivel.map(m => renderCard(m))}
            </div>
          </div>
        );
      })}

      {/* Emergency Card */}
      <div className="mt-20 p-8 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 rounded-[3rem] shadow-xl shadow-rose-500/5 flex flex-col md:flex-row items-center justify-between gap-8">
         <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-rose-500 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg shadow-rose-500/40">🚑</div>
            <div>
              <h4 className="text-xl font-black text-rose-900 dark:text-rose-400">Contatos de Emergência</h4>
              <p className="text-xs font-bold text-rose-800/60 dark:text-rose-400/60 uppercase tracking-widest mt-1 italic">Protocolo de segurança da obra</p>
            </div>
         </div>
         <div className="flex gap-4 w-full md:w-auto">
            <div className="bg-white dark:bg-gray-950 p-4 px-8 rounded-2xl border border-rose-100 dark:border-rose-900/40 text-center flex-1">
               <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Ambulância</p>
               <p className="text-2xl font-black text-rose-600">192</p>
            </div>
            <div className="bg-white dark:bg-gray-950 p-4 px-8 rounded-2xl border border-rose-100 dark:border-rose-900/40 text-center flex-1">
               <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Bombeiros</p>
               <p className="text-2xl font-black text-rose-600">193</p>
            </div>
         </div>
      </div>
    </div>
  );
}

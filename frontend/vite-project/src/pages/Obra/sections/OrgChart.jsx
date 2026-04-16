import API_BASE_URL from "../../../config/api.js";
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth.js';

function OrgNode({ node, level = 0 }) {
  const isLeaf = !node.children || node.children.length === 0;

  // Cores dinâmicas por nível para o estilo "Teams"
  const getCardStyle = () => {
    if (level === 0) return 'bg-indigo-600 border-indigo-500 shadow-indigo-200 text-white';
    if (level === 1) return 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white';
    return 'bg-slate-50 dark:bg-gray-800/50 border-slate-100 dark:border-gray-700 text-gray-600 dark:text-gray-300';
  };

  return (
    <div className="flex flex-col items-center relative group">
      {/* Card do Usuário */}
      <div className={`
        relative z-10 w-64 p-5 rounded-[2rem] border shadow-xl transition-all duration-500 transform group-hover:-translate-y-1
        ${getCardStyle()}
      `}>
        <div className="flex items-center gap-4">
          <div className={`
            w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-inner
            ${level === 0 ? 'bg-white/20 text-white' : 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600'}
          `}>
            {node.nome?.charAt(0).toUpperCase()}
          </div>
          <div className="text-left overflow-hidden">
            <h4 className="font-black uppercase tracking-tight text-xs leading-tight truncate">{node.nome}</h4>
            <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 truncate ${level === 0 ? 'text-indigo-100' : 'text-gray-400'}`}>
              {node.funcao}
            </p>
          </div>
        </div>
        
        {/* Badge de Nível (Opcional) */}
        <div className="absolute -top-3 -right-3">
           <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${level === 0 ? 'bg-white text-indigo-600 border-white' : 'bg-gray-950 text-white border-gray-800'}`}>
             LVL {level + 1}
           </span>
        </div>
      </div>

      {/* Conectores Verticais */}
      {!isLeaf && (
        <>
          <div className="h-12 w-px bg-indigo-200 dark:bg-gray-700 relative">
             <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-indigo-300 dark:bg-gray-600"></div>
          </div>
          
          <div className="flex gap-10 items-start relative pt-4">
             {/* Linha Horizontal de Conexão */}
             {node.children.length > 1 && (
               <div className="absolute top-0 left-[32%] right-[32%] h-px bg-indigo-100 dark:bg-gray-800" />
             )}
             
             {node.children.map((child, i) => (
               <div key={i} className="relative">
                 {/* Linha vertical curta para cada filho */}
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 h-4 w-px bg-indigo-100 dark:bg-gray-800" />
                 <div className="pt-4">
                    <OrgNode node={child} level={level + 1} />
                 </div>
               </div>
             ))}
          </div>
        </>
      )}
    </div>
  );
}

export function OrgChart({ idObra }) {
  const { apiFetch } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrg = async () => {
      try {
        const res = await apiFetch(`${API_BASE_URL}/api/obras/${idObra}/org-chart`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchOrg();
  }, [idObra]);

  if (loading) return (
    <div className="p-40 text-center space-y-4">
       <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
       <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] animate-pulse">Gerando Mapeamento Organizacional...</p>
    </div>
  );

  if (!data) return (
    <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-[3rem] p-20 text-center max-w-lg mx-auto">
       <span className="text-4xl mb-4 block">🏢</span>
       <h4 className="text-rose-900 dark:text-rose-400 font-black uppercase tracking-tight">Equipe Indisponível</h4>
       <p className="text-xs text-rose-500 font-bold mt-2 uppercase tracking-widest">Inicie a vinculação de profissionais no módulo RH para visualizar a hierarquia.</p>
    </div>
  );

  return (
    <div className="w-full overflow-x-auto p-12 md:p-20 bg-slate-50/50 dark:bg-gray-950/20 rounded-[4rem] border dark:border-gray-800/50 shadow-inner no-scrollbar animate-slide-up">
       <div className="min-w-fit flex justify-center py-10">
          <OrgNode node={data} />
       </div>
    </div>
  );
}

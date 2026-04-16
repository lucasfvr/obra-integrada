import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth.js';

function OrgNode({ node, level = 0 }) {
  const isLeaf = !node.children || node.children.length === 0;

  return (
    <div className="flex flex-col items-center">
      <div className={`
        relative p-6 rounded-[2rem] border min-w-[200px] text-center shadow-lg transition-all
        ${level === 0 ? 'bg-indigo-600 text-white border-indigo-500 shadow-indigo-500/20' : 
          level === 1 ? 'bg-white dark:bg-gray-900 border-indigo-100 dark:border-indigo-900/30' : 
          'bg-slate-50 dark:bg-gray-800 border-slate-100 dark:border-gray-700'}
      `}>
        <div className={`w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center font-black text-sm
          ${level === 0 ? 'bg-white/20' : 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600'}
        `}>
          {node.nome?.charAt(0).toUpperCase()}
        </div>
        <h4 className="font-black uppercase tracking-tight text-xs leading-tight">{node.nome}</h4>
        <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${level === 0 ? 'text-indigo-100' : 'text-gray-400'}`}>
          {node.funcao}
        </p>

        {!isLeaf && (
          <div className="absolute -bottom-6 left-1/2 w-px h-6 bg-indigo-200 dark:bg-gray-700" />
        )}
      </div>

      {!isLeaf && (
        <div className="relative pt-6">
          <div className="absolute top-0 left-1/2 -ml-[calc(50%-100px)] right-1/2 -mr-[calc(50%-100px)] h-px bg-indigo-200 dark:bg-gray-700" />
          <div className="flex gap-8 justify-center">
            {node.children.map((child, i) => (
              <div key={i} className="relative pt-6">
                <div className="absolute top-0 left-1/2 w-px h-6 bg-indigo-200 dark:bg-gray-700" />
                <OrgNode node={child} level={level + 1} />
              </div>
            ))}
          </div>
        </div>
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
        const res = await apiFetch(`http://localhost:5000/api/obras/${idObra}/org-chart`);
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

  if (loading) return <div className="p-20 text-center text-gray-400 font-black animate-pulse">MAPEANDO HIERARQUIA...</div>;
  if (!data) return <div className="p-20 text-center text-gray-400 font-bold uppercase tracking-widest">Erro ao carregar visão organizacional.</div>;

  return (
    <div className="w-full overflow-x-auto p-12 bg-white dark:bg-gray-950 rounded-[3rem] border dark:border-gray-800 shadow-sm animate-slide-up">
       <div className="min-w-fit flex justify-center">
          <OrgNode node={data} />
       </div>
    </div>
  );
}

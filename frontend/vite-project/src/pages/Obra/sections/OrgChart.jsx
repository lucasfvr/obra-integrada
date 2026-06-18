import API_BASE_URL from "../../../config/api.js";
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth.js';

function OrgNode({ node, level = 0 }) {
  const isLeaf = !node.children || node.children.length === 0;

  // Cores dinâmicas por nível
  const getCardStyle = () => {
    if (level === 0) return 'bg-primary border-primary/20 text-primary-foreground shadow-sm';
    if (level === 1) return 'bg-card border-border text-foreground shadow-sm';
    return 'bg-muted/30 border-border text-muted-foreground shadow-sm';
  };

  return (
    <div className="flex flex-col items-center relative group">
      {/* Card do Usuário */}
      <div className={`
        relative z-10 w-64 p-4 rounded-xl border transition-all duration-300 transform group-hover:-translate-y-0.5
        ${getCardStyle()}
      `}>
        <div className="flex items-center gap-3">
          <div className={`
            w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs border
            ${level === 0 ? 'bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground border-border'}
          `}>
            {node.nome?.charAt(0).toUpperCase()}
          </div>
          <div className="text-left overflow-hidden">
            <h4 className={`text-xs font-semibold uppercase tracking-tight truncate ${level === 0 ? 'text-primary-foreground' : 'text-foreground'}`}>{node.nome}</h4>
            <p className={`text-[10px] font-medium uppercase mt-0.5 truncate ${level === 0 ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
              {node.funcao}
            </p>
          </div>
        </div>
        
        {/* Badge de Nível (Opcional) */}
        <div className="absolute -top-2.5 -right-2.5">
           <span className={`px-2 py-0.5 rounded-full text-[8px] font-semibold border ${level === 0 ? 'bg-primary-foreground text-primary border-primary-foreground' : 'bg-muted text-muted-foreground border-border'}`}>
             LVL {level + 1}
           </span>
        </div>
      </div>

      {/* Conectores Verticais */}
      {!isLeaf && (
        <>
          <div className="h-8 w-px bg-border relative">
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-muted-foreground/30"></div>
          </div>
          
          <div className="flex gap-8 items-start relative pt-3">
             {/* Linha Horizontal de Conexão */}
             {node.children.length > 1 && (
                <div className="absolute top-0 left-[25%] right-[25%] h-px bg-border" />
             )}
             
             {node.children.map((child, i) => (
                <div key={i} className="relative">
                  {/* Linha vertical curta para cada filho */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 h-3 w-px bg-border" />
                  <div className="pt-3">
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
    <div className="py-20 text-center space-y-3">
       <div className="w-8 h-8 border-3 border-muted border-t-primary rounded-full animate-spin mx-auto"></div>
       <p className="text-xs font-semibold text-muted-foreground animate-pulse">Gerando Mapeamento Organizacional...</p>
    </div>
  );

  if (!data) return (
    <div className="bg-card border border-border rounded-xl p-8 text-center max-w-md mx-auto space-y-4">
       <span className="text-3xl block">🏢</span>
       <h4 className="text-foreground font-semibold uppercase tracking-tight">Equipe Indisponível</h4>
       <p className="text-xs text-muted-foreground leading-normal">Inicie a vinculação de profissionais no módulo RH para visualizar a hierarquia.</p>
    </div>
  );

  return (
    <div className="w-full overflow-x-auto p-8 bg-card rounded-xl border border-border shadow-sm no-scrollbar animate-slide-up">
       <div className="min-w-fit flex justify-center py-6">
          <OrgNode node={data} />
       </div>
    </div>
  );
}

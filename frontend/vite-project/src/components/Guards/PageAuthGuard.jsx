import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../../hooks/useAuth.js';
import API_BASE_URL from '../../config/api.js';

/**
 * PageAuthGuard
 *
 * Libera o conteúdo apenas se o usuário autenticado tiver a permissão de
 * página (tb_permissao_pagina) correspondente a `idPagina`.
 *
 * Consulta o endpoint do PRÓPRIO usuário (/api/me/permissoes), que usa o
 * token para identificar quem é — não precisa (nem deve) bater no endpoint
 * de gestão do RH.
 */
export function PageAuthGuard({ idPagina, rota, children }) {
  const { user, apiFetch } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    let ativo = true;

    const checkPermission = async () => {
      if (!user?.id) {
        if (ativo) { setHasAccess(false); setLoading(false); }
        return;
      }
      try {
        const res = await apiFetch(`${API_BASE_URL}/api/me/permissoes`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const paginas = await res.json();
        const pagePerm = paginas.find(p => (
          (idPagina && p.id_pagina === idPagina) ||
          (rota && p.rota === rota)
        ));
        // Se houver registro explícito na tabela de permissões de página, respeitar
        if (ativo && pagePerm) {
          setHasAccess(!!pagePerm.permitido);
        } else if (ativo) {
          // Fallback prático: permitir acesso por role para rotas mapeadas
          const roleByRoute = {
            '/planejamento': 'PLANEJADOR',
            '/engenheiro': 'ENGENHEIRO'
          };
          if (rota && user?.role && roleByRoute[rota] === user.role) {
            setHasAccess(true);
          } else {
            setHasAccess(false);
          }
        }
      } catch (error) {
        console.error('Erro ao verificar permissão:', error);
        if (ativo) setHasAccess(false);
      } finally {
        if (ativo) setLoading(false);
      }
    };

    checkPermission();
    return () => { ativo = false; };
  }, [idPagina, rota, user, apiFetch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return <Navigate to="/restricted" replace />;
  }

  return children;
}

/**
 * ProtectedRoute.jsx
 *
 * Componente que protege rotas do React Router.
 * Redireciona para a Home de login se nao estiver autenticado.
 * Bloqueia acesso se o usuario nao tiver a role ou permissao exigida.
 *
 * Uso:
 *   <Route path="/admin" element={<ProtectedRoute roles={['MASTER','ADMIN']}><AdminPage /></ProtectedRoute>} />
 */

import React from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../../hooks/useAuth.js';

export function ProtectedRoute({ roles, permissao, children }) {
  const { isAuthenticated, user, hasRole, hasPermissao, isLoading } = useAuth();

  // Aguarda carregamento do localStorage
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Se nao está autenticado, manda para o início
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Verifica permissoes específicas (se passadas)
  if (permissao && !hasPermissao(permissao)) {
    return <Navigate to="/dashboard?error=acesso_negado" replace />;
  }

  // Verifica roles específicas (se passadas)
  if (roles && roles.length > 0 && !hasRole(...roles)) {
    return <Navigate to="/dashboard?error=perfil_insuficiente" replace />;
  }

  return children;
}

/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import {
  hasPermissao as _hasPermissao,
  hasRole as _hasRole,
  getRoleLabel,
  podeImpersonar,
} from '../utils/permissions.js';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  // Inicialização preguiçosa para evitar flashes de "não logado"
  const [user, setUser] = useState(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem('obraUser') || sessionStorage.getItem('obraUser');
      try {
        return savedUser ? JSON.parse(savedUser) : null;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [originalAdminUser, setOriginalAdminUser] = useState(() => {
    if (typeof window !== "undefined") {
      const savedAdmin = localStorage.getItem('originalAdminUser');
      try {
        return savedAdmin ? JSON.parse(savedAdmin) : null;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(true);

  // Valida expiração do token ao inicializar
  useEffect(() => {
    const token = localStorage.getItem('obraToken') || sessionStorage.getItem('obraToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const now = Date.now() / 1000; // segundos
        if (decoded.exp && decoded.exp < now) {
          // Token expirado — limpa tudo silenciosamente
          localStorage.removeItem('obraToken');
          localStorage.removeItem('obraUser');
          sessionStorage.removeItem('obraToken');
          sessionStorage.removeItem('obraUser');
          setUser(null);
        }
      } catch {
        // Token malformado — limpa
        localStorage.clear();
        sessionStorage.clear();
        setUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  const isImpersonating = !!originalAdminUser;

  const hasPermissao = useCallback((permissao) => {
    return _hasPermissao(user?.role, permissao);
  }, [user]);

  const hasRole = useCallback((...roles) => {
    return _hasRole(user?.role, ...roles);
  }, [user]);

  const apiFetch = useCallback(async (url, options = {}) => {
    const method = (options.method || 'GET').toUpperCase();
    const token = localStorage.getItem('obraToken') || sessionStorage.getItem('obraToken');

    if (isImpersonating && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      const msg = `Operacao ${method} negada: O sistema está em modo de SOMENTE LEITURA.`;
      alert(msg);
      throw new Error(msg);
    }

    const headers = { ...options.headers };
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (isImpersonating) {
      headers['X-Impersonation-By'] = originalAdminUser.id_usuario;
      headers['X-Impersonation-Active'] = 'true';
    }

    return fetch(url, { ...options, headers });
  }, [isImpersonating, originalAdminUser]);

  const login = (token, userData, remember = true) => {
    const decoded = jwtDecode(token);
    const finalUser = {
      ...userData,
      ...decoded,
      id: userData.id_usuario || decoded.id,
    };

    if (remember) {
      localStorage.setItem('obraToken', token);
      localStorage.setItem('obraUser', JSON.stringify(finalUser));
      sessionStorage.removeItem('obraToken');
      sessionStorage.removeItem('obraUser');
    } else {
      sessionStorage.setItem('obraToken', token);
      sessionStorage.setItem('obraUser', JSON.stringify(finalUser));
      localStorage.removeItem('obraToken');
      localStorage.removeItem('obraUser');
    }

    setUser(finalUser);
  };

  const logout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setUser(null);
    setOriginalAdminUser(null);
    window.location.href = '/';
  };

  const impersonate = (targetUser) => {
    if (!podeImpersonar(user?.role)) return;
    if (!originalAdminUser) {
      localStorage.setItem('originalAdminUser', JSON.stringify(user));
      setOriginalAdminUser(user);
    }
    localStorage.setItem('obraUser', JSON.stringify(targetUser));
    setUser(targetUser);
  };

  const revertImpersonation = () => {
    if (!originalAdminUser) return;
    localStorage.setItem('obraUser', JSON.stringify(originalAdminUser));
    localStorage.removeItem('originalAdminUser');
    setUser(originalAdminUser);
    setOriginalAdminUser(null);
  };

  const value = {
    user,
    role: user?.role,
    nome: user?.nome,
    funcao: user?.funcao,
    roleLabel: getRoleLabel(user?.role),
    isImpersonating,
    originalAdminUser,
    isLoading,
    isAuthenticated: !!user,
    hasPermissao,
    hasRole,
    apiFetch,
    login,
    logout,
    impersonate,
    revertImpersonation
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

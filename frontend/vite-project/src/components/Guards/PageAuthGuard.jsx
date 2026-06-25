import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router';
import api from '../../config/api.js';

export function PageAuthGuard({ idPagina, children }) {
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    // Buscar perfil do usuário e validar permissões?
    // Melhor usar a API criada para buscar as permissões do usuário
    // Como estamos apenas verificando se ele tem permissão para esta idPagina específica:
    const checkPermission = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          setHasAccess(false);
          setLoading(false);
          return;
        }
        const user = JSON.parse(userStr);
        // Pode ser um cache no localStorage ou uma chamada direta
        const res = await api.get(`/admin/permissoes/${user.id}`);
        const paginas = res.data;
        const pagePerm = paginas.find(p => p.id_pagina === idPagina);
        
        if (pagePerm && pagePerm.permitido) {
          setHasAccess(true);
        } else {
          setHasAccess(false);
        }
      } catch (error) {
        console.error('Erro ao verificar permissão:', error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkPermission();
  }, [idPagina]);

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

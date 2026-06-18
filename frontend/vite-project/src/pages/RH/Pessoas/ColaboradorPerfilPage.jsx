import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuth } from '../../../context/AuthContext';
import API_BASE_URL from '../../../config/api.js';
import ColaboradorPerfil from '../../../components/RH/ColaboradorPerfil.jsx';

export default function ColaboradorPerfilPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { apiFetch } = useAuth();
  const [colaborador, setColaborador] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        // Endpoint direto por ID — muito mais eficiente que carregar 500 registros
        const res = await apiFetch(`${API_BASE_URL}/api/rh/${id}`);
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.erro || 'Colaborador não encontrado');
        }
        const data = await res.json();
        setColaborador(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [apiFetch, id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
          <p className="text-sm text-muted-foreground">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (error || !colaborador) {
    return (
      <div className="p-6 text-center min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-destructive text-sm">{error || 'Colaborador não encontrado'}</p>
        <button
          onClick={() => navigate(-1)}
          className="text-primary hover:underline text-sm"
        >
          ← Voltar
        </button>
      </div>
    );
  }

  return <ColaboradorPerfil colaborador={colaborador} />;
}

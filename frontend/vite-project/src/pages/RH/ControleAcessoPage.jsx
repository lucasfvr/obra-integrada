import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import API_BASE_URL from '../../config/api.js';
import { Search, Shield, ShieldCheck, ShieldAlert, Check, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ControleAcessoPage() {
  const { apiFetch, user } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [processandoId, setProcessandoId] = useState(null);

  const carregarUsuarios = useCallback(async () => {
    try {
      setCarregando(true);
      const res = await apiFetch(`${API_BASE_URL}/api/rh/controle-acesso/usuarios`);
      if (!res.ok) {
        throw new Error('Falha ao buscar usuários do controle de acesso');
      }
      const data = await res.json();
      setUsuarios(data);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao carregar lista de usuários.');
    } finally {
      setCarregando(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    carregarUsuarios();
  }, [carregarUsuarios]);

  const handleToggleAcesso = async (userId, statusAtual) => {
    try {
      setProcessandoId(userId);
      const novoStatus = !statusAtual;

      const res = await apiFetch(`${API_BASE_URL}/api/rh/controle-acesso/usuarios/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ acesso_rh: novoStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.erro || 'Falha ao atualizar acesso.');
      }

      toast.success(data.mensagem || 'Acesso atualizado com sucesso!', {
        icon: novoStatus ? '🔓' : '🔒',
        style: {
          borderRadius: '12px',
          background: '#1e293b',
          color: '#fff',
          fontWeight: '600'
        }
      });

      // Atualiza o estado local
      setUsuarios((prev) =>
        prev.map((u) => (u.id_usuario === userId ? { ...u, acesso_rh: novoStatus } : u))
      );
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Erro ao atualizar permissão de acesso.');
    } finally {
      setProcessandoId(null);
    }
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    const termo = filtro.toLowerCase();
    return (
      (u.nome || '').toLowerCase().includes(termo) ||
      (u.username || '').toLowerCase().includes(termo) ||
      (u.email || '').toLowerCase().includes(termo) ||
      (u.role || '').toLowerCase().includes(termo)
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Shield className="text-primary w-7 h-7" />
            Controle de Acesso da Plataforma
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Conceda ou revogue o acesso à área de Recursos Humanos para os usuários cadastrados no sistema.
          </p>
        </div>
      </div>

      {/* Info Alert */}
      <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex gap-3 text-sm text-foreground">
        <ShieldCheck className="text-primary w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-primary">Regra de Segurança:</span> Apenas o usuário de login <code className="bg-primary/10 px-1.5 py-0.5 rounded font-mono font-semibold text-primary">wh</code> tem permissão para gerenciar este painel. O acesso ao próprio usuário <code className="bg-primary/10 px-1.5 py-0.5 rounded font-mono font-semibold text-primary">wh</code> não pode ser removido para evitar travamento de segurança.
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center bg-card border border-border rounded-xl p-3 shadow-sm max-w-md">
        <Search className="text-muted-foreground w-5 h-5 mr-2" />
        <input
          type="text"
          placeholder="Buscar por nome, username, e-mail ou cargo..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="bg-transparent border-none outline-none w-full text-sm text-foreground placeholder:text-muted-foreground"
          id="search-input-access-control"
        />
        {filtro && (
          <button
            onClick={() => setFiltro('')}
            className="text-muted-foreground hover:text-foreground text-xs"
          >
            Limpar
          </button>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        {carregando ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
            <Loader2 className="animate-spin w-8 h-8 text-primary" />
            <p className="text-sm font-medium">Carregando usuários do sistema...</p>
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2 text-muted-foreground">
            <ShieldAlert className="w-12 h-12 text-muted-foreground/60" />
            <p className="font-semibold text-foreground mt-2">Nenhum usuário encontrado</p>
            <p className="text-sm">Tente reajustar seu termo de busca ou filtros.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="px-6 py-4">Usuário / Nome</th>
                  <th className="px-6 py-4">Username / E-mail</th>
                  <th className="px-6 py-4">Role / Nível</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Acesso à Área de RH</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {usuariosFiltrados.map((u) => {
                  const isProtected = u.username === 'wh' || u.username === 'rh_manager';
                  const processando = processandoId === u.id_usuario;

                  return (
                    <tr key={u.id_usuario} className="hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xs">
                            {u.nome?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <span className="font-semibold text-foreground block">{u.nome}</span>
                            {isProtected && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/20 text-primary border border-primary/25 mt-0.5">
                                Admin Master
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        <span className="font-mono text-xs block text-foreground">{u.username || '-'}</span>
                        <span className="text-xs">{u.email}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border">
                          {u.role || 'USER'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                            u.status === 'ATIVO'
                              ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                              : 'bg-red-500/10 text-red-600 dark:text-red-400'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'ATIVO' ? 'bg-green-500' : 'bg-red-500'}`} />
                          {u.status === 'ATIVO' ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => handleToggleAcesso(u.id_usuario, u.acesso_rh)}
                            disabled={isProtected || processando}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                              u.acesso_rh ? 'bg-primary' : 'bg-muted-foreground/30'
                            } ${isProtected ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                            id={`toggle-access-${u.id_usuario}`}
                            title={isProtected ? 'Não é possível remover o acesso deste usuário administrador.' : ''}
                          >
                            {processando ? (
                              <Loader2 className="absolute animate-spin w-4 h-4 text-white left-1" />
                            ) : (
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  u.acesso_rh ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            )}
                          </button>
                          <span className="ml-3 font-semibold text-xs min-w-[50px]">
                            {u.acesso_rh ? (
                              <span className="text-primary flex items-center gap-1">
                                <Check size={14} /> Liberado
                              </span>
                            ) : (
                              <span className="text-muted-foreground flex items-center gap-1">
                                <X size={14} /> Bloqueado
                              </span>
                            )}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

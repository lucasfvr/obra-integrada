import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import API_BASE_URL from '../../config/api.js';
import { Shield, ShieldCheck, Loader2, Settings2, X, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ControleAcessoPage() {
  const { apiFetch } = useAuth();
  
  // ─── Formulário Gerar Acesso ─────────────────────────────────────────────────
  const [formData, setFormData] = useState({ nome: '', cpf: '', role: 'RH' });
  const [paginas, setPaginas] = useState([]);
  const [permissoesSelecionadas, setPermissoesSelecionadas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [carregandoPaginas, setCarregandoPaginas] = useState(true);
  const [erroMsg, setErroMsg] = useState('');
  const [credenciais, setCredenciais] = useState(null);

  // ─── Tabela de Usuários + Modal de Permissões ────────────────────────────────
  const [usuarios, setUsuarios] = useState([]);
  const [carregandoUsuarios, setCarregandoUsuarios] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [permissoesUser, setPermissoesUser] = useState([]);
  const [carregandoPermissoes, setCarregandoPermissoes] = useState(false);

  // ─── Buscar páginas disponíveis ──────────────────────────────────────────────
  const fetchPaginas = useCallback(async () => {
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/admin/paginas`);
      if (!res.ok) {
        const text = await res.text();
        console.error('Erro ao buscar páginas:', text);
        return;
      }
      const data = await res.json();
      setPaginas(data);
      setPermissoesSelecionadas(data.map(p => p.id_pagina));
    } catch (error) {
      console.error('Erro ao buscar páginas', error);
    } finally {
      setCarregandoPaginas(false);
    }
  }, [apiFetch]);

  // ─── Buscar usuários cadastrados ─────────────────────────────────────────────
  const fetchUsuarios = useCallback(async () => {
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/admin/acesso-usuarios`);
      if (!res.ok) {
        const text = await res.text();
        console.error('Erro ao buscar usuários:', text);
        return;
      }
      const data = await res.json();
      setUsuarios(data);
    } catch (error) {
      console.error('Erro ao buscar usuários', error);
    } finally {
      setCarregandoUsuarios(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    fetchPaginas();
    fetchUsuarios();
  }, [fetchPaginas, fetchUsuarios]);

  // ─── Toggle checkbox de permissão no formulário de criar ─────────────────────
  const togglePermissao = (idPagina) => {
    setPermissoesSelecionadas(prev => 
      prev.includes(idPagina) 
        ? prev.filter(id => id !== idPagina)
        : [...prev, idPagina]
    );
  };

  // ─── Gerar acesso (POST) ────────────────────────────────────────────────────
  const handleGerarAcesso = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErroMsg('');
    setCredenciais(null);

    try {
      const res = await apiFetch(`${API_BASE_URL}/api/admin/criar-acesso`, {
        method: 'POST',
        body: JSON.stringify({
          nome: formData.nome,
          cpf: formData.cpf,
          role: formData.role,
          permissoes: permissoesSelecionadas
        })
      });

      // Ler como texto primeiro para evitar crash de JSON parse
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(text.substring(0, 300));
      }

      if (!res.ok) {
        throw new Error(data.error || data.erro || 'Erro desconhecido');
      }

      setCredenciais(data.credenciais);
      toast.success('Usuário gerado com sucesso!');
      setFormData({ nome: '', cpf: '', role: 'RH' });
      fetchUsuarios(); // Recarrega a lista
      
    } catch (error) {
      setErroMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── Abrir modal de permissões do usuário existente ──────────────────────────
  const handleAbrirPermissoes = async (usr) => {
    setSelectedUser(usr);
    setCarregandoPermissoes(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/admin/permissoes/${usr.id_usuario}`);
      if (!res.ok) {
        toast.error('Erro ao buscar permissões');
        return;
      }
      const data = await res.json();
      setPermissoesUser(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setCarregandoPermissoes(false);
    }
  };

  // ─── Toggle permissão de um usuário existente ────────────────────────────────
  const togglePermissionUser = async (idPagina, isPermitido) => {
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/admin/permissoes`, {
        method: 'PUT',
        body: JSON.stringify({
          id_usuario: selectedUser.id_usuario,
          id_pagina: idPagina,
          permitido: !isPermitido
        })
      });
      if (!res.ok) throw new Error('Erro ao atualizar permissão');
      
      setPermissoesUser(prev => prev.map(p => 
        p.id_pagina === idPagina ? { ...p, permitido: !isPermitido } : p
      ));
      toast.success('Permissão atualizada!');
    } catch (error) {
      toast.error('Erro ao atualizar permissão');
    }
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    const termo = filtro.toLowerCase();
    return (
      (u.nome || '').toLowerCase().includes(termo) ||
      (u.email || '').toLowerCase().includes(termo) ||
      (u.role || '').toLowerCase().includes(termo)
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 relative">
      {/* Header */}
      <div className="border-b border-border pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Shield className="text-primary w-7 h-7" />
          Controle de Acesso da Plataforma
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Conceda ou revogue o acesso à área de Recursos Humanos para os usuários cadastrados no sistema.
        </p>
      </div>

      {/* Info Alert */}
      <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex gap-3 text-sm text-foreground">
        <ShieldCheck className="text-primary w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-primary">Regra de Segurança:</span> Apenas o usuário de login <code className="bg-primary/10 px-1.5 py-0.5 rounded font-mono font-semibold text-primary">wh</code> tem permissão para gerenciar este painel. O acesso ao próprio usuário <code className="bg-primary/10 px-1.5 py-0.5 rounded font-mono font-semibold text-primary">wh</code> não pode ser removido para evitar travamento de segurança.
        </div>
      </div>

      {/* ═══ SEÇÃO 1: GERAR LOGIN ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card Formulário */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-foreground mb-6">Gerar login automático</h2>
          
          <form onSubmit={handleGerarAcesso} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Nome</label>
              <input
                type="text" required
                className="w-full border border-border rounded-lg p-2.5 outline-none focus:border-primary transition-colors bg-transparent text-foreground"
                value={formData.nome}
                onChange={e => setFormData({ ...formData, nome: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">CPF</label>
              <input
                type="text" required
                className="w-full border border-border rounded-lg p-2.5 outline-none focus:border-primary transition-colors bg-transparent text-foreground"
                value={formData.cpf}
                onChange={e => setFormData({ ...formData, cpf: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Role</label>
              <input
                type="text"
                className="w-full border border-border rounded-lg p-2.5 outline-none focus:border-primary transition-colors bg-transparent text-foreground"
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
              />
            </div>

            <div className="pt-2">
              <label className="block text-sm font-medium text-muted-foreground mb-2">Permissões de página</label>
              {carregandoPaginas ? (
                <div className="text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Carregando páginas...</div>
              ) : paginas.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma página cadastrada.</p>
              ) : (
                <div className="space-y-2">
                  {paginas.map(pagina => (
                    <label key={pagina.id_pagina} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                        checked={permissoesSelecionadas.includes(pagina.id_pagina)}
                        onChange={() => togglePermissao(pagina.id_pagina)}
                      />
                      <span className="text-sm text-foreground font-medium">{pagina.nome}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4">
              <button
                type="submit" disabled={loading}
                className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? 'Gerando...' : 'Gerar usuário e senha'}
              </button>
            </div>
            
            {erroMsg && (
              <div className="mt-4 bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-md text-xs font-mono overflow-x-auto">
                {erroMsg}
              </div>
            )}

            <p className="text-xs text-muted-foreground mt-4">
              O e-mail será gerado automaticamente pelo sistema a partir do nome do usuário.
            </p>
          </form>
        </div>

        {/* Card Resumo */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm h-fit">
          <h2 className="text-lg font-bold text-foreground mb-3">Resumo rápido</h2>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            O usuário gerado receberá um username igual ao e-mail informado e uma senha aleatória exibida aqui no painel.
          </p>

          <div className="border border-border rounded-xl p-5 bg-muted/20">
            {credenciais ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600 font-bold mb-2">
                  <ShieldCheck className="w-5 h-5" /> Sucesso!
                </div>
                <ul className="space-y-2 text-sm text-foreground">
                  <li><strong>Username/E-mail:</strong> <span className="font-mono bg-card px-1.5 py-0.5 border border-border rounded">{credenciais.email}</span></li>
                  <li><strong>Senha:</strong> <span className="font-mono bg-card px-1.5 py-0.5 border border-border rounded">{credenciais.senha}</span></li>
                  <li><strong>Role:</strong> {formData.role || 'RH'}</li>
                  <li><strong>Permissões:</strong> {permissoesSelecionadas.length} página(s)</li>
                </ul>
              </div>
            ) : (
              <div>
                <p className="text-sm font-semibold text-foreground mb-3">Exemplo de dados:</p>
                <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                  <li><strong>CPF:</strong> {formData.cpf || '18438892779'}</li>
                  <li><strong>Role:</strong> {formData.role || 'RH'}</li>
                  <li><strong>Permissão RH:</strong> Sim</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ SEÇÃO 2: GERENCIAR PERMISSÕES DE USUÁRIOS EXISTENTES ═══ */}
      <div className="border-t border-border pt-8">
        <h2 className="text-xl font-bold text-foreground mb-2">Gerenciar Permissões por Usuário</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Selecione um usuário para liberar ou bloquear o acesso a páginas específicas do sistema.
        </p>

        {/* Busca */}
        <div className="flex items-center bg-card border border-border rounded-xl p-3 shadow-sm max-w-md mb-4">
          <Search className="text-muted-foreground w-5 h-5 mr-2" />
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="bg-transparent border-none outline-none w-full text-sm text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Tabela de Usuários */}
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          {carregandoUsuarios ? (
            <div className="flex justify-center py-16"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <th className="px-6 py-4">Usuário</th>
                    <th className="px-6 py-4">E-mail</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {usuariosFiltrados.map((u) => (
                    <tr key={u.id_usuario} className="hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xs">
                            {u.nome?.charAt(0) || 'U'}
                          </div>
                          {u.nome}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border">
                          {u.role || 'USER'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => handleAbrirPermissoes(u)}
                          className="inline-flex items-center gap-2 text-primary bg-primary/10 px-3 py-1.5 rounded-md hover:bg-primary/20 transition-colors font-medium text-xs"
                        >
                          <Settings2 className="w-4 h-4" />
                          Permissões
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ═══ MODAL DE PERMISSÕES ═══ */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card w-full max-w-2xl rounded-2xl p-6 shadow-lg border border-border relative max-h-[90vh] flex flex-col">
            <button onClick={() => setSelectedUser(null)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold mb-1 text-foreground">Gerenciar Permissões</h2>
            <p className="text-sm text-muted-foreground mb-6">Usuário: <strong>{selectedUser.nome}</strong> ({selectedUser.email})</p>
            
            {carregandoPermissoes ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>
            ) : permissoesUser.length === 0 ? (
              <p className="text-sm text-muted-foreground py-10 text-center">Nenhuma página cadastrada no sistema.</p>
            ) : (
              <div className="overflow-y-auto flex-1 border border-border rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border">
                      <th className="p-4 font-semibold text-xs text-muted-foreground uppercase">Página</th>
                      <th className="p-4 font-semibold text-xs text-muted-foreground uppercase">Rota</th>
                      <th className="p-4 font-semibold text-xs text-muted-foreground uppercase text-center w-32">Acesso</th>
                    </tr>
                  </thead>
                  <tbody>
                    {permissoesUser.map(p => (
                      <tr key={p.id_pagina} className="border-b border-border last:border-0 hover:bg-muted/10">
                        <td className="p-4 font-medium text-foreground">{p.nome}</td>
                        <td className="p-4 text-muted-foreground text-xs font-mono">{p.rota}</td>
                        <td className="p-4 text-center">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer"
                              checked={p.permitido}
                              onChange={() => togglePermissionUser(p.id_pagina, p.permitido)}
                            />
                            <div className="w-11 h-6 bg-muted-foreground/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                          </label>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setSelectedUser(null)}
                className="bg-muted text-foreground px-4 py-2 rounded-lg hover:bg-muted/80"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

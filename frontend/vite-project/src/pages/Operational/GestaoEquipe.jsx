import API_BASE_URL from "../../config/api.js";
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { PermissaoGuard } from '../../components/Guards/PermissaoGuard.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export function GestaoEquipe() {
  const { apiFetch } = useAuth();
  const { toast } = useToast();
  
  const [equipe, setEquipe] = useState([]);
  const [obras, setObras] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [busca, setBusca] = useState('');
  const [filtroObra, setFiltroObra] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('ATIVO');
  const [filtroFuncao, setFiltroFuncao] = useState('');
  const [pagina, setPagina] = useState(1);

  // Buscar Obras para o filtro
  const fetchObras = async () => {
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/obras`);
      if (res.ok) {
        const result = await res.json();
        // API retorna { data: [...], meta: {...} } ou apenas [...]
        const obrasList = Array.isArray(result) ? result : (result.data || []);
        setObras(obrasList);
      }
    } catch (error) {
      console.error('[EQUIPE] Erro ao buscar obras:', error);
      setObras([]);  // Garante que é um array vazio
    }
  };

  // Buscar equipe global com filtros
  const fetchEquipe = async (page = 1) => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page,
        limit: 10,
        busca,
        status: filtroStatus !== 'TODOS' ? filtroStatus : '',
        id_obra: filtroObra,
        funcao: filtroFuncao
      }).toString();

      const res = await apiFetch(`${API_BASE_URL}/api/equipe?${query}`);
      if (res.ok) {
        const result = await res.json();
        setEquipe(result.data);
        setMeta(result.meta);
      } else {
        toast.error('Erro ao buscar dados da equipe', 'Erro');
      }
    } catch (error) {
      console.error('[EQUIPE] Erro ao buscar equipe:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchObras();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEquipe(pagina);
    }, 300);
    return () => clearTimeout(timer);
  }, [busca, filtroObra, filtroStatus, filtroFuncao, pagina]);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Equipe e Canteiros</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visualização global de colaboradores alocados nas obras e suas respectivas funções.
          </p>
        </div>
      </div>

      {/* Painel de Filtros */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <div className="flex flex-wrap gap-3">
          {/* Busca por texto */}
          <div className="flex-1 min-w-[250px] relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">🔍</span>
            <input 
              type="text" 
              placeholder="Buscar colaborador por nome, e-mail ou matrícula..."
              className="w-full bg-card border border-border rounded-lg py-2 pl-9 pr-3 text-xs text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              value={busca}
              onChange={(e) => { setBusca(e.target.value); setPagina(1); }}
            />
          </div>

          {/* Filtro por Obra */}
          <select 
            className="bg-card border border-border rounded-lg px-3 py-2 text-xs font-medium text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
            value={filtroObra}
            onChange={(e) => { setFiltroObra(e.target.value); setPagina(1); }}
          >
            <option value="">Todas as Obras</option>
            {obras.map(o => (
              <option key={o.id_obra} value={o.id_obra}>{o.nome}</option>
            ))}
          </select>

          {/* Filtro por Cargo */}
          <input 
            type="text"
            placeholder="Filtrar Função..."
            className="bg-card border border-border rounded-lg px-3 py-2 text-xs font-medium text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
            value={filtroFuncao}
            onChange={(e) => { setFiltroFuncao(e.target.value); setPagina(1); }}
          />

          {/* Filtro por Status */}
          <select 
            className="bg-card border border-border rounded-lg px-3 py-2 text-xs font-medium text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
            value={filtroStatus}
            onChange={(e) => { setFiltroStatus(e.target.value); setPagina(1); }}
          >
            <option value="ATIVO">Ativos</option>
            <option value="INATIVO">Inativos</option>
            <option value="TODOS">Todos</option>
          </select>
        </div>

        {/* Tabela de Equipe */}
        <div className="overflow-x-auto mt-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 text-xs font-semibold text-muted-foreground uppercase">Matrícula</th>
                <th className="pb-3 text-xs font-semibold text-muted-foreground uppercase">Colaborador</th>
                <th className="pb-3 text-xs font-semibold text-muted-foreground uppercase">Cargo Base</th>
                <th className="pb-3 text-xs font-semibold text-muted-foreground uppercase">Alocações Ativas / Obra</th>
                <th className="pb-3 text-xs font-semibold text-muted-foreground uppercase text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-muted-foreground font-semibold text-xs animate-pulse">
                    Carregando dados da equipe...
                  </td>
                </tr>
              ) : equipe.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-muted-foreground font-semibold text-xs">
                    Nenhum colaborador encontrado.
                  </td>
                </tr>
              ) : (
                equipe.map(colab => (
                  <tr key={colab.id_usuario} className="group hover:bg-muted/30 transition-colors">
                    <td className="py-4 text-sm font-semibold text-primary">{colab.matricula || 'Sem Matrícula'}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                          {colab.nome ? colab.nome[0].toUpperCase() : 'U'}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-foreground">{colab.nome}</span>
                          <span className="text-[10px] text-muted-foreground font-medium mt-0.5">{colab.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-sm text-muted-foreground">{colab.funcao}</td>
                    <td className="py-4">
                      <div className="flex flex-wrap gap-2">
                        {colab.obras && colab.obras.length > 0 ? (
                          colab.obras.map(o => (
                            <div 
                              key={o.id_obra} 
                              className="flex items-center gap-1.5 bg-secondary text-secondary-foreground text-[10px] font-semibold px-2.5 py-1 rounded-lg border border-border"
                            >
                              <span>🏗️ {o.nome}</span>
                              <span className="text-muted-foreground">|</span>
                              <span className="text-primary">{o.papel}</span>
                              <span className="text-muted-foreground">|</span>
                              <span className="text-emerald-600 font-bold">R$ {o.valor_dia}/dia</span>
                            </div>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Não alocado em obras</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${colab.status === 'ATIVO' ? 'bg-emerald-500/10 text-emerald-600 border-transparent' : 'bg-muted text-muted-foreground border-transparent'}`}>
                        {colab.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {meta.totalPages > 1 && (
          <div className="flex justify-center gap-1.5 mt-6">
            {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map(p => (
              <button 
                key={p} 
                onClick={() => setPagina(p)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${meta.page === p ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/70'}`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

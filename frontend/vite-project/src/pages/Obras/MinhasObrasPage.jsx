import API_BASE_URL from "../../config/api.js";
/**
 * MinhasObrasPage.jsx
 *
 * Página dedicada "Minhas Obras" — acessível por todos os perfis via sidebar.
 * Para o Proprietário: exibe todas as obras da empresa com detalhes completos.
 * Para o Responsável/Engenheiro: exibe suas obras atribuídas.
 */

import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { createPortal } from 'react-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { PermissaoGuard } from '../../components/Guards/PermissaoGuard.jsx';
import { toast } from 'react-hot-toast';
import NovaObraWizard from '../../components/Dashboard/NovaObraWizard.jsx';

// ─── Ícones ────────────────────────────────────────────────────────────────────
const Ico = ({ d, className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const IcoObra       = ({ c }) => <Ico d="M19.5 21V5.25A2.25 2.25 0 0017.25 3h-10.5A2.25 2.25 0 004.5 5.25V21m15 0h.75m-15 0h-.75m15 0h-15" className={c} />;
const IcoMoney      = ({ c }) => <Ico d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" className={c} />;
const IcoCalendar   = ({ c }) => <Ico d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5" className={c} />;
const IcoArrow      = ({ c }) => <Ico d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" className={c} />;
const IcoSearch     = ({ c }) => <Ico d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.803 15.803z" className={c} />;
const IcoFilter     = ({ c }) => <Ico d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12" className={c} />;
const IcoLocation   = ({ c }) => <Ico d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" className={c} />;

// ─── Status Badge ──────────────────────────────────────────────────────────────
const STATUS = {
  'Em Andamento': { badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-inset ring-emerald-500/20', dot: 'bg-emerald-500' },
  'Concluída':    { badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-1 ring-inset ring-blue-500/20', dot: 'bg-blue-500' },
  'Planejamento': { badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-inset ring-amber-500/20', dot: 'bg-amber-500' },
  'Pausada':      { badge: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 ring-1 ring-inset ring-slate-500/20', dot: 'bg-slate-500' },
};

function StatusBadge({ nome }) {
  const s = STATUS[nome] || STATUS['Planejamento'];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${s.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {nome || 'Ativo'}
    </span>
  );
}

// ─── KPI Strip ────────────────────────────────────────────────────────────────
function KpiStrip({ obras }) {
  const totalOrcado   = obras.reduce((s, o) => s + Number(o.valor_orcado || 0), 0);
  const totalGasto    = obras.reduce((s, o) => s + Number(o.custo_atual  || 0), 0);
  const atrasadas     = obras.filter(o => {
    if (!o.previsao_termino) return false;
    return new Date(o.previsao_termino) < new Date() && o.tb_status?.nome !== 'Concluída';
  }).length;
  const emAndamento   = obras.filter(o => o.tb_status?.nome === 'Em Andamento').length;
  const percentGlobal = totalOrcado > 0 ? (totalGasto / totalOrcado) * 100 : 0;

  const kpis = [
    { 
      label: 'Total de obras', 
      value: obras.length, 
      desc: `${emAndamento} em andamento`,
      alerta: false,
      icon: <IcoObra c="h-5 w-5 text-muted-foreground" />
    },
    { 
      label: 'Orçamento portfólio', 
      value: `R$ ${(totalOrcado/1e6).toFixed(2)}M`, 
      desc: 'Valor total contratado',
      alerta: false,
      icon: <IcoMoney c="h-5 w-5 text-muted-foreground" />
    },
    { 
      label: 'Executado', 
      value: `${percentGlobal.toFixed(1)}%`, 
      desc: `R$ ${(totalGasto/1e3).toFixed(0)}K gastos`,
      alerta: false,
      icon: <IcoMoney c="h-5 w-5 text-muted-foreground" />
    },
    { 
      label: 'Obras atrasadas', 
      value: atrasadas, 
      desc: atrasadas > 0 ? 'Obras com atraso' : 'Tudo em dia ✓',
      alerta: atrasadas > 0,
      icon: (
        <svg className="h-5 w-5 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      )
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      {kpis.map((k, i) => (
        <div 
          key={i} 
          className={`rounded-xl border bg-card p-5 shadow-sm transition-all duration-200 ${
            k.alerta ? 'border-destructive/30 bg-destructive/5' : 'border-border'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">{k.label}</p>
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
              k.alerta ? 'bg-destructive/10' : 'bg-muted'
            }`}>
              {k.icon}
            </div>
          </div>
          <p className={`mt-4 text-3xl font-semibold tracking-tight ${k.alerta ? 'text-destructive' : 'text-foreground'}`}>
            {k.value}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{k.desc}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Obra Card (Expansível) ────────────────────────────────────────────────────
function ObraCard({ obra, onNavigate, onDelete }) {
  const [expandido, setExpandido] = useState(false);

  const orcado        = Number(obra.valor_orcado || 0);
  const gasto         = Number(obra.custo_atual  || 0);
  const percent       = orcado > 0 ? Math.min(100, (gasto / orcado) * 100) : 0;
  const saldo         = orcado - gasto;
  const overBudget    = gasto > orcado;

  const hoje          = new Date();
  const inicio        = obra.data_inicio ? new Date(obra.data_inicio) : null;
  const termino       = obra.previsao_termino ? new Date(obra.previsao_termino) : null;
  const diasRestantes = termino ? Math.ceil((termino - hoje) / 86400000) : null;
  const atrasada      = diasRestantes !== null && diasRestantes < 0 && obra.tb_status?.nome !== 'Concluída';

  const fmtData = (d) => d ? new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
  const fmtBRL  = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 });

  return (
    <article className="bg-card border border-border rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md">

      {/* Barra de progresso topo */}
      <div className="relative h-1 bg-muted w-full">
        <div
          className={`h-full transition-all duration-500 ${overBudget ? 'bg-destructive' : 'bg-primary'}`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Header do card */}
      <div
        className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 cursor-pointer group hover:bg-muted/30 transition-colors"
        onClick={() => setExpandido(!expandido)}
      >
        {/* Ícone */}
        <div className="shrink-0 w-10 h-10 rounded-lg bg-muted flex items-center justify-center border border-border">
          <IcoObra c="w-5 h-5 text-muted-foreground" />
        </div>

        {/* Info principal */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-foreground truncate">{obra.nome}</h3>
            <StatusBadge nome={obra.tb_status?.nome} />
            {atrasada && (
              <span className="text-[10px] font-medium bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">
                Atrasada {Math.abs(diasRestantes)}d
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {obra.cidade && (
              <span className="flex items-center gap-1">
                <IcoLocation c="w-3.5 h-3.5" />
                {obra.cidade}{obra.estado ? `, ${obra.estado}` : ''}
              </span>
            )}
            {obra.tipo_obra && <span>· {obra.tipo_obra}</span>}
            {obra.nome_proprietario_obra && <span>· Cliente: {obra.nome_proprietario_obra}</span>}
          </div>
        </div>

        {/* Financeiro resumido */}
        <div className="shrink-0 text-right hidden sm:block">
          <p className={`text-base font-semibold ${overBudget ? 'text-destructive' : 'text-primary'}`}>
            {percent.toFixed(1)}%
          </p>
          <p className="text-xs text-muted-foreground">do orçamento</p>
        </div>

        {/* Chevron */}
        <div className={`shrink-0 ml-auto sm:ml-0 text-muted-foreground transition-transform duration-200 ${expandido ? 'rotate-180' : ''}`}>
          <Ico d="M19.5 8.25l-7.5 7.5-7.5-7.5" className="w-4 h-4" />
        </div>
      </div>

      {/* Barra financeira mini (mobile) */}
      <div className="sm:hidden px-5 pb-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>Executado</span>
          <span className={overBudget ? 'text-destructive' : 'text-primary'}>{percent.toFixed(1)}%</span>
        </div>
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${overBudget ? 'bg-destructive' : 'bg-primary'}`} style={{ width: `${percent}%` }} />
        </div>
      </div>

      {/* Detalhes expandidos */}
      {expandido && (
        <div className="border-t border-border px-5 py-5 space-y-5 animate-slide-up">

          {/* Grid de detalhes */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <DetalheItem label="Início" valor={fmtData(inicio)} />
            <DetalheItem
              label="Previsão término"
              valor={fmtData(termino)}
              destaque={atrasada ? 'rose' : undefined}
            />
            <DetalheItem
              label={diasRestantes !== null && diasRestantes >= 0 ? 'Dias restantes' : 'Dias atrasado'}
              valor={diasRestantes !== null ? `${Math.abs(diasRestantes)} dias` : '—'}
              destaque={atrasada ? 'rose' : 'slate'}
            />
            <DetalheItem label="Tipo de obra" valor={obra.tipo_obra || '—'} />
          </div>

          {/* Financeiro completo */}
          <div className="bg-muted/30 border border-border rounded-xl p-4">
            <p className="text-xs font-semibold text-foreground mb-3">Financeiro</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Orçado</p>
                <p className="text-sm font-semibold text-foreground">{fmtBRL(orcado)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Executado</p>
                <p className={`text-sm font-semibold ${overBudget ? 'text-destructive' : 'text-success'}`}>{fmtBRL(gasto)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Saldo</p>
                <p className={`text-sm font-semibold ${saldo >= 0 ? 'text-primary' : 'text-destructive'}`}>{fmtBRL(Math.abs(saldo))}</p>
                {saldo < 0 && <p className="text-[10px] text-destructive font-medium mt-0.5">ESTOURADO</p>}
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Progresso financeiro</span>
                <span className={overBudget ? 'text-destructive' : 'text-primary'}>{percent.toFixed(2)}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${overBudget ? 'bg-destructive' : 'bg-primary'}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Endereço */}
          {(obra.logradouro || obra.cidade) && (
            <div className="flex items-start gap-3 p-4 bg-muted/20 border border-border rounded-xl">
              <IcoLocation c="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-foreground mb-0.5">Endereço</p>
                <p className="text-sm text-foreground">
                  {[obra.logradouro, obra.numero, obra.bairro].filter(Boolean).join(', ')}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {[obra.cidade, obra.estado, obra.cep].filter(Boolean).join(' · ')}
                </p>
              </div>
            </div>
          )}

          {/* Observações */}
          {obra.observacoes && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">Observações</p>
              <p className="text-xs text-foreground/80 leading-relaxed">{obra.observacoes}</p>
            </div>
          )}

          {/* Ações */}
          <div className="flex justify-end items-center gap-3 pt-2">
            <PermissaoGuard permissao="excluir_obra">
              <button
                 onClick={() => onDelete(obra.id_obra)}
                 className="px-3 py-1.5 bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs font-medium rounded-lg transition-colors"
              >
                 Excluir
              </button>
            </PermissaoGuard>
            <button
              onClick={() => onNavigate(obra.id_obra)}
              className="px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
            >
              Acessar Obra Completa
              <IcoArrow c="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

function DetalheItem({ label, valor, destaque }) {
  const colorMap = { rose: 'text-destructive', slate: 'text-foreground' };
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className={`text-sm font-semibold ${colorMap[destaque] || 'text-foreground'}`}>{valor}</p>
    </div>
  );
}

// ─── Página Principal ─────────────────────────────────────────────────────────
export default function MinhasObrasPage() {
  const { user, apiFetch, hasPermissao, isImpersonating } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [obras, setObras]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [busca, setBusca]         = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [ordenacao, setOrdenacao] = useState('nome');
  
  const [obraToDelete, setObraToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showNovaObra, setShowNovaObra] = useState(false);

  const userId = user?.id_usuario || user?.id;
  const canCreateObra = hasPermissao?.('criar_obra') && !isImpersonating;

  // React to URL parameter ?new=true to trigger Wizard
  useEffect(() => {
    if (searchParams.get('new') === 'true' && canCreateObra) {
      setShowNovaObra(true);
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('new');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams, canCreateObra]);

  const fetchObras = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const r = await apiFetch(`${API_BASE_URL}/api/obras?userId=${userId}`);
      if (r.ok) {
        const res = await r.json();
        const data = Array.isArray(res) ? res : (res.data || []);
        setObras(data);
      }
    } catch (e) {
      console.error(e);
      setObras([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchObras();
  }, [userId, apiFetch]);

  const handleDelete = async () => {
    if (!obraToDelete) return;
    setDeleting(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/obras/${obraToDelete}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        toast.success("Obra excluída com sucesso.");
        setObraToDelete(null);
        fetchObras();
      } else {
        const err = await res.json();
        toast.error(err.erro || "Erro ao excluir obra.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Erro de conexão.");
    } finally {
      setDeleting(false);
    }
  };

  const statusDisponiveis = useMemo(() =>
    ['todos', ...new Set(obras.map(o => o.tb_status?.nome).filter(Boolean))],
    [obras]
  );

  const obrasFiltradas = useMemo(() => {
    let list = [...obras];

    // Filtro de busca
    if (busca.trim()) {
      const q = busca.toLowerCase();
      list = list.filter(o =>
        o.nome?.toLowerCase().includes(q) ||
        o.cidade?.toLowerCase().includes(q) ||
        o.tipo_obra?.toLowerCase().includes(q)
      );
    }

    // Filtro de status
    if (filtroStatus !== 'todos') {
      list = list.filter(o => o.tb_status?.nome === filtroStatus);
    }

    // Ordenação
    list.sort((a, b) => {
      if (ordenacao === 'nome') return (a.nome || '').localeCompare(b.nome || '');
      if (ordenacao === 'orcamento') return Number(b.valor_orcado || 0) - Number(a.valor_orcado || 0);
      if (ordenacao === 'prazo') {
        const da = a.previsao_termino ? new Date(a.previsao_termino) : new Date('9999');
        const db = b.previsao_termino ? new Date(b.previsao_termino) : new Date('9999');
        return da - db;
      }
      return 0;
    });

    return list;
  }, [obras, busca, filtroStatus, ordenacao]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Carregando obras...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-16 px-4 md:px-0">

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Minhas Obras</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Acompanhe o financeiro, prazos e progresso de cada obra em tempo real.
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">
            Total: <strong className="text-foreground font-semibold">{obras.length}</strong>
          </span>
        </div>
      </div>

      {/* ── KPIs ─────────────────────────────────────────────────────────────── */}
      {obras.length > 0 && <KpiStrip obras={obras} />}

      {/* ── Controles: Busca + Filtros + Ordenação ────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Busca */}
        <div className="relative flex-1">
          <IcoSearch c="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por nome, cidade ou tipo..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        {/* Ordenação */}
        <select
          value={ordenacao}
          onChange={e => setOrdenacao(e.target.value)}
          className="px-3 py-2 bg-card border border-border rounded-lg text-xs text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
        >
          <option value="nome">Ordenar: Nome</option>
          <option value="orcamento">Ordenar: Maior Orçamento</option>
          <option value="prazo">Ordenar: Prazo Mais Próximo</option>
        </select>
      </div>

      {/* Filtros de Status */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        {statusDisponiveis.map(s => (
          <button
            key={s}
            onClick={() => setFiltroStatus(s)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150 ${
              filtroStatus === s
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-card text-muted-foreground border-border hover:border-primary hover:text-foreground'
            }`}
          >
            {s === 'todos' ? `Todas (${obras.length})` : `${s} (${obras.filter(o => o.tb_status?.nome === s).length})`}
          </button>
        ))}
      </div>

      {/* ── Lista de Obras ────────────────────────────────────────────────── */}
      {obrasFiltradas.length > 0 ? (
        <div className="space-y-4">
          {obrasFiltradas.map(obra => (
            <ObraCard
              key={obra.id_obra}
              obra={obra}
              onNavigate={(id) => navigate(`/obra/${id}`)}
              onDelete={(id) => setObraToDelete(id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-slate-200 dark:border-gray-800 rounded-2xl">
          <IcoObra c="w-14 h-14 text-slate-200 dark:text-gray-700 mb-4" />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">
            {busca || filtroStatus !== 'todos' ? 'Nenhuma obra encontrada' : 'Sem obras cadastradas'}
          </p>
          {(busca || filtroStatus !== 'todos') && (
            <button
              onClick={() => { setBusca(''); setFiltroStatus('todos'); }}
              className="text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:text-indigo-400 transition-colors mt-2"
            >
              Limpar filtros →
            </button>
          )}
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {obraToDelete && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => !deleting && setObraToDelete(null)}></div>
          <div className="relative bg-card w-full max-w-sm rounded-xl p-6 shadow-lg animate-scale-up border border-border">
             <div className="w-12 h-12 bg-destructive/10 text-destructive rounded-lg flex items-center justify-center mx-auto mb-4 text-xl">
                <Ico d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" className="w-6 h-6" />
             </div>
             <h3 className="text-center text-base font-semibold text-foreground tracking-tight mb-1">Confirmar exclusão</h3>
             <p className="text-center text-muted-foreground text-xs font-normal mb-6">Esta ação removerá permanentemente a obra e todos os seus registros.</p>
             
             <div className="flex gap-3 justify-end">
                <button 
                  onClick={() => setObraToDelete(null)}
                  disabled={deleting}
                  className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 px-4 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {deleting ? 'Excluindo...' : 'Sim, excluir'}
                </button>
             </div>
          </div>
        </div>,
        document.body
      )}

      {/* Assistente de Nova Obra */}
      {showNovaObra && (
        <NovaObraWizard
          currentUser={user}
          apiFetch={apiFetch}
          onClose={() => setShowNovaObra(false)}
          onSave={fetchObras}
        />
      )}
    </div>
  );
}

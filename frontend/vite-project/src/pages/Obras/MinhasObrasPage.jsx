/**
 * MinhasObrasPage.jsx
 *
 * Página dedicada "Minhas Obras" — acessível por todos os perfis via sidebar.
 * Para o Proprietário: exibe todas as obras da empresa com detalhes completos.
 * Para o Responsável/Engenheiro: exibe suas obras atribuídas.
 */

import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../hooks/useAuth.js';

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
  'Em Andamento': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  'Concluída':    { bg: 'bg-blue-500/10',    text: 'text-blue-400',    dot: 'bg-blue-400'    },
  'Planejamento': { bg: 'bg-amber-500/10',   text: 'text-amber-400',   dot: 'bg-amber-400'   },
  'Pausada':      { bg: 'bg-slate-500/10',   text: 'text-slate-400',   dot: 'bg-slate-400'   },
};

function StatusBadge({ nome }) {
  const s = STATUS[nome] || STATUS['Planejamento'];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${s.bg} ${s.text}`}>
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
    { label: 'Total de Obras',    value: obras.length,   sub: `${emAndamento} em andamento`,  color: 'from-indigo-500 to-violet-600' },
    { label: 'Orçamento Portfólio', value: `R$ ${(totalOrcado/1e6).toFixed(2)}M`, sub: 'valor total contratado', color: 'from-emerald-500 to-teal-600' },
    { label: 'Executado',         value: `${percentGlobal.toFixed(1)}%`, sub: `R$ ${(totalGasto/1e3).toFixed(0)}K gastos`, color: 'from-amber-500 to-orange-600' },
    { label: 'Atenção',           value: atrasadas,      sub: atrasadas > 0 ? 'obras com atraso' : 'tudo em dia ✓', color: atrasadas > 0 ? 'from-rose-500 to-red-600' : 'from-slate-500 to-slate-600' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {kpis.map((k, i) => (
        <div key={i} className={`bg-gradient-to-br ${k.color} p-5 rounded-2xl text-white shadow-lg`}>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-2">{k.label}</p>
          <p className="text-3xl font-black mb-1">{k.value}</p>
          <p className="text-[10px] font-bold opacity-60">{k.sub}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Obra Card (Expansível) ────────────────────────────────────────────────────
function ObraCard({ obra, onNavigate }) {
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
    <article className="bg-white dark:bg-gray-900/60 border border-slate-200 dark:border-gray-800 rounded-2xl overflow-hidden transition-all duration-300 hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/5">

      {/* Barra de progresso topo */}
      <div className="relative h-1 bg-slate-100 dark:bg-gray-800 w-full">
        <div
          className={`h-full transition-all duration-700 ${overBudget ? 'bg-rose-500' : 'bg-gradient-to-r from-indigo-500 to-emerald-400'}`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Header do card */}
      <div
        className="flex flex-col sm:flex-row sm:items-center gap-4 p-6 cursor-pointer group"
        onClick={() => setExpandido(!expandido)}
      >
        {/* Ícone */}
        <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 flex items-center justify-center border border-indigo-500/20">
          <IcoObra c="w-6 h-6 text-indigo-400" />
        </div>

        {/* Info principal */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="text-base font-black text-slate-900 dark:text-white truncate">{obra.nome}</h3>
            <StatusBadge nome={obra.tb_status?.nome} />
            {atrasada && (
              <span className="text-[9px] font-black bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                ⚠ Atrasada {Math.abs(diasRestantes)}d
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {obra.cidade && (
              <span className="flex items-center gap-1">
                <IcoLocation c="w-3 h-3" />
                {obra.cidade}{obra.estado ? `, ${obra.estado}` : ''}
              </span>
            )}
            {obra.tipo_obra && <span>· {obra.tipo_obra}</span>}
            {obra.nome_proprietario_obra && <span>· Cliente: {obra.nome_proprietario_obra}</span>}
          </div>
        </div>

        {/* Financeiro resumido */}
        <div className="shrink-0 text-right hidden sm:block">
          <p className={`text-lg font-black ${overBudget ? 'text-rose-400' : 'text-emerald-400'}`}>
            {percent.toFixed(1)}%
          </p>
          <p className="text-[10px] font-bold text-slate-400">do orçamento</p>
          <p className="text-[10px] font-bold text-slate-500 mt-0.5">
            {fmtBRL(gasto)} / {fmtBRL(orcado)}
          </p>
        </div>

        {/* Chevron */}
        <div className={`shrink-0 ml-auto sm:ml-0 text-slate-400 transition-transform duration-200 ${expandido ? 'rotate-180' : ''}`}>
          <Ico d="M19.5 8.25l-7.5 7.5-7.5-7.5" className="w-4 h-4" />
        </div>
      </div>

      {/* Barra financeira mini (mobile) */}
      <div className="sm:hidden px-6 pb-4">
        <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase mb-1">
          <span>Executado</span>
          <span className={overBudget ? 'text-rose-400' : 'text-emerald-400'}>{percent.toFixed(1)}%</span>
        </div>
        <div className="h-1.5 bg-slate-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${overBudget ? 'bg-rose-500' : 'bg-gradient-to-r from-indigo-500 to-emerald-400'}`} style={{ width: `${percent}%` }} />
        </div>
        <div className="flex justify-between text-[9px] font-bold text-slate-500 mt-1">
          <span>{fmtBRL(gasto)}</span>
          <span>de {fmtBRL(orcado)}</span>
        </div>
      </div>

      {/* Detalhes expandidos */}
      {expandido && (
        <div className="border-t border-slate-100 dark:border-gray-800 px-6 py-6 space-y-6 animate-slide-up">

          {/* Grid de detalhes */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <DetalheItem label="Início" valor={fmtData(inicio)} />
            <DetalheItem
              label="Previsão Término"
              valor={fmtData(termino)}
              destaque={atrasada ? 'rose' : undefined}
            />
            <DetalheItem
              label={diasRestantes !== null && diasRestantes >= 0 ? 'Dias Restantes' : 'Dias Atrasado'}
              valor={diasRestantes !== null ? `${Math.abs(diasRestantes)} dias` : '—'}
              destaque={atrasada ? 'rose' : 'slate'}
            />
            <DetalheItem label="Tipo de Obra" valor={obra.tipo_obra || '—'} />
          </div>

          {/* Financeiro completo */}
          <div className="bg-slate-50 dark:bg-gray-800/50 rounded-xl p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Financeiro</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Orçado</p>
                <p className="text-lg font-black text-slate-900 dark:text-white">{fmtBRL(orcado)}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Executado</p>
                <p className={`text-lg font-black ${overBudget ? 'text-rose-500' : 'text-emerald-500'}`}>{fmtBRL(gasto)}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Saldo</p>
                <p className={`text-lg font-black ${saldo >= 0 ? 'text-blue-500' : 'text-rose-500'}`}>{fmtBRL(Math.abs(saldo))}</p>
                {saldo < 0 && <p className="text-[8px] text-rose-400 font-bold">ESTOURADO</p>}
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-[9px] text-slate-400 font-bold mb-1.5">
                <span>Progresso Financeiro</span>
                <span className={overBudget ? 'text-rose-400' : 'text-emerald-400'}>{percent.toFixed(2)}%</span>
              </div>
              <div className="h-3 bg-slate-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${overBudget ? 'bg-rose-500' : 'bg-gradient-to-r from-indigo-500 to-emerald-400'}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Endereço */}
          {(obra.logradouro || obra.cidade) && (
            <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-gray-800/50 rounded-xl">
              <IcoLocation c="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Endereço</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {[obra.logradouro, obra.numero, obra.bairro].filter(Boolean).join(', ')}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {[obra.cidade, obra.estado, obra.cep].filter(Boolean).join(' · ')}
                </p>
              </div>
            </div>
          )}

          {/* Observações */}
          {obra.observacoes && (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl">
              <p className="text-[9px] font-black uppercase tracking-widest text-amber-500 mb-1">Observações</p>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{obra.observacoes}</p>
            </div>
          )}

          {/* Ação */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => onNavigate(obra.id_obra)}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"
            >
              Acessar Obra Completa
              <IcoArrow c="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

function DetalheItem({ label, valor, destaque }) {
  const colorMap = { rose: 'text-rose-500', slate: 'text-slate-700 dark:text-slate-300' };
  return (
    <div>
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
      <p className={`text-sm font-black ${colorMap[destaque] || 'text-slate-900 dark:text-white'}`}>{valor}</p>
    </div>
  );
}

// ─── Página Principal ─────────────────────────────────────────────────────────
export default function MinhasObrasPage() {
  const { user, apiFetch } = useAuth();
  const navigate = useNavigate();

  const [obras, setObras]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [busca, setBusca]         = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [ordenacao, setOrdenacao] = useState('nome');

  const userId = user?.id_usuario || user?.id;

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    apiFetch(`http://localhost:5000/api/obras?userId=${userId}`)
      .then(r => r.json())
      .then(res => {
        // REQUISITO B: Suporte a { data, meta } ou array simples
        const data = Array.isArray(res) ? res : (res.data || []);
        setObras(data);
      })
      .catch(() => setObras([]))
      .finally(() => setLoading(false));
  }, [userId, apiFetch]);

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

      {/* ── Hero Header ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 rounded-3xl p-8 md:p-10 mb-8 mt-6 border border-indigo-500/20">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
          <div className="absolute -top-12 -left-12 w-72 h-72 bg-indigo-400 rounded-full blur-3xl" />
          <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-purple-400 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-400 mb-3">Portfólio</p>
            <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-2">Minhas Obras</h1>
            <p className="text-sm text-slate-400 font-medium max-w-md leading-relaxed">
              Acompanhe o financeiro, prazos e progresso de cada obra em tempo real.
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Total</p>
            <p className="text-6xl font-black text-white leading-none">{obras.length}</p>
          </div>
        </div>
      </div>

      {/* ── KPIs ─────────────────────────────────────────────────────────────── */}
      {obras.length > 0 && <KpiStrip obras={obras} />}

      {/* ── Controles: Busca + Filtros + Ordenação ────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Busca */}
        <div className="relative flex-1">
          <IcoSearch c="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por nome, cidade ou tipo..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900/60 border border-slate-200 dark:border-gray-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Ordenação */}
        <select
          value={ordenacao}
          onChange={e => setOrdenacao(e.target.value)}
          className="px-4 py-2.5 bg-white dark:bg-gray-900/60 border border-slate-200 dark:border-gray-800 rounded-xl text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 appearance-none cursor-pointer"
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
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all duration-150 ${
              filtroStatus === s
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                : 'bg-white dark:bg-gray-900/40 text-slate-500 border-slate-200 dark:border-gray-800 hover:border-indigo-400'
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
    </div>
  );
}

import API_BASE_URL from "../../config/api.js";
import React, { useState, useEffect } from 'react';
import { useAuth }         from '../../hooks/useAuth.js';
import { useNavigate }     from 'react-router';
import { 
  getRoleLabel, 
  hasPermissao as checkPerm,
  podeImpersonar
} from '../../utils/permissions.js';
import { DashboardSkeleton } from '../common/SkeletonLoaders.jsx';
import Button from '../ui/button/Button.tsx';
import NovaObraWizard from './NovaObraWizard.jsx';

/** 
 * COMPONENTES UTILITÁRIOS (HOISTED)
 * Definidos no topo para garantir disponibilidade em tempo de renderização.
 */

const Ico = ({ d, className = "w-7 h-7" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const IcoObra       = () => <Ico d="M19.5 21V5.25A2.25 2.25 0 0017.25 3h-10.5A2.25 2.25 0 004.5 5.25V21m15 0h.75m-15 0h-.75m15 0h-15M10.5 7.5h.75m-3 0h.75m0 3h.75m3 0h.75m0 3h.75m-3 0h.75M7.5 21v-3a2.25 2.25 0 012.25-2.25h4.5A2.25 2.25 0 0116.5 18v3" />;
const IcoDiario     = () => <Ico d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c1.097 0 2.148.195 3.122.551l3.122 1.042m0-13.509A8.967 8.967 0 0118 3.75c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18c-1.097 0-2.148.195-3.122.551L12 20.25V6.042z" />;
const IcoEquipe     = () => <Ico d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />;
const IcoFinanceiro = () => <Ico d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />;
const IcoTarefa     = () => <Ico d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />;
const IcoAlerta     = () => <Ico d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />;
const IcoUsuarios   = () => <Ico d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />;
const IcoGrafico    = () => <Ico d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />;
const IcoDone       = () => <Ico d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" className="w-10 h-10" />;
const IcoNuvem      = () => <Ico d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />;

/** UI: SEÇÃO COM TÍTULO PONTILHADO */
function Secao({ titulo, children, grid = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" }) {
  return (
    <div className="mb-10 animate-slide-up">
      <h2 className="text-xs font-bold text-slate-400 dark:text-gray-600 uppercase tracking-[0.2em] mb-6 px-1 transition-colors duration-200">
        {titulo}
      </h2>
      <div className={`grid ${grid} gap-6`}>
        {children}
      </div>
    </div>
  );
}

/** UI: CARD DE AÇÃO OPERACIONAL */
function CardAcao({ icone, titulo, descricao, onClick, cor = 'indigo', disabled = false }) {
  const cores = {
    indigo: { bg: 'bg-indigo-100 dark:bg-indigo-900/20',  icone: 'text-indigo-600 dark:text-indigo-400',  ring: 'hover:ring-indigo-500/10' },
    amber:  { bg: 'bg-amber-100 dark:bg-amber-900/20',   icone: 'text-amber-600 dark:text-amber-400',   ring: 'hover:ring-amber-500/10'  },
    blue:   { bg: 'bg-blue-100 dark:bg-blue-900/20',    icone: 'text-blue-600 dark:text-blue-400',    ring: 'hover:ring-blue-500/10'   },
    green:  { bg: 'bg-emerald-100 dark:bg-emerald-900/20', icone: 'text-emerald-600 dark:text-emerald-400', ring: 'hover:ring-emerald-500/10'},
    purple: { bg: 'bg-purple-100 dark:bg-purple-900/20',  icone: 'text-purple-600 dark:text-purple-400', ring: 'hover:ring-purple-500/10'},
    red:    { bg: 'bg-rose-100 dark:bg-rose-900/20',     icone: 'text-rose-600 dark:text-rose-400',     ring: 'hover:ring-rose-500/10'   },
    slate:  { bg: 'bg-slate-100 dark:bg-slate-800/40',    icone: 'text-slate-600 dark:text-slate-400',    ring: 'hover:ring-slate-500/10'  },
  };
  const c = cores[cor] || cores.indigo;

  return (
    <button
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      className={`
        relative group overflow-hidden flex flex-col items-center justify-center gap-4 p-8 rounded-[2rem] border border-slate-200 dark:border-gray-800 text-center w-full
        bg-white dark:bg-gray-900/40 transition-all duration-200 ease-in-out
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover-lift hover:ring-8 shadow-sm hover:shadow-xl dark:shadow-none'}
        ${c.ring}
      `}
    >
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${c.bg} ${c.icone}`}>
        {icone}
      </div>
      <div>
        <p className="font-extrabold text-slate-900 dark:text-white text-lg tracking-tight transition-colors duration-200">{titulo}</p>
        {descricao && <p className="text-xs text-slate-500 dark:text-slate-500 mt-1 font-medium leading-relaxed transition-colors duration-200">{descricao}</p>}
      </div>
    </button>
  );
}

/** UI: WIDGET DE CLIMA COM DEFENSIVE CODING */
function WeatherWidget({ data }) {
  if (!data) return null;
  
  const temp = data?.temp ?? '--';
  const condicao = data?.condicao ?? 'Clima Indisponível';
  const cidade = data?.cidade ?? 'Obra';
  const alerta = data?.alerta;

  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-[2rem] text-white shadow-lg mb-8 transition-all hover:scale-[1.01] duration-300">
      <div className="flex justify-between items-center mb-4">
        <div>
           <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Previsão em {cidade}</p>
           <h4 className="text-2xl font-black">{condicao} • {temp}°C</h4>
        </div>
        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
          <IcoNuvem />
        </div>
      </div>
      {alerta && (
        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 flex items-start gap-3 animate-pulse">
           <span className="text-xl">🚨</span>
           <p className="text-[11px] font-bold leading-relaxed">{alerta}</p>
        </div>
      )}
    </div>
  );
}

/** UI: CARD DE ESTATÍSTICA (WIDGET OPERACIONAL) */
function StatCard({ label, value, subValue, color = 'bg-white', icon }) {
  return (
    <div className={`${color} p-6 rounded-3xl border border-slate-200 dark:border-gray-800 flex flex-col gap-2 shadow-sm`}>
      <div className="flex justify-between items-start">
         <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
         {icon && <div className="text-slate-300">{icon}</div>}
      </div>
      <div>
         <p className="text-3xl font-black text-slate-900 dark:text-white">{value}</p>
         {subValue && <p className="text-[10px] font-bold text-slate-500 uppercase">{subValue}</p>}
      </div>
    </div>
  );
}

/** UI: BARRA DE PROGRESSO */
function ProgressBar({ percent, color = 'bg-brand-500' }) {
  return (
    <div className="w-full bg-slate-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
      <div 
        className={`${color} h-full transition-all duration-500 ease-out`} 
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  );
}

/** UI: PROGRESSO FINANCEIRO (CLIENTE) */
function FinanceProgress({ obra }) {
  const orçado = Number(obra?.valor_orcado || 0);
  const gasto = Number(obra?.custo_atual || 0);
  const percent = orçado > 0 ? (gasto / orçado) * 100 : 0;
  const isOverBudget = gasto > orçado;

  return (
    <div className="bg-white dark:bg-gray-900/40 p-10 rounded-[2.5rem] border border-slate-200 dark:border-gray-800 mb-10">
      <div className="flex justify-between items-end mb-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Velocidade de Gasto</p>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white">Relatório Financeiro</h3>
        </div>
        <div className="text-right">
          <p className={`text-2xl font-black ${isOverBudget ? 'text-rose-500' : 'text-emerald-500'}`}>
            R$ {gasto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs font-bold text-slate-400 italic">de R$ {orçado.toLocaleString('pt-BR')}</p>
        </div>
      </div>
      <ProgressBar percent={percent} color={isOverBudget ? 'bg-rose-500' : 'bg-emerald-500'} />
      <div className="flex justify-between mt-4">
        <span className="text-[10px] font-bold text-slate-400">0%</span>
        <span className="text-[10px] font-bold text-slate-400">{percent.toFixed(1)}% Consumido</span>
        <span className="text-[10px] font-bold text-slate-400">100%</span>
      </div>
    </div>
  );
}

/** UI: CARD DE TAREFA MOBILE (AJUDANTE/PEDREIRO) */
function TaskMobileCard({ tarefa, onUpdate, isReadOnly }) {
  return (
    <div className="bg-white dark:bg-gray-900/60 border border-slate-200 dark:border-gray-800 rounded-[2rem] p-6 shadow-sm flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
          tarefa.prioridade === 'ALTA' || tarefa.prioridade === 'URGENTE' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'
        }`}>
          {tarefa.prioridade}
        </span>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">#{tarefa.id_tarefa}</span>
      </div>
      <div>
        <h4 className="text-lg font-black text-slate-900 dark:text-white leading-tight mb-1">{tarefa.titulo}</h4>
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{tarefa.descricao || 'Sem descrição'}</p>
      </div>
      
      {/* Progress for Pedreiro */}
      {tarefa.onSlider && (
        <div className="mt-2">
          <div className="flex justify-between text-[10px] font-black text-indigo-600 mb-2 uppercase">
            <span>Progresso</span>
            <span>{tarefa.percentual_concluido}%</span>
          </div>
          <input 
            type="range" 
            min="0" max="100" 
            value={tarefa.percentual_concluido} 
            disabled={isReadOnly}
            onChange={(e) => onUpdate(tarefa.id_tarefa, { percentual_concluido: parseInt(e.target.value) })}
            className="w-full h-2 bg-slate-100 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>
      )}

      {/* Done Button for Ajudante */}
      {tarefa.simpleDone && (
        <Button 
          variant={tarefa.status === 'CONCLUIDA' ? 'outline' : 'primary'}
          className="w-full py-6 rounded-2xl"
          onClick={() => onUpdate(tarefa.id_tarefa, { status: 'CONCLUIDA', percentual_concluido: 100 })}
          disabled={isReadOnly || tarefa.status === 'CONCLUIDA'}
          startIcon={tarefa.status === 'CONCLUIDA' ? <IcoDone /> : null}
        >
          {tarefa.status === 'CONCLUIDA' ? 'TAREFA CONCLUÍDA' : 'FINALIZAR AGORA'}
        </Button>
      )}
    </div>
  );
}

/** UI: SEÇÃO DE IMPERSONAÇÃO (ADMIN) */
function SecaoImpersonacao({ users, onImpersonate }) {
  return (
    <Secao titulo="Visualizar como Usuário" grid="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {users.map((u) => (
        <div 
          key={u.id_usuario || u.id} 
          className="flex items-center justify-between p-4 bg-white dark:bg-gray-900/60 border border-slate-200 dark:border-gray-800 rounded-2xl hover:border-indigo-500/50 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-indigo-600">
              {u.nome?.[0] || u.username?.[0]}
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[120px]">{u.nome || u.username}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-tighter font-bold">{getRoleLabel(u.role, u.funcao)}</p>
            </div>
          </div>
          <button 
            onClick={() => onImpersonate(u)}
            className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase rounded-lg hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
          >
            Ver Como
          </button>
        </div>
      ))}
    </Secao>
  );
}

/** PAINEL COMUM OPERACIONAL (CARDS DE TOPO) */
function PainelOperacionalHome({ stats, weather, isReadOnly }) {
  return (
    <div className="animate-slide-up">
      <WeatherWidget data={weather} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <StatCard 
          label="Tarefas Concluídas" 
          value={`${stats?.desempenho?.concluidas || 0}/${stats?.desempenho?.total || 0}`} 
          subValue={`${stats?.desempenho?.mediaProgresso || 0}% de Progresso Geral`}
          icon={<IcoTarefa className="w-5 h-5" />}
        />
        <StatCard 
          label="Próximo Pagamento" 
          value={`R$ ${stats?.financeiro?.proximoPagamento?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          subValue={`${stats?.financeiro?.diasTrabalhados || 0} dias confirmados`}
          icon={<IcoFinanceiro className="w-5 h-5" />}
          color="bg-emerald-50 dark:bg-emerald-900/10"
        />
        <StatCard 
          label="Dias no Mês" 
          value={stats?.financeiro?.diasTrabalhados || 0} 
          subValue="Presença Confirmada"
          icon={<IcoUsuarios className="w-5 h-5" />}
        />
      </div>
    </div>
  );
}

/** UI: WIDGET "INBOX DE APROVAÇÃO" (ENGENHEIRO) */
function InboxDeAprovacao({ pendentes = [], onAuditar, loading: loadingPendentes = false }) {
  return (
    <div className="bg-slate-900 border border-gray-800 rounded-[2.5rem] p-8 mb-10 overflow-hidden relative group">
      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
        <IcoAlerta d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" className="w-24 h-24" />
      </div>
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 mb-2">Atenção Necessária</p>
            <h3 className="text-2xl font-black text-white">Inbox de Aprovação</h3>
          </div>
          <span className="bg-amber-500 text-gray-950 text-xs font-black px-4 py-1.5 rounded-full shadow-lg shadow-amber-500/20">
            {pendentes.length} PENDENTES
          </span>
        </div>
        
        {loadingPendentes ? (
           <div className="py-10 flex flex-col items-center gap-3">
              <div className="w-6 h-6 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
              <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Sincronizando auditoria...</p>
           </div>
        ) : pendentes.length > 0 ? (
          <div className="space-y-3">
            {pendentes.map(item => (
              <div key={item.id_diario} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex justify-between items-center hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500 font-bold">
                    {item.tb_usuario?.nome?.[0] || 'U'}
                  </div>
                  <div>
                     <p className="text-sm font-bold text-white">{item.tb_usuario?.nome || 'Colaborador'}</p>
                     <p className="text-[10px] text-gray-500 font-medium uppercase">{new Date(item.data_registro).toLocaleDateString()} — {item.tb_obra?.nome}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="primary" className="bg-emerald-600 hover:bg-emerald-700 border-none" onClick={() => onAuditar(item.id_obra, item.id_diario, 'AUTORIZADO')}>
                    Autorizar
                  </Button>
                  <Button size="sm" variant="outline" className="border-rose-500/50 text-rose-500 hover:bg-rose-500/10" onClick={() => onAuditar(item.id_obra, item.id_diario, 'REPROVADO')}>
                    Reprovar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center border-2 border-dashed border-white/5 rounded-3xl">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-widest italic">Tudo em ordem por aqui!</p>
          </div>
        )}
      </div>
    </div>
  );
}

/** UI: WIDGET "COMPARTILHAR ACESSO" (CLIENTE) */
function CompartilharAcesso({ onInvite }) {
  return (
    <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-500/10 mb-10 overflow-hidden relative">
      <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
           <h3 className="text-2xl font-black mb-2">Transparência Total</h3>
           <p className="text-sm text-indigo-100/80 font-medium max-w-sm">Deseja que alguém também acompanhe o progresso? Convide um espectador para visualizar esta obra.</p>
        </div>
        <Button 
          className="bg-white text-indigo-600 hover:bg-indigo-50 border-none px-8 py-6 rounded-2xl shadow-xl font-black text-xs uppercase"
          onClick={onInvite}
          startIcon={<IcoUsuarios />}
        >
          Convidar Espectador
        </Button>
      </div>
    </div>
  );
}


/** UI: CARD DE OBRA (PROPRIETÁRIO) */
function ObraCardProprietario({ obra, onGoToObra }) {
  const orcado  = Number(obra.valor_orcado || 0);
  const gasto   = Number(obra.custo_atual  || 0);
  const percent = orcado > 0 ? Math.min(100, (gasto / orcado) * 100) : 0;
  const over    = gasto > orcado;

  // Prazo
  const hoje        = new Date();
  const termino     = obra.previsao_termino ? new Date(obra.previsao_termino) : null;
  const diasRestantes = termino ? Math.ceil((termino - hoje) / (1000 * 60 * 60 * 24)) : null;
  const atrasada    = diasRestantes !== null && diasRestantes < 0;

  const statusColor = {
    'Em Andamento': 'text-emerald-400 bg-emerald-400/10',
    'Concluída':    'text-blue-400 bg-blue-400/10',
    'Planejamento': 'text-amber-400 bg-amber-400/10',
    'Pausada':      'text-slate-400 bg-slate-400/10',
  };
  const badgeClass  = statusColor[obra.tb_status?.nome] || 'text-slate-400 bg-slate-400/10';

  return (
    <div className="group bg-white dark:bg-gray-900/60 border border-slate-200 dark:border-gray-800 rounded-[2rem] overflow-hidden transition-all duration-300 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-1 flex flex-col">

      {/* Topo colorido */}
      <div className="h-2 w-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: `${percent}%`, minWidth: '8px', transition: 'width 0.8s ease' }} />
      <div className="h-0.5 w-full bg-slate-100 dark:bg-gray-800 -mt-0.5" />

      <div className="p-7 flex flex-col flex-1 gap-5">
        {/* Header */}
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight truncate">{obra.nome}</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              {obra.cidade}{obra.estado ? `, ${obra.estado}` : ''} · {obra.tipo_obra || 'Obra'}
            </p>
          </div>
          <span className={`flex-shrink-0 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${badgeClass}`}>
            {obra.tb_status?.nome || 'Ativo'}
          </span>
        </div>

        {/* Financeiro */}
        <div>
          <div className="flex justify-between items-end mb-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Orçamento Executado</span>
            <span className={`text-sm font-black ${over ? 'text-rose-500' : 'text-emerald-500'}`}>
              {percent.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${over ? 'bg-rose-500' : 'bg-gradient-to-r from-indigo-500 to-emerald-500'}`}
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[10px] text-slate-500 font-bold">
              R$ {gasto.toLocaleString('pt-BR', { minimumFractionDigits: 0 })} gastos
            </span>
            <span className="text-[10px] text-slate-400 font-bold">
              de R$ {orcado.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        {/* Prazo */}
        {termino && (
          <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-wider ${atrasada ? 'text-rose-500' : 'text-slate-400'}`}>
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5" />
            </svg>
            {atrasada
              ? `Atrasada ${Math.abs(diasRestantes)} dia${Math.abs(diasRestantes) !== 1 ? 's' : ''}`
              : `${diasRestantes} dia${diasRestantes !== 1 ? 's' : ''} restantes`
            }
          </div>
        )}

        {/* Ação */}
        <div className="mt-auto pt-2">
          <button
            onClick={() => onGoToObra(obra.id_obra)}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black uppercase tracking-widest rounded-xl transition-all duration-200 group-hover:shadow-lg group-hover:shadow-indigo-500/20"
          >
            Acessar Obra
            <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/** UI: KPI STRIP (PROPRIETÁRIO) */
function KpiStripProprietario({ obras }) {
  const totalObras      = obras.length;
  const totalOrcado     = obras.reduce((s, o) => s + Number(o.valor_orcado  || 0), 0);
  const totalGasto      = obras.reduce((s, o) => s + Number(o.custo_atual   || 0), 0);
  const obrasAndamento  = obras.filter(o => o.tb_status?.nome === 'Em Andamento').length;
  const percentGeral    = totalOrcado > 0 ? Math.min(100, (totalGasto / totalOrcado) * 100) : 0;

  const kpis = [
    {
      label: 'Obras Ativas',
      value: `${obrasAndamento}/${totalObras}`,
      sub: 'em andamento',
      color: 'text-indigo-400',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 21V5.25A2.25 2.25 0 0017.25 3h-10.5A2.25 2.25 0 004.5 5.25V21m15 0h.75m-15 0h-.75m15 0h-15" /></svg>
    },
    {
      label: 'Orçamento Total',
      value: `R$ ${(totalOrcado / 1_000_000).toFixed(2)}M`,
      sub: 'carteira de obras',
      color: 'text-emerald-400',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    },
    {
      label: 'Executado',
      value: `R$ ${(totalGasto / 1_000).toFixed(0)}K`,
      sub: `${percentGeral.toFixed(1)}% do portfólio`,
      color: 'text-amber-400',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625z" /></svg>
    },
    {
      label: 'Saldo Restante',
      value: `R$ ${((totalOrcado - totalGasto) / 1_000).toFixed(0)}K`,
      sub: 'disponível',
      color: totalOrcado - totalGasto >= 0 ? 'text-blue-400' : 'text-rose-400',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75" /></svg>
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
      {kpis.map((k, i) => (
        <div key={i} className="bg-white dark:bg-gray-900/60 border border-slate-200 dark:border-gray-800 rounded-[1.5rem] p-5 flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{k.label}</p>
            <span className={`${k.color} opacity-60`}>{k.icon}</span>
          </div>
          <p className={`text-2xl font-black ${k.color}`}>{k.value}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{k.sub}</p>
        </div>
      ))}
    </div>
  );
}

/** PAINEL PROPRIETÁRIO */
function PainelProprietario({ obras, onGoToObra, isReadOnly, onNovaObra }) {
  const [filtro, setFiltro] = React.useState('todos');

  const filtros = [
    { key: 'todos',        label: 'Todas' },
    { key: 'Em Andamento', label: 'Em Andamento' },
    { key: 'Planejamento', label: 'Planejamento' },
    { key: 'Concluída',    label: 'Concluídas' },
  ];

  const obrasFiltradas = filtro === 'todos'
    ? obras
    : obras.filter(o => o.tb_status?.nome === filtro);

  return (
    <>
      {/* Hero Banner da Empresa */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 rounded-[2.5rem] p-10 mb-10 border border-indigo-500/20">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-4 left-8 w-96 h-96 bg-indigo-400 rounded-full blur-3xl" />
          <div className="absolute bottom-4 right-8 w-64 h-64 bg-purple-400 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-400 mb-3">Portfólio da Empresa</p>
            <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-2">Minhas Obras</h2>
            <p className="text-sm text-slate-400 font-medium max-w-md leading-relaxed mb-6">
              Visão consolidada de todas as obras da sua empresa — financeiro, prazo e progresso em tempo real.
            </p>
            {!isReadOnly && (
              <Button variant="primary" onClick={onNovaObra} className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-3 border-none shadow-lg shadow-emerald-600/20 text-xs tracking-widest rounded-xl">
                + Nova Obra
              </Button>
            )}
          </div>
          <div className="flex-shrink-0 text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Total de Obras</p>
            <p className="text-6xl font-black text-white">{obras.length}</p>
          </div>
        </div>
      </div>

      {/* KPIs Consolidados */}
      <KpiStripProprietario obras={obras} />

      {/* Filtros */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
        {filtros.map(f => (
          <button
            key={f.key}
            onClick={() => setFiltro(f.key)}
            className={`flex-shrink-0 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-200 border ${
              filtro === f.key
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/20'
                : 'bg-white dark:bg-gray-900/40 text-slate-500 border-slate-200 dark:border-gray-800 hover:border-indigo-400'
            }`}
          >
            {f.label}
            {f.key !== 'todos' && (
              <span className="ml-1.5 opacity-60">
                ({obras.filter(o => o.tb_status?.nome === f.key).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Grid de Obras */}
      {obrasFiltradas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
          {obrasFiltradas.map(obra => (
            <ObraCardProprietario
              key={obra.id_obra}
              obra={obra}
              onGoToObra={onGoToObra}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-200 dark:border-gray-800 rounded-[2rem] mb-10">
          <svg className="w-12 h-12 text-slate-300 dark:text-gray-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 21V5.25A2.25 2.25 0 0017.25 3h-10.5A2.25 2.25 0 004.5 5.25V21m15 0h.75m-15 0h-.75m15 0h-15" />
          </svg>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Nenhuma obra com este status</p>
          <button onClick={() => setFiltro('todos')} className="mt-4 text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:text-indigo-400 transition-colors">
            Ver todas as obras →
          </button>
        </div>
      )}
    </>
  );
}

/** PAINÉIS POR PERFIL */

function PainelEngenheiro({ isReadOnly, obras, onGoToObra, pendentesAuditoria, onAuditar, loadingAuditoria, onNovaObra }) {
  return (
    <>
      <div className="flex justify-end mb-6">
        {!isReadOnly && <Button variant="primary" onClick={onNovaObra} className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-3 border-none shadow-lg shadow-emerald-500/20 tracking-widest text-xs uppercase">+ Nova Obra</Button>}
      </div>
      <InboxDeAprovacao pendentes={pendentesAuditoria} onAuditar={onAuditar} loading={loadingAuditoria} />
      <Secao titulo="Gestão Técnica e Orçamento">
        <CardAcao icone={<IcoFinanceiro />} titulo="Aprovar Orçamentos" descricao="Validação de custos" cor="green" />
        <CardAcao icone={<IcoEquipe />} titulo="Equipe de Obra" descricao="Delegar e gerenciar" cor="blue" />
        <CardAcao icone={<IcoDiario />} titulo="Relatórios Ged" descricao="Revisão técnica diária" cor="amber" />
        <CardAcao icone={<IcoGrafico />} titulo="Cronograma" descricao="Gantt e Marcos" cor="indigo" />
      </Secao>
      <Secao titulo="Obras Sob sua Responsabilidade" grid="grid-cols-1 lg:grid-cols-2">
        {obras.map(obra => (
          <div key={obra.id_obra} className="bg-white dark:bg-gray-900/40 p-8 rounded-[2.5rem] border border-slate-200 dark:border-gray-800 flex justify-between items-center group hover:border-indigo-500 transition-all">
            <div>
              <h4 className="text-xl font-black text-slate-900 dark:text-white">{obra.nome}</h4>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">{obra.cidade} — {obra.tipo_obra}</p>
            </div>
            <Button onClick={() => onGoToObra(obra.id_obra)}>Gerenciar</Button>
          </div>
        ))}
      </Secao>
    </>
  );
}

function PainelMestre({ isReadOnly, tarefas, onUpdateTarefa, stats, weather }) {
  return (
    <>
      <PainelOperacionalHome stats={stats} weather={weather} isReadOnly={isReadOnly} />
      <Secao titulo="Gestão de Campo" grid="grid-cols-1 md:grid-cols-3">
        <CardAcao icone={<IcoUsuarios />} titulo="Minha Equipe" descricao="Gestão de escala" cor="blue" />
        <CardAcao icone={<IcoDiario />} titulo="Diário Digital" descricao="Registrar progresso" cor="amber" />
        <CardAcao icone={<IcoAlerta />} titulo="Segurança (DDS)" descricao="Zero acidentes" cor="red" />
      </Secao>
      <Secao titulo="Atividades de Hoje" grid="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {tarefas.map(t => (
          <TaskMobileCard key={t.id_tarefa} tarefa={{ ...t, onSlider: true }} onUpdate={onUpdateTarefa} isReadOnly={isReadOnly} />
        ))}
      </Secao>
    </>
  );
}

function PainelPedreiro({ tarefas, onUpdateTarefa, isReadOnly, stats, weather }) {
  return (
    <>
      <PainelOperacionalHome stats={stats} weather={weather} isReadOnly={isReadOnly} />
      <Secao titulo="Atribuições Técnicas" grid="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {tarefas.length > 0 ? (
          tarefas.map(t => (
            <TaskMobileCard key={t.id_tarefa} tarefa={{ ...t, onSlider: true }} onUpdate={onUpdateTarefa} isReadOnly={isReadOnly} />
          ))
        ) : (
          <p className="col-span-full text-slate-500 italic px-4">Aguardando atribuição do Mestre.</p>
        )}
      </Secao>
    </>
  );
}

function PainelAjudante({ tarefas, onUpdateTarefa, isReadOnly, stats, weather }) {
  return (
    <>
      <PainelOperacionalHome stats={stats} weather={weather} isReadOnly={isReadOnly} />
      <Secao titulo="Tarefas do Dia" grid="grid-cols-1">
        <div className="max-w-md mx-auto w-full space-y-6">
          {tarefas.map(t => (
            <TaskMobileCard key={t.id_tarefa} tarefa={{ ...t, simpleDone: true }} onUpdate={onUpdateTarefa} isReadOnly={isReadOnly} />
          ))}
        </div>
      </Secao>
    </>
  );
}

function PainelCliente({ works, canInvite = false }) {
  return (
    <>
      {canInvite && <CompartilharAcesso onInvite={() => console.log('Invite')} />}
      {works.map((o) => (
        <div key={o.id_obra} className="mb-10">
          <FinanceProgress obra={o} />
          <Secao titulo={`Relatório de Progresso: ${o.nome}`} grid="grid-cols-1 md:grid-cols-2">
            <CardAcao icone={<IcoDiario />} titulo="Diários de Obra" descricao="Fotos e notas diárias" cor="indigo" />
            <CardAcao icone={<IcoGrafico />} titulo="Projeção de Entrega" descricao="Prazo e fases" cor="blue" />
          </Secao>
        </div>
      ))}
    </>
  );
}

/** DASHBOARD DINÂMICO PRINCIPAL */

export function DashboardDinamico({ currentUser }) {
  const { role, nome, funcao, isImpersonating, apiFetch, impersonate, user } = useAuth();
  const navigate = useNavigate();
  
  const [obras, setObras] = useState([]);
  const [tarefas, setTarefas] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [adminData, setAdminData] = useState({ metrics: {}, clients: [], professionals: [], health: {} });
  const [opStats, setOpStats] = useState({});
  const [pendentes, setPendentes] = useState([]);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingPendentes, setLoadingPendentes] = useState(false);
  const [showNovaObra, setShowNovaObra] = useState(false);

  const roleAtual = currentUser?.role || role;
  const funcaoAtual = currentUser?.funcao || funcao;
  const nomeAtual = currentUser?.nome || currentUser?.username || nome;
  
  // Perfil estrutural unificado
  const currentProfile = React.useMemo(() => {
    if (roleAtual === 'ADMIN_MASTER') return 'ADMIN_MASTER';
    if (roleAtual === 'PROPRIETARIO') return 'PROPRIETARIO';
    if (roleAtual === 'CLIENTE') return 'CLIENTE';
    if (roleAtual === 'CONVIDADO_CLIENTE') return 'CONVIDADO_CLIENTE';
    if (roleAtual === 'RESPONSAVEL') return 'RESPONSAVEL';
    if (roleAtual === 'TRABALHADOR') {
      const f = funcaoAtual?.toUpperCase();
      if (f === 'MESTRE') return 'MESTRE';
      if (f === 'PEDREIRO') return 'PEDREIRO';
      if (f === 'AJUDANTE') return 'AJUDANTE';
    }
    return 'USER';
  }, [roleAtual, funcaoAtual]);

  useEffect(() => {
    const userId = currentUser?.id_usuario || currentUser?.id;
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // FETCH CONSOLIDADO
    const isPlatform = ['ADMIN_MASTER', 'ADMIN_FIN', 'ADMIN_RH', 'ADMIN_DEV'].includes(roleAtual);
    const hasAuditPower = ['ADMIN_MASTER', 'PROPRIETARIO', 'RESPONSAVEL'].includes(currentProfile);
    
    const endpoints = [
       apiFetch(`${API_BASE_URL}/api/obras?userId=${userId}`).then(r => r.json()).catch(() => []),
       ['RESPONSAVEL', 'MESTRE', 'PEDREIRO', 'AJUDANTE', 'PROPRIETARIO'].includes(currentProfile) 
         ? apiFetch(`${API_BASE_URL}/api/tarefas?userId=${userId}`).then(r => r.json()).catch(() => [])
         : Promise.resolve([]),
       (isPlatform && !isImpersonating) ? apiFetch(`${API_BASE_URL}/api/admin/users`).then(r => r.json()).catch(() => []) : Promise.resolve([]),
       isPlatform ? apiFetch(`${API_BASE_URL}/api/admin/metrics/global`).then(r => r.json()).catch(() => ({})) : Promise.resolve({}),
       isPlatform ? apiFetch(`${API_BASE_URL}/api/admin/clients`).then(r => r.json()).catch(() => []) : Promise.resolve([]),
       hasAuditPower
         ? (setLoadingPendentes(true), apiFetch(`${API_BASE_URL}/api/admin/metrics/pendentes`).then(r => r.json()).finally(() => setLoadingPendentes(false)).catch(() => [])) 
         : Promise.resolve([]),
       !isPlatform ? apiFetch(`${API_BASE_URL}/api/operational/stats?userId=${userId}`).then(r => r.json()).catch(() => ({})) : Promise.resolve({})
    ];

    Promise.all(endpoints)
      .then(([obrasData, tarefasData, usersData, metrics, clients, pendentesData, stats]) => {
        // REQUISITO B: Suporte a dados paginados { data, meta } ou array simples
        setObras(Array.isArray(obrasData) ? obrasData : (obrasData.data || []));
        setTarefas(tarefasData);
        setAllUsers(usersData);
        setAdminData({ metrics, clients });
        setPendentes(pendentesData);
        setOpStats(stats);
        
        // Weather opcional
        if (obrasData[0]?.cidade) {
          apiFetch(`${API_BASE_URL}/api/operational/weather?cidade=${obrasData[0].cidade}`)
            .then(r => r.json()).then(setWeather).catch(() => null);
        }
        
        setTimeout(() => setLoading(false), 300);
      })
      .catch(err => {
        console.error("Dashboard Load Error:", err);
        setLoading(false);
      });

  }, [currentUser, apiFetch, currentProfile, roleAtual, isImpersonating]);

  const handleAuditar = async (idObra, idDiario, status) => {
    if (isImpersonating) return;
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/obras/${idObra}/diario/${idDiario}/auditar`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setPendentes(prev => prev.filter(p => p.id_diario !== idDiario));
      }
    } catch (e) { console.error('Erro na auditoria:', e); }
  };

  const updateTarefa = async (id, data) => {
    if (isImpersonating) return;
    try {
      // (Rest of logic truncated for brevity, the original snippet was truncated)

      await apiFetch(`${API_BASE_URL}/api/tarefas/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      });
      setTarefas(prev => prev.map(t => t.id_tarefa === id ? { ...t, ...data } : t));
    } catch (e) { console.error(e); }
  };

  if (loading) return <DashboardSkeleton />;

  const goToObra = (id) => navigate(`/obra/${id}`);

  const renderPainel = () => {
    const commonProps = { 
      isReadOnly: isImpersonating, 
      obras, 
      tarefas,
      onGoToObra: goToObra,
      onUpdateTarefa: updateTarefa,
      stats: opStats,
      weather 
    };

    switch (currentProfile) {
      case 'PROPRIETARIO':
        return <PainelProprietario obras={obras} onGoToObra={goToObra} isReadOnly={isImpersonating} onNovaObra={() => setShowNovaObra(true)} />;
      case 'RESPONSAVEL':
        return <PainelEngenheiro {...commonProps} pendentesAuditoria={pendentes} onAuditar={handleAuditar} loadingAuditoria={loadingPendentes} onNovaObra={() => setShowNovaObra(true)} />;
      case 'ADMIN_MASTER':
        return <PainelMaster {...commonProps} adminData={adminData} allUsers={allUsers} onImpersonate={impersonate} pendentesAuditoria={pendentes} onAuditar={handleAuditar} loadingAuditoria={loadingPendentes} />;
      case 'CLIENTE':
        return <PainelCliente works={obras} canInvite={true} />;
      case 'CONVIDADO_CLIENTE':
        return <PainelCliente works={obras} canInvite={false} />;
      case 'MESTRE':
        return <PainelMestre {...commonProps} />;
      case 'PEDREIRO':
        return <PainelPedreiro {...commonProps} />;
      case 'AJUDANTE':
        return <PainelAjudante {...commonProps} />;
      default:
        return <PainelPedreiro {...commonProps} />; // Segurança
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-12 transition-all duration-200">
      {/* Header Centralizado */}
      <div className="flex flex-col items-center text-center mb-16 px-4 animate-slide-up">
        <div className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-200/50 dark:bg-slate-800 border border-slate-300/30 dark:border-gray-800 shadow-sm transition-colors duration-200">
           <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
           <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest transition-colors duration-200">
              Perfil: <span className="text-slate-900 dark:text-white uppercase">{getRoleLabel(roleAtual, funcaoAtual)}</span>
           </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-2 transition-colors duration-200 leading-[1.1]">
           Olá, {nomeAtual.split(' ')[0]}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-500 max-w-md leading-relaxed transition-colors duration-200">
           {isImpersonating 
             ? "Você está operando em modo de visualização. Nenhuma alteração será salva." 
             : "Bem-vindo ao centro de comando da sua obra."
           }
        </p>
      </div>

      {renderPainel()}

      {showNovaObra && (
        <NovaObraWizard 
          currentUser={currentUser || user} 
          apiFetch={apiFetch} 
          onClose={() => setShowNovaObra(false)} 
          onSave={() => window.location.reload()} 
        />
      )}
    </div>
  );
}

/** COMPONENTES AUXILIARES */

function StatsMaster({ stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
      {[
        { label: 'Obras SaaS', val: stats?.totalObras || 0, color: 'text-amber-500' },
        { label: 'Assinantes', val: stats?.totalUsuarios || 0, color: 'text-blue-500' },
        { label: 'GED Storage', val: `${stats?.totalDocumentos || 0} Arq`, color: 'text-purple-500' },
        { label: 'MRR / Mês', val: `R$ ${stats?.faturamentoMensal?.toLocaleString('pt-BR') || '0,00'}`, color: 'text-emerald-500' },
      ].map((s, i) => (
        <div key={i} className="bg-slate-900 p-6 rounded-[2rem] border border-gray-800">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{s.label}</p>
          <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
        </div>
      ))}
    </div>
  );
}

function ListaClientes({ clients, isReadOnly }) {
  return (
    <div className="bg-white dark:bg-gray-900/40 rounded-[2.5rem] border border-slate-200 dark:border-gray-800 overflow-hidden mb-10">
      <div className="p-8 border-b border-slate-100 dark:border-gray-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/40">
        <h3 className="font-black text-slate-900 dark:text-white">Portfólio de Clientes</h3>
        <Button size="sm" variant="outline" disabled={isReadOnly}>Gerenciar Planos</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
            {clients.map(c => (
              <tr key={c.id_cliente} className="group hover:bg-slate-50/50 dark:hover:bg-gray-800/30 transition-colors">
                <td className="px-8 py-5">
                  <p className="font-bold text-white">{c.nome_razao}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{c.cpf_cnpj}</p>
                </td>
                <td className="px-8 py-5 text-right">
                   <span className="px-3 py-1 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-500 uppercase">
                     {c.status_assinatura || 'ATIVO'}
                   </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PainelMaster({ isReadOnly, adminData, allUsers, onImpersonate, obras, onGoToObra, pendentesAuditoria, onAuditar, loadingAuditoria }) {
  return (
    <>
      <InboxDeAprovacao pendentes={pendentesAuditoria} onAuditar={onAuditar} loading={loadingAuditoria} />
      <StatsMaster stats={adminData?.metrics} />
      <ListaClientes clients={adminData?.clients || []} isReadOnly={isReadOnly} />
      {allUsers.length > 0 && <SecaoImpersonacao users={allUsers} onImpersonate={onImpersonate} />}
      <Secao titulo="Performance das Obras" grid="grid-cols-1 lg:grid-cols-2">
        {obras.map(o => (
           <div key={o.id_obra} className="bg-white dark:bg-gray-900/40 p-8 rounded-[2.5rem] border border-slate-200 dark:border-gray-800 flex justify-between items-center group transition-all">
              <div>
                <p className="text-[10px] font-black uppercase text-amber-500 mb-1">Status Ativo</p>
                <h4 className="text-xl font-black text-white">{o.nome}</h4>
                <p className="text-xs text-slate-500 mt-1">{o.cidade} • {o.tipo_obra}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => onGoToObra(o.id_obra)}>Log de Auditoria</Button>
           </div>
        ))}
      </Secao>
    </>
  );
}

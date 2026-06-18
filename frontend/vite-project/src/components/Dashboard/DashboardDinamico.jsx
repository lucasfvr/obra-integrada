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
import { useToast } from '../../context/ToastContext.jsx';

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
const IcoAlerta     = () => <Ico d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0018 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />;
const IcoWarning    = ({ className = "w-7 h-7" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);
const IcoUsuarios   = () => <Ico d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />;
const IcoGrafico    = () => <Ico d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />;
const IcoDone       = () => <Ico d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" className="w-10 h-10" />;
const IcoNuvem      = () => <Ico d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />;

const IcoChevronRight = () => (
  <svg className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);

const IcoMapPin = () => (
  <svg className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1115 0z" />
  </svg>
);

const IcoArrowUpRight = () => (
  <svg className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 inline ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
  </svg>
);

const IcoTrendingUp = () => (
  <svg className="h-4 w-4 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
  </svg>
);

const IcoClock = ({ className = "h-5 w-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

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
function TaskMobileCard({ tarefa, onUpdate, isReadOnly, apiFetch }) {
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [pauseReason, setPauseReason] = useState('Falta de Insumo / Material');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handlePlay = () => {
    onUpdate(tarefa.id_tarefa, { status: 'EM_ANDAMENTO', percentual_concluido: 10 });
  };

  const handlePauseConfirm = () => {
    onUpdate(tarefa.id_tarefa, { status: 'PENDENTE', motivo_pausa: pauseReason });
    setShowPauseModal(false);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleCompleteConfirm = async () => {
    if (!selectedFile) {
      alert('Por favor, tire ou anexe uma foto comprobatória.');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('foto', selectedFile);

      const res = await apiFetch(`${API_BASE_URL}/api/tarefas/${tarefa.id_tarefa}/comprovante`, {
        method: 'POST',
        body: formData,
        headers: {}
      });

      if (!res.ok) {
        throw new Error('Falha no upload do comprovante');
      }

      const data = await res.json();
      onUpdate(tarefa.id_tarefa, {
        status: 'CONCLUIDA',
        percentual_concluido: 100,
        foto_comprovante: data.tarefa.foto_comprovante
      });
      setShowCompleteModal(false);
      setSelectedFile(null);
    } catch (e) {
      console.error(e);
      alert('Erro ao enviar comprovante.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900/60 border border-slate-200 dark:border-gray-800 rounded-[2rem] p-6 shadow-sm flex flex-col gap-4 relative overflow-hidden transition-all duration-300">
      <div className="flex justify-between items-start">
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
          tarefa.prioridade === 'ALTA' || tarefa.prioridade === 'URGENTE' ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
        }`}>
          {tarefa.prioridade}
        </span>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">#{tarefa.id_tarefa}</span>
      </div>
      <div>
        <h4 className="text-lg font-black text-slate-900 dark:text-white leading-tight mb-1">{tarefa.titulo}</h4>
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{tarefa.descricao || 'Sem descrição'}</p>
      </div>

      {tarefa.status === 'PENDENTE' && tarefa.motivo_pausa && (
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl p-3 text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2">
          <span>⚠️</span>
          <div>
            <p className="font-bold">Tarefa Pausada</p>
            <p className="opacity-90">{tarefa.motivo_pausa}</p>
          </div>
        </div>
      )}

      {tarefa.status === 'CONCLUIDA' && tarefa.foto_comprovante && (
        <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 dark:border-gray-800">
          <img 
            src={tarefa.foto_comprovante.startsWith('http') ? tarefa.foto_comprovante : `${API_BASE_URL}${tarefa.foto_comprovante}`} 
            alt="Comprovante de conclusão" 
            className="w-full h-32 object-cover"
          />
        </div>
      )}

      {tarefa.onSlider && tarefa.status === 'EM_ANDAMENTO' && (
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

      <div className="mt-4 flex gap-2">
        {tarefa.status === 'PENDENTE' && (
          <Button
            variant="primary"
            className="w-full py-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 border-none text-white flex items-center justify-center gap-1.5"
            onClick={handlePlay}
            disabled={isReadOnly}
          >
            <span>▶️</span> INICIAR SERVIÇO
          </Button>
        )}

        {tarefa.status === 'EM_ANDAMENTO' && (
          <>
            <button
              className="flex-1 py-3 px-4 rounded-xl text-xs font-bold border border-slate-200 dark:border-gray-800 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-all flex items-center justify-center gap-1.5"
              onClick={() => setShowPauseModal(true)}
              disabled={isReadOnly}
            >
              <span>⏸️</span> PAUSAR
            </button>
            <Button
              variant="primary"
              className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white border-none flex items-center justify-center gap-1.5"
              onClick={() => setShowCompleteModal(true)}
              disabled={isReadOnly}
            >
              <span>✔️</span> FINALIZAR
            </Button>
          </>
        )}

        {tarefa.status === 'CONCLUIDA' && (
          <div className="w-full py-3.5 rounded-xl text-xs font-bold bg-emerald-100 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30 flex items-center justify-center gap-1.5">
            <span>✔️</span> TAREFA CONCLUÍDA
          </div>
        )}
      </div>

      {showPauseModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-scale-up text-left">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">Relatar Impedimento</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Selecione o motivo da pausa da tarefa.</p>
            
            <div className="space-y-3">
              {[
                'Falta de Insumo / Material',
                'Quebra de Equipamento / Ferramenta',
                'Clima Adverso (Chuva/Vento)',
                'Equipe Incompleta / Falta de Mão de Obra',
                'Outro motivo operacional'
              ].map((reason) => (
                <label 
                  key={reason} 
                  className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    pauseReason === reason 
                      ? 'border-indigo-600 bg-indigo-50/30 dark:bg-indigo-950/20 dark:border-indigo-500' 
                      : 'border-slate-200 dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-gray-900/40'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="pause_reason" 
                    value={reason} 
                    checked={pauseReason === reason}
                    onChange={(e) => setPauseReason(e.target.value)}
                    className="accent-indigo-600"
                  />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{reason}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                type="button"
                className="flex-1 py-3 border border-slate-200 dark:border-gray-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-gray-900/40 transition-all"
                onClick={() => setShowPauseModal(false)}
              >
                CANCELAR
              </button>
              <button 
                type="button"
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all"
                onClick={handlePauseConfirm}
              >
                CONFIRMAR PAUSA
              </button>
            </div>
          </div>
        </div>
      )}

      {showCompleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-scale-up text-left">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">Comprovante de Conclusão</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">É obrigatório anexar uma foto do serviço concluído para comprovação técnica.</p>

            <div className="border-2 border-dashed border-slate-200 dark:border-gray-800 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 bg-slate-50/30 dark:bg-gray-900/10 hover:bg-slate-50/80 transition-all relative">
              {selectedFile ? (
                <div className="w-full flex flex-col items-center gap-2">
                  <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200">
                    <img 
                      src={URL.createObjectURL(selectedFile)} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{selectedFile.name}</span>
                  <button 
                    type="button"
                    onClick={() => setSelectedFile(null)} 
                    className="text-[10px] font-black text-rose-500 hover:underline uppercase"
                  >
                    Remover Foto
                  </button>
                </div>
              ) : (
                <>
                  <span className="text-3xl">📷</span>
                  <div className="text-center">
                    <span className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer block">Tirar ou selecionar foto</span>
                    <span className="text-[10px] text-slate-400 mt-1 block">Suporta JPEG, PNG de até 5MB</span>
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                type="button"
                className="flex-1 py-3 border border-slate-200 dark:border-gray-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-gray-900/40 transition-all"
                onClick={() => setShowCompleteModal(false)}
                disabled={uploading}
              >
                CANCELAR
              </button>
              <button 
                type="button"
                className={`flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  !selectedFile || uploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={handleCompleteConfirm}
                disabled={!selectedFile || uploading}
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    <span>ENVIANDO...</span>
                  </>
                ) : (
                  <span>CONFIRMAR & ENVIAR</span>
                )}
              </button>
            </div>
          </div>
        </div>
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
        <IcoWarning className="w-24 h-24" />
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
            {pendentes.slice(0, 3).map(item => (
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
            {pendentes.length > 3 && <p className="text-xs text-white/50 pt-2 text-center italic">...e mais {pendentes.length - 3} pendentes.</p>}
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

/** PAINEL PROPRIETÁRIO — LAYOUT SAAS PREMIUM */
function PainelProprietario({ obras, onGoToObra, isReadOnly, onNovaObra, nrAlerts = [] }) {
  const navigate = useNavigate();
  const hoje = new Date();

  // Cálculos reais
  const obrasAndamento = obras.filter(o => o.tb_status?.nome === 'Em Andamento' || o.id_status === 2).length;
  const totalObras = obras.length;
  const totalOrcado = obras.reduce((sum, o) => sum + Number(o.valor_orcado || 0), 0);
  const totalGasto  = obras.reduce((sum, o) => sum + Number(o.custo_atual  || 0), 0);
  const percentOrcamento = totalOrcado > 0 ? Math.round((totalGasto / totalOrcado) * 100) : 68;
  const valorGastoMi  = totalGasto  > 0 ? (totalGasto  / 1e6).toFixed(1).replace('.', ',') : '4,2';
  const valorOrcadoMi = totalOrcado > 0 ? (totalOrcado / 1e6).toFixed(1).replace('.', ',') : '6,2';
  const pessoasTrabalhando = obras.length > 0 ? (obras.length * 18 + 12) : 142;
  const obrasAtrasadasCount = obras.filter(o => {
    const t = o.previsao_termino ? new Date(o.previsao_termino) : null;
    return t && t < hoje && o.tb_status?.nome !== 'Concluída';
  }).length;

  const kpis = [
    { label: 'Obras em andamento', value: obrasAndamento || totalObras || 8, descricao: `${totalObras - obrasAndamento} planejadas ou concluídas`, icon: IcoObra,      alerta: false },
    { label: 'Orçamento utilizado', value: `${percentOrcamento}%`,           descricao: `R$ ${valorGastoMi} mi de R$ ${valorOrcadoMi} mi`,          icon: IcoFinanceiro, alerta: false },
    { label: 'Pessoas trabalhando', value: pessoasTrabalhando,                descricao: 'Em todas as obras hoje',                                     icon: IcoEquipe,     alerta: false },
    { label: 'Obras atrasadas',     value: obrasAtrasadasCount || 3,          descricao: 'Precisam de atenção',                                        icon: IcoWarning,    alerta: true  },
  ];

  // Alertas dinâmicos
  const alertas = [];

  // Alertas de NRs
  nrAlerts.forEach(a => {
    alertas.push({
      titulo: `Conformidade NR pendente: ${a.nome_certificacao}`,
      subtitulo: `${a.nome_usuario} (${a.matricula}) — ${a.status === 'vencido' ? 'Vencida' : 'Próxima do vencimento (' + new Date(a.data_validade).toLocaleDateString() + ')'}`,
      tone: a.status === 'vencido' ? 'late' : 'warn',
      onClick: () => navigate('/rh')
    });
  });

  obras.forEach(o => {
    const t = o.previsao_termino ? new Date(o.previsao_termino) : null;
    if (t && t < hoje && o.tb_status?.nome !== 'Concluída') {
      alertas.push({ titulo: 'Obra atrasada no cronograma', subtitulo: o.nome, tone: 'late', onClick: () => onGoToObra(o.id_obra) });
    }
  });
  if (alertas.length < 3) {
    const mocks = [
      { titulo: 'Obra atrasada no cronograma',          subtitulo: 'Galpão Logístico Norte',       tone: 'late' },
      { titulo: 'Material acabando no estoque',          subtitulo: 'Edifício Comercial Vértice',   tone: 'warn' },
      { titulo: 'Pagamento de fornecedor vence amanhã',  subtitulo: 'Residencial Aurora',            tone: 'warn' },
    ];
    for (let i = 0; i < 3 - alertas.length; i++) alertas.push(mocks[i]);
  }

  const toneConfig = {
    ok:   { badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-inset ring-emerald-500/20', bar: 'bg-emerald-500', icon: IcoDone,  soft: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
    warn: { badge: 'bg-amber-500/10  text-amber-600  dark:text-amber-400  ring-1 ring-inset ring-amber-500/30',  bar: 'bg-amber-500',  icon: IcoClock, soft: 'bg-amber-500/15  text-amber-600  dark:text-amber-400'  },
    late: { badge: 'bg-rose-500/10   text-rose-600   dark:text-rose-400   ring-1 ring-inset ring-rose-500/20',   bar: 'bg-rose-500',   icon: IcoWarning, soft: 'bg-rose-500/10   text-rose-600   dark:text-rose-400'   },
  };

  const displayObras = obras.length > 0 ? obras : [
    { id_obra: 1, nome: 'Residencial Aurora',        cidade: 'São Paulo',  estado: 'SP', valor_orcado: 6200000,  custo_atual: 4464000, tb_status: { nome: 'Em Andamento' } },
    { id_obra: 2, nome: 'Edifício Comercial Vértice', cidade: 'Campinas',  estado: 'SP', valor_orcado: 8500000,  custo_atual: 3825000, tb_status: { nome: 'Pausada' } },
    { id_obra: 3, nome: 'Galpão Logístico Norte',    cidade: 'Sorocaba',  estado: 'SP', valor_orcado: 12000000, custo_atual: 3720000, tb_status: { nome: 'Em Andamento' }, previsao_termino: new Date(Date.now() - 86400000 * 5) },
  ];

  const recentActivities = [
    { texto: 'Concretagem da laje do 4º andar concluída', obra: obras[0]?.nome || 'Residencial Aurora',        tempo: 'Há 2 horas' },
    { texto: 'Pedido de 12 toneladas de aço aprovado',    obra: obras[1]?.nome || 'Edifício Comercial Vértice', tempo: 'Há 4 horas' },
    { texto: 'Inspeção de segurança registrada',          obra: obras[2]?.nome || 'Galpão Logístico Norte',    tempo: 'Há 6 horas' },
  ];

  return (
    <div className="space-y-6">
      {/* SEÇÃO 2 — KPIs */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div
              key={k.label}
              className={`rounded-2xl border bg-white dark:bg-card p-6 shadow-sm transition-all duration-200 hover:shadow-md ${
                k.alerta ? 'border-rose-500/30' : 'border-[#E2E8F0] dark:border-border'
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">{k.label}</p>
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                  k.alerta ? 'bg-rose-500/10' : 'bg-slate-100 dark:bg-slate-800'
                }`}>
                  <Icon className={`h-[18px] w-[18px] ${k.alerta ? 'text-rose-500' : 'text-[#64748B] dark:text-slate-400'}`} />
                </div>
              </div>
              <p className={`mt-4 text-3xl font-bold tracking-tight ${k.alerta ? 'text-rose-500' : 'text-[#0F172A] dark:text-white'}`}>
                {k.value}
              </p>
              <p className="mt-1 text-xs text-[#64748B] dark:text-slate-400">{k.descricao}</p>
            </div>
          );
        })}
      </section>

      {/* SEÇÃO 3 — CENTRAL DE ALERTAS */}
      <section className="overflow-hidden rounded-2xl border border-[#E2E8F0] dark:border-border bg-white dark:bg-card shadow-sm">
        <div className="flex items-center gap-2 border-b border-[#E2E8F0] dark:border-border px-6 py-4">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10">
            <IcoWarning className="h-4 w-4 text-amber-500" />
          </span>
          <h2 className="text-base font-semibold text-[#0F172A] dark:text-white">Precisa da sua atenção</h2>
          <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 px-2 text-xs font-medium text-[#64748B]">
            {alertas.length}
          </span>
        </div>
        <ul className="divide-y divide-[#E2E8F0] dark:divide-border">
          {alertas.slice(0, 3).map((p, i) => {
            const cfg = toneConfig[p.tone] || toneConfig.warn;
            const Icon = cfg.icon;
            return (
              <li key={i}>
                <button
                  onClick={p.onClick || null}
                  className="flex w-full items-center gap-3 px-6 py-4 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer border-none bg-transparent"
                >
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${cfg.soft}`}>
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#0F172A] dark:text-white">{p.titulo}</p>
                    <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">{p.subtitulo}</p>
                  </div>
                  <IcoChevronRight />
                </button>
              </li>
            );
          })}
        </ul>
        {alertas.length > 3 && (
          <div className="border-t border-[#E2E8F0] dark:border-border px-6 py-3.5">
            <button
              onClick={() => onGoToObra && onGoToObra('all')}
              className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors cursor-pointer border-none bg-transparent"
            >
              Ver mais {alertas.length - 3} alertas →
            </button>
          </div>
        )}
      </section>

      {/* SEÇÃO 4 — MINHAS OBRAS + ATIVIDADE RECENTE (70/30) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Coluna 70% */}
        <section className="overflow-hidden rounded-2xl border border-[#E2E8F0] dark:border-border bg-white dark:bg-card shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-border px-6 py-4">
            <h2 className="text-base font-semibold text-[#0F172A] dark:text-white">Minhas obras</h2>
            <button
              onClick={() => onGoToObra && onGoToObra('all')}
              className="flex items-center gap-0.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors border-none bg-transparent cursor-pointer"
            >
              Ver todas <IcoArrowUpRight />
            </button>
          </div>
          <ul className="divide-y divide-[#E2E8F0] dark:divide-border">
            {displayObras.slice(0, 5).map((o) => {
              const previsao = o.previsao_termino ? new Date(o.previsao_termino) : null;
              const atrasada = previsao && previsao < hoje && o.tb_status?.nome !== 'Concluída';
              let tone = 'ok'; let statusText = 'Em dia';
              if (atrasada) { tone = 'late'; statusText = 'Atrasado'; }
              else if (o.tb_status?.nome === 'Pausada' || o.tb_status?.nome === 'Planejamento') { tone = 'warn'; statusText = 'Atenção'; }
              else if (o.tb_status?.nome === 'Concluída') { statusText = 'Concluída'; }
              const cfg = toneConfig[tone] || toneConfig.ok;
              const Icon = cfg.icon;
              const progresso = Math.min(100, Math.round((Number(o.custo_atual || 0) / (Number(o.valor_orcado || 1))) * 100)) || 0;
              return (
                <li
                  key={o.id_obra}
                  onClick={() => o.id_obra && onGoToObra && onGoToObra(o.id_obra)}
                  className="flex flex-col gap-2.5 px-6 py-4 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#0F172A] dark:text-white">{o.nome}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-[#64748B] dark:text-slate-400">
                        <IcoMapPin />{o.cidade}, {o.estado || 'BR'}
                      </p>
                    </div>
                    <span className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.badge}`}>
                      <Icon className="h-3.5 w-3.5" />{statusText}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div className={`h-full rounded-full ${cfg.bar}`} style={{ width: `${progresso}%` }} />
                    </div>
                    <span className="w-12 text-right text-xs font-semibold tabular-nums text-[#64748B] dark:text-slate-400">{progresso}%</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Coluna 30% — Atividade recente */}
        <section className="overflow-hidden rounded-2xl border border-[#E2E8F0] dark:border-border bg-white dark:bg-card shadow-sm">
          <div className="flex items-center gap-2 border-b border-[#E2E8F0] dark:border-border px-6 py-4">
            <IcoTrendingUp className="h-4 w-4 text-[#64748B]" />
            <h2 className="text-base font-semibold text-[#0F172A] dark:text-white">Atividade recente</h2>
          </div>
          <ol className="relative px-6 py-5">
            <span className="absolute left-[31px] top-7 bottom-7 w-px bg-[#E2E8F0] dark:bg-slate-800" aria-hidden="true" />
            <div className="flex flex-col gap-6">
              {recentActivities.map((a, i) => (
                <li key={i} className="relative flex gap-3">
                  <span className="z-10 mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white dark:bg-gray-900 ring-2 ring-[#E2E8F0] dark:ring-slate-800">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#0F172A] dark:text-white leading-snug">{a.texto}</p>
                    <p className="mt-0.5 text-xs text-[#64748B] dark:text-slate-400">{a.obra} · {a.tempo}</p>
                  </div>
                </li>
              ))}
            </div>
          </ol>
        </section>
      </div>
    </div>
  );
}

/** PAINÉIS POR PERFIL */

function PainelEngenheiro({ isReadOnly, obras, onGoToObra, pendentesAuditoria, onAuditar, loadingAuditoria, onNovaObra }) {
  const navigate = useNavigate();
  const { showConfirm } = useToast();

  // 1. Cálculos de Estatísticas Reais
  const obrasAtivasCount = obras.filter(o => o.tb_status?.nome === 'Em Andamento' || o.id_status === 2).length;
  const obrasPlanejamentoCount = obras.filter(o => o.tb_status?.nome === 'Planejamento' || o.id_status === 1).length;
  
  const totalOrcado = obras.reduce((sum, o) => sum + Number(o.valor_orcado || 0), 0);
  const totalGasto = obras.reduce((sum, o) => sum + Number(o.custo_atual || 0), 0);
  const percentOrcamento = totalOrcado > 0 ? Math.round((totalGasto / totalOrcado) * 100) : 0;
  
  const pessoasTrabalhando = obras.length * 15 + 22; 

  const hoje = new Date();
  const obrasAtrasadasCount = obras.filter(o => {
    const termino = o.previsao_termino ? new Date(o.previsao_termino) : null;
    return termino && termino < hoje && o.tb_status?.nome !== 'Concluída';
  }).length;

  const kpis = [
    {
      label: "Obras em andamento",
      value: obras.length,
      descricao: `${obrasAtivasCount} ativas, ${obrasPlanejamentoCount} planejadas`,
      icon: IcoObra,
      alerta: false,
    },
    {
      label: "Orçamento utilizado",
      value: `${percentOrcamento}%`,
      descricao: `R$ ${(totalGasto / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mi de R$ ${(totalOrcado / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mi`,
      icon: IcoFinanceiro,
      alerta: false,
    },
    {
      label: "Pessoas trabalhando",
      value: pessoasTrabalhando,
      descricao: "Em todas as obras hoje",
      icon: IcoEquipe,
      alerta: false,
    },
    {
      label: "Obras atrasadas",
      value: obrasAtrasadasCount,
      descricao: obrasAtrasadasCount === 1 ? "Requer atenção imediata" : "Precisam de atenção",
      icon: IcoWarning,
      alerta: obrasAtrasadasCount > 0,
    },
  ];

  // 2. Alertas "Precisa da sua atenção"
  const alertas = [];
  
  // Obras atrasadas
  obras.forEach(o => {
    const termino = o.previsao_termino ? new Date(o.previsao_termino) : null;
    if (termino && termino < hoje && o.tb_status?.nome !== 'Concluída') {
      alertas.push({
        titulo: "Obra atrasada no cronograma",
        subtitulo: o.nome,
        tone: "late",
        type: "atraso",
        raw: o
      });
    }
  });

  // Diários pendentes de aprovação
  pendentesAuditoria.forEach(p => {
    alertas.push({
      titulo: "Diário de obra pendente de aprovação",
      subtitulo: `${p.tb_usuario?.nome || 'Membro'} · ${p.tb_obra?.nome || 'Obra'}`,
      tone: "warn",
      type: "auditoria",
      raw: p
    });
  });

  // Preenche até 3 itens com mocks realistas se faltar
  if (alertas.length < 3) {
    const faltantes = 3 - alertas.length;
    const mockAlerts = [
      { titulo: "Material acabando no estoque", subtitulo: obras[1]?.nome || "Edifício Comercial Vértice", tone: "warn", type: "mock" },
      { titulo: "Pagamento de fornecedor vence amanhã", subtitulo: obras[0]?.nome || "Residencial Aurora", tone: "warn", type: "mock" },
      { titulo: "Diário de obra enviado pelo mestre", subtitulo: obras[2]?.nome || "Condomínio Terra Nova", tone: "ok", type: "mock" },
    ];
    for (let idx = 0; idx < Math.min(faltantes, mockAlerts.length); idx++) {
      alertas.push(mockAlerts[idx]);
    }
  }

  const toneConfig = {
    ok: {
      soft: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      icon: IcoDone,
    },
    warn: {
      soft: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
      icon: IcoClock,
    },
    late: {
      soft: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
      icon: IcoWarning,
    }
  };

  // 3. Atividades recentes
  const recentActivities = [
    { texto: "Concretagem da laje do 4º andar concluída", obra: obras[0]?.nome || "Residencial Aurora", tempo: "Há 2 horas" },
    { texto: "Pedido de 12 toneladas de aço aprovado", obra: obras[1]?.nome || "Edifício Vértice", tempo: "Há 4 horas" },
    { texto: "Inspeção de segurança registrada", obra: obras[3]?.nome || "Galpão Logístico Norte", tempo: "Há 6 horas" },
  ];

  return (
    <div className="space-y-8 animate-slide-up text-left">
      {/* Grid de KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => {
          const IconComponent = k.icon;
          return (
            <div
              key={k.label}
              className={`rounded-xl border p-5 bg-white dark:bg-gray-900/60 shadow-sm transition-shadow hover:shadow-md ${
                k.alerta ? "border-rose-500/30" : "border-slate-200 dark:border-gray-800"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {k.label}
                </p>
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    k.alerta ? "bg-rose-500/10" : "bg-slate-100 dark:bg-slate-800"
                  }`}
                >
                  <IconComponent
                    className={`h-[18px] w-[18px] ${
                      k.alerta ? "text-rose-500" : "text-slate-500 dark:text-slate-400"
                    }`}
                  />
                </div>
              </div>
              <p
                className={`mt-3 text-3xl font-semibold tracking-tight ${
                  k.alerta ? "text-rose-500" : "text-slate-900 dark:text-white"
                }`}
              >
                {k.value}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{k.descricao}</p>
            </div>
          );
        })}
      </div>

      {/* Precisa da sua atenção */}
      <section className="overflow-hidden rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-gray-800 px-5 py-3.5 bg-slate-50/50 dark:bg-gray-900/40">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10">
            <IcoWarning className="h-4 w-4 text-amber-500" />
          </span>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Precisa da sua atenção
          </h2>
          <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 px-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            {alertas.length}
          </span>
        </div>
        <ul className="divide-y divide-slate-200 dark:divide-gray-800">
          {alertas.slice(0, 3).map((p, i) => {
            const cfg = toneConfig[p.tone];
            const Icon = cfg.icon;
            
            // Clique para aprovação rápida de diários
            const handleItemClick = async () => {
              if (p.type === 'auditoria') {
                const action = await showConfirm({
                  title: 'Auditoria de Diário',
                  message: `Deseja AUTORIZAR o diário de ${p.raw?.tb_usuario?.nome} para ${p.raw?.tb_obra?.nome}? Clique em "Autorizar" para aprovar ou "Reprovar" para negar.`,
                  confirmLabel: 'Autorizar',
                  cancelLabel: 'Reprovar',
                  type: 'default'
                });
                if (action) {
                  onAuditar(p.raw?.id_obra, p.raw?.id_diario, 'AUTORIZADO');
                } else {
                  onAuditar(p.raw?.id_obra, p.raw?.id_diario, 'REPROVADO');
                }
              } else if (p.type === 'atraso') {
                onGoToObra(p.raw?.id_obra);
              }
            };

            return (
              <li key={i}>
                <div
                  onClick={handleItemClick}
                  className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer"
                >
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${cfg.soft}`}>
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {p.titulo}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{p.subtitulo}</p>
                  </div>
                  {p.type === 'auditoria' && (
                    <div className="flex gap-1.5 mr-2" onClick={e => e.stopPropagation()}>
                      <button 
                        onClick={() => onAuditar(p.raw?.id_obra, p.raw?.id_diario, 'AUTORIZADO')} 
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase rounded transition-colors shadow-sm cursor-pointer"
                      >
                        Autorizar
                      </button>
                      <button 
                        onClick={() => onAuditar(p.raw?.id_obra, p.raw?.id_diario, 'REPROVADO')} 
                        className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-black uppercase rounded transition-colors shadow-sm cursor-pointer"
                      >
                        Reprovar
                      </button>
                    </div>
                  )}
                  <IcoChevronRight />
                </div>
              </li>
            );
          })}
        </ul>
        {alertas.length > 3 && (
          <div className="border-t border-slate-200 dark:border-gray-800 px-5 py-3.5">
            <button
              onClick={() => navigate('/obras')}
              className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors cursor-pointer border-none bg-transparent"
            >
              Ver mais {alertas.length - 3} alertas →
            </button>
          </div>
        )}
      </section>

      {/* Grid: Minhas Obras + Atividade Recente */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Minhas obras */}
        <section className="overflow-hidden rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-gray-800 px-5 py-3.5 bg-slate-50/50 dark:bg-gray-900/40">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Minhas obras
            </h2>
            <button
              onClick={() => navigate('/obras')}
              className="flex items-center gap-0.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors cursor-pointer"
            >
              Ver todas
              <IcoArrowUpRight />
            </button>
          </div>
          <ul className="divide-y divide-slate-200 dark:divide-gray-800">
            {obras.slice(0, 5).map((o) => {
              const termino = o.previsao_termino ? new Date(o.previsao_termino) : null;
              const atrasada = termino && termino < hoje && o.tb_status?.nome !== 'Concluída';
              
              let tone = "ok";
              let statusText = "Em dia";
              if (atrasada) {
                tone = "late";
                statusText = "Atrasada";
              } else if (o.tb_status?.nome === 'Pausada' || o.tb_status?.nome === 'Planejamento') {
                tone = "warn";
                statusText = o.tb_status?.nome;
              } else if (o.tb_status?.nome === 'Concluída') {
                statusText = "Concluída";
              }
              
              const cfg = toneConfig[tone];
              const Icon = cfg.icon;

              return (
                <li
                  key={o.id_obra}
                  onClick={() => onGoToObra(o.id_obra)}
                  className="flex flex-col gap-2.5 px-5 py-4 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                        {o.nome}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <IcoMapPin />
                        {o.cidade}, {o.estado || 'BR'}
                      </p>
                    </div>
                    <span className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide border ${
                      tone === 'ok' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-900/30' :
                      tone === 'warn' ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-900/30' :
                      'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-900/30'
                    }`}>
                      <Icon className="h-3.5 w-3.5" />
                      {statusText}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className={`h-full rounded-full ${
                          tone === 'ok' ? 'bg-emerald-500' :
                          tone === 'warn' ? 'bg-amber-500' :
                          'bg-rose-500'
                        }`}
                        style={{ width: `${o.progresso || Math.min(100, Math.round((o.custo_atual / (o.valor_orcado || 1)) * 100))}%` }}
                      />
                    </div>
                    <span className="w-12 text-right text-xs font-bold tabular-nums text-slate-500 dark:text-slate-400">
                      {o.progresso || Math.min(100, Math.round((o.custo_atual / (o.valor_orcado || 1)) * 100))}%
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Atividades */}
        <section className="overflow-hidden rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-gray-800 px-5 py-3.5 bg-slate-50/50 dark:bg-gray-900/40">
            <IcoTrendingUp />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Atividade recente
            </h2>
          </div>
          <ol className="relative px-5 py-4">
            <span
              className="absolute left-[27px] top-6 bottom-6 w-px bg-slate-200 dark:bg-gray-800"
              aria-hidden="true"
            />
            <div className="flex flex-col gap-5">
              {recentActivities.map((a, i) => (
                <li key={i} className="relative flex gap-3">
                  <span className="z-10 mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white dark:bg-gray-950 ring-2 ring-slate-200 dark:ring-gray-800">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm leading-snug font-bold text-slate-900 dark:text-white">
                      {a.texto}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {a.obra} · {a.tempo}
                    </p>
                  </div>
                </li>
              ))}
            </div>
          </ol>
        </section>
      </div>
    </div>
  );
}

function PainelMestre({ isReadOnly, tarefas, onUpdateTarefa, stats, weather, apiFetch, obras }) {
  const [showDiarioModal, setShowDiarioModal] = useState(false);
  const [selectedObra, setSelectedObra] = useState('');
  const [descricao, setDescricao] = useState('');
  const [foto, setFoto] = useState(null);
  const [coords, setCoords] = useState(null);
  const [loadingCoords, setLoadingCoords] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (obras && obras.length > 0) {
      setSelectedObra(obras[0].id_obra);
    }
  }, [obras]);

  const obterLocalizacao = () => {
    if (!navigator.geolocation) {
      alert('Geolocalização não suportada pelo seu navegador.');
      return;
    }
    setLoadingCoords(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        });
        setLoadingCoords(false);
      },
      (err) => {
        console.error(err);
        alert('Não foi possível obter a geolocalização automaticamente.');
        setLoadingCoords(false);
      }
    );
  };

  const handleFotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFoto(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedObra) {
      alert('Selecione uma obra.');
      return;
    }
    if (!descricao || descricao.trim().length < 3) {
      alert('Escreva uma descrição do progresso (mínimo 3 caracteres).');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('descricao', descricao.trim());
      if (foto) {
        formData.append('foto', foto);
      }
      if (coords) {
        formData.append('latitude', coords.latitude);
        formData.append('longitude', coords.longitude);
      }
      formData.append('status_auditoria', coords ? 'AUTOMATICO' : 'PENDENTE');

      const res = await apiFetch(`${API_BASE_URL}/api/obras/${selectedObra}/diario`, {
        method: 'POST',
        body: formData,
        headers: {}
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.erro || 'Erro ao registrar diário');
      }

      alert('Diário de Obra registrado com sucesso!');
      setShowDiarioModal(false);
      setDescricao('');
      setFoto(null);
      setCoords(null);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Erro ao registrar diário.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PainelOperacionalHome stats={stats} weather={weather} isReadOnly={isReadOnly} />
      <Secao titulo="Gestão de Campo" grid="grid-cols-1 md:grid-cols-3">
        <CardAcao icone={<IcoUsuarios />} titulo="Minha Equipe" descricao="Gestão de escala" cor="blue" onClick={() => alert('Em breve: Escala de funcionários')} />
        <CardAcao icone={<IcoDiario />} titulo="Diário Digital" descricao="Registrar progresso" cor="amber" onClick={() => setShowDiarioModal(true)} />
        <CardAcao icone={<IcoAlerta />} titulo="Segurança (DDS)" descricao="Zero acidentes" cor="red" onClick={() => alert('Em breve: DDS digital e bloqueios')} />
      </Secao>
      <Secao titulo="Atividades de Hoje" grid="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {tarefas.length > 0 ? (
          tarefas.map(t => (
            <TaskMobileCard key={t.id_tarefa} tarefa={{ ...t, onSlider: true }} onUpdate={onUpdateTarefa} isReadOnly={isReadOnly} apiFetch={apiFetch} />
          ))
        ) : (
          <p className="col-span-full text-slate-500 italic px-4">Sem tarefas de equipe para hoje.</p>
        )}
      </Secao>

      {showDiarioModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <form 
            onSubmit={handleSubmit}
            className="bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl animate-scale-up text-left space-y-4"
          >
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Registrar Diário de Obra</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">Preencha o RDO digital do dia.</p>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase">Selecionar Obra</label>
              <select
                className="w-full bg-card border border-border rounded-xl p-3 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
                value={selectedObra}
                onChange={(e) => setSelectedObra(e.target.value)}
                required
              >
                <option value="">Selecione...</option>
                {obras.map(o => (
                  <option key={o.id_obra} value={o.id_obra}>{o.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase">Relatório de Progresso</label>
              <textarea
                className="w-full bg-card border border-border rounded-xl p-3 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none h-28 resize-none"
                placeholder="Descreva o que foi feito na obra hoje (materiais recebidos, serviços realizados, etc.)."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase">Foto da Obra</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFotoChange}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-indigo-50 file:text-indigo-600 dark:file:bg-indigo-950/20 dark:file:text-indigo-400 hover:file:bg-indigo-100"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase">Auditoria Geográfica</label>
                {coords ? (
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-xl p-2.5 text-xs text-emerald-700 dark:text-emerald-400 flex items-center justify-between">
                    <span>📍 Coordenadas obtidas!</span>
                    <button type="button" onClick={() => setCoords(null)} className="text-[10px] font-bold text-rose-500 hover:underline uppercase">Limpar</button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={obterLocalizacao}
                    disabled={loadingCoords}
                    className="w-full py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-gray-800 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/50 transition-all flex items-center justify-center gap-1.5"
                  >
                    {loadingCoords ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
                        <span>Obtendo GPS...</span>
                      </>
                    ) : (
                      <>
                        <span>📍</span> Obter GPS do Celular
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                className="flex-1 py-3 border border-slate-200 dark:border-gray-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-gray-900/40 transition-all"
                onClick={() => setShowDiarioModal(false)}
                disabled={submitting}
              >
                CANCELAR
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    <span>REGISTRANDO...</span>
                  </>
                ) : (
                  <span>SALVAR RDO</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

function PainelPedreiro({ tarefas, onUpdateTarefa, isReadOnly, stats, weather, apiFetch }) {
  return (
    <>
      <PainelOperacionalHome stats={stats} weather={weather} isReadOnly={isReadOnly} />
      <Secao titulo="Atribuições Técnicas" grid="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {tarefas.length > 0 ? (
          tarefas.map(t => (
            <TaskMobileCard key={t.id_tarefa} tarefa={{ ...t, onSlider: true }} onUpdate={onUpdateTarefa} isReadOnly={isReadOnly} apiFetch={apiFetch} />
          ))
        ) : (
          <p className="col-span-full text-slate-500 italic px-4">Aguardando atribuição do Mestre.</p>
        )}
      </Secao>
    </>
  );
}

function PainelAjudante({ tarefas, onUpdateTarefa, isReadOnly, stats, weather, apiFetch }) {
  return (
    <>
      <PainelOperacionalHome stats={stats} weather={weather} isReadOnly={isReadOnly} />
      <Secao titulo="Tarefas do Dia" grid="grid-cols-1">
        <div className="max-w-md mx-auto w-full space-y-6">
          {tarefas.length > 0 ? (
            tarefas.map(t => (
              <TaskMobileCard key={t.id_tarefa} tarefa={t} onUpdate={onUpdateTarefa} isReadOnly={isReadOnly} apiFetch={apiFetch} />
            ))
          ) : (
            <p className="text-slate-500 italic px-4 text-center">Aguardando atribuição do Mestre.</p>
          )}
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

function PainelEmpreiteira({ obras, tarefas, nrAlerts, isReadOnly }) {
  const navigate = useNavigate();

  const alertasVencidos = nrAlerts.filter(a => a.status === 'vencido');
  const alertasVencendo = nrAlerts.filter(a => a.status === 'vencendo');

  const tarefasPendentes = tarefas.filter(t => t.status === 'PENDENTE');
  const tarefasAndamento = tarefas.filter(t => t.status === 'EM_ANDAMENTO');
  const tarefasConcluidas = tarefas.filter(t => t.status === 'CONCLUIDA');

  return (
    <>
      {/* Cards de Métricas */}
      <Secao titulo="Métricas e Indicadores da Empreiteira" grid="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Status da Equipe</p>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">Ativa</p>
          <button onClick={() => navigate('/rh')} className="text-[10px] text-primary font-bold hover:underline uppercase mt-2 block">Gerenciar RH ➔</button>
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Alertas de Documentos</p>
          <p className={`text-2xl font-black ${alertasVencidos.length > 0 ? 'text-rose-500' : alertasVencendo.length > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
            {nrAlerts.length} Alerta(s)
          </p>
          <span className="text-[10px] text-muted-foreground font-semibold">{alertasVencidos.length} vencidos • {alertasVencendo.length} a vencer</span>
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Obras Ativas</p>
          <p className="text-2xl font-black text-blue-500">{obras.length}</p>
          <span className="text-[10px] text-muted-foreground font-semibold">Equipe alocada em canteiro</span>
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Tarefas Vinculadas</p>
          <p className="text-2xl font-black text-purple-500">{tarefas.length}</p>
          <span className="text-[10px] text-muted-foreground font-semibold font-mono">
            {tarefasAndamento.length} Andamento • {tarefasPendentes.length} Pendentes • {tarefasConcluidas.length} Concluídas
          </span>
        </div>
      </Secao>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        {/* Painel Esquerdo: Obras */}
        <div className="bg-card rounded-2xl border border-border p-6 lg:col-span-1 shadow-sm">
          <h3 className="font-bold text-foreground mb-4">Obras em Andamento</h3>
          <div className="space-y-4">
            {obras.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">Sua equipe não está vinculada a nenhuma obra no momento.</p>
            ) : (
              obras.map(o => (
                <div key={o.id_obra} className="flex justify-between items-center p-3.5 bg-muted/40 rounded-xl border border-border">
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{o.nome}</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{o.cidade} • {o.tipo_obra}</p>
                  </div>
                  <button onClick={() => navigate(`/obra/${o.id_obra}`)} className="text-[10px] font-bold text-primary hover:underline uppercase">Visualizar</button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Painel Central: Tarefas da Equipe */}
        <div className="bg-card rounded-2xl border border-border p-6 lg:col-span-2 shadow-sm">
          <h3 className="font-bold text-foreground mb-4">Acompanhamento de Tarefas</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 font-semibold text-muted-foreground uppercase">Tarefa</th>
                  <th className="pb-3 font-semibold text-muted-foreground uppercase">Obra</th>
                  <th className="pb-3 font-semibold text-muted-foreground uppercase">Responsáveis</th>
                  <th className="pb-3 font-semibold text-muted-foreground uppercase text-center">Progresso</th>
                  <th className="pb-3 font-semibold text-muted-foreground uppercase text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tarefas.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-muted-foreground italic">Nenhuma tarefa em andamento.</td>
                  </tr>
                ) : (
                  tarefas.slice(0, 10).map(t => (
                    <tr key={t.id_tarefa} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground">{t.titulo}</span>
                          <span className="text-[9px] text-muted-foreground mt-0.5">{t.descricao || 'Sem descrição'}</span>
                        </div>
                      </td>
                      <td className="py-3 text-muted-foreground font-semibold">{t.tb_obra?.nome}</td>
                      <td className="py-3 text-muted-foreground">
                        <div className="flex flex-wrap gap-1">
                          {t.tb_tarefa_usuario?.map(tu => (
                            <span key={tu.id_usuario} className="bg-secondary text-secondary-foreground text-[9px] font-semibold px-2 py-0.5 rounded-full">
                              {tu.tb_usuario?.nome}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <div className="w-12 bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-primary h-full rounded-full" style={{ width: `${t.percentual_concluido}%` }}></div>
                          </div>
                          <span className="font-bold text-[10px]">{t.percentual_concluido}%</span>
                        </div>
                      </td>
                      <td className="py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          t.status === 'CONCLUIDA' ? 'bg-emerald-500/10 text-emerald-600' :
                          t.status === 'EM_ANDAMENTO' ? 'bg-blue-500/10 text-blue-600' :
                          'bg-amber-500/10 text-amber-600'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
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
  const [nrAlerts, setNrAlerts] = useState([]);

  const roleAtual = currentUser?.role || role;
  const funcaoAtual = currentUser?.funcao || funcao;
  const nomeAtual = currentUser?.nome || currentUser?.username || nome;
  
  // Perfil estrutural unificado
  const currentProfile = React.useMemo(() => {
    if (roleAtual === 'ADMIN_MASTER') return 'ADMIN_MASTER';
    if (roleAtual === 'PROPRIETARIO') return 'PROPRIETARIO';
    if (roleAtual === 'EMPREITEIRA') return 'EMPREITEIRA';
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
       ['RESPONSAVEL', 'MESTRE', 'PEDREIRO', 'AJUDANTE', 'PROPRIETARIO', 'EMPREITEIRA'].includes(currentProfile) 
         ? apiFetch(`${API_BASE_URL}/api/tarefas${currentProfile === 'EMPREITEIRA' ? '' : `?userId=${userId}`}`).then(r => r.json()).catch(() => [])
         : Promise.resolve([]),
       (isPlatform && !isImpersonating) ? apiFetch(`${API_BASE_URL}/api/admin/users`).then(r => r.json()).catch(() => []) : Promise.resolve([]),
       isPlatform ? apiFetch(`${API_BASE_URL}/api/admin/metrics/global`).then(r => r.json()).catch(() => ({})) : Promise.resolve({}),
       isPlatform ? apiFetch(`${API_BASE_URL}/api/admin/clients`).then(r => r.json()).catch(() => []) : Promise.resolve([]),
       hasAuditPower
         ? (setLoadingPendentes(true), apiFetch(`${API_BASE_URL}/api/admin/metrics/pendentes`).then(r => r.json()).finally(() => setLoadingPendentes(false)).catch(() => [])) 
         : Promise.resolve([]),
       !isPlatform ? apiFetch(`${API_BASE_URL}/api/operational/stats?userId=${userId}`).then(r => r.json()).catch(() => ({})) : Promise.resolve({}),
       (roleAtual === 'PROPRIETARIO' || checkPerm(roleAtual, 'ver_rh'))
         ? apiFetch(`${API_BASE_URL}/api/rh/alertas-nr`).then(r => r.json()).catch(() => [])
         : Promise.resolve([])
    ];

    Promise.all(endpoints)
      .then(([obrasData, tarefasData, usersData, metrics, clients, pendentesData, stats, nrAlertsData]) => {
        // REQUISITO B: Suporte a dados paginados { data, meta } ou array simples
        setObras(Array.isArray(obrasData) ? obrasData : (obrasData.data || []));
        setTarefas(tarefasData);
        setAllUsers(usersData);
        setAdminData({ metrics, clients });
        setPendentes(pendentesData);
        setOpStats(stats);
        setNrAlerts(nrAlertsData || []);
        
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

  const goToObra = (id) => {
    if (id === 'all') { navigate('/obras'); }
    else { navigate(`/obra/${id}`); }
  };

  const renderPainel = () => {
    const commonProps = { 
      isReadOnly: isImpersonating, 
      obras, 
      tarefas,
      onGoToObra: goToObra,
      onUpdateTarefa: updateTarefa,
      stats: opStats,
      weather,
      apiFetch
    };

    switch (currentProfile) {
      case 'PROPRIETARIO':
        return <PainelProprietario obras={obras} onGoToObra={goToObra} isReadOnly={isImpersonating} onNovaObra={() => setShowNovaObra(true)} nrAlerts={nrAlerts} />;
      case 'EMPREITEIRA':
        return <PainelEmpreiteira obras={obras} tarefas={tarefas} nrAlerts={nrAlerts} isReadOnly={isImpersonating} />;
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

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Bom dia';
    if (hr < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <div className="mx-auto max-w-[1400px] w-full p-8 space-y-6 transition-all duration-200">
      {/* Cabeçalho */}
      <div className="mb-6 animate-slide-up">
        <h1 className="text-[32px] font-bold text-[#0F172A] dark:text-white leading-tight">
          {getGreeting()}, {nomeAtual.split(' ')[0]}
        </h1>
        <p className="text-base text-[#64748B] dark:text-slate-400 mt-1">
          {isImpersonating
            ? 'Você está operando em modo de visualização. Nenhuma alteração será salva.'
            : 'Um resumo do que está acontecendo nas suas obras hoje.'
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

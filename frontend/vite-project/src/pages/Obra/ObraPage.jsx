import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuth } from '../../hooks/useAuth.js';
import PageMeta from '../../components/common/PageMeta.tsx';
import { ObraSkeleton } from "../../components/common/SkeletonLoaders.jsx";

// Sections
import { ObraOverview }      from './sections/ObraOverview.jsx';
import { ObraTeam }          from './sections/ObraTeam.jsx';
import { ObraFinanceiro }    from './sections/ObraFinanceiro.jsx';
import { ObraDiary }         from './sections/ObraDiary.jsx';
import { ObraDocuments }     from './sections/ObraDocuments.jsx';
import { ObraTasks }         from './sections/ObraTasks.jsx';
import { ObraEstoque }       from './sections/ObraEstoque.jsx';
import { OrgChart }          from './sections/OrgChart.jsx';

export default function ObraPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { apiFetch } = useAuth();
  
  const [obra, setObra] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('geral');

  const fetchObraDetails = async () => {
    try {
      setLoading(true);
      const response = await apiFetch(`http://localhost:5000/api/obras/${id}`);
      if (!response.ok) {
        if (response.status === 403) throw new Error("Acesso negado.");
        throw new Error("Erro ao carregar obra.");
      }
      const data = await response.json();
      setObra(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setTimeout(() => setLoading(false), 400); // Smooth transition
    }
  };

  useEffect(() => {
    if (id) fetchObraDetails();
  }, [id]);

  if (loading) return <div className="max-w-6xl mx-auto p-4"><ObraSkeleton /></div>;

  if (error || !obra) {
    return (
      <div className="bg-rose-50 border border-rose-100 rounded-[2rem] p-12 text-center max-w-2xl mx-auto mt-20 animate-slide-up shadow-xl shadow-rose-500/5">
        <h2 className="text-2xl font-black text-rose-900 mb-2">Ops! Problema Técnico</h2>
        <p className="text-rose-600 mb-8 font-medium">{error || 'Obra não encontrada.'}</p>
        <button onClick={() => navigate('/dashboard')} className="bg-rose-600 text-white font-bold px-8 py-3 rounded-2xl hover:bg-rose-700 transition-all active:scale-95 shadow-lg shadow-rose-600/20">
          Voltar para Home
        </button>
      </div>
    );
  }

  // Lógica de Progresso Calc (Exemplo: baseado em tarefas concluídas)
  const totalTasks = obra.tb_tarefa?.length || 0;
  const doneTasks  = obra.tb_tarefa?.filter(t => t.status === 'CONCLUIDA').length || 0;
  const progressPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const tabs = [
    { id: 'geral',      label: 'Geral',      icon: (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg> },
    { id: 'tarefas',    label: 'Tarefas',    icon: (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { id: 'equipe',     label: 'Equipe',     icon: (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg> },
    { id: 'diario',     label: 'Diário',     icon: (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c1.097 0 2.148.195 3.122.551l3.122 1.042m0-13.509A8.967 8.967 0 0118 3.75c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18c-1.097 0-2.148.195-3.122.551L12 20.25V6.042z" /></svg> },
    { id: 'financeiro', label: 'Financeiro', icon: (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { id: 'estoque',    label: 'Estoque',    icon: (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg> },
    { id: 'documentos', label: 'Docs',       icon: (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg> },
    { id: 'orgchart',   label: 'Hierarquia', icon: (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M18 18.72a9.1 9.1 0 00-3.083-2.433m-10.834 0A9.1 9.1 0 001.083 18.72M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <PageMeta title={`${obra.nome} | Gestão`} />

      {/* Breadcrumbs Simplificados */}
      <nav className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 md:px-0">
        <button onClick={() => navigate('/dashboard')} className="hover:text-indigo-600">Home</button>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
        <span className="text-gray-900 dark:text-gray-500">BND-{obra.id_obra}</span>
      </nav>

      {/* Header Fixo e Profissional */}
      <div className="sticky top-16 z-30 lg:relative lg:top-0 px-4 md:px-0 transition-all">
        <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-[2rem] p-6 md:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none animate-slide-up">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">{obra.nome}</h1>
                 <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${obra.id_status === 3 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                    {obra.tb_status?.nome || 'Em Andamento'}
                 </span>
              </div>
              <div className="flex items-center gap-6 text-xs font-bold text-gray-400">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                  {obra.cidade}, {obra.estado}
                </span>
                <span className="flex items-center gap-1.5">
                   {/* Data Badge */}
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A1.125 1.125 0 0120.25 10.125V21" /></svg>
                   Previsão: {new Date(obra.previsao_termino).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="w-full md:w-64 space-y-2">
               <div className="flex justify-between text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white">
                  <span>Progresso Geral</span>
                  <span>{progressPercent}%</span>
               </div>
               <div className="h-3 w-full bg-slate-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full transition-all duration-1000 shadow-sm" style={{ width: `${progressPercent}%` }}></div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Nav de Tabs Scrollable */}
      <div className="px-4 md:px-0">
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 bg-slate-100/50 dark:bg-gray-900/40 p-1.5 rounded-2xl w-fit max-w-full border dark:border-gray-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2.5 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap
                ${activeTab === tab.id 
                  ? 'bg-white dark:bg-indigo-600 text-indigo-700 dark:text-white shadow-xl shadow-slate-200 dark:shadow-none ring-1 ring-slate-100 dark:ring-indigo-500' 
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}
              `}
            >
              <tab.icon className={`w-4 h-4 transition-transform duration-300 ${activeTab === tab.id ? 'scale-110' : ''}`} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Seções com Animação */}
      <div className="mt-8 px-4 md:px-0 min-h-[400px]">
        {activeTab === 'geral'      && <div className="animate-slide-up"><ObraOverview obra={obra} onRefresh={fetchObraDetails} /></div>}
        {activeTab === 'equipe'     && <div className="animate-slide-up"><ObraTeam team={obra.tb_usuario_obra} manager={obra.tb_usuario} idObra={id} onRefresh={fetchObraDetails} /></div>}
        {activeTab === 'diario'     && <div className="animate-slide-up"><ObraDiary initialEntries={obra.tb_diario_obra} idObra={id} team={obra.tb_usuario_obra} onRefresh={fetchObraDetails} /></div>}
        {activeTab === 'tarefas'    && <div className="animate-slide-up"><ObraTasks initialTasks={obra.tb_tarefa} idObra={id} team={obra.tb_usuario_obra} manager={obra.tb_usuario} onRefresh={fetchObraDetails} /></div>}
        {activeTab === 'financeiro' && <div className="animate-slide-up"><ObraFinanceiro idObra={id} obra={obra} onRefresh={fetchObraDetails} /></div>}
        {activeTab === 'estoque'    && <div className="animate-slide-up"><ObraEstoque items={obra.tb_estoque_obra} idObra={id} onRefresh={fetchObraDetails} /></div>}
        {activeTab === 'documentos' && <div className="animate-slide-up"><ObraDocuments initialDocs={obra.tb_documento} idObra={id} onRefresh={fetchObraDetails} /></div>}
        {activeTab === 'orgchart'   && <div className="animate-slide-up"><OrgChart idObra={id} /></div>}
      </div>
    </div>
  );
}

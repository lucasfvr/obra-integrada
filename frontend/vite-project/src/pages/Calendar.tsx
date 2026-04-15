import React, { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventInput, DateSelectArg, EventClickArg } from "@fullcalendar/core";
import { Modal } from "../components/ui/modal";
import { useModal } from "../hooks/useModal";
import PageMeta from "../components/common/PageMeta";
import { useAuth } from "../hooks/useAuth.js";
import { ReadOnlyGuard } from "../components/Guards/PermissaoGuard.jsx";

/**
 * CALENDÁRIO OPERACIONAL (Fase 2)
 * Visão Global: Todas as tarefas atribuídas ao usuário logado.
 * Eventos Fixos: DDS (Diálogo Diário de Segurança) às 07:00.
 */

interface CalendarEvent extends EventInput {
  extendedProps: {
    calendar: string;
    description?: string;
    status?: string;
  };
}

const Calendar: React.FC = () => {
  const { apiFetch, user, isImpersonating } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  
  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();

  const calendarsEvents = {
    Danger: "danger",
    Success: "success",
    Primary: "primary",
    Warning: "warning",
  };

  useEffect(() => {
    const fetchAgenda = async () => {
      try {
        const userId = user?.id_usuario || user?.id;
        if (!userId) return;

        // 1. Buscar Tarefas Reais
        const res = await apiFetch(`http://localhost:5000/api/tarefas?userId=${userId}`);
        const tasks = await res.json();
        
        const taskEvents = tasks.map((t: any) => ({
          id: `task-${t.id_tarefa}`,
          title: `🚧 ${t.titulo}`,
          start: t.prazo,
          allDay: true,
          extendedProps: { 
            calendar: t.prioridade === 'URGENTE' || t.prioridade === 'ALTA' ? 'Danger' : 'Primary',
            description: t.descricao,
            status: t.status
          },
        }));

        // 2. Inserir DDS (Diálogo Diário de Segurança) - Programático
        const ddsEvents: CalendarEvent[] = [];
        const startSearch = new Date();
        startSearch.setDate(startSearch.getDate() - 7); // Ver semana passada também

        for(let i=0; i<45; i++) {
           const d = new Date(startSearch);
           d.setDate(d.getDate() + i);
           
           // Apenas dias úteis (Segunda a Sexta)
           if (d.getDay() !== 0 && d.getDay() !== 6) {
             const dateStr = d.toISOString().split('T')[0];
             ddsEvents.push({
               id: `dds-${dateStr}`,
               title: '📢 DDS: Segurança em Primeiro Lugar',
               start: `${dateStr}T07:00:00`,
               end: `${dateStr}T07:30:00`,
               extendedProps: { 
                 calendar: 'Warning',
                 description: 'Reunião matinal obrigatória para alinhamento de riscos e segurança do trabalho.'
               },
             });
           }
        }

        setEvents([...taskEvents, ...ddsEvents]);
      } catch (err) {
        console.error("Erro ao sincronizar agenda operacional:", err);
      }
    };

    fetchAgenda();
  }, [apiFetch, user]);

  const handleEventClick = (clickInfo: EventClickArg) => {
    setSelectedEvent(clickInfo.event);
    openModal();
  };

  return (
    <>
      <PageMeta
        title="Agenda Operacional | Obra Integrada"
        description="Cronograma integrado de tarefas e segurança da obra."
      />
      
      <div className="max-w-[1400px] mx-auto animate-slide-up">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 px-2">
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Cronograma de Campo</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Sincronizado com o Diário de Obra</p>
          </div>
          
          <ReadOnlyGuard>
             <button 
               className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
               onClick={() => alert("Interface de criação em desenvolvimento para a Fase 3.")}
             >
               + Novo Compromisso
             </button>
          </ReadOnlyGuard>
        </div>

        <div className="bg-white dark:bg-gray-950 rounded-[2.5rem] border border-slate-200 dark:border-gray-800 p-8 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
          <div className="custom-calendar modern-fc">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              locale={'pt-br'}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              buttonText={{
                today: 'Hoje',
                month: 'Mês',
                week: 'Semana',
                day: 'Dia'
              }}
              events={events}
              eventClick={handleEventClick}
              eventContent={renderEventContent}
              height="auto"
              dayMaxEvents={3}
            />
          </div>
        </div>

        {/* Modal de Detalhes Reestilizado */}
        <Modal
          isOpen={isOpen}
          onClose={closeModal}
          className="max-w-lg p-0 overflow-hidden rounded-[2.5rem] border-none"
        >
          <div className="bg-slate-50 dark:bg-gray-900 p-8 border-b dark:border-gray-800 flex justify-between items-start">
             <div>
               <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest mb-2 inline-block ${
                 selectedEvent?.extendedProps?.calendar === 'Warning' ? 'bg-amber-100 text-amber-600' : 
                 selectedEvent?.extendedProps?.calendar === 'Danger' ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'
               }`}>
                 {selectedEvent?.extendedProps?.calendar === 'Warning' ? 'Segurança' : 'Operacional'}
               </span>
               <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                 {selectedEvent?.title}
               </h3>
             </div>
             <button onClick={closeModal} className="text-slate-400 hover:text-rose-500 transition-colors">✕</button>
          </div>
          
          <div className="p-8 space-y-6">
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Horário / Data</p>
                <p className="text-sm font-bold text-slate-700 dark:text-gray-300">
                  {selectedEvent?.start?.toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' })}
                </p>
             </div>
             
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Descrição da Atividade</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {selectedEvent?.extendedProps?.description || 'Nenhuma descrição técnica informada.'}
                </p>
             </div>

             {selectedEvent?.extendedProps?.status && (
               <div className="pt-4 border-t dark:border-gray-800">
                  <div className="flex items-center gap-3">
                     <div className={`w-3 h-3 rounded-full ${selectedEvent.extendedProps.status === 'CONCLUIDA' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                     <p className="text-xs font-black text-slate-900 dark:text-white uppercase">{selectedEvent.extendedProps.status}</p>
                  </div>
               </div>
             )}
          </div>

          <div className="p-8 bg-white dark:bg-gray-950 flex gap-4">
             <button onClick={closeModal} className="flex-1 py-4 bg-slate-100 dark:bg-gray-800 text-[10px] font-black uppercase rounded-2xl hover:bg-slate-200 transition-all">Fechar</button>
             {!isImpersonating && !selectedEvent?.id.includes('dds') && (
               <button className="flex-1 py-4 bg-indigo-600 text-white text-[10px] font-black uppercase rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">
                 Atualizar Progresso
               </button>
             )}
          </div>
        </Modal>
      </div>
    </>
  );
};

const renderEventContent = (eventInfo: any) => {
  const cal = eventInfo.event.extendedProps.calendar || 'Primary';
  const colorClass = `fc-event-${cal.toLowerCase()}`;
  
  return (
    <div className={`flex items-center gap-2 p-1.5 rounded-xl border border-transparent transition-all ${colorClass} truncate overflow-hidden`}>
      <span className="text-[10px] font-bold truncate">{eventInfo.event.title}</span>
    </div>
  );
};

export default Calendar;

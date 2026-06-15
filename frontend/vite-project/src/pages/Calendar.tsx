import API_BASE_URL from "../config/api.js";
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
import { useToast } from "../context/ToastContext.jsx";

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
  const { toast } = useToast();
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
        const res = await apiFetch(`${API_BASE_URL}/api/tarefas?userId=${userId}`);
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
      
      <div className="max-w-6xl mx-auto animate-slide-up space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Cronograma de Campo</h1>
            <p className="text-sm text-muted-foreground mt-1">Sincronizado com o Diário de Obra</p>
          </div>
          
          <ReadOnlyGuard>
             <button 
               className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
               onClick={() => toast.info('Interface de criação será disponibilizada na Fase 3.', 'Em desenvolvimento')}
             >
               + Novo Compromisso
             </button>
          </ReadOnlyGuard>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-sm overflow-hidden">
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
          className="max-w-lg p-0 overflow-hidden rounded-xl border-none"
        >
          <div className="bg-muted/30 p-5 border-b border-border flex justify-between items-start">
             <div>
               <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold mb-2 inline-block ${
                 selectedEvent?.extendedProps?.calendar === 'Warning' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 
                 selectedEvent?.extendedProps?.calendar === 'Danger' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
               }`}>
                 {selectedEvent?.extendedProps?.calendar === 'Warning' ? 'Segurança' : 'Operacional'}
               </span>
               <h3 className="text-base font-semibold text-foreground leading-tight">
                 {selectedEvent?.title}
               </h3>
             </div>
             <button onClick={closeModal} className="text-muted-foreground hover:text-destructive transition-colors">✕</button>
          </div>
          
          <div className="p-5 space-y-4">
             <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Horário / Data</p>
                <p className="text-sm text-foreground">
                  {selectedEvent?.start?.toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' })}
                </p>
             </div>
             
             <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Descrição da Atividade</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedEvent?.extendedProps?.description || 'Nenhuma descrição técnica informada.'}
                </p>
             </div>

             {selectedEvent?.extendedProps?.status && (
                <div className="pt-4 border-t border-border">
                   <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${selectedEvent.extendedProps.status === 'CONCLUIDA' ? 'bg-success' : 'bg-warning'}`} />
                      <p className="text-xs font-semibold text-foreground uppercase">{selectedEvent.extendedProps.status}</p>
                   </div>
                </div>
             )}
          </div>

          <div className="p-5 bg-card border-t border-border flex gap-3 justify-end">
             <button onClick={closeModal} className="px-3 py-1.5 bg-muted text-muted-foreground hover:text-foreground text-xs font-medium rounded-lg transition-colors">Fechar</button>
             {!isImpersonating && !selectedEvent?.id.includes('dds') && (
               <button className="px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-medium rounded-lg transition-colors">
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
    <div className={`flex items-center gap-2 p-1 rounded-lg border border-transparent transition-all ${colorClass} truncate overflow-hidden`}>
      <span className="text-[10px] font-medium truncate">{eventInfo.event.title}</span>
    </div>
  );
};

export default Calendar;

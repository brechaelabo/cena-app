
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { LivePublicEvent, ScheduledSession, User, Role, ScheduledSessionCreateData, LivePublicEventUpdateData, LivePublicEventCreateData, EventAudienceType, NotificationType } from '../types';
import { useAuth } from './AuthContext';
import { usePlatformUsers } from './UserManagementContext';
import { useNotifications } from './NotificationContext'; // Import useNotifications
import { PATHS } from '../constants';

// Mock Data
const INITIAL_MOCK_PUBLIC_EVENTS: LivePublicEvent[] = [
  {
    id: 'live-public-001',
    title: 'Workshop Mensal: Técnica de Audição',
    description: 'Participe do nosso workshop mensal ao vivo com dicas e técnicas para se destacar em audições. Convidado especial: Diretor de Elenco Renomado.',
    meetLink: 'https://meet.google.com/abc-def-ghi', 
    isActive: true,
    scheduledAt: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(), 
    scheduledEndTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), 
    audienceType: EventAudienceType.ALL,
    updatedAt: new Date().toISOString(),
    updatedBy: 'user-admin-01',
  },
];

const INITIAL_MOCK_SCHEDULED_SESSIONS: ScheduledSession[] = [
  {
    id: 'session-001',
    tutorId: 'user-tutor-02', 
    actorId: 'user-actor-01', 
    meetLink: 'https://meet.google.com/xyz-uvw-rst', 
    scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), 
    notes: 'Sessão 1:1 sobre o feedback do Monólogo Clássico.',
    status: 'SCHEDULED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// NOTA: As constantes INITIAL_MOCK_PUBLIC_EVENTS e INITIAL_MOCK_SCHEDULED_SESSIONS acima
// definem os dados padrão que serão carregados se nenhuma configuração for encontrada no localStorage.
// Se você atualizou estas constantes para refletir os novos padrões desejados,
// a aplicação as usará quando o localStorage estiver vazio.

interface LiveSessionContextType {
  publicLiveEvents: LivePublicEvent[];
  getActivePublicLiveEvent: () => LivePublicEvent | undefined;
  addPublicLiveEvent: (data: LivePublicEventCreateData) => Promise<void>;
  updatePublicLiveEvent: (data: LivePublicEventUpdateData & { id: string }) => Promise<void>;
  deletePublicLiveEvent: (eventId: string) => Promise<void>;
  
  scheduledSessions: ScheduledSession[];
  addScheduledSession: (sessionData: ScheduledSessionCreateData) => Promise<void>;
  updateScheduledSessionStatus: (sessionId: string, status: 'COMPLETED' | 'CANCELED') => Promise<void>;
  getSessionsForTutor: (tutorId: string) => ScheduledSession[];
  getSessionsForActor: (actorId: string) => ScheduledSession[];
}

const LiveSessionContext = createContext<LiveSessionContextType | undefined>(undefined);

export const LiveSessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { platformUsers, getUserById: getPlatformUserById } = usePlatformUsers(); // Added platformUsers
  const { addNotification } = useNotifications(); 

  const [publicLiveEvents, setPublicLiveEvents] = useState<LivePublicEvent[]>(() => {
    const storedEvents = localStorage.getItem('cena-public-live-events');
    if (storedEvents) {
        return JSON.parse(storedEvents).map((event: LivePublicEvent) => ({
            ...event,
            scheduledAt: event.scheduledAt ? new Date(event.scheduledAt).toISOString() : undefined,
            scheduledEndTime: event.scheduledEndTime ? new Date(event.scheduledEndTime).toISOString() : undefined,
            audienceType: event.audienceType || EventAudienceType.ALL, 
        }));
    }
    return INITIAL_MOCK_PUBLIC_EVENTS.map(event => ({
        ...event,
        audienceType: event.audienceType || EventAudienceType.ALL,
    }));
  });

  const [scheduledSessions, setScheduledSessions] = useState<ScheduledSession[]>(() => {
    const storedSessions = localStorage.getItem('cena-scheduled-sessions');
    if (storedSessions) {
        return JSON.parse(storedSessions).map((session: ScheduledSession) => ({
            ...session,
            scheduledAt: new Date(session.scheduledAt).toISOString() 
        }));
    }
    return INITIAL_MOCK_SCHEDULED_SESSIONS;
  });

  useEffect(() => {
    localStorage.setItem('cena-public-live-events', JSON.stringify(publicLiveEvents));
  }, [publicLiveEvents]);

  useEffect(() => {
    localStorage.setItem('cena-scheduled-sessions', JSON.stringify(scheduledSessions));
  }, [scheduledSessions]);

  const getTargetUserIdsForEvent = (audienceType: EventAudienceType): string[] => {
    switch (audienceType) {
        case EventAudienceType.SUBSCRIBERS:
            return platformUsers.filter(u => u.currentRole === Role.ACTOR && u.activePlan).map(u => u.id);
        case EventAudienceType.PLUS_PRO:
            return platformUsers.filter(u => u.currentRole === Role.ACTOR && (u.activePlan === 'PLUS' || u.activePlan === 'PRO')).map(u => u.id);
        case EventAudienceType.PRO_ONLY:
            return platformUsers.filter(u => u.currentRole === Role.ACTOR && u.activePlan === 'PRO').map(u => u.id);
        case EventAudienceType.ALL:
        default:
            return platformUsers.filter(u => u.currentRole !== Role.ADMIN).map(u => u.id); // All users except admins
    }
  };

  const addPublicLiveEvent = async (data: LivePublicEventCreateData): Promise<void> => {
    if (user && user.currentRole === Role.ADMIN) {
        const newEvent: LivePublicEvent = {
            ...data,
            id: `ple-${Date.now()}`,
            scheduledAt: data.scheduledAt ? new Date(data.scheduledAt).toISOString() : undefined,
            scheduledEndTime: data.scheduledEndTime ? new Date(data.scheduledEndTime).toISOString() : undefined,
            audienceType: data.audienceType || EventAudienceType.ALL,
            updatedAt: new Date().toISOString(),
            updatedBy: user.id,
        };
        setPublicLiveEvents(prev => [...prev, newEvent].sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
        
        if (newEvent.isActive && newEvent.scheduledAt) {
            const targetUserIds = getTargetUserIdsForEvent(newEvent.audienceType);
            if (targetUserIds.length > 0) {
                addNotification(targetUserIds, {
                    type: NotificationType.NEW_EVENT,
                    title: 'Novo Evento Ao Vivo Agendado!',
                    message: `Participe de "${newEvent.title}". Data: ${new Date(newEvent.scheduledAt).toLocaleDateString('pt-BR')}.`,
                    linkTo: PATHS.LIVE_SESSIONS,
                    iconName: 'LiveIndicatorIcon',
                });
            }
        }
    } else {
        throw new Error("Apenas administradores podem adicionar eventos públicos.");
    }
  };

  const updatePublicLiveEvent = async (data: LivePublicEventUpdateData & { id: string }): Promise<void> => {
    if (user && user.currentRole === Role.ADMIN) {
      const oldEvent = publicLiveEvents.find(e => e.id === data.id);
      let updatedEventInstance: LivePublicEvent | undefined;

      setPublicLiveEvents(prevEvents =>
        prevEvents.map(event => {
          if (event.id === data.id) {
            updatedEventInstance = { 
                ...event, 
                ...data, 
                scheduledAt: data.scheduledAt ? new Date(data.scheduledAt).toISOString() : undefined,
                scheduledEndTime: data.scheduledEndTime ? new Date(data.scheduledEndTime).toISOString() : undefined,
                audienceType: data.audienceType || event.audienceType || EventAudienceType.ALL,
                updatedAt: new Date().toISOString(), 
                updatedBy: user.id 
              };
            return updatedEventInstance;
          }
          return event;
        }).sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      );
      
      if (updatedEventInstance && updatedEventInstance.isActive && updatedEventInstance.scheduledAt && (!oldEvent || !oldEvent.isActive || oldEvent.scheduledAt !== updatedEventInstance.scheduledAt)) {
         const targetUserIds = getTargetUserIdsForEvent(updatedEventInstance.audienceType);
         if (targetUserIds.length > 0) {
             addNotification(targetUserIds, {
                type: NotificationType.NEW_EVENT,
                title: `Evento Ao Vivo Atualizado: ${updatedEventInstance.title}`,
                message: `O evento "${updatedEventInstance.title}" foi atualizado e está ativo. Confira os detalhes!`,
                linkTo: PATHS.LIVE_SESSIONS,
                iconName: 'LiveIndicatorIcon',
            });
         }
      }

    } else {
      throw new Error("Apenas administradores podem atualizar eventos públicos.");
    }
  };

  const deletePublicLiveEvent = async (eventId: string): Promise<void> => {
    if (user && user.currentRole === Role.ADMIN) {
        setPublicLiveEvents(prev => prev.filter(event => event.id !== eventId));
    } else {
        throw new Error("Apenas administradores podem excluir eventos públicos.");
    }
  };

  const getActivePublicLiveEvent = (): LivePublicEvent | undefined => {
    const now = new Date();
    const activeAndLive = publicLiveEvents.filter(event => 
        event.isActive && 
        event.scheduledAt && 
        new Date(event.scheduledAt) <= now &&
        (!event.scheduledEndTime || new Date(event.scheduledEndTime) >= now)
    ).sort((a, b) => new Date(b.scheduledAt!).getTime() - new Date(a.scheduledAt!).getTime()); 

    if (activeAndLive.length > 0) return activeAndLive[0];

    const upcoming = publicLiveEvents.filter(event => 
        event.isActive && 
        event.scheduledAt && 
        new Date(event.scheduledAt) > now
    ).sort((a,b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime()); 

    return upcoming.length > 0 ? upcoming[0] : undefined;
  };


  const addScheduledSession = async (sessionData: ScheduledSessionCreateData): Promise<void> => {
    if (user && user.currentRole === Role.TUTOR && user.id === sessionData.tutorId) {
      const actor = getPlatformUserById(sessionData.actorId);
      const newSession: ScheduledSession = {
        ...sessionData,
        id: `session-${Date.now()}`,
        tutorName: user.name || 'Tutor',
        actorName: actor?.name || 'Ator',
        status: 'SCHEDULED',
        scheduledAt: new Date(sessionData.scheduledAt).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setScheduledSessions(prev => [...prev, newSession]);
      
      addNotification(sessionData.actorId, {
        type: NotificationType.SESSION_SCHEDULED_ACTOR,
        title: 'Nova Sessão 1:1 Agendada!',
        message: `Seu tutor ${newSession.tutorName} agendou uma sessão para ${new Date(newSession.scheduledAt).toLocaleDateString('pt-BR')} às ${new Date(newSession.scheduledAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}.`,
        linkTo: PATHS.SESSOES_ACTOR_LISTING, 
        iconName: 'CalendarDaysIcon',
      });
    } else {
      throw new Error("Apenas o tutor designado pode criar a sessão.");
    }
  };

  const updateScheduledSessionStatus = async (sessionId: string, status: 'COMPLETED' | 'CANCELED'): Promise<void> => {
    const session = scheduledSessions.find(s => s.id === sessionId);
    setScheduledSessions(prev =>
      prev.map(s =>
        s.id === sessionId ? { ...s, status, updatedAt: new Date().toISOString() } : s
      )
    );
    if (status === 'CANCELED' && session && user?.currentRole === Role.TUTOR) {
      addNotification(session.actorId, {
        type: NotificationType.SESSION_CANCELED_TUTOR,
        title: 'Sessão 1:1 Cancelada',
        message: `Sua sessão com ${session.tutorName} agendada para ${new Date(session.scheduledAt).toLocaleString('pt-BR')} foi cancelada pelo tutor.`,
        linkTo: PATHS.SESSOES_ACTOR_LISTING,
        iconName: 'XCircleIcon',
      });
    }
  };
  
  const getSessionsForTutor = (tutorId: string): ScheduledSession[] => {
    return scheduledSessions.filter(s => s.tutorId === tutorId)
      .map(s => ({
        ...s,
        actorName: getPlatformUserById(s.actorId)?.name || s.actorName || 'Ator Desconhecido'
      }))
      .sort((a,b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
  };

  const getSessionsForActor = (actorId: string): ScheduledSession[] => {
     return scheduledSessions.filter(s => s.actorId === actorId)
      .map(s => ({
        ...s,
        tutorName: getPlatformUserById(s.tutorId)?.name || s.tutorName || 'Tutor Desconhecido'
      }))
      .sort((a,b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
  };

  return (
    <LiveSessionContext.Provider
      value={{
        publicLiveEvents,
        getActivePublicLiveEvent,
        addPublicLiveEvent,
        updatePublicLiveEvent,
        deletePublicLiveEvent,
        scheduledSessions,
        addScheduledSession,
        updateScheduledSessionStatus,
        getSessionsForTutor,
        getSessionsForActor,
      }}
    >
      {children}
    </LiveSessionContext.Provider>
  );
};

export const useLiveSessions = (): LiveSessionContextType => {
  const context = useContext(LiveSessionContext);
  if (context === undefined) {
    throw new Error('useLiveSessions must be used within a LiveSessionProvider');
  }
  return context;
};
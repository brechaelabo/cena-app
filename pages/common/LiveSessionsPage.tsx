
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLiveSessions } from '../../contexts/LiveSessionContext';
import { Role, LivePublicEvent, LivePublicEventUpdateData, LivePublicEventCreateData, EventAudienceType } from '../../types';
import { Card } from '../../components/Common/Card';
import { Button } from '../../components/Common/Button';
import { Input, Textarea } from '../../components/Common/Input';
import { PublicEventsCalendar } from '../../components/Calendar/PublicEventsCalendar';
import { CollapsibleCard } from '../../components/Common/CollapsibleCard';
import { LiveIndicatorIcon, CalendarDaysIcon, ClockIcon, PlusCircleIcon, ChevronDownIcon, ChevronUpIcon } from '../../components/Common/Icons'; 
import { useToasts } from '../../contexts/ToastContext';
import { EVENT_AUDIENCE_TYPE_NAMES } from '../../constants';
import { formatFullDate, formatDateTimeForInput } from '../../utils/dateFormatter';

const LiveSessionsPage: React.FC = () => {
  const { user } = useAuth();
  const { 
    publicLiveEvents, 
    getActivePublicLiveEvent,
    addPublicLiveEvent,
    updatePublicLiveEvent,
    deletePublicLiveEvent,
  } = useLiveSessions();
  const { addToast } = useToasts();

  const [editingEvent, setEditingEvent] = useState<LivePublicEvent | null>(null);
  const [isEventFormModalOpen, setIsEventFormModalOpen] = useState(false);
  const [eventForm, setEventForm] = useState<Partial<LivePublicEventCreateData & { id?: string; audienceType?: EventAudienceType }>>({});
  const [isSavingEvent, setIsSavingEvent] = useState(false);
  const [expandedAdminEventId, setExpandedAdminEventId] = useState<string | null>(null); 
  
  const activePublicEventForDisplay = getActivePublicLiveEvent();

  const [isFeaturedEventExpanded, setIsFeaturedEventExpanded] = useState(true);

  const openNewEventForm = () => {
    setEditingEvent(null);
    setEventForm({ title: '', description: '', meetLink: '', isActive: true, scheduledAt: '', scheduledEndTime: '', audienceType: EventAudienceType.ALL });
    setIsEventFormModalOpen(true);
  };

  const openEditEventForm = (event: LivePublicEvent) => {
    setEditingEvent(event);
    setEventForm({
      id: event.id,
      title: event.title,
      description: event.description,
      meetLink: event.meetLink,
      isActive: event.isActive,
      audienceType: event.audienceType || EventAudienceType.ALL,
      scheduledAt: event.scheduledAt ? formatDateTimeForInput(event.scheduledAt) : '',
      scheduledEndTime: event.scheduledEndTime ? formatDateTimeForInput(event.scheduledEndTime) : '',
    });
    setIsEventFormModalOpen(true);
  };

  const handleEventFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setEventForm(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setEventForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveEvent = async () => {
    if (!eventForm.title || !eventForm.meetLink || !eventForm.scheduledAt || !eventForm.audienceType) {
        addToast("Título, link da sala, data/hora de início e público alvo são obrigatórios.", 'error');
        return;
    }
    setIsSavingEvent(true);
    try {
      const dataToSubmit = {
        ...eventForm,
        scheduledAt: eventForm.scheduledAt ? new Date(eventForm.scheduledAt).toISOString() : undefined,
        scheduledEndTime: eventForm.scheduledEndTime ? new Date(eventForm.scheduledEndTime).toISOString() : undefined,
        audienceType: eventForm.audienceType || EventAudienceType.ALL,
        isActive: eventForm.isActive === undefined ? true : eventForm.isActive,
      };

      if (editingEvent && editingEvent.id) {
        await updatePublicLiveEvent({ ...dataToSubmit, id: editingEvent.id } as LivePublicEventUpdateData & { id: string });
        addToast('Evento público atualizado com sucesso!', 'success');
      } else {
        await addPublicLiveEvent(dataToSubmit as LivePublicEventCreateData);
        addToast('Evento público criado com sucesso!', 'success');
      }
      setIsEventFormModalOpen(false);
      setEventForm({});
    } catch (error: any) {
      addToast(error.message || 'Falha ao salvar evento público.', 'error');
    } finally {
      setIsSavingEvent(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este evento público?")) {
        setIsSavingEvent(true); 
        try {
            await deletePublicLiveEvent(eventId);
            addToast('Evento público excluído com sucesso!', 'success');
        } catch (error: any) {
            addToast(error.message || 'Falha ao excluir evento público.', 'error');
        } finally {
            setIsSavingEvent(false);
            if(expandedAdminEventId === eventId) setExpandedAdminEventId(null); 
        }
    }
  };

  const getEventStatusDisplay = (event: LivePublicEvent | null | undefined): { text: string; className: string; icon?: JSX.Element } => {
    if (!event || !event.isActive) return { text: 'INATIVO', className: 'bg-status-inactive-bg text-status-inactive-text' };
    if (!event.scheduledAt) return { text: 'A DEFINIR', className: 'bg-gray-200 text-gray-700' };

    const now = new Date();
    const startTime = new Date(event.scheduledAt);
    const endTime = event.scheduledEndTime ? new Date(event.scheduledEndTime) : new Date(startTime.getTime() + 2 * 60 * 60 * 1000); 

    if (now >= startTime && now <= endTime) {
      return { text: 'AO VIVO AGORA', className: 'bg-red-500 text-white animate-pulse', icon: <LiveIndicatorIcon className="w-5 h-5 mr-1.5"/> };
    }
    if (now < startTime) {
      return { text: 'EM BREVE', className: 'bg-accent-blue-subtle text-accent-blue-marker' };
    }
    return { text: 'FINALIZADO', className: 'bg-gray-200 text-gray-700' };
  };

  const commonInputProps = {
    disabled: isSavingEvent,
    className: "rounded-lg"
  };
  
  const renderDateTimeBlock = (dateISOStr?: string, endTimeISOStr?: string, isSmall: boolean = false) => {
    if (!dateISOStr) {
        return (
            <div className={`my-2 p-2 bg-gray-50 rounded-lg border border-border-subtle shadow-sm ${isSmall ? 'text-xs' : ''}`}>
                <p className="text-text-body">Data e horário a definir.</p>
            </div>
        );
    }
    const formattedDate = formatFullDate(dateISOStr);
    const startTime = new Date(dateISOStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const endTime = endTimeISOStr ? new Date(endTimeISOStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';
    
    return (
        <div className={`my-2 p-2 bg-gray-50 rounded-lg border border-border-subtle shadow-sm ${isSmall ? 'text-xs' : ''}`}>
          <div className="flex items-center mb-1">
            <CalendarDaysIcon className={`${isSmall ? 'w-4 h-4' : 'w-5 h-5'} text-accent-blue-emphasis mr-2 flex-shrink-0`} />
            <span className={`${isSmall ? 'text-xs' : 'text-sm'} text-text-body mr-1`}>Data:</span>
            <span className={`${isSmall ? 'text-sm' : 'text-base'} font-semibold text-headings`}>{formattedDate.split(', ')[1]}</span>
          </div>
          <div className="flex items-center">
            <ClockIcon className={`${isSmall ? 'w-4 h-4' : 'w-5 h-5'} text-accent-blue-emphasis mr-2 flex-shrink-0`} />
            <span className={`${isSmall ? 'text-xs' : 'text-sm'} text-text-body mr-1`}>Horário:</span>
            <span className={`${isSmall ? 'text-sm' : 'text-base'} font-semibold text-headings`}>
              {startTime}
              {endTime && ` - ${endTime}`}
            </span>
          </div>
        </div>
    );
  };

  const activePublicEventsForCalendar = publicLiveEvents.filter(event => event.isActive);

  const renderAdminEventManagement = () => {
    if (user?.currentRole === Role.ADMIN) {
      return (
        <Card title="Gerenciar Eventos Públicos da Plataforma" className="bg-card-bg">
            <div className="mb-4">
                <Button onClick={openNewEventForm} leftIcon={<PlusCircleIcon className="w-5 h-5"/>}>
                    Criar Novo Evento Público
                </Button>
            </div>
            {publicLiveEvents.length > 0 ? (
                <div className="space-y-3">
                    {publicLiveEvents.sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).map(event => {
                        const isExpanded = expandedAdminEventId === event.id;
                        const statusInfo = getEventStatusDisplay(event);
                        return (
                            <div key={event.id} className="border border-border-subtle rounded-lg overflow-hidden shadow-sm">
                                <div className="p-4 bg-gray-50">
                                  <h3 className="text-md font-semibold text-headings">{event.title}</h3>
                                  <div className="mt-1 text-xs space-x-2">
                                    <span className={`px-1.5 py-0.5 rounded-full font-medium text-xs ${statusInfo.className}`}>
                                      {statusInfo.icon}{statusInfo.text}
                                    </span>
                                    {event.audienceType && (
                                        <span className="px-1.5 py-0.5 bg-gray-200 text-gray-700 rounded-full font-medium text-xs">
                                            Público: {EVENT_AUDIENCE_TYPE_NAMES[event.audienceType]}
                                        </span>
                                    )}
                                    {event.scheduledAt && (
                                        <span className="px-1.5 py-0.5 bg-gray-200 text-gray-700 rounded-full font-medium text-xs">
                                            Início: {new Date(event.scheduledAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                        </span>
                                    )}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setExpandedAdminEventId(prev => prev === event.id ? null : event.id)}
                                  className="w-full py-2 flex justify-center items-center bg-gray-100 hover:bg-gray-200 border-t border-b border-border-subtle focus:outline-none focus:ring-1 focus:ring-link-active"
                                  aria-expanded={isExpanded}
                                  aria-controls={`admin-event-details-${event.id}`}
                                >
                                  {isExpanded ? <ChevronUpIcon className="w-5 h-5 text-text-muted" /> : <ChevronDownIcon className="w-5 h-5 text-text-muted" />}
                                  <span className="sr-only">{isExpanded ? 'Recolher detalhes' : 'Expandir detalhes'}</span>
                                </button>
                                {isExpanded && (
                                    <div id={`admin-event-details-${event.id}`} className="p-4">
                                        <p className="text-sm text-text-body mt-1 mb-3">{event.description}</p>
                                        {renderDateTimeBlock(event.scheduledAt, event.scheduledEndTime)}
                                        {event.meetLink && <p className="text-sm text-text-body mb-2"><strong>Link:</strong> <a href={event.meetLink} target="_blank" rel="noopener noreferrer" className="text-link-active hover:underline">{event.meetLink}</a></p>}
                                        
                                        <div className="flex space-x-2 mt-4">
                                            <Button variant="outline" size="sm" onClick={() => openEditEventForm(event)} disabled={isSavingEvent}>Editar</Button>
                                            <Button variant="danger" size="sm" onClick={() => handleDeleteEvent(event.id)} isLoading={isSavingEvent && editingEvent?.id === event.id} disabled={isSavingEvent && editingEvent?.id !== event.id}>Excluir</Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p className="text-text-body">Nenhum evento público criado.</p>
            )}
        </Card>
      );
    }
    return null;
  };

  const pageTitle = "Ao Vivo e Agenda de Eventos";
  
  return (
    <div className="space-y-8 p-0">
      <h1 className="text-2xl md:text-3xl font-bold text-black">{pageTitle}</h1>
      
      <CollapsibleCard 
        title="Evento Público em Destaque"
        defaultOpen={isFeaturedEventExpanded}
        className="bg-public-events-bg" 
      >
        {activePublicEventForDisplay ? (
          <div>
            <div className="flex justify-between items-center mb-2">
                <div className={`p-2 text-sm font-semibold rounded-md flex items-center justify-center ${getEventStatusDisplay(activePublicEventForDisplay).className}`}>
                    {getEventStatusDisplay(activePublicEventForDisplay).icon}
                    <span>{getEventStatusDisplay(activePublicEventForDisplay).text}</span>
                </div>
                {activePublicEventForDisplay.audienceType && (
                    <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded-full font-medium">
                    Público: {EVENT_AUDIENCE_TYPE_NAMES[activePublicEventForDisplay.audienceType] || 'Não definido'}
                    </span>
                )}
            </div>
            <h2 className="text-xl font-semibold text-black mb-2">{activePublicEventForDisplay.title}</h2>
            <p className="text-text-body mb-3">{activePublicEventForDisplay.description}</p>
            {renderDateTimeBlock(activePublicEventForDisplay.scheduledAt, activePublicEventForDisplay.scheduledEndTime)}
            <Button 
                variant="primary" 
                size="md"
                onClick={() => window.open(activePublicEventForDisplay.meetLink, '_blank')} 
                disabled={!activePublicEventForDisplay.meetLink || getEventStatusDisplay(activePublicEventForDisplay).text !== 'AO VIVO AGORA'}
                leftIcon={<LiveIndicatorIcon className="w-5 h-5"/>}
            >
                Acessar Sala Virtual
            </Button>
          </div>
        ) : (
          <p className="text-text-body">Nenhum evento público principal ativo ou agendado no momento.</p>
        )}
      </CollapsibleCard>

      <Card title="Eventos Públicos da Plataforma" className="bg-public-events-bg">
        <PublicEventsCalendar publicLiveEvents={activePublicEventsForCalendar} />
      </Card>
      
      {renderAdminEventManagement()}
      
      {isEventFormModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card title={editingEvent ? "Editar Evento Público" : "Criar Novo Evento Público"} className="bg-card-bg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSaveEvent(); }}>
              <Input label="Título do Evento" name="title" value={eventForm.title || ''} onChange={handleEventFormChange} {...commonInputProps} required />
              <Textarea label="Descrição" name="description" value={eventForm.description || ''} onChange={handleEventFormChange} {...commonInputProps} rows={3} required />
              <Input label="Link da Sala (Google Meet, Zoom, etc.)" name="meetLink" type="url" value={eventForm.meetLink || ''} onChange={handleEventFormChange} {...commonInputProps} required />
              <Input label="Data e Hora de Início" name="scheduledAt" type="datetime-local" value={eventForm.scheduledAt ? formatDateTimeForInput(eventForm.scheduledAt) : ''} onChange={handleEventFormChange} {...commonInputProps} required />
              <Input label="Data e Hora de Término (Opcional)" name="scheduledEndTime" type="datetime-local" value={eventForm.scheduledEndTime ? formatDateTimeForInput(eventForm.scheduledEndTime) : ''} onChange={handleEventFormChange} {...commonInputProps} />
              <div>
                <label htmlFor="audienceTypeModal" className="block text-sm font-medium text-text-body mb-1">Público Alvo:</label>
                <select
                  id="audienceTypeModal"
                  name="audienceType"
                  value={eventForm.audienceType || ''}
                  onChange={handleEventFormChange}
                  className={`w-full p-2.5 rounded-lg border bg-card-bg text-text-body placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-link-active focus:border-link-active sm:text-sm border-border-subtle ${commonInputProps.disabled ? 'bg-gray-100 cursor-not-allowed opacity-70' : ''}`}
                  disabled={commonInputProps.disabled}
                  required
                >
                  <option value="" disabled>Selecione o público</option>
                  {Object.values(EventAudienceType).map(type => (
                    <option key={type} value={type}>{EVENT_AUDIENCE_TYPE_NAMES[type]}</option>
                  ))}
                </select>
              </div>
              <div>
                  <label htmlFor="isActiveModal" className="flex items-center cursor-pointer">
                  <input id="isActiveModal" name="isActive" type="checkbox" checked={eventForm.isActive === undefined ? true : !!eventForm.isActive} onChange={handleEventFormChange} className="h-4 w-4 text-link-active border-border-subtle rounded focus:ring-link-active" disabled={commonInputProps.disabled} />
                  <span className="ml-2 text-sm text-text-body">Marcar como evento ativo</span>
                  </label>
              </div>
              <div className="flex space-x-2 justify-end pt-3 border-t border-border-subtle">
                <Button type="button" variant="outline" onClick={() => setIsEventFormModalOpen(false)} disabled={isSavingEvent}>Cancelar</Button>
                <Button type="submit" isLoading={isSavingEvent} disabled={isSavingEvent}>
                  {editingEvent ? "Salvar Alterações" : "Criar Evento"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default LiveSessionsPage;


import React, { useState, useEffect } from 'react';
import { Card } from '../../components/Common/Card';
import { Button } from '../../components/Common/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { Notification, NotificationType, Role, User, Plan, ActorLevel, SubscriptionStatusFilter } from '../../types';
import { BellIcon, QuestionMarkCircleIcon, CheckCircleIcon, XCircleIcon, InformationCircleIcon, EyeIcon, ChevronRightIcon, MenuIcon as ThemeIcon, ClipboardCheckIcon, VideoCameraIcon, UserGroupIcon, CalendarDaysIcon, BookOpenIcon, LiveIndicatorIcon, EnvelopeIcon } from '../../components/Common/Icons';
import { formatFullDate } from '../../utils/dateFormatter';
import { useNavigate } from 'react-router-dom';
import { PATHS, PLAN_DETAILS_MAP, ACTOR_LEVEL_NAMES, TECHNIQUE_OPTIONS, SUBSCRIPTION_STATUS_FILTER_NAMES } from '../../constants';
import { Input, Textarea } from '../../components/Common/Input';
import { usePlatformUsers } from '../../contexts/UserManagementContext'; 

const iconMap: { [key: string]: React.ElementType } = {
  BellIcon,
  QuestionMarkCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  EyeIcon,
  ThemeIcon,
  ClipboardCheckIcon,
  VideoCameraIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  BookOpenIcon,
  LiveIndicatorIcon,
  EnvelopeIcon, 
  ChevronRightIcon, 
};

interface AdminSentNotification {
  id: string;
  title: string;
  message: string;
  linkTo?: string;
  targetAudience: string;
  sentAt: string;
  filtersApplied?: AdminNotificationFilters;
}

interface AdminNotificationFilters {
  actorSubscriptionStatus?: SubscriptionStatusFilter;
  actorPlans?: Plan[];
  actorLevels?: ActorLevel[];
  actorTechniques?: string[];
}


const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const { notifications, getNotificationsForUser, markAsRead, markAllAsRead, addNotification } = useNotifications();
  const { platformUsers } = usePlatformUsers(); 
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'notifications' | 'support'>('notifications');
  const [userNotifications, setUserNotifications] = useState<Notification[]>([]);
  
  // For Support Tab
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');

  // For Admin Notification Panel
  const [adminNotificationTitle, setAdminNotificationTitle] = useState('');
  const [adminNotificationMessage, setAdminNotificationMessage] = useState('');
  const [adminNotificationLinkTo, setAdminNotificationLinkTo] = useState('');
  // Initialize with a general default, then set specifically for admin in useEffect
  const [adminNotificationTargetAudience, setAdminNotificationTargetAudience] = useState('ALL_USERS_EXCEPT_ADMINS');
  const [isSendingAdminNotification, setIsSendingAdminNotification] = useState(false);
  const [adminSentLog, setAdminSentLog] = useState<AdminSentNotification[]>([]);

  // Actor specific filters
  const [actorSubscriptionStatusFilter, setActorSubscriptionStatusFilter] = useState<SubscriptionStatusFilter>(SubscriptionStatusFilter.ALL);
  const [selectedActorPlans, setSelectedActorPlans] = useState<Plan[]>([]);
  const [selectedActorLevels, setSelectedActorLevels] = useState<ActorLevel[]>([]);
  const [selectedActorTechniques, setSelectedActorTechniques] = useState<string[]>([]);
  const [recipientPreviewCount, setRecipientPreviewCount] = useState(0);

  useEffect(() => {
    if (user && user.currentRole === Role.ADMIN) {
      setAdminNotificationTargetAudience('SEGMENT_ACTORS');
    }
  }, [user]);


  useEffect(() => {
    if (user) {
      setUserNotifications(getNotificationsForUser(user.id));
      if (user.currentRole === Role.ADMIN) {
        const storedLog = localStorage.getItem('cena-admin-sent-notifications-log');
        if (storedLog) {
          setAdminSentLog(JSON.parse(storedLog));
        }
      }
    }
  }, [user, notifications, getNotificationsForUser]);

  useEffect(() => {
    if (user?.currentRole === Role.ADMIN) {
        localStorage.setItem('cena-admin-sent-notifications-log', JSON.stringify(adminSentLog));
    }
  }, [adminSentLog, user?.currentRole]);

  const calculateRecipientPreview = () => {
    if (adminNotificationTargetAudience === 'SEGMENT_ACTORS') {
        const filteredActors = platformUsers.filter(u => {
            if (u.currentRole !== Role.ACTOR) return false;
            
            // Subscription Status Filter
            if (actorSubscriptionStatusFilter === SubscriptionStatusFilter.ACTIVE) {
                if (!u.isApproved || (u.subscriptionEndDate && new Date(u.subscriptionEndDate) < new Date())) return false;
            } else if (actorSubscriptionStatusFilter === SubscriptionStatusFilter.EXPIRED) {
                if (u.isApproved && (!u.subscriptionEndDate || new Date(u.subscriptionEndDate) >= new Date())) return false; 
            }

            // Plan Filter (AND logic with status)
            if (selectedActorPlans.length > 0 && (!u.activePlan || !selectedActorPlans.includes(u.activePlan))) {
                return false;
            }

            // Level Filter (AND logic)
            if (selectedActorLevels.length > 0 && (!u.actorLevel || !selectedActorLevels.includes(u.actorLevel))) {
                return false;
            }

            // Techniques Filter (AND logic - actor must have AT LEAST ONE of the selected)
            if (selectedActorTechniques.length > 0) {
                if (!u.interestedTechniques || !u.interestedTechniques.some(tech => selectedActorTechniques.includes(tech))) {
                    return false;
                }
            }
            return true;
        });
        setRecipientPreviewCount(filteredActors.length);
    } else {
      // Simplified preview for general groups
      switch (adminNotificationTargetAudience) {
        case 'ALL_ACTORS': setRecipientPreviewCount(platformUsers.filter(u => u.currentRole === Role.ACTOR).length); break;
        case 'ALL_APPROVED_TUTORS': setRecipientPreviewCount(platformUsers.filter(u => u.currentRole === Role.TUTOR && u.isApproved && u.tutorApplicationStatus === 'APPROVED').length); break;
        case 'ALL_APPROVED_GUESTS': setRecipientPreviewCount(platformUsers.filter(u => u.currentRole === Role.GUEST && u.isApproved).length); break;
        case 'ALL_USERS_EXCEPT_ADMINS': default: setRecipientPreviewCount(platformUsers.filter(u => u.currentRole !== Role.ADMIN).length); break;
      }
    }
  };

  useEffect(() => {
    if (user?.currentRole === Role.ADMIN) {
        calculateRecipientPreview();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminNotificationTargetAudience, actorSubscriptionStatusFilter, selectedActorPlans, selectedActorLevels, selectedActorTechniques, platformUsers, user?.currentRole]);


  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead && user) {
      markAsRead(notification.id, user.id);
    }
    if (notification.linkTo) {
      navigate(notification.linkTo);
    }
  };

  const handleMarkAllRead = () => {
    if (user) {
      markAllAsRead(user.id);
    }
  };
  
  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mailtoLink = `mailto:suporte@cena.com?subject=${encodeURIComponent(`Suporte CENA: ${supportSubject} (Usuário: ${user?.email})`)}&body=${encodeURIComponent(supportMessage)}`;
    window.location.href = mailtoLink;
    setSupportSubject('');
    setSupportMessage('');
  };
  
  const handleAdminMultiSelectChange = (
    setter: React.Dispatch<React.SetStateAction<any[]>>, 
    currentValues: any[], 
    value: any
  ) => {
    if (currentValues.includes(value)) {
      setter(currentValues.filter(item => item !== value));
    } else {
      setter([...currentValues, value]);
    }
  };


  const handleSendAdminNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminNotificationTitle || !adminNotificationMessage) {
      alert("Título e Mensagem são obrigatórios para a notificação."); 
      return;
    }
    setIsSendingAdminNotification(true);

    let targetUserIds: string[] = [];
    let filtersAppliedForLog: AdminNotificationFilters | undefined = undefined;

    if (adminNotificationTargetAudience === 'SEGMENT_ACTORS') {
        targetUserIds = platformUsers.filter(u => {
             if (u.currentRole !== Role.ACTOR) return false;
            if (actorSubscriptionStatusFilter === SubscriptionStatusFilter.ACTIVE) {
                if (!u.isApproved || (u.subscriptionEndDate && new Date(u.subscriptionEndDate) < new Date())) return false;
            } else if (actorSubscriptionStatusFilter === SubscriptionStatusFilter.EXPIRED) {
                if (u.isApproved && (!u.subscriptionEndDate || new Date(u.subscriptionEndDate) >= new Date())) return false;
            }
            if (selectedActorPlans.length > 0 && (!u.activePlan || !selectedActorPlans.includes(u.activePlan))) return false;
            if (selectedActorLevels.length > 0 && (!u.actorLevel || !selectedActorLevels.includes(u.actorLevel))) return false;
            if (selectedActorTechniques.length > 0 && (!u.interestedTechniques || !u.interestedTechniques.some(tech => selectedActorTechniques.includes(tech)))) return false;
            return true;
        }).map(u => u.id);
        filtersAppliedForLog = {
            actorSubscriptionStatus: actorSubscriptionStatusFilter,
            actorPlans: selectedActorPlans,
            actorLevels: selectedActorLevels,
            actorTechniques: selectedActorTechniques,
        };

    } else {
      switch (adminNotificationTargetAudience) {
        case 'ALL_ACTORS': targetUserIds = platformUsers.filter(u => u.currentRole === Role.ACTOR).map(u => u.id); break;
        case 'ALL_APPROVED_TUTORS': targetUserIds = platformUsers.filter(u => u.currentRole === Role.TUTOR && u.isApproved && u.tutorApplicationStatus === 'APPROVED').map(u => u.id); break;
        case 'ALL_APPROVED_GUESTS': targetUserIds = platformUsers.filter(u => u.currentRole === Role.GUEST && u.isApproved).map(u => u.id); break;
        case 'ALL_USERS_EXCEPT_ADMINS': default: targetUserIds = platformUsers.filter(u => u.currentRole !== Role.ADMIN).map(u => u.id); break;
      }
    }
    
    if (targetUserIds.length > 0) {
        addNotification(targetUserIds, {
            type: NotificationType.GENERAL_INFO,
            title: adminNotificationTitle,
            message: adminNotificationMessage,
            linkTo: adminNotificationLinkTo || undefined,
            iconName: 'BellIcon',
        });
        
        const newLogEntry: AdminSentNotification = {
            id: `admin-log-${Date.now()}`,
            title: adminNotificationTitle,
            message: adminNotificationMessage,
            linkTo: adminNotificationLinkTo || undefined,
            targetAudience: adminNotificationTargetAudience,
            sentAt: new Date().toISOString(),
            filtersApplied: filtersAppliedForLog,
        };
        setAdminSentLog(prevLog => [newLogEntry, ...prevLog].slice(0, 20)); 

        setAdminNotificationTitle('');
        setAdminNotificationMessage('');
        setAdminNotificationLinkTo('');
        // Reset actor filters as well
        setActorSubscriptionStatusFilter(SubscriptionStatusFilter.ALL);
        setSelectedActorPlans([]);
        setSelectedActorLevels([]);
        setSelectedActorTechniques([]);

        alert("Notificação enviada com sucesso!"); 
    } else {
        alert("Nenhum usuário encontrado para os filtros e público alvo selecionados."); 
    }
    setIsSendingAdminNotification(false);
  };


  if (!user) {
    return <p className="p-6 text-center text-text-body">Carregando...</p>;
  }

  const unreadCount = userNotifications.filter(n => !n.isRead).length;

  const getIconForNotificationType = (type: NotificationType): React.ElementType => {
    switch (type) {
      case NotificationType.NEW_THEME: return ThemeIcon;
      case NotificationType.SUBMISSION_CONFIRMED: return VideoCameraIcon;
      case NotificationType.FEEDBACK_READY: return ClipboardCheckIcon;
      case NotificationType.SESSION_SCHEDULED_ACTOR:
      case NotificationType.SESSION_REQUESTED_TUTOR:
      case NotificationType.SESSION_CANCELED_ACTOR:
      case NotificationType.SESSION_CANCELED_TUTOR: return CalendarDaysIcon;
      case NotificationType.NEW_COURSE: return BookOpenIcon;
      case NotificationType.NEW_EVENT: return LiveIndicatorIcon;
      case NotificationType.USER_APPROVED:
      case NotificationType.TUTOR_APP_APPROVED: return CheckCircleIcon;
      case NotificationType.TUTOR_APP_REJECTED: return XCircleIcon;
      case NotificationType.GENERAL_INFO: return InformationCircleIcon;
      default: return BellIcon;
    }
  };
  
  const commonSelectClass = "w-full p-2.5 border border-border-subtle rounded-lg bg-card-bg text-text-body sm:text-sm";
  const commonCheckboxLabelClass = "flex items-center space-x-2 text-sm text-text-body cursor-pointer";
  const commonCheckboxClass = "form-checkbox h-4 w-4 text-accent-blue-emphasis rounded border-border-subtle focus:ring-accent-blue-emphasis";

  const renderAdminNotificationPanel = () => (
    <Card title="Painel de Envio de Notificações" className="mb-8 bg-card-bg">
        <form onSubmit={handleSendAdminNotification} className="space-y-4">
            <Input
                label="Título da Notificação"
                value={adminNotificationTitle}
                onChange={(e) => setAdminNotificationTitle(e.target.value)}
                required
                disabled={isSendingAdminNotification}
            />
            <Textarea
                label="Mensagem da Notificação"
                value={adminNotificationMessage}
                onChange={(e) => setAdminNotificationMessage(e.target.value)}
                required
                rows={3}
                disabled={isSendingAdminNotification}
            />
            <Input
                label="Link (Opcional - Ex: /percursos/novo-curso)"
                value={adminNotificationLinkTo}
                onChange={(e) => setAdminNotificationLinkTo(e.target.value)}
                placeholder="/caminho/para/pagina"
                disabled={isSendingAdminNotification}
            />
            <div>
                <label htmlFor="adminNotificationTargetAudience" className="block text-sm font-medium text-text-body mb-1">Público Alvo Principal:</label>
                <select 
                    id="adminNotificationTargetAudience" 
                    value={adminNotificationTargetAudience} 
                    onChange={(e) => setAdminNotificationTargetAudience(e.target.value)}
                    className={commonSelectClass}
                    disabled={isSendingAdminNotification}
                >
                    <option value="ALL_USERS_EXCEPT_ADMINS">Todos (exceto Admins)</option>
                    <option value="ALL_ACTORS">Todos os Atores (Geral)</option>
                    <option value="ALL_APPROVED_TUTORS">Todos os Tutores Aprovados</option>
                    <option value="ALL_APPROVED_GUESTS">Todos os Convidados Aprovados</option>
                    <option value="SEGMENT_ACTORS">Segmentar Atores (Filtros Específicos)</option>
                </select>
            </div>

            {adminNotificationTargetAudience === 'SEGMENT_ACTORS' && (
                <div className="p-4 border border-border-subtle rounded-lg space-y-4 bg-gray-50">
                    <h4 className="text-md font-semibold text-text-headings">Filtros para Atores</h4>
                    <div>
                        <label htmlFor="actorSubscriptionStatusFilter" className="block text-sm font-medium text-text-body mb-1">Status da Assinatura:</label>
                        <select id="actorSubscriptionStatusFilter" value={actorSubscriptionStatusFilter} onChange={(e) => setActorSubscriptionStatusFilter(e.target.value as SubscriptionStatusFilter)} className={commonSelectClass} disabled={isSendingAdminNotification}>
                            {Object.values(SubscriptionStatusFilter).map(status => (
                                <option key={status} value={status}>{SUBSCRIPTION_STATUS_FILTER_NAMES[status]}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <p className="block text-sm font-medium text-text-body mb-1">Plano do Ator:</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {Object.values(Plan).map(plan => (
                                <label key={plan} className={commonCheckboxLabelClass}>
                                    <input type="checkbox" value={plan} checked={selectedActorPlans.includes(plan)} 
                                           onChange={() => handleAdminMultiSelectChange(setSelectedActorPlans, selectedActorPlans, plan)} 
                                           className={commonCheckboxClass} disabled={isSendingAdminNotification}/>
                                    <span>{PLAN_DETAILS_MAP[plan].name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                     <div>
                        <p className="block text-sm font-medium text-text-body mb-1">Nível do Ator:</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {Object.values(ActorLevel).map(level => (
                                <label key={level} className={commonCheckboxLabelClass}>
                                    <input type="checkbox" value={level} checked={selectedActorLevels.includes(level)} 
                                           onChange={() => handleAdminMultiSelectChange(setSelectedActorLevels, selectedActorLevels, level)}
                                           className={commonCheckboxClass} disabled={isSendingAdminNotification}/>
                                    <span>{ACTOR_LEVEL_NAMES[level]}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                     <div>
                        <p className="block text-sm font-medium text-text-body mb-1">Técnicas de Interesse (pelo menos uma):</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-32 overflow-y-auto p-2 border rounded-md">
                            {TECHNIQUE_OPTIONS.map(tech => (
                                <label key={tech} className={commonCheckboxLabelClass}>
                                    <input type="checkbox" value={tech} checked={selectedActorTechniques.includes(tech)} 
                                           onChange={() => handleAdminMultiSelectChange(setSelectedActorTechniques, selectedActorTechniques, tech)}
                                           className={commonCheckboxClass} disabled={isSendingAdminNotification}/>
                                    <span>{tech}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <p className="text-sm text-text-muted">Prévia de Destinatários: {recipientPreviewCount}</p>
                </div>
            )}
            
            <Button type="submit" variant="primary" isLoading={isSendingAdminNotification} disabled={isSendingAdminNotification}>
                Enviar Notificação
            </Button>
        </form>
        {adminSentLog.length > 0 && (
            <div className="mt-6 pt-4 border-t border-border-subtle">
                <h4 className="text-md font-semibold text-text-headings mb-2">Log de Envios Manuais (Últimos 20):</h4>
                <ul className="space-y-2 max-h-60 overflow-y-auto text-xs">
                    {adminSentLog.map(log => (
                        <li key={log.id} className="p-2 border border-border-subtle rounded-md bg-gray-50">
                            <p><strong>Título:</strong> {log.title}</p>
                            <p><strong>Público:</strong> {log.targetAudience === 'SEGMENT_ACTORS' ? 'Atores Segmentados' : log.targetAudience}</p>
                            <p><strong>Enviado em:</strong> {formatFullDate(log.sentAt)}</p>
                            {log.linkTo && <p><strong>Link:</strong> {log.linkTo}</p>}
                            {log.filtersApplied && (
                                <details className="text-xs mt-1">
                                    <summary className="cursor-pointer">Ver Filtros Aplicados</summary>
                                    <pre className="bg-white p-1 text-xs rounded border overflow-auto">{JSON.stringify(log.filtersApplied, null, 2)}</pre>
                                </details>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        )}
    </Card>
  );

  return (
    <div className="space-y-6 p-0">
      <h1 className="text-2xl md:text-3xl font-bold text-black">
        Central de Mensagens
      </h1>

      <div className="flex border-b border-border-subtle">
        <button
          onClick={() => setActiveTab('notifications')}
          className={`py-3 px-4 font-medium text-sm focus:outline-none transition-colors duration-150 relative
            ${activeTab === 'notifications' ? 'text-link-active border-b-2 border-link-active' : 'text-text-muted hover:text-text-body'}`}
          aria-label="Notificações"
        >
          <div className="flex items-center">
            <BellIcon className="w-5 h-5 mr-1.5" />
            Notificações 
            {unreadCount > 0 && (
             <span className="ml-1.5 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                {unreadCount}
             </span>
            )}
          </div>
        </button>
        <button
          onClick={() => setActiveTab('support')}
          className={`py-3 px-4 font-medium text-sm focus:outline-none transition-colors duration-150
            ${activeTab === 'support' ? 'text-link-active border-b-2 border-link-active' : 'text-text-muted hover:text-text-body'}`}
          aria-label="Suporte e Atendimento"
        >
           <div className="flex items-center">
            <QuestionMarkCircleIcon className="w-5 h-5 mr-1.5" />
            Suporte / Atendimento
          </div>
        </button>
      </div>

      {activeTab === 'notifications' && (
        <>
          {user.currentRole === Role.ADMIN && renderAdminNotificationPanel()}
          <Card title={user.currentRole === Role.ADMIN ? "Minhas Notificações Recebidas" : "Minhas Notificações"} className="bg-card-bg">
            {userNotifications.length > 0 && unreadCount > 0 && (
              <div className="mb-4 text-right">
                <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
                  Marcar todas como lidas
                </Button>
              </div>
            )}
            {userNotifications.length === 0 ? (
              <div className="text-center py-10">
                <BellIcon className="w-16 h-16 text-text-muted mx-auto mb-4" />
                <p className="text-lg text-text-body">Nenhuma notificação no momento.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {userNotifications.map(notification => {
                  const IconComponent = getIconForNotificationType(notification.type);
                  return (
                    <li
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-4 rounded-lg border flex items-start space-x-3 transition-colors duration-150 cursor-pointer
                        ${notification.isRead ? 'bg-gray-50 border-gray-200 hover:bg-gray-100' : 'bg-blue-50 border-accent-blue-emphasis hover:bg-blue-100 border-l-4'}`}
                      role="button"
                      tabIndex={0}
                      onKeyPress={(e) => e.key === 'Enter' && handleNotificationClick(notification)}
                    >
                      <IconComponent className={`w-6 h-6 mt-0.5 flex-shrink-0 ${notification.isRead ? 'text-text-muted' : 'text-accent-blue-emphasis'}`} />
                      <div className="flex-grow">
                        <h3 className={`text-md font-semibold ${notification.isRead ? 'text-text-headings' : 'text-black font-bold'}`}>
                          {notification.title}
                        </h3>
                        <p className={`text-sm ${notification.isRead ? 'text-text-body' : 'text-text-body'}`}>{notification.message}</p>
                        <p className="text-xs text-text-muted mt-1">{formatFullDate(notification.createdAt)}</p>
                      </div>
                      {!notification.isRead && <span className="w-2.5 h-2.5 bg-accent-blue-emphasis rounded-full mt-1 flex-shrink-0" aria-label="Não lida"></span>}
                      {notification.linkTo && <ChevronRightIcon className="w-5 h-5 text-text-muted self-center ml-2 flex-shrink-0" />}
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </>
      )}

      {activeTab === 'support' && (
        <Card title="Contato e Suporte" className="bg-card-bg">
          <p className="text-text-body mb-4">
            Precisa de ajuda ou tem alguma dúvida? Envie uma mensagem para nossa equipe de suporte.
            As solicitações de suporte serão enviadas para nosso e-mail de atendimento (suporte@cena.com). Responderemos diretamente no seu e-mail ({user.email}).
          </p>
          <form onSubmit={handleSupportSubmit} className="space-y-4">
            <div>
              <Input
                label="Assunto"
                id="supportSubject"
                value={supportSubject}
                onChange={(e) => setSupportSubject(e.target.value)}
                required
                placeholder="Ex: Dúvida sobre plano, Problema técnico"
              />
            </div>
            <div>
              <Textarea
                label="Sua Mensagem"
                id="supportMessage"
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                required
                rows={5}
                placeholder="Descreva sua dúvida ou problema detalhadamente..."
              />
            </div>
            <Button type="submit" variant="primary" leftIcon={<EnvelopeIcon className="w-5 h-5"/>}>
              Enviar para Suporte
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
};

export default MessagesPage;

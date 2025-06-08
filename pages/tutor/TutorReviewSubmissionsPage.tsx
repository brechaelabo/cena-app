
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/Common/Button';
import { Card } from '../../components/Common/Card';
import { PATHS, PLAN_DETAILS_MAP, BILLING_CYCLE_DISCOUNTS_DETAILS } from '../../constants';
import { Submission, User as PlatformUser, Role, BillingCycle, Theme } from '../../types';
import { 
    ArrowLeftIcon, 
    UserIcon as ActorIcon, 
    PriceTagIcon, 
    CalendarDaysIcon, 
    ClockIcon, 
    VideoCameraIcon, 
    InboxArrowDownIcon,
    ClipboardDocumentListIcon, 
    CheckCircleIcon,
    AcademicCapIcon,
    ChevronDownIcon, // Added
} from '../../components/Common/Icons';
import { useAuth } from '../../contexts/AuthContext';
import { usePlatformUsers } from '../../contexts/UserManagementContext';
import { useSubmissions } from '../../contexts/SubmissionContext'; 
import { useThemes } from '../../contexts/ThemeContext'; 
import { useLiveSessions } from '../../contexts/LiveSessionContext';
import { useToasts } from '../../contexts/ToastContext';
import { formatFullDate, getMonthsSince, calculateFeedbackDeadlineInfo, formatMonthYear } from '../../utils/dateFormatter'; // Added formatMonthYear

// Add _renderKey to Submission type for local state effect
type SubmissionWithRenderKey = Submission & { 
    _renderKey?: number;
    _themeMonth?: number;
    _themeYear?: number;
};

const TutorReviewSubmissionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user: tutorUser } = useAuth(); 
  const { getUserById: getPlatformUserById } = usePlatformUsers();
  const { getSubmissionsForTutorReview, assignTutorToSubmission, countSubmissionsByActor, countSubmissionsByActorThisMonth } = useSubmissions(); 
  const { getThemeById } = useThemes(); 
  const { getSessionsForActor } = useLiveSessions();
  const { addToast } = useToasts();

  const [allPendingSubmissions, setAllPendingSubmissions] = useState<SubmissionWithRenderKey[]>([]);
  const [assignedSubmissions, setAssignedSubmissions] = useState<SubmissionWithRenderKey[]>([]);
  const [poolSubmissions, setPoolSubmissions] = useState<SubmissionWithRenderKey[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdownIntervals, setCountownIntervals] = useState<Record<string, number>>({});
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [expandedCardIds, setExpandedCardIds] = useState<Record<string, boolean>>({}); // Added for card expansion

  const toggleCardExpansion = (submissionId: string) => {
    setExpandedCardIds(prev => ({ ...prev, [submissionId]: !prev[submissionId] }));
  };

  useEffect(() => {
    if (!tutorUser || tutorUser.currentRole !== Role.TUTOR) {
        setError("Acesso não autorizado.");
        setIsLoading(false);
        navigate(PATHS.LOGIN);
        return;
    }
    
    const fetchAndSetSubmissions = () => {
      try {
        const pendingSubmissions = getSubmissionsForTutorReview(tutorUser.id);
        const enrichedSubmissions = pendingSubmissions.map(s => {
            const themeData = getThemeById(s.themeId);
            const actorData = getPlatformUserById(s.userId);
            return {
                ...s,
                themeTitle: themeData?.title || s.themeTitle || 'Tema Desconhecido',
                _themeMonth: themeData?.month,
                _themeYear: themeData?.year,
                userName: actorData?.name || s.userName || 'Ator Desconhecido',
                userLevel: actorData?.actorLevel,
            };
        });
        
        setAllPendingSubmissions(enrichedSubmissions);
      } catch (e: any) {
        setError("Erro ao carregar envios.");
        console.error(e);
      }
      setIsLoading(false);
    };
    
    setIsLoading(true);
    setTimeout(() => { 
      fetchAndSetSubmissions();
    }, 500);
  }, [tutorUser, navigate, getSubmissionsForTutorReview, getThemeById, getPlatformUserById]);
  
  // This effect updates the _renderKey on allPendingSubmissions to refresh countdowns
  useEffect(() => {
    const newIntervals: Record<string, number> = {};
    allPendingSubmissions.forEach(sub => {
      if (sub.createdAt && !sub.feedbackId) { // Only for pending ones
        const deadlineInfo = calculateFeedbackDeadlineInfo(sub.createdAt, sub.deadlineTimestamp || sub._renderKey);
        if (!deadlineInfo.isPastDeadline && !countdownIntervals[sub.id]) {
          const intervalId = window.setInterval(() => {
            setAllPendingSubmissions(prevSubs =>
              prevSubs.map(s =>
                s.id === sub.id ? { ...s, _renderKey: Date.now() } : s
              )
            );
          }, 60000); // Update every minute
          newIntervals[sub.id] = intervalId;
        } else if (deadlineInfo.isPastDeadline && countdownIntervals[sub.id]) {
          // Clear interval if deadline passed
          clearInterval(countdownIntervals[sub.id]);
          delete countdownIntervals[sub.id]; // Remove from current tracking
        }
      }
    });

    // Update countdownIntervals state if newIntervals is different
    // to avoid unnecessary re-renders of this effect itself
    let changed = false;
    const finalIntervals = {...countdownIntervals};
    Object.keys(newIntervals).forEach(key => {
        if(finalIntervals[key] !== newIntervals[key]) {
            if(finalIntervals[key]) clearInterval(finalIntervals[key]);
            finalIntervals[key] = newIntervals[key];
            changed = true;
        }
    });
     Object.keys(finalIntervals).forEach(key => {
        if (!newIntervals[key] && finalIntervals[key]) { // Interval was removed because deadline passed or sub removed
            clearInterval(finalIntervals[key]);
            delete finalIntervals[key];
            changed = true;
        }
    });

    if (changed) {
        setCountownIntervals(finalIntervals);
    }

    return () => { // Cleanup on unmount
      Object.values(finalIntervals).forEach(clearInterval);
    };
  }, [allPendingSubmissions]); // Re-run when allPendingSubmissions changes (e.g. _renderKey or list itself)


  // This effect re-filters when allPendingSubmissions changes
  useEffect(() => {
    if (!tutorUser) return;
    setAssignedSubmissions(allPendingSubmissions.filter(s => s.assignedTutorId === tutorUser.id));
    setPoolSubmissions(allPendingSubmissions.filter(s => !s.assignedTutorId));
  }, [allPendingSubmissions, tutorUser]);


  const handleAssignToSelf = async (submissionId: string) => {
    if (!tutorUser) return;
    setActionLoading(prev => ({ ...prev, [submissionId]: true }));
    try {
        await assignTutorToSubmission(submissionId, tutorUser.id);
        addToast('Envio assumido com sucesso! Ele agora aparece em "Meus Envios Designados".', 'success');
        // Re-fetch and set submissions to reflect change immediately (or rely on context update if fast enough)
        const updatedPending = getSubmissionsForTutorReview(tutorUser.id).map(s => {
            const themeData = getThemeById(s.themeId);
            const actorData = getPlatformUserById(s.userId);
            return {
                 ...s,
                themeTitle: themeData?.title || s.themeTitle || 'Tema Desconhecido',
                _themeMonth: themeData?.month,
                _themeYear: themeData?.year,
                userName: actorData?.name || s.userName || 'Ator Desconhecido',
                userLevel: actorData?.actorLevel,
            }
        });
        setAllPendingSubmissions(updatedPending); 
    } catch (e: any) {
        addToast(e.message || 'Falha ao assumir o envio.', 'error');
    } finally {
        setActionLoading(prev => ({ ...prev, [submissionId]: false }));
    }
  };


  if (isLoading) {
    return <div className="text-center p-10 text-text-body">Carregando envios para revisão...</div>;
  }

  if (error) {
    return (
      <div className="text-center p-10">
        <p className="text-red-500 text-xl">{error}</p>
        <Button onClick={() => navigate(PATHS.TUTOR_DASHBOARD)} className="mt-4">Voltar ao Painel</Button>
      </div>
    );
  }

  const renderInfoBlock = (iconElement: JSX.Element, label: string, value: string | number | JSX.Element, valueClassName: string = "text-text-headings", isSmall: boolean = false) => (
    <div className={`flex items-start p-2 bg-gray-50 rounded-md border border-border-subtle shadow-sm ${isSmall ? 'h-auto' : 'h-full'}`}>
      <div className={`mr-2 mt-0.5 flex-shrink-0 flex items-center justify-center ${isSmall ? 'w-4 h-4' : 'w-5 h-5'}`}>
        {iconElement}
      </div>
      <div className="min-w-0 flex-1"> 
        <p className={`text-text-muted mb-0 truncate ${isSmall ? 'text-xs' : 'text-xs'}`}>{label}</p>
        <p className={`font-semibold ${valueClassName} truncate ${isSmall ? 'text-sm' : 'text-base'}`}>{value}</p>
      </div>
    </div>
  );
  
  const feedbackBestPractices = [
    "Seja específico.",
    "Mantenha um tom construtivo e encorajador.",
    "Destaque os pontos fortes antes de abordar pontos de melhoria.",
    "Indique as minutagens dos momentos que está comentando.",
    "Analise aspectos técnicos (luz, som, imagem, enquadramento), artísticos (análise de texto e atuação) e estratégicos (reflexão sobre relação com carreira e mercado).",
    "Revise seu feedback antes do envio para garantir clareza, objetividade e afetividade."
  ];
  
  const renderSubmissionCard = (submission: SubmissionWithRenderKey, isAssignedToSelf: boolean, isInPool: boolean) => {
    const actor = getPlatformUserById(submission.userId) as PlatformUser | undefined; 
    const totalSubmissions = actor ? countSubmissionsByActor(actor.id) : 0;
    const completedSessions = actor ? getSessionsForActor(actor.id).filter(s => s.status === 'COMPLETED').length : 0;
    const planLimit = actor?.activePlan ? PLAN_DETAILS_MAP[actor.activePlan]?.selftapesPerMonth : 0;
    const submissionsThisMonth = actor ? countSubmissionsByActorThisMonth(actor.id) : 0;
    const remainingSubmissions = Math.max(0, planLimit - submissionsThisMonth);
    const deadlineInfo = calculateFeedbackDeadlineInfo(submission.createdAt, submission.deadlineTimestamp || submission._renderKey);
    const iconClasses = "w-full h-full text-link-active";
    const themeDateDisplay = formatMonthYear(submission._themeMonth, submission._themeYear);
    const fullThemeTitle = `${submission.themeTitle}${themeDateDisplay ? ` (${themeDateDisplay})` : ''}`;
    const isExpanded = !!expandedCardIds[submission.id];


    const assignmentStatus = () => {
      if (submission.assignedTutorId === tutorUser?.id) {
        return <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">Designado para você</span>;
      }
      if (!submission.assignedTutorId) {
        return <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full font-medium">Não designado</span>;
      }
      const assignedTutor = getPlatformUserById(submission.assignedTutorId);
      return <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">Designado para: {assignedTutor?.name || 'Outro Tutor'}</span>;
    };

    return (
        <Card key={submission.id} className="p-0 overflow-visible shadow-lg flex flex-col">
            <div className="relative p-4 border-b border-border-subtle hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                    <div className="flex items-center min-w-0">
                        {actor?.imageUrl ? 
                        <img src={actor.imageUrl} alt={actor.name} className="w-10 h-10 rounded-full mr-3 object-cover shadow-sm border border-border-subtle flex-shrink-0"/> :
                        <ActorIcon className="w-10 h-10 text-text-muted mr-3 p-1 border border-border-subtle rounded-full flex-shrink-0"/> 
                        }
                        <div className="min-w-0">
                            <h3 className="text-md font-semibold text-black truncate" title={actor?.name || submission.userName}>{actor?.name || submission.userName}</h3>
                            {assignmentStatus()}
                        </div>
                    </div>
                    <div className="ml-3 text-right min-w-0 overflow-hidden flex-shrink-0">
                        <p className="text-sm text-text-body font-medium truncate" title={fullThemeTitle}>{fullThemeTitle}</p>
                    </div>
                </div>
                <button 
                    type="button" 
                    onClick={() => toggleCardExpansion(submission.id)} 
                    className="absolute left-1/2 transform -translate-x-1/2 bottom-0 translate-y-1/2 z-10 p-1.5 bg-card-bg hover:bg-gray-100 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-link-active focus:ring-offset-1" 
                    aria-expanded={isExpanded} 
                    aria-controls={`submission-details-${submission.id}`}
                    title={isExpanded ? "Recolher detalhes" : "Expandir detalhes"}
                >
                    <ChevronDownIcon className={`w-5 h-5 text-text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {isExpanded && (
                <div id={`submission-details-${submission.id}`} className="p-5 flex-grow">
                    <div className="md:grid md:grid-cols-12 gap-x-6 gap-y-4 items-start">
                        <div className="md:col-span-7 space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                                {renderInfoBlock(<PriceTagIcon className={iconClasses} />, "Plano & Assinatura", 
                                    <> {actor?.activePlan ? PLAN_DETAILS_MAP[actor.activePlan].name : 'N/A'} <span className="block text-xs text-text-muted">({actor?.billingCycle ? BILLING_CYCLE_DISCOUNTS_DETAILS[actor.billingCycle].label.split('(')[0].trim() : 'N/A'})</span> </>, 
                                    "text-text-headings", true
                                )}
                                {renderInfoBlock(<CalendarDaysIcon className={iconClasses} />, "Meses ininterruptos", actor ? getMonthsSince(actor.createdAt) : 'N/A', "text-text-headings", true)}
                                {renderInfoBlock(<InboxArrowDownIcon className={iconClasses} />, "Envios realizados (total)", totalSubmissions, "text-text-headings", true)}
                                {renderInfoBlock(<CheckCircleIcon className={iconClasses} />, "Sessões 1:1 realizadas", completedSessions, "text-text-headings", true)}
                                {renderInfoBlock(<VideoCameraIcon className={iconClasses} />, "Vídeos neste envio", submission.tapeUrls.length, "text-text-headings", true)}
                                {renderInfoBlock(<ClipboardDocumentListIcon className={iconClasses} />, "Envios restantes este mês", remainingSubmissions, remainingSubmissions > 0 ? 'text-status-active-text' : 'text-red-600', true)}
                            </div>
                        </div>

                        <div className="hidden md:block md:col-span-1"><div className="h-full flex justify-center items-center"><div className="w-px bg-border-subtle h-4/5 my-auto"></div></div></div>

                        <div className="md:col-span-4 flex flex-col justify-between mt-4 md:mt-0">
                            <div>
                                <div className={`flex items-start p-2 rounded-lg border shadow-sm mb-3 ${deadlineInfo.isPastDeadline ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-border-subtle'}`}>
                                    <ClockIcon className={`w-6 h-6 mr-2 mt-0.5 flex-shrink-0 ${deadlineInfo.isPastDeadline ? 'text-red-500' : 'text-link-active'}`}/> 
                                    <div>
                                        <p className="text-xs text-text-muted">Prazo para Feedback</p>
                                        <p className={`text-sm font-semibold ${deadlineInfo.isPastDeadline ? 'text-red-600' : 'text-text-headings'}`}>{deadlineInfo.countdownString}</p>
                                        <p className="text-xs text-text-muted">Termina em: {deadlineInfo.deadlineText.split('às')[0]}</p>
                                    </div>
                                </div>
                                <div className="mt-3 p-3 border border-dashed border-gray-300 rounded-md bg-yellow-50">
                                    <h4 className="text-sm font-semibold text-yellow-800 mb-1.5">Boas Práticas de Feedback:</h4>
                                    <ul className="list-disc list-inside space-y-0.5 text-xs text-yellow-700 pl-1">
                                        {feedbackBestPractices.slice(0,3).map((practice, index) => ( <li key={index}>{practice}</li> ))}
                                        <li>(...)</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
             {isExpanded && (
                <div className="p-4 bg-gray-50 border-t border-border-subtle">
                    {isAssignedToSelf && (
                        <Link to={PATHS.TUTOR_GIVE_FEEDBACK.replace(':submissionId', submission.id)} className="w-full block">
                            <Button variant="primary" size="md" className="w-full">Revisar e Dar Feedback</Button>
                        </Link>
                    )}
                    {isInPool && (
                        <Button 
                            variant="secondary" 
                            size="md" 
                            className="w-full" 
                            onClick={() => handleAssignToSelf(submission.id)}
                            isLoading={actionLoading[submission.id]}
                            disabled={!!Object.values(actionLoading).some(Boolean) && !actionLoading[submission.id]}
                        >
                            Assumir Envio
                        </Button>
                    )}
                </div>
            )}
        </Card>
    );
  };

  return (
    <div className="p-0"> 
      <Button variant="ghost" onClick={() => navigate(PATHS.TUTOR_DASHBOARD)} className="mb-6 text-text-muted hover:text-link-active group inline-flex items-center">
        <ArrowLeftIcon className="w-5 h-5 mr-1.5 text-text-muted group-hover:text-link-active transition-colors" /> Voltar ao Painel do Tutor
      </Button>
      <h1 className="text-2xl md:text-3xl font-bold text-black mb-6 md:mb-8">Envios para Feedback</h1>

      {assignedSubmissions.length === 0 && poolSubmissions.length === 0 && (
        <Card className="text-center"> 
          <div className="py-10 md:py-16">
            <AcademicCapIcon className="w-16 h-16 md:w-20 md:h-20 text-text-muted mx-auto mb-4" />
            <h2 className="text-xl md:text-2xl font-semibold text-headings mb-2">Nenhum envio pendente</h2>
            <p className="text-text-body">Bom trabalho! Volte mais tarde para verificar novos envios.</p>
          </div>
        </Card>
      )}
      
      {assignedSubmissions.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-black mb-6 border-b border-border-subtle pb-2">
            <span className="flex items-center">
              <CheckCircleIcon className="w-6 h-6 mr-2 text-green-500" />
              Meus Envios Designados ({assignedSubmissions.length})
            </span>
          </h2>
          <div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {assignedSubmissions.map(sub => renderSubmissionCard(sub, true, false))}
          </div>
        </div>
      )}

      {poolSubmissions.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-black mb-6 border-b border-border-subtle pb-2">
            <span className="flex items-center">
              <InboxArrowDownIcon className="w-6 h-6 mr-2 text-blue-500" />
              Envios Disponíveis no Pool ({poolSubmissions.length})
            </span>
          </h2>
          <div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {poolSubmissions.map(sub => renderSubmissionCard(sub, false, true))}
          </div>
        </div>
      )}
      
      {assignedSubmissions.length === 0 && poolSubmissions.length > 0 && (
         <Card className="text-center mt-12">
            <p className="text-text-body">Não há envios designados diretamente a você. Você pode assumir envios do Pool Geral acima.</p>
        </Card>
      )}
      {assignedSubmissions.length > 0 && poolSubmissions.length === 0 && (
         <Card className="text-center mt-12">
            <p className="text-text-body">Não há mais envios disponíveis no Pool Geral. Continue com seus envios designados!</p>
        </Card>
      )}

    </div>
  );
};

export default TutorReviewSubmissionsPage;

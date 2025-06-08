
import React, { useState, useEffect } from 'react';
import { Card } from '../../components/Common/Card';
import { Button } from '../../components/Common/Button';
import { User, Role, TutorApplicationStatus, Submission, Plan, ActorLevel, Theme } from '../../types';
import { usePlatformUsers } from '../../contexts/UserManagementContext';
import { useSubmissions } from '../../contexts/SubmissionContext';
import { useThemes } from '../../contexts/ThemeContext';
import { useToasts } from '../../contexts/ToastContext';
import { 
    AcademicCapIcon, UserIcon as ActorIcon, ClipboardDocumentListIcon, 
    CalendarDaysIcon, VideoCameraIcon, ClockIcon, PriceTagIcon, 
    InboxArrowDownIcon, CheckCircleIcon, ArrowPathIcon, ChevronDownIcon
} from '../../components/Common/Icons';
import { PLAN_DETAILS_MAP, ACTOR_LEVEL_NAMES } from '../../constants';
import { formatFullDate, getMonthsSince, calculateFeedbackDeadlineInfo, calculateDeadlineTimestamp, formatMonthYear } from '../../utils/dateFormatter'; 
import { useLiveSessions } from '../../contexts/LiveSessionContext';

// Add _renderKey to Submission type for local state effect
type SubmissionWithDetails = Submission & { 
    _renderKey?: number;
    _themeMonth?: number;
    _themeYear?: number;
};


const AssignSubmissionsToTutorsPage: React.FC = () => {
  const { platformUsers, countActorsAssignedToTutor, getUserById: getPlatformUserByIdCtx } = usePlatformUsers();
  const { 
    submissions: allSubmissionsFromCtx, 
    assignTutorToSubmission, 
    getAssignedPendingSubmissions,
    countSubmissionsByActorThisMonth, 
    countSubmissionsByActor,
    countPendingSubmissionsAssignedToTutor
  } = useSubmissions();
  const { getThemeById } = useThemes();
  const { getSessionsForActor } = useLiveSessions();
  const { addToast } = useToasts();

  const [assignedPendingSubmissions, setAssignedPendingSubmissions] = useState<SubmissionWithDetails[]>([]);
  const [unassignedSubmissions, setUnassignedSubmissions] = useState<SubmissionWithDetails[]>([]);
  const [availableTutors, setAvailableTutors] = useState<User[]>([]);
  
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [submissionToAssign, setSubmissionToAssign] = useState<SubmissionWithDetails | null>(null);
  const [tutorSelectedInModal, setTutorSelectedInModal] = useState<string | null>(null);

  const [isLoadingAssignments, setIsLoadingAssignments] = useState<Record<string, boolean>>({});
  const [isLoadingReassignments, setIsLoadingReassignments] = useState<Record<string,boolean>>({});
  
  const [countdownIntervals, setCountownIntervals] = useState<Record<string, number>>({});
  const [expandedCardIds, setExpandedCardIds] = useState<Record<string, boolean>>({});

  const toggleCardExpansion = (submissionId: string) => {
    setExpandedCardIds(prev => ({ ...prev, [submissionId]: !prev[submissionId] }));
  };

  const enrichSubmissionWithThemeDetails = (submission: Submission): SubmissionWithDetails => {
    const actor = platformUsers.find(u => u.id === submission.userId);
    const theme = getThemeById(submission.themeId);
    return {
        ...submission,
        userName: actor?.name || submission.userName || 'Ator Desconhecido',
        userLevel: actor?.actorLevel,
        themeTitle: theme?.title || submission.themeTitle || 'Tema Desconhecido',
        _themeMonth: theme?.month,
        _themeYear: theme?.year,
        deadlineTimestamp: submission.deadlineTimestamp || calculateDeadlineTimestamp(submission.createdAt), 
    };
  };


  useEffect(() => {
    const pendingAssigned = getAssignedPendingSubmissions().map(enrichSubmissionWithThemeDetails);
    setAssignedPendingSubmissions(pendingAssigned);
    
    const unassigned = allSubmissionsFromCtx
        .filter(sub => !sub.assignedTutorId && sub.feedbackStatus === 'PENDING')
        .map(enrichSubmissionWithThemeDetails)
        .sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); 

    setUnassignedSubmissions(unassigned);

  }, [allSubmissionsFromCtx, platformUsers, getThemeById, getAssignedPendingSubmissions]);

  useEffect(() => {
    const tutorsWithDetails = platformUsers
      .filter(u => u.roles.some(r => r.role === Role.TUTOR) && u.isApproved && u.tutorApplicationStatus === TutorApplicationStatus.APPROVED)
      .map(tutor => ({ 
        ...tutor, 
        actorsTutoredCount: countActorsAssignedToTutor(tutor.id),
        pendingFeedbacksCount: countPendingSubmissionsAssignedToTutor(tutor.id),
        monthsAsTutor: getMonthsSince(tutor.createdAt),
        completedFeedbacksCount: tutor.feedbacksSentCount || 0,
      }))
      .sort((a, b) => {
        if (a.pendingFeedbacksCount !== b.pendingFeedbacksCount) {
            return a.pendingFeedbacksCount - b.pendingFeedbacksCount;
        }
        if (a.actorsTutoredCount !== b.actorsTutoredCount) {
            return a.actorsTutoredCount - b.actorsTutoredCount;
        }
        if (b.monthsAsTutor !== a.monthsAsTutor) { // Sort descending by monthsAsTutor
            return b.monthsAsTutor - a.monthsAsTutor;
        }
        return b.completedFeedbacksCount - a.completedFeedbacksCount; // Sort descending by completedFeedbacksCount
    });
    setAvailableTutors(tutorsWithDetails);

  }, [platformUsers, countActorsAssignedToTutor, countPendingSubmissionsAssignedToTutor]);


  const handleOpenAssignModal = (submission: SubmissionWithDetails) => {
    setSubmissionToAssign(submission);
    setTutorSelectedInModal(submission.assignedTutorId || ''); // Pre-select current tutor if any
    setIsAssignModalOpen(true);
  };

  const handleConfirmAssignment = async () => {
    if (!submissionToAssign || tutorSelectedInModal === undefined) return; // tutorSelectedInModal can be null to unassign

    const currentIsLoadingState = submissionToAssign.assignedTutorId ? isLoadingReassignments : isLoadingAssignments;
    const setCurrentIsLoadingState = submissionToAssign.assignedTutorId ? setIsLoadingReassignments : setIsLoadingAssignments;

    setCurrentIsLoadingState(prev => ({ ...prev, [submissionToAssign.id]: true }));

    try {
        await assignTutorToSubmission(submissionToAssign.id, tutorSelectedInModal);
        addToast(`Envio ${submissionToAssign.assignedTutorId && tutorSelectedInModal === null ? 'retornado ao pool' : 
                      submissionToAssign.assignedTutorId ? 'redesignado' : 'designado'} com sucesso!`, 'success');
        
        // The useEffect hook dependent on allSubmissionsFromCtx will handle updating local lists.
        // No need to explicitly setAssignedPendingSubmissions or setUnassignedSubmissions here.

    } catch (e: any) {
        addToast(e.message || 'Falha ao designar envio.', 'error');
    } finally {
        setCurrentIsLoadingState(prev => ({ ...prev, [submissionToAssign.id]: false }));
        setIsAssignModalOpen(false);
        setSubmissionToAssign(null);
        setTutorSelectedInModal(null);
    }
  };
  
  // Countdown effect for both assigned and unassigned submissions
  useEffect(() => {
    const allDisplayableSubmissions = [...assignedPendingSubmissions, ...unassignedSubmissions];
    const newIntervals: Record<string, number> = {};

    allDisplayableSubmissions.forEach(sub => {
      if (sub.createdAt && !sub.feedbackId) { // Only for pending ones
        const deadlineInfo = calculateFeedbackDeadlineInfo(sub.createdAt, sub.deadlineTimestamp || sub._renderKey);
        if (!deadlineInfo.isPastDeadline && !countdownIntervals[sub.id]) {
          const intervalId = window.setInterval(() => {
            // Update renderKey to trigger re-render for countdown
            // For assigned submissions
            setAssignedPendingSubmissions(prevSubs =>
              prevSubs.map(s => (s.id === sub.id ? { ...s, _renderKey: Date.now() } : s))
            );
            // For unassigned submissions
            setUnassignedSubmissions(prevSubs =>
              prevSubs.map(s => (s.id === sub.id ? { ...s, _renderKey: Date.now() } : s))
            );
          }, 60000); // Update every minute
          newIntervals[sub.id] = intervalId;
        } else if (deadlineInfo.isPastDeadline && countdownIntervals[sub.id]) {
          clearInterval(countdownIntervals[sub.id]); // Clear interval if deadline passed
          delete countdownIntervals[sub.id];
        }
      }
    });
  
    setCountownIntervals(prevIntervals => {
        // Clear old intervals not in newIntervals
        Object.keys(prevIntervals).forEach(key => {
            if (!newIntervals[key]) clearInterval(prevIntervals[key]);
        });
        return newIntervals; // Set the new intervals
    });
  
    return () => { // Cleanup on unmount
      Object.values(newIntervals).forEach(clearInterval);
      Object.values(countdownIntervals).forEach(clearInterval); // Also clear existing ones
    };
  }, [assignedPendingSubmissions, unassignedSubmissions]); // Rerun when these lists change

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

  const renderSubmissionCard = (submission: SubmissionWithDetails, isReassigning: boolean = false) => {
    const actor = getPlatformUserByIdCtx(submission.userId) as User | undefined; 
    const assignedTutor = submission.assignedTutorId ? getPlatformUserByIdCtx(submission.assignedTutorId) : null;
    const totalSubmissionsByActor = actor ? countSubmissionsByActor(actor.id) : 0;
    const submissionsThisMonthByActor = actor ? countSubmissionsByActorThisMonth(actor.id) : 0;
    const planLimit = actor?.activePlan ? PLAN_DETAILS_MAP[actor.activePlan].selftapesPerMonth : 0;
    const remainingSubmissionsForActor = Math.max(0, planLimit - submissionsThisMonthByActor);
    const completedSessionsByActor = actor ? getSessionsForActor(actor.id).filter(s => s.status === 'COMPLETED').length : 0;
    const deadlineInfo = calculateFeedbackDeadlineInfo(submission.createdAt, submission.deadlineTimestamp || submission._renderKey);
    const themeDateDisplay = formatMonthYear(submission._themeMonth, submission._themeYear);
    const fullThemeTitle = `${submission.themeTitle}${themeDateDisplay ? ` (${themeDateDisplay})` : ''}`;
    const isLoading = isReassigning ? isLoadingReassignments[submission.id] : isLoadingAssignments[submission.id];
    const iconClasses = "w-full h-full text-link-active";
    const isExpanded = !!expandedCardIds[submission.id];

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
                            {submission.assignedTutorId ? (
                                <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                                    Designado para: {assignedTutor?.name || 'Tutor Desconhecido'}
                                </span>
                            ) : (
                                <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full font-medium">Não designado</span>
                            )}
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
                                {renderInfoBlock(<ActorIcon className={iconClasses} />, "Nível do Ator", actor?.actorLevel ? ACTOR_LEVEL_NAMES[actor.actorLevel] : 'N/A', "text-text-headings", true)}
                                {renderInfoBlock(<CalendarDaysIcon className={iconClasses} />, "Membro há", actor ? getMonthsSince(actor.createdAt) + " meses" : 'N/A', "text-text-headings", true)}
                                {renderInfoBlock(<PriceTagIcon className={iconClasses} />, "Plano", actor?.activePlan ? PLAN_DETAILS_MAP[actor.activePlan].name : 'N/A', "text-text-headings", true)}
                                {renderInfoBlock(<ArrowPathIcon className={iconClasses} />, "Envios Totais", totalSubmissionsByActor, "text-text-headings", true)}
                                {renderInfoBlock(<InboxArrowDownIcon className={iconClasses} />, "Envios este Mês", submissionsThisMonthByActor, "text-text-headings", true)}
                                {renderInfoBlock(<VideoCameraIcon className={iconClasses} />, "Vídeos neste envio", submission.tapeUrls.length, "text-text-headings", true)}
                                {renderInfoBlock(<CheckCircleIcon className={iconClasses} />, "Sessões 1:1 Concluídas", completedSessionsByActor, "text-text-headings", true)}
                                {renderInfoBlock(<ClipboardDocumentListIcon className={iconClasses} />, "Envios Restantes", remainingSubmissionsForActor, remainingSubmissionsForActor > 0 ? 'text-status-active-text' : 'text-red-600', true)}
                            </div>
                        </div>

                         <div className="hidden md:block md:col-span-1"><div className="h-full flex justify-center items-center"><div className="w-px bg-border-subtle h-4/5 my-auto"></div></div></div>

                        <div className="md:col-span-4 flex flex-col justify-between mt-4 md:mt-0">
                             <div className={`flex items-start p-2 rounded-lg border shadow-sm mb-3 ${deadlineInfo.isPastDeadline ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-border-subtle'}`}>
                                <ClockIcon className={`w-6 h-6 mr-2 mt-0.5 flex-shrink-0 ${deadlineInfo.isPastDeadline ? 'text-red-500' : 'text-link-active'}`}/> 
                                <div>
                                    <p className="text-xs text-text-muted">Prazo para Feedback</p>
                                    <p className={`text-sm font-semibold ${deadlineInfo.isPastDeadline ? 'text-red-600' : 'text-text-headings'}`}>{deadlineInfo.countdownString}</p>
                                    <p className="text-xs text-text-muted">Termina em: {deadlineInfo.deadlineText.split('às')[0]}</p>
                                </div>
                            </div>
                            <Button 
                                variant="secondary" 
                                size="md" 
                                className="w-full" 
                                onClick={() => handleOpenAssignModal(submission)}
                                isLoading={isLoading}
                                disabled={!!Object.values(isLoadingAssignments).some(Boolean) && !isLoadingAssignments[submission.id] || !!Object.values(isLoadingReassignments).some(Boolean) && !isLoadingReassignments[submission.id]}
                            >
                                {isReassigning ? 'Redesignar Tutor' : 'Designar Tutor'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
  };
  

  return (
    <div className="p-0">
        <h1 className="text-2xl md:text-3xl font-bold text-black mb-6 md:mb-8">Atribuição de Envios a Tutores</h1>

        {isAssignModalOpen && submissionToAssign && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                <Card title={`Designar Tutor para Envio de ${submissionToAssign.userName}`} className="bg-card-bg w-full max-w-md">
                    <p className="text-text-body mb-1">Tema: {submissionToAssign.themeTitle}</p>
                    <p className="text-text-muted text-sm mb-4">Enviado em: {formatFullDate(submissionToAssign.createdAt)}</p>
                    
                    <label htmlFor="tutorSelect" className="block text-sm font-medium text-text-body mb-1">Selecione o Tutor:</label>
                    <select 
                        id="tutorSelect"
                        value={tutorSelectedInModal || ''}
                        onChange={(e) => setTutorSelectedInModal(e.target.value === "null" ? null : e.target.value)}
                        className="w-full p-2.5 border border-border-subtle rounded-lg bg-card-bg text-text-body focus:ring-link-active focus:border-link-active mb-4"
                    >
                        <option value="" disabled>Selecione um tutor</option>
                        {submissionToAssign.assignedTutorId && <option value="null">-- Retornar ao Pool (Não Designado) --</option>}
                        {availableTutors.map(tutor => (
                            <option key={tutor.id} value={tutor.id}>
                                {tutor.name} (Pendentes: { (tutor as any).pendingFeedbacksCount ?? countPendingSubmissionsAssignedToTutor(tutor.id)}, Tutorados: {(tutor as any).actorsTutoredCount ?? countActorsAssignedToTutor(tutor.id)})
                            </option>
                        ))}
                    </select>
                    <div className="flex justify-end space-x-3">
                        <Button variant="outline" onClick={() => setIsAssignModalOpen(false)}>Cancelar</Button>
                        <Button variant="primary" onClick={handleConfirmAssignment} isLoading={isLoadingAssignments[submissionToAssign.id] || isLoadingReassignments[submissionToAssign.id]}>
                            Confirmar Designação
                        </Button>
                    </div>
                </Card>
            </div>
        )}


        <section className="mb-10">
            <h2 className="text-xl font-semibold text-black mb-4 border-b border-border-subtle pb-2">
                <span className="flex items-center"><InboxArrowDownIcon className="w-6 h-6 mr-2 text-yellow-500" /> Envios Não Designados ({unassignedSubmissions.length})</span>
            </h2>
            {unassignedSubmissions.length > 0 ? (
                <div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {unassignedSubmissions.map(sub => renderSubmissionCard(sub, false))}
                </div>
            ) : (
                <Card><p className="text-text-body text-center py-4">Nenhum envio aguardando designação no momento.</p></Card>
            )}
        </section>

        <section>
            <h2 className="text-xl font-semibold text-black mb-4 border-b border-border-subtle pb-2">
                 <span className="flex items-center"><CheckCircleIcon className="w-6 h-6 mr-2 text-green-500" /> Envios Designados Pendentes ({assignedPendingSubmissions.length})</span>
            </h2>
            {assignedPendingSubmissions.length > 0 ? (
                <div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {assignedPendingSubmissions.map(sub => renderSubmissionCard(sub, true))}
                </div>
            ) : (
                <Card><p className="text-text-body text-center py-4">Nenhum envio designado com feedback pendente.</p></Card>
            )}
        </section>
    </div>
  );
};

export default AssignSubmissionsToTutorsPage;

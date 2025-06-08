
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../../components/Common/Card';
import { Button } from '../../components/Common/Button';
import { User, Role, TutorApplicationStatus } from '../../types';
import { usePlatformUsers } from '../../contexts/UserManagementContext';
import { useSubmissions } from '../../contexts/SubmissionContext';
import { useToasts } from '../../contexts/ToastContext';
import { AcademicCapIcon, CheckCircleIcon, XCircleIcon, CalendarDaysIcon, EyeIcon, InboxArrowDownIcon, InformationCircleIcon, VideoCameraIcon, ChevronDownIcon } from '../../components/Common/Icons';
import { ROLE_NAMES, PATHS, EDUCATION_LEVEL_NAMES } from '../../constants'; // MOCK_ASSETS_URL removed
import { formatFullDate, getMonthsSince, calculateAge } from '../../utils/dateFormatter';

type ActiveTab = 'active' | 'observation' | 'candidates' | 'inactive';

const ManageTutorsPage: React.FC = () => {
  const { platformUsers, toggleUserApproval, updateTutorApplicationStatus, countActorsAssignedToTutor, getUserById } = usePlatformUsers();
  const { countPendingSubmissionsAssignedToTutor } = useSubmissions();
  const { addToast } = useToasts();
  const navigate = useNavigate();

  const [tutors, setTutors] = useState<User[]>([]);
  const [activeTutorTab, setActiveTutorTab] = useState<ActiveTab>('active');
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [expandedCardIds, setExpandedCardIds] = useState<Record<string, boolean>>({});

  const toggleCardExpansion = (tutorId: string) => {
    setExpandedCardIds(prev => ({ ...prev, [tutorId]: !prev[tutorId] }));
  };

  useEffect(() => {
    const allTutors = platformUsers.filter(u => u.roles.some(r => r.role === Role.TUTOR));
    setTutors(allTutors.map(t => ({
        ...t, 
        actorsTutoredCount: countActorsAssignedToTutor(t.id),
    })));
  }, [platformUsers, countActorsAssignedToTutor]);

  const filteredTutors = tutors.filter(tutor => {
    if (activeTutorTab === 'active') return tutor.isApproved === true && tutor.tutorApplicationStatus === TutorApplicationStatus.APPROVED;
    if (activeTutorTab === 'observation') return tutor.tutorApplicationStatus === TutorApplicationStatus.OBSERVATION;
    if (activeTutorTab === 'candidates') return tutor.tutorApplicationStatus === TutorApplicationStatus.PENDING_REVIEW;
    if (activeTutorTab === 'inactive') return tutor.tutorApplicationStatus === TutorApplicationStatus.REJECTED || (tutor.tutorApplicationStatus === TutorApplicationStatus.APPROVED && tutor.isApproved === false);
    return false;
  }).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  
  const handleAction = async (
    tutorId: string, 
    action: 'approve' | 'reject' | 'observe' | 'deactivate' | 'reactivate' | 'reopen_pending' | 'reopen_observe'
  ) => {
    setActionLoading(prev => ({ ...prev, [tutorId + action]: true }));
    const tutor = tutors.find(t => t.id === tutorId);
    if (!tutor) {
        addToast("Tutor não encontrado.", "error");
        setActionLoading(prev => ({ ...prev, [tutorId + action]: false }));
        return;
    }

    try {
        await new Promise(resolve => setTimeout(resolve, 500)); 
        let toastMessage = '';

        switch (action) {
            case 'approve':
                updateTutorApplicationStatus(tutorId, TutorApplicationStatus.APPROVED);
                toastMessage = `Candidatura de ${tutor.name || 'Tutor'} aprovada e acesso concedido.`;
                break;
            case 'reject':
                updateTutorApplicationStatus(tutorId, TutorApplicationStatus.REJECTED);
                toastMessage = `Candidatura de ${tutor.name || 'Tutor'} rejeitada.`;
                break;
            case 'observe':
                updateTutorApplicationStatus(tutorId, TutorApplicationStatus.OBSERVATION);
                toastMessage = `${tutor.name || 'Tutor'} movido para observação.`;
                break;
            case 'deactivate':
                if (tutor.tutorApplicationStatus === TutorApplicationStatus.APPROVED && tutor.isApproved) {
                    toggleUserApproval(tutorId); 
                    toastMessage = `Acesso de ${tutor.name || 'Tutor'} desativado.`;
                } else { 
                    toastMessage = `Ação inválida: ${tutor.name || 'Tutor'} não está ativo ou aprovado.`; 
                }
                break;
            case 'reactivate':
                if (tutor.tutorApplicationStatus === TutorApplicationStatus.APPROVED && !tutor.isApproved) {
                    toggleUserApproval(tutorId); 
                    toastMessage = `Acesso de ${tutor.name || 'Tutor'} reativado.`;
                } else { 
                    toastMessage = `Ação inválida: ${tutor.name || 'Tutor'} já está ativo ou não tem candidatura aprovada.`; 
                }
                break;
            case 'reopen_pending':
                 updateTutorApplicationStatus(tutorId, TutorApplicationStatus.PENDING_REVIEW);
                 toastMessage = `Candidatura de ${tutor.name || 'Tutor'} reaberta para avaliação.`;
                 break;
            case 'reopen_observe':
                 updateTutorApplicationStatus(tutorId, TutorApplicationStatus.OBSERVATION);
                 toastMessage = `Candidatura de ${tutor.name || 'Tutor'} movida para observação.`;
                 break;
            default:
                toastMessage = 'Ação desconhecida.';
        }
        
        if (toastMessage !== 'Ação inválida.' && toastMessage !== 'Ação desconhecida.') {
            addToast(toastMessage, 'success');
        } else if (toastMessage === 'Ação inválida.') {
            addToast(toastMessage, 'info');
        }

    } catch (e: any) {
        addToast(e.message || `Falha ao executar ação '${action}' no tutor.`, 'error');
    } finally {
        setActionLoading(prev => ({ ...prev, [tutorId + action]: false }));
        // Removed manual update of local 'tutors' state.
        // The useEffect hook monitoring 'platformUsers' will handle refreshing the list.
    }
  };

  const TutorTabButton: React.FC<{tab: ActiveTab, label: string, count: number}> = ({tab, label, count}) => (
    <Button
        variant={activeTutorTab === tab ? 'primary' : 'outline'}
        onClick={() => setActiveTutorTab(tab)}
        className="flex-grow sm:flex-grow-0 rounded-md"
        size="sm"
        disabled={!!Object.values(actionLoading).some(Boolean)}
    >
        {label} ({count})
    </Button>
  );

  const getStatusTagDisplay = (status: TutorApplicationStatus | undefined, isApproved?: boolean): { text: string; className: string } => {
    if (status === TutorApplicationStatus.APPROVED && !isApproved) {
      return { text: 'Desativado', className: 'bg-orange-100 text-orange-700'}; 
    }
    switch (status) {
        case TutorApplicationStatus.APPROVED:
            return { text: ROLE_NAMES[TutorApplicationStatus.APPROVED], className: 'bg-status-active-bg text-status-active-text' };
        case TutorApplicationStatus.PENDING_REVIEW:
            return { text: ROLE_NAMES[TutorApplicationStatus.PENDING_REVIEW], className: 'bg-yellow-100 text-yellow-700' };
        case TutorApplicationStatus.OBSERVATION:
            return { text: ROLE_NAMES[TutorApplicationStatus.OBSERVATION], className: 'bg-blue-100 text-blue-700' };
        case TutorApplicationStatus.REJECTED:
            return { text: ROLE_NAMES[TutorApplicationStatus.REJECTED], className: 'bg-red-100 text-red-700' };
        default:
            return { text: 'N/A', className: 'bg-gray-100 text-gray-700' };
    }
  };

  const renderTutorCard = (tutor: User) => {
    const statusDisplay = getStatusTagDisplay(tutor.tutorApplicationStatus, tutor.isApproved);
    const isAnyActionLoadingForThisTutor = Object.keys(actionLoading).some(key => key.startsWith(tutor.id) && actionLoading[key]);
    const pendingSubmissionsCount = countPendingSubmissionsAssignedToTutor(tutor.id);
    const isExpanded = !!expandedCardIds[tutor.id];
    const tutorImage = tutor.imageUrl || `/placeholder-images/profile-tutor-default-${tutor.id.substring(0,5)}-80x80.jpg`;


    return (
    <Card key={tutor.id} className="p-0 overflow-visible shadow-md flex flex-col">
      {/* Header - Always Visible */}
      <div className="relative px-4 py-3 border-b border-border-subtle">
        <div className="flex items-start space-x-4">
          <img 
            src={tutorImage} 
            alt={tutor.name} 
            className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
          />
          <div className="flex-1 min-w-0"> 
            <h3 className="text-lg font-bold text-black truncate" title={tutor.name}>{tutor.name}</h3>
             <span className={`text-xs font-semibold rounded-full px-2 py-0.5 ${statusDisplay.className}`}>
                {statusDisplay.text}
            </span>
            {!isExpanded && (
                <div className="mt-1 space-y-0.5 text-xs">
                    <p><span className="text-text-muted">Idade: </span><span className="font-semibold text-text-body">{calculateAge(tutor.dateOfBirth)} anos</span></p>
                    <p><span className="text-text-muted">Escolaridade: </span><span className="font-semibold text-text-body">{tutor.educationLevel ? EDUCATION_LEVEL_NAMES[tutor.educationLevel] : "N/A"}</span></p>
                    <p><span className="text-text-muted">Técnica Base: </span><span className="font-semibold text-text-body truncate" title={tutor.baseTechnique === 'Outra' && tutor.otherTechnique ? tutor.otherTechnique : tutor.baseTechnique || "N/A"}>{tutor.baseTechnique === 'Outra' && tutor.otherTechnique ? tutor.otherTechnique : tutor.baseTechnique || "N/A"}</span></p>
                </div>
            )}
          </div>
        </div>
        <button 
            type="button" 
            onClick={() => toggleCardExpansion(tutor.id)} 
            className="absolute left-1/2 transform -translate-x-1/2 bottom-0 translate-y-1/2 z-10 p-1.5 bg-card-bg hover:bg-gray-100 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-link-active focus:ring-offset-1" 
            aria-expanded={isExpanded} 
            aria-controls={`tutor-details-${tutor.id}`}
            title={isExpanded ? "Recolher detalhes" : "Expandir detalhes"}
        >
            <ChevronDownIcon className={`w-5 h-5 text-text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Collapsible Details */}
      {isExpanded && (
        <div id={`tutor-details-${tutor.id}`} className="px-4 pb-4 pt-5"> {/* pt-5 to clear the arrow */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-2 mt-0 text-xs"> {/* mt-0 here */}
                <p><span className="text-text-muted">Idade: </span><span className="font-semibold text-text-body">{calculateAge(tutor.dateOfBirth)} anos</span></p>
                <p><span className="text-text-muted">Escolaridade: </span><span className="font-semibold text-text-body">{tutor.educationLevel ? EDUCATION_LEVEL_NAMES[tutor.educationLevel] : "N/A"}</span></p>
                <p className="col-span-2"><span className="text-text-muted">Técnica Base: </span><span className="font-semibold text-text-body truncate" title={tutor.baseTechnique === 'Outra' && tutor.otherTechnique ? tutor.otherTechnique : tutor.baseTechnique || "N/A"}>{tutor.baseTechnique === 'Outra' && tutor.otherTechnique ? tutor.otherTechnique : tutor.baseTechnique || "N/A"}</span></p>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-2 mt-3 text-xs"> 
                {renderInfoBlock(<CalendarDaysIcon className="w-full h-full text-link-active"/>, "Tutoria desde", getMonthsSince(tutor.createdAt) + " meses")}
                {renderInfoBlock(<VideoCameraIcon className="w-full h-full text-link-active"/>, "Feedbacks Enviados", tutor.feedbacksSentCount || 0)}
                {renderInfoBlock(<InboxArrowDownIcon className="w-full h-full text-link-active"/>, "Análises Pendentes", pendingSubmissionsCount)}
                {renderInfoBlock(tutor.isApproved ? <CheckCircleIcon className="w-full h-full text-green-500"/> : <XCircleIcon className="w-full h-full text-red-500"/>, "Acesso Plataforma", tutor.isApproved ? "Ativo" : "Inativo", tutor.isApproved ? 'text-green-600' : 'text-red-600')}
            </div>
            <div className="mt-4 pt-3 border-t border-border-subtle flex flex-col sm:flex-row sm:flex-wrap gap-2 justify-end">
                <Link to={PATHS.ADMIN_TUTOR_REVIEW_APP.replace(':tutorId', tutor.id)} className="w-full sm:w-auto">
                    <Button variant="outline" size="sm" leftIcon={<EyeIcon className="w-4 h-4"/>} className="w-full" disabled={isAnyActionLoadingForThisTutor}>Ver Dossiê</Button>
                </Link>
                
                {activeTutorTab === 'active' && (
                    <Button variant="danger" size="sm" onClick={() => handleAction(tutor.id, 'deactivate')} isLoading={actionLoading[`${tutor.id}deactivate`]} disabled={isAnyActionLoadingForThisTutor} className="w-full sm:w-auto">
                        Desativar
                    </Button>
                )}

                {activeTutorTab === 'observation' && (
                    <>
                        <Button variant="primary" size="sm" onClick={() => handleAction(tutor.id, 'approve')} isLoading={actionLoading[`${tutor.id}approve`]} disabled={isAnyActionLoadingForThisTutor} className="w-full sm:w-auto">
                            Aprovar
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleAction(tutor.id, 'reject')} isLoading={actionLoading[`${tutor.id}reject`]} disabled={isAnyActionLoadingForThisTutor} className="w-full sm:w-auto">
                            Rejeitar
                        </Button>
                    </>
                )}

                {activeTutorTab === 'candidates' && (
                    <>
                        <Button variant="primary" size="sm" onClick={() => handleAction(tutor.id, 'approve')} isLoading={actionLoading[`${tutor.id}approve`]} disabled={isAnyActionLoadingForThisTutor} className="w-full sm:w-auto">
                            Aprovar
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => handleAction(tutor.id, 'observe')} isLoading={actionLoading[`${tutor.id}observe`]} disabled={isAnyActionLoadingForThisTutor} className="w-full sm:w-auto">
                            Mover para Observação
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleAction(tutor.id, 'reject')} isLoading={actionLoading[`${tutor.id}reject`]} disabled={isAnyActionLoadingForThisTutor} className="w-full sm:w-auto">
                            Rejeitar
                        </Button>
                    </>
                )}
                
                {activeTutorTab === 'inactive' && (
                    <>
                        {tutor.tutorApplicationStatus === TutorApplicationStatus.APPROVED && !tutor.isApproved && ( 
                            <Button variant="secondary" size="sm" onClick={() => handleAction(tutor.id, 'reactivate')} isLoading={actionLoading[`${tutor.id}reactivate`]} disabled={isAnyActionLoadingForThisTutor} className="w-full sm:w-auto">
                                Reativar Acesso
                            </Button>
                        )}
                        {tutor.tutorApplicationStatus === TutorApplicationStatus.REJECTED && (
                            <>
                                <Button variant="outline" size="sm" onClick={() => handleAction(tutor.id, 'reopen_pending')} isLoading={actionLoading[`${tutor.id}reopen_pending`]} disabled={isAnyActionLoadingForThisTutor} className="w-full sm:w-auto">
                                    Reabrir para Avaliação
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleAction(tutor.id, 'reopen_observe')} isLoading={actionLoading[`${tutor.id}reopen_observe`]} disabled={isAnyActionLoadingForThisTutor} className="w-full sm:w-auto">
                                    Mover para Observação
                                </Button>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
      )}
    </Card>
  )};
  
  const renderInfoBlock = (iconElement: JSX.Element, label: string, value: string | number, valueClassName: string = "text-text-headings") => (
    <div className="flex items-start p-2 bg-gray-50 rounded-md border border-border-subtle shadow-sm">
      <div className="mr-2 mt-0.5 flex-shrink-0 flex items-center justify-center w-5 h-5">
        {iconElement}
      </div>
      <div className="min-w-0 flex-1"> 
        <p className="text-xs text-text-muted mb-0 truncate">{label}</p>
        <p className={`text-sm font-semibold ${valueClassName} truncate`}>{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 p-0">
      <h1 className="text-2xl md:text-3xl font-bold text-black">Gerenciamento de Tutores</h1>

      <Card title="Status dos Tutores" className="bg-card-bg p-0">
        <div className="p-4 border-b border-border-subtle">
            <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                <TutorTabButton tab="active" label="Tutores Ativos" count={tutors.filter(t => t.isApproved === true && t.tutorApplicationStatus === TutorApplicationStatus.APPROVED).length} />
                <TutorTabButton tab="observation" label="Em Observação" count={tutors.filter(t => t.tutorApplicationStatus === TutorApplicationStatus.OBSERVATION).length} />
                <TutorTabButton tab="candidates" label="Candidaturas" count={tutors.filter(t => t.tutorApplicationStatus === TutorApplicationStatus.PENDING_REVIEW).length} />
                <TutorTabButton tab="inactive" label="Inativos/Rejeitados" count={tutors.filter(t => t.tutorApplicationStatus === TutorApplicationStatus.REJECTED || (t.tutorApplicationStatus === TutorApplicationStatus.APPROVED && t.isApproved === false)).length} />
            </div>
        </div>
        <div className="p-4">
            {filteredTutors.length === 0 ? (
            <p className="text-text-body text-center py-4">Nenhum tutor encontrado para esta categoria.</p>
            ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTutors.map(tutor => renderTutorCard(tutor))}
            </div>
            )}
        </div>
      </Card>
    </div>
  );
};

export default ManageTutorsPage;

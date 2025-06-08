
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { usePlatformUsers } from '../../contexts/UserManagementContext';
import { User, Role, TutorApplicationStatus, Feedback, Submission, Theme } from '../../types';
import { Card } from '../../components/Common/Card';
import { Button } from '../../components/Common/Button';
import { 
    ArrowLeftIcon, UserIcon as ProfileIcon, CalendarDaysIcon, GlobeAltIcon, 
    AcademicCapIcon, SparklesIcon, ArrowPathIcon as ExperienceIcon, 
    CheckCircleIcon, XCircleIcon, InformationCircleIcon, ClipboardCheckIcon, VideoCameraIcon
} from '../../components/Common/Icons';
import { PATHS, ROLE_NAMES, TECHNIQUE_OPTIONS, EDUCATION_LEVEL_NAMES } from '../../constants'; // MOCK_ASSETS_URL removed
import { calculateAge, formatFullDate, getMonthsSince, formatMonthYear } from '../../utils/dateFormatter';
import { useToasts } from '../../contexts/ToastContext';
import { useSubmissions } from '../../contexts/SubmissionContext';
import { useThemes } from '../../contexts/ThemeContext';

type EnrichedFeedback = Feedback & {
    submissionDetails?: Submission;
    themeDetails?: Theme;
    actorDetails?: User;
};

const AdminTutorReviewPage: React.FC = () => {
  const { tutorId } = useParams<{ tutorId: string }>();
  const { getUserById, updateTutorApplicationStatus, toggleUserApproval } = usePlatformUsers();
  const { feedbacks: allFeedbacks, getSubmissionById } = useSubmissions();
  const { getThemeById } = useThemes();
  const { addToast } = useToasts();
  const navigate = useNavigate();
  
  const [tutor, setTutor] = useState<User | null>(null);
  const [tutorFeedbacksHistory, setTutorFeedbacksHistory] = useState<EnrichedFeedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null); 

  useEffect(() => {
    setIsLoading(true);
    if (tutorId) {
      const foundTutor = getUserById(tutorId);
      if (foundTutor && foundTutor.roles.some(r => r.role === Role.TUTOR)) {
        setTutor(foundTutor);

        const feedbacksByThisTutor = allFeedbacks.filter(fb => fb.tutorId === tutorId);
        const enrichedHistory = feedbacksByThisTutor.map(fb => {
          const submissionDetails = getSubmissionById(fb.submissionId);
          const themeDetails = submissionDetails ? getThemeById(submissionDetails.themeId) : undefined;
          const actorDetails = submissionDetails ? getUserById(submissionDetails.userId) : undefined; // Actor from submission
          return { ...fb, submissionDetails, themeDetails, actorDetails };
        });
        setTutorFeedbacksHistory(enrichedHistory.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

      } else {
        setTutor(null);
        setTutorFeedbacksHistory([]);
        addToast("Candidato a tutor não encontrado.", 'error');
      }
    }
    setIsLoading(false);
  }, [tutorId, getUserById, addToast, allFeedbacks, getSubmissionById, getThemeById]);

  const handleStatusUpdate = async (newAppStatus: TutorApplicationStatus, newIsApproved?: boolean, actionName?: string) => {
    if (!tutor) return;
    setActionLoading(actionName || newAppStatus.toString());
    
    try {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (tutor.tutorApplicationStatus !== newAppStatus) {
            updateTutorApplicationStatus(tutor.id, newAppStatus);
        }

        if (newIsApproved !== undefined && tutor.isApproved !== newIsApproved) {
             if ( (newIsApproved && !tutor.isApproved) || (!newIsApproved && tutor.isApproved) ) {
                toggleUserApproval(tutor.id);
             }
        }
        
        const statusMessage = actionName === 'desativar' || actionName === 'grantAccess'
          ? `Acesso de ${tutor.name} ${newIsApproved ? 'concedido' : 'desativado'}.`
          : `Status de ${tutor.name} atualizado para ${ROLE_NAMES[newAppStatus]}.`;
        
        addToast(statusMessage, 'success');
    } catch (e: any) {
        addToast(e.message || 'Falha ao atualizar status do tutor.', 'error');
    } finally {
        setActionLoading(null);
        if (tutorId) {
            const refreshedTutor = getUserById(tutorId);
            if (refreshedTutor) setTutor(refreshedTutor);
        }
    }
  };


  if (isLoading) {
    return <div className="text-center p-10 text-text-body">Carregando candidatura do tutor...</div>;
  }

  if (!tutor) {
    return (
      <div className="text-center p-10">
        <p className="text-red-500 text-xl">Candidatura não encontrada.</p>
        <Button onClick={() => navigate(PATHS.ADMIN_MANAGE_TUTORS)} className="mt-4">Voltar</Button>
      </div>
    );
  }
  
  const DetailItem: React.FC<{ icon: React.ReactNode; label: string; value?: string | number | null; children?: React.ReactNode }> = ({ icon, label, value, children }) => (
    <div className="flex items-start py-3 border-b border-border-subtle last:border-b-0">
      <div className="flex-shrink-0 w-6 h-6 mr-3 text-link-active flex items-center justify-center">{icon}</div>
      <div>
        <p className="text-xs font-medium text-text-muted uppercase tracking-wider">{label}</p>
        {value !== undefined && value !== null && <p className="text-md text-text-headings font-medium">{String(value)}</p>}
        {children && <div className="text-md text-text-body mt-0.5 whitespace-pre-wrap">{children}</div>}
      </div>
    </div>
  );

  const SectionCard: React.FC<{ title: string; children: React.ReactNode; icon?: React.ReactNode }> = ({ title, children, icon }) => (
    <Card className="p-0"> {/* Removed mb-6 from here, parent div will handle spacing */}
        <div className={`px-5 py-3 border-b border-border-subtle flex items-center`}>
            {icon && <div className="mr-2 text-link-active">{icon}</div>}
            <h3 className="font-semibold text-black">{title}</h3>
        </div>
        <div className="p-5 space-y-1">
            {children}
        </div>
    </Card>
  );
  const tutorImage = tutor.imageUrl || `/placeholder-images/profile-tutor-default-${tutor.id.substring(0,5)}-200x200.jpg`;

  return (
    <div className="space-y-8"> {/* Added space-y-8 for consistent spacing between sections */}
      <Button 
        variant="ghost" 
        onClick={() => navigate(PATHS.ADMIN_MANAGE_TUTORS)} 
        className="mb-0 text-text-muted hover:text-link-active group" /* mb-6 removed, spacing handled by parent */
        disabled={!!actionLoading}
      >
        <ArrowLeftIcon className="w-5 h-5 mr-1.5 text-text-muted group-hover:text-link-active transition-colors" /> Voltar para Gerenciar Tutores
      </Button>

      <Card title={`Dossiê do Tutor: ${tutor.name}`}> {/* mb-8 removed */}
        <div className="grid md:grid-cols-3 gap-6 p-5">
          <div className="md:col-span-1 flex flex-col items-center">
            <img 
              src={tutorImage} 
              alt={tutor.name} 
              className="w-40 h-40 rounded-full object-cover border-4 border-card-bg shadow-lg mb-4"
            />
            <p className="text-xl font-bold text-black">{tutor.name}</p>
            <p className="text-sm text-text-muted">{tutor.email}</p>
            
            <p className={`mt-2 px-3 py-1 text-xs font-semibold rounded-full 
                ${tutor.tutorApplicationStatus === TutorApplicationStatus.APPROVED ? 'bg-status-active-bg text-status-active-text' : 
                 tutor.tutorApplicationStatus === TutorApplicationStatus.PENDING_REVIEW ? 'bg-yellow-100 text-yellow-700' : 
                 tutor.tutorApplicationStatus === TutorApplicationStatus.OBSERVATION ? 'bg-blue-100 text-blue-700' : 
                 'bg-red-100 text-red-700'}`}>
                Status: {ROLE_NAMES[tutor.tutorApplicationStatus!] || tutor.tutorApplicationStatus || 'N/A'}
            </p>
            <p className={`mt-1 px-3 py-1 text-xs font-semibold rounded-full ${tutor.isApproved ? 'bg-status-active-bg text-status-active-text' : 'bg-status-inactive-bg text-status-inactive-text'}`}>
                Acesso: {tutor.isApproved ? 'Ativo' : 'Inativo'}
            </p>
          </div>

          <div className="md:col-span-2 space-y-0">
            <DetailItem icon={<CalendarDaysIcon className="w-5 h-5"/>} label="Data de Nascimento" value={tutor.dateOfBirth ? formatFullDate(tutor.dateOfBirth) : "Não informada"} />
            <DetailItem icon={<CalendarDaysIcon className="w-5 h-5"/>} label="Idade" value={`${calculateAge(tutor.dateOfBirth)} anos`} />
            {tutor.educationLevel && (
                 <DetailItem icon={<AcademicCapIcon className="w-5 h-5"/>} label="Escolaridade" value={EDUCATION_LEVEL_NAMES[tutor.educationLevel]} />
            )}
            <DetailItem icon={<ProfileIcon className="w-5 h-5"/>} label="Telefone" value={tutor.phone || "Não informado"} />
            {tutor.hasNoSocialMedia ? (
                 <DetailItem icon={<GlobeAltIcon className="w-5 h-5"/>} label="Redes Sociais" value="Não possui / Não informou" />
            ) : tutor.socialMediaLinks && tutor.socialMediaLinks.length > 0 && tutor.socialMediaLinks.some(l => l.url) ? (
              <DetailItem icon={<GlobeAltIcon className="w-5 h-5"/>} label="Redes Sociais">
                <ul className="space-y-1">{tutor.socialMediaLinks.filter(link => link.url).map((link, index) => (<li key={index}><a href={link.url} target="_blank" rel="noopener noreferrer" className="text-link-active hover:underline">{link.platform}: {link.url}</a></li>))}</ul>
              </DetailItem>
            ) : ( <DetailItem icon={<GlobeAltIcon className="w-5 h-5"/>} label="Redes Sociais" value="Nenhuma informada" /> )}
            <DetailItem icon={<AcademicCapIcon className="w-5 h-5"/>} label="Técnica Base Principal" value={tutor.baseTechnique === 'Outra' && tutor.otherTechnique ? tutor.otherTechnique : tutor.baseTechnique || "Não informada"} />
          </div>
        </div>
      </Card>
      
      <div className="space-y-8"> {/* Wrapper for SectionCards for spacing */}
        <SectionCard title="Por que se juntar à CENA?">
            <p className="text-text-body whitespace-pre-wrap p-1">{tutor.whyJoinCena || "Não informado."}</p>
        </SectionCard>
        <SectionCard title="Experiências Formativas">
             <p className="text-text-body whitespace-pre-wrap p-1">{tutor.formativeExperiences || "Não informado."}</p>
        </SectionCard>
        <SectionCard title="Experiências Profissionais">
            <p className="text-text-body whitespace-pre-wrap p-1">{tutor.professionalExperiences || "Não informado."}</p>
        </SectionCard>
      </div>

      <SectionCard title="Histórico de Feedbacks Fornecidos" icon={<ClipboardCheckIcon className="w-5 h-5" />}>
        {tutorFeedbacksHistory.length > 0 ? (
          <div className="space-y-4">
            {tutorFeedbacksHistory.map(fb => (
              <Card key={fb.id} className="bg-gray-50 p-0">
                <div className="p-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-2">
                    <h4 className="font-semibold text-md text-black mb-1 sm:mb-0">
                      Feedback para: {fb.actorDetails?.name || fb.actorName}
                      <span className="block text-xs text-text-muted">
                        Tema: {fb.themeDetails?.title || fb.submissionDetails?.themeTitle}
                        {fb.themeDetails && (
                          <span className="text-xs text-text-muted ml-1 bg-gray-200 px-1.5 py-0.5 rounded-full">
                            ({formatMonthYear(fb.themeDetails.month, fb.themeDetails.year)})
                          </span>
                        )}
                      </span>
                    </h4>
                  </div>
                  <p className="text-xs text-text-muted">Feedback fornecido em: {formatFullDate(fb.createdAt)}</p>
                  
                  {fb.submissionDetails && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-text-body mb-1">Vídeos do Envio Original:</p>
                      <ul className="list-disc list-inside pl-2 space-y-1">
                        {fb.submissionDetails.tapeUrls.map((url, idx) => (
                          <li key={idx} className="text-sm">
                            <a href={url.includes("youtube.com/embed") ? url : `https://www.youtube.com/embed/${url.split('v=')[1]?.split('&')[0] || url.split('/').pop()}`} target="_blank" rel="noopener noreferrer" className="text-link-active hover:underline truncate">
                              Assistir Vídeo do Ator {idx + 1}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-2 pt-2 border-t border-gray-200">
                     <p className="text-sm font-medium text-text-body mb-1">Feedback do Tutor:</p>
                    <a href={fb.videoUrl.includes("youtube.com/embed") ? fb.videoUrl : `https://www.youtube.com/embed/${fb.videoUrl.split('v=')[1]?.split('&')[0] || fb.videoUrl.split('/').pop()}`} target="_blank" rel="noopener noreferrer" className="text-sm text-link-active hover:underline block">
                      Assistir Vídeo do Feedback
                    </a>
                    <details className="mt-1 text-xs">
                      <summary className="cursor-pointer text-text-muted hover:text-text-body">Ver transcrição do feedback</summary>
                      <p className="mt-1 p-2 bg-white border border-border-subtle rounded whitespace-pre-wrap text-text-body">{fb.transcript}</p>
                    </details>
                  </div>

                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-text-muted text-center py-3">Nenhum feedback fornecido por este tutor ainda.</p>
        )}
      </SectionCard>

      <div className="mt-8 pt-6 border-t border-border-subtle flex flex-col sm:flex-row flex-wrap justify-end gap-3">
        {tutor.tutorApplicationStatus !== TutorApplicationStatus.REJECTED && (
          <Button 
              variant="danger" 
              onClick={() => handleStatusUpdate(TutorApplicationStatus.REJECTED, false, 'reject')} 
              isLoading={actionLoading === 'reject'} 
              disabled={!!actionLoading}
              leftIcon={<XCircleIcon className="w-5 h-5"/>}
              className="w-full sm:w-auto"
          >
            Rejeitar Candidatura
          </Button>
        )}
        {tutor.tutorApplicationStatus !== TutorApplicationStatus.OBSERVATION && (
          <Button 
              variant="secondary" 
              onClick={() => handleStatusUpdate(TutorApplicationStatus.OBSERVATION, tutor.isApproved, 'observe')} 
              isLoading={actionLoading === 'observe'} 
              disabled={!!actionLoading}
              leftIcon={<InformationCircleIcon className="w-5 h-5"/>}
              className="w-full sm:w-auto"
          >
            Mover para Observação
          </Button>
        )}
         {tutor.tutorApplicationStatus === TutorApplicationStatus.REJECTED && ( 
            <Button 
                variant="outline" 
                onClick={() => handleStatusUpdate(TutorApplicationStatus.PENDING_REVIEW, false, 'reconsider')} 
                isLoading={actionLoading === 'reconsider'} 
                disabled={!!actionLoading}
                className="w-full sm:w-auto"
            >
                Reabrir Candidatura (p/ Avaliação)
            </Button>
        )}
        {tutor.tutorApplicationStatus !== TutorApplicationStatus.APPROVED && (
          <Button 
              variant="primary" 
              onClick={() => handleStatusUpdate(TutorApplicationStatus.APPROVED, true, 'approve')} 
              isLoading={actionLoading === 'approve'} 
              disabled={!!actionLoading}
              leftIcon={<CheckCircleIcon className="w-5 h-5"/>}
              className="w-full sm:w-auto"
          >
            Aprovar Candidatura
          </Button>
        )}
        {tutor.tutorApplicationStatus === TutorApplicationStatus.APPROVED && !tutor.isApproved && (
             <Button 
                variant="primary" 
                onClick={() => handleStatusUpdate(TutorApplicationStatus.APPROVED, true, 'grantAccess')} 
                isLoading={actionLoading === 'grantAccess'} 
                disabled={!!actionLoading}
                leftIcon={<CheckCircleIcon className="w-5 h-5"/>}
                className="w-full sm:w-auto"
            >
                Conceder Acesso
            </Button>
        )}
         {tutor.tutorApplicationStatus === TutorApplicationStatus.APPROVED && tutor.isApproved && (
             <Button 
                variant="danger" 
                onClick={() => handleStatusUpdate(TutorApplicationStatus.APPROVED, false, 'desativar')} 
                isLoading={actionLoading === 'desativar'} 
                disabled={!!actionLoading}
                leftIcon={<XCircleIcon className="w-5 h-5"/>}
                className="w-full sm:w-auto"
            >
                Desativar Acesso
            </Button>
        )}

      </div>
    </div>
  );
};

export default AdminTutorReviewPage;

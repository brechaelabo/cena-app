
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { usePlatformUsers } from '../../contexts/UserManagementContext';
import { User, Role, ActorLevel, EducationLevel, ActorOtherInterest, Submission, Feedback, Theme } from '../../types';
import { Card } from '../../components/Common/Card';
import { Button } from '../../components/Common/Button';
import { 
    ArrowLeftIcon, UserIcon as ProfileIcon, CalendarDaysIcon, GlobeAltIcon, 
    AcademicCapIcon, SparklesIcon, CheckCircleIcon, XCircleIcon, 
    InformationCircleIcon, PriceTagIcon, VideoCameraIcon, ClipboardCheckIcon 
} from '../../components/Common/Icons';
import { PATHS, ROLE_NAMES, ACTOR_LEVEL_NAMES, EDUCATION_LEVEL_NAMES, TECHNIQUE_OPTIONS, ACTOR_OTHER_INTEREST_OPTIONS, PLAN_DETAILS_MAP } from '../../constants'; // MOCK_ASSETS_URL removed
import { calculateAge, formatFullDate, getMonthsSince, formatMonthYear } from '../../utils/dateFormatter';
import { useToasts } from '../../contexts/ToastContext';
import { useSubmissions } from '../../contexts/SubmissionContext';
import { useThemes } from '../../contexts/ThemeContext';

type EnrichedSubmission = Submission & {
    themeDetails?: Theme;
    feedbackDetails?: Feedback;
    tutorNameForFeedback?: string;
};

const AdminActorReviewPage: React.FC = () => {
  const { actorId } = useParams<{ actorId: string }>();
  const { getUserById, toggleUserApproval } = usePlatformUsers();
  const { getSubmissionsForActor, getFeedbackById } = useSubmissions();
  const { getThemeById } = useThemes();
  const { addToast } = useToasts();
  const navigate = useNavigate();
  
  const [actor, setActor] = useState<User | null>(null);
  const [actorSubmissionsHistory, setActorSubmissionsHistory] = useState<EnrichedSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null); 

  useEffect(() => {
    setIsLoading(true);
    if (actorId) {
      const foundActor = getUserById(actorId);
      if (foundActor && foundActor.roles.some(r => r.role === Role.ACTOR)) {
        setActor(foundActor);
        
        const submissions = getSubmissionsForActor(foundActor.id);
        const enrichedHistory = submissions.map(sub => {
          const themeDetails = getThemeById(sub.themeId);
          let feedbackDetails: Feedback | undefined = undefined;
          let tutorNameForFeedback: string | undefined = undefined;

          if (sub.feedbackId) {
            feedbackDetails = getFeedbackById(sub.feedbackId);
            if (feedbackDetails?.tutorId) {
              tutorNameForFeedback = getUserById(feedbackDetails.tutorId)?.name || feedbackDetails.tutorName;
            }
          }
          return { ...sub, themeDetails, feedbackDetails, tutorNameForFeedback };
        });
        setActorSubmissionsHistory(enrichedHistory.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

      } else {
        setActor(null);
        setActorSubmissionsHistory([]);
        addToast("Ator/Atriz não encontrado(a).", 'error');
      }
    }
    setIsLoading(false);
  }, [actorId, getUserById, addToast, getSubmissionsForActor, getThemeById, getFeedbackById]);

  const handleToggleApproval = async () => {
    if (!actor) return;
    setActionLoading('toggleApproval');
    try {
        await new Promise(resolve => setTimeout(resolve, 500));
        toggleUserApproval(actor.id);
        addToast(`Acesso de ${actor.name} ${!actor.isApproved ? 'concedido' : 'suspenso'}.`, 'success');
        const refreshedActor = getUserById(actor.id);
        if (refreshedActor) setActor(refreshedActor);
    } catch (e: any) {
        addToast(e.message || 'Falha ao alterar status de acesso.', 'error');
    } finally {
        setActionLoading(null);
    }
  };

  if (isLoading) {
    return <div className="text-center p-10 text-text-body">Carregando dossiê do ator/atriz...</div>;
  }

  if (!actor) {
    return (
      <div className="text-center p-10">
        <p className="text-red-500 text-xl">Ator/Atriz não encontrado(a).</p>
        <Button onClick={() => navigate(PATHS.ADMIN_MANAGE_USERS)} className="mt-4">Voltar</Button>
      </div>
    );
  }
  
  const DetailItem: React.FC<{ icon?: React.ReactNode; label: string; value?: string | number | null; children?: React.ReactNode; className?: string }> = ({ icon, label, value, children, className = '' }) => (
    <div className={`flex items-start py-3 border-b border-border-subtle last:border-b-0 ${className}`}>
      {icon && <div className="flex-shrink-0 w-5 h-5 mr-3 text-text-muted mt-0.5">{icon}</div>}
      <div className="min-w-0">
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
  const actorImage = actor.imageUrl || `/placeholder-images/profile-actor-default-${actor.id.substring(0,5)}-200x200.jpg`;

  return (
    <div className="space-y-8"> {/* Added space-y-8 for consistent spacing between sections */}
      <Button variant="ghost" onClick={() => navigate(PATHS.ADMIN_MANAGE_USERS)} className="mb-0 text-text-muted hover:text-link-active group" disabled={!!actionLoading}> {/* mb-6 removed, spacing handled by parent */}
        <ArrowLeftIcon className="w-5 h-5 mr-1.5" /> Voltar para Gerenciar Usuários
      </Button>

      <Card title={`Dossiê de Ator/Atriz: ${actor.name}`}> {/* mb-8 removed */}
        <div className="grid md:grid-cols-3 gap-6 p-5">
          <div className="md:col-span-1 flex flex-col items-center">
            <img src={actorImage} alt={actor.name} className="w-40 h-40 rounded-full object-cover border-4 border-card-bg shadow-lg mb-4"/>
            <p className="text-xl font-bold text-black">{actor.name}</p>
            <p className="text-sm text-text-muted">{actor.email}</p>
            <p className={`mt-2 px-3 py-1 text-xs font-semibold rounded-full ${actor.isApproved ? 'bg-status-active-bg text-status-active-text' : 'bg-status-inactive-bg text-status-inactive-text'}`}>
                Acesso: {actor.isApproved ? 'Ativo' : 'Inativo/Pendente'}
            </p>
          </div>

          <div className="md:col-span-2 space-y-0">
            <DetailItem icon={<CalendarDaysIcon />} label="Data de Nascimento" value={actor.dateOfBirth ? formatFullDate(actor.dateOfBirth) : "Não informada"} />
            <DetailItem icon={<ProfileIcon />} label="Idade" value={`${calculateAge(actor.dateOfBirth)} anos`} />
            {actor.actorLevel && <DetailItem icon={<AcademicCapIcon />} label="Nível (Auto-declarado)" value={ACTOR_LEVEL_NAMES[actor.actorLevel]} />}
            {actor.educationLevel && <DetailItem icon={<AcademicCapIcon />} label="Escolaridade" value={EDUCATION_LEVEL_NAMES[actor.educationLevel]} />}
            <DetailItem icon={<ProfileIcon />} label="Telefone" value={actor.phone || "Não informado"} />
            {actor.activePlan && <DetailItem icon={<PriceTagIcon />} label="Plano Atual" value={PLAN_DETAILS_MAP[actor.activePlan].name} />}
            
            {actor.hasNoSocialMedia ? (
                 <DetailItem icon={<GlobeAltIcon />} label="Redes Sociais" value="Não possui / Não informou" />
            ) : actor.socialMediaLinks && actor.socialMediaLinks.length > 0 && actor.socialMediaLinks.some(l => l.url) ? (
              <DetailItem icon={<GlobeAltIcon />} label="Redes Sociais">
                <ul className="space-y-1">{actor.socialMediaLinks.filter(link => link.url).map((link, index) => (<li key={index}><a href={link.url} target="_blank" rel="noopener noreferrer" className="text-link-active hover:underline">{link.platform}: {link.url}</a></li>))}</ul>
              </DetailItem>
            ) : ( <DetailItem icon={<GlobeAltIcon />} label="Redes Sociais" value="Nenhuma informada" /> )}
          </div>
        </div>
      </Card>
      
      <div className="grid md:grid-cols-2 gap-x-6 gap-y-8"> {/* gap-y-8 to ensure vertical space */}
        <SectionCard title="Objetivos na CENA" icon={<SparklesIcon className="w-5 h-5"/>}>
          <p className="text-text-body whitespace-pre-wrap">{actor.whyJoinCena || "Não informado."}</p>
        </SectionCard>
        
        <SectionCard title="Técnicas e Metodologias de Interesse" icon={<SparklesIcon className="w-5 h-5"/>}>
          {actor.interestedTechniques && actor.interestedTechniques.length > 0 ? (
            <ul className="list-disc list-inside pl-1 space-y-1">
              {actor.interestedTechniques.map(tech => <li key={tech} className="text-text-body">{tech}</li>)}
            </ul>
          ) : <p className="text-text-muted">Nenhuma técnica de interesse informada.</p>}
        </SectionCard>

        <SectionCard title="Outros Interesses" icon={<SparklesIcon className="w-5 h-5"/>}>
          {actor.otherInterests && actor.otherInterests.length > 0 ? (
            <ul className="list-disc list-inside pl-1 space-y-1">
              {actor.otherInterests.map(interestId => {
                const interestObj = ACTOR_OTHER_INTEREST_OPTIONS.find(opt => opt.id === interestId);
                return <li key={interestId} className="text-text-body">{interestObj?.label || interestId}</li>;
              })}
            </ul>
          ) : <p className="text-text-muted">Nenhum outro interesse informado.</p>}
        </SectionCard>
        
        <SectionCard title="Experiências Formativas" icon={<AcademicCapIcon className="w-5 h-5"/>}>
             <p className="text-text-body whitespace-pre-wrap">{actor.formativeExperiences || "Não informado."}</p>
        </SectionCard>
        <SectionCard title="Experiências Profissionais" icon={<ProfileIcon className="w-5 h-5"/>}>
            <p className="text-text-body whitespace-pre-wrap">{actor.professionalExperiences || "Não informado."}</p>
        </SectionCard>
      </div>

      <SectionCard title="Histórico de Envios e Feedbacks" icon={<ClipboardCheckIcon className="w-5 h-5" />}>
        {actorSubmissionsHistory.length > 0 ? (
          <div className="space-y-4">
            {actorSubmissionsHistory.map(sub => (
              <Card key={sub.id} className="bg-gray-50 p-0">
                <div className="p-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-start">
                    <h4 className="font-semibold text-md text-black mb-1 sm:mb-0">
                      Tema: {sub.themeDetails?.title || sub.themeTitle}
                      {sub.themeDetails && (
                        <span className="text-xs text-text-muted ml-2 bg-gray-200 px-1.5 py-0.5 rounded-full">
                          ({formatMonthYear(sub.themeDetails.month, sub.themeDetails.year)})
                        </span>
                      )}
                    </h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                      ${sub.feedbackStatus === 'COMPLETED' ? 'bg-status-active-bg text-status-active-text' : 
                        sub.feedbackStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-600'}`}>
                      {sub.feedbackStatus === 'COMPLETED' ? 'Feedback Concluído' : 
                       sub.feedbackStatus === 'PENDING' ? 'Feedback Pendente' : sub.feedbackStatus || 'Status Desconhecido'}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-1">Enviado em: {formatFullDate(sub.createdAt)}</p>
                  
                  <div className="mt-3">
                    <p className="text-sm font-medium text-text-body mb-1">Vídeos do Envio:</p>
                    <ul className="list-disc list-inside pl-2 space-y-1">
                      {sub.tapeUrls.map((url, idx) => (
                        <li key={idx} className="text-sm">
                          <a href={url.includes("youtube.com/embed") ? url : `https://www.youtube.com/embed/${url.split('v=')[1]?.split('&')[0] || url.split('/').pop()}`} target="_blank" rel="noopener noreferrer" className="text-link-active hover:underline truncate">
                            Assistir Vídeo {idx + 1}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {sub.feedbackDetails && (
                    <div className="mt-3 pt-3 border-t border-border-subtle">
                      <p className="text-sm font-medium text-text-body mb-1">Feedback por: {sub.tutorNameForFeedback || 'Tutor'}</p>
                      <p className="text-xs text-text-muted">Recebido em: {formatFullDate(sub.feedbackDetails.createdAt)}</p>
                      <a href={sub.feedbackDetails.videoUrl.includes("youtube.com/embed") ? sub.feedbackDetails.videoUrl : `https://www.youtube.com/embed/${sub.feedbackDetails.videoUrl.split('v=')[1]?.split('&')[0] || sub.feedbackDetails.videoUrl.split('/').pop()}`} target="_blank" rel="noopener noreferrer" className="text-sm text-link-active hover:underline block mt-1">
                        Assistir Vídeo do Feedback
                      </a>
                      <details className="mt-2 text-xs">
                        <summary className="cursor-pointer text-text-muted hover:text-text-body">Ver transcrição do feedback</summary>
                        <p className="mt-1 p-2 bg-white border border-border-subtle rounded whitespace-pre-wrap text-text-body">{sub.feedbackDetails.transcript}</p>
                      </details>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-text-muted text-center py-3">Nenhum envio encontrado para este ator/atriz.</p>
        )}
      </SectionCard>


      <div className="mt-8 pt-6 border-t border-border-subtle flex flex-col sm:flex-row flex-wrap justify-end gap-3">
        <Button 
            variant={actor.isApproved ? "danger" : "primary"} 
            onClick={handleToggleApproval} 
            isLoading={actionLoading === 'toggleApproval'} 
            disabled={!!actionLoading}
            leftIcon={actor.isApproved ? <XCircleIcon className="w-5 h-5"/> : <CheckCircleIcon className="w-5 h-5"/>}
            className="w-full sm:w-auto"
        >
          {actor.isApproved ? 'Suspender Acesso' : 'Conceder Acesso'}
        </Button>
      </div>
    </div>
  );
};

export default AdminActorReviewPage;

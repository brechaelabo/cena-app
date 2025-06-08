
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Button } from '../../components/Common/Button';
import { Card } from '../../components/Common/Card';
import { PATHS, CENA_WHATSAPP_NUMBER, PLAN_DETAILS_MAP } from '../../constants';
import { Feedback, Submission, User as PlatformUserType, Theme, Role } from '../../types'; 
import { ArrowLeftIcon, ClipboardCheckIcon, UserIcon, VideoCameraIcon, CheckCircleIcon, ClockIcon, InformationCircleIcon, CalendarDaysIcon } from '../../components/Common/Icons';
import { useAuth } from '../../contexts/AuthContext';
import { useSubmissions } from '../../contexts/SubmissionContext';
import { useThemes } from '../../contexts/ThemeContext'; 
import { usePlatformUsers } from '../../contexts/UserManagementContext'; 
import { useToasts } from '../../contexts/ToastContext'; 
import { formatFullDate, formatMonthYear } from '../../utils/dateFormatter';

const ActorViewFeedbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { submissionId } = useParams<{ submissionId: string }>();
  const { user } = useAuth();
  const { getSubmissionById, getFeedbackForSubmission } = useSubmissions();
  const { getThemeById } = useThemes();
  const { getUserById: getTutorById } = usePlatformUsers(); 
  const { addToast } = useToasts();

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [theme, setTheme] = useState<Theme | null>(null);
  const [tutor, setTutor] = useState<PlatformUserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || user.currentRole !== Role.ACTOR) {
        addToast("Acesso não autorizado.", 'error');
        setIsLoading(false);
        navigate(PATHS.LOGIN);
        return;
    }
    if (submissionId) {
        setIsLoading(true);
        setTimeout(() => { // Simulate data fetching
            const fetchedSubmission = getSubmissionById(submissionId);
            if (fetchedSubmission && fetchedSubmission.userId === user.id) {
                setSubmission(fetchedSubmission);
                const fetchedTheme = getThemeById(fetchedSubmission.themeId);
                setTheme(fetchedTheme || null);

                if (fetchedSubmission.feedbackId) {
                    const fetchedFeedback = getFeedbackForSubmission(fetchedSubmission.id);
                    setFeedback(fetchedFeedback || null);
                    if (fetchedFeedback?.tutorId) {
                        const fetchedTutor = getTutorById(fetchedFeedback.tutorId);
                        setTutor(fetchedTutor || null);
                    }
                }
            } else {
                addToast("Envio não encontrado ou não pertence a este usuário.", 'error');
                navigate(PATHS.ACTOR_EM_CENA);
            }
            setIsLoading(false);
        }, 700);
    } else {
        addToast("ID do envio não fornecido.", 'error');
        navigate(PATHS.ACTOR_EM_CENA);
    }
  }, [submissionId, user, navigate, getSubmissionById, getFeedbackForSubmission, getThemeById, getTutorById, addToast]);

  const handleMarkSession = () => {
    if (!submission || !feedback) return;
    const actorName = user?.name || "Ator/Atriz";
    const themeTitle = theme?.title || "meu último envio";
    const preFilledMessage = encodeURIComponent(
      `Olá, CENA! Sou ${actorName} e gostaria de marcar uma sessão 1:1 sobre meu feedback para o tema "${themeTitle}". Submission ID: ${submission.id}`
    );
    const whatsappUrl = `https://wa.me/${CENA_WHATSAPP_NUMBER}?text=${preFilledMessage}`;
    window.open(whatsappUrl, '_blank');
  };
  
  const canRequestLiveFeedback = (): boolean => {
    if (!user || !user.activePlan) return false;
    const planDetails = PLAN_DETAILS_MAP[user.activePlan];
    return planDetails.id === 'PRO' && (planDetails.freeTextSubmissions || 0) > 0; 
  };

  if (isLoading) {
    return <div className="text-center p-10 text-text-body">Carregando detalhes do feedback...</div>;
  }

  if (!submission) {
    return (
      <div className="text-center p-10">
        <p className="text-red-500 text-xl">Envio não encontrado.</p>
        <Button onClick={() => navigate(PATHS.ACTOR_EM_CENA)} className="mt-4">Voltar</Button>
      </div>
    );
  }
  
  const themeDateDisplay = theme ? formatMonthYear(theme.month, theme.year) : '';
  const cardTitle = `Feedback para: ${theme?.title || submission.themeTitle}${themeDateDisplay ? ` (${themeDateDisplay})` : ''}`;

  return (
    <div>
      <Button 
        variant="ghost" 
        onClick={() => navigate(PATHS.ACTOR_EM_CENA)} 
        className="mb-6 text-text-muted hover:text-link-active group inline-flex items-center"
      >
        <ArrowLeftIcon className="w-5 h-5 mr-1.5 text-text-muted group-hover:text-link-active transition-colors" /> Voltar para "Em Cena"
      </Button>

      <Card title={cardTitle} className="mb-8">
        <div className="mb-6 p-4 border border-border-subtle rounded-md bg-gray-50">
            <h3 className="text-lg font-semibold text-black mb-3">Seus Vídeos Enviados:</h3>
            {submission.tapeUrls.map((url, idx) => (
                <div key={idx} className="mb-4">
                    <p className="text-text-body text-sm mb-1">Vídeo {idx + 1}:</p>
                    <div className="aspect-video rounded-md overflow-hidden border border-border-subtle">
                        <iframe
                            className="w-full h-full"
                            src={url.includes("youtube.com/embed") ? url : `https://www.youtube.com/embed/${url.split('v=')[1]?.split('&')[0] || url.split('/').pop()}`}
                            title={`Seu Vídeo ${idx + 1}`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen>
                        </iframe>
                    </div>
                </div>
            ))}
            <p className="text-xs text-text-muted mt-2">Enviado em: {formatFullDate(submission.createdAt)}</p>
        </div>

        {feedback ? (
          <div className="bg-accent-blue-soft p-4 rounded-lg">
            <div className="flex items-center mb-3">
              <ClipboardCheckIcon className="w-6 h-6 text-accent-blue-emphasis mr-2 flex-shrink-0"/>
              <h3 className="text-xl font-semibold text-black">Feedback Recebido</h3>
            </div>
            {tutor && (
                <div className="flex items-center mb-3 text-sm text-text-body">
                    <UserIcon className="w-5 h-5 text-text-muted mr-2 flex-shrink-0"/>
                    Feedback por: <strong className="ml-1">{tutor.name || feedback.tutorName}</strong>
                </div>
            )}
            <p className="text-xs text-text-muted mb-4">Recebido em: {formatFullDate(feedback.createdAt)}</p>
            
            <div className="mb-6">
                <h4 className="text-md font-semibold text-text-headings mb-2">Vídeo do Feedback:</h4>
                <div className="aspect-video rounded-md overflow-hidden border border-border-subtle">
                    <iframe
                        className="w-full h-full"
                        src={feedback.videoUrl.includes("youtube.com/embed") ? feedback.videoUrl : `https://www.youtube.com/embed/${feedback.videoUrl.split('v=')[1]?.split('&')[0] || feedback.videoUrl.split('/').pop()}`}
                        title="Vídeo do Feedback do Tutor"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen>
                    </iframe>
                </div>
            </div>

            <div>
                <h4 className="text-md font-semibold text-text-headings mb-2">Transcrição e Comentários:</h4>
                <div className="p-4 bg-card-bg rounded-md border border-border-subtle whitespace-pre-wrap text-text-body text-sm leading-relaxed">
                    {feedback.transcript}
                </div>
            </div>
             <div className="mt-8 pt-6 border-t border-border-subtle flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                    variant="primary" 
                    onClick={handleMarkSession}
                    leftIcon={<CalendarDaysIcon className="w-5 h-5"/>}
                >
                    Marcar Sessão 1:1 sobre este Feedback
                </Button>
                {canRequestLiveFeedback() && (
                    <Button 
                        variant="secondary"
                        onClick={() => addToast("Upgrade para Feedback Ao Vivo solicitado! (Simulação)", "info")}
                        leftIcon={<VideoCameraIcon className="w-5 h-5"/>}
                    >
                        Solicitar Upgrade para Feedback Ao Vivo
                    </Button>
                )}
            </div>
          </div>
        ) : submission.feedbackStatus === 'PENDING' ? (
          <div className="text-center p-6 bg-yellow-50 border border-yellow-300 rounded-lg">
            <ClockIcon className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
            <h3 className="text-xl font-semibold text-yellow-800">Feedback Pendente</h3>
            <p className="text-yellow-700">
              Seu self-tape foi enviado com sucesso e está aguardando o feedback do tutor. Você será notificado assim que estiver pronto.
            </p>
          </div>
        ) : (
             <div className="text-center p-6 bg-gray-100 border border-gray-300 rounded-lg">
                <InformationCircleIcon className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <h3 className="text-xl font-semibold text-gray-700">Feedback não disponível</h3>
                <p className="text-gray-600">
                    Não há feedback associado a este envio no momento.
                </p>
            </div>
        )}
      </Card>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-border-subtle">
        <h3 className="text-lg font-semibold text-black mb-3">Próximos Passos:</h3>
        <ul className="list-disc list-inside text-text-body space-y-2 pl-2 text-sm">
            <li>Reflita sobre os pontos levantados pelo tutor.</li>
            <li>Considere regravar a cena aplicando as sugestões para praticar.</li>
            <li>Se tiver dúvidas, prepare perguntas para uma possível Sessão 1:1.</li>
            <li>Explore o novo tema do mês ou outros Percursos disponíveis.</li>
        </ul>
      </div>
    </div>
  );
};

export default ActorViewFeedbackPage;

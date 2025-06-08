
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/Common/Button';
import { Card } from '../../components/Common/Card';
import { Input, Textarea } from '../../components/Common/Input';
import { PATHS } from '../../constants';
import { Submission, FeedbackCreateData, Theme } from '../../types'; 
import { ArrowLeftIcon, InformationCircleIcon } from '../../components/Common/Icons';
import { useAuth } from '../../contexts/AuthContext';
import { useSubmissions } from '../../contexts/SubmissionContext';
import { usePlatformUsers } from '../../contexts/UserManagementContext';
import { useThemes } from '../../contexts/ThemeContext';
import { useToasts } from '../../contexts/ToastContext'; 
import { formatMonthYear, formatFullDate } from '../../utils/dateFormatter'; // Added formatMonthYear and formatFullDate

const TutorGiveFeedbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { submissionId } = useParams<{ submissionId: string }>();
  const { user: tutorUser } = useAuth(); 
  const { getSubmissionById, addFeedback } = useSubmissions();
  const { getUserById: getPlatformUserById } = usePlatformUsers();
  const { getThemeById } = useThemes();
  const { addToast } = useToasts(); 

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [feedbackVideoUrl, setFeedbackVideoUrl] = useState('');
  const [transcript, setTranscript] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actorName, setActorName] = useState<string>('');
  const [themeDetails, setThemeDetails] = useState<Theme | null>(null);

  const feedbackBestPractices = [
    "Seja específico.",
    "Mantenha um tom construtivo e encorajador.",
    "Destaque os pontos fortes antes de abordar pontos de melhoria.",
    "Indique as minutagens dos momentos que está comentando.",
    "Analise aspectos técnicos (luz, som, imagem, enquadramento), artísticos (análise de texto e atuação) e estratégicos (reflexão sobre relação com carreira e mercado).",
    "Revise seu feedback antes do envio para garantir clareza, objetividade e afetividade."
  ];

  useEffect(() => {
    if (!tutorUser || tutorUser.currentRole !== 'TUTOR') {
        addToast("Acesso não autorizado.", 'error');
        setIsLoading(false);
        navigate(PATHS.LOGIN);
        return;
    }
    if (submissionId) {
      setTimeout(() => { 
        const fetchedSubmission = getSubmissionById(submissionId);
        if (fetchedSubmission) {
          setSubmission(fetchedSubmission);
          const actor = getPlatformUserById(fetchedSubmission.userId);
          setActorName(actor?.name || fetchedSubmission.userName || 'Ator Desconhecido');
          const theme = getThemeById(fetchedSubmission.themeId);
          setThemeDetails(theme || null);
        } else {
          addToast("Envio não encontrado ou não disponível para feedback.", 'error');
        }
        setIsLoading(false);
      }, 500);
    } else {
        addToast("ID do envio não fornecido.", 'error');
        setIsLoading(false);
    }
  }, [submissionId, tutorUser, navigate, getSubmissionById, getPlatformUserById, getThemeById, addToast]);

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submission || !tutorUser) {
        addToast("Dados do envio ou tutor não disponíveis.", 'error');
        return;
    }
    if (!feedbackVideoUrl.trim() || !transcript.trim()) {
      addToast("Por favor, forneça o link do vídeo de feedback e a transcrição/comentários.", 'error');
      return;
    }
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    if (!youtubeRegex.test(feedbackVideoUrl)) {
        addToast("URL do vídeo de feedback inválida. Use apenas links do YouTube.", 'error');
        return;
    }

    setIsSubmitting(true);
    
    const feedbackData: FeedbackCreateData = {
        submissionId: submission.id,
        tutorId: tutorUser.id,
        actorId: submission.userId,
        videoUrl: feedbackVideoUrl,
        transcript: transcript,
    };

    try {
        await addFeedback(feedbackData);
        setIsSubmitting(false);
        addToast('Feedback enviado com sucesso!', 'success');
        navigate(PATHS.TUTOR_REVIEW_SUBMISSIONS);
    } catch (submitError: any) {
        addToast(submitError.message || "Falha ao enviar feedback.", 'error');
        setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="text-center p-10 text-text-body">Carregando detalhes do envio...</div>;
  }

  if (!submission) { 
    return (
      <div className="text-center p-10">
        <p className="text-red-500 text-xl">Não foi possível carregar o envio.</p>
        <Button onClick={() => navigate(PATHS.TUTOR_REVIEW_SUBMISSIONS)} className="mt-4" disabled={isSubmitting}>Voltar para Envios</Button>
      </div>
    );
  }
  const themeTitleForDisplay = themeDetails?.title || submission.themeTitle || 'Tema Desconhecido';
  const themeDateDisplay = themeDetails ? formatMonthYear(themeDetails.month, themeDetails.year) : '';
  const pageTitle = `Dar Feedback para: ${actorName} (${themeTitleForDisplay}${themeDateDisplay ? ` - ${themeDateDisplay}` : ''})`;


  return (
    <div className="p-0"> 
      <Button 
        variant="ghost" 
        onClick={() => navigate(PATHS.TUTOR_REVIEW_SUBMISSIONS)} 
        className="mb-6 text-text-muted hover:text-link-active group inline-flex items-center" 
        disabled={isSubmitting}
      >
        <ArrowLeftIcon className="w-5 h-5 mr-1.5 text-text-muted group-hover:text-link-active transition-colors" /> Voltar para Lista de Envios
      </Button>
      <Card title={pageTitle}> 
        <div className="mb-6 p-4 border border-border-subtle rounded-md">
            <h3 className="text-lg font-semibold text-black mb-3">Vídeos Enviados pelo Ator/Atriz:</h3>
            {submission.tapeUrls.map((url, idx) => (
                <div key={idx} className="mb-4">
                    <p className="text-text-body text-sm mb-1">Vídeo {idx + 1}:</p>
                    <div className="aspect-video rounded-md overflow-hidden border border-border-subtle">
                        <iframe
                            className="w-full h-full"
                            src={url.includes("youtube.com/embed") ? url : `https://www.youtube.com/embed/${url.split('v=')[1]?.split('&')[0] || url.split('/').pop()}`}
                            title={`Vídeo do Ator ${idx + 1}`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen>
                        </iframe>
                    </div>
                </div>
            ))}
            <p className="text-xs text-text-muted mt-2">Enviado em: {formatFullDate(submission.createdAt)}</p>
        </div>

        <div className="mb-6 p-4 border border-dashed border-amber-400 rounded-md bg-amber-50">
            <div className="flex items-center text-amber-700 mb-2">
                <InformationCircleIcon className="w-5 h-5 mr-2"/>
                <h4 className="text-md font-semibold">Lembrete: Boas Práticas de Feedback</h4>
            </div>
            <ul className="list-disc list-inside space-y-1 text-sm text-amber-600 pl-2">
                {feedbackBestPractices.map((practice, index) => (
                    <li key={index}>{practice}</li>
                ))}
            </ul>
        </div>


        <form onSubmit={handleSubmitFeedback} className="space-y-6">
          <Input
            label="Link do Vídeo de Feedback (YouTube)"
            type="url"
            value={feedbackVideoUrl}
            onChange={(e) => setFeedbackVideoUrl(e.target.value)}
            required
            placeholder="https://www.youtube.com/watch?v=seuVideoDeFeedback"
            disabled={isSubmitting}
          />
          <Textarea
            label="Transcrição e Comentários Detalhados"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            required
            rows={10}
            placeholder="Digite aqui sua análise, pontos fortes, áreas de melhoria, etc."
            disabled={isSubmitting}
          />
          <div className="flex justify-end">
            <Button type="submit" variant="primary" isLoading={isSubmitting} disabled={isSubmitting}>
                Enviar Feedback
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default TutorGiveFeedbackPage;

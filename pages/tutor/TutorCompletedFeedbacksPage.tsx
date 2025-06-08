
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/Common/Button';
import { Card } from '../../components/Common/Card';
import { PATHS } from '../../constants';
import { Submission, Feedback, Role } from '../../types';
import { ArrowLeftIcon, ArchiveBoxIcon, UserIcon, VideoCameraIcon, CalendarDaysIcon } from '../../components/Common/Icons';
import { useAuth } from '../../contexts/AuthContext';
import { useSubmissions } from '../../contexts/SubmissionContext';
import { formatFullDate, formatMonthYear } from '../../utils/dateFormatter'; // Added formatMonthYear
import { useThemes } from '../../contexts/ThemeContext'; // Added useThemes

interface GroupedFeedbacks {
  [groupKey: string]: Submission[];
}

const TutorCompletedFeedbacksPage: React.FC = () => {
  const navigate = useNavigate();
  const { user: tutorUser } = useAuth();
  const { getCompletedFeedbacksByTutor, getFeedbackById } = useSubmissions();
  const { getThemeById } = useThemes(); // Added

  const [completedFeedbacks, setCompletedFeedbacks] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tutorUser || tutorUser.currentRole !== Role.TUTOR) {
      setError("Acesso não autorizado.");
      setIsLoading(false);
      navigate(PATHS.LOGIN);
      return;
    }

    setTimeout(() => {
      try {
        const feedbacksFromCtx = getCompletedFeedbacksByTutor(tutorUser.id);
        setCompletedFeedbacks(feedbacksFromCtx);
      } catch (e: any) {
        setError("Erro ao carregar feedbacks concluídos.");
        console.error(e);
      }
      setIsLoading(false);
    }, 500);
  }, [tutorUser, navigate, getCompletedFeedbacksByTutor]);

  if (isLoading) {
    return <div className="text-center p-10 text-text-body">Carregando feedbacks concluídos...</div>;
  }

  if (error) {
    return (
      <div className="text-center p-10">
        <p className="text-red-500 text-xl">{error}</p>
        <Button onClick={() => navigate(PATHS.TUTOR_DASHBOARD)} className="mt-4">Voltar ao Painel</Button>
      </div>
    );
  }

  const groupFeedbacks = (): GroupedFeedbacks => {
    return completedFeedbacks.reduce((acc, sub) => {
      const theme = getThemeById(sub.themeId); // Get theme details
      const date = new Date(sub.createdAt);
      const monthNum = date.getMonth() + 1;
      const yearNum = date.getFullYear();
      
      const themeDateDisplay = formatMonthYear(theme?.month || monthNum, theme?.year || yearNum);
      const groupKey = `${themeDateDisplay} - ${sub.themeTitle || 'Tema Desconhecido'}`;
      
      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(sub);
      return acc;
    }, {} as GroupedFeedbacks);
  };

  const grouped = groupFeedbacks();

  return (
    <div className="p-0">
      <Button variant="ghost" onClick={() => navigate(PATHS.TUTOR_DASHBOARD)} className="mb-6 text-text-muted hover:text-link-active group inline-flex items-center">
        <ArrowLeftIcon className="w-5 h-5 mr-1.5 text-text-muted group-hover:text-link-active transition-colors" /> Voltar ao Painel do Tutor
      </Button>
      <h1 className="text-2xl md:text-3xl font-bold text-black mb-8">Meus Feedbacks Concluídos</h1>

      {completedFeedbacks.length === 0 ? (
        <Card className="text-center">
          <div className="py-10 md:py-16">
            <ArchiveBoxIcon className="w-16 h-16 md:w-20 md:h-20 text-text-muted mx-auto mb-4" />
            <h2 className="text-xl md:text-2xl font-semibold text-headings mb-2">Nenhum feedback concluído</h2>
            <p className="text-text-body">Você ainda não finalizou nenhum feedback.</p>
          </div>
        </Card>
      ) : (
        Object.keys(grouped).sort((a, b) => {
             // Sort by year then month if possible (more robust parsing needed for perfect sort)
            const dateAString = a.split(' - ')[0];
            const dateBString = b.split(' - ')[0];
            
            const [monthNameA, yearA] = dateAString.split('/');
            const [monthNameB, yearB] = dateBString.split('/');

            if (yearB !== yearA) return parseInt(yearB) - parseInt(yearA);
            
            // Convert month name to number for sorting
            const monthOrder = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
            return monthOrder.indexOf(monthNameB) - monthOrder.indexOf(monthNameA);
        }).map(groupKey => (
          <div key={groupKey} className="mb-10">
            <h2 className="text-xl font-semibold text-text-headings mb-4 border-b border-border-subtle pb-2">{groupKey}</h2>
            <div className="space-y-6">
              {grouped[groupKey].map(sub => {
                const feedback = sub.feedbackId ? getFeedbackById(sub.feedbackId) : null;
                return (
                  <Card key={sub.id} className="p-0">
                    <div className="p-5">
                        <div className="flex flex-col sm:flex-row justify-between items-start mb-3">
                            <div>
                                <p className="text-sm text-text-muted">Ator/Atriz:</p>
                                <h3 className="text-lg font-semibold text-black">{sub.userName}</h3>
                            </div>
                             {/* No need to display theme title again if it's in groupKey, but month/year is already there */}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 text-sm">
                            <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-border-subtle">
                                <CalendarDaysIcon className="w-5 h-5 text-link-active mr-2 flex-shrink-0"/>
                                <div>
                                    <p className="text-xs text-text-muted">Envio Recebido em:</p>
                                    <p className="font-medium text-text-body">{formatFullDate(sub.createdAt)}</p>
                                </div>
                            </div>
                            <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-border-subtle">
                                <CalendarDaysIcon className="w-5 h-5 text-link-active mr-2 flex-shrink-0"/>
                                <div>
                                    <p className="text-xs text-text-muted">Feedback Concluído em:</p>
                                    <p className="font-medium text-text-body">{feedback ? formatFullDate(feedback.createdAt) : 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                      
                        <Link to={PATHS.TUTOR_GIVE_FEEDBACK.replace(':submissionId', sub.id)}>
                            <Button variant="outline" size="sm" className="w-full sm:w-auto">
                                Ver Feedback Detalhado
                            </Button>
                        </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default TutorCompletedFeedbacksPage;

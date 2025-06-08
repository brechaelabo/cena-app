
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Submission, Feedback, Role, FeedbackMode, SubmissionCreateData, FeedbackCreateData, NotificationType } from '../types';
import { PATHS } from '../constants'; 
import { useAuth } from './AuthContext'; 
import { useThemes } from './ThemeContext'; 
import { usePlatformUsers } from './UserManagementContext'; 
import { useNotifications } from './NotificationContext'; // Import useNotifications
import { calculateDeadlineTimestamp } from '../utils/dateFormatter';


const INITIAL_MOCK_SUBMISSIONS: Submission[] = [
  {
    id: 'mocksub-001',
    themeId: 'theme-001', 
    userId: 'user-actor-01', // Mariana Almeida
    tapeUrls: ['https://www.youtube.com/watch?v=actorVideo1'],
    feedbackMode: FeedbackMode.ASYNC,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), 
    feedbackStatus: 'COMPLETED',
    feedbackId: 'mockfb-001',
    assignedTutorId: 'user-tutor-02', // Profa. Ana Lima
  },
  {
    id: 'mocksub-002',
    themeId: 'theme-002', 
    userId: 'user-actor-02', // Carlos Pereira
    tapeUrls: ['https://www.youtube.com/watch?v=actorVideo2'],
    feedbackMode: FeedbackMode.ASYNC,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // Updated: 5 days ago
    feedbackStatus: 'PENDING',
    assignedTutorId: null, // Unassigned
  },
   {
    id: 'mocksub-003',
    themeId: 'theme-001', 
    userId: 'user-actor-02', // Carlos Pereira
    tapeUrls: ['https://www.youtube.com/watch?v=carlosVideoAnother'],
    feedbackMode: FeedbackMode.ASYNC,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), 
    feedbackStatus: 'COMPLETED',
    feedbackId: 'mockfb-002',
    assignedTutorId: 'user-tutor-01', // Prof. João Santos (even if pending approval, can be assigned)
  },
  {
    id: 'mocksub-004',
    themeId: 'theme-002',
    userId: 'user-actor-03', // Beatriz Costa
    tapeUrls: ['https://www.youtube.com/watch?v=beatrizVideo1'],
    feedbackMode: FeedbackMode.ASYNC,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Updated: 2 days ago
    feedbackStatus: 'PENDING',
    // assignedTutorId will be set by actor's preferredTutorId or null
  },
  {
    id: 'mocksub-005',
    themeId: 'theme-001', // Monólogo Clássico
    userId: 'user-actor-04', // Pedro Silva
    tapeUrls: ['https://www.youtube.com/watch?v=pedroVideo1'],
    feedbackMode: FeedbackMode.ASYNC,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // New: 3 days ago
    feedbackStatus: 'PENDING',
    assignedTutorId: 'user-tutor-02', // Assigned to Profa. Ana Lima
  },
];

const INITIAL_MOCK_FEEDBACKS: Feedback[] = [
  {
    id: 'mockfb-001',
    submissionId: 'mocksub-001',
    tutorId: 'user-tutor-02', // Profa. Ana Lima
    actorId: 'user-actor-01', // Mariana Almeida
    videoUrl: 'https://www.youtube.com/watch?v=tutorFeedbackVideo1',
    transcript: 'Excelente trabalho no monólogo clássico! Sua interpretação moderna foi muito original. Pontos a melhorar: projeção vocal e contato visual com a câmera.',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), 
  },
  {
    id: 'mockfb-002',
    submissionId: 'mocksub-003',
    tutorId: 'user-tutor-01', // Prof. João Santos
    actorId: 'user-actor-02', // Carlos Pereira
    videoUrl: 'https://www.youtube.com/watch?v=tutorFeedbackVideo2',
    transcript: 'Sua cena de comédia original tem um ótimo potencial. O timing das piadas está bom, mas a construção do personagem pode ser mais aprofundada.',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), 
  },
];

// NOTA: As constantes INITIAL_MOCK_SUBMISSIONS e INITIAL_MOCK_FEEDBACKS acima
// definem os dados padrão que serão carregados se nenhuma configuração for encontrada no localStorage.
// Se você atualizou estas constantes para refletir os novos padrões desejados,
// a aplicação as usará quando o localStorage estiver vazio.

interface SubmissionContextType {
  submissions: Submission[];
  feedbacks: Feedback[];
  addSubmission: (submissionData: SubmissionCreateData) => Promise<void>;
  assignTutorToSubmission: (submissionId: string, tutorId: string | null) => Promise<void>;
  addFeedback: (feedbackData: FeedbackCreateData) => Promise<void>;
  getSubmissionsForActor: (actorId: string) => Submission[];
  getSubmissionsForTutorReview: (tutorId?: string) => Submission[]; 
  getAssignedPendingSubmissions: () => Submission[];
  getSubmissionById: (submissionId: string) => Submission | undefined;
  getFeedbackById: (feedbackId: string) => Feedback | undefined;
  getFeedbackForSubmission: (submissionId: string) => Feedback | undefined;
  getCompletedFeedbacksByTutor: (tutorId: string) => Submission[];
  countSubmissionsByActor: (actorId: string) => number;
  countSubmissionsByActorThisMonth: (actorId: string) => number;
  countPendingSubmissionsAssignedToTutor: (tutorId: string) => number;
}

const SubmissionContext = createContext<SubmissionContextType | undefined>(undefined);

export const SubmissionsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    const storedSubmissions = localStorage.getItem('cena-submissions');
    return storedSubmissions ? JSON.parse(storedSubmissions) : INITIAL_MOCK_SUBMISSIONS;
  });

  const [feedbacks, setFeedbacks] = useState<Feedback[]>(() => {
    const storedFeedbacks = localStorage.getItem('cena-feedbacks');
    return storedFeedbacks ? JSON.parse(storedFeedbacks) : INITIAL_MOCK_FEEDBACKS;
  });
  
  const { getUserById: getPlatformUserById } = usePlatformUsers(); 
  const { getThemeById } = useThemes();
  const { addNotification } = useNotifications(); // Import useNotifications

  useEffect(() => {
    localStorage.setItem('cena-submissions', JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    localStorage.setItem('cena-feedbacks', JSON.stringify(feedbacks));
  }, [feedbacks]);

  const addSubmission = async (submissionData: SubmissionCreateData): Promise<void> => {
    const actor = getPlatformUserById(submissionData.userId);
    const theme = getThemeById(submissionData.themeId);

    const newSubmission: Submission = {
      ...submissionData,
      id: `sub-${Date.now()}`,
      userName: actor?.name || 'Ator Desconhecido',
      themeTitle: theme?.title || 'Tema Desconhecido',
      createdAt: new Date().toISOString(),
      feedbackStatus: 'PENDING',
      assignedTutorId: actor?.preferredTutorId || null, 
    };
    setSubmissions(prev => [...prev, newSubmission]);
    
    addNotification(submissionData.userId, {
      type: NotificationType.SUBMISSION_CONFIRMED,
      title: 'Self-tape Enviado com Sucesso!',
      message: `Seu self-tape para o tema "${newSubmission.themeTitle}" foi recebido e está aguardando feedback.`,
      linkTo: PATHS.ACTOR_VIEW_FEEDBACK.replace(':submissionId', newSubmission.id),
      iconName: 'VideoCameraIcon',
    });
  };

  const assignTutorToSubmission = async (submissionId: string, tutorId: string | null): Promise<void> => {
    setSubmissions(prevSubs =>
      prevSubs.map(sub =>
        sub.id === submissionId
          ? { ...sub, assignedTutorId: tutorId, updatedAt: new Date().toISOString() }
          : sub
      )
    );
  };

  const addFeedback = async (feedbackData: FeedbackCreateData): Promise<void> => {
    const tutor = getPlatformUserById(feedbackData.tutorId);
    const actor = getPlatformUserById(feedbackData.actorId);
    const submission = submissions.find(s => s.id === feedbackData.submissionId);

    const newFeedback: Feedback = {
      ...feedbackData,
      id: `fb-${Date.now()}`,
      tutorName: tutor?.name || 'Tutor Desconhecido',
      actorName: actor?.name || 'Ator Desconhecido',
      createdAt: new Date().toISOString(),
    };
    setFeedbacks(prev => [...prev, newFeedback]);

    if (tutor) {
      // UserManagementContext should ideally handle updating tutor stats.
      // This change might not reflect immediately if contexts are not perfectly synced without a backend.
    }

    setSubmissions(prevSubs =>
      prevSubs.map(sub =>
        sub.id === feedbackData.submissionId
          ? { ...sub, feedbackStatus: 'COMPLETED', feedbackId: newFeedback.id, feedbackTutorName: newFeedback.tutorName }
          : sub
      )
    );

    addNotification(feedbackData.actorId, {
      type: NotificationType.FEEDBACK_READY,
      title: 'Feedback Disponível!',
      message: `Seu feedback para o tema "${submission?.themeTitle || 'seu self-tape'}" está pronto. Tutor: ${newFeedback.tutorName}.`,
      linkTo: PATHS.ACTOR_VIEW_FEEDBACK.replace(':submissionId', feedbackData.submissionId),
      iconName: 'ClipboardCheckIcon',
    });
  };
  
  const enrichSubmission = (sub: Submission): Submission => {
    const theme = getThemeById(sub.themeId);
    const actor = getPlatformUserById(sub.userId);
    let feedbackTutorName = sub.feedbackTutorName;
    let assignedTutor = null;
    if (sub.assignedTutorId) {
        assignedTutor = getPlatformUserById(sub.assignedTutorId);
    }

    if (sub.feedbackId && !feedbackTutorName) {
        const feedback = feedbacks.find(fb => fb.id === sub.feedbackId);
        if (feedback?.tutorId) {
            feedbackTutorName = getPlatformUserById(feedback.tutorId)?.name || feedback.tutorName;
        }
    }
    
    return {
        ...sub,
        themeTitle: theme?.title || sub.themeTitle || 'Tema Desconhecido',
        userName: actor?.name || sub.userName || 'Ator Desconhecido',
        assignedTutorImageUrl: assignedTutor?.imageUrl,
        deadlineTimestamp: calculateDeadlineTimestamp(sub.createdAt),
        feedbackTutorName: feedbackTutorName,
    };
  };


  const getSubmissionsForActor = (actorId: string): Submission[] => {
    return submissions.filter(sub => sub.userId === actorId)
        .map(enrichSubmission)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getSubmissionsForTutorReview = (tutorId?: string): Submission[] => {
    let pendingSubmissions = submissions.filter(sub => sub.feedbackStatus === 'PENDING');
    if (tutorId) {
        pendingSubmissions = pendingSubmissions.filter(sub => sub.assignedTutorId === tutorId || !sub.assignedTutorId);
    }
    return pendingSubmissions
        .map(enrichSubmission)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); 
  };
  
  const getAssignedPendingSubmissions = (): Submission[] => {
    return submissions.filter(sub => sub.assignedTutorId && sub.feedbackStatus === 'PENDING')
        .map(enrichSubmission)
        .sort((a, b) => (a.deadlineTimestamp || 0) - (b.deadlineTimestamp || 0)); 
  };


  const getSubmissionById = (submissionId: string): Submission | undefined => {
    const submission = submissions.find(sub => sub.id === submissionId);
    if (!submission) return undefined;
    return enrichSubmission(submission);
  };

  const getFeedbackById = (feedbackId: string): Feedback | undefined => {
    const feedback = feedbacks.find(fb => fb.id === feedbackId);
    if (!feedback) return undefined;
    return {
        ...feedback,
        tutorName: getPlatformUserById(feedback.tutorId)?.name || feedback.tutorName || 'Tutor Desconhecido',
        actorName: getPlatformUserById(feedback.actorId)?.name || feedback.actorName || 'Ator Desconhecido',
    };
  };

  const getFeedbackForSubmission = (submissionId: string): Feedback | undefined => {
    const submission = getSubmissionById(submissionId);
    if (submission && submission.feedbackId) {
      return getFeedbackById(submission.feedbackId);
    }
    return undefined;
  };
  
  const getCompletedFeedbacksByTutor = (tutorId: string): Submission[] => {
    return submissions
      .filter(sub => sub.feedbackId && feedbacks.some(fb => fb.id === sub.feedbackId && fb.tutorId === tutorId) && sub.feedbackStatus === 'COMPLETED')
      .map(enrichSubmission)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const countSubmissionsByActor = (actorId: string): number => {
    return submissions.filter(sub => sub.userId === actorId).length;
  };

  const countSubmissionsByActorThisMonth = (actorId: string): number => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    return submissions.filter(sub => {
      const subDate = new Date(sub.createdAt);
      return sub.userId === actorId && subDate.getMonth() === currentMonth && subDate.getFullYear() === currentYear;
    }).length;
  };
  
  const countPendingSubmissionsAssignedToTutor = (tutorId: string): number => {
    return submissions.filter(sub => sub.assignedTutorId === tutorId && sub.feedbackStatus === 'PENDING').length;
  };


  return (
    <SubmissionContext.Provider
      value={{
        submissions,
        feedbacks,
        addSubmission,
        assignTutorToSubmission,
        addFeedback,
        getSubmissionsForActor,
        getSubmissionsForTutorReview,
        getAssignedPendingSubmissions,
        getSubmissionById,
        getFeedbackById,
        getFeedbackForSubmission,
        getCompletedFeedbacksByTutor,
        countSubmissionsByActor,
        countSubmissionsByActorThisMonth,
        countPendingSubmissionsAssignedToTutor,
      }}
    >
      {children}
    </SubmissionContext.Provider>
  );
};

export const useSubmissions = (): SubmissionContextType => {
  const context = useContext(SubmissionContext);
  if (context === undefined) {
    throw new Error('useSubmissions must be used within a SubmissionsProvider');
  }
  return context;
};
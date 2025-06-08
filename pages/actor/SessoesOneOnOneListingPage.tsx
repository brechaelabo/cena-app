
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSessoesOneOnOne } from '../../contexts/SessoesOneOnOneContext';
import { Card } from '../../components/Common/Card';
import { Button } from '../../components/Common/Button';
import { CollapsibleCard } from '../../components/Common/CollapsibleCard';
import { 
    UserGroupIcon, BookOpenIcon, SparklesIcon, VideoCameraIcon, PuzzlePieceIcon, 
    LiveIndicatorIcon, CheckCircleIcon, XCircleIcon, InformationCircleIcon, ClockIcon, CalendarDaysIcon 
} from '../../components/Common/Icons';
import { PATHS } from '../../constants';
import { useToasts } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLiveSessions } from '../../contexts/LiveSessionContext';
import { usePlatformUsers } from '../../contexts/UserManagementContext';
import { ScheduledSession, Role } from '../../types';
import { formatFullDate } from '../../utils/dateFormatter';

const iconMap: { [key: string]: React.ElementType } = {
  BookOpenIcon,
  SparklesIcon,
  VideoCameraIcon,
  UserGroupIcon,
  PuzzlePieceIcon, 
};

const renderDateTimeBlockSimplified = (dateISOStr?: string) => {
    if (!dateISOStr) {
        return <p className="text-sm text-text-muted">Data/Hora a definir.</p>;
    }
    const formattedDate = formatFullDate(dateISOStr);
    const time = new Date(dateISOStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return (
        <div className="my-2 p-2 bg-gray-50 rounded-lg border border-border-subtle shadow-sm text-sm">
            <div className="flex items-center mb-1">
                <CalendarDaysIcon className="w-4 h-4 text-accent-blue-emphasis mr-2 flex-shrink-0" />
                <span className="text-text-body mr-1">Data:</span>
                <span className="font-semibold text-headings">{formattedDate.split(', ')[1]}</span>
            </div>
            <div className="flex items-center">
                <ClockIcon className="w-4 h-4 text-accent-blue-emphasis mr-2 flex-shrink-0" />
                <span className="text-text-body mr-1">Horário:</span>
                <span className="font-semibold text-headings">{time}</span>
            </div>
        </div>
    );
};


const SessoesOneOnOneListingPage: React.FC = () => {
  const { categorias } = useSessoesOneOnOne();
  const { addToast } = useToasts();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    getSessionsForTutor, 
    getSessionsForActor, 
    updateScheduledSessionStatus 
  } = useLiveSessions();
  const { getUserById: getPlatformUserByIdHook } = usePlatformUsers();

  const [userSessions, setUserSessions] = useState<ScheduledSession[]>([]);
  const [isMySessionsExpanded, setIsMySessionsExpanded] = useState(true);

  useEffect(() => {
    if (user?.id) {
      if (user.currentRole === Role.ACTOR) {
        setUserSessions(getSessionsForActor(user.id));
      } else if (user.currentRole === Role.TUTOR) {
        setUserSessions(getSessionsForTutor(user.id));
      }
    }
  }, [user, getSessionsForActor, getSessionsForTutor, user?.currentRole]); // Added user.currentRole dependency
  
  const handleUpdateSessionStatusLocal = async (sessionId: string, status: 'COMPLETED' | 'CANCELED') => {
    try {
        await updateScheduledSessionStatus(sessionId, status);
        addToast(`Sessão marcada como ${status === 'COMPLETED' ? 'Concluída' : 'Cancelada'}.`, 'success');
        if (user?.id && user.currentRole === Role.TUTOR) {
            setUserSessions(getSessionsForTutor(user.id));
        } else if (user?.id && user.currentRole === Role.ACTOR) {
             setUserSessions(getSessionsForActor(user.id)); // Also update for actor view
        }
    } catch (error: any) {
        addToast(error.message || 'Falha ao atualizar status da sessão.', 'error');
    }
  };


  const renderUserSessionsCard = () => {
    if (!user || (user.currentRole !== Role.ACTOR && user.currentRole !== Role.TUTOR)) return null;

    const titleString = user.currentRole === Role.TUTOR 
        ? `Minhas Sessões 1:1 Agendadas (${userSessions.length})`
        : `Minhas Sessões 1:1 Agendadas (${userSessions.length})`;

    return (
      <CollapsibleCard 
        title={<span className="text-black">{titleString}</span>} 
        defaultOpen={isMySessionsExpanded}
        className="mb-8 bg-private-sessions-bg"
      >
        {userSessions.length > 0 ? (
          <div className="space-y-4">
            {userSessions.map(session => (
              <Card key={session.id} className="p-0 bg-card-bg border border-border-subtle">
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-black mb-1">
                        {user.currentRole === Role.TUTOR 
                            ? `Sessão com: ${getPlatformUserByIdHook(session.actorId)?.name || session.actorName || 'Ator Desconhecido'}`
                            : `Sessão com Tutor: ${getPlatformUserByIdHook(session.tutorId)?.name || session.tutorName || 'Tutor'}`}
                      </h3>
                    </div>
                    <span className={`mt-2 sm:mt-0 px-3 py-1 text-xs font-semibold rounded-full self-start
                        ${session.status === 'SCHEDULED' ? 'bg-accent-blue-subtle text-accent-blue-marker' : 
                        session.status === 'COMPLETED' ? 'bg-status-active-bg text-status-active-text' : 
                        'bg-red-100 text-red-700'}`}>
                        {session.status === 'SCHEDULED' ? 'Agendada' : session.status === 'COMPLETED' ? 'Concluída' : 'Cancelada'}
                    </span>
                  </div>
                  {renderDateTimeBlockSimplified(session.scheduledAt)}
                  {session.notes && <p className="text-sm text-text-body mb-3 p-2 bg-gray-50 border border-dashed rounded-md"><strong>Notas:</strong> {session.notes}</p>}
                  <div className="flex flex-wrap gap-2 items-center">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => window.open(session.meetLink, '_blank')}
                      disabled={!session.meetLink}
                      leftIcon={<LiveIndicatorIcon className="w-4 h-4"/>}
                    >
                      Acessar Sala
                    </Button>
                    {user.currentRole === Role.TUTOR && session.status === 'SCHEDULED' && (
                      <>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          onClick={() => handleUpdateSessionStatusLocal(session.id, 'COMPLETED')}
                          leftIcon={<CheckCircleIcon className="w-4 h-4"/>}
                        >
                          Concluída
                        </Button>
                        <Button 
                          variant="danger" 
                          size="sm" 
                          onClick={() => handleUpdateSessionStatusLocal(session.id, 'CANCELED')}
                          leftIcon={<XCircleIcon className="w-4 h-4"/>}
                        >
                          Cancelar
                        </Button>
                      </>
                    )}
                    {user.currentRole === Role.ACTOR && session.status === 'COMPLETED' && (
                        <p className="text-sm text-status-active-text flex items-center"><CheckCircleIcon className="w-5 h-5 mr-1"/> Sessão concluída.</p>
                    )}
                    {user.currentRole === Role.ACTOR && session.status === 'CANCELED' && (
                        <p className="text-sm text-red-500 flex items-center"><InformationCircleIcon className="w-5 h-5 mr-1"/> Sessão cancelada pelo tutor.</p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-text-body">Você não tem sessões 1:1 agendadas.</p>
        )}
      </CollapsibleCard>
    );
  };


  const activeCategorias = categorias.filter(cat => cat.isActive);

  if (activeCategorias.length === 0 && userSessions.length === 0) { // Check if there's nothing to display at all
    return (
      <div className="text-center p-10 md:p-20">
        <UserGroupIcon className="w-20 h-20 md:w-28 md:h-28 text-text-muted mx-auto mb-6" />
        <h1 className="text-2xl md:text-4xl font-bold text-black mb-4">Sessões 1:1 Indisponíveis</h1>
        <p className="text-lg text-text-body mb-8 max-w-xl mx-auto">
          No momento, não há categorias de sessões individuais disponíveis ou sessões agendadas para você.
          Nossos tutores estão se preparando para oferecer o melhor atendimento. Volte em breve!
        </p>
        <Button onClick={() => navigate(PATHS.DASHBOARD)} variant="primary" size="lg">
          Voltar ao Painel
        </Button>
      </div>
    );
  }

  return (
    <div className="p-0">
      {renderUserSessionsCard()}

      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-black">Sessões Individuais 1:1</h1>
        <p className="text-lg text-text-body mt-2 max-w-2xl mx-auto">
          Potencialize seu desenvolvimento com sessões personalizadas, focadas nas suas necessidades e objetivos artísticos.
        </p>
      </div>

      {activeCategorias.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {activeCategorias.map(categoria => {
            const IconComponent = categoria.iconName ? iconMap[categoria.iconName] || PuzzlePieceIcon : PuzzlePieceIcon;
            return (
              <Link
                  key={categoria.id}
                  to={PATHS.SESSOES_ACTOR_CATEGORY_DETAIL.replace(':categorySlug', categoria.slug)}
                  className="block hover:no-underline focus:outline-none focus:ring-2 focus:ring-link-active focus:ring-offset-2 rounded-lg"
              >
                  <Card className="flex flex-col h-full p-0 hover:shadow-xl transition-shadow duration-300">
                      <div className="p-6 text-center bg-gray-50 rounded-t-lg">
                          <IconComponent className="w-12 h-12 text-link-active mx-auto mb-3" />
                      </div>
                      <div className="p-6 flex flex-col flex-grow">
                          <h2 className="text-xl font-bold text-black mb-2 text-center">{categoria.title}</h2>
                          <p className="text-sm text-text-body text-center mb-4 line-clamp-3 flex-grow">{categoria.description}</p>
                          <div className="mt-auto">
                              <Button 
                                  variant="secondary" 
                                  className="w-full"
                              >
                                  Saber Mais
                              </Button>
                          </div>
                      </div>
                  </Card>
              </Link>
            );
          })}
        </div>
      ) : (
         <Card className="text-center mt-8">
            <div className="py-10 md:py-16">
                <UserGroupIcon className="w-16 h-16 md:w-20 md:h-20 text-text-muted mx-auto mb-4" />
                <h2 className="text-xl md:text-2xl font-semibold text-headings mb-2">Nenhuma categoria de sessão disponível no momento</h2>
                <p className="text-text-body">Estamos trabalhando em novas opções. Volte em breve!</p>
            </div>
        </Card>
      )}
       <div className="mt-12 text-center">
            <p className="text-text-muted text-sm">
                As sessões 1:1 são uma ótima oportunidade para receber atenção individualizada e acelerar seu progresso.
            </p>
        </div>
    </div>
  );
};

export default SessoesOneOnOneListingPage;

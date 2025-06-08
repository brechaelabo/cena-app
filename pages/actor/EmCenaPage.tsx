
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/Common/Card';
import { Button } from '../../components/Common/Button';
import { PATHS } from '../../constants';
import { 
    SparklesIcon, 
    VideoCameraIcon, 
    ClipboardCheckIcon, 
    UserGroupIcon, 
    BookOpenIcon, 
    LiveIndicatorIcon, 
    EnvelopeIcon, 
    UserIcon as ProfileIcon, 
    SquaresPlusIcon, // Changed from ThemeIcon
    ChevronRightIcon
} from '../../components/Common/Icons';

const EmCenaPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null; 
  }

  const sections = [
    { 
      name: 'Tema do Mês', 
      path: PATHS.CURRENT_THEME, 
      icon: <SquaresPlusIcon className="w-8 h-8 text-link-active" />, // Changed here
      description: 'Explore o tema atual e os monólogo(s) da curadoria para esse mês.' 
    },
    { 
      name: 'Enviar Self-tape', 
      path: PATHS.ACTOR_SUBMIT_TAPE.replace(':themeId', 'current'), 
      icon: <VideoCameraIcon className="w-8 h-8 text-link-active" />, 
      description: 'Grave e envie sua self-tape para receber feedbacks valiosos de nossos tutores experientes.' 
    },
    { 
      name: 'Meus Feedbacks', 
      path: PATHS.ACTOR_VIEW_FEEDBACK.replace(':submissionId', 'all'), 
      icon: <ClipboardCheckIcon className="w-8 h-8 text-link-active" />, 
      description: 'Revise todos os feedbacks recebidos, analise sua evolução e identifique pontos de melhoria.' 
    },
    { 
      name: 'Sessões 1:1', 
      path: PATHS.SESSOES_ACTOR_LISTING, 
      icon: <UserGroupIcon className="w-8 h-8 text-link-active" />, 
      description: 'Agende sessões para acompanhamento ao vivo e personalizado, seja em regravações, testes reais ou aprofundamento técnico.' 
    },
    { name: 'Percursos', path: PATHS.PERCURSOS_ACTOR, icon: <BookOpenIcon className="w-8 h-8 text-link-active" />, description: 'Participe de cursos e workshops para aprofundar seus conhecimentos e técnicas de atuação.' },
    { name: 'Ao Vivo', path: PATHS.LIVE_SESSIONS, icon: <LiveIndicatorIcon className="w-8 h-8 text-link-active" />, description: 'Acompanhe eventos ao vivo, workshops e masterclasses com profissionais do mercado.' },
    { name: 'Mensagens', path: PATHS.MESSAGES, icon: <EnvelopeIcon className="w-8 h-8 text-link-active" />, description: 'Comunique-se com a plataforma e, em breve, com tutores (funcionalidade em desenvolvimento).' },
    { name: 'Meu Perfil', path: PATHS.ACTOR_PROFILE_FORM, icon: <ProfileIcon className="w-8 h-8 text-link-active" />, description: 'Gerencie suas informações pessoais, plano de assinatura e preferências.' },
  ];

  const cicloEssencialItems = [
    { name: 'Tema do Mês', path: PATHS.CURRENT_THEME, icon: <SquaresPlusIcon className="w-7 h-7" /> }, // Changed here
    { name: 'Enviar Self-tape', path: PATHS.ACTOR_SUBMIT_TAPE.replace(':themeId', 'current'), icon: <VideoCameraIcon className="w-7 h-7" /> },
    { name: 'Meus Feedbacks', path: PATHS.ACTOR_VIEW_FEEDBACK.replace(':submissionId', 'all'), icon: <ClipboardCheckIcon className="w-7 h-7" /> },
  ];

  const dicas = [
    "Qualidade do Self-tape: Lembre-se de boa iluminação, som claro e um fundo neutro.",
    "Feedbacks Construtivos: Use os feedbacks para regravar suas cenas e observar sua evolução.",
    "Interaja: Participe dos eventos ao vivo e explore os Percursos disponíveis.",
    "Explore os Materiais: Os PDFs e vídeos de referência do tema do mês são ricos em conteúdo.",
    "Consistência é Chave: A prática regular é o caminho para o aprimoramento contínuo."
  ];

  const novidades = [
    { title: "Novo Percurso Disponível!", date: "15 JUL", content: "Inscreva-se no workshop 'A Voz do Ator: Técnicas e Expressividade'."},
    { title: "Sessões 1:1 Abertas!", date: "10 JUL", content: "Agende sua sessão individual para análise de texto ou preparação para testes." },
    { title: "Atualização da Plataforma", date: "05 JUL", content: "Melhorias de performance e usabilidade implementadas." },
  ];

  return (
    <div className="space-y-8 p-0">
      <Card className="bg-gradient-to-r from-brand-primary to-brand-accent text-white shadow-xl">
        <div className="p-6 md:p-8">
          <SparklesIcon className="w-12 h-12 mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Olá, {user.name || 'Ator/Atriz'}! Bem-vindo(a) à CENA - a plataforma do ator.
          </h1>
          <p className="text-lg text-text-primary">
            Este é o seu espaço para praticar e evoluir na sua arte e em suas estratégias de carreira.
            Explore as seções abaixo e aproveite ao máximo sua jornada.
          </p>
        </div>
      </Card>

      <Card title="Seu Ciclo Essencial de Prática na CENA" className="bg-card-bg">
        <div className="p-5 flex flex-col sm:flex-row justify-around items-center space-y-4 sm:space-y-0 sm:space-x-4">
          {cicloEssencialItems.map((item, index) => (
            <React.Fragment key={item.name}>
              <Link to={item.path} className="flex-1 group text-center p-3 hover:bg-gray-100 rounded-lg transition-colors duration-150">
                <div className="flex flex-col items-center">
                  <div className="p-3 bg-link-active text-white rounded-full mb-2 group-hover:bg-blue-700 transition-colors">
                    {item.icon}
                  </div>
                  <span className="font-semibold text-text-headings group-hover:text-link-active transition-colors">{item.name}</span>
                </div>
              </Link>
              {index < cicloEssencialItems.length - 1 && (
                <ChevronRightIcon className="w-8 h-8 text-text-muted hidden sm:block" />
              )}
            </React.Fragment>
          ))}
        </div>
      </Card>

      {/* Card "Lembretes da Semana" removido */}

      <Card title="Navegue pela Plataforma">
        <div className="grid grid-cols-2 gap-4 md:gap-6">
          {sections.map(section => (
            <Link key={section.name} to={section.path} className="block hover:no-underline group">
              <Card className="h-full hover:shadow-lg transition-shadow duration-200 p-0 flex flex-col">
                <div className="p-5 text-center flex flex-col items-center justify-start h-full">
                  <div className="mb-2 text-link-active group-hover:text-blue-700 transition-colors">
                    {React.cloneElement(section.icon, { className: "w-8 h-8" })}
                  </div>
                  <h3 className="text-md font-semibold text-black mb-1 group-hover:text-link-active transition-colors">{section.name}</h3>
                  <p className="text-xs text-text-body text-center line-clamp-3 flex-grow">{section.description}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-8">
        <Card title="Dicas para Potencializar sua Prática" className="bg-card-bg">
            <div className="p-5 space-y-4">
                {dicas.map((dica, index) => (
                    <div key={index} className="flex items-start">
                        <SparklesIcon className="w-5 h-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />
                        <p className="text-text-body text-sm">{dica}</p>
                    </div>
                ))}
            </div>
        </Card>
        
        <Card title="Fique por Dentro: Novidades e Avisos" className="bg-card-bg">
            <div className="p-5 space-y-4">
                {novidades.map((novidade, index) => (
                    <div key={index} className={`pb-3 ${index < novidades.length -1 ? 'border-b border-border-subtle' : ''}`}>
                        <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-md text-black">{novidade.title}</h4>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{novidade.date}</span>
                        </div>
                        <p className="text-text-body text-sm">{novidade.content}</p>
                    </div>
                ))}
            </div>
        </Card>
      </div>

    </div>
  );
};

export default EmCenaPage;

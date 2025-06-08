

import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/Common/Card';
import { Button } from '../../components/Common/Button';
import { PATHS } from '../../constants';
import { VideoCameraIcon, UserGroupIcon, PaperAirplaneIcon, LiveIndicatorIcon, AcademicCapIcon } from '../../components/Common/Icons'; 

const MOCK_TUTOR_STATS = {
  pendingReviews: 3,
  assignedActors: 12,
  feedbacksGivenThisMonth: 8,
  upcomingSessions: 2, // New mock data
};

const TutorDashboard: React.FC = () => {
  return (
    <div className="p-0"> {/* PageWrapper provides padding */}
      <h1 className="text-2xl md:text-3xl font-bold text-black mb-8">Painel do Tutor</h1> {/* Changed to text-black */}
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        <Card title="Revisões Pendentes" className="p-0"> {/* Card uses bg-card-bg */}
          <div className="p-5 md:p-6 text-center">
            <VideoCameraIcon className="w-10 h-10 md:w-12 md:h-12 text-link-active mx-auto mb-2" />
            <p className="text-3xl md:text-4xl font-bold text-headings mb-2">{MOCK_TUTOR_STATS.pendingReviews}</p>
            <p className="text-text-body mb-6">Self-tapes aguardando seu feedback.</p>
            <Link to={PATHS.TUTOR_REVIEW_SUBMISSIONS}>
              <Button variant="primary" className="w-full rounded-lg">Ver Envios</Button>
            </Link>
          </div>
        </Card>

        <Card title="Atores Designados" className="p-0">
          <div className="p-5 md:p-6 text-center">
            <UserGroupIcon className="w-10 h-10 md:w-12 md:h-12 text-link-active mx-auto mb-2" />
            <p className="text-3xl md:text-4xl font-bold text-headings mb-2">{MOCK_TUTOR_STATS.assignedActors}</p>
            <p className="text-text-body mb-6">Atores sob sua tutoria.</p>
            <Button variant="secondary" className="w-full rounded-lg" disabled>Ver Atores (Em Breve)</Button> 
          </div>
        </Card>
        
        <Card title="Feedbacks Enviados" className="p-0">
          <div className="p-5 md:p-6 text-center">
            <PaperAirplaneIcon className="w-10 h-10 md:w-12 md:h-12 text-link-active mx-auto mb-2" /> 
            <p className="text-3xl md:text-4xl font-bold text-headings mb-2">{MOCK_TUTOR_STATS.feedbacksGivenThisMonth}</p>
            <p className="text-text-body mb-6">Feedbacks que você enviou este mês.</p>
            <Link to={PATHS.TUTOR_COMPLETED_FEEDBACKS}>
                <Button variant="secondary" className="w-full rounded-lg">Ver Histórico</Button>
            </Link>
          </div>
        </Card>

        {/* New Card: Gerenciar Sessões Ao Vivo */}
        <Card title="Gerenciar Sessões Ao Vivo" className="p-0">
          <div className="p-5 md:p-6 text-center">
            <LiveIndicatorIcon className="w-10 h-10 md:w-12 md:h-12 text-link-active mx-auto mb-2" />
            <p className="text-3xl md:text-4xl font-bold text-headings mb-2">{MOCK_TUTOR_STATS.upcomingSessions}</p>
            <p className="text-text-body mb-6">Agende e gerencie suas sessões 1:1 com atores. Acompanhe também os eventos públicos da plataforma.</p>
            <Link to={PATHS.LIVE_SESSIONS}>
              <Button variant="secondary" className="w-full rounded-lg">Acessar Agendamentos</Button>
            </Link>
          </div>
        </Card>

        {/* New Card: Recursos para Tutores */}
        <Card title="Recursos para Tutores" className="p-0">
          <div className="p-5 md:p-6 text-center">
            <AcademicCapIcon className="w-10 h-10 md:w-12 md:h-12 text-link-active mx-auto mb-2" />
            <p className="text-text-body my-6 py-2">Acesse guias de melhores práticas para feedback, materiais de apoio e ferramentas para aprimorar sua tutoria.</p>
            <Button variant="secondary" className="w-full rounded-lg" disabled>Ver Materiais (Em Breve)</Button>
          </div>
        </Card>

      </div>

      <div className="mt-10">
        <Card title="Dicas para Tutores" className="p-0">
            <div className="p-5 md:p-6">
                <ul className="list-disc list-inside text-text-body space-y-2 pl-2">
                    <li>Seja específico e construtivo em seus feedbacks.</li>
                    <li>Utilize exemplos práticos para ilustrar seus pontos.</li>
                    <li>Mantenha um tom encorajador e profissional.</li>
                    <li>Respeite os prazos para envio dos feedbacks.</li>
                </ul>
            </div>
        </Card>
      </div>
    </div>
  );
};

export default TutorDashboard;
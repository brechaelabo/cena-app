
import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/Common/Card';
import { Button } from '../../components/Common/Button';
import { PATHS } from '../../constants';
import { SquaresPlusIcon, AcademicCapIcon, PlusCircleIcon, ChartPieIcon, BookOpenIcon, UserGroupIcon } from '../../components/Common/Icons'; // Removed ChatBubbleLeftRightIcon, added UserGroupIcon

const AdminDashboard: React.FC = () => {
  return (
    <div className="p-0"> 
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 md:mb-8 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-black">Painel do Administrador</h1>
        <Link to={PATHS.ADMIN_CREATE_THEME}>
            <Button variant="primary" leftIcon={<PlusCircleIcon className="w-5 h-5"/>} className="rounded-lg">Novo Tema</Button>
        </Link>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        <Card title="Gerenciar Temas" className="p-0"> 
          <div className="p-5 md:p-6 text-center"> 
            <SquaresPlusIcon className="w-10 h-10 md:w-12 md:h-12 text-link-active mx-auto mb-4" /> 
            <p className="text-text-body mb-6">
              Crie, edite e gerencie os temas mensais da plataforma.
            </p>
            <Link to={PATHS.ADMIN_MANAGE_THEMES}>
              <Button variant="secondary" className="w-full rounded-lg">Ver Temas</Button>
            </Link>
          </div>
        </Card>

        <Card title="Gerenciar Percursos" className="p-0"> 
          <div className="p-5 md:p-6 text-center"> 
            <BookOpenIcon className="w-10 h-10 md:w-12 md:h-12 text-link-active mx-auto mb-4" /> 
            <p className="text-text-body mb-6">
              Crie, edite e publique cursos e workshops para os atores.
            </p>
            <Link to={PATHS.ADMIN_MANAGE_PERCURSOS}>
              <Button variant="secondary" className="w-full rounded-lg">Ver Percursos</Button>
            </Link>
          </div>
        </Card>
        
        <Card title="Gerenciar Sessões 1:1" className="p-0">
          <div className="p-5 md:p-6 text-center"> 
            <UserGroupIcon className="w-10 h-10 md:w-12 md:h-12 text-link-active mx-auto mb-4" /> 
            <p className="text-text-body mb-6">
              Defina e gerencie as categorias de sessões individuais oferecidas.
            </p>
            <Link to={PATHS.ADMIN_MANAGE_SESSOES}>
                <Button variant="secondary" className="w-full rounded-lg">Gerenciar Categorias</Button>
            </Link>
          </div>
        </Card>

        <Card title="Gerenciar Usuários" className="p-0">
          <div className="p-5 md:p-6 text-center">
            <UserGroupIcon className="w-10 h-10 md:w-12 md:h-12 text-link-active mx-auto mb-4" /> 
            <p className="text-text-body mb-6">
              Visualize e gerencie os usuários, seus papéis e planos.
            </p>
            <Link to={PATHS.ADMIN_MANAGE_USERS}>
              <Button variant="secondary" className="w-full rounded-lg">Ver Usuários</Button>
            </Link>
          </div>
        </Card>

        <Card title="Métricas da Plataforma" className="p-0">
           <div className="p-5 md:p-6 text-center opacity-60"> 
            <ChartPieIcon className="w-10 h-10 md:w-12 md:h-12 text-text-muted mx-auto mb-4" /> 
            <p className="text-text-body mb-6">
              Acompanhe o crescimento e engajamento na CENA. (Em Breve)
            </p>
            <Button variant="secondary" className="w-full rounded-lg" disabled>Ver Métricas</Button>
           </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
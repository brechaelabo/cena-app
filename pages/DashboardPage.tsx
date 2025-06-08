
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';
import { PATHS } from '../constants';
import AdminDashboard from './admin/AdminDashboard';
import TutorDashboard from './tutor/TutorDashboard';
// ActorDashboard is now ActorMessagesPage, and actors go to EmCenaPage from here.
// import ActorDashboard from './actor/ActorDashboard'; 

const DashboardPage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); 

  useEffect(() => {
    if (!isLoading && user && user.currentRole === Role.ACTOR && location.pathname === PATHS.DASHBOARD) {
      navigate(PATHS.ACTOR_EM_CENA, { replace: true });
    }
  }, [user, isLoading, navigate, location.pathname]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen p-6 bg-page-bg"><p className="text-xl text-text-body">Carregando seu painel...</p></div>;
  }

  if (!user) {
    navigate(PATHS.LOGIN, { state: { from: location }, replace: true }); 
    return <div className="flex justify-center items-center h-screen p-6 bg-page-bg"><p className="text-xl text-text-body">Redirecionando para login...</p></div>;
  }
  
  switch (user.currentRole) {
    case Role.ADMIN:
      return <AdminDashboard />;
    case Role.ACTOR:
      // This case should now be handled by the useEffect redirecting to EmCenaPage.
      // If somehow an actor lands here and is not redirected, show a fallback.
      return <div className="flex justify-center items-center h-screen p-6 bg-page-bg"><p className="text-xl text-text-body">Redirecionando para "Em Cena"...</p></div>;
    case Role.TUTOR:
      return <TutorDashboard />;
    case Role.GUEST:
      navigate(PATHS.CURRENT_THEME, { replace: true }); // Redirect guests to current theme
      return <div className="flex justify-center items-center h-screen p-6 bg-page-bg"><p className="text-xl text-text-body">Redirecionando...</p></div>;

    default:
      return (
        <div className="p-6 bg-page-bg">
          <h1 className="text-2xl md:text-3xl font-bold text-headings mb-4">Bem-vindo(a) à CENA, {user.name}!</h1>
          <p className="text-text-body mt-2">Selecione uma opção no menu lateral para começar.</p>
        </div>
      );
  }
};

export default DashboardPage;
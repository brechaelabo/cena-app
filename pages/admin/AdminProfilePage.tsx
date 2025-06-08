
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/Common/Card';
import { Button } from '../../components/Common/Button';
import { TrajectoryCard } from '../../components/Profile/TrajectoryCard'; // New
import { UserIcon, LogoutIcon, CameraIcon, LockClosedIcon, SquaresPlusIcon, BookOpenIcon, UserGroupIcon as UsersIcon, AcademicCapIcon } from '../../components/Common/Icons';
import { ROLE_NAMES, PATHS } from '../../constants'; // MOCK_ASSETS_URL removed
import { useNavigate } from 'react-router-dom';
import { useToasts } from '../../contexts/ToastContext';
import { useThemes } from '../../contexts/ThemeContext'; // New
import { usePercursos } from '../../contexts/PercursosContext'; // New
import { useSessoesOneOnOne } from '../../contexts/SessoesOneOnOneContext'; // New
import { usePlatformUsers } from '../../contexts/UserManagementContext'; // New
import { Role, TutorApplicationStatus } from '../../types'; // New

interface AdminTrajectoryStats {
  themesCreated: number;
  coursesCreated: number;
  sessionCategoriesCreated: number;
  usersManaged: number;
  activeTutors: number;
}

const AdminProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToasts();
  const { themes } = useThemes();
  const { courses } = usePercursos();
  const { categorias: sessoesCategorias } = useSessoesOneOnOne();
  const { platformUsers } = usePlatformUsers();
  
  const [adminStats, setAdminStats] = useState<AdminTrajectoryStats | null>(null);

  useEffect(() => {
    if (user && user.currentRole === Role.ADMIN) {
      setAdminStats({
        themesCreated: themes.length,
        coursesCreated: courses.length,
        sessionCategoriesCreated: sessoesCategorias.length,
        usersManaged: platformUsers.length,
        activeTutors: platformUsers.filter(u => u.currentRole === Role.TUTOR && u.isApproved && u.tutorApplicationStatus === TutorApplicationStatus.APPROVED).length,
      });
    }
  }, [user, themes, courses, sessoesCategorias, platformUsers]);


  if (!user) {
    return <div className="text-center p-10 text-text-body">Carregando perfil...</div>;
  }

  const handleLogout = () => {
    logout();
  };

  const handleSimulatedAction = (message: string) => {
    addToast(message, 'info');
  };

  const trajectoryStatsForCard = adminStats ? [
    { label: "Temas Criados", value: adminStats.themesCreated, icon: <SquaresPlusIcon /> },
    { label: "Percursos Criados", value: adminStats.coursesCreated, icon: <BookOpenIcon /> },
    { label: "Categorias de Sessão 1:1", value: adminStats.sessionCategoriesCreated, icon: <UsersIcon /> },
    { label: "Usuários Gerenciados", value: adminStats.usersManaged, icon: <UsersIcon /> },
    { label: "Tutores Ativos", value: adminStats.activeTutors, icon: <AcademicCapIcon /> },
  ] : [];
  
  const adminImage = user.imageUrl || `/placeholder-images/profile-admin-default-${user.id.substring(0,5)}-120x120.jpg`;


  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-black mb-8">Meu Perfil de Administrador</h1>
      
      {adminStats && (
        <TrajectoryCard stats={trajectoryStatsForCard} gridCols="grid-cols-2 md:grid-cols-3 lg:grid-cols-3" />
      )}

      <Card title="Informações da Conta" className="bg-card-bg">
        <div className="p-6 space-y-4">
          <div className="flex flex-col items-center mb-6">
            <img 
              src={adminImage} 
              alt={user.name || "Admin"} 
              className="w-32 h-32 rounded-full object-cover border-2 border-border-subtle shadow-md mb-3"
            />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleSimulatedAction("Funcionalidade 'Alterar Foto de Perfil' não implementada neste demo.")}
              leftIcon={<CameraIcon className="w-4 h-4" />}
            >
              Alterar Foto
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-text-muted">Nome</p>
              <p className="text-lg font-semibold text-text-headings">{user.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-text-muted">Email</p>
              <p className="text-lg font-semibold text-text-headings">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-text-muted">Cargo</p>
              <p className="text-lg font-semibold text-text-headings">{ROLE_NAMES[user.currentRole]}</p>
            </div>
          </div>
          
           <div className="mt-6 pt-6 border-t border-border-subtle space-y-3">
             <Button 
                variant="secondary" 
                onClick={() => handleSimulatedAction("Funcionalidade 'Alterar Senha' não implementada neste demo.")}
                leftIcon={<LockClosedIcon className="w-5 h-5"/>}
                className="w-full sm:w-auto"
              >
                Alterar Senha
             </Button>
             <Button 
                variant="danger" 
                onClick={handleLogout}
                leftIcon={<LogoutIcon className="w-5 h-5"/>}
                className="w-full sm:w-auto"
              >
                Sair da Plataforma
             </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminProfilePage;

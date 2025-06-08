
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/Common/Card';
import { Button } from '../../components/Common/Button';
import { TrajectoryCard } from '../../components/Profile/TrajectoryCard'; // New
import { UserIcon, LogoutIcon, CameraIcon, LockClosedIcon, MenuIcon as ThemeIcon, LiveIndicatorIcon, CalendarDaysIcon } from '../../components/Common/Icons';
import { ROLE_NAMES, PATHS } from '../../constants'; // MOCK_ASSETS_URL removed
import { useNavigate } from 'react-router-dom';
import { useToasts } from '../../contexts/ToastContext';
import { getDaysSince } from '../../utils/dateFormatter'; // New

interface GuestTrajectoryStats {
  themesExplored: number;
  liveSessionsParticipated: number;
  daysAsGuest: number;
}

const GuestProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToasts();

  const [guestStats, setGuestStats] = useState<GuestTrajectoryStats | null>(null);

  useEffect(() => {
    if (user) {
      setGuestStats({
        themesExplored: 1, // Mock data
        liveSessionsParticipated: 0, // Mock data
        daysAsGuest: getDaysSince(user.createdAt),
      });
    }
  }, [user]);


  if (!user) {
    return <div className="text-center p-10 text-text-body">Carregando perfil...</div>;
  }
  
  const handleLogout = () => {
    logout();
  };

  const handleSimulatedAction = (message: string) => {
    addToast(message, 'info');
  };

  const trajectoryStatsForCard = guestStats ? [
    { label: "Temas Explorados", value: guestStats.themesExplored, icon: <ThemeIcon /> },
    { label: "Sessões Ao Vivo Assistidas", value: guestStats.liveSessionsParticipated, icon: <LiveIndicatorIcon /> },
    { label: "Dias como Convidado(a)", value: guestStats.daysAsGuest, icon: <CalendarDaysIcon /> },
  ] : [];
  
  const guestImage = user.imageUrl || `/placeholder-images/profile-guest-default-${user.id.substring(0,5)}-120x120.jpg`;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-black mb-8">Meu Perfil de Convidado(a)</h1>
      
      {guestStats && (
        <TrajectoryCard stats={trajectoryStatsForCard} gridCols="grid-cols-1 md:grid-cols-3" />
      )}

      <Card title="Informações da Conta" className="bg-card-bg">
        <div className="p-6 space-y-4">
           <div className="flex flex-col items-center mb-6">
            <img 
              src={guestImage} 
              alt={user.name || "Convidado"} 
              className="w-32 h-32 rounded-full object-cover border-2 border-border-subtle shadow-md mb-3"
            />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleSimulatedAction("Funcionalidade 'Alterar Foto de Perfil' não implementada neste demo.")}
              leftIcon={<CameraIcon className="w-4 h-4" />}
              disabled // Guests typically cannot change profile pictures
            >
              Alterar Foto (Indisponível para Convidados)
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
              <p className="text-sm text-text-muted">Tipo de Acesso</p>
              <p className="text-lg font-semibold text-text-headings">{ROLE_NAMES[user.currentRole]}</p>
            </div>
             <div>
              <p className="text-sm text-text-muted">Status da Conta</p>
              <p className={`text-lg font-semibold ${user.isApproved ? 'text-status-active-text' : 'text-status-inactive-text'}`}>
                {user.isApproved ? 'Aprovado' : 'Aprovação Pendente'}
              </p>
            </div>
          </div>
           <div className="mt-6 pt-6 border-t border-border-subtle space-y-3">
             <Button 
                variant="secondary" 
                onClick={() => handleSimulatedAction("Funcionalidade 'Alterar Senha' não implementada neste demo.")}
                leftIcon={<LockClosedIcon className="w-5 h-5"/>}
                className="w-full sm:w-auto"
                disabled // Guests typically cannot change passwords
              >
                Alterar Senha (Indisponível para Convidados)
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
       <p className="text-sm text-text-muted text-center mt-6">
        Como convidado(a), seu acesso à plataforma pode ser limitado. Para funcionalidades completas, considere <a href={PATHS.PRICING} className="text-link-active hover:underline">nossos planos</a>.
      </p>
    </div>
  );
};

export default GuestProfilePage;

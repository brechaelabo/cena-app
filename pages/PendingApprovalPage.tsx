
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Common/Card';
import { Button } from '../components/Common/Button';
import { PATHS } from '../constants';
import { useAuth } from '../contexts/AuthContext';

const PendingApprovalPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout(); // Navigates to Home
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-dark p-4 text-center">
      <Card title="Aguardando Aprovação" className="max-w-lg mx-auto bg-brand-primary text-white">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-yellow-400 mx-auto mb-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-text-secondary mb-3">
          Obrigado por se registrar na plataforma CENA!
        </p>
        <p className="text-text-secondary mb-6">
          Sua conta está atualmente aguardando aprovação de um administrador.
          Você será notificado por e-mail assim que sua conta for ativada. Este processo não costuma demorar.
        </p>
        <p className="text-text-secondary mb-6">
          Enquanto isso, você pode explorar nossa <a href={PATHS.HOME} className="text-yellow-400 hover:underline">página inicial</a> ou verificar nossos <a href={PATHS.PRICING} className="text-yellow-400 hover:underline">planos</a>.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Button onClick={() => navigate(PATHS.HOME)} variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-brand-primary">
                Ir para Home
            </Button>
            <Button onClick={handleLogout} variant="secondary" className="w-full sm:w-auto">
                Sair
            </Button>
        </div>
      </Card>
    </div>
  );
};

export default PendingApprovalPage;

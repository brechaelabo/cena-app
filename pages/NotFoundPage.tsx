
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '../constants';
import { Button } from '../components/Common/Button';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-page-bg text-text-body">
      <img src="/placeholder-images/general-404-empty-stage-300x200.jpg" alt="Palco Vazio" className="rounded-lg shadow-xl mb-8 w-[300px] h-[200px] object-cover bg-gray-200" />
      <h1 className="text-5xl md:text-6xl font-bold text-headings mb-4">404</h1>
      <h2 className="text-2xl md:text-3xl font-semibold text-headings mb-4">Oops! Página não encontrada.</h2>
      <p className="text-text-muted mb-8 max-w-md">
        Parece que o roteiro desta página se perdeu. Que tal voltar ao início do espetáculo?
      </p>
      <Button variant="primary" size="lg" onClick={() => navigate(PATHS.HOME)} className="rounded-lg">
        Voltar para a Home Page
      </Button>
    </div>
  );
};

export default NotFoundPage;
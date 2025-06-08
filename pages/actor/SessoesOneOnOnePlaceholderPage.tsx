
import React from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Added Link
import { Button } from '../../components/Common/Button';
import { Card } from '../../components/Common/Card';
import { UserGroupIcon, LockClosedIcon } from '../../components/Common/Icons';
import { PATHS } from '../../constants';

const SessoesOneOnOnePlaceholderPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center text-center p-6 bg-page-bg">
      <Card className="max-w-lg w-full">
        <UserGroupIcon className="w-16 h-16 text-text-muted mx-auto mb-5" />
        <h1 className="text-2xl md:text-3xl font-bold text-headings mb-3">Sessões 1:1 em Desenvolvimento</h1>
        <p className="text-text-body mb-6">
          Estamos preparando um espaço exclusivo para sessões individuais com nossos tutores,
          focadas em suas necessidades específicas como preparação para testes, análise de texto e muito mais.
        </p>
        <p className="text-text-body mb-8">
          Aguarde! Esta funcionalidade estará disponível em breve para potencializar ainda mais sua jornada.
           Enquanto isso, você pode explorar nossos <Link to={PATHS.PERCURSOS_ACTOR} className="text-link-active hover:underline">Percursos</Link>.
        </p>
        <Button variant="primary" onClick={() => navigate(PATHS.DASHBOARD)}>
          Voltar ao Painel
        </Button>
      </Card>
    </div>
  );
};

export default SessoesOneOnOnePlaceholderPage;

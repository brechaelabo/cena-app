
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSessoesOneOnOne } from '../../contexts/SessoesOneOnOneContext';
import { Card } from '../../components/Common/Card';
import { Button } from '../../components/Common/Button';
import { 
    ArrowLeftIcon, 
    UserGroupIcon, 
    BookOpenIcon, 
    SparklesIcon, 
    VideoCameraIcon, 
    PuzzlePieceIcon 
} from '../../components/Common/Icons';
import { PATHS } from '../../constants';
import { useToasts } from '../../contexts/ToastContext';

const iconMap: { [key: string]: React.ElementType } = {
  BookOpenIcon,
  SparklesIcon,
  VideoCameraIcon,
  UserGroupIcon,
  PuzzlePieceIcon,
};

const SessaoOneOnOneCategoryPage: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const { getCategoriaBySlug } = useSessoesOneOnOne();
  const { addToast } = useToasts();
  const navigate = useNavigate();

  const categoria = categorySlug ? getCategoriaBySlug(categorySlug) : undefined;

  if (!categoria || !categoria.isActive) {
    return (
      <div className="text-center p-10">
        <UserGroupIcon className="w-24 h-24 text-text-muted mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-headings mb-4">Categoria de Sessão Não Encontrada</h1>
        <p className="text-text-body mb-6">
          Esta categoria de sessão 1:1 não foi encontrada ou não está mais disponível.
        </p>
        <Button onClick={() => navigate(PATHS.SESSOES_ACTOR_LISTING)} variant="secondary">
          Ver todas as Categorias de Sessão
        </Button>
      </div>
    );
  }

  const handleSolicitarSessao = () => {
    // In a real app, this would open a booking form, calendar, or contact modal.
    addToast(`Solicitação para sessão de "${categoria.title}" enviada! (Simulação) Entraremos em contato em breve.`, 'success');
  };
  
  const IconComponent = categoria.iconName ? iconMap[categoria.iconName] || PuzzlePieceIcon : PuzzlePieceIcon;

  return (
    <div>
      <Button 
        variant="ghost" 
        onClick={() => navigate(PATHS.SESSOES_ACTOR_LISTING)} 
        className="mb-6 text-text-muted hover:text-link-active group inline-flex items-center"
      >
        <ArrowLeftIcon className="w-5 h-5 mr-1.5 text-text-muted group-hover:text-link-active transition-colors" /> Voltar para Categorias de Sessão
      </Button>

      <Card className="p-0 overflow-hidden">
         <div className="p-6 md:p-8 bg-gray-50 flex flex-col sm:flex-row items-center sm:space-x-6 rounded-t-lg">
            <IconComponent className="w-16 h-16 md:w-20 md:h-20 text-link-active mb-4 sm:mb-0 flex-shrink-0" />
            <div className="text-center sm:text-left">
                <h1 className="text-3xl md:text-4xl font-bold text-black">{categoria.title}</h1>
            </div>
         </div>

        <div className="p-6 md:p-8">
          <h2 className="text-xl font-semibold text-headings mb-3">O que esperar desta sessão?</h2>
          <p className="text-text-body whitespace-pre-line leading-relaxed">{categoria.longDescription}</p>
          
          <div className="mt-8 pt-6 border-t border-border-subtle text-center">
            <Button 
              variant="primary" 
              size="lg" 
              onClick={handleSolicitarSessao}
              className="w-full sm:w-auto rounded-lg"
              leftIcon={<UserGroupIcon className="w-5 h-5" />}
            >
              Solicitar Sessão de {categoria.title}
            </Button>
             <p className="text-xs text-text-muted mt-4">
                Após a solicitação, nossa equipe ou um tutor entrará em contato para agendar os detalhes.
                Sessões 1:1 são cobradas à parte ou podem estar inclusas em pacotes promocionais.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SessaoOneOnOneCategoryPage;

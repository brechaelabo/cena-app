
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/Common/Button';
import { Card } from '../../components/Common/Card';
import { Input } from '../../components/Common/Input';
import { PATHS } from '../../constants';
import { Theme, SubmissionFormData, FeedbackMode, SubmissionCreateData } from '../../types';
import { ArrowLeftIcon, XMarkIcon as RemoveIcon } from '../../components/Common/Icons'; 
import { useAuth } from '../../contexts/AuthContext';
import { useSubmissions } from '../../contexts/SubmissionContext'; 
import { useThemes } from '../../contexts/ThemeContext'; 
import { useToasts } from '../../contexts/ToastContext'; 
import { formatMonthYear } from '../../utils/dateFormatter'; // Added

const ActorSubmitTapePage: React.FC = () => {
  const navigate = useNavigate();
  const { themeId } = useParams<{ themeId: string }>();
  const { user } = useAuth();
  const { addSubmission } = useSubmissions(); 
  const { getThemeById, getActiveTheme } = useThemes();
  const { addToast } = useToasts(); 

  const [theme, setTheme] = useState<Theme | null>(null);
  const [formData, setFormData] = useState<SubmissionFormData>({ tapeUrls: [''] });
  const [isLoadingTheme, setIsLoadingTheme] = useState(false); 
  const [isSubmitting, setIsSubmitting] = useState(false); 

  useEffect(() => {
    if (themeId) {
      setIsLoadingTheme(true);
      let fetchedTheme: Theme | undefined = undefined;

      if (themeId.toLowerCase() === 'current') {
        fetchedTheme = getActiveTheme();
      } else {
        fetchedTheme = getThemeById(themeId);
      }
      
      if (fetchedTheme) {
        setTheme(fetchedTheme);
      } else {
        const errorMessage = themeId.toLowerCase() === 'current' 
          ? "Nenhum tema ativo encontrado no momento." 
          : "Tema não encontrado ou não está mais ativo.";
        addToast(errorMessage, 'error');
      }
      setIsLoadingTheme(false);
    } else {
      addToast("ID do tema não fornecido.", 'error');
      navigate(PATHS.ACTOR_EM_CENA); 
    }
  }, [themeId, navigate, getThemeById, getActiveTheme, addToast]);

  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...formData.tapeUrls];
    newUrls[index] = value;
    setFormData({ tapeUrls: newUrls });
  };

  const addUrlField = () => {
    if (formData.tapeUrls.length < 5) {
      setFormData({ tapeUrls: [...formData.tapeUrls, ''] });
    }
  };
  
  const removeUrlField = (index: number) => {
    if (formData.tapeUrls.length > 1) {
      setFormData({ tapeUrls: formData.tapeUrls.filter((_, i) => i !== index) });
    } else {
      setFormData({ tapeUrls: [''] }); 
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !theme) {
      addToast("Usuário ou tema não carregado. Tente novamente.", 'error');
      return;
    }
    setIsSubmitting(true);

    const validUrls = formData.tapeUrls.filter(url => url.trim() !== '');
    if (validUrls.length === 0) {
        addToast("Por favor, adicione pelo menos uma URL de vídeo do YouTube.", 'error');
        setIsSubmitting(false);
        return;
    }
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)[a-zA-Z0-9_-]{11}/;
    for (const url of validUrls) {
        if (!youtubeRegex.test(url)) {
            addToast(`URL inválida: "${url.substring(0,30)}...". Use apenas links válidos do YouTube (watch, youtu.be, embed).`, 'error');
            setIsSubmitting(false);
            return;
        }
    }

    try {
      const submissionData: SubmissionCreateData = {
        themeId: theme.id,
        userId: user.id,
        tapeUrls: validUrls.map(url => { 
            if (url.includes('youtu.be/')) {
                return `https://www.youtube.com/embed/${url.split('youtu.be/')[1].split('?')[0]}`;
            }
            if (url.includes('youtube.com/watch?v=')) {
                return `https://www.youtube.com/embed/${url.split('v=')[1].split('&')[0]}`;
            }
            return url.includes('youtube.com/embed/') ? url : `https://www.youtube.com/embed/${url.split('/').pop()}`; // Fallback assuming it's an embed or raw ID
        }),
        feedbackMode: FeedbackMode.ASYNC, 
      };
      await addSubmission(submissionData);
      setIsSubmitting(false);
      addToast('Self-tape enviado com sucesso!', 'success');
      navigate(PATHS.ACTOR_EM_CENA);
    } catch (submitError: any) {
      addToast(submitError.message || "Falha ao enviar self-tape.", 'error');
      setIsSubmitting(false);
    }
  };

  if (isLoadingTheme) {
    return <div className="text-center p-10 text-text-body">Carregando detalhes do tema...</div>;
  }
  
  if (!theme) {
    return (
      <div className="text-center p-10">
        <p className="text-red-500 text-xl">O tema não pôde ser carregado.</p>
        <Button onClick={() => navigate(PATHS.ACTOR_EM_CENA)} className="mt-4" disabled={isSubmitting}>Voltar ao Painel</Button>
      </div>
    );
  }
  const themeDateDisplay = formatMonthYear(theme.month, theme.year);
  const cardTitle = `Enviar Self-Tape para: ${theme.title}${themeDateDisplay ? ` (${themeDateDisplay})` : ''}`;

  return (
    <div>
      <Button 
        variant="ghost" 
        onClick={() => navigate(PATHS.CURRENT_THEME)} 
        className="mb-6 text-text-muted hover:text-link-active group inline-flex items-center"
        disabled={isSubmitting}
      >
        <ArrowLeftIcon className="w-5 h-5 mr-1.5 text-text-muted group-hover:text-link-active transition-colors" /> Voltar para Detalhes do Tema
      </Button>
      
      <Card title={cardTitle}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-body mb-2">
              Link(s) de vídeos do YouTube:
            </label>
            {formData.tapeUrls.map((url, index) => (
              <div key={index} className="flex items-center space-x-2 mb-3">
                <Input
                  type="url"
                  placeholder={`Link do YouTube para o vídeo ${index + 1}`}
                  value={url}
                  onChange={(e) => handleUrlChange(index, e.target.value)}
                  required={index === 0 && formData.tapeUrls.length === 1} 
                  className="flex-grow"
                  disabled={isSubmitting}
                />
                {formData.tapeUrls.length > 1 && (
                    <Button 
                        type="button" 
                        variant="danger" 
                        size="sm" 
                        onClick={() => removeUrlField(index)} 
                        disabled={isSubmitting}
                        iconOnly
                        title="Remover este vídeo"
                    >
                        <RemoveIcon className="w-4 h-4"/>
                    </Button>
                )}
              </div>
            ))}
            {formData.tapeUrls.length < 5 && (
              <Button type="button" variant="outline" size="sm" onClick={addUrlField} disabled={isSubmitting}>
                Adicionar outro vídeo
              </Button>
            )}
          </div>
          
          <p className="text-xs text-text-muted">
            Certifique-se de que seus vídeos no YouTube estão configurados como "Não listado" ou "Público" para que os tutores possam acessá-los.
          </p>

          <div className="pt-4 border-t border-border-subtle">
            <Button type="submit" variant="primary" isLoading={isSubmitting} disabled={isSubmitting} className="w-full md:w-auto">
              Enviar Self-Tape
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ActorSubmitTapePage;
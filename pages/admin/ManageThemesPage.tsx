
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/Common/Button';
import { Card } from '../../components/Common/Card';
import { PlusCircleIcon, FilmIcon, CalendarDaysIcon, DocumentTextIcon, VideoCameraIcon, CheckCircleIcon, XCircleIcon, InformationCircleIcon } from '../../components/Common/Icons';
import { PATHS } from '../../constants';
import { useThemes } from '../../contexts/ThemeContext';
import { Theme } from '../../types';
import { useToasts } from '../../contexts/ToastContext';
import { formatMonthYear } from '../../utils/dateFormatter'; // Added

const ManageThemesPage: React.FC = () => {
  const { themes, updateTheme } = useThemes();
  const { addToast } = useToasts();
  const [actionLoadingForThemeId, setActionLoadingForThemeId] = useState<string | null>(null);

  const toggleThemeStatus = async (themeToToggle: Theme) => {
    setActionLoadingForThemeId(themeToToggle.id);
    try {
      // Simulate API delay for better UX
      await new Promise(resolve => setTimeout(resolve, 700)); 
      updateTheme({ ...themeToToggle, active: !themeToToggle.active });
      addToast(`Tema "${themeToToggle.title}" ${!themeToToggle.active ? 'ativado' : 'desativado'} com sucesso.`, 'success');
    } catch (e) {
      addToast("Falha ao alterar status do tema.", 'error');
    } finally {
      setActionLoadingForThemeId(null);
    }
  };

  return (
    <div className="p-0"> {/* PageWrapper já tem padding */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 md:mb-8 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-black">Gerenciar Temas</h1>
        <Link to={PATHS.ADMIN_CREATE_THEME}>
          <Button variant="primary" leftIcon={<PlusCircleIcon className="w-5 h-5"/>}>
            Novo Tema
          </Button>
        </Link>
      </div>

      {themes.length === 0 && (
        <Card className="text-center"> {/* Card usa bg-card-bg (branco) */}
          <div className="py-10 md:py-16">
            <FilmIcon className="w-16 h-16 md:w-20 md:h-20 text-text-muted mx-auto mb-4" />
            <h2 className="text-xl md:text-2xl font-semibold text-headings mb-2">Nenhum tema cadastrado</h2>
            <p className="text-text-body mb-6">Crie o primeiro tema para iniciar as atividades na plataforma.</p>
            <Link to={PATHS.ADMIN_CREATE_THEME}>
              <Button variant="primary">Criar Novo Tema</Button>
            </Link>
          </div>
        </Card>
      )}

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
        {themes.map((theme) => {
          const themeDateDisplay = formatMonthYear(theme.month, theme.year);
          return (
            <Card key={theme.id} className="flex flex-col overflow-hidden"> {/* Card usa bg-card-bg */}
              {theme.headerImageDataUrl && (
                <img 
                  src={theme.headerImageDataUrl} 
                  alt={theme.title} 
                  className="w-full h-40 md:h-48 object-cover" 
                />
              )}
              <div className="p-4 md:p-5 flex flex-col flex-grow">
                <h2 className="text-lg md:text-xl font-semibold text-black mb-1 line-clamp-2 group-hover:text-link-active">{theme.title}</h2> {/* text-headings changed to text-black */}
                {themeDateDisplay && (
                  <p className="text-xs text-text-muted mb-2">
                    <span className="inline-block bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{themeDateDisplay}</span>
                  </p>
                )}
                
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs mb-3">
                  <span className={`px-2.5 py-0.5 rounded-full font-medium flex items-center ${theme.active ? 'bg-status-active-bg text-status-active-text' : 'bg-status-inactive-bg text-status-inactive-text'}`}>
                    {theme.active ? <CheckCircleIcon className="w-3.5 h-3.5 mr-1" /> : <XCircleIcon className="w-3.5 h-3.5 mr-1" />}
                    {theme.active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                <p className="text-sm text-text-body mb-4 line-clamp-3 flex-grow">{theme.description}</p>
                
                {(theme.pdfUrls && theme.pdfUrls.length > 0) && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-text-muted mb-1.5">PDFs Anexados:</p>
                    <ul className="space-y-1">
                      {theme.pdfUrls.map((pdfName, index) => (
                        <li key={index} className="text-xs text-link-active hover:underline flex items-center" title={pdfName}>
                          <DocumentTextIcon className="w-4 h-4 mr-1.5 text-text-muted flex-shrink-0"/> 
                          <span className="truncate">{pdfName}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {theme.videoUrl && (
                  <div className="mb-4">
                      <p className="text-xs font-medium text-text-muted mb-1.5">Vídeo de Referência:</p>
                      <a href={theme.videoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-link-active hover:underline flex items-center break-all">
                          <VideoCameraIcon className="w-4 h-4 mr-1.5 text-text-muted flex-shrink-0"/> 
                          <span className="truncate">{theme.videoUrl}</span>
                      </a>
                  </div>
                )}
                
                <div className="mt-auto pt-4 border-t border-border-subtle flex justify-end space-x-2">
                    <Link to={PATHS.ADMIN_EDIT_THEME.replace(':themeId', theme.id)}>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          disabled={!!actionLoadingForThemeId}
                        >
                          Editar
                        </Button>
                    </Link>
                    <Button 
                        variant={theme.active ? "danger" : "secondary"} 
                        size="sm" 
                        onClick={() => toggleThemeStatus(theme)}
                        isLoading={actionLoadingForThemeId === theme.id}
                        disabled={!!actionLoadingForThemeId && actionLoadingForThemeId !== theme.id}
                    >
                        {theme.active ? 'Desativar' : 'Ativar'}
                    </Button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  );
};

export default ManageThemesPage;

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useThemes } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Role } from '../../types';
import { Card } from '../../components/Common/Card';
import { Button } from '../../components/Common/Button';
import { FilmIcon, ArrowLeftIcon, DocumentTextIcon } from '../../components/Common/Icons';
import { PATHS } from '../../constants';
import { formatMonthYear } from '../../utils/dateFormatter'; // Added

const CurrentThemePage: React.FC = () => {
  const { getActiveTheme } = useThemes();
  const { user } = useAuth();
  const navigate = useNavigate();
  const activeTheme = getActiveTheme();

  const handlePdfDownload = (pdfName: string) => {
    // Simulate PDF download
    const fileContent = `Este é um PDF simulado para o arquivo: ${pdfName}\n\nEm uma aplicação real, o conteúdo do PDF real seria baixado.`;
    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = pdfName.endsWith('.pdf') ? pdfName : `${pdfName}.pdf`; // Ensure .pdf extension
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  if (!activeTheme) {
    return (
      <div className="p-6 text-center">
        <FilmIcon className="w-24 h-24 text-text-muted mx-auto mb-4" /> 
        <h1 className="text-3xl font-bold text-headings mb-4">Nenhum Tema Ativo</h1> 
        <p className="text-text-body mb-6"> 
          No momento, não há um tema ativo definido. Por favor, verifique mais tarde ou contate um administrador.
        </p>
        <Button onClick={() => navigate(PATHS.DASHBOARD)} variant="secondary"> 
            Voltar ao Painel
        </Button>
      </div>
    );
  }

  const themeDateDisplay = formatMonthYear(activeTheme.month, activeTheme.year);
  const cardTitle = `Tema do Mês: ${activeTheme.title}${themeDateDisplay ? ` (${themeDateDisplay})` : ''}`;


  return (
    <div>
       <Button 
        variant="ghost" 
        onClick={() => navigate(PATHS.DASHBOARD)} 
        className="mb-4 text-text-muted hover:text-link-active group inline-flex items-center"
      >
        <ArrowLeftIcon className="w-5 h-5 mr-1.5 text-text-muted group-hover:text-link-active transition-colors" /> Voltar ao Painel
      </Button>
      <Card title={cardTitle}> 
        {activeTheme.headerImageDataUrl && (
          <img 
            src={activeTheme.headerImageDataUrl} 
            alt={activeTheme.title} 
            className="rounded-md mb-6 max-h-80 w-full object-cover shadow-lg border border-border-subtle"
          />
        )}
        <p className="text-text-body text-lg mb-6">{activeTheme.description}</p>

        {activeTheme.videoUrl && (
          <div className="mb-8"> 
            <h3 className="text-xl font-semibold text-headings mb-3">Vídeo de Referência:</h3> 
            <div className="max-w-2xl mx-auto aspect-video rounded-lg overflow-hidden shadow-md border border-border-subtle">
              <iframe 
                  className="w-full h-full"
                  src={activeTheme.videoUrl.includes("youtube.com/embed") ? activeTheme.videoUrl : `https://www.youtube.com/embed/${activeTheme.videoUrl.split('v=')[1]?.split('&')[0] || activeTheme.videoUrl.split('/').pop()}`}
                  title="Vídeo de Referência do Tema"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen>
              </iframe>
            </div>
          </div>
        )}

        {activeTheme.pdfUrls && activeTheme.pdfUrls.length > 0 && (
          <div className="mb-8"> 
            <h3 className="text-xl font-semibold text-black mb-4">Monólogos da curadoria</h3> 
            <ul className="space-y-3"> 
              {activeTheme.pdfUrls.map((pdfName, index) => (
                <li 
                  key={index} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md shadow-sm border border-border-subtle hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <DocumentTextIcon className="w-5 h-5 text-text-muted mr-3 flex-shrink-0" />
                    <span className="text-text-body text-sm font-medium">{pdfName}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePdfDownload(pdfName)}
                  >
                    Baixar
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {user?.currentRole === Role.ACTOR && (
          <div className="mt-10 text-center"> 
            <Link to={PATHS.ACTOR_SUBMIT_TAPE.replace(':themeId', activeTheme.id)}>
              <Button variant="primary" size="lg"> 
                Enviar Self-tape para este Tema
              </Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CurrentThemePage;

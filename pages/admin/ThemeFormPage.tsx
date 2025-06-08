
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Button } from '../../components/Common/Button';
import { Card } from '../../components/Common/Card';
import { Input, Textarea } from '../../components/Common/Input';
import { PATHS } from '../../constants';
import { Theme, ThemeFormData } from '../../types';
import { ArrowLeftIcon, XMarkIcon, SparklesIcon } from '../../components/Common/Icons';
import { useThemes } from '../../contexts/ThemeContext';
import { useToasts } from '../../contexts/ToastContext';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';

const ThemeFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { themeId } = useParams<{ themeId: string }>();
  const { addTheme, updateTheme, getThemeById } = useThemes();
  const isEditing = Boolean(themeId);
  const { addToast } = useToasts();

  const [formData, setFormData] = useState<Partial<ThemeFormData>>({
    title: '',
    description: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    pdfUrls: [], 
    pdfFiles: [], 
    videoUrl: '',
    headerImageUrl: '', 
    headerImageFile: null,
    headerImageDataUrl: null,
    active: false, 
  });
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  
  // Robust AI client initialization
  let ai: GoogleGenAI | null = null;
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      try {
          ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      } catch (e) {
          console.error("Failed to initialize GoogleGenAI, API_KEY might be missing or invalid in this environment.", e);
          // ai remains null, feature will be disabled
      }
  } else if (typeof process === 'undefined') {
      console.warn("`process.env.API_KEY` not available in this browser environment. AI features requiring it will be disabled.");
  }


  useEffect(() => {
    if (isEditing && themeId) {
      const existingTheme = getThemeById(themeId);
      if (existingTheme) {
        setFormData({
            title: existingTheme.title,
            description: existingTheme.description,
            month: existingTheme.month,
            year: existingTheme.year,
            pdfUrls: existingTheme.pdfUrls || [],
            videoUrl: existingTheme.videoUrl || '',
            headerImageUrl: existingTheme.headerImageUrl || '',
            headerImageDataUrl: existingTheme.headerImageDataUrl,
            active: existingTheme.active,
            pdfFiles: Array(existingTheme.pdfUrls?.length || 0).fill(null),
            headerImageFile: null, 
        });
      } else {
        addToast("Tema não encontrado.", 'error');
        navigate(PATHS.ADMIN_MANAGE_THEMES);
      }
    }
  }, [isEditing, themeId, getThemeById, navigate, addToast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
        setFormData(prev => ({ ...prev, [name]: parseInt(value, 10) || '' }));
    }
    else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleHeaderImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({ ...prev, headerImageFile: file, headerImageUrl: file.name, headerImageDataUrl: null })); 
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, headerImageDataUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    } else {
      setFormData(prev => ({ ...prev, headerImageFile: null, headerImageUrl: isEditing ? prev.headerImageUrl : '', headerImageDataUrl: isEditing ? prev.headerImageDataUrl : null }));
    }
  };

  const handlePdfFileChange = (index: number, file: File | null) => {
    const newPdfFiles = [...(formData.pdfFiles || [])];
    const newPdfUrls = [...(formData.pdfUrls || [])]; 
    
    newPdfFiles[index] = file;
    if (file) {
        newPdfUrls[index] = file.name; 
    } else {
        newPdfUrls[index] = isEditing && formData.pdfUrls && formData.pdfUrls[index] ? formData.pdfUrls[index] : ''; 
    }
    setFormData(prev => ({ ...prev, pdfFiles: newPdfFiles, pdfUrls: newPdfUrls }));
  };

  const addPdfField = () => {
    if ((formData.pdfFiles?.length || 0) < 5) {
      setFormData(prev => ({
        ...prev,
        pdfFiles: [...(prev.pdfFiles || []), null],
        pdfUrls: [...(prev.pdfUrls || []), ''] 
      }));
    }
  };

  const removePdfField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      pdfFiles: prev.pdfFiles?.filter((_, i) => i !== index),
      pdfUrls: prev.pdfUrls?.filter((_, i) => i !== index)
    }));
  };

  const handleGenerateDescription = async () => {
    if (!formData.title) {
      addToast("Por favor, insira um título para o tema antes de gerar a descrição.", 'info');
      return;
    }
    if (!ai) {
      addToast("Funcionalidade de IA não disponível: API Key não configurada.", 'error');
      setIsGeneratingDescription(false);
      return;
    }

    setIsGeneratingDescription(true);
    try {
      const prompt = `Você é um assistente criativo especializado em artes cênicas. Gere uma descrição concisa e inspiradora para um tema de self-tape com o título: "${formData.title}". A descrição deve ter entre 2 a 4 frases, ser envolvente e motivar atores a explorar este tema para aprimorar suas habilidades de atuação. Evite frases genéricas e foque no potencial criativo e de aprendizado do tema. Retorne apenas o texto da descrição.`;
      
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: prompt,
      });
      
      const generatedText = response.text;
      setFormData(prev => ({ ...prev, description: generatedText }));
      addToast("Descrição gerada com sucesso pela IA!", 'success');

    } catch (error: any) {
      console.error("Error generating description with AI:", error);
      addToast(`Falha ao gerar descrição: ${error.message || 'Erro desconhecido'}`, 'error');
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingForm(true);
    
    try {
      const finalPdfUrls: string[] = [];
      (formData.pdfFiles || []).forEach((file, index) => {
        if (file) {
          finalPdfUrls.push(file.name); 
        } else if (formData.pdfUrls && formData.pdfUrls[index] && formData.pdfUrls[index] !== '') {
          finalPdfUrls.push(formData.pdfUrls[index]); 
        }
      });

      const themeToSubmit: Theme = {
          id: isEditing && themeId ? themeId : `theme-${Date.now()}`,
          title: formData.title || 'Sem Título',
          description: formData.description || '',
          month: formData.month || new Date().getMonth() + 1,
          year: formData.year || new Date().getFullYear(),
          pdfUrls: finalPdfUrls.filter(name => name), 
          videoUrl: formData.videoUrl || '',
          headerImageUrl: formData.headerImageFile?.name || formData.headerImageUrl || '',
          headerImageDataUrl: formData.headerImageDataUrl || null,
          active: formData.active === undefined ? false : formData.active, 
          createdAt: (isEditing && themeId ? getThemeById(themeId)?.createdAt : undefined) || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
      };
      
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (isEditing) {
        updateTheme(themeToSubmit);
        addToast('Tema atualizado com sucesso!', 'success');
      } else {
        addTheme(themeToSubmit);
        addToast('Tema criado com sucesso!', 'success');
      }
      
      setIsLoadingForm(false);
      navigate(PATHS.ADMIN_MANAGE_THEMES);

    } catch (submitError: any) {
        console.error("Error submitting theme:", submitError);
        addToast(`Falha ao salvar o tema: ${submitError.message || 'Erro desconhecido'}`, 'error');
        setIsLoadingForm(false);
    }
  };

  const commonInputProps = {
    disabled: isLoadingForm || isGeneratingDescription,
    className: "rounded-lg" 
  };

  return (
    <div className="p-0"> 
      <Link 
        to={PATHS.ADMIN_MANAGE_THEMES} 
        className="inline-flex items-center text-sm font-medium text-text-muted hover:text-link-active mb-6 group"
      >
        <ArrowLeftIcon className="w-5 h-5 mr-1.5 text-text-muted group-hover:text-link-active transition-colors" />
        Voltar para Gerenciar Temas
      </Link>
      <Card title={isEditing ? 'Editar Tema' : 'Criar Novo Tema'} className="p-0">
        <form onSubmit={handleSubmit} className="space-y-6 p-5 md:p-6">
          <Input
            label="Título do Tema"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            {...commonInputProps}
          />
          <div className="relative">
            <Textarea
              label="Descrição"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={5}
              {...commonInputProps}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGenerateDescription}
              isLoading={isGeneratingDescription}
              disabled={isLoadingForm || isGeneratingDescription || !formData.title || !ai}
              leftIcon={<SparklesIcon className="w-4 h-4" />}
              className="absolute right-0 top-0 mt-1 mr-1 rounded-md" 
              title={!ai ? "Geração com IA indisponível (API Key não configurada)" : "Gerar descrição com IA (requer título preenchido)"}
            >
              Gerar com IA
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Mês (1-12)"
              name="month"
              type="number"
              value={formData.month?.toString()}
              onChange={handleChange}
              required
              min="1" max="12"
              {...commonInputProps}
            />
            <Input
              label="Ano"
              name="year"
              type="number"
              value={formData.year?.toString()}
              onChange={handleChange}
              required
              min={(new Date().getFullYear() -1 ).toString()} 
              {...commonInputProps}
            />
          </div>

          <div>
            <label htmlFor="headerImageFile" className="block text-sm font-medium text-text-body mb-1.5">Imagem de Cabeçalho (Opcional)</label>
            <Input
              id="headerImageFile"
              name="headerImageFile"
              type="file"
              accept="image/*"
              onChange={handleHeaderImageChange}
              {...commonInputProps}
            />
            {formData.headerImageDataUrl && (
              <div className="mt-2">
                <img src={formData.headerImageDataUrl} alt="Preview" className="max-h-40 rounded-lg border border-border-subtle"/>
                <p className="text-xs text-text-muted mt-1">{formData.headerImageFile?.name || formData.headerImageUrl}</p>
              </div>
            )}
             {!formData.headerImageDataUrl && formData.headerImageUrl && isEditing && (
                <p className="text-xs text-text-muted mt-1">Imagem atual: {formData.headerImageUrl}</p>
            )}
          </div>
           
          <Input
            label="URL do Vídeo Principal (Opcional, YouTube, Vimeo, etc.)"
            name="videoUrl"
            value={formData.videoUrl}
            onChange={handleChange}
            {...commonInputProps}
          />

          <div>
            <label className="block text-sm font-medium text-text-body mb-1.5">Uploads de PDFs (Máx. 5, Opcional)</label>
            {(formData.pdfFiles?.length || 0) === 0 && (!formData.pdfUrls || formData.pdfUrls.every(url => !url)) && (
                 <p className="text-xs text-text-muted mb-2">Nenhum PDF anexado.</p>
            )}
            {Array.from({ length: Math.max(formData.pdfFiles?.length || 0, formData.pdfUrls?.filter(Boolean).length || 0) }).map((_, index) => (
                 <div key={index} className="flex items-center space-x-2 mb-2">
                    <Input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handlePdfFileChange(index, e.target.files ? e.target.files[0] : null)}
                        className="flex-grow"
                        disabled={isLoadingForm || isGeneratingDescription}
                    />
                    {(formData.pdfFiles?.[index]?.name || formData.pdfUrls?.[index]) && (
                        <span className="text-text-body text-sm truncate w-40" title={formData.pdfFiles?.[index]?.name || formData.pdfUrls?.[index]}>
                            {formData.pdfFiles?.[index]?.name || formData.pdfUrls?.[index]}
                        </span>
                    )}
                    <Button type="button" variant="danger" size="sm" onClick={() => removePdfField(index)} iconOnly title="Remover PDF" disabled={isLoadingForm || isGeneratingDescription} className="rounded-lg">
                        <XMarkIcon className="w-4 h-4"/>
                    </Button>
                 </div>
            ))}
            {(formData.pdfFiles?.length || 0) < 5 && (
                 <Button type="button" variant="outline" size="sm" onClick={addPdfField} disabled={isLoadingForm || isGeneratingDescription} className="rounded-lg">Adicionar PDF</Button>
            )}
          </div>
          
          <div>
            <label htmlFor="active" className="flex items-center cursor-pointer">
              <input
                id="active"
                name="active"
                type="checkbox"
                checked={!!formData.active}
                onChange={handleChange}
                className="h-4 w-4 text-link-active border-border-subtle rounded focus:ring-link-active"
                disabled={isLoadingForm || isGeneratingDescription}
              />
              <span className="ml-2 text-sm text-text-body">Marcar como tema ativo</span>
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-border-subtle">
            <Button type="button" variant="outline" onClick={() => navigate(PATHS.ADMIN_MANAGE_THEMES)} disabled={isLoadingForm || isGeneratingDescription} className="rounded-lg">
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoadingForm} disabled={isLoadingForm || isGeneratingDescription} className="rounded-lg">
              {isEditing ? 'Salvar Alterações' : 'Criar Tema'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ThemeFormPage;
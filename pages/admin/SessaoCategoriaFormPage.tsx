
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Button } from '../../components/Common/Button';
import { Card } from '../../components/Common/Card';
import { Input, Textarea } from '../../components/Common/Input';
import { PATHS } from '../../constants';
import { SessaoCategoria, SessaoCategoriaFormData } from '../../types';
import { ArrowLeftIcon, PuzzlePieceIcon, BookOpenIcon, SparklesIcon, VideoCameraIcon, UserGroupIcon } from '../../components/Common/Icons';
import { useSessoesOneOnOne } from '../../contexts/SessoesOneOnOneContext';
import { useToasts } from '../../contexts/ToastContext';

const iconOptions = [
  { name: 'UserGroupIcon', label: 'Sessão / Genérico' },
  { name: 'BookOpenIcon', label: 'Livro / Análise Texto' },
  { name: 'SparklesIcon', label: 'Brilho / Criatividade / Técnica' },
  { name: 'VideoCameraIcon', label: 'Vídeo / Gravação' },
  { name: 'PuzzlePieceIcon', label: 'Peça / Estratégia' },
];


const SessaoCategoriaFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId: string }>();
  const { addCategoria, updateCategoria, getCategoriaById } = useSessoesOneOnOne();
  const isEditing = Boolean(categoryId);
  const { addToast } = useToasts();

  const [formData, setFormData] = useState<Partial<SessaoCategoriaFormData>>({
    title: '',
    description: '',
    longDescription: '',
    iconName: 'UserGroupIcon', // Default changed
    isActive: true,
  });
  const [isLoadingForm, setIsLoadingForm] = useState(false);

  useEffect(() => {
    if (isEditing && categoryId) {
      const existingCategoria = getCategoriaById(categoryId);
      if (existingCategoria) {
        setFormData({
          title: existingCategoria.title,
          description: existingCategoria.description,
          longDescription: existingCategoria.longDescription,
          iconName: existingCategoria.iconName || 'UserGroupIcon',
          isActive: existingCategoria.isActive,
        });
      } else {
        addToast("Categoria de sessão não encontrada.", 'error');
        navigate(PATHS.ADMIN_MANAGE_SESSOES);
      }
    }
  }, [isEditing, categoryId, getCategoriaById, navigate, addToast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.longDescription) {
        addToast("Título, descrição curta e descrição longa são obrigatórios.", 'error');
        return;
    }
    setIsLoadingForm(true);
    
    const categoriaDataToSubmit = {
        title: formData.title!,
        description: formData.description!,
        longDescription: formData.longDescription!,
        iconName: formData.iconName || 'UserGroupIcon',
        isActive: formData.isActive === undefined ? true : formData.isActive,
    };
      
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); 

      if (isEditing && categoryId) {
        await updateCategoria({ ...categoriaDataToSubmit, id: categoryId, createdAt: getCategoriaById(categoryId)!.createdAt, updatedAt: new Date().toISOString(), slug: getCategoriaById(categoryId)!.slug }); // slug is regenerated in context
        addToast('Categoria atualizada com sucesso!', 'success');
      } else {
        await addCategoria(categoriaDataToSubmit);
        addToast('Categoria criada com sucesso!', 'success');
      }
      setIsLoadingForm(false);
      navigate(PATHS.ADMIN_MANAGE_SESSOES);

    } catch (submitError: any) {
        console.error("Error submitting session category:", submitError);
        addToast(`Falha ao salvar a categoria: ${submitError.message || 'Erro desconhecido'}`, 'error');
        setIsLoadingForm(false);
    }
  };
  
  const commonInputProps = { disabled: isLoadingForm, className: "rounded-lg" };

  return (
    <div className="p-0"> 
      <Link 
        to={PATHS.ADMIN_MANAGE_SESSOES} 
        className="inline-flex items-center text-sm font-medium text-text-muted hover:text-link-active mb-6 group"
      >
        <ArrowLeftIcon className="w-5 h-5 mr-1.5 text-text-muted group-hover:text-link-active transition-colors" />
        Voltar para Gerenciar Categorias de Sessão
      </Link>
      <Card title={isEditing ? 'Editar Categoria de Sessão 1:1' : 'Criar Nova Categoria de Sessão 1:1'} className="p-0">
        <form onSubmit={handleSubmit} className="space-y-6 p-5 md:p-6">
          <Input label="Título da Categoria" name="title" value={formData.title} onChange={handleChange} required {...commonInputProps} />
          <Textarea label="Descrição Curta (para listagem)" name="description" value={formData.description} onChange={handleChange} required rows={2} {...commonInputProps} />
          <Textarea label="Descrição Longa (para página de detalhes)" name="longDescription" value={formData.longDescription} onChange={handleChange} required rows={5} {...commonInputProps} />
          
          <div>
            <label htmlFor="iconName" className="block text-sm font-medium text-text-body mb-1.5">Ícone (Heroicons)</label>
            <select id="iconName" name="iconName" value={formData.iconName} onChange={handleChange} className={`w-full p-2.5 border border-border-subtle rounded-lg bg-card-bg text-text-body sm:text-sm ${commonInputProps.disabled ? 'opacity-70 cursor-not-allowed' : ''}`} disabled={commonInputProps.disabled}>
                {iconOptions.map(opt => (
                    <option key={opt.name} value={opt.name}>{opt.label}</option>
                ))}
            </select>
             <p className="text-xs text-text-muted mt-1">Selecione um ícone da biblioteca Heroicons para representar a categoria.</p>
          </div>
          
          <div>
            <label htmlFor="isActive" className="flex items-center cursor-pointer">
              <input id="isActive" name="isActive" type="checkbox" checked={!!formData.isActive} onChange={handleChange} className="h-4 w-4 text-link-active border-border-subtle rounded focus:ring-link-active" disabled={isLoadingForm} />
              <span className="ml-2 text-sm text-text-body">Marcar como categoria ativa (visível para atores)</span>
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-border-subtle">
            <Button type="button" variant="outline" onClick={() => navigate(PATHS.ADMIN_MANAGE_SESSOES)} disabled={isLoadingForm} className="rounded-lg">
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoadingForm} disabled={isLoadingForm} className="rounded-lg">
              {isEditing ? 'Salvar Alterações' : 'Criar Categoria'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default SessaoCategoriaFormPage;

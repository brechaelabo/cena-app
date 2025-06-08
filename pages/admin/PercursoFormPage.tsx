
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Button } from '../../components/Common/Button';
import { Card } from '../../components/Common/Card';
import { Input, Textarea } from '../../components/Common/Input';
import { PATHS } from '../../constants'; // MOCK_ASSETS_URL removed
import { Course, CourseFormData, CourseType, COURSE_TYPE_NAMES } from '../../types';
import { ArrowLeftIcon, XMarkIcon } from '../../components/Common/Icons';
import { usePercursos } from '../../contexts/PercursosContext';
import { useToasts } from '../../contexts/ToastContext';
import { formatDateTimeForInput } from '../../utils/dateFormatter'; // Added


const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .normalize("NFD") // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^\w\s-]/g, '') // Remove non-word characters (excluding spaces and hyphens)
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/--+/g, '-') // Replace multiple hyphens with single hyphen
    .trim(); // Trim leading/trailing hyphens
};


const PercursoFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { percursoId } = useParams<{ percursoId: string }>();
  const { addCourse, updateCourse, getCourseById } = usePercursos();
  const isEditing = Boolean(percursoId);
  const { addToast } = useToasts();

  const [formData, setFormData] = useState<Partial<CourseFormData>>({
    title: '',
    description: '',
    instructor: '',
    type: CourseType.LIVE_ONLINE,
    location: '',
    scheduledAt: '',
    duration: '',
    price: 0,
    installments: 1,
    materials: [''],
    meetLink: '',
    imageUrl: '',
    imageFile: null,
    imageDataUrl: null,
    isPublished: false,
  });
  const [isLoadingForm, setIsLoadingForm] = useState(false);

  useEffect(() => {
    if (isEditing && percursoId) {
      const existingCourse = getCourseById(percursoId);
      if (existingCourse) {
        setFormData({
          title: existingCourse.title,
          description: existingCourse.description,
          instructor: existingCourse.instructor,
          type: existingCourse.type,
          location: existingCourse.location || '',
          scheduledAt: existingCourse.scheduledAt ? formatDateTimeForInput(existingCourse.scheduledAt) : '',
          duration: existingCourse.duration || '',
          price: existingCourse.price,
          installments: existingCourse.installments || 1,
          materials: existingCourse.materials?.length ? existingCourse.materials : [''],
          meetLink: existingCourse.meetLink || '',
          imageUrl: existingCourse.imageUrl || '',
          imageDataUrl: existingCourse.imageDataUrl || null,
          isPublished: existingCourse.isPublished,
          imageFile: null,
        });
      } else {
        addToast("Percurso não encontrado.", 'error');
        navigate(PATHS.ADMIN_MANAGE_PERCURSOS);
      }
    }
  }, [isEditing, percursoId, getCourseById, navigate, addToast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else if (type === 'number' || name === 'price' || name === 'installments') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({ ...prev, imageFile: file, imageUrl: file.name, imageDataUrl: null }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageDataUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    } else {
      setFormData(prev => ({ ...prev, imageFile: null, imageUrl: isEditing ? prev.imageUrl : '', imageDataUrl: isEditing ? prev.imageDataUrl : null }));
    }
  };
  
  const handleMaterialChange = (index: number, value: string) => {
    const newMaterials = [...(formData.materials || [''])];
    newMaterials[index] = value;
    setFormData(prev => ({ ...prev, materials: newMaterials }));
  };

  const addMaterialField = () => {
    if ((formData.materials?.length || 0) < 5) { // Limit materials for example
      setFormData(prev => ({ ...prev, materials: [...(prev.materials || []), ''] }));
    }
  };

  const removeMaterialField = (index: number) => {
    if (formData.materials && formData.materials.length > 1) {
      setFormData(prev => ({ ...prev, materials: prev.materials?.filter((_, i) => i !== index) }));
    } else {
      setFormData(prev => ({ ...prev, materials: [''] })); // Keep at least one empty field
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.instructor || !formData.description || !formData.type || formData.price === undefined) {
        addToast("Por favor, preencha todos os campos obrigatórios: Título, Instrutor, Descrição, Tipo e Preço.", 'error');
        return;
    }
    setIsLoadingForm(true);
    
    const courseToSubmit: Course = {
      id: isEditing && percursoId ? percursoId : `percurso-${Date.now()}`,
      title: formData.title!,
      slug: generateSlug(formData.title!),
      description: formData.description!,
      instructor: formData.instructor!,
      type: formData.type!,
      location: formData.type === CourseType.LIVE_PRESENTIAL ? formData.location : undefined,
      scheduledAt: formData.scheduledAt ? new Date(formData.scheduledAt).toISOString() : undefined,
      duration: formData.duration,
      price: formData.price!,
      installments: formData.installments,
      materials: formData.materials?.filter(m => m.trim() !== ''),
      meetLink: formData.meetLink,
      imageUrl: formData.imageFile?.name || formData.imageUrl || '/placeholder-images/course-default-600x400.jpg', // Updated default
      imageDataUrl: formData.imageDataUrl || null,
      isPublished: formData.isPublished || false,
      createdAt: (isEditing && percursoId ? getCourseById(percursoId)?.createdAt : undefined) || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
      
    try {
      await new Promise(resolve => setTimeout(resolve, 700)); // Simulate API call

      if (isEditing) {
        await updateCourse(courseToSubmit);
        addToast('Percurso atualizado com sucesso!', 'success');
      } else {
        await addCourse(courseToSubmit);
        addToast('Percurso criado com sucesso!', 'success');
      }
      setIsLoadingForm(false);
      navigate(PATHS.ADMIN_MANAGE_PERCURSOS);

    } catch (submitError: any) {
        console.error("Error submitting course:", submitError);
        addToast(`Falha ao salvar o percurso: ${submitError.message || 'Erro desconhecido'}`, 'error');
        setIsLoadingForm(false);
    }
  };
  
  const commonInputProps = { disabled: isLoadingForm, className: "rounded-lg" };

  return (
    <div className="p-0"> 
      <Link 
        to={PATHS.ADMIN_MANAGE_PERCURSOS} 
        className="inline-flex items-center text-sm font-medium text-text-muted hover:text-link-active mb-6 group"
      >
        <ArrowLeftIcon className="w-5 h-5 mr-1.5 text-text-muted group-hover:text-link-active transition-colors" />
        Voltar para Gerenciar Percursos
      </Link>
      <Card title={isEditing ? 'Editar Percurso' : 'Criar Novo Percurso'} className="p-0">
        <form onSubmit={handleSubmit} className="space-y-6 p-5 md:p-6">
          <Input label="Título do Percurso" name="title" value={formData.title} onChange={handleChange} required {...commonInputProps} />
          <Textarea label="Descrição Detalhada" name="description" value={formData.description} onChange={handleChange} required rows={5} {...commonInputProps} />
          <Input label="Nome do Instrutor(a)" name="instructor" value={formData.instructor} onChange={handleChange} required {...commonInputProps} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="type" className="block text-sm font-medium text-text-body mb-1.5">Tipo de Percurso</label>
                <select id="type" name="type" value={formData.type} onChange={handleChange} required className={`w-full p-2.5 border border-border-subtle rounded-lg bg-card-bg text-text-body sm:text-sm ${commonInputProps.disabled ? 'opacity-70 cursor-not-allowed' : ''}`} disabled={commonInputProps.disabled}>
                    {Object.values(CourseType).map(type => (
                        <option key={type} value={type}>{COURSE_TYPE_NAMES[type]}</option>
                    ))}
                </select>
            </div>
            {formData.type === CourseType.LIVE_PRESENTIAL && (
                <Input label="Local (se presencial)" name="location" value={formData.location} onChange={handleChange} {...commonInputProps} />
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {(formData.type === CourseType.LIVE_ONLINE || formData.type === CourseType.LIVE_PRESENTIAL) && (
                <Input label="Data e Hora de Início (se ao vivo)" name="scheduledAt" type="datetime-local" value={formData.scheduledAt} onChange={handleChange} {...commonInputProps} />
             )}
            <Input label="Duração (Ex: 8 semanas, 10 módulos)" name="duration" value={formData.duration} onChange={handleChange} {...commonInputProps} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Preço (R$)" name="price" type="number" value={formData.price?.toString()} onChange={handleChange} required min="0" step="0.01" {...commonInputProps} />
            <Input label="Número de Parcelas (Opcional)" name="installments" type="number" value={formData.installments?.toString()} onChange={handleChange} min="1" step="1" {...commonInputProps} />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-body mb-1.5">Materiais Inclusos (Opcional, 1 por linha)</label>
            {formData.materials?.map((material, index) => (
                 <div key={index} className="flex items-center space-x-2 mb-2">
                    <Input
                        type="text"
                        placeholder={`Material ${index + 1}`}
                        value={material}
                        onChange={(e) => handleMaterialChange(index, e.target.value)}
                        className="flex-grow"
                        disabled={isLoadingForm}
                    />
                    <Button type="button" variant="danger" size="sm" onClick={() => removeMaterialField(index)} iconOnly title="Remover Material" disabled={isLoadingForm} className="rounded-lg">
                        <XMarkIcon className="w-4 h-4"/>
                    </Button>
                 </div>
            ))}
             {(formData.materials?.length || 0) < 5 && (
                 <Button type="button" variant="outline" size="sm" onClick={addMaterialField} disabled={isLoadingForm} className="rounded-lg text-xs">Adicionar Material</Button>
            )}
          </div>

          <Input label="Link da Sala Virtual (Meet, Zoom - para cursos ao vivo)" name="meetLink" type="url" value={formData.meetLink} onChange={handleChange} {...commonInputProps} />
          
          <div>
            <label htmlFor="imageFile" className="block text-sm font-medium text-text-body mb-1.5">Imagem de Capa (Opcional)</label>
            <Input
              id="imageFile"
              name="imageFile"
              type="file"
              accept="image/*"
              onChange={handleImageFileChange}
              {...commonInputProps}
            />
            {formData.imageDataUrl && (
              <div className="mt-2">
                <img src={formData.imageDataUrl} alt="Preview" className="max-h-40 rounded-lg border border-border-subtle"/>
                <p className="text-xs text-text-muted mt-1">{formData.imageFile?.name || formData.imageUrl}</p>
              </div>
            )}
             {!formData.imageDataUrl && formData.imageUrl && isEditing && (
                <p className="text-xs text-text-muted mt-1">Imagem atual: {formData.imageUrl}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="isPublished" className="flex items-center cursor-pointer">
              <input id="isPublished" name="isPublished" type="checkbox" checked={!!formData.isPublished} onChange={handleChange} className="h-4 w-4 text-link-active border-border-subtle rounded focus:ring-link-active" disabled={isLoadingForm} />
              <span className="ml-2 text-sm text-text-body">Publicar este percurso para atores</span>
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-border-subtle">
            <Button type="button" variant="outline" onClick={() => navigate(PATHS.ADMIN_MANAGE_PERCURSOS)} disabled={isLoadingForm} className="rounded-lg">
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoadingForm} disabled={isLoadingForm} className="rounded-lg">
              {isEditing ? 'Salvar Alterações' : 'Criar Percurso'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default PercursoFormPage;

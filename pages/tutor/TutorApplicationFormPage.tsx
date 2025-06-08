
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../components/Common/Button';
import { Card } from '../../components/Common/Card';
import { Input, Textarea } from '../../components/Common/Input';
import { PATHS, TECHNIQUE_OPTIONS, EDUCATION_LEVEL_NAMES } from '../../constants';
import { TutorApplicationFormData, Role, EducationLevel } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { usePlatformUsers } from '../../contexts/UserManagementContext';
import { useToasts } from '../../contexts/ToastContext';
import { UserIcon, ArrowLeftIcon, XMarkIcon } from '../../components/Common/Icons';

const TutorApplicationFormPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth(); 
  const { user, logout } = auth;
  const { addTutorApplicationDetails } = usePlatformUsers();
  const { addToast } = useToasts();

  const [formData, setFormData] = useState<TutorApplicationFormData>({
    name: user?.name || location.state?.name || '',
    email: user?.email || location.state?.email || '',
    profileImageFile: null,
    dateOfBirth: '',
    phone: '',
    educationLevel: undefined,
    socialMediaLinks: [{ platform: 'Instagram', url: '' }],
    hasNoSocialMedia: false,
    formativeExperiences: '',
    baseTechnique: '',
    otherTechnique: '',
    professionalExperiences: '',
    whyJoinCena: '',
  });
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(user?.imageUrl || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user || user.currentRole !== Role.TUTOR) {
      addToast("Acesso inválido. Por favor, registre-se como tutor.", 'error');
      logout(); 
      navigate(PATHS.REGISTER);
    } else {
      setFormData(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        dateOfBirth: user.dateOfBirth || '',
        phone: user.phone || '',
        educationLevel: user.educationLevel || undefined,
        socialMediaLinks: user.socialMediaLinks?.length ? user.socialMediaLinks : [{ platform: 'Instagram', url: '' }],
        hasNoSocialMedia: user.hasNoSocialMedia || false,
        formativeExperiences: user.formativeExperiences || '',
        baseTechnique: user.baseTechnique || '',
        otherTechnique: user.otherTechnique || '',
        professionalExperiences: user.professionalExperiences || '',
        whyJoinCena: user.whyJoinCena || '',
      }));
      setProfileImagePreview(user.imageUrl || null);
    }
  }, [user, navigate, addToast, logout]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
        if (name === 'hasNoSocialMedia' && checked) {
          setFormData(prev => ({ ...prev, socialMediaLinks: [{ platform: 'Instagram', url: '' }] }));
        }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({ ...prev, profileImageFile: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFormData(prev => ({ ...prev, profileImageFile: null }));
      setProfileImagePreview(user?.imageUrl || null); 
    }
  };
  
  const handleSocialMediaChange = (index: number, field: 'platform' | 'url', value: string) => {
    const newSocialMediaLinks = formData.socialMediaLinks ? [...formData.socialMediaLinks] : [];
    if (newSocialMediaLinks[index]) {
        newSocialMediaLinks[index] = { ...newSocialMediaLinks[index], [field]: value };
        setFormData(prev => ({ ...prev, socialMediaLinks: newSocialMediaLinks }));
    }
  };

  const addSocialMediaField = () => {
    if ((formData.socialMediaLinks?.length || 0) < 3) { 
        setFormData(prev => ({
            ...prev,
            socialMediaLinks: [...(prev.socialMediaLinks || []), { platform: 'Instagram', url: '' }]
        }));
    }
  };

  const removeSocialMediaField = (index: number) => {
    setFormData(prev => ({
        ...prev,
        socialMediaLinks: prev.socialMediaLinks?.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!formData.educationLevel) {
      addToast('Por favor, selecione seu nível de escolaridade.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      let finalImageUrl = profileImagePreview;
      if (formData.profileImageFile && profileImagePreview?.startsWith('data:')) {
        finalImageUrl = profileImagePreview; 
      } else if (!formData.profileImageFile && user.imageUrl) {
        finalImageUrl = user.imageUrl; 
      }

      const updatedTutor = addTutorApplicationDetails(user.id, formData, finalImageUrl || undefined);
      
      if (updatedTutor) {
        auth.setCurrentUserAndPersist(updatedTutor);
        addToast('Candidatura enviada com sucesso! Aguarde a aprovação.', 'success');
        navigate(PATHS.PENDING_APPROVAL);
      } else {
        addToast('Falha ao enviar candidatura. Usuário não encontrado ou erro interno.', 'error');
      }
    } catch (error: any) {
      addToast(error.message || 'Erro ao enviar candidatura.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const commonInputProps = {
    disabled: isSubmitting,
    className: "rounded-lg" 
  };

  if (!user) {
    return <div className="text-center p-10">Redirecionando...</div>; 
  }

  return (
    <div className="min-h-screen bg-page-bg py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-3xl">
            <Button 
                variant="ghost" 
                onClick={() => navigate(PATHS.REGISTER)} 
                className="mb-6 text-text-muted hover:text-link-active group inline-flex items-center"
                disabled={isSubmitting}
            >
                <ArrowLeftIcon className="w-5 h-5 mr-1.5 text-text-muted group-hover:text-link-active transition-colors" /> Voltar para Registro
            </Button>

            <Card title="Formulário de Candidatura para Tutor(a)" className="w-full">
                <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col items-center space-y-3">
                    {profileImagePreview ? (
                        <img src={profileImagePreview} alt="Preview" className="w-32 h-32 rounded-full object-cover border-2 border-border-subtle shadow-md"/>
                    ) : (
                        <UserIcon className="w-32 h-32 text-text-muted p-4 border-2 border-dashed border-border-subtle rounded-full"/>
                    )}
                    <Input
                        label="Foto de Perfil (URL ou Upload)"
                        type="file"
                        name="profileImageFile"
                        accept="image/*"
                        onChange={handleImageChange}
                        {...commonInputProps}
                        className="text-sm"
                    />
                    <p className="text-xs text-text-muted">Recomendações: Foto nítida, rosto visível, fundo neutro, sem acessórios que cubram o rosto.</p>
                </div>

                <Input label="Nome Completo" name="name" value={formData.name} onChange={handleChange} required {...commonInputProps} />
                <Input label="Email" name="email" type="email" value={formData.email} disabled {...commonInputProps} /> 
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Data de Nascimento" name="dateOfBirth" type="date" value={formData.dateOfBirth || ''} onChange={handleChange} required {...commonInputProps} />
                    <Input label="Telefone (com DDD)" name="phone" type="tel" value={formData.phone || ''} onChange={handleChange} placeholder="(XX) XXXXX-XXXX" required {...commonInputProps} />
                </div>

                <div>
                    <label htmlFor="educationLevel" className="block text-sm font-medium text-text-body mb-1.5">Escolaridade</label>
                    <select 
                        id="educationLevel" 
                        name="educationLevel" 
                        value={formData.educationLevel || ''} 
                        onChange={handleChange} 
                        required 
                        className={`w-full p-2.5 border border-border-subtle rounded-lg bg-card-bg text-text-body sm:text-sm ${commonInputProps.disabled ? 'opacity-70 cursor-not-allowed' : ''}`} 
                        disabled={commonInputProps.disabled}
                    >
                        <option value="" disabled>Selecione sua escolaridade</option>
                        {Object.values(EducationLevel).map(level => (
                            <option key={level} value={level}>{EDUCATION_LEVEL_NAMES[level]}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-body mb-1.5">Links de Redes Sociais (Opcional)</label>
                    {formData.socialMediaLinks?.map((link, index) => (
                        <div key={index} className="flex items-center space-x-2 mb-2">
                             <select
                                name={`socialMediaPlatform-${index}`}
                                value={link.platform}
                                onChange={(e) => handleSocialMediaChange(index, 'platform', e.target.value)}
                                className="p-2.5 border border-border-subtle rounded-lg bg-card-bg text-text-body sm:text-sm w-1/3"
                                disabled={isSubmitting || formData.hasNoSocialMedia}
                            >
                                <option value="Instagram">Instagram</option>
                                <option value="LinkedIn">LinkedIn</option>
                                <option value="Facebook">Facebook</option>
                                <option value="Outra">Outra</option>
                            </select>
                            <Input 
                                type="url" 
                                placeholder="Link da sua rede social" 
                                value={link.url} 
                                onChange={(e) => handleSocialMediaChange(index, 'url', e.target.value)} 
                                className="flex-grow" 
                                disabled={isSubmitting || formData.hasNoSocialMedia}
                            />
                             {index > 0 && (
                                <Button type="button" variant="danger" size="sm" onClick={() => removeSocialMediaField(index)} iconOnly title="Remover Rede Social" disabled={isSubmitting || formData.hasNoSocialMedia} className="rounded-lg">
                                    <XMarkIcon className="w-4 h-4"/>
                                </Button>
                            )}
                        </div>
                    ))}
                     <div className="flex items-center justify-between mt-1">
                        {(formData.socialMediaLinks?.length || 0) < 3 && !formData.hasNoSocialMedia && (
                            <Button type="button" variant="outline" size="sm" onClick={addSocialMediaField} disabled={isSubmitting} className="rounded-lg text-xs">Adicionar Rede Social</Button>
                        )}
                        <label htmlFor="hasNoSocialMedia" className="flex items-center cursor-pointer text-sm ml-auto">
                            <input type="checkbox" id="hasNoSocialMedia" name="hasNoSocialMedia" checked={!!formData.hasNoSocialMedia} onChange={handleChange} className="h-4 w-4 text-link-active border-border-subtle rounded focus:ring-link-active mr-1.5" disabled={isSubmitting}/>
                            <span className="text-text-body">Não possuo / Não quero informar</span>
                        </label>
                     </div>
                </div>

                <Textarea label="Principais Experiências Formativas" name="formativeExperiences" value={formData.formativeExperiences || ''} onChange={handleChange} rows={4} required {...commonInputProps} placeholder="Ex: Graduação em Artes Cênicas (Escola X, Ano Y), Workshop de Interpretação para TV (Com Z, Ano W)..."/>
                
                <div>
                    <label htmlFor="baseTechnique" className="block text-sm font-medium text-text-body mb-1.5">Técnica Base Principal</label>
                    <select id="baseTechnique" name="baseTechnique" value={formData.baseTechnique || ''} onChange={handleChange} required className={`w-full p-2.5 border border-border-subtle rounded-lg bg-card-bg text-text-body sm:text-sm ${commonInputProps.disabled ? 'opacity-70 cursor-not-allowed' : ''}`} disabled={commonInputProps.disabled}>
                        <option value="">Selecione sua técnica principal</option>
                        {TECHNIQUE_OPTIONS.map(tech => (
                            <option key={tech} value={tech}>{tech}</option>
                        ))}
                    </select>
                </div>
                {formData.baseTechnique === 'Outra' && (
                    <Input label="Qual outra técnica?" name="otherTechnique" value={formData.otherTechnique || ''} onChange={handleChange} required {...commonInputProps} />
                )}

                <Textarea label="Principais Experiências Profissionais" name="professionalExperiences" value={formData.professionalExperiences || ''} onChange={handleChange} rows={4} required {...commonInputProps} placeholder="Ex: Peça 'Nome da Peça' (Personagem A, Diretor B, Ano C), Curta-metragem 'Título' (Personagem D, Ano E)..."/>
                <Textarea label="Por que você gostaria de se juntar à CENA como tutor(a)?" name="whyJoinCena" value={formData.whyJoinCena || ''} onChange={handleChange} rows={4} required {...commonInputProps} />

                <div className="pt-5">
                    <Button type="submit" variant="primary" className="w-full" isLoading={isSubmitting} disabled={isSubmitting}>
                    Enviar Candidatura
                    </Button>
                </div>
                </form>
            </Card>
        </div>
    </div>
  );
};

export default TutorApplicationFormPage;

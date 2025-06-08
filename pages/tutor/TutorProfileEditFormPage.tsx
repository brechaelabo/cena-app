
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Common/Button';
import { Card } from '../../components/Common/Card';
import { Input, Textarea } from '../../components/Common/Input';
import { TrajectoryCard } from '../../components/Profile/TrajectoryCard'; // New import
import { PATHS, TECHNIQUE_OPTIONS, EDUCATION_LEVEL_NAMES } from '../../constants';
import { TutorApplicationFormData, Role, EducationLevel, TutorApplicationStatus } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { usePlatformUsers } from '../../contexts/UserManagementContext';
import { useLiveSessions } from '../../contexts/LiveSessionContext'; // New import
import { useToasts } from '../../contexts/ToastContext';
import { UserIcon, ArrowLeftIcon, XMarkIcon, CameraIcon, LockClosedIcon, VideoCameraIcon, UserGroupIcon as SessoesIcon, CalendarDaysIcon, UserGroupIcon as ActorsIcon } from '../../components/Common/Icons';
import { getMonthsSince } from '../../utils/dateFormatter'; // New import

interface TutorTrajectoryStats {
  feedbacksSent: number;
  actorsTutored: number;
  sessoes1a1Realizadas: number;
  monthsAsTutor: number;
}

const TutorProfileEditFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { addTutorApplicationDetails, getUserById, countActorsAssignedToTutor } = usePlatformUsers();
  const { getSessionsForTutor } = useLiveSessions();
  const { addToast } = useToasts();

  const [formData, setFormData] = useState<TutorApplicationFormData>({
    name: '',
    email: '',
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
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tutorStats, setTutorStats] = useState<TutorTrajectoryStats | null>(null);

  useEffect(() => {
    if (!user || user.currentRole !== Role.TUTOR) {
      addToast("Acesso inválido.", 'error');
      logout(); 
      navigate(PATHS.LOGIN);
      return;
    }
    
    const tutorData = getUserById(user.id);
    if (tutorData) {
      setFormData(prev => ({
        ...prev,
        name: tutorData.name || '',
        email: tutorData.email || '',
        dateOfBirth: tutorData.dateOfBirth || '',
        phone: tutorData.phone || '',
        educationLevel: tutorData.educationLevel || undefined,
        socialMediaLinks: tutorData.socialMediaLinks?.length ? tutorData.socialMediaLinks : [{ platform: 'Instagram', url: '' }],
        hasNoSocialMedia: tutorData.hasNoSocialMedia || false,
        formativeExperiences: tutorData.formativeExperiences || '',
        baseTechnique: tutorData.baseTechnique || '',
        otherTechnique: tutorData.otherTechnique || '',
        professionalExperiences: tutorData.professionalExperiences || '',
        whyJoinCena: tutorData.whyJoinCena || '',
      }));
      setProfileImagePreview(tutorData.imageUrl || null);

      // Calculate stats
      const sessoes = getSessionsForTutor(user.id);
      setTutorStats({
        feedbacksSent: tutorData.feedbacksSentCount || 0,
        actorsTutored: countActorsAssignedToTutor(user.id),
        sessoes1a1Realizadas: sessoes.filter(s => s.status === 'COMPLETED').length,
        monthsAsTutor: getMonthsSince(user.createdAt),
      });
    }
  }, [user, navigate, addToast, logout, getUserById, getSessionsForTutor, countActorsAssignedToTutor]);

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
      reader.onloadend = () => setProfileImagePreview(reader.result as string);
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
    setIsSubmitting(true);
    try {
      addTutorApplicationDetails(user.id, formData, profileImagePreview || undefined);
      addToast('Perfil atualizado com sucesso!', 'success');
    } catch (error: any) {
      addToast(error.message || 'Erro ao atualizar perfil.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const commonInputProps = { disabled: isSubmitting, className: "rounded-lg" };

  if (!user) return <div className="text-center p-10">Redirecionando...</div>; 

  const trajectoryStatsForCard = tutorStats ? [
    { label: "Feedbacks Enviados", value: tutorStats.feedbacksSent, icon: <VideoCameraIcon /> },
    { label: "Atores Tutorados", value: tutorStats.actorsTutored, icon: <ActorsIcon /> },
    { label: "Sessões 1:1 Realizadas", value: tutorStats.sessoes1a1Realizadas, icon: <SessoesIcon /> },
    { label: "Meses como Tutor(a)", value: tutorStats.monthsAsTutor, icon: <CalendarDaysIcon /> },
  ] : [];

  return (
    <div className="min-h-screen bg-page-bg py-8 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-3xl">
            <Button 
                variant="ghost" 
                onClick={() => navigate(PATHS.DASHBOARD)} 
                className="mb-6 text-text-muted hover:text-link-active group inline-flex items-center"
                disabled={isSubmitting}
            >
                <ArrowLeftIcon className="w-5 h-5 mr-1.5 text-text-muted group-hover:text-link-active transition-colors" /> Voltar ao Painel
            </Button>

            {tutorStats && (
              <TrajectoryCard stats={trajectoryStatsForCard} />
            )}
            
            {!user.isApproved && user.tutorApplicationStatus === TutorApplicationStatus.PENDING_REVIEW && (
                 <Card className="mb-6 bg-yellow-50 border-yellow-300">
                    <p className="text-yellow-700 font-medium">
                        Sua candidatura ainda está em análise. Você pode editar seus dados abaixo, mas o acesso completo à plataforma só será liberado após aprovação.
                    </p>
                </Card>
            )}

            <Card title="Editar Meu Perfil de Tutor(a)" className="w-full">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex flex-col items-center space-y-3">
                        <div className="relative w-32 h-32">
                        {profileImagePreview ? (
                            <img src={profileImagePreview} alt="Preview" className="w-32 h-32 rounded-full object-cover border-2 border-border-subtle shadow-md"/>
                        ) : (
                            <UserIcon className="w-32 h-32 text-text-muted p-4 border-2 border-dashed border-border-subtle rounded-full"/>
                        )}
                        </div>
                        <label htmlFor="profileImageFile" className="cursor-pointer inline-flex items-center px-3 py-1.5 border border-border-subtle text-xs font-medium rounded-md text-text-body bg-card-bg hover:bg-gray-50 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-link-active" style={{maxWidth: '8rem'}}>
                            <CameraIcon className="w-4 h-4 mr-1.5"/>
                            Alterar Foto
                            <input id="profileImageFile" name="profileImageFile" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} disabled={isSubmitting}/>
                        </label>
                    </div>

                    <Input label="Nome Completo" name="name" value={formData.name} onChange={handleChange} required {...commonInputProps} disabled />
                    <Input label="Email" name="email" type="email" value={formData.email} disabled {...commonInputProps} /> 
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Data de Nascimento" name="dateOfBirth" type="date" value={formData.dateOfBirth || ''} onChange={handleChange} {...commonInputProps} />
                        <Input label="Telefone (com DDD)" name="phone" type="tel" value={formData.phone || ''} onChange={handleChange} placeholder="(XX) XXXXX-XXXX" {...commonInputProps} />
                    </div>

                    <div>
                        <label htmlFor="educationLevel" className="block text-sm font-medium text-text-body mb-1.5">Escolaridade</label>
                        <select 
                            id="educationLevel" 
                            name="educationLevel" 
                            value={formData.educationLevel || ''} 
                            onChange={handleChange} 
                            className={`w-full p-2.5 border border-border-subtle rounded-lg bg-card-bg text-text-body sm:text-sm ${commonInputProps.disabled ? 'opacity-70 cursor-not-allowed' : ''}`} 
                            disabled={commonInputProps.disabled}
                        >
                            <option value="">Selecione sua escolaridade</option>
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

                    <Textarea label="Principais Experiências Formativas" name="formativeExperiences" value={formData.formativeExperiences || ''} onChange={handleChange} rows={3} {...commonInputProps} placeholder="Ex: Graduação em Artes Cênicas (Escola X, Ano Y)..."/>
                    
                    <div>
                        <label htmlFor="baseTechnique" className="block text-sm font-medium text-text-body mb-1.5">Técnica Base Principal</label>
                        <select id="baseTechnique" name="baseTechnique" value={formData.baseTechnique || ''} onChange={handleChange} className={`w-full p-2.5 border border-border-subtle rounded-lg bg-card-bg text-text-body sm:text-sm ${commonInputProps.disabled ? 'opacity-70 cursor-not-allowed' : ''}`} disabled={commonInputProps.disabled}>
                            <option value="">Selecione sua técnica principal</option>
                            {TECHNIQUE_OPTIONS.map(tech => (
                                <option key={tech} value={tech}>{tech}</option>
                            ))}
                        </select>
                    </div>
                    {formData.baseTechnique === 'Outra' && (
                        <Input label="Qual outra técnica?" name="otherTechnique" value={formData.otherTechnique || ''} onChange={handleChange} {...commonInputProps} />
                    )}

                    <Textarea label="Principais Experiências Profissionais" name="professionalExperiences" value={formData.professionalExperiences || ''} onChange={handleChange} rows={3} {...commonInputProps} placeholder="Ex: Peça 'Nome da Peça' (Personagem A, Diretor B, Ano C)..."/>
                    <Textarea label="Meus Objetivos/Por que você é tutor(a) na CENA?" name="whyJoinCena" value={formData.whyJoinCena || ''} onChange={handleChange} rows={3} {...commonInputProps} />
                    
                     <div className="mt-6 pt-6 border-t border-border-subtle">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => addToast("Funcionalidade de alterar senha não implementada neste demo.", "info")} 
                            className="w-full sm:w-auto mb-4"
                            leftIcon={<LockClosedIcon className="w-5 h-5"/>}
                            disabled={isSubmitting}
                        >
                            Alterar Senha
                        </Button>
                    </div>

                    <div className="pt-5 border-t border-border-subtle">
                        <Button type="submit" variant="primary" className="w-full" isLoading={isSubmitting} disabled={isSubmitting}>
                        Salvar Alterações no Perfil
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    </div>
  );
};

export default TutorProfileEditFormPage;

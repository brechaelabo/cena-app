import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Common/Button';
import { Card } from '../../components/Common/Card';
import { Input, Textarea } from '../../components/Common/Input';
import { TrajectoryCard } from '../../components/Profile/TrajectoryCard';
import { CollapsibleCard } from '../../components/Common/CollapsibleCard'; 
import { 
  PATHS, TECHNIQUE_OPTIONS, EDUCATION_LEVEL_NAMES, ACTOR_LEVEL_NAMES, 
  ACTOR_OTHER_INTEREST_OPTIONS, PLAN_DETAILS_MAP, 
  PRICING_INFO, BILLING_CYCLE_DISCOUNTS_DETAILS, BILLING_CYCLE_NAMES
} from '../../constants';
import { ActorProfileFormData, Role, EducationLevel, ActorLevel, ActorOtherInterest, Plan, BillingCycle } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { usePlatformUsers } from '../../contexts/UserManagementContext';
import { useSubmissions } from '../../contexts/SubmissionContext';
import { useLiveSessions } from '../../contexts/LiveSessionContext';
// import { usePercursos } from '../../contexts/PercursosContext'; // For Percursos Concluídos (future)
import { useToasts } from '../../contexts/ToastContext';
import { 
    UserIcon, ArrowLeftIcon, XMarkIcon, CameraIcon, LockClosedIcon, 
    FilmIcon, ClipboardCheckIcon, AcademicCapIcon, CalendarDaysIcon, 
    UserGroupIcon as SessoesIcon, BookOpenIcon as PercursosIcon, PriceTagIcon, CheckCircleIcon as CheckIcon
} from '../../components/Common/Icons';
import { getMonthsSince } from '../../utils/dateFormatter';

interface ActorTrajectoryStats {
  totalSubmissions: number;
  totalFeedbacksReceived: number;
  themesExplored: number;
  monthsAsMember: number;
  percursosConcluidos: number;
  sessoes1a1Realizadas: number;
}

const ActorProfileFormPage: React.FC = () => {
  const navigate = useNavigate();
  const auth = useAuth(); 
  const { user, logout, updateUserPlan: updateUserPlanAuth } = auth; 
  const { addActorProfileDetails, getUserById } = usePlatformUsers();
  const { getSubmissionsForActor } = useSubmissions();
  const { getSessionsForActor } = useLiveSessions();
  const { addToast } = useToasts();

  const [formData, setFormData] = useState<ActorProfileFormData>({
    name: '', email: '', profileImageFile: null, dateOfBirth: '', phone: '',
    educationLevel: undefined, socialMediaLinks: [{ platform: 'Instagram', url: '' }],
    hasNoSocialMedia: false, formativeExperiences: '', professionalExperiences: '',
    objectives: '', actorLevel: ActorLevel.INICIJANTE,
    interestedTechniques: [], otherInterests: [],
  });
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actorStats, setActorStats] = useState<ActorTrajectoryStats | null>(null);

  const [selectedCycle, setSelectedCycle] = useState<BillingCycle>(user?.billingCycle || BillingCycle.MONTHLY);
  const [loadingPlanId, setLoadingPlanId] = useState<Plan | null>(null);

  useEffect(() => {
    if (!user || user.currentRole !== Role.ACTOR) {
      addToast("Acesso inválido. Por favor, faça login como ator.", 'error');
      logout(); 
      navigate(PATHS.LOGIN);
      return;
    }

    const actorData = getUserById(user.id);
    if (actorData) {
      setFormData(prev => ({
        ...prev,
        name: actorData.name || '', email: actorData.email || '',
        dateOfBirth: actorData.dateOfBirth || '', phone: actorData.phone || '',
        educationLevel: actorData.educationLevel || undefined,
        socialMediaLinks: actorData.socialMediaLinks?.length ? actorData.socialMediaLinks : [{ platform: 'Instagram', url: '' }],
        hasNoSocialMedia: actorData.hasNoSocialMedia || false,
        formativeExperiences: actorData.formativeExperiences || '',
        professionalExperiences: actorData.professionalExperiences || '',
        objectives: actorData.whyJoinCena || '',
        actorLevel: actorData.actorLevel || ActorLevel.INICIJANTE,
        interestedTechniques: actorData.interestedTechniques || [],
        otherInterests: actorData.otherInterests || [],
      }));
      setProfileImagePreview(actorData.imageUrl || null);
      setSelectedCycle(actorData.billingCycle || BillingCycle.MONTHLY);

      const submissions = getSubmissionsForActor(user.id);
      const sessoes = getSessionsForActor(user.id);
      setActorStats({
        totalSubmissions: submissions.length,
        totalFeedbacksReceived: submissions.filter(s => s.feedbackStatus === 'COMPLETED').length,
        themesExplored: new Set(submissions.map(s => s.themeId)).size,
```typescript
        monthsAsMember: getMonthsSince(user.createdAt),
        percursosConcluidos: 0, 
        sessoes1a1Realizadas: sessoes.filter(s => s.status === 'COMPLETED').length,
      });
    }
  }, [user, navigate, addToast, logout, getUserById, getSubmissionsForActor, getSessionsForActor]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      if (name === 'hasNoSocialMedia') {
        setFormData(prev => ({ 
          ...prev, 
          hasNoSocialMedia: checked,
          socialMediaLinks: checked ? [{ platform: 'Instagram', url: '' }] : prev.socialMediaLinks
        }));
      } else { 
        const fieldName = name.split('-')[0] as 'interestedTechniques' | 'otherInterests';
        const fieldValue = name.split('-')[1];
        setFormData(prev => {
          const currentValues = prev[fieldName] || [];
          let newValues;
          if (checked) { newValues = [...currentValues, fieldValue]; } 
          else { newValues = currentValues.filter(item => item !== fieldValue); }
          return { ...prev, [fieldName]: newValues };
        });
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
        setFormData(prev => ({ ...prev, socialMediaLinks: [...(prev.socialMediaLinks || []), { platform: 'Instagram', url: '' }] }));
    }
  };

  const removeSocialMediaField = (index: number) => {
    setFormData(prev => ({ ...prev, socialMediaLinks: prev.socialMediaLinks?.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!formData.actorLevel) { addToast('Por favor, selecione seu nível de auto-declaração.', 'error'); return; }
    setIsSubmitting(true);
    try {
      const profileDataForUpdate = { ...formData, whyJoinCena: formData.objectives };
      const updatedActor = addActorProfileDetails(user.id, profileDataForUpdate, profileImagePreview || undefined);

      if (updatedActor) {
        auth.setCurrentUserAndPersist(updatedActor);
        addToast('Perfil atualizado com sucesso! Acesso liberado.', 'success');
        navigate(PATHS.ACTOR_EM_CENA);
      } else {
        addToast('Falha ao atualizar perfil. Tente novamente.', 'error');
      }
    } catch (error: any) { 
      addToast(error.message || 'Erro ao atualizar perfil.', 'error'); 
    } 
    finally { setIsSubmitting(false); }
  };

  const handleSelectPlan = (planId: Plan, cycle: BillingCycle) => {
    if (!user) return;
    setLoadingPlanId(planId);
    setTimeout(() => {
      updateUserPlanAuth(planId); 
      const updatedUser = { ...user, activePlan: planId, billingCycle: cycle };
      // Persist directly to AuthContext and localStorage
      auth.setCurrentUserAndPersist(updatedUser);

      addToast(`Plano alterado para ${PLAN_DETAILS_MAP[planId].name} (${BILLING_CYCLE_DISCOUNTS_DETAILS[cycle].label})! (Simulação)`, 'success');
      setLoadingPlanId(null);
    }, 1000);
  };

  const calculatePrice = (basePrice: number, cycle: BillingCycle) => {
    const discountRate = BILLING_CYCLE_DISCOUNTS_DETAILS[cycle].discountRate;
    return basePrice * (1 - discountRate);
  };

  const commonInputProps = { disabled: isSubmitting, className: "rounded-lg" };
  const currentPlanDetails = user?.activePlan ? PLAN_DETAILS_MAP[user.activePlan] : null;

  if (!user) return <div className="text-center p-10">Redirecionando...</div>;

  const trajectoryStatsForCard = actorStats ? [
    { label: "Self-tapes Enviados", value: actorStats.totalSubmissions, icon: <FilmIcon /> }, 
    { label: "Feedbacks Recebidos", value: actorStats.totalFeedbacksReceived, icon: <ClipboardCheckIcon /> },
    { label: "Temas Explorados", value: actorStats.themesExplored, icon: <AcademicCapIcon /> },
    { label: "Meses na Plataforma", value: actorStats.monthsAsMember, icon: <CalendarDaysIcon /> },
    { label: "Percursos Concluídos", value: actorStats.percursosConcluidos, icon: <PercursosIcon /> },
    { label: "Sessões 1:1 Realizadas", value: actorStats.sessoes1a1Realizadas, icon: <SessoesIcon /> },
  ] : [];

  return (
    <div className="min-h-screen bg-page-bg py-8 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-3xl">
        { user.isApproved && (
            <Button variant="ghost" onClick={() => navigate(PATHS.ACTOR_EM_CENA)} className="mb-6 text-text-muted hover:text-link-active group" disabled={isSubmitting}>
                <ArrowLeftIcon className="w-5 h-5 mr-1.5" /> Voltar para Em Cena
            </Button>
        )}
        {!user.isApproved && (
             <p className="mb-6 text-center text-lg font-semibold text-amber-700 bg-amber-100 p-3 rounded-md">
                Por favor, complete seu perfil para ter acesso total à plataforma CENA.
            </p>
        )}

        {actorStats && user.isApproved && (
          <TrajectoryCard stats={trajectoryStatsForCard} gridCols="grid-cols-2 md:grid-cols-3" />
        )}

        <Card title="Meu Perfil de Ator/Atriz" className="w-full mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 p-4 border-b border-border-subtle">
              <div className="flex-shrink-0 flex flex-col items-center">
                <div className="relative w-28 h-28 sm:w-32 sm:h-32">
                  {profileImagePreview ? (
                    <img src={profileImagePreview} alt="Preview" className="w-full h-full rounded-full object-cover border-2 border-border-subtle shadow-md"/>
                  ) : (
                    <UserIcon className="w-full h-full text-text-muted p-4 border-2 border-dashed border-border-subtle rounded-full"/>
                  )}
                </div>
                <label htmlFor="profileImageFile" className="mt-2 cursor-pointer inline-flex items-center px-3 py-1.5 border border-border-subtle text-xs font-medium rounded-md text-text-body bg-card-bg hover:bg-gray-50 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-link-active" style={{maxWidth: '8rem'}}>
                  <CameraIcon className="w-4 h-4 mr-1.5"/> Alterar Foto
                  <input id="profileImageFile" name="profileImageFile" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} disabled={isSubmitting}/>
                </label>
              </div>
              <div className="flex-grow text-center sm:text-left">
                <h2 className="text-2xl font-bold text-headings">{formData.name}</h2>
                <p className="text-text-muted">{formData.email}</p>
                 <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => addToast("Funcionalidade de alterar senha não implementada neste demo.", "info")} 
                    className="mt-3"
                    leftIcon={<LockClosedIcon className="w-4 h-4"/>}
                    size="sm"
                    disabled={isSubmitting}
                >
                    Alterar Senha
                </Button>
              </div>
            </div>

            <CollapsibleCard title="Dados Pessoais" defaultOpen={!user.isApproved}>
              <div className="space-y-4">
                <Input label="Data de Nascimento" name="dateOfBirth" type="date" value={formData.dateOfBirth || ''} onChange={handleChange} {...commonInputProps} />
                <Input label="Telefone (com DDD)" name="phone" type="tel" value={formData.phone || ''} onChange={handleChange} placeholder="(XX) XXXXX-XXXX" {...commonInputProps} />
                <div>
                  <label htmlFor="educationLevel" className="block text-sm font-medium text-text-body mb-1.5">Escolaridade</label>
                  <select id="educationLevel" name="educationLevel" value={formData.educationLevel || ''} onChange={handleChange} className={`w-full p-2.5 border border-border-subtle rounded-lg bg-card-bg text-text-body sm:text-sm ${commonInputProps.disabled ? 'opacity-70 cursor-not-allowed' : ''}`} disabled={commonInputProps.disabled}>
                    <option value="">Selecione sua escolaridade (opcional)</option>
                    {Object.values(EducationLevel).map(level => (<option key={level} value={level}>{EDUCATION_LEVEL_NAMES[level]}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-body mb-1.5">Links de Redes Sociais (Opcional)</label>
                  {formData.socialMediaLinks?.map((link, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <select name={`socialMediaPlatform-${index}`} value={link.platform} onChange={(e) => handleSocialMediaChange(index, 'platform', e.target.value)} className="p-2.5 border border-border-subtle rounded-lg bg-card-bg text-text-body sm:text-sm w-1/3" disabled={isSubmitting || formData.hasNoSocialMedia}>
                        <option value="Instagram">Instagram</option><option value="LinkedIn">LinkedIn</option><option value="Facebook">Facebook</option><option value="Outra">Outra</option>
                      </select>
                      <Input type="url" placeholder="Link da sua rede social" value={link.url} onChange={(e) => handleSocialMediaChange(index, 'url', e.target.value)} className="flex-grow" disabled={isSubmitting || formData.hasNoSocialMedia} />
                      {index > 0 && (<Button type="button" variant="danger" size="sm" onClick={() => removeSocialMediaField(index)} iconOnly title="Remover Rede Social" disabled={isSubmitting || formData.hasNoSocialMedia} className="rounded-lg"><XMarkIcon className="w-4 h-4"/></Button>)}
                    </div>
                  ))}
                  <div className="flex items-center justify-between mt-1">
                    {(formData.socialMediaLinks?.length || 0) < 3 && !formData.hasNoSocialMedia && (<Button type="button" variant="outline" size="sm" onClick={addSocialMediaField} disabled={isSubmitting} className="rounded-lg text-xs">Adicionar Rede Social</Button>)}
                    <label htmlFor="hasNoSocialMedia" className="flex items-center cursor-pointer text-sm ml-auto">
                      <input type="checkbox" id="hasNoSocialMedia" name="hasNoSocialMedia" checked={!!formData.hasNoSocialMedia} onChange={handleChange} className="h-4 w-4 text-link-active border-border-subtle rounded focus:ring-link-active mr-1.5" disabled={isSubmitting}/>
                      <span className="text-text-body">Não possuo / Não quero informar</span>
                    </label>
                  </div>
                </div>
              </div>
            </CollapsibleCard>

            <CollapsibleCard title="Perfil Artístico e Interesses" defaultOpen={!user.isApproved}>
              <div className="space-y-4">
                <Textarea label="Meus Objetivos na CENA (Opcional)" name="objectives" value={formData.objectives || ''} onChange={handleChange} rows={3} {...commonInputProps} placeholder="Ex: Aprimorar técnicas de self-tape, networking, etc."/>
                <div>
                  <label htmlFor="actorLevel" className="block text-sm font-medium text-text-body mb-1.5">Auto-declaração de Nível *</label>
                  <select id="actorLevel" name="actorLevel" value={formData.actorLevel} onChange={handleChange} required className={`w-full p-2.5 border border-border-subtle rounded-lg bg-card-bg text-text-body sm:text-sm ${commonInputProps.disabled ? 'opacity-70 cursor-not-allowed' : ''}`} disabled={commonInputProps.disabled}>
                    {Object.values(ActorLevel).map(level => (<option key={level} value={level}>{ACTOR_LEVEL_NAMES[level]}</option>))}
                  </select>
                </div>
                <div>
                  <p className="block text-sm font-medium text-text-body mb-1.5">Técnicas e Metodologias de Interesse (Marque quantas quiser)</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 border border-border-subtle p-3 rounded-lg">
                    {TECHNIQUE_OPTIONS.map(tech => (
                      <label key={tech} className="flex items-center space-x-2 text-sm text-text-body cursor-pointer">
                        <input type="checkbox" name={`interestedTechniques-${tech}`} value={tech} checked={formData.interestedTechniques?.includes(tech)} onChange={handleChange} className="form-checkbox h-4 w-4 text-link-active rounded border-border-subtle focus:ring-link-active" disabled={isSubmitting}/>
                        <span>{tech}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="block text-sm font-medium text-text-body mb-1.5">Outros Interesses (Marque quantos quiser)</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border border-border-subtle p-3 rounded-lg">
                    {ACTOR_OTHER_INTEREST_OPTIONS.map(interest => (
                      <label key={interest.id} className="flex items-center space-x-2 text-sm text-text-body cursor-pointer">
                        <input type="checkbox" name={`otherInterests-${interest.id}`} value={interest.id} checked={formData.otherInterests?.includes(interest.id)} onChange={handleChange} className="form-checkbox h-4 w-4 text-link-active rounded border-border-subtle focus:ring-link-active" disabled={isSubmitting} />
                        <span>{interest.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </CollapsibleCard>

            <CollapsibleCard title="Experiências Formativas e Profissionais" defaultOpen={!user.isApproved}>
               <div className="space-y-4">
                <Textarea label="Principais Experiências Formativas (Opcional)" name="formativeExperiences" value={formData.formativeExperiences || ''} onChange={handleChange} rows={3} {...commonInputProps} placeholder="Ex: Graduação em Artes Cênicas (Escola X, Ano Y)..."/>
                <Textarea label="Principais Experiências Profissionais (Opcional)" name="professionalExperiences" value={formData.professionalExperiences || ''} onChange={handleChange} rows={3} {...commonInputProps} placeholder="Ex: Peça 'Nome da Peça' (Personagem A, Diretor B, Ano C)..."/>
              </div>
            </CollapsibleCard>

            <div className="pt-5 border-t border-border-subtle">
              <Button type="submit" variant="primary" className="w-full" isLoading={isSubmitting} disabled={isSubmitting}>
                {user.isApproved ? 'Salvar Alterações no Perfil' : 'Completar e Salvar Perfil'}
              </Button>
            </div>
          </form>
        </Card>

        {user.isApproved && (
            <Card title="Gerenciar Meu Plano e Assinatura" className="w-full mt-8">
            <div className="p-5">
                {currentPlanDetails && (
                <div className="mb-8 p-4 border border-border-subtle rounded-lg bg-gray-50">
                    <h3 className="text-xl font-semibold text-black mb-2">
                        Seu Plano Atual: <span className="text-black">{currentPlanDetails.name}</span>
                        <span className="text-sm text-text-muted ml-2">({user.billingCycle ? BILLING_CYCLE_NAMES[user.billingCycle] : 'Mensal'})</span>
                    </h3>
                    <p className="text-text-body">Preço: R${calculatePrice(currentPlanDetails.priceMonthly, user.billingCycle || BillingCycle.MONTHLY).toFixed(2)}/mês</p>
                    <p className="text-text-body">{currentPlanDetails.selftapesPerMonth} self-tapes por mês</p>
                </div>
                )}

                <h3 className="text-xl font-semibold text-black mb-6 text-center">Escolha um Novo Plano ou Ciclo de Pagamento</h3>
                <div className="flex justify-center items-center mb-8 p-1.5 bg-action-secondary-bg rounded-lg max-w-md mx-auto shadow-sm">
                {Object.values(BillingCycle).map((cycle) => (
                    <Button key={cycle} variant={selectedCycle === cycle ? 'primary' : 'ghost'} 
                            onClick={() => setSelectedCycle(cycle)}
                            className={`flex-1 text-sm md:text-base rounded-md ${selectedCycle === cycle ? '' : 'text-text-body hover:bg-gray-50'}`}
                            size="sm" disabled={!!loadingPlanId || isSubmitting}>
                    {BILLING_CYCLE_DISCOUNTS_DETAILS[cycle].label.split('(')[0].trim()}
                    </Button>
                ))}
                </div>
                {BILLING_CYCLE_DISCOUNTS_DETAILS[selectedCycle].discountRate > 0 && (
                <p className="text-center text-status-active-text mb-8 font-semibold">
                    {`Você economiza ${BILLING_CYCLE_DISCOUNTS_DETAILS[selectedCycle].discountRate * 100}% com o plano ${BILLING_CYCLE_DISCOUNTS_DETAILS[selectedCycle].label.split('(')[0].trim()}!`}
                    {BILLING_CYCLE_DISCOUNTS_DETAILS[selectedCycle].freeUpgrades > 0 && ` E ganha ${BILLING_CYCLE_DISCOUNTS_DETAILS[selectedCycle].freeUpgrades} upgrade(s) de feedback!`}
                </p>
                )}

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {PRICING_INFO.plans.map((plan) => {
                    const discountedPrice = calculatePrice(plan.priceMonthly, selectedCycle);
                    const isCurrentActivePlan = plan.id === user.activePlan;
                    const isCurrentSelectedCycle = selectedCycle === user.billingCycle;
                    const isCurrentSelection = isCurrentActivePlan && isCurrentSelectedCycle;
                    const isLoadingThisPlan = loadingPlanId === plan.id;

                    return (
                    <Card key={plan.id} className={`flex flex-col h-full p-0 ${isCurrentSelection ? 'border-link-active border-2' : 'border-border-subtle'}`}> 
                        <div className="p-6 text-center">
                        <PriceTagIcon className="w-10 h-10 mx-auto mb-3 text-link-active" />
                        <h3 className="text-xl font-bold text-black mb-1">{plan.name}</h3>
                        <p className="text-3xl sm:text-2xl md:text-3xl font-extrabold text-headings whitespace-nowrap">R${discountedPrice.toFixed(2)}<span className="text-base sm:text-sm md:text-base font-normal text-text-muted">/mês</span></p>
                        {selectedCycle !== BillingCycle.MONTHLY && (<p className="text-xs text-text-muted line-through">De R${plan.priceMonthly.toFixed(2)}/mês</p>)}
                        <p className="text-xs text-text-muted mt-1">
                            Total: R${(discountedPrice * (selectedCycle === BillingCycle.QUARTERLY ? 3 : selectedCycle === BillingCycle.SEMIANNUAL ? 6 : selectedCycle === BillingCycle.ANNUAL ? 12 : 1)).toFixed(2)}
                            {` cobrados ${BILLING_CYCLE_NAMES[selectedCycle].toLowerCase().replace('al', 'almente')}`}
                        </p>
                        </div>
                        <div className="px-6 pb-6 flex-grow">
                        <ul className="space-y-2 text-sm text-text-body">
                            {plan.features.map((feature, idx) => (<li key={idx} className="flex items-start"><CheckIcon className="w-4 h-4 text-status-active-text mr-2 mt-0.5 flex-shrink-0" />{feature}</li>))}
                        </ul>
                        </div>
                        <div className="p-6 mt-auto border-t border-border-subtle">
                        {isCurrentSelection ? (
                            <Button variant="secondary" className="w-full" disabled>Plano Atual</Button>
                        ) : (
                            <Button variant="primary" className="w-full" onClick={() => handleSelectPlan(plan.id, selectedCycle)}
                                    isLoading={isLoadingThisPlan} disabled={(!!loadingPlanId && !isLoadingThisPlan) || isSubmitting}>
                            {isCurrentActivePlan ? 'Mudar Ciclo de Cobrança' : `Escolher ${plan.name}`}
                            </Button>
                        )}
                        </div>
                    </Card>
                    );
                })}
                </div>
                <p className="text-xs text-text-muted text-center mt-8">
                Mudanças de plano e ciclo de pagamento serão efetivadas no próximo período de cobrança (simulação).
                Para cancelamentos, entre em contato com o suporte.
                </p>
            </div>
            </Card>
        )}
      </div>
    </div>
  );
};

export default ActorProfileFormPage;
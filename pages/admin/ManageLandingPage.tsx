
import React, { useState, useEffect } from 'react';
import { Card } from '../../components/Common/Card';
import { Button } from '../../components/Common/Button';
import { Input, Textarea } from '../../components/Common/Input';
import { useLandingPageContent } from '../../contexts/LandingPageContext';
import { LandingPageContent, FeatureItemLP } from '../../types';
import { APP_NAME } from '../../constants';
import { useToasts } from '../../contexts/ToastContext';
import { XMarkIcon, PlusCircleIcon } from '../../components/Common/Icons';

const ManageLandingPage: React.FC = () => {
  const { landingPageContent, updateLandingPageContent } = useLandingPageContent();
  const [formData, setFormData] = useState<LandingPageContent>(landingPageContent);
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToasts();

  useEffect(() => {
    setFormData(landingPageContent);
  }, [landingPageContent]);

  const handleChange = (section: keyof LandingPageContent, field: string, value: string) => {
    setFormData(prev => {
      if (typeof prev[section] === 'object' && prev[section] !== null) {
        return {
          ...prev,
          [section]: {
            ...(prev[section] as object),
            [field]: value,
          },
        };
      }
      return { ...prev, [section]: value };
    });
  };
  
  const handleFeatureItemChange = (index: number, field: keyof Omit<FeatureItemLP, 'id'>, value: string) => {
    setFormData(prev => {
        const newItems = [...prev.featureItems];
        newItems[index] = { ...newItems[index], [field]: value };
        return { ...prev, featureItems: newItems };
    });
  };

  // Note: Adding/removing feature items is not implemented to keep it simple as per
  // "edit texts present in the landing page". If needed, this can be added.
  // For now, assumes a fixed number of feature items (3 based on INITIAL_LANDING_PAGE_CONTENT).

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      updateLandingPageContent(formData);
      addToast('Conteúdo da Landing Page atualizado com sucesso!', 'success');
    } catch (error) {
      addToast('Erro ao atualizar conteúdo da Landing Page.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-0">
      <h1 className="text-2xl md:text-3xl font-bold text-black">Gerenciar Conteúdo da Landing Page</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card title="Seção Hero">
          <div className="space-y-4 p-4">
            <Input
              label="Título Principal (use {APP_NAME} para o nome da plataforma)"
              value={formData.hero.title}
              onChange={(e) => handleChange('hero', 'title', e.target.value)}
              disabled={isLoading}
            />
            <Textarea
              label="Subtítulo"
              value={formData.hero.subtitle}
              onChange={(e) => handleChange('hero', 'subtitle', e.target.value)}
              rows={3}
              disabled={isLoading}
            />
            <Input
              label="Texto do Botão CTA 1 (Ex: Comece Agora)"
              value={formData.hero.ctaButton1Text}
              onChange={(e) => handleChange('hero', 'ctaButton1Text', e.target.value)}
              disabled={isLoading}
            />
            <Input
              label="Texto do Botão CTA 2 (Ex: Ver Planos)"
              value={formData.hero.ctaButton2Text}
              onChange={(e) => handleChange('hero', 'ctaButton2Text', e.target.value)}
              disabled={isLoading}
            />
          </div>
        </Card>

        <Card title="Seção de Destaques">
          <div className="space-y-4 p-4">
            <Input
              label="Título da Seção (use {APP_NAME} para o nome da plataforma)"
              value={formData.featuresSectionTitle}
              onChange={(e) => setFormData(prev => ({...prev, featuresSectionTitle: e.target.value}))}
              disabled={isLoading}
            />
            {formData.featureItems.map((item, index) => (
              <div key={item.id || index} className="p-3 border border-border-subtle rounded-md space-y-2 bg-gray-50">
                <h4 className="font-medium text-text-headings">Destaque {index + 1}</h4>
                <Input
                  label={`Título do Destaque ${index + 1}`}
                  value={item.title}
                  onChange={(e) => handleFeatureItemChange(index, 'title', e.target.value)}
                  disabled={isLoading}
                />
                <Textarea
                  label={`Descrição do Destaque ${index + 1}`}
                  value={item.description}
                  onChange={(e) => handleFeatureItemChange(index, 'description', e.target.value)}
                  rows={2}
                  disabled={isLoading}
                />
              </div>
            ))}
          </div>
        </Card>

        <Card title="Seção de Preview de Planos">
          <div className="space-y-4 p-4">
            <Input
              label="Título da Seção"
              value={formData.pricingPreview.sectionTitle}
              onChange={(e) => handleChange('pricingPreview', 'sectionTitle', e.target.value)}
              disabled={isLoading}
            />
            <Input
              label="Texto do Botão 'Ver Todos os Planos'"
              value={formData.pricingPreview.viewAllPlansButtonText}
              onChange={(e) => handleChange('pricingPreview', 'viewAllPlansButtonText', e.target.value)}
              disabled={isLoading}
            />
          </div>
        </Card>

        <Card title="Seção de Chamada Final (CTA)">
          <div className="space-y-4 p-4">
            <Input
              label="Título (use {APP_NAME} para o nome da plataforma)"
              value={formData.finalCTA.title}
              onChange={(e) => handleChange('finalCTA', 'title', e.target.value)}
              disabled={isLoading}
            />
            <Textarea
              label="Subtítulo/Descrição"
              value={formData.finalCTA.subtitle}
              onChange={(e) => handleChange('finalCTA', 'subtitle', e.target.value)}
              rows={2}
              disabled={isLoading}
            />
            <Input
              label="Texto do Botão CTA"
              value={formData.finalCTA.buttonText}
              onChange={(e) => handleChange('finalCTA', 'buttonText', e.target.value)}
              disabled={isLoading}
            />
          </div>
        </Card>
        
        <Card title="Rodapé">
            <div className="p-4">
                <Input
                label="Template do Texto de Copyright (use {YEAR} e {APP_NAME})"
                value={formData.footerCopyrightTextTemplate}
                onChange={(e) => setFormData(prev => ({...prev, footerCopyrightTextTemplate: e.target.value}))}
                disabled={isLoading}
                />
                <p className="text-xs text-text-muted mt-1">
                    Exemplo: {formData.footerCopyrightTextTemplate.replace('{YEAR}', new Date().getFullYear().toString()).replace('{APP_NAME}', APP_NAME)}
                </p>
            </div>
        </Card>

        <div className="pt-6 border-t border-border-subtle">
          <Button type="submit" variant="primary" isLoading={isLoading} disabled={isLoading}>
            Salvar Alterações da Landing Page
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ManageLandingPage;

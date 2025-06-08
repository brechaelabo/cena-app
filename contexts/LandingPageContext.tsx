
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { LandingPageContent, HeroContentLP, FeatureItemLP, PricingPreviewLP, FinalCTAContentLP } from '../types';
import { APP_NAME } from '../constants';

// Conteúdo ATUALIZADO da LandingPage.tsx conforme solicitado pelo usuário
const INITIAL_LANDING_PAGE_CONTENT: LandingPageContent = {
  hero: {
    title: "CENA: a plataforma do Ator",
    subtitle: "Desenvolva-se como ator a qualquer hora e de qualquer lugar.",
    ctaButton1Text: "Comece Agora",
    ctaButton2Text: "Ver Planos",
  },
  featuresSectionTitle: `Por que escolher ${APP_NAME}?`,
  featureItems: [
    {
      id: 'pratica-constante',
      title: "Prática Constante",
      description: "Desafios de \"self-tape\" baseados em temas mensais para desenvolver suas habilidades."
    },
    {
      id: 'feedback-detalhado',
      title: "Feedback Detalhado",
      description: "Receba análises profundas de tutores qualificados para aprimorar suas performances."
    },
    {
      id: 'comunidade-suporte', // ID mantido, mas título e descrição mudam
      title: "Estratégias de Mercado",
      description: "Participe de eventos e workshops ao vivo com profissionais da indústria."
    }
  ],
  pricingPreview: {
    sectionTitle: "Nossos Planos",
    viewAllPlansButtonText: "Ver todos os planos e Add-ons",
  },
  finalCTA: {
    title: "Pronto para dar o próximo passo?",
    subtitle: "Junte-se à CENA e transforme seu talento em ação.",
    buttonText: "Criar minha Conta",
  },
  footerCopyrightTextTemplate: `© {YEAR} ${APP_NAME}. Todos os direitos reservados.` // Placeholder for year
};

// NOTA: A constante INITIAL_LANDING_PAGE_CONTENT acima define o conteúdo padrão
// que será carregado se nenhuma configuração for encontrada no localStorage.
// Se você atualizou esta constante para refletir os novos padrões desejados,
// a aplicação a usará quando o localStorage estiver vazio.

interface LandingPageContextType {
  landingPageContent: LandingPageContent;
  updateLandingPageContent: (newContent: Partial<LandingPageContent>) => void;
}

const LandingPageContext = createContext<LandingPageContextType | undefined>(undefined);

export const LandingPageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [landingPageContent, setLandingPageContent] = useState<LandingPageContent>(() => {
    const storedContent = localStorage.getItem('cena-landing-page-current-texts');
    return storedContent ? JSON.parse(storedContent) : INITIAL_LANDING_PAGE_CONTENT;
  });

  useEffect(() => {
    localStorage.setItem('cena-landing-page-current-texts', JSON.stringify(landingPageContent));
  }, [landingPageContent]);

  const updateLandingPageContent = (newContent: Partial<LandingPageContent>) => {
    setLandingPageContent(prevContent => ({
      ...prevContent,
      ...newContent,
      // Deep merge for nested objects if necessary, e.g., hero section
      hero: { ...prevContent.hero, ...newContent.hero },
      pricingPreview: { ...prevContent.pricingPreview, ...newContent.pricingPreview },
      finalCTA: { ...prevContent.finalCTA, ...newContent.finalCTA },
      // For arrays like featureItems, a more robust merge might be needed if individual items are editable
      // For now, simple replace for featureItems if provided
      featureItems: newContent.featureItems || prevContent.featureItems,
    }));
  };

  return (
    <LandingPageContext.Provider value={{ landingPageContent, updateLandingPageContent }}>
      {children}
    </LandingPageContext.Provider>
  );
};

export const useLandingPageContent = (): LandingPageContextType => {
  const context = useContext(LandingPageContext);
  if (context === undefined) {
    throw new Error('useLandingPageContent must be used within a LandingPageProvider');
  }
  return context;
};

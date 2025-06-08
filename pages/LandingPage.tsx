
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Common/Button';
import { Card } from '../components/Common/Card';
import { ClipboardCheckIcon, PriceTagIcon, CheckCircleIcon, ArrowPathIcon, NetworkIcon, type IconProps } from '../components/Common/Icons'; // Updated imports
import { APP_NAME, PATHS, PRICING_INFO, BILLING_CYCLE_DISCOUNTS_DETAILS } from '../constants';
import { BillingCycle, Plan } from '../types';
import { useLandingPageContent } from '../contexts/LandingPageContext'; // New import

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactElement<IconProps>;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon }) => (
  <Card className="text-center p-6 md:p-8 h-full"> {/* Card uses bg-card-bg (white) via Card.tsx */}
    <div className="flex justify-center mb-5">
      {React.cloneElement(icon, { className: "w-10 h-10 md:w-12 md:h-12 text-link-active" })}
    </div>
    <h3 className="text-xl font-semibold text-headings mb-3">{title}</h3>
    <p className="text-text-body">{description}</p>
  </Card>
);


const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCycle, setSelectedCycle] = useState<BillingCycle>(BillingCycle.MONTHLY);
  const { landingPageContent } = useLandingPageContent(); // Use context

  const calculatePrice = (basePrice: number, cycle: BillingCycle) => {
    const discountRate = BILLING_CYCLE_DISCOUNTS_DETAILS[cycle].discountRate;
    return basePrice * (1 - discountRate);
  };

  const featureIcons = [
    <ArrowPathIcon />,
    <ClipboardCheckIcon />,
    <NetworkIcon />
  ];

  return (
    <div className="min-h-screen bg-page-bg text-text-body"> {/* Default page background and text color */}
      {/* Hero Section */}
      <section className="py-20 md:py-32 text-center bg-card-bg"> {/* White background for Hero */}
        <div className="container mx-auto px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-headings mb-6">
            {landingPageContent.hero.title.replace('{APP_NAME}', APP_NAME)}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-text-body mb-10 max-w-3xl mx-auto">
            {landingPageContent.hero.subtitle}
          </p>
          <div className="space-y-4 sm:space-y-0 sm:space-x-4">
            <Button size="lg" variant="primary" onClick={() => navigate(PATHS.REGISTER)} className="w-full sm:w-auto rounded-lg">
              {landingPageContent.hero.ctaButton1Text}
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate(PATHS.PRICING)} className="w-full sm:w-auto rounded-lg">
              {landingPageContent.hero.ctaButton2Text}
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-page-bg"> {/* Light gray background */}
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-semibold text-center text-headings mb-16">
            {landingPageContent.featuresSectionTitle.replace('{APP_NAME}', APP_NAME)}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {landingPageContent.featureItems.map((feature, index) => (
              <FeatureCard
                key={feature.id}
                icon={featureIcons[index % featureIcons.length]} // Cycle through available icons
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="py-16 md:py-24 bg-card-bg"> {/* White background */}
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-semibold text-center text-headings mb-12">
            {landingPageContent.pricingPreview.sectionTitle}
          </h2>

          {/* Billing Cycle Selector */}
          <div className="flex justify-center items-center mb-10 p-1 bg-action-secondary-bg rounded-lg max-w-md mx-auto shadow-sm">
            {Object.values(BillingCycle).map((cycle) => (
              <Button
                key={cycle}
                variant={selectedCycle === cycle ? 'primary' : 'ghost'}
                onClick={() => setSelectedCycle(cycle)}
                className={`flex-1 text-sm md:text-base rounded-md ${selectedCycle === cycle ? '' : 'text-text-body hover:bg-gray-50'}`}
                size="sm"
              >
                {BILLING_CYCLE_DISCOUNTS_DETAILS[cycle].label.split('(')[0].trim()}
              </Button>
            ))}
          </div>
          {BILLING_CYCLE_DISCOUNTS_DETAILS[selectedCycle].discountRate > 0 && (
              <p className="text-center text-status-active-text mb-10 font-semibold">
                  {`Você economiza ${BILLING_CYCLE_DISCOUNTS_DETAILS[selectedCycle].discountRate * 100}% com o plano ${BILLING_CYCLE_DISCOUNTS_DETAILS[selectedCycle].label.split('(')[0].trim()}!`}
                  {BILLING_CYCLE_DISCOUNTS_DETAILS[selectedCycle].freeUpgrades > 0 && ` E ganha ${BILLING_CYCLE_DISCOUNTS_DETAILS[selectedCycle].freeUpgrades} upgrade(s) de feedback ao vivo!`}
              </p>
          )}

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            {PRICING_INFO.plans.slice(0,3).map((plan) => {
              const discountedPrice = calculatePrice(plan.priceMonthly, selectedCycle);
              return (
                <Card key={plan.id} className="text-center p-6 h-full flex flex-col">
                  <PriceTagIcon className="w-10 h-10 mx-auto mb-4 text-link-active" />
                  <h3 className="text-2xl font-bold text-headings mb-2">{plan.name}</h3>
                  <p className="text-2xl sm:text-3xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-extrabold text-headings mb-1 leading-tight">
                    <span className="inline-block">R${discountedPrice.toFixed(2)}</span><span className="text-[0.4em] font-normal text-text-muted whitespace-nowrap">/mês</span>
                  </p>
                  {selectedCycle !== BillingCycle.MONTHLY && (
                    <p className="text-sm text-text-muted line-through">De R$${plan.priceMonthly.toFixed(2)}/mês</p>
                  )}
                   <p className="text-xs text-text-muted mt-1">
                    Total: R${(discountedPrice * (selectedCycle === BillingCycle.QUARTERLY ? 3 : selectedCycle === BillingCycle.SEMIANNUAL ? 6 : selectedCycle === BillingCycle.ANNUAL ? 12 : 1)).toFixed(2)}
                    {` cobrados ${
                        selectedCycle === BillingCycle.QUARTERLY ? BILLING_CYCLE_DISCOUNTS_DETAILS[BillingCycle.QUARTERLY].label.split('(')[0].toLowerCase().replace('al', 'almente') :
                        selectedCycle === BillingCycle.SEMIANNUAL ? BILLING_CYCLE_DISCOUNTS_DETAILS[BillingCycle.SEMIANNUAL].label.split('(')[0].toLowerCase().replace('al', 'almente') :
                        selectedCycle === BillingCycle.ANNUAL ? BILLING_CYCLE_DISCOUNTS_DETAILS[BillingCycle.ANNUAL].label.split('(')[0].toLowerCase().replace('al', 'almente') : 
                        BILLING_CYCLE_DISCOUNTS_DETAILS[BillingCycle.MONTHLY].label.split('(')[0].toLowerCase().replace('al', 'almente')
                    }`}
                  </p>
                  <ul className="text-left space-y-2 my-6 text-text-body flex-grow">
                    {plan.features.slice(0, 3).map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckCircleIcon className="w-5 h-5 text-status-active-text mr-2 mt-0.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button variant="primary" onClick={() => navigate(PATHS.PRICING)} className="w-full mt-auto rounded-lg">
                    Ver Detalhes
                  </Button>
                </Card>
              );
            })}
          </div>
           <div className="text-center mt-16">
            <Button size="lg" variant="outline" onClick={() => navigate(PATHS.PRICING)} className="rounded-lg">
                {landingPageContent.pricingPreview.viewAllPlansButtonText}
            </Button>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 text-center bg-page-bg"> {/* Light gray background */}
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-semibold text-headings mb-6">
            {landingPageContent.finalCTA.title}
          </h2>
          <p className="text-lg text-text-body mb-8 max-w-xl mx-auto">
            {landingPageContent.finalCTA.subtitle.replace('{APP_NAME}', APP_NAME)}
          </p>
          <Button size="lg" variant="primary" onClick={() => navigate(PATHS.REGISTER)} className="rounded-lg">
            {landingPageContent.finalCTA.buttonText}
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-800 text-center"> {/* Dark footer for contrast */}
        <p className="text-text-secondary text-sm">
          {landingPageContent.footerCopyrightTextTemplate
            .replace('{YEAR}', new Date().getFullYear().toString())
            .replace('{APP_NAME}', APP_NAME)}
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
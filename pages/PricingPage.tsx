
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Common/Button';
import { Card } from '../components/Common/Card';
import { PRICING_INFO, BILLING_CYCLE_DISCOUNTS_DETAILS, PLAN_DETAILS_MAP, PATHS } from '../constants';
import { BillingCycle, Plan } from '../types';
import { PriceTagIcon, CheckCircleIcon, ArrowLeftIcon } from '../components/Common/Icons';

const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCycle, setSelectedCycle] = useState<BillingCycle>(BillingCycle.MONTHLY);

  const calculatePrice = (basePrice: number, cycle: BillingCycle) => {
    const discountRate = BILLING_CYCLE_DISCOUNTS_DETAILS[cycle].discountRate;
    return basePrice * (1 - discountRate);
  };

  return (
    <div className="min-h-screen bg-page-bg text-text-body py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate(PATHS.HOME)} 
              className="text-text-muted hover:text-link-active group inline-flex items-center" // Updated className
            >
                <ArrowLeftIcon className="w-5 h-5 mr-1.5 text-text-muted group-hover:text-link-active transition-colors" /> Voltar para Home
            </Button>
        </div>
        <header className="text-center mb-12 md:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-headings">Nossos Planos e Preços</h1>
          <p className="text-lg text-text-body mt-4 max-w-2xl mx-auto">
            Escolha o plano ideal para suas necessidades e aproveite descontos com ciclos de pagamento mais longos.
          </p>
        </header>

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

        {/* Plans Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16 items-stretch">
          {PRICING_INFO.plans.map((plan) => {
            const discountedPrice = calculatePrice(plan.priceMonthly, selectedCycle);
            return (
              <Card key={plan.id} className="flex flex-col h-full p-6"> {/* Card usa bg-card-bg */}
                <div className="text-center">
                  <PriceTagIcon className="w-10 h-10 mx-auto mb-4 text-link-active" />
                  <h2 className="text-2xl font-bold text-headings mb-2">{plan.name}</h2>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-headings mb-1">
                    R${discountedPrice.toFixed(2)}
                    <span className="text-sm sm:text-base font-normal text-text-muted">/mês</span>
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
                </div>
                <div className="py-6 flex-grow">
                  <ul className="space-y-3 text-text-body">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckCircleIcon className="w-5 h-5 text-status-active-text mr-2 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-auto">
                  <Button variant="primary" className="w-full rounded-lg" onClick={() => navigate(PATHS.REGISTER)}>
                    Escolher Plano {plan.name}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Add-ons Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-semibold text-center text-headings mb-12">Add-ons Exclusivos</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <Card className="p-6">
              <h3 className="text-xl font-bold text-headings mb-2">{PRICING_INFO.addOns.liveFeedback.description}</h3>
              <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-headings mb-4">R${PRICING_INFO.addOns.liveFeedback.price.toFixed(2)}</p>
              <p className="text-text-body mb-4">Transforme um feedback assíncrono em uma sessão interativa de 25 minutos com seu tutor.</p>
              <Button variant="secondary" className="w-full rounded-lg" onClick={() => navigate(PATHS.REGISTER)}>Adicionar</Button>
            </Card>
            <Card className="p-6">
              <h3 className="text-xl font-bold text-headings mb-2">{PRICING_INFO.addOns.oneOnOneSession.description}</h3>
              <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-headings mb-4">R${PRICING_INFO.addOns.oneOnOneSession.price.toFixed(2)}</p>
              <p className="text-text-body mb-4">Uma sessão de 45 minutos focada em suas necessidades: análise de texto, técnica ou feedback de regravação.</p>
              <Button variant="secondary" className="w-full rounded-lg" onClick={() => navigate(PATHS.REGISTER)}>Adicionar</Button>
            </Card>
          </div>
        </section>
        
      </div>
    </div>
  );
};

export default PricingPage;
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CreditCard, Calculator, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useParams } from 'react-router-dom';
import type { SupportedLanguage } from '@/i18n';

interface FinancingSimulatorProps {
  price: number;
  className?: string;
}

const DURATION_OPTIONS = [12, 24, 36, 48, 60, 72];
const FINANCING_THRESHOLD = 5000;

const FinancingSimulator = ({ price, className }: FinancingSimulatorProps) => {
  const { t, i18n } = useTranslation();
  const { lang } = useParams<{ lang: string }>();
  const currentLang = (lang || i18n.language || 'en') as SupportedLanguage;
  
  const [selectedDuration, setSelectedDuration] = useState(72);

  // Don't show if price is below threshold
  if (price < FINANCING_THRESHOLD) {
    return null;
  }

  const formatPrice = (amount: number) => {
    const locale = currentLang === 'en' ? 'en-GB' : 
                   currentLang === 'de' ? 'de-DE' : 
                   currentLang === 'es' ? 'es-ES' :
                   currentLang === 'it' ? 'it-IT' :
                   currentLang === 'pt' ? 'pt-PT' : 'fr-FR';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const monthlyPayment = Math.round(price / selectedDuration);

  return (
    <Card className={cn("border-success/30 bg-success/5", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <Calculator className="h-5 w-5 text-success" />
          {t('financing.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Payment options */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Check className="h-4 w-4 text-success" />
          <span>{t('financing.cashOption')}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Check className="h-4 w-4 text-success" />
          <span>{t('financing.financingOption')}</span>
        </div>

        {/* Duration selector */}
        <div className="pt-2">
          <p className="text-sm font-medium mb-3">{t('financing.selectDuration')}</p>
          <div className="grid grid-cols-3 gap-2">
            {DURATION_OPTIONS.map((months) => (
              <Button
                key={months}
                variant={selectedDuration === months ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDuration(months)}
                className={cn(
                  "text-xs",
                  selectedDuration === months && "bg-success hover:bg-success/90 text-success-foreground"
                )}
              >
                {months} {t('financing.months')}
              </Button>
            ))}
          </div>
        </div>

        {/* Monthly payment result */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t('financing.monthlyPayment')}</p>
              <p className="text-2xl font-display font-bold text-success">
                {formatPrice(monthlyPayment)}
                <span className="text-sm font-normal text-muted-foreground">/{t('financing.month')}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">{t('financing.duration')}</p>
              <p className="text-lg font-semibold">{selectedDuration} {t('financing.months')}</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <Button variant="outline" className="w-full border-success text-success hover:bg-success hover:text-success-foreground">
          <CreditCard className="h-4 w-4 mr-2" />
          {t('financing.requestFinancing')}
        </Button>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground text-center">
          {t('financing.disclaimer')}
        </p>
      </CardContent>
    </Card>
  );
};

export default FinancingSimulator;
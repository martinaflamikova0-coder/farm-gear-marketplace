import { Truck, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ShippingPolicyBannerProps {
  variant?: 'compact' | 'full';
}

const ShippingPolicyBanner = ({ variant = 'full' }: ShippingPolicyBannerProps) => {
  const { t } = useTranslation();

  if (variant === 'compact') {
    return (
      <div className="flex items-start gap-2 p-3 bg-primary/5 border border-primary/10 rounded-lg text-sm">
        <Truck className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-medium text-foreground">{t('shipping.policyTitle')}</p>
          <p className="text-muted-foreground text-xs mt-0.5">{t('shipping.policyShort')}</p>
        </div>
      </div>
    );
  }

  return (
    <Alert className="border-primary/20 bg-primary/5">
      <Truck className="h-4 w-4 text-primary" />
      <AlertDescription className="ml-2">
        <p className="font-medium text-foreground mb-1">{t('shipping.policyTitle')}</p>
        <p className="text-sm text-muted-foreground">{t('shipping.policyFull')}</p>
      </AlertDescription>
    </Alert>
  );
};

export default ShippingPolicyBanner;

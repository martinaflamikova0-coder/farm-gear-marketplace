import { Truck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useShippingZoneForCountry } from '@/hooks/useShippingZones';

interface DeliveryEstimateProps {
  countryCode: string | null;
}

const DeliveryEstimate = ({ countryCode }: DeliveryEstimateProps) => {
  const { t } = useTranslation();
  const zone = useShippingZoneForCountry(countryCode);

  if (!zone) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <Truck className="h-5 w-5 text-primary" />
      </div>
      <div>
        <p className="font-medium text-sm">{t('checkout.deliveryEstimate.title')}</p>
        <p className="text-sm text-muted-foreground">
          {t('checkout.deliveryEstimate.days', { min: zone.min_days, max: zone.max_days })}
        </p>
      </div>
    </div>
  );
};

export default DeliveryEstimate;

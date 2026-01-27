import { useTranslation } from 'react-i18next';
import { Truck } from 'lucide-react';
import { useShippingZones } from '@/hooks/useShippingZones';

interface OrderDeliveryEstimateProps {
  countryCode: string | null;
}

const OrderDeliveryEstimate = ({ countryCode }: OrderDeliveryEstimateProps) => {
  const { t } = useTranslation();
  const { data: zones, isLoading } = useShippingZones();

  if (!countryCode || isLoading || !zones) return null;

  // Find specific zone for the country
  const specificZone = zones.find(zone => 
    zone.is_active && zone.countries.includes(countryCode)
  );

  // Fallback to "rest of world" zone (contains '*')
  const zone = specificZone || zones.find(zone => zone.is_active && zone.countries.includes('*'));

  if (!zone) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Truck className="h-4 w-4" />
      <span>
        {t('checkout.deliveryEstimate', { min: zone.min_days, max: zone.max_days })}
      </span>
    </div>
  );
};

export default OrderDeliveryEstimate;

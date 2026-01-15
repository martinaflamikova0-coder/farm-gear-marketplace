import { Shield, Truck, Users, Award, Headphones } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const TrustBar = () => {
  const { t } = useTranslation();

  const trustItems = [
    {
      icon: Shield,
      title: t('trust.securePayment'),
      subtitle: t('trust.securePaymentDesc'),
    },
    {
      icon: Truck,
      title: t('trust.delivery'),
      subtitle: t('trust.deliveryDesc'),
    },
    {
      icon: Award,
      title: t('trust.quality'),
      subtitle: t('trust.qualityDesc'),
    },
    {
      icon: Users,
      title: t('trust.proAndPrivate'),
      subtitle: t('trust.proAndPrivateDesc'),
    },
    {
      icon: Headphones,
      title: t('trust.support'),
      subtitle: t('trust.supportDesc'),
    },
  ];

  return (
    <div className="bg-card border-y border-border/50">
      <div className="container-custom py-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {trustItems.map((item, index) => (
            <div key={index} className="flex flex-col items-center text-center gap-2">
              <div className="p-3 rounded-full bg-primary/10">
                <item.icon className="h-6 w-6 text-primary" strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-medium text-sm text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrustBar;

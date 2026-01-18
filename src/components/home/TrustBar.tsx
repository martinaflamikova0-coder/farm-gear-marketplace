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

  // Triple the items for seamless loop
  const duplicatedItems = [...trustItems, ...trustItems, ...trustItems];

  return (
    <div className="bg-primary text-primary-foreground overflow-hidden w-full">
      <div className="py-4 flex items-center overflow-hidden">
        <div 
          className="flex items-center gap-0"
          style={{
            animation: 'marquee 30s linear infinite',
            width: 'max-content',
          }}
        >
          {duplicatedItems.map((item, index) => (
            <div 
              key={index} 
              className="flex items-center gap-2 px-6 md:px-10 flex-shrink-0"
              style={{ whiteSpace: 'nowrap' }}
            >
              <item.icon className="h-5 w-5 opacity-80 flex-shrink-0" strokeWidth={1.5} />
              <span className="font-medium text-sm">{item.title}</span>
              <span className="text-sm opacity-70 mx-1">—</span>
              <span className="text-sm opacity-80">{item.subtitle}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrustBar;

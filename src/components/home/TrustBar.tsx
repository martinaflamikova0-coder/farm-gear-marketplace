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

  // Sextuple the items for seamless loop on all screen sizes
  const duplicatedItems = [...trustItems, ...trustItems, ...trustItems, ...trustItems, ...trustItems, ...trustItems];

  return (
    <div className="bg-primary text-primary-foreground overflow-hidden w-full">
      <div className="py-3 md:py-4">
        <div className="flex animate-marquee w-max min-w-[200%]">
          {duplicatedItems.map((item, index) => (
            <div 
              key={index} 
              className="flex items-center gap-2 px-4 md:px-8 shrink-0 whitespace-nowrap"
            >
              <item.icon className="h-4 w-4 md:h-5 md:w-5 opacity-80 shrink-0" strokeWidth={1.5} />
              <span className="font-medium text-xs md:text-sm">{item.title}</span>
              <span className="text-xs md:text-sm opacity-70 mx-1 hidden sm:inline">—</span>
              <span className="text-xs md:text-sm opacity-80 hidden sm:inline">{item.subtitle}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrustBar;

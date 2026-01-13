import { useTranslation } from 'react-i18next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Search, MessageCircle, Handshake, CheckCircle } from 'lucide-react';

const HowItWorks = () => {
  const { t } = useTranslation();

  const steps = [
    { icon: Search, step: '1', titleKey: 'step1Title', descKey: 'step1Desc' },
    { icon: MessageCircle, step: '2', titleKey: 'step2Title', descKey: 'step2Desc' },
    { icon: Handshake, step: '3', titleKey: 'step3Title', descKey: 'step3Desc' },
    { icon: CheckCircle, step: '4', titleKey: 'step4Title', descKey: 'step4Desc' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-background">
        <div className="container-custom py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="font-display text-4xl font-bold text-foreground mb-4">
                {t('pages.howItWorks.title')}
              </h1>
              <p className="text-lg text-muted-foreground">
                {t('pages.howItWorks.subtitle')}
              </p>
            </div>

            <div className="space-y-6">
              {steps.map((item, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex gap-6 items-start">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                          <span className="text-2xl font-bold">{item.step}</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <item.icon className="h-5 w-5 text-primary" />
                          <h3 className="font-display text-xl font-semibold text-foreground">
                            {t(`pages.howItWorks.${item.titleKey}`)}
                          </h3>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                          {t(`pages.howItWorks.${item.descKey}`)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="mt-12 bg-secondary">
              <CardContent className="p-8 text-center">
                <h3 className="font-display text-2xl font-bold text-foreground mb-4">
                  {t('pages.howItWorks.sellerTitle')}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {t('pages.howItWorks.sellerDesc')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HowItWorks;

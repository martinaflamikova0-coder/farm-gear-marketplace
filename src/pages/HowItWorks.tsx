import { useTranslation } from 'react-i18next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/SEOHead';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';
import HeaderSpacer from '@/components/layout/HeaderSpacer';
import { Card, CardContent } from '@/components/ui/card';
import { Search, MessageCircle, Handshake, CheckCircle } from 'lucide-react';

const HowItWorks = () => {
  const { t } = useTranslation();

  const steps = [
    { icon: Search, step: '1', titleKey: 'step1Title', descKey: 'step1Desc', color: 'from-blue-500 to-blue-600' },
    { icon: MessageCircle, step: '2', titleKey: 'step2Title', descKey: 'step2Desc', color: 'from-emerald-500 to-emerald-600' },
    { icon: Handshake, step: '3', titleKey: 'step3Title', descKey: 'step3Desc', color: 'from-amber-500 to-amber-600' },
    { icon: CheckCircle, step: '4', titleKey: 'step4Title', descKey: 'step4Desc', color: 'from-purple-500 to-purple-600' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead titleKey="seo.howItWorks.title" descriptionKey="seo.howItWorks.description" keywordsKey="seo.howItWorks.keywords" />
      <BreadcrumbJsonLd items={[{ name: t('pages.howItWorks.title'), path: 'how-it-works' }]} />
      <Header />
      <HeaderSpacer />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground overflow-hidden">
        <div className="container-custom py-16 md:py-20 relative text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            {t('pages.howItWorks.title')}
          </h1>
          <p className="text-lg text-primary-foreground/85 max-w-2xl mx-auto">
            {t('pages.howItWorks.subtitle')}
          </p>
        </div>
        <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 40" fill="none" preserveAspectRatio="none">
          <path d="M0,40 L0,15 Q360,0 720,15 Q1080,30 1440,15 L1440,40 Z" fill="hsl(var(--background))" />
        </svg>
      </section>

      <main className="flex-1 bg-background">
        <div className="container-custom py-12 md:py-16">
          <div className="max-w-3xl mx-auto">
            {/* Steps with connecting line */}
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-7 top-8 bottom-8 w-0.5 bg-border hidden md:block" />

              <div className="space-y-6">
                {steps.map((item, index) => (
                  <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20 overflow-hidden relative">
                    <CardContent className="p-6 md:p-8">
                      <div className="flex gap-5 md:gap-6 items-start">
                        <div className="flex-shrink-0 relative z-10">
                          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                            <span className="text-xl font-bold">{item.step}</span>
                          </div>
                        </div>
                        <div className="flex-1 pt-1">
                          <div className="flex items-center gap-3 mb-2">
                            <item.icon className="h-5 w-5 text-primary" />
                            <h3 className="font-display text-lg md:text-xl font-bold text-foreground">
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
            </div>

            {/* Seller CTA */}
            <Card className="mt-12 bg-gradient-to-br from-secondary to-muted border-border/50">
              <CardContent className="p-8 md:p-10 text-center">
                <h3 className="font-display text-2xl font-bold text-foreground mb-4">
                  {t('pages.howItWorks.sellerTitle')}
                </h3>
                <p className="text-muted-foreground max-w-lg mx-auto">
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

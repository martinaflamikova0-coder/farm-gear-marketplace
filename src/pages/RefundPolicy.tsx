import { useTranslation } from 'react-i18next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/SEOHead';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';
import HeaderSpacer from '@/components/layout/HeaderSpacer';
import { Euro, Clock, CreditCard, ShieldCheck, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const RefundPolicy = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead titleKey="seo.refundPolicy.title" descriptionKey="seo.refundPolicy.description" keywordsKey="seo.refundPolicy.keywords" />
      <BreadcrumbJsonLd items={[{ name: t('pages.refundPolicy.title'), path: 'refund-policy' }]} />
      <Header />
      <HeaderSpacer />
      <main className="flex-1 bg-background">
        <div className="container-custom py-12">
          <div className="max-w-4xl mx-auto">
            {/* Hero */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                <Euro className="w-8 h-8 text-primary" />
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-4 text-foreground">
                {t('pages.refundPolicy.title')}
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('pages.refundPolicy.subtitle')}
              </p>
            </div>

            <div className="space-y-8">
              {/* Eligibility */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    {t('pages.refundPolicy.eligibilityTitle')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-muted-foreground">
                  <p>{t('pages.refundPolicy.eligibilityContent')}</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>{t('pages.refundPolicy.eligible1')}</li>
                    <li>{t('pages.refundPolicy.eligible2')}</li>
                    <li>{t('pages.refundPolicy.eligible3')}</li>
                    <li>{t('pages.refundPolicy.eligible4')}</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-primary" />
                    {t('pages.refundPolicy.timelineTitle')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-muted-foreground">
                  <p>{t('pages.refundPolicy.timelineContent')}</p>
                </CardContent>
              </Card>

              {/* Methods */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-primary" />
                    {t('pages.refundPolicy.methodTitle')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-muted-foreground">
                  <p>{t('pages.refundPolicy.methodContent')}</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>{t('pages.refundPolicy.method1')}</li>
                    <li>{t('pages.refundPolicy.method2')}</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Deductions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Euro className="w-5 h-5 text-destructive" />
                    {t('pages.refundPolicy.deductionsTitle')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-muted-foreground">
                  <p>{t('pages.refundPolicy.deductionsContent')}</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>{t('pages.refundPolicy.deduction1')}</li>
                    <li>{t('pages.refundPolicy.deduction2')}</li>
                    <li>{t('pages.refundPolicy.deduction3')}</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Contact */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-primary" />
                    {t('pages.refundPolicy.contactTitle')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  <p>{t('pages.refundPolicy.contactContent')}</p>
                  <a href="mailto:infos@ekip-trade.com" className="text-primary hover:underline font-medium">
                    infos@ekip-trade.com
                  </a>
                </CardContent>
              </Card>
            </div>

            <p className="text-sm text-muted-foreground text-center mt-8">
              {t('pages.refundPolicy.lastUpdate')}
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RefundPolicy;

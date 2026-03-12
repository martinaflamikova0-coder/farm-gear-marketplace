import { useTranslation } from 'react-i18next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeaderSpacer from '@/components/layout/HeaderSpacer';
import SEOHead from '@/components/SEOHead';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Package, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  Truck, 
  Mail, 
  Euro,
  CheckCircle2,
  XCircle,
  Info
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const Returns = () => {
  const { t, i18n } = useTranslation();

  return (
    <>
      <SEOHead
        titleKey="returns.seo.title"
        descriptionKey="returns.seo.description"
      />
      <BreadcrumbJsonLd items={[{ name: t('returns.pageTitle'), path: 'returns' }]} />
      <div className="min-h-screen bg-background">
        <Header />
        <HeaderSpacer />
        
        <main className="container-custom py-8 md:py-12">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <Package className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-4 text-foreground">
              {t('returns.title')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('returns.subtitle')}
            </p>
          </div>

          {/* Important Notice */}
          <Alert className="mb-8 border-primary/20 bg-primary/5">
            <Info className="h-5 w-5 text-primary" />
            <AlertTitle className="text-primary font-semibold">{t('returns.importantNotice.title')}</AlertTitle>
            <AlertDescription className="text-muted-foreground">
              {t('returns.importantNotice.description')}
            </AlertDescription>
          </Alert>

          {/* Right of Withdrawal Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-primary" />
                {t('returns.withdrawal.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{t('returns.withdrawal.intro')}</p>
              
              <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
                <h4 className="font-semibold text-foreground mb-2">{t('returns.withdrawal.period.title')}</h4>
                <p className="text-muted-foreground">{t('returns.withdrawal.period.description')}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800">
                  <h5 className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-5 h-5" />
                    {t('returns.withdrawal.eligible.title')}
                  </h5>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• {t('returns.withdrawal.eligible.item1')}</li>
                    <li>• {t('returns.withdrawal.eligible.item2')}</li>
                    <li>• {t('returns.withdrawal.eligible.item3')}</li>
                    <li>• {t('returns.withdrawal.eligible.item4')}</li>
                  </ul>
                </div>
                <div className="bg-destructive/10 rounded-lg p-4 border border-destructive/20">
                  <h5 className="font-semibold text-destructive flex items-center gap-2 mb-3">
                    <XCircle className="w-5 h-5" />
                    {t('returns.withdrawal.excluded.title')}
                  </h5>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• {t('returns.withdrawal.excluded.item1')}</li>
                    <li>• {t('returns.withdrawal.excluded.item2')}</li>
                    <li>• {t('returns.withdrawal.excluded.item3')}</li>
                    <li>• {t('returns.withdrawal.excluded.item4')}</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Return Process Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-primary" />
                {t('returns.process.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">{t('returns.process.step1.title')}</h4>
                    <p className="text-muted-foreground">{t('returns.process.step1.description')}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">{t('returns.process.step2.title')}</h4>
                    <p className="text-muted-foreground">{t('returns.process.step2.description')}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">{t('returns.process.step3.title')}</h4>
                    <p className="text-muted-foreground">{t('returns.process.step3.description')}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">{t('returns.process.step4.title')}</h4>
                    <p className="text-muted-foreground">{t('returns.process.step4.description')}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Return Conditions Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-primary" />
                {t('returns.conditions.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{t('returns.conditions.intro')}</p>
              
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>{t('returns.conditions.item1')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>{t('returns.conditions.item2')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>{t('returns.conditions.item3')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>{t('returns.conditions.item4')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>{t('returns.conditions.item5')}</span>
                </li>
              </ul>

              <Alert className="mt-6 border-warning/30 bg-warning/10">
                <AlertTriangle className="h-5 w-5 text-warning" />
                <AlertTitle className="text-warning">{t('returns.conditions.warning.title')}</AlertTitle>
                <AlertDescription className="text-muted-foreground">
                  {t('returns.conditions.warning.description')}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Shipping Costs Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Truck className="w-6 h-6 text-primary" />
                {t('returns.shipping.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{t('returns.shipping.intro')}</p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <h5 className="font-semibold text-foreground mb-2">{t('returns.shipping.withdrawal.title')}</h5>
                  <p className="text-sm text-muted-foreground">{t('returns.shipping.withdrawal.description')}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <h5 className="font-semibold text-foreground mb-2">{t('returns.shipping.defective.title')}</h5>
                  <p className="text-sm text-muted-foreground">{t('returns.shipping.defective.description')}</p>
                </div>
              </div>

              <div className="bg-accent/10 rounded-lg p-4 border border-accent/20 mt-4">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">{t('returns.shipping.note.title')}</strong> {t('returns.shipping.note.description')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Refund Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Euro className="w-6 h-6 text-primary" />
                {t('returns.refund.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{t('returns.refund.intro')}</p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="font-semibold text-foreground">{t('returns.refund.timeline.title')}</h5>
                    <p className="text-sm text-muted-foreground">{t('returns.refund.timeline.description')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Euro className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="font-semibold text-foreground">{t('returns.refund.method.title')}</h5>
                    <p className="text-sm text-muted-foreground">{t('returns.refund.method.description')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="font-semibold text-foreground">{t('returns.refund.deduction.title')}</h5>
                    <p className="text-sm text-muted-foreground">{t('returns.refund.deduction.description')}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Warranty Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-primary" />
                {t('returns.warranty.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{t('returns.warranty.intro')}</p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <h5 className="font-semibold text-foreground mb-2">{t('returns.warranty.legal.title')}</h5>
                  <p className="text-sm text-muted-foreground">{t('returns.warranty.legal.description')}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <h5 className="font-semibold text-foreground mb-2">{t('returns.warranty.hidden.title')}</h5>
                  <p className="text-sm text-muted-foreground">{t('returns.warranty.hidden.description')}</p>
                </div>
              </div>

              <p className="text-muted-foreground mt-4">{t('returns.warranty.options')}</p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  {t('returns.warranty.option1')}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  {t('returns.warranty.option2')}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  {t('returns.warranty.option3')}
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Contact Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Mail className="w-6 h-6 text-primary" />
                {t('returns.contact.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{t('returns.contact.intro')}</p>
              
              <div className="bg-primary/5 rounded-lg p-6 border border-primary/10">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-semibold text-foreground mb-2">{t('returns.contact.email.title')}</h5>
                    <a href="mailto:infos@ekip-trade.com" className="text-primary hover:underline">
                      infos@ekip-trade.com
                    </a>
                  </div>
                  <div>
                    <h5 className="font-semibold text-foreground mb-2">{t('returns.contact.phone.title')}</h5>
                    <a href="tel:+393773890872" className="text-primary hover:underline">
                      +39 377 389 0872
                    </a>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">{t('returns.contact.hours')}</p>
              </div>

              <p className="text-sm text-muted-foreground">{t('returns.contact.include')}</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• {t('returns.contact.include1')}</li>
                <li>• {t('returns.contact.include2')}</li>
                <li>• {t('returns.contact.include3')}</li>
                <li>• {t('returns.contact.include4')}</li>
              </ul>
            </CardContent>
          </Card>

          {/* Last Updated */}
          <p className="text-center text-sm text-muted-foreground mt-8">
            {t('returns.lastUpdated')}
          </p>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Returns;

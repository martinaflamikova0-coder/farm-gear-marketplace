import { useTranslation } from 'react-i18next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/SEOHead';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';
import HeaderSpacer from '@/components/layout/HeaderSpacer';
import { Card, CardContent } from '@/components/ui/card';
import { Scale, Shield, Eye, Globe, Database, Gavel } from 'lucide-react';

const LegalNotice = () => {
  const { t } = useTranslation();

  const sections = [
    { icon: Shield, titleKey: 'directorTitle', contentKey: 'directorContent' },
    { icon: Eye, titleKey: 'ipTitle', contentKey: 'ipContent' },
    { icon: Globe, titleKey: 'liabilityTitle', contentKey: 'liabilityContent' },
    { icon: Database, titleKey: 'dataTitle', contentKey: 'dataContent', hasEmail: true },
    { icon: Gavel, titleKey: 'lawTitle', contentKey: 'lawContent' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead titleKey="seo.legalNotice.title" descriptionKey="seo.legalNotice.description" keywordsKey="seo.legalNotice.keywords" />
      <BreadcrumbJsonLd items={[{ name: t('pages.legalNotice.title'), path: 'legal-notice' }]} />
      <Header />
      <HeaderSpacer />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground overflow-hidden">
        <div className="container-custom py-14 md:py-20 relative">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-xl bg-white/15 flex items-center justify-center">
              <Scale className="h-7 w-7" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold">
              {t('pages.legalNotice.title')}
            </h1>
          </div>
          <p className="text-primary-foreground/70 text-sm">{t('pages.legalNotice.lastUpdate')}</p>
        </div>
        <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 40" fill="none" preserveAspectRatio="none">
          <path d="M0,40 L0,15 Q360,0 720,15 Q1080,30 1440,15 L1440,40 Z" fill="hsl(var(--background))" />
        </svg>
      </section>

      <main className="flex-1 bg-background">
        <div className="container-custom py-12 md:py-16">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Company info card */}
            <Card className="border-primary/20 shadow-md">
              <CardContent className="p-6 md:p-8">
                <h2 className="font-display text-xl font-bold text-foreground mb-4">{t('pages.legalNotice.editorTitle')}</h2>
                <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                  <div><span className="font-semibold text-foreground">{t('pages.legalNotice.legalName')}:</span> <span className="text-muted-foreground">Geo Italy s.r.l.</span></div>
                  <div><span className="font-semibold text-foreground">{t('pages.legalNotice.tradeName')}:</span> <span className="text-muted-foreground">Geo Italy Agro</span></div>
                  <div><span className="font-semibold text-foreground">{t('pages.legalNotice.legalForm')}:</span> <span className="text-muted-foreground">{t('pages.legalNotice.legalFormValue')}</span></div>
                  <div><span className="font-semibold text-foreground">{t('pages.legalNotice.vatLabel')}:</span> <span className="text-muted-foreground">IT01540910054</span></div>
                  <div><span className="font-semibold text-foreground">REA:</span> <span className="text-muted-foreground">AT - 123564</span></div>
                  <div><span className="font-semibold text-foreground">{t('pages.legalNotice.capitalLabel')}:</span> <span className="text-muted-foreground">750 000 €</span></div>
                  <div><span className="font-semibold text-foreground">{t('pages.legalNotice.registeredOffice')}:</span> <span className="text-muted-foreground">Vicolo Santa Maria alla Porta 1, 20123 Milano (MI)</span></div>
                  <div><span className="font-semibold text-foreground">{t('pages.legalNotice.operationalOffice')}:</span> <span className="text-muted-foreground">Via G. Abbate 151, 14054 Castagnole delle Lanze (AT)</span></div>
                  <div><span className="font-semibold text-foreground">{t('pages.legalNotice.phone')}:</span> <a href="tel:+393773890872" className="text-primary hover:underline">+39 377 389 0872</a></div>
                  <div><span className="font-semibold text-foreground">Fax:</span> <span className="text-muted-foreground">0141 875 819</span></div>
                  <div><span className="font-semibold text-foreground">{t('pages.legalNotice.email')}:</span> <a href="mailto:info@geoitalyagro.com" className="text-primary hover:underline">info@geoitalyagro.com</a></div>
                  <div><span className="font-semibold text-foreground">{t('pages.legalNotice.website')}:</span> <a href="https://www.geoitalyagro.com" className="text-primary hover:underline">www.geoitalyagro.com</a></div>
                </div>
              </CardContent>
            </Card>

            {/* Legal sections */}
            {sections.map((section, index) => (
              <Card key={index} className="border-border/50">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <section.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-display text-lg font-bold text-foreground mb-3">{t(`pages.legalNotice.${section.titleKey}`)}</h2>
                      <p className="text-muted-foreground leading-relaxed text-sm">
                        {t(`pages.legalNotice.${section.contentKey}`)}
                        {section.hasEmail && (
                          <a href="mailto:info@geoitalyagro.com" className="text-primary hover:underline ml-1">
                            info@geoitalyagro.com
                          </a>
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LegalNotice;

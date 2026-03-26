import { useTranslation } from 'react-i18next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/SEOHead';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';
import HeaderSpacer from '@/components/layout/HeaderSpacer';

const LegalNotice = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead titleKey="seo.legalNotice.title" descriptionKey="seo.legalNotice.description" keywordsKey="seo.legalNotice.keywords" />
      <BreadcrumbJsonLd items={[{ name: t('pages.legalNotice.title'), path: 'legal-notice' }]} />
      <Header />
      <HeaderSpacer />
      <main className="flex-1 bg-background">
        <div className="container-custom py-12">
          <div className="max-w-4xl mx-auto prose prose-lg">
            <h1 className="font-display text-4xl font-bold text-foreground mb-8">
              {t('pages.legalNotice.title')}
            </h1>

            <h2 className="font-display text-2xl font-semibold text-foreground mt-8">{t('pages.legalNotice.editorTitle')}</h2>
            <ul className="text-muted-foreground space-y-2 list-none pl-0">
              <li><strong>{t('pages.legalNotice.companyName')}:</strong> GeoItalyAgro</li>
              <li><strong>{t('pages.legalNotice.legalForm')}:</strong> {t('pages.legalNotice.legalFormValue')}</li>
              <li><strong>{t('pages.legalNotice.vatLabel')}:</strong> IT10992060011</li>
              <li><strong>{t('pages.legalNotice.registeredOffice')}:</strong> Via Vittorio Veneto 118, 28040 Oleggio Castello (NO), Italia</li>
              <li><strong>{t('pages.legalNotice.phone')}:</strong> <a href="tel:+393773890872" className="text-primary hover:underline">+39 377 389 0872</a></li>
              <li><strong>{t('pages.legalNotice.email')}:</strong> <a href="mailto:infos@ekip-trade.com" className="text-primary hover:underline">infos@ekip-trade.com</a></li>
              <li><strong>{t('pages.legalNotice.website')}:</strong> <a href="https://www.ekip-trade.com" className="text-primary hover:underline">www.ekip-trade.com</a></li>
            </ul>

            <h2 className="font-display text-2xl font-semibold text-foreground mt-8">{t('pages.legalNotice.directorTitle')}</h2>
            <p className="text-muted-foreground leading-relaxed">{t('pages.legalNotice.directorContent')}</p>

            <h2 className="font-display text-2xl font-semibold text-foreground mt-8">{t('pages.legalNotice.ipTitle')}</h2>
            <p className="text-muted-foreground leading-relaxed">{t('pages.legalNotice.ipContent')}</p>

            <h2 className="font-display text-2xl font-semibold text-foreground mt-8">{t('pages.legalNotice.liabilityTitle')}</h2>
            <p className="text-muted-foreground leading-relaxed">{t('pages.legalNotice.liabilityContent')}</p>

            <h2 className="font-display text-2xl font-semibold text-foreground mt-8">{t('pages.legalNotice.dataTitle')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('pages.legalNotice.dataContent')}
              <a href="mailto:infos@ekip-trade.com" className="text-primary hover:underline ml-1">
                infos@ekip-trade.com
              </a>
            </p>

            <h2 className="font-display text-2xl font-semibold text-foreground mt-8">{t('pages.legalNotice.lawTitle')}</h2>
            <p className="text-muted-foreground leading-relaxed">{t('pages.legalNotice.lawContent')}</p>

            <p className="text-muted-foreground mt-8 text-sm">{t('pages.legalNotice.lastUpdate')}</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LegalNotice;

import { useTranslation } from 'react-i18next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/SEOHead';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';
import HeaderSpacer from '@/components/layout/HeaderSpacer';

const PurchaseTerms = () => {
  const { t } = useTranslation();

  const sections = ['section1', 'section2', 'section3', 'section4', 'section5', 'section6', 'section7', 'section8'];

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead titleKey="seo.purchaseTerms.title" descriptionKey="seo.purchaseTerms.description" keywordsKey="seo.purchaseTerms.keywords" />
      <BreadcrumbJsonLd items={[{ name: t('pages.purchaseTerms.title'), path: 'purchase-terms' }]} />
      <Header />
      <HeaderSpacer />
      <main className="flex-1 bg-background">
        <div className="container-custom py-12">
          <div className="max-w-4xl mx-auto prose prose-lg">
            <h1 className="font-display text-4xl font-bold text-foreground mb-8">
              {t('pages.purchaseTerms.title')}
            </h1>
            
            <p className="text-muted-foreground">{t('pages.purchaseTerms.lastUpdate')}</p>

            {sections.map((section) => (
              <div key={section}>
                <h2 className="font-display text-2xl font-semibold text-foreground mt-8">
                  {t(`pages.purchaseTerms.${section}Title`)}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t(`pages.purchaseTerms.${section}Content`)}
                  {section === 'section8' && (
                    <a href="mailto:info@geoitalyagro.com" className="text-primary hover:underline ml-1">
                      info@geoitalyagro.com
                    </a>
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PurchaseTerms;

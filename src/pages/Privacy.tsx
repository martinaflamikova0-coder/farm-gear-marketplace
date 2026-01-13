import { useTranslation } from 'react-i18next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const Privacy = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-background">
        <div className="container-custom py-12">
          <div className="max-w-4xl mx-auto prose prose-lg">
            <h1 className="font-display text-4xl font-bold text-foreground mb-8">
              {t('pages.privacy.title')}
            </h1>
            
            <p className="text-muted-foreground">{t('pages.privacy.lastUpdate')}</p>

            <h2 className="font-display text-2xl font-semibold text-foreground mt-8">{t('pages.privacy.section1Title')}</h2>
            <p className="text-muted-foreground leading-relaxed">{t('pages.privacy.section1Content')}</p>

            <h2 className="font-display text-2xl font-semibold text-foreground mt-8">{t('pages.privacy.section2Title')}</h2>
            <p className="text-muted-foreground leading-relaxed">{t('pages.privacy.section2Content')}</p>
            <ul className="text-muted-foreground space-y-2">
              <li>{t('pages.privacy.usage1')}</li>
              <li>{t('pages.privacy.usage2')}</li>
              <li>{t('pages.privacy.usage3')}</li>
              <li>{t('pages.privacy.usage4')}</li>
            </ul>

            <h2 className="font-display text-2xl font-semibold text-foreground mt-8">{t('pages.privacy.section3Title')}</h2>
            <p className="text-muted-foreground leading-relaxed">{t('pages.privacy.section3Content')}</p>

            <h2 className="font-display text-2xl font-semibold text-foreground mt-8">{t('pages.privacy.section4Title')}</h2>
            <p className="text-muted-foreground leading-relaxed">{t('pages.privacy.section4Content')}</p>

            <h2 className="font-display text-2xl font-semibold text-foreground mt-8">{t('pages.privacy.section5Title')}</h2>
            <p className="text-muted-foreground leading-relaxed">{t('pages.privacy.section5Content')}</p>
            <ul className="text-muted-foreground space-y-2">
              <li>{t('pages.privacy.right1')}</li>
              <li>{t('pages.privacy.right2')}</li>
              <li>{t('pages.privacy.right3')}</li>
              <li>{t('pages.privacy.right4')}</li>
              <li>{t('pages.privacy.right5')}</li>
            </ul>

            <h2 className="font-display text-2xl font-semibold text-foreground mt-8">{t('pages.privacy.section6Title')}</h2>
            <p className="text-muted-foreground leading-relaxed">{t('pages.privacy.section6Content')}</p>

            <h2 className="font-display text-2xl font-semibold text-foreground mt-8">{t('pages.privacy.section7Title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('pages.privacy.section7Content')}
              <a href="mailto:privacy@equiptrade.com" className="text-primary hover:underline ml-1">
                privacy@equiptrade.com
              </a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;

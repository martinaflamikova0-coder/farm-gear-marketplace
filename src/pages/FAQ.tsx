import { useTranslation } from 'react-i18next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/SEOHead';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';
import HeaderSpacer from '@/components/layout/HeaderSpacer';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqKeys = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8'];

const FAQ = () => {
  const { t } = useTranslation();

  // Build FAQPage JSON-LD for Google rich snippets
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqKeys.map((key, index) => ({
      '@type': 'Question',
      name: t(`pages.faq.${key}`),
      acceptedAnswer: {
        '@type': 'Answer',
        text: t(`pages.faq.a${index + 1}`),
      },
    })),
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead titleKey="seo.faq.title" descriptionKey="seo.faq.description" keywordsKey="seo.faq.keywords" />
      <BreadcrumbJsonLd items={[{ name: 'FAQ', path: 'faq' }]} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Header />
      <HeaderSpacer />
      <main className="flex-1 bg-background">
        <div className="container-custom py-12">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="font-display text-4xl font-bold text-foreground mb-4">
                {t('pages.faq.title')}
              </h1>
              <p className="text-lg text-muted-foreground">
                {t('pages.faq.subtitle')}
              </p>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              {faqKeys.map((key, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold hover:no-underline">
                    {t(`pages.faq.${key}`)}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {t(`pages.faq.a${index + 1}`)}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="mt-12 text-center p-8 bg-secondary rounded-lg">
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                {t('pages.faq.notFoundTitle')}
              </h3>
              <p className="text-muted-foreground">
                {t('pages.faq.notFoundDesc')}{' '}
                <a href="mailto:support@ekiptrade.com" className="text-primary hover:underline">
                  support@ekiptrade.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;

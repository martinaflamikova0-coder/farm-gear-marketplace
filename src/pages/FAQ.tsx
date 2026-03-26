import { useTranslation } from 'react-i18next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/SEOHead';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';
import HeaderSpacer from '@/components/layout/HeaderSpacer';
import { Card, CardContent } from '@/components/ui/card';
import { HelpCircle, Mail } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqKeys = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8'];

const FAQ = () => {
  const { t } = useTranslation();

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

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground overflow-hidden">
        <div className="container-custom py-16 md:py-20 relative text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="h-8 w-8" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            {t('pages.faq.title')}
          </h1>
          <p className="text-lg text-primary-foreground/85 max-w-2xl mx-auto">
            {t('pages.faq.subtitle')}
          </p>
        </div>
        <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 40" fill="none" preserveAspectRatio="none">
          <path d="M0,40 L0,15 Q360,0 720,15 Q1080,30 1440,15 L1440,40 Z" fill="hsl(var(--background))" />
        </svg>
      </section>

      <main className="flex-1 bg-background">
        <div className="container-custom py-12 md:py-16">
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-3">
              {faqKeys.map((key, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border rounded-xl px-6 bg-card shadow-sm hover:shadow-md transition-shadow duration-300 data-[state=open]:border-primary/30"
                >
                  <AccordionTrigger className="text-left font-semibold hover:no-underline py-5">
                    <span className="flex items-center gap-3">
                      <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {index + 1}
                      </span>
                      {t(`pages.faq.${key}`)}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-5 pl-11">
                    {t(`pages.faq.a${index + 1}`)}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {/* Contact CTA */}
            <Card className="mt-12 bg-gradient-to-br from-primary to-primary/85 text-primary-foreground border-0">
              <CardContent className="p-8 md:p-10 text-center">
                <Mail className="h-10 w-10 mx-auto mb-4 opacity-80" />
                <h3 className="font-display text-xl font-bold mb-2">
                  {t('pages.faq.notFoundTitle')}
                </h3>
                <p className="text-primary-foreground/80">
                  {t('pages.faq.notFoundDesc')}{' '}
                  <a href="mailto:info@geoitalyagro.com" className="underline font-semibold text-primary-foreground hover:opacity-80 transition-opacity">
                    info@geoitalyagro.com
                  </a>
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

export default FAQ;

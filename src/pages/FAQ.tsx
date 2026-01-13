import { useTranslation } from 'react-i18next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const FAQ = () => {
  const { t } = useTranslation();

  const faqKeys = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8'];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
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
                <a href="mailto:support@equiptrade.com" className="text-primary hover:underline">
                  support@equiptrade.com
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

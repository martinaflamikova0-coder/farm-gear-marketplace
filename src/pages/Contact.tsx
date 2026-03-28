import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/SEOHead';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';
import HeaderSpacer from '@/components/layout/HeaderSpacer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MapPin, Phone, Mail, Clock, Loader2, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Contact = () => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          ...formData,
          language: i18n.language,
        },
      });

      if (error) throw error;

      toast({
        title: t('pages.contact.successTitle'),
        description: t('pages.contact.successDesc'),
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error sending contact email:', error);
      toast({
        title: t('pages.contact.errorTitle', 'Error'),
        description: t('pages.contact.errorDesc', 'Failed to send message. Please try again.'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    { icon: Phone, titleKey: 'phone', contentKey: 'phoneValue', subtitleKey: 'phoneHours', iconColor: 'text-blue-500' },
    { icon: Mail, titleKey: 'email', contentKey: 'emailValue', subtitleKey: 'emailResponse', iconColor: 'text-emerald-500' },
    { icon: MapPin, titleKey: 'address', contentKey: 'addressValue', subtitleKey: 'addressCity', iconColor: 'text-red-500' },
    { icon: Clock, titleKey: 'hours', contentKey: 'hoursWeek', subtitleKey: 'hoursSat', iconColor: 'text-amber-500' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead titleKey="seo.contact.title" descriptionKey="seo.contact.description" keywordsKey="seo.contact.keywords" />
      <BreadcrumbJsonLd items={[{ name: t('nav.contact'), path: 'contact' }]} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          name: t('pages.contact.title'),
          description: t('seo.contact.description'),
          url: 'https://geoitalyagro.com/en/contact',
          mainEntity: {
            '@type': 'Organization',
            name: 'GeoItalyAgro',
            email: 'info@geoitalyagro.com',
            contactPoint: {
              '@type': 'ContactPoint',
              telephone: '+39 377 389 0872',
              contactType: 'customer service',
              email: 'info@geoitalyagro.com',
              availableLanguage: ['English', 'French', 'German', 'Spanish', 'Italian', 'Portuguese'],
            },
          },
        }) }}
      />
      <Header />
      <HeaderSpacer />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        <div className="container-custom py-16 md:py-20 relative text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            {t('pages.contact.title')}
          </h1>
          <p className="text-lg text-primary-foreground/85 max-w-2xl mx-auto">
            {t('pages.contact.subtitle')}
          </p>
        </div>
        <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 40" fill="none" preserveAspectRatio="none">
          <path d="M0,40 L0,15 Q360,0 720,15 Q1080,30 1440,15 L1440,40 Z" fill="hsl(var(--background))" />
        </svg>
      </section>

      <main className="flex-1 bg-background">
        <div className="container-custom py-12 md:py-16">
          <div className="max-w-5xl mx-auto">
            {/* Contact info cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
              {contactInfo.map((info, index) => (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20">
                  <CardContent className="p-5 text-center">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                      <info.icon className={`h-6 w-6 ${info.iconColor}`} />
                    </div>
                    <h3 className="font-semibold text-foreground text-sm mb-1">{t(`pages.contact.${info.titleKey}`)}</h3>
                    <p className="text-foreground text-sm">{t(`pages.contact.${info.contentKey}`)}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t(`pages.contact.${info.subtitleKey}`)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Form */}
            <Card className="border-border/50 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-xl">{t('pages.contact.formTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t('pages.contact.nameLabel')}</Label>
                      <Input
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder={t('pages.contact.namePlaceholder')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t('pages.contact.emailLabel')}</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder={t('pages.contact.emailPlaceholder')}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">{t('pages.contact.subjectLabel')}</Label>
                    <Input
                      id="subject"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder={t('pages.contact.subjectPlaceholder')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">{t('pages.contact.messageLabel')}</Label>
                    <Textarea
                      id="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder={t('pages.contact.messagePlaceholder')}
                    />
                  </div>
                  <Button type="submit" size="lg" className="font-semibold" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('common.sending', 'Sending...')}
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        {t('pages.contact.send')}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;

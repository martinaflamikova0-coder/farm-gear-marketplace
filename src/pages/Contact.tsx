import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/SEOHead';
import HeaderSpacer from '@/components/layout/HeaderSpacer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MapPin, Phone, Mail, Clock, Loader2 } from 'lucide-react';
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
    { icon: Phone, titleKey: 'phone', contentKey: 'phoneValue', subtitleKey: 'phoneHours' },
    { icon: Mail, titleKey: 'email', contentKey: 'emailValue', subtitleKey: 'emailResponse' },
    { icon: MapPin, titleKey: 'address', contentKey: 'addressValue', subtitleKey: 'addressCity' },
    { icon: Clock, titleKey: 'hours', contentKey: 'hoursWeek', subtitleKey: 'hoursSat' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead titleKey="seo.contact.title" descriptionKey="seo.contact.description" />
      <Header />
      <HeaderSpacer />
      <main className="flex-1 bg-background">
        <div className="container-custom py-12">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="font-display text-4xl font-bold text-foreground mb-4">
                {t('pages.contact.title')}
              </h1>
              <p className="text-lg text-muted-foreground">
                {t('pages.contact.subtitle')}
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="space-y-4">
                {contactInfo.map((info, index) => (
                  <Card key={index}>
                    <CardContent className="p-4 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <info.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{t(`pages.contact.${info.titleKey}`)}</h3>
                        <p className="text-foreground">{t(`pages.contact.${info.contentKey}`)}</p>
                        <p className="text-sm text-muted-foreground">{t(`pages.contact.${info.subtitleKey}`)}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="font-display">{t('pages.contact.formTitle')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
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
                    <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('common.sending', 'Sending...')}
                        </>
                      ) : (
                        t('pages.contact.send')
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;

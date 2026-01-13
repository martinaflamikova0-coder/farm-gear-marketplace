import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

const Cookies = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  const handleSave = () => {
    toast({
      title: t('pages.cookies.prefsSaved'),
      description: t('pages.cookies.prefsSavedDesc'),
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-background">
        <div className="container-custom py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-display text-4xl font-bold text-foreground mb-8">
              {t('pages.cookies.title')}
            </h1>

            <div className="prose prose-lg mb-12">
              <p className="text-muted-foreground leading-relaxed">
                {t('pages.cookies.intro')}
              </p>

              <h2 className="font-display text-2xl font-semibold text-foreground mt-8">{t('pages.cookies.whatTitle')}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('pages.cookies.whatContent')}
              </p>

              <h2 className="font-display text-2xl font-semibold text-foreground mt-8">{t('pages.cookies.typesTitle')}</h2>
            </div>

            <div className="space-y-4 mb-8">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-display">{t('pages.cookies.necessaryTitle')}</CardTitle>
                    <Switch checked={preferences.necessary} disabled />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{t('pages.cookies.necessaryDesc')}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-display">{t('pages.cookies.analyticsTitle')}</CardTitle>
                    <Switch 
                      checked={preferences.analytics} 
                      onCheckedChange={(checked) => setPreferences({ ...preferences, analytics: checked })}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{t('pages.cookies.analyticsDesc')}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-display">{t('pages.cookies.marketingTitle')}</CardTitle>
                    <Switch 
                      checked={preferences.marketing} 
                      onCheckedChange={(checked) => setPreferences({ ...preferences, marketing: checked })}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{t('pages.cookies.marketingDesc')}</p>
                </CardContent>
              </Card>
            </div>

            <Button onClick={handleSave} className="mb-12">
              {t('pages.cookies.savePrefs')}
            </Button>

            <div className="prose prose-lg">
              <h2 className="font-display text-2xl font-semibold text-foreground">{t('pages.cookies.browserTitle')}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('pages.cookies.browserContent')}
              </p>

              <h2 className="font-display text-2xl font-semibold text-foreground mt-8">{t('pages.cookies.contactTitle')}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t('pages.cookies.contactContent')}
                <a href="mailto:privacy@equiptrade.com" className="text-primary hover:underline ml-1">
                  privacy@equiptrade.com
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

export default Cookies;

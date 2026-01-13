import { useTranslation } from 'react-i18next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/SEOHead';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, Truck, Award } from 'lucide-react';

const About = () => {
  const { t } = useTranslation();

  const values = [
    { icon: Shield, titleKey: 'trust', descKey: 'trustDesc' },
    { icon: Users, titleKey: 'community', descKey: 'communityDesc' },
    { icon: Truck, titleKey: 'service', descKey: 'serviceDesc' },
    { icon: Award, titleKey: 'quality', descKey: 'qualityDesc' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead titleKey="seo.about.title" descriptionKey="seo.about.description" />
      <Header />
      <main className="flex-1 bg-background">
        <div className="container-custom py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-display text-4xl font-bold text-foreground mb-6">
              {t('pages.about.title')}
            </h1>
            
            <div className="prose prose-lg max-w-none mb-12">
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t('pages.about.intro1')}
              </p>
              
              <p className="text-lg text-muted-foreground leading-relaxed mt-4">
                {t('pages.about.intro2')}
              </p>
            </div>

            <h2 className="font-display text-2xl font-bold text-foreground mb-6">
              {t('pages.about.valuesTitle')}
            </h2>
            
            <div className="grid sm:grid-cols-2 gap-6 mb-12">
              {values.map((value, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <value.icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="font-display">{t(`pages.about.${value.titleKey}`)}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{t(`pages.about.${value.descKey}`)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-8 text-center">
                <h3 className="font-display text-2xl font-bold mb-4">
                  {t('pages.about.joinTitle')}
                </h3>
                <p className="text-primary-foreground/80 mb-6">
                  {t('pages.about.joinDesc')}
                </p>
                <div className="flex justify-center gap-8 text-center">
                  <div>
                    <div className="text-3xl font-bold">5 000+</div>
                    <div className="text-sm text-primary-foreground/70">{t('pages.about.users')}</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">10 000+</div>
                    <div className="text-sm text-primary-foreground/70">{t('pages.about.listings')}</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">95%</div>
                    <div className="text-sm text-primary-foreground/70">{t('pages.about.satisfaction')}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;

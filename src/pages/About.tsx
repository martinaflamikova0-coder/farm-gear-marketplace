import { useTranslation } from 'react-i18next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/SEOHead';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';
import HeaderSpacer from '@/components/layout/HeaderSpacer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, Truck, Award, ArrowRight } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getLocalizedSlug, type SupportedLanguage } from '@/i18n';
import isoLogo from '@/assets/certifications/iso-9001.png';
import iqnetLogo from '@/assets/certifications/iqnet.png';
import aenorLogo from '@/assets/certifications/aenor.png';

const About = () => {
  const { t, i18n } = useTranslation();
  const { lang } = useParams<{ lang: string }>();
  const currentLang = (lang || i18n.language || 'en') as SupportedLanguage;

  const values = [
    { icon: Shield, titleKey: 'trust', descKey: 'trustDesc', color: 'text-blue-500' },
    { icon: Users, titleKey: 'community', descKey: 'communityDesc', color: 'text-emerald-500' },
    { icon: Truck, titleKey: 'service', descKey: 'serviceDesc', color: 'text-amber-500' },
    { icon: Award, titleKey: 'quality', descKey: 'qualityDesc', color: 'text-purple-500' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead titleKey="seo.about.title" descriptionKey="seo.about.description" keywordsKey="seo.about.keywords" />
      <BreadcrumbJsonLd items={[{ name: t('nav.about'), path: 'about' }]} />
      <Header />
      <HeaderSpacer />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        <div className="container-custom py-16 md:py-24 relative">
          <div className="max-w-3xl">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
              {t('pages.about.title')}
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/85 leading-relaxed">
              {t('pages.about.intro1')}
            </p>
          </div>
        </div>
        <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 40" fill="none" preserveAspectRatio="none">
          <path d="M0,40 L0,15 Q360,0 720,15 Q1080,30 1440,15 L1440,40 Z" fill="hsl(var(--background))" />
        </svg>
      </section>

      <main className="flex-1 bg-background">
        <div className="container-custom py-12 md:py-16">
          <div className="max-w-5xl mx-auto">
            {/* Intro text */}
            <p className="text-lg text-muted-foreground leading-relaxed mb-16 max-w-3xl">
              {t('pages.about.intro2')}
            </p>

            {/* Values */}
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-8">
              {t('pages.about.valuesTitle')}
            </h2>
            <div className="grid sm:grid-cols-2 gap-6 mb-16">
              {values.map((value, index) => (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <value.icon className={`h-7 w-7 ${value.color}`} />
                      </div>
                      <CardTitle className="font-display text-lg">{t(`pages.about.${value.titleKey}`)}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{t(`pages.about.${value.descKey}`)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Certifications */}
            <div className="mb-16">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-8">
                {t('pages.about.certificationsTitle', 'Nos certifications')}
              </h2>
              <div className="grid grid-cols-3 gap-6">
                {[
                  { src: isoLogo, alt: 'ISO 9001', label: 'ISO 9001' },
                  { src: iqnetLogo, alt: 'IQNet', label: 'IQNet' },
                  { src: aenorLogo, alt: 'AENOR', label: 'AENOR' },
                ].map((cert) => (
                  <div key={cert.alt} className="flex flex-col items-center gap-3 p-6 rounded-xl bg-muted/40 border border-border/50 hover:shadow-md transition-shadow">
                    <img src={cert.src} alt={cert.alt} className="h-20 w-auto object-contain" loading="lazy" width={512} height={512} />
                    <span className="text-sm font-medium text-muted-foreground">{cert.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Company identity */}
            <Card className="mb-16 border-primary/20 shadow-md">
              <CardContent className="p-6 md:p-8">
                <p className="text-muted-foreground leading-relaxed text-sm">
                  GeoItalyAgro è un marchio commerciale di <span className="font-semibold text-foreground">GEO ITALY SRL</span>, società italiana con sede legale a Milano. L'azienda opera anche tramite una sede operativa situata a Castagnole delle Lanze (AT), specializzata nella vendita di macchinari agricoli.
                </p>
                <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-muted-foreground mt-4">
                  <div><span className="font-semibold text-foreground">Sede legale:</span> Vicolo Santa Maria alla Porta 1, 20123 Milano (MI), Italia</div>
                  <div><span className="font-semibold text-foreground">Sede operativa:</span> Via G. Abbate 151, 14054 Castagnole delle Lanze (AT), Italia</div>
                  <div><span className="font-semibold text-foreground">PIVA:</span> IT01540910054</div>
                  <div><span className="font-semibold text-foreground">REA:</span> AT - 123564</div>
                </div>
              </CardContent>
            </Card>

            {/* CTA Card */}
            <Card className="bg-gradient-to-br from-primary to-primary/85 text-primary-foreground border-0 overflow-hidden relative">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
              <CardContent className="p-8 md:p-12 relative">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="font-display text-2xl md:text-3xl font-bold mb-4">
                      {t('pages.about.joinTitle')}
                    </h3>
                    <p className="text-primary-foreground/80 mb-6 max-w-lg">
                      {t('pages.about.joinDesc')}
                    </p>
                    <Button asChild variant="secondary" size="lg" className="font-semibold">
                      <Link to={`/${currentLang}/${getLocalizedSlug('listings', currentLang)}`}>
                        {t('common.viewAll', 'Découvrir')}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                  <div className="flex gap-6 md:gap-8 text-center">
                    <div>
                      <div className="text-3xl md:text-4xl font-bold">10+</div>
                      <div className="text-sm text-primary-foreground/70 mt-1">{t('pages.about.countriesServed')}</div>
                    </div>
                    <div>
                      <div className="text-3xl md:text-4xl font-bold">200+</div>
                      <div className="text-sm text-primary-foreground/70 mt-1">{t('pages.about.listings')}</div>
                    </div>
                    <div>
                      <div className="text-3xl md:text-4xl font-bold">24/7</div>
                      <div className="text-sm text-primary-foreground/70 mt-1">{t('pages.about.onlineSupport')}</div>
                    </div>
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

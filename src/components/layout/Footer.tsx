import { Link, useParams } from 'react-router-dom';
import { Phone, Mail, MapPin, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { type SupportedLanguage } from '@/i18n';
import logoEkiptrade from '@/assets/logo-ekiptrade.png';

const Footer = () => {
  const { t, i18n } = useTranslation();
  const { lang } = useParams<{ lang: string }>();
  const currentLang = (lang || i18n.language || 'en') as SupportedLanguage;

  const getLocalizedLink = (path: string) => {
    return `/${currentLang}${path}`;
  };

  const informationLinks = [
    { key: 'aboutUs', path: '/about' },
    { key: 'legalNotice', path: '/legal-notice' },
    { key: 'terms', path: '/terms' },
    { key: 'purchaseTerms', path: '/purchase-terms' },
    { key: 'returns', path: '/returns' },
    { key: 'refundPolicy', path: '/refund-policy' },
    { key: 'faq', path: '/faq' },
    { key: 'privacy', path: '/privacy' },
    { key: 'cookies', path: '/cookies' },
    { key: 'contact', path: '/contact' },
  ];

  return (
    <footer className="bg-foreground text-primary-foreground mt-16">
      {/* Main footer */}
      <div className="container-custom py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
          {/* Information Links */}
          <div>
            <h3 className="font-display font-bold text-lg md:text-xl mb-6 tracking-wide uppercase text-primary-foreground">
              {t('footer.informations')}
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
              {informationLinks.map((link) => (
                <li key={link.key}>
                  <Link
                    to={getLocalizedLink(link.path)}
                    className="group flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors duration-200"
                  >
                    <ChevronRight className="h-3.5 w-3.5 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                    {t(`footer.${link.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Info */}
          <div className="space-y-6">
            <div>
              <img 
                src={logoEkiptrade} 
                alt="EkipTrade" 
                className="h-12 w-auto object-contain"
                loading="lazy"
              />
            </div>
            <p className="text-primary-foreground/60 text-sm leading-relaxed max-w-md">
              {t('footer.description')}
            </p>
            <div className="space-y-3">
              <a href="tel:+393773890872" className="flex items-center gap-3 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors group">
                <div className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center group-hover:bg-primary-foreground/20 transition-colors">
                  <Phone className="h-3.5 w-3.5" />
                </div>
                +39 377 389 0872
              </a>
              <a href="mailto:infos@ekip-trade.com" className="flex items-center gap-3 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors group">
                <div className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center group-hover:bg-primary-foreground/20 transition-colors">
                  <Mail className="h-3.5 w-3.5" />
                </div>
                infos@ekip-trade.com
              </a>
              <div className="flex items-start gap-3 text-sm text-primary-foreground/70">
                <div className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="h-3.5 w-3.5" />
                </div>
                <span>Via Vittorio Veneto 118,<br />28040 Oleggio Castello (NO),<br />Piemonte, Italia</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container-custom py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-primary-foreground/50">
            © {new Date().getFullYear()} EkipTrade. {t('footer.rights')}
          </p>
          <p className="text-xs text-primary-foreground/40">
            P.IVA: IT10992060011
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

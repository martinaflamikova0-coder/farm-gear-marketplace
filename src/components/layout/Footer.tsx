import { Link, useParams } from 'react-router-dom';
import { Phone, Mail, MapPin, ChevronRight, Landmark } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { type SupportedLanguage } from '@/i18n';
import logoGeoItalyAgro from '@/assets/logo-geoitalyagro.png';
import isoLogo from '@/assets/certifications/iso-9001.png';
import iqnetLogo from '@/assets/certifications/iqnet.png';
import aenorLogo from '@/assets/certifications/aenor.png';

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
      <div className="container-custom py-8 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Logo & Name */}
          <div className="space-y-4">
            <Link to={getLocalizedLink('')} className="flex items-center gap-2.5 group">
              <img 
                src={logoGeoItalyAgro} 
                alt="GeoItalyAgro" 
                className="h-9 w-9 md:h-14 md:w-14 object-contain group-hover:opacity-80 transition-opacity"
                loading="lazy"
              />
              <span className="font-display font-bold text-base md:text-xl text-primary-foreground group-hover:opacity-80 transition-opacity">GeoItalyAgro</span>
            </Link>
            <p className="text-primary-foreground/60 text-xs md:text-sm leading-relaxed max-w-md">
              {t('footer.description')}
            </p>
            {/* Payment & Certifications */}
            <div className="flex items-center gap-3 md:gap-4 pt-3 md:pt-4 border-t border-primary-foreground/10">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-primary-foreground/10 border border-primary-foreground/15 flex-shrink-0">
                <Landmark className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary-foreground/70" />
                <span className="text-[10px] md:text-xs font-medium text-primary-foreground/70">{t('footer.bankTransfer')}</span>
              </div>
              <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                <img src={isoLogo} alt="ISO 9001" className="h-6 md:h-10 w-6 md:w-10 object-contain brightness-0 invert opacity-70" loading="lazy" />
                <img src={iqnetLogo} alt="IQNet" className="h-6 md:h-10 w-6 md:w-10 object-contain brightness-0 invert opacity-70" loading="lazy" />
                <img src={aenorLogo} alt="AENOR" className="h-6 md:h-10 w-6 md:w-10 object-contain brightness-0 invert opacity-70" loading="lazy" />
              </div>
            </div>
          </div>

          {/* Information Links */}
          <div>
            <h3 className="font-display font-bold text-base md:text-xl mb-4 md:mb-6 tracking-wide uppercase text-primary-foreground">
              {t('footer.informations')}
            </h3>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2">
              {informationLinks.map((link) => (
                <li key={link.key}>
                  <Link
                    to={getLocalizedLink(link.path)}
                    className="group flex items-center gap-1.5 text-xs md:text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors duration-200"
                  >
                    <ChevronRight className="h-3 w-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                    {t(`footer.${link.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-2.5 md:space-y-3">
            <h3 className="font-display font-bold text-base md:text-xl mb-4 md:mb-6 tracking-wide uppercase text-primary-foreground">
              {t('footer.contact', 'Contact')}
            </h3>
            <a href="tel:+393773890872" className="flex items-center gap-2.5 text-xs md:text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors group">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center group-hover:bg-primary-foreground/20 transition-colors flex-shrink-0">
                <Phone className="h-3 w-3 md:h-3.5 md:w-3.5" />
              </div>
              +39 377 389 0872
            </a>
            <a href="mailto:info@geoitalyagro.com" className="flex items-center gap-2.5 text-xs md:text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors group">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center group-hover:bg-primary-foreground/20 transition-colors flex-shrink-0">
                <Mail className="h-3 w-3 md:h-3.5 md:w-3.5" />
              </div>
              info@geoitalyagro.com
            </a>
            <div className="flex items-center gap-2.5 text-xs md:text-sm text-primary-foreground/70">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="h-3 w-3 md:h-3.5 md:w-3.5" />
              </div>
              <span>Via G. Abbate 151, 14054 Castagnole delle Lanze (AT), Italia</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container-custom py-4 md:py-5 flex flex-col items-center gap-1.5 text-center">
          <p className="text-[10px] md:text-xs text-primary-foreground/50">
            © 2026 Geo Italy SRL — {t('footer.rights')}
          </p>
          <p className="text-[10px] md:text-xs text-primary-foreground/40">
            {t('footer.registeredOffice')}: Vicolo Santa Maria alla Porta 1, 20123 Milano (MI) | P.IVA: IT01540910054 | REA: AT - 123564
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

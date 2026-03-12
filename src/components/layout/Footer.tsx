import { Link, useParams } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCategoriesWithCounts } from '@/hooks/useCategories';
import { getLocalizedSlug, type SupportedLanguage } from '@/i18n';
import logoEkiptrade from '@/assets/logo-ekiptrade.png';
import { useTranslatedCategory } from '@/hooks/useTranslatedCategory';

const Footer = () => {
  const { t, i18n } = useTranslation();
  const { lang } = useParams<{ lang: string }>();
  const currentLang = (lang || i18n.language || 'en') as SupportedLanguage;
  const { data: categories } = useCategoriesWithCounts();
  const { translateCategory } = useTranslatedCategory();

  const getLocalizedLink = (path: string) => {
    return `/${currentLang}${path}`;
  };

  const getCategoryLink = (categorySlug: string) => {
    const listingsSlug = getLocalizedSlug('listings', currentLang);
    return `/${currentLang}/${listingsSlug}?category=${categorySlug}`;
  };

  return (
    <footer className="bg-foreground text-primary-foreground mt-16">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img 
                src={logoEkiptrade} 
                alt="EkipTrade" 
                className="h-14 w-auto object-contain"
                loading="lazy"
              />
            </div>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              {t('footer.description')}
            </p>
            <div className="space-y-2 text-sm">
              <a href="tel:+393773890872" className="flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                <Phone className="h-4 w-4" />
                +39 377 389 0872
              </a>
              <a href="mailto:infos@ekip-trade.com" className="flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                <Mail className="h-4 w-4" />
                infos@ekip-trade.com
              </a>
              <div className="flex items-start gap-2 text-primary-foreground/70">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Via Vittorio Veneto 118,<br />28040 Oleggio Castello (NO),<br />Piemonte, Italia</span>
              </div>
              <p className="text-primary-foreground/50 text-xs mt-2">
                P.IVA: IT10992060011
              </p>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">{t('nav.categories')}</h3>
            <ul className="space-y-2">
              {categories?.slice(0, 6).map((category) => (
                <li key={category.id}>
                  <Link
                    to={getCategoryLink(category.slug)}
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {translateCategory(category.slug)}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to={`/${currentLang}/${getLocalizedSlug('listings', currentLang)}`}
                  className="text-sm text-accent hover:text-accent/80 transition-colors font-medium"
                >
                  {t('common.viewAll')} →
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to={`/${currentLang}/${getLocalizedSlug('listings', currentLang)}`} className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  {t('nav.listings')}
                </Link>
              </li>
              <li>
                <Link to={getLocalizedLink('/about')} className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  {t('footer.aboutUs')}
                </Link>
              </li>
              <li>
                <Link to={getLocalizedLink('/how-it-works')} className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  {t('footer.howItWorks')}
                </Link>
              </li>
              <li>
                <Link to={getLocalizedLink('/faq')} className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  {t('footer.faq')}
                </Link>
              </li>
              <li>
                <Link to={getLocalizedLink('/contact')} className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  {t('footer.contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">{t('footer.legal')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to={getLocalizedLink('/legal-notice')} className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  {t('footer.legalNotice')}
                </Link>
              </li>
              <li>
                <Link to={getLocalizedLink('/terms')} className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  {t('footer.terms')}
                </Link>
              </li>
              <li>
                <Link to={getLocalizedLink('/privacy')} className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link to={getLocalizedLink('/cookies')} className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  {t('footer.cookies')}
                </Link>
              </li>
              <li>
                <Link to={getLocalizedLink('/returns')} className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  {t('footer.returns')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-primary-foreground/20 mt-8 pt-8">
          {/* Copyright */}
          <p className="text-sm text-primary-foreground/60 text-center mb-4">
            © {new Date().getFullYear()} EkipTrade. {t('footer.rights')}
          </p>
          <p className="text-xs text-primary-foreground/40 text-center mb-6">
            P.IVA: IT10992060011 — Via Vittorio Veneto 118, 28040 Oleggio Castello (NO), Italia
          </p>

          {/* Payment methods */}
          <div className="flex items-center justify-center gap-3 mb-6">
            {/* Visa */}
            <div className="bg-white rounded-md px-3 py-2 flex items-center justify-center h-10 w-16">
              <svg viewBox="0 0 48 32" className="h-6 w-auto" aria-label="Visa">
                <rect width="48" height="32" rx="4" fill="#1A1F71"/>
                <text x="24" y="20" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" fontFamily="Arial, sans-serif">VISA</text>
              </svg>
            </div>
            {/* Mastercard */}
            <div className="bg-white rounded-md px-3 py-2 flex items-center justify-center h-10 w-16">
              <svg viewBox="0 0 48 32" className="h-6 w-auto" aria-label="Mastercard">
                <circle cx="18" cy="16" r="10" fill="#EB001B"/>
                <circle cx="30" cy="16" r="10" fill="#F79E1B"/>
                <path d="M24 8.5a10 10 0 0 1 0 15" fill="#FF5F00"/>
              </svg>
            </div>
            {/* PayPal */}
            <div className="bg-white rounded-md px-3 py-2 flex items-center justify-center h-10 w-16">
              <svg viewBox="0 0 48 32" className="h-6 w-auto" aria-label="PayPal">
                <text x="24" y="14" textAnchor="middle" fill="#003087" fontSize="8" fontWeight="bold" fontFamily="Arial, sans-serif">Pay</text>
                <text x="24" y="24" textAnchor="middle" fill="#009CDE" fontSize="8" fontWeight="bold" fontFamily="Arial, sans-serif">Pal</text>
              </svg>
            </div>
            {/* CB */}
            <div className="bg-white rounded-md px-3 py-2 flex items-center justify-center h-10 w-16">
              <svg viewBox="0 0 48 32" className="h-6 w-auto" aria-label="CB">
                <rect width="48" height="32" rx="4" fill="#005CA9"/>
                <text x="24" y="20" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="Arial, sans-serif">CB</text>
              </svg>
            </div>
            {/* Bank Transfer */}
            <div className="bg-white rounded-md px-3 py-2 flex items-center justify-center h-10 w-16">
              <svg viewBox="0 0 48 32" className="h-6 w-auto" aria-label="Bank Transfer">
                <rect width="48" height="32" rx="4" fill="#2E7D32"/>
                <path d="M24 6L10 14h28L24 6z" fill="white"/>
                <rect x="14" y="15" width="3" height="8" fill="white"/>
                <rect x="20" y="15" width="3" height="8" fill="white"/>
                <rect x="26" y="15" width="3" height="8" fill="white"/>
                <rect x="32" y="15" width="3" height="8" fill="white"/>
                <rect x="10" y="24" width="28" height="3" fill="white"/>
              </svg>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;

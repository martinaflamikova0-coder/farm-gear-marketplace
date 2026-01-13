import { Link, useParams } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { categories } from '@/data/products';
import { getLocalizedSlug, type SupportedLanguage } from '@/i18n';

const Footer = () => {
  const { t, i18n } = useTranslation();
  const { lang } = useParams<{ lang: string }>();
  const currentLang = (lang || i18n.language || 'en') as SupportedLanguage;

  const getLocalizedLink = (path: string) => {
    return `/${currentLang}${path}`;
  };

  const getCategoryLink = (categorySlug: string) => {
    const listingsSlug = getLocalizedSlug('listings', currentLang);
    return `/${currentLang}/${listingsSlug}?category=${categorySlug}`;
  };

  const getCategoryName = (category: typeof categories[0]) => {
    const categoryMap: Record<string, string> = {
      'Tracteurs': t('categories.tractors'),
      'Matériel de récolte': t('categories.harvest'),
      'Travail du sol': t('categories.tillage'),
      'Matériel d\'élevage': t('categories.livestock'),
      'Manutention': t('categories.handling'),
      'Matériel de chantier': t('categories.construction'),
      'Pièces et accessoires': t('categories.parts'),
      'Autres matériels': t('categories.other')
    };
    return categoryMap[category.name] || category.name;
  };

  return (
    <footer className="bg-foreground text-primary-foreground mt-16">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-2xl">
                🚜
              </div>
              <span className="font-display text-xl font-bold">AgriOccaz</span>
            </div>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              {t('footer.description')}
            </p>
            <div className="space-y-2 text-sm">
              <a href="tel:+33123456789" className="flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                <Phone className="h-4 w-4" />
                01 23 45 67 89
              </a>
              <a href="mailto:contact@agrioccaz.com" className="flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                <Mail className="h-4 w-4" />
                contact@agrioccaz.com
              </a>
              <div className="flex items-center gap-2 text-primary-foreground/70">
                <MapPin className="h-4 w-4" />
                Paris, France
              </div>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">{t('nav.categories')}</h3>
            <ul className="space-y-2">
              {categories.slice(0, 6).map((category) => (
                <li key={category.id}>
                  <Link
                    to={getCategoryLink(category.slug)}
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {getCategoryName(category)}
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
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-primary-foreground/60">
            © {new Date().getFullYear()} AgriOccaz. {t('footer.rights')}.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
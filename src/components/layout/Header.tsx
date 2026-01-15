import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Search, Menu, X, ChevronDown, Phone, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { categories } from '@/data/products';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import CartIcon from '@/components/cart/CartIcon';
import { getLocalizedSlug, type SupportedLanguage } from '@/i18n';
import { useCart } from '@/contexts/CartContext';
import logoEquiptrade from '@/assets/logo-equiptrade.png';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { lang } = useParams<{ lang: string }>();
  const currentLang = (lang || i18n.language || 'en') as SupportedLanguage;
  const { user } = useCart();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const listingsSlug = getLocalizedSlug('listings', currentLang);
      navigate(`/${currentLang}/${listingsSlug}?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const getLocalizedLink = (path: string) => {
    return `/${currentLang}${path}`;
  };

  const getCategoryLink = (categorySlug: string) => {
    const listingsSlug = getLocalizedSlug('listings', currentLang);
    return `/${currentLang}/${listingsSlug}?category=${categorySlug}`;
  };

  // Category translations mapping
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
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground">
        <div className="container-custom flex h-10 items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <a href="tel:+33123456789" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Phone className="h-4 w-4" />
              <span>01 23 45 67 89</span>
            </a>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:inline">{t('nav.specialist')}</span>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container-custom">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link
            to={getLocalizedLink('')}
            className="flex items-center gap-2 flex-shrink-0"
            aria-label="EquipTrade"
          >
            <div className="h-12 md:h-14 w-[160px] md:w-[200px] overflow-hidden flex items-center">
              <img
                src={logoEquiptrade}
                alt="EquipTrade"
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </Link>

          {/* Search bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t('common.searchPlaceholder')}
                className="pl-10 pr-4 h-11 bg-secondary/50 border-border focus:bg-card"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit" className="ml-2" variant="default">
              {t('common.search')}
            </Button>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Cart icon */}
            <CartIcon />
            
            {/* User account */}
            <Button variant="ghost" size="icon" asChild>
              <Link to={user ? `/${currentLang}/compte` : `/${currentLang}/auth`}>
                <User className="h-5 w-5" />
                <span className="sr-only">{user ? t('nav.account') : t('nav.login')}</span>
              </Link>
            </Button>
            
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Categories navigation - Desktop */}
        <nav className="hidden md:flex items-center gap-1 pb-2 overflow-x-auto">
          <div
            className="relative"
            onMouseEnter={() => setIsCategoriesOpen(true)}
            onMouseLeave={() => setIsCategoriesOpen(false)}
          >
            <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors rounded-lg hover:bg-secondary">
              {t('common.allCategories')}
              <ChevronDown className="h-4 w-4" />
            </button>
            
            {isCategoriesOpen && (
              <div className="absolute left-0 top-full pt-2 w-72 animate-fade-in">
                <div className="bg-card rounded-lg shadow-elevated border border-border p-2">
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      to={getCategoryLink(category.slug)}
                      className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-secondary transition-colors"
                    >
                      <span className="text-xl">{category.icon}</span>
                      <div className="flex-1">
                        <span className="text-sm font-medium">{getCategoryName(category)}</span>
                        <span className="text-xs text-muted-foreground ml-2">({category.count})</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {categories.slice(0, 6).map((category) => (
            <Link
              key={category.id}
              to={getCategoryLink(category.slug)}
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-secondary whitespace-nowrap"
            >
              {getCategoryName(category)}
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-card animate-slide-up">
          <div className="container-custom py-4 space-y-4">
            {/* Mobile search */}
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={t('common.searchPlaceholder')}
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
            
            {/* Mobile categories */}
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
                {t('nav.categories')}
              </p>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={getCategoryLink(category.slug)}
                  className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-secondary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="text-lg">{category.icon}</span>
                  <span className="text-sm font-medium">{getCategoryName(category)}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
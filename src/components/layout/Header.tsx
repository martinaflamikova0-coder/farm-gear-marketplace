import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, ChevronDown, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { categories } from '@/data/products';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/annonces?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground">
        <div className="container-custom flex h-10 items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <a href="tel:+33123456789" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Phone className="h-4 w-4" />
              <span>01 23 45 67 89</span>
            </a>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <span>Spécialiste du matériel agricole d'occasion</span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container-custom">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-gradient-hero flex items-center justify-center text-2xl">
                🚜
              </div>
              <div className="hidden sm:block">
                <span className="font-display text-xl font-bold text-foreground">AgriOccaz</span>
                <span className="block text-xs text-muted-foreground">Matériel agricole d'occasion</span>
              </div>
            </div>
          </Link>

          {/* Search bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher un matériel, une marque..."
                className="pl-10 pr-4 h-11 bg-secondary/50 border-border focus:bg-card"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit" className="ml-2" variant="default">
              Rechercher
            </Button>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="accent" size="sm" className="hidden lg:flex" asChild>
              <Link to="/deposer-annonce">Déposer une annonce</Link>
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
              Toutes les catégories
              <ChevronDown className="h-4 w-4" />
            </button>
            
            {isCategoriesOpen && (
              <div className="absolute left-0 top-full pt-2 w-72 animate-fade-in">
                <div className="bg-card rounded-lg shadow-elevated border border-border p-2">
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      to={`/annonces?category=${category.slug}`}
                      className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-secondary transition-colors"
                    >
                      <span className="text-xl">{category.icon}</span>
                      <div className="flex-1">
                        <span className="text-sm font-medium">{category.name}</span>
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
              to={`/annonces?category=${category.slug}`}
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-secondary whitespace-nowrap"
            >
              {category.name}
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
                  placeholder="Rechercher..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
            
            {/* Mobile categories */}
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">Catégories</p>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/annonces?category=${category.slug}`}
                  className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-secondary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="text-lg">{category.icon}</span>
                  <span className="text-sm font-medium">{category.name}</span>
                </Link>
              ))}
            </div>
            
            <Button variant="accent" className="w-full" asChild>
              <Link to="/deposer-annonce" onClick={() => setIsMenuOpen(false)}>
                Déposer une annonce
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

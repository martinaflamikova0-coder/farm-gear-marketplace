import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Filter, Grid, List, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeaderSpacer from '@/components/layout/HeaderSpacer';
import ProductCard from '@/components/products/ProductCard';
import SEOHead from '@/components/SEOHead';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useBrandNames } from '@/hooks/useBrands';
import { useCategoriesWithCounts, type CategoryWithCount } from '@/hooks/useCategories';
import { usePaginatedProducts } from '@/hooks/useProducts';
import { getLocalizedSlug, type SupportedLanguage } from '@/i18n';

const ITEMS_PER_PAGE = 24;

const Annonces = () => {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language || 'en') as SupportedLanguage;
  const listingSlug = getLocalizedSlug('listing', currentLang);
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Get initial values from URL params
  const initialPage = parseInt(searchParams.get('page') || '1', 10);
  const initialSort = searchParams.get('sort') || 'date-desc';
  const initialCategory = searchParams.get('category') || '';
  
  const [sortBy, setSortBy] = useState(initialSort);
  const [currentPage, setCurrentPage] = useState(initialPage);
  
  const { data: categories = [], isLoading: categoriesLoading } = useCategoriesWithCounts();
  const { data: brands = [], isLoading: brandsLoading } = useBrandNames();
  
  // Filters state - sync with URL params
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [yearMin, setYearMin] = useState('');
  const [yearMax, setYearMax] = useState('');
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const searchQuery = searchParams.get('search') || '';

  // Update URL when page/sort/category changes
  const updateUrlParams = (updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== '1' && key === 'page') {
        newParams.set(key, value);
      } else if (value && value !== 'date-desc' && key === 'sort') {
        newParams.set(key, value);
      } else if (value && key === 'category') {
        newParams.set(key, value);
      } else if (key === 'page' && value === '1') {
        newParams.delete(key);
      } else if (key === 'sort' && value === 'date-desc') {
        newParams.delete(key);
      } else if (key === 'category' && !value) {
        newParams.delete(key);
      } else if (!value) {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    setSearchParams(newParams, { replace: true });
  };

  // Sync state with URL when URL changes (browser back/forward)
  useEffect(() => {
    const pageFromUrl = parseInt(searchParams.get('page') || '1', 10);
    const sortFromUrl = searchParams.get('sort') || 'date-desc';
    const categoryFromUrl = searchParams.get('category') || '';
    
    if (pageFromUrl !== currentPage) {
      setCurrentPage(pageFromUrl);
    }
    if (sortFromUrl !== sortBy) {
      setSortBy(sortFromUrl);
    }
    if (categoryFromUrl !== selectedCategory) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [searchParams]);

  // Fetch paginated products from database with server-side filtering & sorting
  const { data: paginatedData, isLoading: productsLoading } = usePaginatedProducts({
    category: selectedCategory || undefined,
    search: searchQuery || undefined,
    brands: selectedBrands.length > 0 ? selectedBrands : undefined,
    priceMin: priceMin ? parseInt(priceMin) : undefined,
    priceMax: priceMax ? parseInt(priceMax) : undefined,
    yearMin: yearMin ? parseInt(yearMin) : undefined,
    yearMax: yearMax ? parseInt(yearMax) : undefined,
    conditions: selectedConditions.length > 0 ? selectedConditions : undefined,
    sortBy,
    page: currentPage,
    pageSize: ITEMS_PER_PAGE,
  });

  const products = paginatedData?.products || [];
  const totalCount = paginatedData?.totalCount || 0;
  const totalPages = paginatedData?.totalPages || 1;

  const conditions = ['new', 'used', 'refurbished'];

  const getConditionLabel = (condition: string) => {
    const labels: Record<string, string> = {
      'new': t('conditions.new'),
      'used': t('conditions.used'),
      'refurbished': t('conditions.refurbished'),
    };
    return labels[condition] || condition;
  };

  const getCategoryName = (category: CategoryWithCount) => {
    const categoryMap: Record<string, string> = {
      'tracteurs': t('categories.tractors'),
      'recolte': t('categories.harvest'),
      'travail-sol': t('categories.tillage'),
      'elevage': t('categories.livestock'),
      'manutention': t('categories.handling'),
      'chantier': t('categories.construction'),
      'pieces': t('categories.parts'),
      'autres': t('categories.other')
    };
    return categoryMap[category.slug] || category.name;
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
    setCurrentPage(1);
    updateUrlParams({ page: '1' });
  };

  const toggleCondition = (condition: string) => {
    setSelectedConditions(prev =>
      prev.includes(condition) ? prev.filter(c => c !== condition) : [...prev, condition]
    );
    setCurrentPage(1);
    updateUrlParams({ page: '1' });
  };

  const handleCategoryChange = (val: string) => {
    const newCategory = val === "all" ? "" : val;
    setSelectedCategory(newCategory);
    setCurrentPage(1);
    updateUrlParams({ category: newCategory || null, page: '1' });
  };

  const handleSortChange = (val: string) => {
    setSortBy(val);
    setCurrentPage(1);
    updateUrlParams({ sort: val, page: '1' });
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedBrands([]);
    setPriceMin('');
    setPriceMax('');
    setYearMin('');
    setYearMax('');
    setSelectedConditions([]);
    setSearchParams({});
    setCurrentPage(1);
  };

  const activeFiltersCount = [
    selectedCategory,
    ...selectedBrands,
    priceMin,
    priceMax,
    yearMin,
    yearMax,
    ...selectedConditions,
    searchQuery
  ].filter(Boolean).length;

  // Pagination handlers
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      updateUrlParams({ page: page.toString() });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      
      if (currentPage > 3) pages.push('ellipsis');
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) pages.push(i);
      
      if (currentPage < totalPages - 2) pages.push('ellipsis');
      
      pages.push(totalPages);
    }
    
    return pages;
  };

  const FiltersContent = () => (
    <div className="space-y-6">
      {/* Category */}
      <div>
        <Label className="text-sm font-semibold mb-3 block">{t('filters.category')}</Label>
        {categoriesLoading ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <Select value={selectedCategory || "all"} onValueChange={handleCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder={t('filters.allCategories')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filters.allCategories')}</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.slug}>
                  {cat.icon} {getCategoryName(cat)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Brands */}
      <div>
        <Label className="text-sm font-semibold mb-3 block">{t('filters.brands')}</Label>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {brands.slice(0, 15).map(brand => (
            <div key={brand} className="flex items-center gap-2">
              <Checkbox
                id={`brand-${brand}`}
                checked={selectedBrands.includes(brand)}
                onCheckedChange={() => toggleBrand(brand)}
              />
              <label htmlFor={`brand-${brand}`} className="text-sm cursor-pointer">
                {brand}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <Label className="text-sm font-semibold mb-3 block">{t('filters.priceTTC')}</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={priceMin}
            onChange={(e) => { setPriceMin(e.target.value); setCurrentPage(1); }}
          />
          <Input
            type="number"
            placeholder="Max"
            value={priceMax}
            onChange={(e) => { setPriceMax(e.target.value); setCurrentPage(1); }}
          />
        </div>
      </div>

      {/* Year range */}
      <div>
        <Label className="text-sm font-semibold mb-3 block">{t('filters.year')}</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={yearMin}
            onChange={(e) => { setYearMin(e.target.value); setCurrentPage(1); }}
          />
          <Input
            type="number"
            placeholder="Max"
            value={yearMax}
            onChange={(e) => { setYearMax(e.target.value); setCurrentPage(1); }}
          />
        </div>
      </div>

      {/* Condition */}
      <div>
        <Label className="text-sm font-semibold mb-3 block">{t('filters.condition')}</Label>
        <div className="space-y-2">
          {conditions.map(condition => (
            <div key={condition} className="flex items-center gap-2">
              <Checkbox
                id={`condition-${condition}`}
                checked={selectedConditions.includes(condition)}
                onCheckedChange={() => toggleCondition(condition)}
              />
              <label htmlFor={`condition-${condition}`} className="text-sm cursor-pointer">
                {getConditionLabel(condition)}
              </label>
            </div>
          ))}
        </div>
      </div>

      {activeFiltersCount > 0 && (
        <Button variant="outline" className="w-full" onClick={clearFilters}>
          <X className="h-4 w-4 mr-2" />
          {t('filters.clearFilters')}
        </Button>
      )}
    </div>
  );

  const selectedCategoryData = categories.find(c => c.slug === selectedCategory);
  const isLoading = productsLoading || categoriesLoading;

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead 
        titleKey="seo.listings.title" 
        descriptionKey="seo.listings.description" 
      />
      <BreadcrumbJsonLd items={[{ name: t('nav.listings') }]} />
      {products.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ItemList',
              name: searchQuery ? `${t('listings.resultsFor')} "${searchQuery}"` : t('listings.allListings'),
              numberOfItems: totalCount,
              itemListElement: products.slice(0, 10).map((product, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                url: `https://ekiptrade.com/${currentLang}/${listingSlug}/${product.id}`,
                name: product.title,
              })),
            })
          }}
        />
      )}
      <Header />
      <HeaderSpacer />
      <main className="flex-1 bg-background">
        <div className="container-custom py-8">
          {/* Page header */}
          <div className="mb-6">
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              {searchQuery ? `${t('listings.resultsFor')} "${searchQuery}"` : t('listings.allListings')}
            </h1>
            <p className="text-muted-foreground">
              {t('listings.foundCount', { count: totalCount })}
            </p>
          </div>

          {/* Active filters badges */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  {t('filters.search')}: {searchQuery}
                  <button onClick={() => setSearchParams({})}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedCategory && selectedCategoryData && (
                <Badge variant="secondary" className="gap-1">
                  {getCategoryName(selectedCategoryData)}
                  <button onClick={() => { setSelectedCategory(''); setCurrentPage(1); }}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedBrands.map(brand => (
                <Badge key={brand} variant="secondary" className="gap-1">
                  {brand}
                  <button onClick={() => toggleBrand(brand)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          <div className="flex gap-8">
            {/* Filters sidebar - Desktop */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24 bg-card rounded-lg border border-border p-5">
                <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  {t('filters.title')}
                  {activeFiltersCount > 0 && (
                    <Badge variant="default" className="ml-auto">{activeFiltersCount}</Badge>
                  )}
                </h2>
                <FiltersContent />
              </div>
            </aside>

            {/* Main content */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="flex flex-wrap gap-3 items-center justify-between mb-6 bg-card rounded-lg border border-border p-3">
                {/* Mobile filter button */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden">
                      <Filter className="h-4 w-4 mr-2" />
                      {t('filters.title')}
                      {activeFiltersCount > 0 && (
                        <Badge variant="default" className="ml-2">{activeFiltersCount}</Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetHeader>
                      <SheetTitle>{t('filters.title')}</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FiltersContent />
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Sort */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground hidden sm:inline">{t('filters.sortBy')}:</span>
                  <Select value={sortBy} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date-desc">{t('filters.mostRecent')}</SelectItem>
                      <SelectItem value="price-asc">{t('filters.priceAsc')}</SelectItem>
                      <SelectItem value="price-desc">{t('filters.priceDesc')}</SelectItem>
                      <SelectItem value="year-desc">{t('filters.yearDesc')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* View mode toggle */}
                <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Products grid/list */}
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                    <Skeleton key={i} className="h-80 rounded-lg" />
                  ))}
                </div>
              ) : products.length > 0 ? (
                <>
                  <div className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'
                      : 'space-y-4'
                  }>
                    {products.map((product, index) => (
                      <div
                        key={product.id}
                        className="animate-fade-in"
                        style={{ animationDelay: `${index * 0.02}s` }}
                      >
                        <ProductCard
                          product={product}
                          variant={viewMode === 'list' ? 'horizontal' : 'default'}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-8">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      
                      {getPageNumbers().map((page, idx) => (
                        page === 'ellipsis' ? (
                          <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">...</span>
                        ) : (
                          <Button
                            key={page}
                            variant={currentPage === page ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => goToPage(page)}
                            className="min-w-[40px]"
                          >
                            {page}
                          </Button>
                        )
                      ))}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                    {t('listings.noResults')}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {t('listings.tryDifferentFilters')}
                  </p>
                  <Button variant="outline" onClick={clearFilters}>
                    {t('filters.clearFilters')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Annonces;
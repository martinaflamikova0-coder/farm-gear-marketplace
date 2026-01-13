import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Filter, Grid, List, X } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { products, brands } from '@/data/products';
import { useCategoriesWithCounts, type CategoryWithCount } from '@/hooks/useCategories';

const Annonces = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('date-desc');
  
  const { data: categories, isLoading: categoriesLoading } = useCategoriesWithCounts();
  
  // Filters state
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [yearMin, setYearMin] = useState('');
  const [yearMax, setYearMax] = useState('');
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const searchQuery = searchParams.get('search') || '';

  const conditions = ['Excellent', 'Très bon', 'Bon', 'Correct'];

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
  };

  const toggleCondition = (condition: string) => {
    setSelectedConditions(prev =>
      prev.includes(condition) ? prev.filter(c => c !== condition) : [...prev, condition]
    );
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

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        p.model.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory) {
      const category = categories.find(c => c.slug === selectedCategory);
      if (category) {
        result = result.filter(p => p.category === category.name);
      }
    }

    // Brand filter
    if (selectedBrands.length > 0) {
      result = result.filter(p => selectedBrands.includes(p.brand));
    }

    // Price filter
    if (priceMin) {
      result = result.filter(p => p.priceTTC >= parseInt(priceMin));
    }
    if (priceMax) {
      result = result.filter(p => p.priceTTC <= parseInt(priceMax));
    }

    // Year filter
    if (yearMin) {
      result = result.filter(p => p.year >= parseInt(yearMin));
    }
    if (yearMax) {
      result = result.filter(p => p.year <= parseInt(yearMax));
    }

    // Condition filter
    if (selectedConditions.length > 0) {
      result = result.filter(p => selectedConditions.includes(p.condition));
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.priceTTC - b.priceTTC);
        break;
      case 'price-desc':
        result.sort((a, b) => b.priceTTC - a.priceTTC);
        break;
      case 'year-desc':
        result.sort((a, b) => b.year - a.year);
        break;
      case 'date-desc':
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [searchQuery, selectedCategory, selectedBrands, priceMin, priceMax, yearMin, yearMax, selectedConditions, sortBy, categories]);

  const FiltersContent = () => (
    <div className="space-y-6">
      {/* Category */}
      <div>
        <Label className="text-sm font-semibold mb-3 block">{t('filters.category')}</Label>
        {categoriesLoading ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <Select value={selectedCategory || "all"} onValueChange={(val) => setSelectedCategory(val === "all" ? "" : val)}>
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
          {brands.slice(0, 10).map(brand => (
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
            onChange={(e) => setPriceMin(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Max"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
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
            onChange={(e) => setYearMin(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Max"
            value={yearMax}
            onChange={(e) => setYearMax(e.target.value)}
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
                {condition}
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-background">
        <div className="container-custom py-8">
          {/* Page header */}
          <div className="mb-6">
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              {searchQuery ? `${t('listings.resultsFor')} "${searchQuery}"` : t('listings.allListings')}
            </h1>
            <p className="text-muted-foreground">
              {filteredProducts.length} {t('listings.found', { count: filteredProducts.length })}
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
                  <button onClick={() => setSelectedCategory('')}>
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
                  <Select value={sortBy} onValueChange={setSortBy}>
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
              {filteredProducts.length > 0 ? (
                <div className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'
                    : 'space-y-4'
                }>
                  {filteredProducts.map((product, index) => (
                    <div
                      key={product.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <ProductCard
                        product={product}
                        variant={viewMode === 'list' ? 'horizontal' : 'default'}
                      />
                    </div>
                  ))}
                </div>
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

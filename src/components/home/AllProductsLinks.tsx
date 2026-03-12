import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTranslatedCategory } from '@/hooks/useTranslatedCategory';
import { getLocalizedSlug, type SupportedLanguage } from '@/i18n';
import { useCategories } from '@/hooks/useCategories';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Link2, ArrowRight } from 'lucide-react';
import CategoryIcon from '@/components/CategoryIcon';
import ProductCard from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';

const AllProductsLinks = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as SupportedLanguage;
  const listingsSlug = getLocalizedSlug('listings', currentLang);
  const { data: categories = [] } = useCategories();
  const [expanded, setExpanded] = useState(false);

  const { data: products = [] } = useQuery({
    queryKey: ['all-products-seo-carousel'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products_public')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 10 * 60 * 1000,
  });

  if (products.length === 0) return null;

  // Group products by category
  const grouped: Record<string, any[]> = {};
  products.forEach((p) => {
    const cat = p.category || 'other';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(p);
  });

  const categoryOrder = categories.map((c) => c.slug);
  const sortedKeys = Object.keys(grouped).sort((a, b) => {
    const ia = categoryOrder.indexOf(a);
    const ib = categoryOrder.indexOf(b);
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
  });

  const visibleKeys = expanded ? sortedKeys : sortedKeys.slice(0, 3);

  return (
    <section className="py-10 md:py-14 border-t border-border/50">
      <div className="container-custom">
        <div className="flex items-center gap-3 mb-8">
          <Link2 className="h-5 w-5 text-primary" />
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            {t('listings.allListings', 'Tutti gli annunci')}
          </h2>
          <span className="text-sm text-muted-foreground">
            ({products.length} {t('common.products', 'prodotti')})
          </span>
        </div>

        <div className="space-y-10">
          {visibleKeys.map((catSlug) => (
            <CategoryCarousel
              key={catSlug}
              categorySlug={catSlug}
              products={grouped[catSlug]}
              lang={currentLang}
              listingsSlug={listingsSlug}
              categories={categories}
            />
          ))}
        </div>

        {sortedKeys.length > 3 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-8 flex items-center gap-2 mx-auto text-primary hover:text-primary/80 transition-colors font-medium"
          >
            {expanded
              ? t('common.showLess', 'Mostra di meno')
              : `${t('common.viewAll', 'Vedi tutto')} (${sortedKeys.length - 3} ${t('home.moreCategories', 'altre categorie')})`}
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        )}
      </div>
    </section>
  );
};

interface CategoryCarouselProps {
  categorySlug: string;
  products: any[];
  lang: SupportedLanguage;
  listingsSlug: string;
  categories: any[];
}

const CategoryCarousel = ({ categorySlug, products, lang, listingsSlug, categories }: CategoryCarouselProps) => {
  const { t } = useTranslation();
  const { translateCategory } = useTranslatedCategory();
  const scrollRef = useRef<HTMLDivElement>(null);
  const category = categories.find((c) => c.slug === categorySlug);
  const translatedName = translateCategory(categorySlug);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 300;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Link
          to={`/${lang}/${listingsSlug}?category=${categorySlug}`}
          className="inline-flex items-center gap-2 text-lg font-semibold text-foreground hover:text-primary transition-colors"
        >
          {category?.icon && <span>{category.icon}</span>}
          {translatedName || categorySlug}
          <span className="text-xs text-muted-foreground font-normal">({products.length})</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => scroll('left')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => scroll('right')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.slice(0, 20).map((product) => (
          <div key={product.id} className="min-w-[200px] w-[200px] sm:min-w-[220px] sm:w-[220px] snap-start shrink-0">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllProductsLinks;

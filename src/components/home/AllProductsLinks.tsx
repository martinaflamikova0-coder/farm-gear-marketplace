import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTranslatedProduct } from '@/hooks/useTranslatedProduct';
import { useTranslatedCategory } from '@/hooks/useTranslatedCategory';
import { getLocalizedSlug, type SupportedLanguage } from '@/i18n';
import { useCategories } from '@/hooks/useCategories';
import { ChevronDown, ChevronUp, Link2 } from 'lucide-react';

const AllProductsLinks = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as SupportedLanguage;
  const listingSlug = getLocalizedSlug('listing', currentLang);
  const { data: categories = [] } = useCategories();
  const [expanded, setExpanded] = useState(false);

  const { data: products = [] } = useQuery({
    queryKey: ['all-products-seo-links'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products_public')
        .select('id, title, title_translations, category, brand, price')
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

  // Show first 2 categories collapsed, all when expanded
  const visibleKeys = expanded ? sortedKeys : sortedKeys.slice(0, 2);

  return (
    <section className="py-10 md:py-14 border-t border-border/50">
      <div className="container-custom">
        <div className="flex items-center gap-3 mb-6">
          <Link2 className="h-5 w-5 text-primary" />
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            {t('home.allListings') || 'All Listings'}
          </h2>
          <span className="text-sm text-muted-foreground">
            ({products.length} {t('common.products') || 'products'})
          </span>
        </div>

        <div className="space-y-6">
          {visibleKeys.map((catSlug) => (
            <CategoryProductLinks
              key={catSlug}
              categorySlug={catSlug}
              products={grouped[catSlug]}
              lang={currentLang}
              listingSlug={listingSlug}
              categories={categories}
            />
          ))}
        </div>

        {sortedKeys.length > 2 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-6 flex items-center gap-2 mx-auto text-primary hover:text-primary/80 transition-colors font-medium"
          >
            {expanded
              ? t('common.showLess') || 'Show Less'
              : `${t('common.showAll') || 'Show All'} (${sortedKeys.length - 2} ${t('common.moreCategories') || 'more categories'})`}
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        )}
      </div>
    </section>
  );
};

interface CategoryProductLinksProps {
  categorySlug: string;
  products: any[];
  lang: SupportedLanguage;
  listingSlug: string;
  categories: any[];
}

const CategoryProductLinks = ({ categorySlug, products, lang, listingSlug, categories }: CategoryProductLinksProps) => {
  const { translateCategory } = useTranslatedCategory();
  const listingsSlug = getLocalizedSlug('listings', lang);
  const category = categories.find((c) => c.slug === categorySlug);
  const translatedName = translateCategory(categorySlug);

  return (
    <div>
      <Link
        to={`/${lang}/${listingsSlug}?category=${categorySlug}`}
        className="inline-flex items-center gap-2 mb-2 text-lg font-semibold text-foreground hover:text-primary transition-colors"
      >
        {category?.icon && <span>{category.icon}</span>}
        {translatedName || categorySlug}
        <span className="text-xs text-muted-foreground font-normal">({products.length})</span>
      </Link>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-0.5">
        {products.map((product) => (
          <ProductLink key={product.id} product={product} lang={lang} listingSlug={listingSlug} />
        ))}
      </div>
    </div>
  );
};

const ProductLink = ({ product, lang, listingSlug }: { product: any; lang: SupportedLanguage; listingSlug: string }) => {
  const { title } = useTranslatedProduct(product);

  return (
    <Link
      to={`/${lang}/${listingSlug}/${product.id}`}
      className="flex items-baseline gap-2 py-1 text-sm hover:text-primary transition-colors group"
    >
      <span className="text-foreground/70 group-hover:text-primary truncate flex-1">
        {title}
      </span>
      <span className="text-primary font-semibold shrink-0 whitespace-nowrap">
        €{Number(product.price).toLocaleString()}
      </span>
    </Link>
  );
};

export default AllProductsLinks;

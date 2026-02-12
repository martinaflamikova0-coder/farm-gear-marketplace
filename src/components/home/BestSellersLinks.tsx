import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTranslatedProduct } from '@/hooks/useTranslatedProduct';
import { getLocalizedSlug, type SupportedLanguage } from '@/i18n';
import { Trophy } from 'lucide-react';

const BestSellersLinks = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language as SupportedLanguage;
  const listingSlug = getLocalizedSlug('listing', currentLang);
  
  const { data: products = [] } = useQuery({
    queryKey: ['bestsellers-seo-links'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products_public')
        .select('id, title, title_translations, bestseller_rank, brand, price')
        .eq('status', 'active')
        .not('bestseller_rank', 'is', null)
        .order('bestseller_rank', { ascending: true })
        .limit(100);
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 10 * 60 * 1000,
  });

  if (products.length === 0) return null;

  return (
    <section className="py-10 md:py-14 bg-secondary/10">
      <div className="container-custom">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="h-6 w-6 text-accent" />
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            {t('home.topBestsellers') || 'Top Bestsellers'}
          </h2>
          <span className="text-sm text-muted-foreground">
            ({products.length} {t('common.products') || 'products'})
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-1">
          {products.map((product) => (
            <BestsellerLink
              key={product.id}
              product={product}
              lang={currentLang}
              listingSlug={listingSlug}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

interface BestsellerLinkProps {
  product: any;
  lang: SupportedLanguage;
  listingSlug: string;
}

const BestsellerLink = ({ product, lang, listingSlug }: BestsellerLinkProps) => {
  const { title } = useTranslatedProduct(product);

  return (
    <Link
      to={`/${lang}/${listingSlug}/${product.id}`}
      className="flex items-baseline gap-2 py-1.5 text-sm hover:text-primary transition-colors group"
    >
      <span className="text-xs font-bold text-accent shrink-0">
        #{product.bestseller_rank}
      </span>
      <span className="text-foreground/80 group-hover:text-primary truncate">
        {title}
      </span>
      <span className="text-muted-foreground text-xs shrink-0">
        €{Number(product.price).toLocaleString()}
      </span>
    </Link>
  );
};

export default BestSellersLinks;

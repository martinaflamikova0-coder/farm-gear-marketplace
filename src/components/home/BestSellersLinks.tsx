import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTranslatedProduct } from '@/hooks/useTranslatedProduct';
import { getLocalizedSlug, type SupportedLanguage } from '@/i18n';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';
import type { ProductWithSeller } from '@/hooks/useProducts';

const BestSellersLinks = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const currentLang = i18n.language as SupportedLanguage;
  const listingSlug = getLocalizedSlug('listing', currentLang);
  
  // Fetch top bestsellers with rank
  const { data: products = [] } = useQuery({
    queryKey: ['bestsellers-top-4'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products_public')
        .select('*')
        .eq('status', 'active')
        .not('bestseller_rank', 'is', null)
        .order('bestseller_rank', { ascending: true })
        .limit(4);
      
      if (error) throw error;
      return data as ProductWithSeller[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const handleProductClick = (productId: string) => {
    navigate(`/${currentLang}/${listingSlug}/${productId}`);
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-16">
      <div className="container-custom">
        {/* Heading */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              {t('home.topBestsellers') || 'Top Bestsellers'}
            </h2>
            <p className="text-muted-foreground mt-2">
              {t('home.topBestsellersDesc') || 'Most popular items right now'}
            </p>
          </div>
          <button
            onClick={() => navigate(`/${currentLang}/${getLocalizedSlug('listings', currentLang)}`)}
            className="hidden sm:flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
          >
            {t('common.viewAll')}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <BestsellerCard
              key={product.id}
              product={product}
              rank={product.bestseller_rank || index + 1}
              onClick={() => handleProductClick(product.id)}
            />
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="flex sm:hidden justify-center mt-8">
          <button
            onClick={() => navigate(`/${currentLang}/${getLocalizedSlug('listings', currentLang)}`)}
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-semibold"
          >
            {t('common.viewAll')}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

interface BestsellerCardProps {
  product: any;
  rank: number;
  onClick: () => void;
}

const BestsellerCard = ({ product, rank, onClick }: BestsellerCardProps) => {
  const { title } = useTranslatedProduct(product);
  const image = product.merchant_safe_image_url || product.images?.[0];

  return (
    <Card
      onClick={onClick}
      className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg hover:border-primary/50"
    >
      {/* Image Container with Rank Badge */}
      <div className="relative overflow-hidden bg-secondary/30 aspect-square">
        {image && (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
        {/* Rank Badge */}
        <Badge
          variant="default"
          className="absolute top-3 left-3 text-lg font-bold bg-accent text-accent-foreground"
        >
          #{rank}
        </Badge>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
          {title}
        </h3>
        <p className="text-primary font-bold text-lg mt-2">
          €{product.price.toFixed(2)}
        </p>
        <button className="w-full mt-3 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
          View Details →
        </button>
      </div>
    </Card>
  );
};

export default BestSellersLinks;

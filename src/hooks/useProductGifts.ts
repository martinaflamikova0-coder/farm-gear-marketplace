import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export interface ProductGift {
  id?: string;
  icon: string;
  name: string;
  nameTranslations?: Record<string, string> | null;
  value?: string;
  image?: string;
  referenceNumber?: number;
  translationKey?: string; // For premium gifts that need translation
}

interface ProductForGifts {
  id?: string;
  category: string;
  price: number;
  brand?: string | null;
  condition?: string | null;
}

// Price threshold for items that can be gifts
const GIFT_PRICE_THRESHOLD = 2000;

// Determine number of gifts based on product price
function getGiftCount(price: number): number {
  if (price >= 150000) return 10;
  if (price >= 100000) return 8;
  if (price >= 80000) return 7;
  if (price >= 50000) return 6;
  if (price >= 30000) return 5;
  if (price >= 20000) return 4;
  if (price >= 10000) return 3;
  if (price >= 5000) return 2;
  return 1;
}

// Fetch low-price products that can serve as gifts
async function fetchGiftProducts(): Promise<ProductGift[]> {
  const { data, error } = await supabase
    .from('products')
    .select('id, title, title_translations, price, images, reference_number, category')
    .eq('status', 'active')
    .lte('price', GIFT_PRICE_THRESHOLD)
    .order('price', { ascending: true })
    .limit(50);

  if (error) {
    console.error('Error fetching gift products:', error);
    return [];
  }

  return (data || []).map(product => ({
    id: product.id,
    icon: getCategoryIcon(product.category),
    name: product.title,
    nameTranslations: product.title_translations as Record<string, string> | null,
    value: `${Math.round(product.price)}€`,
    image: product.images?.[0] || undefined,
    referenceNumber: product.reference_number,
  }));
}

// Get icon based on category
function getCategoryIcon(category: string): string {
  const categoryIcons: Record<string, string> = {
    'tracteurs': '🚜',
    'tracteurs-agricoles': '🚜',
    'recolte': '🌾',
    'moissonneuses-batteuses': '🌾',
    'travail-sol': '🔩',
    'charrues': '🔩',
    'elevage': '🐄',
    'manutention': '📦',
    'chantier': '🏗️',
    'pieces': '⚙️',
    'hydraulique': '💧',
    'pneumatiques': '🛞',
    'tondeuse': '🌿',
  };
  return categoryIcons[category?.toLowerCase()] || '🎁';
}

// Seeded random for consistent selection
function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

// Custom hook to fetch gift products
export function useGiftProducts() {
  return useQuery({
    queryKey: ['gift-products'],
    queryFn: fetchGiftProducts,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useProductGifts(product: ProductForGifts | null | undefined): ProductGift[] {
  const { data: giftProducts = [] } = useGiftProducts();

  return useMemo(() => {
    if (!product || giftProducts.length === 0) return [];

    // Don't show gifts for products that are themselves low-priced (could be gifts)
    if (product.price <= GIFT_PRICE_THRESHOLD) return [];

    const giftCount = getGiftCount(product.price);
    
    // Use product price as seed for consistent random selection
    const random = seededRandom(Math.floor(product.price));
    
    // Filter out the product itself if it has an id
    const availableGifts = product.id 
      ? giftProducts.filter(g => g.id !== product.id)
      : giftProducts;
    
    if (availableGifts.length === 0) return [];

    // Shuffle available gifts with seeded random
    const shuffled = [...availableGifts].sort(() => random() - 0.5);
    
    // Select gifts up to the count
    const selectedGifts = shuffled.slice(0, Math.min(giftCount, shuffled.length));
    
    // Add free delivery for items over 5000€
    if (product.price >= 5000 && !selectedGifts.some(g => g.translationKey === 'freeDelivery')) {
      selectedGifts.push({ 
        icon: '🚚', 
        name: 'Free delivery', // Fallback, will be translated in component
        value: '150€',
        translationKey: 'freeDelivery'
      });
    }
    
    // Add premium gifts for expensive items
    if (product.price >= 30000) {
      const premiumGifts: ProductGift[] = [
        { icon: '🛡️', name: 'Warranty extension +12 months', value: '200€', translationKey: 'warrantyExtension' },
        { icon: '🔧', name: 'Free first complete service', value: '180€', translationKey: 'freeFirstService' },
      ];
      
      if (product.price >= 80000) {
        premiumGifts.push({ icon: '🎓', name: 'On-site operator training', value: '350€', translationKey: 'operatorTraining' });
      }
      if (product.price >= 150000) {
        premiumGifts.push({ icon: '📡', name: 'Connected telemetry module', value: '450€', translationKey: 'telemetryModule' });
      }
      
      selectedGifts.push(...premiumGifts);
    }
    
    return selectedGifts;
  }, [product?.id, product?.price, giftProducts]);
}

export function calculateGiftsTotalValue(gifts: ProductGift[]): number {
  return gifts.reduce((total, gift) => {
    const value = gift.value ? parseInt(gift.value.replace('€', '')) : 0;
    return total + (isNaN(value) ? 0 : value);
  }, 0);
}

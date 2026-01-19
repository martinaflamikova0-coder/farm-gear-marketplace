import { useMemo } from 'react';

export interface ProductGift {
  icon: string;
  name: string;
  value?: string;
}

interface ProductForGifts {
  category: string;
  price: number;
  brand?: string | null;
  condition?: string | null;
}

// Gift pools by category
const categoryGifts: Record<string, ProductGift[]> = {
  tracteurs: [
    { icon: '🧢', name: 'Casquette de la marque', value: '25€' },
    { icon: '🧤', name: 'Gants de travail professionnels', value: '35€' },
    { icon: '📘', name: 'Manuel d\'utilisation complet', value: '15€' },
    { icon: '🔧', name: 'Kit d\'outils de base', value: '45€' },
    { icon: '🛢️', name: 'Bidon d\'huile moteur 5L', value: '40€' },
  ],
  moissonneuses: [
    { icon: '🧢', name: 'Casquette premium', value: '30€' },
    { icon: '🧤', name: 'Gants haute protection', value: '45€' },
    { icon: '📘', name: 'Guide de maintenance', value: '20€' },
    { icon: '🔦', name: 'Lampe torche LED', value: '35€' },
    { icon: '🛢️', name: 'Lubrifiant spécial', value: '55€' },
  ],
  'outils-materiels': [
    { icon: '🧰', name: 'Boîte de rangement', value: '20€' },
    { icon: '🧤', name: 'Gants de protection', value: '25€' },
    { icon: '📋', name: 'Guide d\'utilisation', value: '10€' },
    { icon: '🔩', name: 'Kit de fixations', value: '15€' },
  ],
  'pieces-accessoires': [
    { icon: '📦', name: 'Emballage premium', value: '10€' },
    { icon: '📋', name: 'Fiche technique détaillée', value: '5€' },
    { icon: '🔧', name: 'Outil de montage', value: '15€' },
  ],
  'elevage-betail': [
    { icon: '🧤', name: 'Gants vétérinaires', value: '20€' },
    { icon: '📘', name: 'Guide sanitaire', value: '25€' },
    { icon: '🧴', name: 'Désinfectant professionnel', value: '30€' },
  ],
  'espaces-verts': [
    { icon: '🧤', name: 'Gants de jardinage pro', value: '25€' },
    { icon: '🧢', name: 'Casquette été', value: '20€' },
    { icon: '🌱', name: 'Engrais universel 5kg', value: '35€' },
  ],
  'transport-manutention': [
    { icon: '🦺', name: 'Gilet de sécurité', value: '15€' },
    { icon: '🧤', name: 'Gants manutention', value: '25€' },
    { icon: '🔦', name: 'Lampe de signalisation', value: '30€' },
  ],
  'batiments-hangars': [
    { icon: '🪖', name: 'Casque de chantier', value: '35€' },
    { icon: '🧤', name: 'Gants BTP', value: '30€' },
    { icon: '📐', name: 'Mètre laser', value: '45€' },
  ],
};

// Default gifts for unknown categories
const defaultGifts: ProductGift[] = [
  { icon: '🎁', name: 'Cadeau surprise', value: '20€' },
  { icon: '📘', name: 'Documentation complète', value: '15€' },
  { icon: '🧤', name: 'Gants de travail', value: '25€' },
];

// Premium gifts for high-value items
const premiumGifts: ProductGift[] = [
  { icon: '🎓', name: 'Formation en ligne offerte', value: '150€' },
  { icon: '🛡️', name: 'Extension de garantie +6 mois', value: '200€' },
  { icon: '🚚', name: 'Livraison premium express', value: '100€' },
  { icon: '📞', name: 'Support technique prioritaire 1 an', value: '120€' },
];

// Brand-specific gifts
const brandGifts: Record<string, ProductGift> = {
  'john deere': { icon: '🧢', name: 'Casquette John Deere officielle', value: '35€' },
  'fendt': { icon: '🧥', name: 'Veste Fendt collector', value: '80€' },
  'massey ferguson': { icon: '🧢', name: 'Casquette Massey Ferguson', value: '30€' },
  'new holland': { icon: '☕', name: 'Mug New Holland', value: '15€' },
  'claas': { icon: '🧢', name: 'Casquette Claas premium', value: '35€' },
  'case ih': { icon: '🎒', name: 'Sac à dos Case IH', value: '50€' },
  'kubota': { icon: '🧤', name: 'Gants Kubota pro', value: '40€' },
  'deutz-fahr': { icon: '🧢', name: 'Casquette Deutz-Fahr', value: '30€' },
};

function getGiftCount(price: number): number {
  if (price >= 50000) return 5;
  if (price >= 20000) return 4;
  if (price >= 10000) return 3;
  if (price >= 5000) return 2;
  return 1;
}

function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

export function useProductGifts(product: ProductForGifts | null | undefined): ProductGift[] {
  return useMemo(() => {
    if (!product) return [];

    const gifts: ProductGift[] = [];
    const giftCount = getGiftCount(product.price);
    
    // Use price as seed for consistent random selection
    const random = seededRandom(Math.floor(product.price));
    
    // Get category-specific gifts
    const categoryKey = product.category.toLowerCase();
    const availableGifts = categoryGifts[categoryKey] || defaultGifts;
    
    // Shuffle and pick gifts based on price tier
    const shuffled = [...availableGifts].sort(() => random() - 0.5);
    const selectedCategoryGifts = shuffled.slice(0, Math.min(giftCount, shuffled.length));
    gifts.push(...selectedCategoryGifts);
    
    // Add brand-specific gift if applicable
    if (product.brand) {
      const brandKey = product.brand.toLowerCase();
      const brandGift = brandGifts[brandKey];
      if (brandGift && !gifts.some(g => g.name === brandGift.name)) {
        gifts.unshift(brandGift); // Brand gift first
      }
    }
    
    // Add premium gifts for expensive items
    if (product.price >= 30000) {
      const premiumCount = product.price >= 80000 ? 2 : 1;
      const shuffledPremium = [...premiumGifts].sort(() => random() - 0.5);
      gifts.push(...shuffledPremium.slice(0, premiumCount));
    }
    
    // Add free delivery for items over 5000€
    if (product.price >= 5000 && !gifts.some(g => g.name.includes('Livraison'))) {
      gifts.push({ icon: '🚚', name: 'Livraison offerte', value: '150€' });
    }
    
    return gifts;
  }, [product?.category, product?.price, product?.brand]);
}

export function calculateGiftsTotalValue(gifts: ProductGift[]): number {
  return gifts.reduce((total, gift) => {
    const value = gift.value ? parseInt(gift.value.replace('€', '')) : 0;
    return total + value;
  }, 0);
}

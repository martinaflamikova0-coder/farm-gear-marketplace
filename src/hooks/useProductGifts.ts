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

// Gift pools by category with base values
const categoryGifts: Record<string, ProductGift[]> = {
  tracteurs: [
    { icon: '🧢', name: 'Casquette de la marque' },
    { icon: '🧤', name: 'Gants de travail professionnels' },
    { icon: '📘', name: 'Manuel d\'utilisation complet' },
    { icon: '🔧', name: 'Kit d\'outils de base' },
    { icon: '🛢️', name: 'Bidon d\'huile moteur 5L' },
  ],
  moissonneuses: [
    { icon: '🧢', name: 'Casquette premium' },
    { icon: '🧤', name: 'Gants haute protection' },
    { icon: '📘', name: 'Guide de maintenance' },
    { icon: '🔦', name: 'Lampe torche LED' },
    { icon: '🛢️', name: 'Lubrifiant spécial' },
  ],
  'outils-materiels': [
    { icon: '🧰', name: 'Boîte de rangement' },
    { icon: '🧤', name: 'Gants de protection' },
    { icon: '📋', name: 'Guide d\'utilisation' },
    { icon: '🔩', name: 'Kit de fixations' },
  ],
  'pieces-accessoires': [
    { icon: '📦', name: 'Emballage premium' },
    { icon: '📋', name: 'Fiche technique détaillée' },
    { icon: '🔧', name: 'Outil de montage' },
  ],
  'elevage-betail': [
    { icon: '🧤', name: 'Gants vétérinaires' },
    { icon: '📘', name: 'Guide sanitaire' },
    { icon: '🧴', name: 'Désinfectant professionnel' },
  ],
  'espaces-verts': [
    { icon: '🧤', name: 'Gants de jardinage pro' },
    { icon: '🧢', name: 'Casquette été' },
    { icon: '🌱', name: 'Engrais universel 5kg' },
  ],
  'transport-manutention': [
    { icon: '🦺', name: 'Gilet de sécurité' },
    { icon: '🧤', name: 'Gants manutention' },
    { icon: '🔦', name: 'Lampe de signalisation' },
  ],
  'batiments-hangars': [
    { icon: '🪖', name: 'Casque de chantier' },
    { icon: '🧤', name: 'Gants BTP' },
    { icon: '📐', name: 'Mètre laser' },
  ],
};

// Default gifts for unknown categories
const defaultGifts: ProductGift[] = [
  { icon: '🎁', name: 'Cadeau surprise' },
  { icon: '📘', name: 'Documentation complète' },
  { icon: '🧤', name: 'Gants de travail' },
];

// Premium gifts for high-value items
const premiumGifts: ProductGift[] = [
  { icon: '🎓', name: 'Formation en ligne offerte' },
  { icon: '🛡️', name: 'Extension de garantie +6 mois' },
  { icon: '🚚', name: 'Livraison premium express' },
  { icon: '📞', name: 'Support technique prioritaire 1 an' },
];

// Brand-specific gifts
const brandGifts: Record<string, ProductGift> = {
  'john deere': { icon: '🧢', name: 'Casquette John Deere officielle' },
  'fendt': { icon: '🧥', name: 'Veste Fendt collector' },
  'massey ferguson': { icon: '🧢', name: 'Casquette Massey Ferguson' },
  'new holland': { icon: '☕', name: 'Mug New Holland' },
  'claas': { icon: '🧢', name: 'Casquette Claas premium' },
  'case ih': { icon: '🎒', name: 'Sac à dos Case IH' },
  'kubota': { icon: '🧤', name: 'Gants Kubota pro' },
  'deutz-fahr': { icon: '🧢', name: 'Casquette Deutz-Fahr' },
};

function getGiftCount(price: number): number {
  if (price >= 80000) return 6;
  if (price >= 50000) return 5;
  if (price >= 20000) return 4;
  if (price >= 10000) return 3;
  if (price >= 5000) return 2;
  return 1;
}

// Calculate target total gift value based on price (max 400€)
function getTargetGiftValue(price: number): number {
  if (price >= 100000) return 400;
  if (price >= 80000) return 350;
  if (price >= 50000) return 280;
  if (price >= 30000) return 200;
  if (price >= 20000) return 150;
  if (price >= 10000) return 100;
  if (price >= 5000) return 60;
  if (price >= 2000) return 40;
  return 25;
}

// Assign values to gifts based on target total
function assignGiftValues(gifts: ProductGift[], targetTotal: number): ProductGift[] {
  if (gifts.length === 0) return [];
  
  // Base value per gift, distributed proportionally
  const baseValue = Math.floor(targetTotal / gifts.length);
  let remaining = targetTotal;
  
  return gifts.map((gift, index) => {
    // Give slightly more to first gifts (brand/premium), less to later ones
    const multiplier = index === 0 ? 1.3 : index === 1 ? 1.1 : 0.9;
    let value = Math.round(baseValue * multiplier);
    
    // Ensure we don't exceed remaining
    if (index === gifts.length - 1) {
      value = remaining;
    } else {
      value = Math.min(value, remaining - (gifts.length - index - 1) * 10);
    }
    
    remaining -= value;
    
    return {
      ...gift,
      value: `${Math.max(10, value)}€`
    };
  });
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
    const targetValue = getTargetGiftValue(product.price);
    
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
      gifts.push({ icon: '🚚', name: 'Livraison offerte' });
    }
    
    // Assign values based on target total
    return assignGiftValues(gifts, targetValue);
  }, [product?.category, product?.price, product?.brand]);
}

export function calculateGiftsTotalValue(gifts: ProductGift[]): number {
  return gifts.reduce((total, gift) => {
    const value = gift.value ? parseInt(gift.value.replace('€', '')) : 0;
    return total + value;
  }, 0);
}

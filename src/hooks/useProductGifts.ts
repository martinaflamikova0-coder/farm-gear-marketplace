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

// Complementary gifts by category - real useful accessories for the purchased item
const categoryGifts: Record<string, ProductGift[]> = {
  tracteurs: [
    { icon: '📡', name: 'Antenne GPS agricole' },
    { icon: '💡', name: 'Kit phares LED de travail' },
    { icon: '🛢️', name: 'Bidon huile hydraulique 20L' },
    { icon: '🔋', name: 'Chargeur de batterie intelligent' },
    { icon: '🪞', name: 'Rétroviseurs grand angle' },
    { icon: '🧲', name: 'Attelage rapide 3 points' },
    { icon: '🌡️', name: 'Jauge multifonction digitale' },
    { icon: '🔊', name: 'Kit radio Bluetooth cabine' },
  ],
  moissonneuses: [
    { icon: '📊', name: 'Testeur d\'humidité grain' },
    { icon: '🔪', name: 'Jeu de contre-couteaux neufs' },
    { icon: '⚙️', name: 'Kit courroies de rechange' },
    { icon: '🧹', name: 'Souffleur nettoyage radiateur' },
    { icon: '💡', name: 'Rampe LED pour travail de nuit' },
    { icon: '🛡️', name: 'Grilles de protection moteur' },
    { icon: '📡', name: 'Capteur de rendement' },
  ],
  'outils-materiels': [
    { icon: '🔩', name: 'Kit visserie inox complet' },
    { icon: '⚙️', name: 'Pièces d\'usure de rechange' },
    { icon: '🛢️', name: 'Graisse spéciale agricole 5kg' },
    { icon: '🔧', name: 'Coffret clés à chocs' },
    { icon: '📏', name: 'Laser de nivellement' },
  ],
  'pieces-accessoires': [
    { icon: '🔧', name: 'Kit montage professionnel' },
    { icon: '🧴', name: 'Lubrifiant haute performance' },
    { icon: '📦', name: 'Pièces de fixation renforcées' },
    { icon: '🛡️', name: 'Protection anti-usure' },
  ],
  'elevage-betail': [
    { icon: '💉', name: 'Kit vétérinaire de base' },
    { icon: '🧴', name: 'Désinfectant professionnel 10L' },
    { icon: '📊', name: 'Balance de pesée portable' },
    { icon: '🔦', name: 'Lampe d\'examen LED' },
    { icon: '🌡️', name: 'Thermomètre digital précis' },
  ],
  'espaces-verts': [
    { icon: '🔪', name: 'Jeu de lames de rechange' },
    { icon: '🛢️', name: 'Huile 2 temps 5L' },
    { icon: '⚡', name: 'Batterie supplémentaire' },
    { icon: '🧹', name: 'Kit nettoyage filtre à air' },
    { icon: '🎧', name: 'Casque anti-bruit pro' },
  ],
  'transport-manutention': [
    { icon: '🔗', name: 'Chaînes d\'arrimage HD' },
    { icon: '💡', name: 'Gyrophare LED magnétique' },
    { icon: '🛞', name: 'Kit réparation pneu' },
    { icon: '🔌', name: 'Prise remorque 13 broches' },
    { icon: '📐', name: 'Cales de roue alu' },
  ],
  'batiments-hangars': [
    { icon: '💡', name: 'Éclairage LED 150W' },
    { icon: '🌀', name: 'Ventilateur industriel' },
    { icon: '🚪', name: 'Kit motorisation portail' },
    { icon: '📹', name: 'Caméra de surveillance' },
    { icon: '🔒', name: 'Serrure haute sécurité' },
  ],
};

// Default gifts for unknown categories
const defaultGifts: ProductGift[] = [
  { icon: '🔧', name: 'Kit outillage de base' },
  { icon: '🛢️', name: 'Lubrifiant universel' },
  { icon: '📦', name: 'Pièces d\'usure de rechange' },
];

// Premium gifts for high-value items (real valuable additions)
const premiumGifts: ProductGift[] = [
  { icon: '🛡️', name: 'Extension garantie +12 mois' },
  { icon: '🔧', name: 'Première révision complète offerte' },
  { icon: '📡', name: 'Module télémétrie connectée' },
  { icon: '🎓', name: 'Formation opérateur sur site' },
];

// Brand-specific complementary accessories
const brandGifts: Record<string, ProductGift> = {
  'john deere': { icon: '📱', name: 'Abonnement JDLink 1 an' },
  'fendt': { icon: '📡', name: 'Terminal Fendt Connect' },
  'massey ferguson': { icon: '🔌', name: 'Prise diagnostique MF' },
  'new holland': { icon: '📊', name: 'Licence PLM Connect' },
  'claas': { icon: '📡', name: 'Telematics CLAAS offert' },
  'case ih': { icon: '📱', name: 'AFS Connect 1 an' },
  'kubota': { icon: '🔋', name: 'Kit batterie renforcée Kubota' },
  'deutz-fahr': { icon: '⚙️', name: 'Pack filtration Deutz' },
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

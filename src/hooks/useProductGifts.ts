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
  // TRACTEURS
  'tracteurs': [
    { icon: '📡', name: 'Antenne GPS agricole' },
    { icon: '💡', name: 'Kit phares LED de travail' },
    { icon: '🛢️', name: 'Bidon huile hydraulique 20L' },
    { icon: '🔋', name: 'Chargeur de batterie intelligent' },
    { icon: '🪞', name: 'Rétroviseurs grand angle' },
    { icon: '🧲', name: 'Attelage rapide 3 points' },
    { icon: '🌡️', name: 'Jauge multifonction digitale' },
    { icon: '🔊', name: 'Kit radio Bluetooth cabine' },
  ],
  'tracteurs-agricoles': [
    { icon: '📡', name: 'Antenne GPS agricole' },
    { icon: '💡', name: 'Kit phares LED de travail' },
    { icon: '🛢️', name: 'Bidon huile hydraulique 20L' },
    { icon: '🔋', name: 'Chargeur de batterie intelligent' },
    { icon: '🪞', name: 'Rétroviseurs grand angle' },
    { icon: '🧲', name: 'Attelage rapide 3 points' },
  ],
  'tracteurs-forestiers': [
    { icon: '🛡️', name: 'Protection forestière cabine' },
    { icon: '🔗', name: 'Chaînes forestières renforcées' },
    { icon: '💡', name: 'Projecteurs anti-branche' },
    { icon: '🛢️', name: 'Huile biodégradable 20L' },
    { icon: '🔧', name: 'Kit de treuil forestier' },
  ],
  'tracteurs-vignerons': [
    { icon: '🍇', name: 'Kit pulvérisation vignoble' },
    { icon: '📏', name: 'Capteur inter-rang' },
    { icon: '💡', name: 'Éclairage basse hauteur' },
    { icon: '🛢️', name: 'Huile moteur premium 10L' },
  ],
  'micro-tracteurs': [
    { icon: '🔧', name: 'Kit outils compacts' },
    { icon: '💡', name: 'Phares LED avant/arrière' },
    { icon: '🛢️', name: 'Huile moteur 5L' },
    { icon: '🪜', name: 'Chargeur frontal mini' },
  ],

  // RÉCOLTE
  'moissonneuses-batteuses': [
    { icon: '📊', name: 'Testeur d\'humidité grain' },
    { icon: '🔪', name: 'Jeu de contre-couteaux neufs' },
    { icon: '⚙️', name: 'Kit courroies de rechange' },
    { icon: '🧹', name: 'Souffleur nettoyage radiateur' },
    { icon: '💡', name: 'Rampe LED pour travail de nuit' },
    { icon: '📡', name: 'Capteur de rendement' },
  ],
  'ensileuses': [
    { icon: '🔪', name: 'Jeu de couteaux affûtés' },
    { icon: '📊', name: 'Analyseur matière sèche' },
    { icon: '⚙️', name: 'Courroies de transmission' },
    { icon: '🛢️', name: 'Graisse spéciale chaîne' },
  ],
  'presses-balles': [
    { icon: '🧵', name: 'Rouleaux ficelle haute résistance' },
    { icon: '🔧', name: 'Kit aiguilles de rechange' },
    { icon: '⚙️', name: 'Courroies presse' },
    { icon: '🛢️', name: 'Graisse roulements 5kg' },
  ],
  'faucheuses': [
    { icon: '🔪', name: 'Jeu de lames de rechange' },
    { icon: '🔩', name: 'Kit boulonnerie faucheuse' },
    { icon: '🛢️', name: 'Huile transmission' },
    { icon: '⚙️', name: 'Courroies trapézoïdales' },
  ],
  'recolte': [
    { icon: '📊', name: 'Testeur d\'humidité' },
    { icon: '🔪', name: 'Pièces d\'usure de rechange' },
    { icon: '🛢️', name: 'Lubrifiant spécial récolte' },
    { icon: '💡', name: 'Éclairage LED de travail' },
  ],

  // TRAVAIL DU SOL
  'travail-sol': [
    { icon: '🔩', name: 'Kit socs de rechange' },
    { icon: '🛢️', name: 'Graisse spéciale agricole 5kg' },
    { icon: '🔧', name: 'Coffret clés de réglage' },
    { icon: '📏', name: 'Laser de nivellement' },
  ],
  'charrues': [
    { icon: '🔩', name: 'Jeu de socs neufs' },
    { icon: '⚙️', name: 'Versoirs de rechange' },
    { icon: '🛢️', name: 'Graisse haute pression 5kg' },
    { icon: '🔧', name: 'Clés de réglage charrue' },
  ],
  'herses': [
    { icon: '🔩', name: 'Dents de herse de rechange' },
    { icon: '⚙️', name: 'Roulements étanches' },
    { icon: '🛢️', name: 'Graisse roulements' },
  ],
  'cultivateurs': [
    { icon: '🔩', name: 'Socs cultivateur neufs' },
    { icon: '⚙️', name: 'Ressorts de sécurité' },
    { icon: '🔧', name: 'Kit réglage profondeur' },
  ],
  'semoirs': [
    { icon: '🌱', name: 'Disques semeurs de rechange' },
    { icon: '📊', name: 'Moniteur de semis' },
    { icon: '⚙️', name: 'Courroies distribution' },
    { icon: '🔧', name: 'Kit calibration semoir' },
  ],
  'broyeurs': [
    { icon: '🔪', name: 'Jeu de couteaux Y' },
    { icon: '⚙️', name: 'Courroies broyeur' },
    { icon: '🛢️', name: 'Huile boîtier 5L' },
    { icon: '🔩', name: 'Boulonnerie anti-vibration' },
  ],

  // PULVÉRISATION / ÉPANDAGE
  'pulverisateurs': [
    { icon: '💧', name: 'Buses de pulvérisation neuves' },
    { icon: '🔧', name: 'Kit joints et membranes' },
    { icon: '📊', name: 'Débitmètre de contrôle' },
    { icon: '🧴', name: 'Nettoyant cuve 5L' },
  ],
  'epandeurs': [
    { icon: '⚙️', name: 'Disques d\'épandage neufs' },
    { icon: '🔧', name: 'Kit déflecteurs' },
    { icon: '📊', name: 'Testeur de débit' },
    { icon: '🛢️', name: 'Graisse alimentaire' },
  ],

  // ÉLEVAGE
  'elevage': [
    { icon: '💉', name: 'Kit vétérinaire complet' },
    { icon: '🧴', name: 'Désinfectant professionnel 20L' },
    { icon: '📊', name: 'Balance de pesée portable' },
    { icon: '🌡️', name: 'Thermomètre digital précis' },
  ],
  'traite': [
    { icon: '🧴', name: 'Produit lavage tank 25L' },
    { icon: '⚙️', name: 'Manchons trayeurs neufs' },
    { icon: '🔧', name: 'Kit joints et clapets' },
    { icon: '📊', name: 'Testeur qualité lait' },
  ],
  'melangeuses': [
    { icon: '🔪', name: 'Couteaux mélangeur neufs' },
    { icon: '⚙️', name: 'Courroies distribution' },
    { icon: '📊', name: 'Système de pesée' },
    { icon: '🛢️', name: 'Huile réducteur 20L' },
  ],
  'distributeurs': [
    { icon: '⚙️', name: 'Chaînes distribution neuves' },
    { icon: '🔧', name: 'Kit réglage débit' },
    { icon: '🛢️', name: 'Graisse chaîne 5kg' },
  ],
  'clotures': [
    { icon: '⚡', name: 'Électrificateur solaire' },
    { icon: '🔌', name: 'Testeur de clôture' },
    { icon: '🔧', name: 'Kit isolateurs' },
    { icon: '📏', name: 'Enrouleur fil 500m' },
  ],

  // MANUTENTION / TRANSPORT
  'manutention': [
    { icon: '🔗', name: 'Chaînes d\'arrimage HD' },
    { icon: '💡', name: 'Gyrophare LED magnétique' },
    { icon: '🔌', name: 'Prise remorque 13 broches' },
    { icon: '📐', name: 'Cales de roue alu' },
  ],
  'chargeurs-telescopiques': [
    { icon: '🪣', name: 'Godet multifonction' },
    { icon: '🔧', name: 'Kit raccords hydrauliques' },
    { icon: '💡', name: 'Phares de travail LED' },
    { icon: '🛢️', name: 'Huile hydraulique 20L' },
  ],
  'chariots-elevateurs': [
    { icon: '🔋', name: 'Batterie haute capacité' },
    { icon: '💡', name: 'Gyrophare sécurité' },
    { icon: '🔧', name: 'Kit fourches réglables' },
    { icon: '🛞', name: 'Pneumatiques neufs' },
  ],
  'remorques': [
    { icon: '🔗', name: 'Sangles d\'arrimage pro' },
    { icon: '💡', name: 'Kit feux LED complet' },
    { icon: '🛞', name: 'Kit réparation pneu' },
    { icon: '🔌', name: 'Câblage électrique neuf' },
  ],
  'bennes': [
    { icon: '🔧', name: 'Vérin de levage neuf' },
    { icon: '⚙️', name: 'Kit charnières renforcées' },
    { icon: '🛢️', name: 'Huile hydraulique 20L' },
  ],

  // CHANTIER
  'chantier': [
    { icon: '💡', name: 'Éclairage LED chantier' },
    { icon: '🦺', name: 'Kit sécurité complet' },
    { icon: '🔧', name: 'Outillage professionnel' },
  ],
  'mini-pelles': [
    { icon: '🪣', name: 'Godet terrassement' },
    { icon: '🔧', name: 'Kit flexibles hydrauliques' },
    { icon: '💡', name: 'Phares de travail LED' },
    { icon: '🛢️', name: 'Huile hydraulique 20L' },
  ],
  'pelles': [
    { icon: '🪣', name: 'Godet renforcé' },
    { icon: '⚙️', name: 'Dents de godet neuves' },
    { icon: '🔧', name: 'Kit flexibles HD' },
    { icon: '🛢️', name: 'Huile hydraulique 40L' },
  ],
  'compacteurs': [
    { icon: '🛢️', name: 'Huile vibration 10L' },
    { icon: '⚙️', name: 'Bandes de roulement' },
    { icon: '🔧', name: 'Kit filtration complet' },
  ],

  // ESPACES VERTS
  'tondeuse': [
    { icon: '🔪', name: 'Lames de rechange affûtées' },
    { icon: '🛢️', name: 'Huile moteur 4T 2L' },
    { icon: '⚙️', name: 'Courroie de transmission' },
    { icon: '🧹', name: 'Kit nettoyage carter' },
  ],
  'robot-tondeuse': [
    { icon: '🔪', name: 'Pack lames 12 mois' },
    { icon: '🔌', name: 'Câble périphérique 150m' },
    { icon: '🔋', name: 'Batterie de rechange' },
    { icon: '📡', name: 'Module GPS précision' },
  ],

  // IRRIGATION
  'irrigation': [
    { icon: '💧', name: 'Tuyaux goutte-à-goutte 100m' },
    { icon: '⚙️', name: 'Programmateur digital' },
    { icon: '🔧', name: 'Kit raccords rapides' },
    { icon: '📊', name: 'Capteur humidité sol' },
  ],

  // PIÈCES
  'pieces': [
    { icon: '🔧', name: 'Kit montage professionnel' },
    { icon: '🧴', name: 'Lubrifiant haute performance' },
    { icon: '📦', name: 'Pièces de fixation renforcées' },
  ],
  'hydraulique': [
    { icon: '🔧', name: 'Kit joints toriques' },
    { icon: '🛢️', name: 'Huile hydraulique 20L' },
    { icon: '⚙️', name: 'Flexibles de rechange' },
  ],
  'pneumatiques': [
    { icon: '🛞', name: 'Kit réparation tubeless' },
    { icon: '🔧', name: 'Démonte-pneu pro' },
    { icon: '📊', name: 'Manomètre digital' },
  ],
  'electrique': [
    { icon: '🔌', name: 'Connecteurs étanches' },
    { icon: '🔋', name: 'Testeur de circuit' },
    { icon: '💡', name: 'Ampoules LED de rechange' },
  ],
  'carrosserie': [
    { icon: '🎨', name: 'Kit retouche peinture' },
    { icon: '🔧', name: 'Rivets et fixations' },
    { icon: '🧴', name: 'Produit anti-rouille' },
  ],

  // ÉNERGIE
  'groupes-electrogenes': [
    { icon: '🛢️', name: 'Huile moteur 5L' },
    { icon: '⚙️', name: 'Kit filtration complet' },
    { icon: '🔌', name: 'Rallonge électrique 25m' },
    { icon: '🔋', name: 'Chargeur batterie' },
  ],

  // AUTRES
  'autres': [
    { icon: '🔧', name: 'Kit outillage universel' },
    { icon: '🛢️', name: 'Lubrifiant multifonction' },
    { icon: '📦', name: 'Pièces d\'usure standard' },
  ],
  'divers': [
    { icon: '🔧', name: 'Outillage de base' },
    { icon: '🛢️', name: 'Lubrifiant universel' },
    { icon: '📦', name: 'Kit accessoires' },
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

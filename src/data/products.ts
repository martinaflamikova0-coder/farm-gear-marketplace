export interface Product {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  brand: string;
  model: string;
  year: number;
  hours?: number;
  kilometers?: number;
  priceHT: number;
  priceTTC: number;
  condition: 'Excellent' | 'Très bon' | 'Bon' | 'Correct';
  location: string;
  department: string;
  description: string;
  images: string[];
  featured: boolean;
  createdAt: string;
  seller: {
    name: string;
    phone: string;
    email: string;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  count: number;
  subcategories: string[];
}

export const categories: Category[] = [
  {
    id: '1',
    name: 'Tracteurs',
    slug: 'tracteurs',
    icon: '🚜',
    count: 245,
    subcategories: ['Tracteurs agricoles', 'Tracteurs vignerons', 'Tracteurs forestiers', 'Micro-tracteurs']
  },
  {
    id: '2',
    name: 'Matériel de récolte',
    slug: 'recolte',
    icon: '🌾',
    count: 89,
    subcategories: ['Moissonneuses-batteuses', 'Ensileuses', 'Presses à balles', 'Faucheuses']
  },
  {
    id: '3',
    name: 'Travail du sol',
    slug: 'travail-sol',
    icon: '⚙️',
    count: 156,
    subcategories: ['Charrues', 'Cultivateurs', 'Herses', 'Semoirs']
  },
  {
    id: '4',
    name: 'Matériel d\'élevage',
    slug: 'elevage',
    icon: '🐄',
    count: 78,
    subcategories: ['Mélangeuses', 'Distributeurs', 'Traite', 'Clôtures']
  },
  {
    id: '5',
    name: 'Manutention',
    slug: 'manutention',
    icon: '🏗️',
    count: 112,
    subcategories: ['Chargeurs télescopiques', 'Chariots élévateurs', 'Remorques', 'Bennes']
  },
  {
    id: '6',
    name: 'Matériel de chantier',
    slug: 'chantier',
    icon: '🔧',
    count: 67,
    subcategories: ['Pelles', 'Mini-pelles', 'Compacteurs', 'Groupes électrogènes']
  },
  {
    id: '7',
    name: 'Pièces et accessoires',
    slug: 'pieces',
    icon: '🔩',
    count: 203,
    subcategories: ['Pneumatiques', 'Hydraulique', 'Électrique', 'Carrosserie']
  },
  {
    id: '8',
    name: 'Autres matériels',
    slug: 'autres',
    icon: '📦',
    count: 45,
    subcategories: ['Pulvérisateurs', 'Épandeurs', 'Irrigation', 'Divers']
  }
];

export const brands = [
  'John Deere', 'Massey Ferguson', 'New Holland', 'Fendt', 'Claas',
  'Case IH', 'Kubota', 'Deutz-Fahr', 'Valtra', 'Same', 'Lamborghini',
  'JCB', 'Manitou', 'Merlo', 'Caterpillar', 'Komatsu'
];

export const departments = [
  'Ain (01)', 'Aisne (02)', 'Allier (03)', 'Alpes-de-Haute-Provence (04)',
  'Haute-Loire (43)', 'Loire-Atlantique (44)', 'Loiret (45)', 'Lot (46)',
  'Marne (51)', 'Haute-Marne (52)', 'Mayenne (53)', 'Nord (59)',
  'Oise (60)', 'Orne (61)', 'Pas-de-Calais (62)', 'Somme (80)'
];

export const products: Product[] = [
  {
    id: '1',
    title: 'John Deere 6130R',
    category: 'Tracteurs',
    subcategory: 'Tracteurs agricoles',
    brand: 'John Deere',
    model: '6130R',
    year: 2019,
    hours: 3200,
    priceHT: 72000,
    priceTTC: 86400,
    condition: 'Excellent',
    location: 'Chartres',
    department: 'Eure-et-Loir (28)',
    description: 'Tracteur John Deere 6130R en excellent état. Équipé de la transmission AutoQuad Plus, climatisation, chargeur frontal. Entretien suivi chez concessionnaire agréé. Pneus avant 80%, arrière 70%.',
    images: [
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800',
      'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?w=800'
    ],
    featured: true,
    createdAt: '2024-01-10',
    seller: {
      name: 'Agri-Services Centre',
      phone: '02 37 XX XX XX',
      email: 'contact@agri-services.fr'
    }
  },
  {
    id: '2',
    title: 'Massey Ferguson 7720S',
    category: 'Tracteurs',
    subcategory: 'Tracteurs agricoles',
    brand: 'Massey Ferguson',
    model: '7720S',
    year: 2020,
    hours: 2100,
    priceHT: 95000,
    priceTTC: 114000,
    condition: 'Excellent',
    location: 'Reims',
    department: 'Marne (51)',
    description: 'Massey Ferguson 7720S Dyna-VT, 200 CV, suspension de cabine, GPS TrimblePilot. Climatisation automatique, siège pneumatique. Toutes révisions effectuées.',
    images: [
      'https://images.unsplash.com/photo-1605338803712-33c86739831c?w=800'
    ],
    featured: true,
    createdAt: '2024-01-08',
    seller: {
      name: 'Marne Agri',
      phone: '03 26 XX XX XX',
      email: 'ventes@marne-agri.fr'
    }
  },
  {
    id: '3',
    title: 'Claas Lexion 770',
    category: 'Matériel de récolte',
    subcategory: 'Moissonneuses-batteuses',
    brand: 'Claas',
    model: 'Lexion 770',
    year: 2018,
    hours: 1850,
    priceHT: 185000,
    priceTTC: 222000,
    condition: 'Très bon',
    location: 'Amiens',
    department: 'Somme (80)',
    description: 'Moissonneuse Claas Lexion 770 Terra Trac. Coupe Vario 9m, broyeur, GPS Pilot. Excellent état mécanique, prête pour la moisson.',
    images: [
      'https://images.unsplash.com/photo-1591086326789-1f7e33291a9c?w=800'
    ],
    featured: true,
    createdAt: '2024-01-05',
    seller: {
      name: 'Nord Machines Agricoles',
      phone: '03 22 XX XX XX',
      email: 'contact@nma.fr'
    }
  },
  {
    id: '4',
    title: 'Manitou MLT 840',
    category: 'Manutention',
    subcategory: 'Chargeurs télescopiques',
    brand: 'Manitou',
    model: 'MLT 840-137 PS',
    year: 2017,
    hours: 4500,
    priceHT: 45000,
    priceTTC: 54000,
    condition: 'Bon',
    location: 'Le Mans',
    department: 'Sarthe (72)',
    description: 'Chariot télescopique Manitou MLT 840. Hauteur de levée 8m, capacité 4T. Fourches, godet multifonction. Entretien régulier.',
    images: [
      'https://images.unsplash.com/photo-1580901368919-7738efb0f87e?w=800'
    ],
    featured: false,
    createdAt: '2024-01-12',
    seller: {
      name: 'Ouest TP Services',
      phone: '02 43 XX XX XX',
      email: 'info@ouest-tp.fr'
    }
  },
  {
    id: '5',
    title: 'Kuhn Vari-Master 183',
    category: 'Travail du sol',
    subcategory: 'Charrues',
    brand: 'Kuhn',
    model: 'Vari-Master 183',
    year: 2021,
    priceHT: 28000,
    priceTTC: 33600,
    condition: 'Excellent',
    location: 'Orléans',
    department: 'Loiret (45)',
    description: 'Charrue Kuhn Vari-Master 183, 6 corps. Sécurité Non-Stop hydraulique, rasettes. Très peu utilisée, état neuf.',
    images: [
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800'
    ],
    featured: false,
    createdAt: '2024-01-11',
    seller: {
      name: 'Centre Agri Matériel',
      phone: '02 38 XX XX XX',
      email: 'ventes@cam45.fr'
    }
  },
  {
    id: '6',
    title: 'New Holland T7.270',
    category: 'Tracteurs',
    subcategory: 'Tracteurs agricoles',
    brand: 'New Holland',
    model: 'T7.270 AutoCommand',
    year: 2018,
    hours: 4200,
    priceHT: 82000,
    priceTTC: 98400,
    condition: 'Très bon',
    location: 'Lille',
    department: 'Nord (59)',
    description: 'New Holland T7.270 AutoCommand, 270 CV. Pont avant suspendu, relevage avant, PDF avant. Climatisation, GPS IntelliView.',
    images: [
      'https://images.unsplash.com/photo-1589923188651-268a9765e432?w=800'
    ],
    featured: true,
    createdAt: '2024-01-09',
    seller: {
      name: 'Flandres Agri',
      phone: '03 20 XX XX XX',
      email: 'commercial@flandres-agri.fr'
    }
  },
  {
    id: '7',
    title: 'Krone BiG Pack 1290',
    category: 'Matériel de récolte',
    subcategory: 'Presses à balles',
    brand: 'Krone',
    model: 'BiG Pack 1290 HDP II',
    year: 2019,
    priceHT: 75000,
    priceTTC: 90000,
    condition: 'Très bon',
    location: 'Tours',
    department: 'Indre-et-Loire (37)',
    description: 'Presse haute densité Krone BiG Pack 1290. Liage film + ficelle, coupe 26 couteaux. 18000 balles compteur.',
    images: [
      'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800'
    ],
    featured: false,
    createdAt: '2024-01-07',
    seller: {
      name: 'Val de Loire Agri',
      phone: '02 47 XX XX XX',
      email: 'contact@vdl-agri.fr'
    }
  },
  {
    id: '8',
    title: 'Fendt 724 Vario',
    category: 'Tracteurs',
    subcategory: 'Tracteurs agricoles',
    brand: 'Fendt',
    model: '724 Vario S4 Profi Plus',
    year: 2021,
    hours: 1800,
    priceHT: 135000,
    priceTTC: 162000,
    condition: 'Excellent',
    location: 'Troyes',
    department: 'Aube (10)',
    description: 'Fendt 724 Vario dernière génération. VarioGuide RTK, VarioDoc, pneus Michelin AxioBib. Garantie constructeur jusqu\'en 2025.',
    images: [
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800'
    ],
    featured: true,
    createdAt: '2024-01-06',
    seller: {
      name: 'Champagne Agri Service',
      phone: '03 25 XX XX XX',
      email: 'info@champagne-agri.fr'
    }
  }
];

export const getProductsByCategory = (categorySlug: string): Product[] => {
  const category = categories.find(c => c.slug === categorySlug);
  if (!category) return [];
  return products.filter(p => p.category === category.name);
};

export const getFeaturedProducts = (): Product[] => {
  return products.filter(p => p.featured);
};

export const getRecentProducts = (limit: number = 4): Product[] => {
  return [...products]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
};

export const getProductById = (id: string): Product | undefined => {
  return products.find(p => p.id === id);
};

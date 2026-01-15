import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, Languages, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

import BrandCombobox from '@/components/admin/BrandCombobox';
import ImageUploader from '@/components/admin/ImageUploader';
import type { Tables } from '@/integrations/supabase/types';

type Category = Tables<'categories'>;

const productSchema = z.object({
  title: z.string().trim().min(3, 'Le titre doit contenir au moins 3 caractères').max(200, 'Titre trop long'),
  description: z.string().max(5000, 'Description trop longue').optional(),
  title_translations: z.record(z.string()).optional(),
  description_translations: z.record(z.string()).optional(),
  price: z.number().min(0, 'Le prix doit être positif').max(999999999, 'Prix trop élevé'),
  category: z.string().min(1, 'Sélectionnez une catégorie'),
  subcategory: z.string().optional(),
  brand: z.string().max(100, 'Marque trop longue').optional(),
  model: z.string().max(100, 'Modèle trop long').optional(),
  year: z.number().min(1900).max(new Date().getFullYear() + 1).optional().nullable(),
  hours: z.number().min(0).max(999999).optional().nullable(),
  kilometers: z.number().min(0).max(9999999).optional().nullable(),
  condition: z.enum(['new', 'used', 'refurbished']),
  price_type: z.enum(['fixed', 'negotiable', 'on_request']),
  status: z.enum(['active', 'draft', 'sold']),
  location: z.string().max(200, 'Localisation trop longue').optional(),
  department: z.string().max(100, 'Département trop long').optional(),
  seller_name: z.string().max(100, 'Nom trop long').optional(),
  seller_phone: z.string().max(20, 'Numéro trop long').optional(),
  seller_email: z.string().email('Email invalide').max(255, 'Email trop long').optional().or(z.literal('')),
  featured: z.boolean(),
  images: z.array(z.string()).default([]),
  customer_images: z.array(z.string()).default([]),
  stock: z.number().min(0, 'Le stock doit être positif').optional().nullable(),
  low_stock_threshold: z.number().min(1, 'Le seuil doit être supérieur à 0').optional().nullable(),
});

const SUPPORTED_LANGUAGES = ['en', 'de', 'es', 'it', 'pt'] as const;
const LANGUAGE_LABELS: Record<string, string> = {
  en: '🇬🇧 Anglais',
  de: '🇩🇪 Allemand',
  es: '🇪🇸 Espagnol',
  it: '🇮🇹 Italien',
  pt: '🇵🇹 Portugais',
};

type ProductFormData = z.infer<typeof productSchema>;

const defaultFormData: ProductFormData = {
  title: '',
  description: '',
  title_translations: {},
  description_translations: {},
  price: 0,
  category: '',
  subcategory: '',
  brand: '',
  model: '',
  year: null,
  hours: null,
  kilometers: null,
  condition: 'used',
  price_type: 'negotiable',
  status: 'draft',
  location: '',
  department: '',
  seller_name: '',
  seller_phone: '',
  seller_email: '',
  featured: false,
  images: [],
  customer_images: [],
  stock: null,
  low_stock_threshold: 5,
};

const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState<ProductFormData>(defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isFetching, setIsFetching] = useState(!!id);
  const [showTranslations, setShowTranslations] = useState(false);

  const isEditing = !!id;

  // Fetch categories from database
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data as Category[];
    },
  });

  // Get parent categories (no parent_id)
  const parentCategories = categories.filter(c => !c.parent_id);
  
  // Get subcategories for selected category
  const selectedCategory = categories.find(c => c.slug === formData.category);
  const subcategories = selectedCategory 
    ? categories.filter(c => c.parent_id === selectedCategory.id)
    : [];

  // Get category for brand filtering
  const selectedCategoryForBrands = categories.find(c => c.slug === formData.category);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        const titleTranslations = (data.title_translations as Record<string, string>) || {};
        const descriptionTranslations = (data.description_translations as Record<string, string>) || {};
        
        setFormData({
          title: data.title || '',
          description: data.description || '',
          title_translations: titleTranslations,
          description_translations: descriptionTranslations,
          price: data.price || 0,
          category: data.category || '',
          subcategory: data.subcategory || '',
          brand: data.brand || '',
          model: data.model || '',
          year: data.year || null,
          hours: data.hours || null,
          kilometers: data.kilometers || null,
          condition: (data.condition as 'new' | 'used' | 'refurbished') || 'used',
          price_type: (data.price_type as 'fixed' | 'negotiable' | 'on_request') || 'negotiable',
          status: (data.status as 'active' | 'draft' | 'sold') || 'draft',
          location: data.location || '',
          department: data.department || '',
          seller_name: data.seller_name || '',
          seller_phone: data.seller_phone || '',
          seller_email: data.seller_email || '',
          featured: data.featured || false,
          images: data.images || [],
          customer_images: (data as any).customer_images || [],
          stock: data.stock ?? null,
          low_stock_threshold: data.low_stock_threshold ?? 5,
        });
        
        // Show translations section if there are existing translations
        if (Object.keys(titleTranslations).length > 0 || Object.keys(descriptionTranslations).length > 0) {
          setShowTranslations(true);
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger le produit',
        variant: 'destructive',
      });
      navigate('/admin/products');
    } finally {
      setIsFetching(false);
    }
  };

  const handleChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field changes
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleTranslationChange = (
    type: 'title' | 'description',
    lang: string,
    value: string
  ) => {
    const field = type === 'title' ? 'title_translations' : 'description_translations';
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [lang]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    // Validate
    const validation = productSchema.safeParse(formData);
    if (!validation.success) {
      const newErrors: Record<string, string> = {};
      validation.error.errors.forEach(err => {
        if (err.path[0]) {
          newErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const productData = {
        title: validation.data.title,
        description: validation.data.description || null,
        title_translations: validation.data.title_translations || null,
        description_translations: validation.data.description_translations || null,
        price: validation.data.price,
        price_type: validation.data.price_type,
        category: validation.data.category,
        subcategory: validation.data.subcategory || null,
        brand: validation.data.brand || null,
        model: validation.data.model || null,
        year: validation.data.year,
        hours: validation.data.hours,
        kilometers: validation.data.kilometers,
        condition: validation.data.condition,
        location: validation.data.location || null,
        department: validation.data.department || null,
        seller_name: validation.data.seller_name || null,
        seller_phone: validation.data.seller_phone || null,
        seller_email: validation.data.seller_email || null,
        featured: validation.data.featured,
        status: validation.data.status,
        images: validation.data.images,
        customer_images: validation.data.customer_images,
        created_by: user?.id,
        // Stock only for new items
        stock: validation.data.condition === 'new' ? (validation.data.stock ?? null) : null,
        low_stock_threshold: validation.data.condition === 'new' ? (validation.data.low_stock_threshold ?? 5) : null,
      };

      let productId = id;

      if (isEditing) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', id as string);

        if (error) throw error;
      } else {
        const { data: newProduct, error } = await supabase
          .from('products')
          .insert([productData])
          .select('id')
          .single();

        if (error) throw error;
        productId = newProduct.id;
      }

      // Trigger automatic translation
      if (productId) {
        setIsTranslating(true);
        try {
          const { error: translateError } = await supabase.functions.invoke('translate-product', {
            body: {
              productId,
              title: validation.data.title,
              description: validation.data.description || '',
              sourceLang: 'fr',
            },
          });

          if (translateError) {
            console.error('Translation error:', translateError);
            toast({
              title: 'Avertissement',
              description: 'Produit sauvegardé, mais la traduction automatique a échoué. Vous pouvez réessayer plus tard.',
              variant: 'default',
            });
          } else {
            toast({
              title: 'Succès',
              description: isEditing 
                ? 'Produit mis à jour et traduit avec succès' 
                : 'Produit créé et traduit avec succès',
            });
          }
        } catch (translateErr) {
          console.error('Translation error:', translateErr);
          toast({
            title: 'Succès',
            description: isEditing 
              ? 'Produit mis à jour (traduction en cours...)' 
              : 'Produit créé (traduction en cours...)',
          });
        } finally {
          setIsTranslating(false);
        }
      }

      navigate('/admin/products');
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de sauvegarder le produit',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Manual translation trigger for existing products
  const handleManualTranslate = async () => {
    if (!id) return;
    
    setIsTranslating(true);
    try {
      const { error } = await supabase.functions.invoke('translate-product', {
        body: {
          productId: id,
          title: formData.title,
          description: formData.description || '',
          sourceLang: 'fr',
        },
      });

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Traductions générées avec succès',
      });
    } catch (err: any) {
      console.error('Translation error:', err);
      toast({
        title: 'Erreur',
        description: err.message || 'Impossible de générer les traductions',
        variant: 'destructive',
      });
    } finally {
      setIsTranslating(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/products')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-display font-bold">
            {isEditing ? 'Modifier le produit' : 'Nouveau produit'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Modifiez les informations du produit' : 'Ajoutez un nouveau produit au catalogue'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Main Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
              <CardDescription>Les informations principales du produit</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Ex: Tracteur John Deere 6130R"
                  className={errors.title ? 'border-destructive' : ''}
                />
                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Français)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Décrivez le produit en détail..."
                  rows={5}
                />
              </div>

              {/* Toggle translations section */}
              <div className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTranslations(!showTranslations)}
                  className="gap-2"
                >
                  <Languages className="h-4 w-4" />
                  {showTranslations ? 'Masquer les traductions' : 'Ajouter des traductions manuelles'}
                </Button>
              </div>

              {/* Manual translations section */}
              {showTranslations && (
                <div className="space-y-4 p-4 border border-border rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Languages className="h-4 w-4" />
                    <span>Traductions manuelles (optionnel - prioritaires sur l'IA)</span>
                  </div>
                  
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <div key={lang} className="space-y-3 p-3 border border-border rounded bg-card">
                      <p className="text-sm font-medium">{LANGUAGE_LABELS[lang]}</p>
                      <div className="space-y-2">
                        <Input
                          placeholder={`Titre en ${LANGUAGE_LABELS[lang].split(' ')[1]}`}
                          value={formData.title_translations?.[lang] || ''}
                          onChange={(e) => handleTranslationChange('title', lang, e.target.value)}
                        />
                        <Textarea
                          placeholder={`Description en ${LANGUAGE_LABELS[lang].split(' ')[1]}`}
                          value={formData.description_translations?.[lang] || ''}
                          onChange={(e) => handleTranslationChange('description', lang, e.target.value)}
                          rows={3}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price">Prix (€) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                    min={0}
                    className={errors.price ? 'border-destructive' : ''}
                  />
                  {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price_type">Type de prix</Label>
                  <Select value={formData.price_type} onValueChange={(v) => handleChange('price_type', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Prix fixe</SelectItem>
                      <SelectItem value="negotiable">Négociable</SelectItem>
                      <SelectItem value="on_request">Sur demande</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Catégorie *</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(v) => {
                      handleChange('category', v);
                      handleChange('subcategory', '');
                    }}
                  >
                    <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {parentCategories.map((cat) => (
                        <SelectItem key={cat.slug} value={cat.slug}>
                          {cat.icon && `${cat.icon} `}{cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subcategory">Sous-catégorie</Label>
                  <Select 
                    value={formData.subcategory || 'none'} 
                    onValueChange={(v) => handleChange('subcategory', v === 'none' ? '' : v)}
                    disabled={subcategories.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucune</SelectItem>
                      {subcategories.map((sub) => (
                        <SelectItem key={sub.slug} value={sub.slug}>
                          {sub.icon && `${sub.icon} `}{sub.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>Détails techniques</CardTitle>
              <CardDescription>Caractéristiques du matériel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="brand">Marque</Label>
                  <BrandCombobox
                    value={formData.brand || ''}
                    onChange={(v) => handleChange('brand', v)}
                    categoryId={selectedCategoryForBrands?.id}
                    placeholder="Rechercher ou saisir une marque..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">Modèle</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => handleChange('model', e.target.value)}
                    placeholder="Ex: 6130R"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="year">Année</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year || ''}
                    onChange={(e) => handleChange('year', e.target.value ? parseInt(e.target.value) : null)}
                    min={1900}
                    max={new Date().getFullYear() + 1}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hours">Heures</Label>
                  <Input
                    id="hours"
                    type="number"
                    value={formData.hours || ''}
                    onChange={(e) => handleChange('hours', e.target.value ? parseInt(e.target.value) : null)}
                    min={0}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kilometers">Kilomètres</Label>
                  <Input
                    id="kilometers"
                    type="number"
                    value={formData.kilometers || ''}
                    onChange={(e) => handleChange('kilometers', e.target.value ? parseInt(e.target.value) : null)}
                    min={0}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">État</Label>
                <Select value={formData.condition} onValueChange={(v) => {
                  handleChange('condition', v);
                  // Reset stock when changing from new to other conditions
                  if (v !== 'new') {
                    handleChange('stock', null);
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Neuf</SelectItem>
                    <SelectItem value="used">Occasion</SelectItem>
                    <SelectItem value="refurbished">Reconditionné</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Stock fields - only visible for new items */}
              {formData.condition === 'new' && (
                <div className="grid gap-4 sm:grid-cols-2 p-4 border border-border rounded-lg bg-secondary/30">
                  <div className="sm:col-span-2">
                    <p className="text-sm font-medium text-muted-foreground mb-3">
                      📦 Gestion du stock (articles neufs uniquement)
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock">Quantité en stock</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock ?? ''}
                      onChange={(e) => handleChange('stock', e.target.value ? parseInt(e.target.value) : null)}
                      min={0}
                      placeholder="Ex: 10"
                    />
                    <p className="text-xs text-muted-foreground">
                      Laissez vide si non applicable
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="low_stock_threshold">Seuil d'alerte stock bas</Label>
                    <Input
                      id="low_stock_threshold"
                      type="number"
                      value={formData.low_stock_threshold ?? 5}
                      onChange={(e) => handleChange('low_stock_threshold', e.target.value ? parseInt(e.target.value) : 5)}
                      min={1}
                      placeholder="Ex: 5"
                    />
                    <p className="text-xs text-muted-foreground">
                      Alerte si stock ≤ ce seuil
                    </p>
                  </div>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="location">Localisation</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    placeholder="Ex: Toulouse"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Département</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => handleChange('department', e.target.value)}
                    placeholder="Ex: Haute-Garonne (31)"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Photos du produit</CardTitle>
              <CardDescription>Ajoutez jusqu'à 20 photos. La première image sera l'image principale.</CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUploader
                images={formData.images}
                onImagesChange={(images) => handleChange('images', images)}
                maxImages={20}
              />
            </CardContent>
          </Card>

          {/* Customer Images */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>📸 Photos clients</CardTitle>
              <CardDescription>Photos montrant le produit en utilisation chez les clients (visible sur la fiche produit)</CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUploader
                images={formData.customer_images}
                onImagesChange={(images) => handleChange('customer_images', images)}
                maxImages={10}
              />
            </CardContent>
          </Card>

          {/* Seller Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informations vendeur</CardTitle>
              <CardDescription>Coordonnées du vendeur</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seller_name">Nom du vendeur</Label>
                <Input
                  id="seller_name"
                  value={formData.seller_name}
                  onChange={(e) => handleChange('seller_name', e.target.value)}
                  placeholder="Ex: Jean Dupont"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="seller_phone">Téléphone</Label>
                  <Input
                    id="seller_phone"
                    value={formData.seller_phone}
                    onChange={(e) => handleChange('seller_phone', e.target.value)}
                    placeholder="Ex: 06 12 34 56 78"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seller_email">Email</Label>
                  <Input
                    id="seller_email"
                    type="email"
                    value={formData.seller_email}
                    onChange={(e) => handleChange('seller_email', e.target.value)}
                    placeholder="Ex: contact@example.com"
                    className={errors.seller_email ? 'border-destructive' : ''}
                  />
                  {errors.seller_email && <p className="text-sm text-destructive">{errors.seller_email}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Publication</CardTitle>
              <CardDescription>Statut et visibilité du produit</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Statut</Label>
                <Select value={formData.status} onValueChange={(v) => handleChange('status', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="active">Actif (visible)</SelectItem>
                    <SelectItem value="sold">Vendu</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="featured">Mise en avant</Label>
                  <p className="text-sm text-muted-foreground">Afficher ce produit en vedette</p>
                </div>
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(v) => handleChange('featured', v)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/products')}>
            Annuler
          </Button>
          {isEditing && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleManualTranslate}
              disabled={isTranslating || isLoading}
            >
              {isTranslating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Languages className="h-4 w-4 mr-2" />
              )}
              {isTranslating ? 'Traduction...' : 'Régénérer les traductions'}
            </Button>
          )}
          <Button type="submit" disabled={isLoading || isTranslating}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Enregistrement...' : isTranslating ? 'Traduction...' : isEditing ? 'Mettre à jour' : 'Créer le produit'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminProductForm;

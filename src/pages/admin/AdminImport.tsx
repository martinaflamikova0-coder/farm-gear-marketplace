import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useCategories } from '@/hooks/useCategories';
import { 
  Globe, 
  Search, 
  Download, 
  Sparkles, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  ImageIcon,
  FileText,
  Package,
  Trash2
} from 'lucide-react';

interface ScrapedProduct {
  title: string;
  price: number;
  description: string;
  images: string[];
  category: string;
  brand: string;
  specifications: string[];
  sourceUrl: string;
}

interface GeneratedContent {
  title: string;
  description: string;
  title_translations: Record<string, string>;
  description_translations: Record<string, string>;
}

interface ImportItem {
  id: string;
  url: string;
  status: 'pending' | 'scraping' | 'scraped' | 'generating' | 'ready' | 'imported' | 'error';
  product?: ScrapedProduct;
  generatedContent?: GeneratedContent;
  error?: string;
  selected: boolean;
}

const AdminImport = () => {
  const { toast } = useToast();
  const { data: categories = [] } = useCategories();
  
  // Single product scraping
  const [singleUrl, setSingleUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [scrapedProduct, setScrapedProduct] = useState<ScrapedProduct | null>(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Batch scraping
  const [categoryUrl, setCategoryUrl] = useState('');
  const [isMapping, setIsMapping] = useState(false);
  const [importItems, setImportItems] = useState<ImportItem[]>([]);
  const [batchProgress, setBatchProgress] = useState(0);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);

  // Scrape single product
  const scrapeSingleProduct = async () => {
    if (!singleUrl.trim()) {
      toast({ title: "Erreur", description: "Veuillez entrer une URL", variant: "destructive" });
      return;
    }

    setIsScraping(true);
    setScrapedProduct(null);
    setGeneratedContent(null);

    try {
      const { data, error } = await supabase.functions.invoke('scrape-product', {
        body: { url: singleUrl }
      });

      if (error) throw error;

      if (data.success && data.product) {
        setScrapedProduct(data.product);
        toast({ title: "Succès", description: `Produit scrapé: ${data.product.title}` });
      } else {
        throw new Error(data.error || "Échec du scraping");
      }
    } catch (error) {
      console.error('Scraping error:', error);
      toast({
        title: "Erreur de scraping",
        description: error instanceof Error ? error.message : "Impossible de scraper le produit",
        variant: "destructive"
      });
    } finally {
      setIsScraping(false);
    }
  };

  // Generate AI content for single product
  const generateContent = async () => {
    if (!scrapedProduct) return;

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-product-content', {
        body: { 
          product: scrapedProduct,
          sourceLang: 'de' // Source is German
        }
      });

      if (error) throw error;

      if (data.success && data.content) {
        setGeneratedContent(data.content);
        toast({ title: "Contenu généré", description: "Titres et descriptions créés avec l'IA" });
      } else {
        throw new Error(data.error || "Échec de la génération");
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Erreur de génération",
        description: error instanceof Error ? error.message : "Impossible de générer le contenu",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Import single product to database
  const importSingleProduct = async () => {
    if (!scrapedProduct) return;

    const content = generatedContent || {
      title: scrapedProduct.title,
      description: scrapedProduct.description,
      title_translations: { de: scrapedProduct.title },
      description_translations: { de: scrapedProduct.description }
    };

    try {
      const { error } = await supabase.from('products').insert({
        title: content.title,
        description: content.description,
        title_translations: content.title_translations,
        description_translations: content.description_translations,
        price: scrapedProduct.price,
        category: selectedCategory || scrapedProduct.category,
        brand: scrapedProduct.brand,
        images: scrapedProduct.images,
        status: 'active',
        stock: 5,
        condition: 'new'
      });

      if (error) throw error;

      toast({ title: "Produit importé", description: "Le produit a été ajouté à votre catalogue" });
      setScrapedProduct(null);
      setGeneratedContent(null);
      setSingleUrl('');
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Erreur d'import",
        description: error instanceof Error ? error.message : "Impossible d'importer le produit",
        variant: "destructive"
      });
    }
  };

  // Map category to find all product URLs
  const mapCategory = async () => {
    if (!categoryUrl.trim()) {
      toast({ title: "Erreur", description: "Veuillez entrer une URL de catégorie", variant: "destructive" });
      return;
    }

    setIsMapping(true);
    setImportItems([]);

    try {
      const { data, error } = await supabase.functions.invoke('scrape-category', {
        body: { url: categoryUrl, limit: 100 }
      });

      if (error) throw error;

      if (data.success && data.productUrls) {
        const items: ImportItem[] = data.productUrls.map((url: string, index: number) => ({
          id: `item-${index}`,
          url,
          status: 'pending' as const,
          selected: true
        }));
        setImportItems(items);
        toast({ 
          title: "Catégorie mappée", 
          description: `${data.productUrls.length} produits trouvés` 
        });
      } else {
        throw new Error(data.error || "Échec du mapping");
      }
    } catch (error) {
      console.error('Mapping error:', error);
      toast({
        title: "Erreur de mapping",
        description: error instanceof Error ? error.message : "Impossible de mapper la catégorie",
        variant: "destructive"
      });
    } finally {
      setIsMapping(false);
    }
  };

  // Toggle item selection
  const toggleItemSelection = (id: string) => {
    setImportItems(items => 
      items.map(item => 
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  // Select/deselect all
  const toggleSelectAll = () => {
    const allSelected = importItems.every(item => item.selected);
    setImportItems(items => items.map(item => ({ ...item, selected: !allSelected })));
  };

  // Remove item
  const removeItem = (id: string) => {
    setImportItems(items => items.filter(item => item.id !== id));
  };

  // Process batch - scrape and generate for all selected items
  const processBatch = async () => {
    const selectedItems = importItems.filter(item => item.selected && item.status === 'pending');
    if (selectedItems.length === 0) {
      toast({ title: "Aucun produit", description: "Sélectionnez des produits à traiter", variant: "destructive" });
      return;
    }

    setIsBatchProcessing(true);
    setBatchProgress(0);

    for (let i = 0; i < selectedItems.length; i++) {
      const item = selectedItems[i];
      
      // Update status to scraping
      setImportItems(items => 
        items.map(it => it.id === item.id ? { ...it, status: 'scraping' as const } : it)
      );

      try {
        // Scrape product
        const { data: scrapeData, error: scrapeError } = await supabase.functions.invoke('scrape-product', {
          body: { url: item.url }
        });

        if (scrapeError || !scrapeData.success) {
          throw new Error(scrapeData?.error || "Scraping failed");
        }

        // Update with scraped data
        setImportItems(items => 
          items.map(it => it.id === item.id ? { 
            ...it, 
            status: 'generating' as const, 
            product: scrapeData.product 
          } : it)
        );

        // Generate AI content
        const { data: genData, error: genError } = await supabase.functions.invoke('generate-product-content', {
          body: { product: scrapeData.product, sourceLang: 'de' }
        });

        if (genError || !genData.success) {
          throw new Error(genData?.error || "Generation failed");
        }

        // Update with generated content
        setImportItems(items => 
          items.map(it => it.id === item.id ? { 
            ...it, 
            status: 'ready' as const, 
            generatedContent: genData.content 
          } : it)
        );

      } catch (error) {
        console.error(`Error processing ${item.url}:`, error);
        setImportItems(items => 
          items.map(it => it.id === item.id ? { 
            ...it, 
            status: 'error' as const, 
            error: error instanceof Error ? error.message : "Unknown error"
          } : it)
        );
      }

      setBatchProgress(((i + 1) / selectedItems.length) * 100);
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    setIsBatchProcessing(false);
    toast({ title: "Traitement terminé", description: "Vérifiez les résultats ci-dessous" });
  };

  // Check for existing product duplicates
  const checkForDuplicates = async (title: string, price: number): Promise<boolean> => {
    // Normalize title for comparison
    const normalizedTitle = title.toLowerCase().trim().substring(0, 50);
    
    const { data } = await supabase
      .from('products')
      .select('id, title')
      .ilike('title', `%${normalizedTitle.substring(0, 30)}%`)
      .eq('price', price)
      .limit(1);
    
    return (data && data.length > 0);
  };

  // Import all ready items with deduplication
  const importReadyItems = async () => {
    const readyItems = importItems.filter(item => item.status === 'ready' && item.selected);
    if (readyItems.length === 0) {
      toast({ title: "Aucun produit prêt", description: "Traitez d'abord les produits", variant: "destructive" });
      return;
    }

    let successCount = 0;
    let errorCount = 0;
    let duplicateCount = 0;
    const importedTitles = new Set<string>(); // Track titles in this batch

    for (const item of readyItems) {
      try {
        const content = item.generatedContent!;
        const product = item.product!;
        
        // Create a unique key for deduplication
        const dedupeKey = `${content.title.toLowerCase().trim()}_${product.price}`;
        
        // Check if already imported in this batch
        if (importedTitles.has(dedupeKey)) {
          console.log(`Skipping duplicate in batch: ${content.title}`);
          setImportItems(items => 
            items.map(it => it.id === item.id ? { 
              ...it, 
              status: 'error' as const, 
              error: 'Doublon dans ce lot' 
            } : it)
          );
          duplicateCount++;
          continue;
        }
        
        // Check if already exists in database
        const isDuplicate = await checkForDuplicates(content.title, product.price);
        if (isDuplicate) {
          console.log(`Skipping existing product: ${content.title}`);
          setImportItems(items => 
            items.map(it => it.id === item.id ? { 
              ...it, 
              status: 'error' as const, 
              error: 'Existe déjà en base' 
            } : it)
          );
          duplicateCount++;
          continue;
        }

        const { error } = await supabase.from('products').insert({
          title: content.title,
          description: content.description,
          title_translations: content.title_translations,
          description_translations: content.description_translations,
          price: product.price,
          category: selectedCategory || product.category,
          brand: product.brand,
          images: product.images,
          status: 'active',
          stock: 5,
          condition: 'new'
        });

        if (error) throw error;

        // Mark as imported and track for deduplication
        importedTitles.add(dedupeKey);
        setImportItems(items => 
          items.map(it => it.id === item.id ? { ...it, status: 'imported' as const } : it)
        );
        successCount++;
      } catch (error) {
        console.error(`Error importing ${item.url}:`, error);
        setImportItems(items => 
          items.map(it => it.id === item.id ? { 
            ...it, 
            status: 'error' as const, 
            error: error instanceof Error ? error.message : 'Erreur d\'import' 
          } : it)
        );
        errorCount++;
      }
    }

    const message = duplicateCount > 0 
      ? `${successCount} importés, ${duplicateCount} doublons ignorés, ${errorCount} erreurs`
      : `${successCount} importés, ${errorCount} erreurs`;
    
    toast({ 
      title: "Import terminé", 
      description: message
    });
  };

  const getStatusBadge = (status: ImportItem['status']) => {
    switch (status) {
      case 'pending': return <Badge variant="secondary">En attente</Badge>;
      case 'scraping': return <Badge variant="outline" className="animate-pulse">Scraping...</Badge>;
      case 'scraped': return <Badge>Scrapé</Badge>;
      case 'generating': return <Badge variant="outline" className="animate-pulse">Génération IA...</Badge>;
      case 'ready': return <Badge variant="default">Prêt</Badge>;
      case 'imported': return <Badge variant="secondary">Importé</Badge>;
      case 'error': return <Badge variant="destructive">Erreur</Badge>;
    }
  };

  return (
    <div className="space-y-6 w-full overflow-x-hidden">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Import de produits</h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          Scrapez des produits depuis werkzeug-und-maschinen.com et générez du contenu avec l'IA
        </p>
      </div>

      <Tabs defaultValue="single" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="single" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Produit unique</span>
            <span className="sm:hidden">Unique</span>
          </TabsTrigger>
          <TabsTrigger value="batch" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">Import en masse</span>
            <span className="sm:hidden">Masse</span>
          </TabsTrigger>
        </TabsList>

        {/* Single Product Tab */}
        <TabsContent value="single" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Scraper un produit
              </CardTitle>
              <CardDescription>
                Entrez l'URL d'un produit pour extraire ses informations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="https://werkzeug-und-maschinen.com/product/..."
                  value={singleUrl}
                  onChange={(e) => setSingleUrl(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={scrapeSingleProduct} disabled={isScraping}>
                  {isScraping ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                  Scraper
                </Button>
              </div>
            </CardContent>
          </Card>

          {scrapedProduct && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Données extraites
                  </span>
                  <Button 
                    onClick={generateContent} 
                    disabled={isGenerating}
                    variant="outline"
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-2" />
                    )}
                    Générer avec IA
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Titre original</label>
                    <Input value={scrapedProduct.title} readOnly className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Prix</label>
                    <Input value={`${scrapedProduct.price}€`} readOnly className="mt-1" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Marque détectée</label>
                    <Input value={scrapedProduct.brand || "Non détectée"} readOnly className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Catégorie cible</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Description originale</label>
                  <Textarea 
                    value={scrapedProduct.description || scrapedProduct.specifications?.join('\n')} 
                    readOnly 
                    className="mt-1 h-24"
                  />
                </div>

                {scrapedProduct.images.length > 0 && (
                  <div>
                    <label className="text-sm font-medium flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Images ({scrapedProduct.images.length})
                    </label>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {scrapedProduct.images.slice(0, 6).map((img, idx) => (
                        <img 
                          key={idx} 
                          src={img} 
                          alt={`Product ${idx + 1}`}
                          className="w-20 h-20 object-cover rounded border"
                          onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                      ))}
                      {scrapedProduct.images.length > 6 && (
                        <div className="w-20 h-20 bg-muted rounded border flex items-center justify-center text-sm">
                          +{scrapedProduct.images.length - 6}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {generatedContent && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Sparkles className="h-5 w-5" />
                  Contenu généré par IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Titre optimisé (DE)</label>
                  <Input value={generatedContent.title} readOnly className="mt-1" />
                </div>

                <div>
                  <label className="text-sm font-medium">Description (DE)</label>
                  <Textarea value={generatedContent.description} readOnly className="mt-1 h-24" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {Object.entries(generatedContent.title_translations)
                    .filter(([lang]) => lang !== 'de')
                    .map(([lang, title]) => (
                      <div key={lang} className="text-sm">
                        <Badge variant="outline" className="mb-1">{lang.toUpperCase()}</Badge>
                        <p className="text-muted-foreground truncate">{String(title)}</p>
                      </div>
                    ))}
                </div>

                <Button onClick={importSingleProduct} className="w-full">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Importer ce produit
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Batch Import Tab */}
        <TabsContent value="batch" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Scanner une catégorie
              </CardTitle>
              <CardDescription>
                Entrez l'URL d'une catégorie pour découvrir tous les produits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="https://werkzeug-und-maschinen.com/product-category/..."
                  value={categoryUrl}
                  onChange={(e) => setCategoryUrl(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={mapCategory} disabled={isMapping}>
                  {isMapping ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                  Scanner
                </Button>
              </div>

              <div className="flex gap-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Catégorie cible pour l'import" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {importItems.length > 0 && (
            <Card className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex flex-col gap-3">
                  <CardTitle>{importItems.length} produits trouvés</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={toggleSelectAll}>
                      {importItems.every(i => i.selected) ? 'Désélectionner' : 'Tout sélectionner'}
                    </Button>
                    <Button 
                      onClick={processBatch} 
                      disabled={isBatchProcessing}
                      size="sm"
                    >
                      {isBatchProcessing ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Sparkles className="h-4 w-4 mr-2" />
                      )}
                      <span className="hidden sm:inline">Traiter sélectionnés</span>
                      <span className="sm:hidden">Traiter</span>
                    </Button>
                    <Button 
                      onClick={importReadyItems}
                      size="sm"
                      variant="default"
                      disabled={!importItems.some(i => i.status === 'ready' && i.selected)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Importer prêts</span>
                      <span className="sm:hidden">Importer</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isBatchProcessing && (
                  <div className="mb-4">
                    <Progress value={batchProgress} className="h-2" />
                    <p className="text-sm text-muted-foreground mt-1">
                      Traitement en cours... {Math.round(batchProgress)}%
                    </p>
                  </div>
                )}

                <ScrollArea className="h-[400px]">
                  <div className="space-y-2 pr-2">
                    {importItems.map(item => (
                      <div 
                        key={item.id} 
                        className={`flex items-start sm:items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border ${
                          item.status === 'error' ? 'border-destructive/30 bg-destructive/10' :
                          item.status === 'imported' ? 'border-primary/30 bg-primary/10' :
                          item.status === 'ready' ? 'border-accent/30 bg-accent/10' :
                          'border-border'
                        }`}
                      >
                        <Checkbox 
                          checked={item.selected}
                          onCheckedChange={() => toggleItemSelection(item.id)}
                          disabled={item.status === 'imported'}
                          className="mt-1 sm:mt-0"
                        />
                        
                        {item.product?.images?.[0] ? (
                          <img 
                            src={item.product.images[0]} 
                            alt="" 
                            className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded flex-shrink-0"
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                          />
                        ) : (
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-muted rounded flex items-center justify-center flex-shrink-0">
                            <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0 overflow-hidden">
                          <p className="font-medium text-sm sm:text-base truncate">
                            {item.generatedContent?.title || item.product?.title || item.url.split('/').pop()}
                          </p>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">
                            {item.product?.price ? `${item.product.price}€` : item.url}
                          </p>
                          {item.error && (
                            <p className="text-xs sm:text-sm text-destructive truncate">{item.error}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                          {getStatusBadge(item.status)}
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => removeItem(item.id)}
                            disabled={isBatchProcessing}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminImport;

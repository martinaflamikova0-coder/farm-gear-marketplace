import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, MapPin, Clock, Calendar, Phone, Mail, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/SEOHead';
import ProductJsonLd from '@/components/ProductJsonLd';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useProductById, useRecentProducts } from '@/hooks/useProducts';
import { useTranslatedProduct } from '@/hooks/useTranslatedProduct';
import ProductCard from '@/components/products/ProductCard';
import FinancingSimulator from '@/components/products/FinancingSimulator';
import { getLocalizedSlug, type SupportedLanguage } from '@/i18n';

const AnnonceDetail = () => {
  const { id, lang } = useParams<{ id: string; lang: string }>();
  const { t, i18n } = useTranslation();
  const currentLang = (lang || i18n.language || 'en') as SupportedLanguage;
  const listingsSlug = getLocalizedSlug('listings', currentLang);
  
  const { data: product, isLoading } = useProductById(id);
  const { data: recentProducts = [] } = useRecentProducts(4);
  
  // Get translated content
  const { title: translatedTitle, description: translatedDescription } = useTranslatedProduct(product || null);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const similarProducts = recentProducts.filter(p => p.id !== id);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-background">
          <div className="container-custom py-8">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="aspect-[16/10] w-full rounded-lg" />
                <Skeleton className="h-48 w-full rounded-lg" />
              </div>
              <div className="space-y-6">
                <Skeleton className="h-64 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">😕</div>
            <h1 className="font-display text-2xl font-bold mb-2">{t('errors.notFound')}</h1>
            <p className="text-muted-foreground mb-4">{t('errors.notFoundDesc')}</p>
            <Button asChild>
              <Link to={`/${currentLang}/${listingsSlug}`}>{t('common.viewAll')}</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const formatPrice = (price: number) => {
    const locale = currentLang === 'en' ? 'en-GB' : 
                   currentLang === 'de' ? 'de-DE' : 
                   currentLang === 'es' ? 'es-ES' :
                   currentLang === 'it' ? 'it-IT' :
                   currentLang === 'pt' ? 'pt-PT' : 'fr-FR';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getConditionLabel = (condition: string | null) => {
    if (!condition) return '';
    const labels: Record<string, string> = {
      'new': t('conditions.new'),
      'used': t('conditions.used'),
      'refurbished': t('conditions.refurbished'),
    };
    return labels[condition] || condition;
  };

  const conditionColors: Record<string, string> = {
    'new': 'bg-success text-success-foreground',
    'used': 'bg-primary text-primary-foreground',
    'refurbished': 'bg-warning text-warning-foreground',
  };

  const images = product.images || [];
  const price = Number(product.price) || 0;
  const priceHT = Math.round(price / 1.2);

  const nextImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(t('contact.success'));
  };

  const specifications = [
    { label: t('product.brand'), value: product.brand },
    { label: t('product.model'), value: product.model },
    { label: t('product.year'), value: product.year?.toString() },
    { label: t('product.condition'), value: getConditionLabel(product.condition) },
    ...(product.hours ? [{ label: t('product.hours'), value: `${product.hours.toLocaleString()} h` }] : []),
    ...(product.kilometers ? [{ label: t('product.kilometers'), value: `${product.kilometers.toLocaleString()} km` }] : []),
    { label: t('product.location'), value: product.location },
    { label: 'Département', value: product.department },
  ].filter(spec => spec.value);

  // Get first image for OG meta
  const ogImage = images[0] || '/placeholder.svg';

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead 
        titleKey="seo.listingDetail.title" 
        descriptionKey="seo.listingDetail.description"
        dynamicTitle={translatedTitle}
        dynamicDescription={translatedDescription?.substring(0, 160) || undefined}
        ogImage={ogImage}
        pageType="product"
      />
      <ProductJsonLd 
        product={{
          id: product.id,
          title: product.title,
          description: product.description,
          price: product.price,
          condition: product.condition,
          brand: product.brand,
          model: product.model,
          year: product.year,
          images: product.images,
          location: product.location,
          seller_name: product.seller_name,
        }}
        translatedTitle={translatedTitle}
        translatedDescription={translatedDescription}
        currentLang={currentLang}
      />
      <Header />
      <main className="flex-1 bg-background">
        <div className="container-custom py-8">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <Button variant="ghost" size="sm" asChild className="gap-2 -ml-2">
              <Link to={`/${currentLang}/${listingsSlug}`}>
                <ArrowLeft className="h-4 w-4" />
                {t('common.viewAll')}
              </Link>
            </Button>
          </nav>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image gallery */}
              <Card className="overflow-hidden">
                <div className="relative aspect-[16/10] bg-muted">
                  <img
                    src={images[currentImageIndex] || '/placeholder.svg'}
                    alt={translatedTitle}
                    className="w-full h-full object-cover"
                  />
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card/90 flex items-center justify-center hover:bg-card transition-colors shadow-lg"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card/90 flex items-center justify-center hover:bg-card transition-colors shadow-lg"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}
                  {product.condition && (
                    <Badge className={`absolute top-4 left-4 ${conditionColors[product.condition] || 'bg-muted'}`}>
                      {getConditionLabel(product.condition)}
                    </Badge>
                  )}
                  {product.featured && (
                    <Badge className="absolute top-4 right-4 bg-accent text-accent-foreground">
                      ⭐ {t('home.featuredListings').replace('⭐ ', '')}
                    </Badge>
                  )}
                  {images.length > 0 && (
                    <div className="absolute bottom-4 right-4 bg-card/90 px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  )}
                </div>
                {images.length > 1 && (
                  <div className="p-4 flex gap-2 overflow-x-auto">
                    {images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          index === currentImageIndex ? 'border-primary' : 'border-transparent hover:border-border'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </Card>

              {/* Title and price - Mobile */}
              <div className="lg:hidden">
                <p className="text-sm text-muted-foreground mb-1">
                  {product.category} • {product.subcategory}
                </p>
                <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                  {translatedTitle}
                </h1>
                <div className="flex items-end gap-2 mb-4">
                  <span className="text-3xl font-display font-bold text-primary">
                    {formatPrice(price)}
                  </span>
                  <span className="text-muted-foreground text-sm mb-1">
                    ({formatPrice(priceHT)} {t('product.priceHT')})
                  </span>
                </div>
              </div>

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-display">{t('product.description')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground leading-relaxed whitespace-pre-line">
                    {translatedDescription}
                  </p>
                </CardContent>
              </Card>

              {/* Specifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-display">{t('product.specifications')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {specifications.map((spec, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                        <span className="text-muted-foreground">{spec.label}</span>
                        <span className="font-medium text-foreground">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Price card - Desktop */}
              <Card className="hidden lg:block sticky top-24">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground mb-1">
                    {product.category} • {product.subcategory}
                  </p>
                  <h1 className="font-display text-2xl font-bold text-foreground mb-4">
                    {translatedTitle}
                  </h1>
                  
                  <div className="space-y-1 mb-6">
                    <div className="text-4xl font-display font-bold text-primary">
                      {formatPrice(price)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(priceHT)} {t('product.priceHT')}
                    </p>
                  </div>

                  <div className="space-y-3 mb-6 text-sm">
                    {product.year && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{t('product.year')}: <strong className="text-foreground">{product.year}</strong></span>
                      </div>
                    )}
                    {product.hours && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{t('product.hours')}: <strong className="text-foreground">{product.hours.toLocaleString()} h</strong></span>
                      </div>
                    )}
                    {product.location && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{product.location} {product.department && `(${product.department})`}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Button variant="accent" className="w-full" size="lg">
                      <Phone className="h-4 w-4 mr-2" />
                      {t('product.contactSeller')}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Financing Simulator */}
              <FinancingSimulator price={price} productTitle={translatedTitle} productId={id || ''} />

              {/* Contact form */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-display">{t('product.requestInfo')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">{t('contact.name')} *</Label>
                      <Input
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder={t('contact.namePlaceholder')}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">{t('contact.email')} *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder={t('contact.emailPlaceholder')}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">{t('contact.phone')}</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder={t('contact.phonePlaceholder')}
                      />
                    </div>
                    <div>
                      <Label htmlFor="message">{t('contact.message')} *</Label>
                      <Textarea
                        id="message"
                        required
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder={t('contact.messagePlaceholder')}
                      />
                    </div>
                    <Button type="submit" className="w-full" variant="default">
                      <Mail className="h-4 w-4 mr-2" />
                      {t('contact.send')}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Seller info */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-display">Vendeur</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xl">🏪</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{product.seller.name || 'Vendeur'}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Check className="h-3 w-3 text-success" />
                        Vendeur vérifié
                      </p>
                    </div>
                  </div>
                  {product.seller.phone && (
                    <div className="space-y-2 text-sm">
                      <a
                        href={`tel:${product.seller.phone}`}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Phone className="h-4 w-4" />
                        {product.seller.phone}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Similar products */}
          {similarProducts.length > 0 && (
            <section className="mt-16">
              <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                {t('product.similarListings')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {similarProducts.slice(0, 4).map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AnnonceDetail;

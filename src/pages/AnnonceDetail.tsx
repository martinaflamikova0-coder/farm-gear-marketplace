import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Calendar, Phone, Mail, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { getProductById, getRecentProducts } from '@/data/products';
import ProductCard from '@/components/products/ProductCard';

const AnnonceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const product = getProductById(id || '');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const similarProducts = getRecentProducts(4).filter(p => p.id !== id);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">😕</div>
            <h1 className="font-display text-2xl font-bold mb-2">Annonce non trouvée</h1>
            <p className="text-muted-foreground mb-4">Cette annonce n'existe pas ou a été supprimée.</p>
            <Button asChild>
              <Link to="/annonces">Voir toutes les annonces</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const conditionColors = {
    'Excellent': 'bg-success text-success-foreground',
    'Très bon': 'bg-primary text-primary-foreground',
    'Bon': 'bg-warning text-warning-foreground',
    'Correct': 'bg-muted text-muted-foreground',
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    alert('Message envoyé ! Le vendeur vous contactera bientôt.');
  };

  const specifications = [
    { label: 'Marque', value: product.brand },
    { label: 'Modèle', value: product.model },
    { label: 'Année', value: product.year.toString() },
    { label: 'État', value: product.condition },
    ...(product.hours ? [{ label: 'Heures', value: `${product.hours.toLocaleString('fr-FR')} h` }] : []),
    ...(product.kilometers ? [{ label: 'Kilométrage', value: `${product.kilometers.toLocaleString('fr-FR')} km` }] : []),
    { label: 'Localisation', value: product.location },
    { label: 'Département', value: product.department },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-background">
        <div className="container-custom py-8">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <Button variant="ghost" size="sm" asChild className="gap-2 -ml-2">
              <Link to="/annonces">
                <ArrowLeft className="h-4 w-4" />
                Retour aux annonces
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
                    src={product.images[currentImageIndex]}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                  {product.images.length > 1 && (
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
                  <Badge className={`absolute top-4 left-4 ${conditionColors[product.condition]}`}>
                    {product.condition}
                  </Badge>
                  {product.featured && (
                    <Badge className="absolute top-4 right-4 bg-accent text-accent-foreground">
                      ⭐ Vedette
                    </Badge>
                  )}
                  <div className="absolute bottom-4 right-4 bg-card/90 px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {product.images.length}
                  </div>
                </div>
                {product.images.length > 1 && (
                  <div className="p-4 flex gap-2 overflow-x-auto">
                    {product.images.map((img, index) => (
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
                  {product.title}
                </h1>
                <div className="flex items-end gap-2 mb-4">
                  <span className="text-3xl font-display font-bold text-primary">
                    {formatPrice(product.priceTTC)}
                  </span>
                  <span className="text-muted-foreground text-sm mb-1">
                    ({formatPrice(product.priceHT)} HT)
                  </span>
                </div>
              </div>

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-display">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </CardContent>
              </Card>

              {/* Specifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-display">Caractéristiques</CardTitle>
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
                    {product.title}
                  </h1>
                  
                  <div className="space-y-1 mb-6">
                    <div className="text-4xl font-display font-bold text-primary">
                      {formatPrice(product.priceTTC)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(product.priceHT)} HT
                    </p>
                  </div>

                  <div className="space-y-3 mb-6 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Année: <strong className="text-foreground">{product.year}</strong></span>
                    </div>
                    {product.hours && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Heures: <strong className="text-foreground">{product.hours.toLocaleString('fr-FR')} h</strong></span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{product.location} ({product.department})</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button variant="accent" className="w-full" size="lg">
                      <Phone className="h-4 w-4 mr-2" />
                      Contacter le vendeur
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Contact form */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-display">Demander des informations</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nom *</Label>
                      <Input
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Votre nom"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="votre@email.fr"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="06 XX XX XX XX"
                      />
                    </div>
                    <div>
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        required
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Bonjour, je suis intéressé par ce matériel..."
                      />
                    </div>
                    <Button type="submit" className="w-full" variant="default">
                      <Mail className="h-4 w-4 mr-2" />
                      Envoyer ma demande
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
                      <p className="font-semibold text-foreground">{product.seller.name}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Check className="h-3 w-3 text-success" />
                        Vendeur vérifié
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <a
                      href={`tel:${product.seller.phone}`}
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Phone className="h-4 w-4" />
                      {product.seller.phone}
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Similar products */}
          {similarProducts.length > 0 && (
            <section className="mt-16">
              <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                Annonces similaires
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

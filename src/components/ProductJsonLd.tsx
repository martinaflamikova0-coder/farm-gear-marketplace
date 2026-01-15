import { useEffect } from 'react';
import { type SupportedLanguage } from '@/i18n';

interface ProductJsonLdProps {
  product: {
    id: string;
    title: string;
    description: string | null;
    price: number;
    condition: string | null;
    brand: string | null;
    model: string | null;
    year: number | null;
    images: string[] | null;
    location: string | null;
    seller_name: string | null;
    stock?: number | null;
  };
  translatedTitle: string;
  translatedDescription: string;
  currentLang: SupportedLanguage;
}

const ProductJsonLd = ({ 
  product, 
  translatedTitle, 
  translatedDescription,
  currentLang 
}: ProductJsonLdProps) => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://equiptrade.com';
  
  useEffect(() => {
    // Remove existing product JSON-LD to prevent duplicates
    const existingScript = document.querySelector('script[data-jsonld="product"]');
    if (existingScript) {
      existingScript.remove();
    }

    const price = Number(product.price) || 0;
    const images = product.images || [];
    
    // Map condition to Schema.org ItemCondition
    const conditionMap: Record<string, string> = {
      'new': 'https://schema.org/NewCondition',
      'used': 'https://schema.org/UsedCondition',
      'refurbished': 'https://schema.org/RefurbishedCondition',
    };
    
    const itemCondition = product.condition 
      ? conditionMap[product.condition] || 'https://schema.org/UsedCondition'
      : 'https://schema.org/UsedCondition';

    // Determine availability based on stock (for new items) or default to InStock
    const getAvailability = () => {
      if (product.condition === 'new' && product.stock !== undefined && product.stock !== null) {
        return product.stock === 0 
          ? 'https://schema.org/OutOfStock' 
          : 'https://schema.org/InStock';
      }
      return 'https://schema.org/InStock';
    };

    // Build the JSON-LD structured data
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: translatedTitle,
      description: translatedDescription || product.description || '',
      image: images.length > 0 ? images : [`${baseUrl}/placeholder.svg`],
      sku: product.id,
      ...(product.brand && { brand: { '@type': 'Brand', name: product.brand } }),
      ...(product.model && { model: product.model }),
      ...(product.year && { productionDate: product.year.toString() }),
      offers: {
        '@type': 'Offer',
        url: `${baseUrl}/${currentLang}/annonce/${product.id}`,
        priceCurrency: 'EUR',
        price: price.toFixed(2),
        priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        itemCondition,
        availability: getAvailability(),
        ...(product.seller_name && {
          seller: {
            '@type': 'Organization',
            name: product.seller_name,
          },
        }),
        ...(product.location && {
          availableAtOrFrom: {
            '@type': 'Place',
            address: {
              '@type': 'PostalAddress',
              addressLocality: product.location,
              addressCountry: 'FR',
            },
          },
        }),
      },
      category: 'Agricultural Equipment',
    };

    // Create and inject the script
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-jsonld', 'product');
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);

    // Cleanup on unmount
    return () => {
      const scriptToRemove = document.querySelector('script[data-jsonld="product"]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [product, translatedTitle, translatedDescription, currentLang, baseUrl]);

  return null;
};

export default ProductJsonLd;

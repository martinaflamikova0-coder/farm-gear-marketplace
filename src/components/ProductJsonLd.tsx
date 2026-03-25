import { type SupportedLanguage, getLocalizedSlug } from '@/i18n';

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
    category?: string | null;
    hours?: number | null;
    kilometers?: number | null;
    reference_number?: number | null;
    merchant_safe_image_url?: string | null;
  };
  translatedTitle: string;
  translatedDescription: string;
  currentLang: SupportedLanguage;
}

// Base URL for the site - used for canonical URLs
const BASE_URL = 'https://ekip-trade.com';

const ProductJsonLd = ({ 
  product, 
  translatedTitle, 
  translatedDescription,
  currentLang 
}: ProductJsonLdProps) => {
  
  const price = Number(product.price) || 0;
  const images = product.images || [];
  
  // Use merchant safe image if available, otherwise use first product image
  const primaryImage = product.merchant_safe_image_url || images[0] || `${BASE_URL}/placeholder.svg`;
  
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
    // Used items are typically unique/single quantity - InStock
    return 'https://schema.org/InStock';
  };

  // Generate localized product URL
  const listingSlug = getLocalizedSlug('listing', currentLang);
  const productUrl = `${BASE_URL}/${currentLang}/${listingSlug}/${product.id}`;

  // Generate MPN (Manufacturer Part Number) from reference
  const mpn = product.reference_number ? `EKIP${product.reference_number.toString().padStart(5, '0')}` : undefined;

  // Build additional product properties for Google Merchant Center
  const additionalProperties = [];
  
  if (product.hours) {
    additionalProperties.push({
      '@type': 'PropertyValue',
      name: 'Operating Hours',
      value: `${product.hours} h`,
      unitCode: 'HUR'
    });
  }
  
  if (product.kilometers) {
    additionalProperties.push({
      '@type': 'PropertyValue',
      name: 'Mileage',
      value: `${product.kilometers} km`,
      unitCode: 'KMT'
    });
  }

  if (product.year) {
    additionalProperties.push({
      '@type': 'PropertyValue',
      name: 'Year of Manufacture',
      value: product.year.toString()
    });
  }

  // Build the JSON-LD structured data optimized for Google Merchant Center
  const productJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': productUrl,
    name: translatedTitle,
    description: translatedDescription || product.description || '',
    // Primary image first, then all images
    image: [primaryImage, ...images.filter(img => img !== primaryImage)],
    sku: product.id,
    ...(mpn && { mpn }),
    // Use product ID as identifier (no GTIN for used equipment)
    identifier: product.id,
    ...(product.brand && { 
      brand: { 
        '@type': 'Brand', 
        name: product.brand 
      } 
    }),
    ...(product.model && { model: product.model }),
    ...(product.year && { 
      productionDate: product.year.toString(),
      releaseDate: `${product.year}-01-01`
    }),
    // Product category for Google
    category: product.category || 'Agricultural Equipment',
    // Additional properties (hours, km, year)
    ...(additionalProperties.length > 0 && { additionalProperty: additionalProperties }),
    // Offers - required for Google Merchant Center
    offers: {
      '@type': 'Offer',
      '@id': `${productUrl}#offer`,
      url: productUrl,
      priceCurrency: 'EUR',
      price: price.toFixed(2),
      // Price valid for 90 days
      priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      itemCondition,
      availability: getAvailability(),
      // Seller information
      seller: {
        '@type': 'Organization',
        name: product.seller_name || 'EkipTrade',
        url: BASE_URL,
      },
      // Shipping details - required for Merchant Center
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: ['FR', 'DE', 'ES', 'IT', 'PT', 'BE', 'NL', 'AT', 'CH']
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 3,
            unitCode: 'd'
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 3,
            maxValue: 14,
            unitCode: 'd'
          }
        }
      },
      // Return policy - required for Merchant Center
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: ['IT', 'FR', 'DE', 'ES', 'PT', 'AT', 'BE', 'NL', 'IE', 'GB'],
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 14,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/ReturnFeesCustomerResponsibility'
      },
      ...(product.location && {
        availableAtOrFrom: {
          '@type': 'Place',
          address: {
            '@type': 'PostalAddress',
            addressLocality: product.location,
            addressCountry: 'IT',
          },
        },
      }),
    },
    // Business information
    isRelatedTo: {
      '@type': 'WebSite',
      name: 'EkipTrade',
      url: BASE_URL,
    }
  };

  // Build breadcrumb JSON-LD
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'EkipTrade',
        item: BASE_URL
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: product.category || 'Equipment',
        item: `${BASE_URL}/${currentLang}/${getLocalizedSlug('listings', currentLang)}?category=${product.category || ''}`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: translatedTitle,
        item: productUrl
      }
    ]
  };

  // Render scripts directly in the component tree (SSR compatible)
  return (
    <>
      <script
        type="application/ld+json"
        data-jsonld="product"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd)
        }}
      />
      <script
        type="application/ld+json"
        data-jsonld="breadcrumb"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd)
        }}
      />
    </>
  );
};

export default ProductJsonLd;

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPPORTED_LANGUAGES = ['en', 'fr', 'de', 'es', 'it', 'pt'];
const BASE_URL = 'https://ekip-trade.com';

// Localized slugs for listings
const LISTING_SLUGS: Record<string, string> = {
  en: 'listing',
  fr: 'annonce',
  de: 'anzeige',
  es: 'anuncio',
  it: 'annuncio',
  pt: 'anuncio',
};

const LISTINGS_SLUGS: Record<string, string> = {
  en: 'listings',
  fr: 'annonces',
  de: 'anzeigen',
  es: 'anuncios',
  it: 'annunci',
  pt: 'anuncios',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Generating sitemap...');
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all active products with more fields for better SEO
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, updated_at, title, images, merchant_safe_image_url, brand, condition, price, category')
      .eq('status', 'active')
      .order('updated_at', { ascending: false });

    if (productsError) {
      console.error('Error fetching products:', productsError);
      throw productsError;
    }

    // Fetch all categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('slug, updated_at, name');

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
      throw categoriesError;
    }

    // Fetch all brands for brand pages
    const { data: brands, error: brandsError } = await supabase
      .from('brands')
      .select('slug, updated_at, name');

    if (brandsError) {
      console.error('Error fetching brands:', brandsError);
    }

    console.log(`Found ${products?.length || 0} products, ${categories?.length || 0} categories, ${brands?.length || 0} brands`);

    const now = new Date().toISOString();
    const today = now.split('T')[0];

    // Generate XML sitemap with enhanced SEO attributes
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

    // Static pages with all language variants
    const staticPages = [
      { path: '', priority: '1.0', changefreq: 'daily' },
      { path: 'about', priority: '0.7', changefreq: 'monthly' },
      { path: 'how-it-works', priority: '0.7', changefreq: 'monthly' },
      { path: 'faq', priority: '0.6', changefreq: 'monthly' },
      { path: 'contact', priority: '0.6', changefreq: 'monthly' },
      { path: 'returns', priority: '0.5', changefreq: 'yearly' },
      { path: 'terms', priority: '0.3', changefreq: 'yearly' },
      { path: 'privacy', priority: '0.3', changefreq: 'yearly' },
      { path: 'cookies', priority: '0.3', changefreq: 'yearly' },
    ];

    // Add static pages for each language
    for (const page of staticPages) {
      for (const lang of SUPPORTED_LANGUAGES) {
        const url = page.path ? `${BASE_URL}/${lang}/${page.path}` : `${BASE_URL}/${lang}`;
        xml += `  <url>
    <loc>${url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
`;
        // Add hreflang alternatives
        for (const altLang of SUPPORTED_LANGUAGES) {
          const altUrl = page.path ? `${BASE_URL}/${altLang}/${page.path}` : `${BASE_URL}/${altLang}`;
          xml += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${altUrl}"/>
`;
        }
        // Add x-default
        const defaultUrl = page.path ? `${BASE_URL}/en/${page.path}` : `${BASE_URL}/en`;
        xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${defaultUrl}"/>
`;
        xml += `  </url>
`;
      }
    }

    // Add listings page for each language
    for (const lang of SUPPORTED_LANGUAGES) {
      const listingsSlug = LISTINGS_SLUGS[lang];
      xml += `  <url>
    <loc>${BASE_URL}/${lang}/${listingsSlug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
`;
      for (const altLang of SUPPORTED_LANGUAGES) {
        const altSlug = LISTINGS_SLUGS[altLang];
        xml += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${BASE_URL}/${altLang}/${altSlug}"/>
`;
      }
      xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}/en/${LISTINGS_SLUGS['en']}"/>
`;
      xml += `  </url>
`;
    }

    // Add category filter pages with higher priority
    if (categories) {
      for (const category of categories) {
        for (const lang of SUPPORTED_LANGUAGES) {
          const listingsSlug = LISTINGS_SLUGS[lang];
          const categoryLastMod = category.updated_at ? category.updated_at.split('T')[0] : today;
          xml += `  <url>
    <loc>${BASE_URL}/${lang}/${listingsSlug}?category=${category.slug}</loc>
    <lastmod>${categoryLastMod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
`;
          // Add hreflang for category pages
          for (const altLang of SUPPORTED_LANGUAGES) {
            const altSlug = LISTINGS_SLUGS[altLang];
            xml += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${BASE_URL}/${altLang}/${altSlug}?category=${category.slug}"/>
`;
          }
          xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}/en/${LISTINGS_SLUGS['en']}?category=${category.slug}"/>
`;
          xml += `  </url>
`;
        }
      }
    }

    // Add brand filter pages
    if (brands && brands.length > 0) {
      for (const brand of brands) {
        for (const lang of SUPPORTED_LANGUAGES) {
          const listingsSlug = LISTINGS_SLUGS[lang];
          xml += `  <url>
    <loc>${BASE_URL}/${lang}/${listingsSlug}?brand=${encodeURIComponent(brand.name)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
`;
        }
      }
    }

    // Add product pages for each language with enhanced image data
    if (products) {
      for (const product of products) {
        for (const lang of SUPPORTED_LANGUAGES) {
          const listingSlug = LISTING_SLUGS[lang];
          const productUrl = `${BASE_URL}/${lang}/${listingSlug}/${product.id}`;
          const productLastMod = product.updated_at ? product.updated_at.split('T')[0] : today;
          
          xml += `  <url>
    <loc>${productUrl}</loc>
    <lastmod>${productLastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
`;
          // Add hreflang alternatives
          for (const altLang of SUPPORTED_LANGUAGES) {
            const altSlug = LISTING_SLUGS[altLang];
            xml += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${BASE_URL}/${altLang}/${altSlug}/${product.id}"/>
`;
          }
          // Add x-default
          xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}/en/${LISTING_SLUGS['en']}/${product.id}"/>
`;
          
          // Add product images for Google Images - prioritize merchant safe image
          const allImages: string[] = [];
          if (product.merchant_safe_image_url) {
            allImages.push(product.merchant_safe_image_url);
          }
          if (product.images && Array.isArray(product.images)) {
            for (const img of product.images) {
              if (img && typeof img === 'string' && !allImages.includes(img)) {
                allImages.push(img);
              }
            }
          }
          
          // Add up to 5 images per product
          for (const image of allImages.slice(0, 5)) {
            const imageTitle = [product.brand, product.title].filter(Boolean).join(' - ') || 'Product image';
            const imageCaption = product.condition === 'new' ? 'New equipment' : 'Used equipment';
            xml += `    <image:image>
      <image:loc>${escapeXml(image)}</image:loc>
      <image:title>${escapeXml(imageTitle)}</image:title>
      <image:caption>${escapeXml(imageCaption)} - ${escapeXml(product.category || 'Equipment')}</image:caption>
    </image:image>
`;
          }
          
          xml += `  </url>
`;
        }
      }
    }

    xml += `</urlset>`;

    console.log('Sitemap generated successfully with', products?.length || 0, 'products');

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
        'X-Robots-Tag': 'noindex', // Sitemap itself shouldn't be indexed
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error generating sitemap:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper to escape XML special characters
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPPORTED_LANGUAGES = ['en', 'fr', 'de', 'es', 'it', 'pt'];
const BASE_URL = 'https://field-trader-net.lovable.app';

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

    // Fetch all active products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, updated_at, title, images')
      .eq('status', 'active')
      .order('updated_at', { ascending: false });

    if (productsError) {
      console.error('Error fetching products:', productsError);
      throw productsError;
    }

    // Fetch all categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('slug, updated_at');

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
      throw categoriesError;
    }

    console.log(`Found ${products?.length || 0} products and ${categories?.length || 0} categories`);

    const now = new Date().toISOString();

    // Generate XML sitemap
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
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
`;
        // Add hreflang alternatives
        for (const altLang of SUPPORTED_LANGUAGES) {
          const altUrl = page.path ? `${BASE_URL}/${altLang}/${page.path}` : `${BASE_URL}/${altLang}`;
          xml += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${altUrl}"/>
`;
        }
        xml += `  </url>
`;
      }
    }

    // Add listings page for each language
    for (const lang of SUPPORTED_LANGUAGES) {
      const listingsSlug = LISTINGS_SLUGS[lang];
      xml += `  <url>
    <loc>${BASE_URL}/${lang}/${listingsSlug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
`;
      for (const altLang of SUPPORTED_LANGUAGES) {
        const altSlug = LISTINGS_SLUGS[altLang];
        xml += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${BASE_URL}/${altLang}/${altSlug}"/>
`;
      }
      xml += `  </url>
`;
    }

    // Add category filter pages
    if (categories) {
      for (const category of categories) {
        for (const lang of SUPPORTED_LANGUAGES) {
          const listingsSlug = LISTINGS_SLUGS[lang];
          xml += `  <url>
    <loc>${BASE_URL}/${lang}/${listingsSlug}?category=${category.slug}</loc>
    <lastmod>${category.updated_at || now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`;
        }
      }
    }

    // Add product pages for each language with images
    if (products) {
      for (const product of products) {
        for (const lang of SUPPORTED_LANGUAGES) {
          const listingSlug = LISTING_SLUGS[lang];
          const productUrl = `${BASE_URL}/${lang}/${listingSlug}/${product.id}`;
          
          xml += `  <url>
    <loc>${productUrl}</loc>
    <lastmod>${product.updated_at || now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
`;
          // Add hreflang alternatives
          for (const altLang of SUPPORTED_LANGUAGES) {
            const altSlug = LISTING_SLUGS[altLang];
            xml += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${BASE_URL}/${altLang}/${altSlug}/${product.id}"/>
`;
          }
          
          // Add product images for Google Images
          if (product.images && Array.isArray(product.images)) {
            for (const image of product.images.slice(0, 5)) { // Max 5 images per URL
              if (image && typeof image === 'string') {
                xml += `    <image:image>
      <image:loc>${escapeXml(image)}</image:loc>
      <image:title>${escapeXml(product.title || 'Product image')}</image:title>
    </image:image>
`;
              }
            }
          }
          
          xml += `  </url>
`;
        }
      }
    }

    xml += `</urlset>`;

    console.log('Sitemap generated successfully');

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
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

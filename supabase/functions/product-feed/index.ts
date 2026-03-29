import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://geoitalyagro.com";
const CURRENCY = "EUR";
const TVA_RATE = 0.20;
const CONTENT_LANGUAGE = "it";
const TARGET_COUNTRY = "IT";
const LISTING_SLUG_IT = "annuncio";

// Map French category slugs to Google Product Category IDs
// Using specific categories to avoid "Vehicles" classification
function getGoogleProductCategory(category: string | null, subcategory: string | null): string {
  // Use official Google Product Category numeric IDs to avoid "Vehicles" misclassification
  const catMap: Record<string, string> = {
    "tracteurs": "4351",       // Business & Industrial > Agriculture > Agricultural Machinery
    "recolte": "4351",         // Business & Industrial > Agriculture > Agricultural Machinery
    "travail-sol": "4351",     // Business & Industrial > Agriculture > Agricultural Machinery
    "manutention": "2272",     // Business & Industrial > Material Handling > Forklifts
    "chantier": "2047",        // Business & Industrial > Construction
    "pieces": "2878",          // Business & Industrial > Industrial Equipment
    "clotures": "4352",        // Business & Industrial > Agriculture > Livestock Supplies
    "distributeurs": "4351",   // Business & Industrial > Agriculture > Agricultural Machinery
    "melangeuses": "4351",     // Business & Industrial > Agriculture > Agricultural Machinery
    "traite": "4351",          // Business & Industrial > Agriculture > Agricultural Machinery
    "autres": "2878",          // Business & Industrial > Industrial Equipment
  };
  
  // Special subcategory handling to avoid "Vehicles" classification
  const subCatMap: Record<string, string> = {
    "tondeuse": "3602",                // Lawn Mowers
    "tracteurs-agricoles": "4351",     // Agricultural Machinery (NOT Vehicles)
    "moissonneuses-batteuses": "4351", // Agricultural Machinery (NOT Vehicles)
    "mini-pelle": "2047",              // Construction
    "chargeuse": "2047",               // Construction
    "micro-tracteurs": "3602",         // Lawn Mowers (ride-on mowers, NOT Vehicles)
    "tracteurs-vignerons": "4351",     // Agricultural Machinery (vineyard tractors)
    "falciatrice": "4351",             // Agricultural Machinery (mowers/cutters)
    "faucheuse": "4351",               // Agricultural Machinery (mowers)
  };
  if (subcategory && subCatMap[subcategory]) return subCatMap[subcategory];
  
  return catMap[category || ""] || "2878";
}

// Translate category/subcategory slugs to Italian for product_type
function translateCategory(slug: string | null): string {
  const map: Record<string, string> = {
    "tracteurs": "Macchinari Agricoli",
    "tracteurs-agricoles": "Macchinari Agricoli",
    "micro-tracteurs": "Tagliaerba con Sedile",
    "tracteurs-vignerons": "Attrezzature per Vigneto",
    "moissonneuses-batteuses": "Macchine da Raccolta",
    "broyeurs": "Trituratori",
    "chariots-elevateurs": "Forche e Sollevatori",
    "recolte": "Attrezzature da Raccolta",
    "travail-sol": "Attrezzature Lavorazione Suolo",
    "manutention": "Movimentazione Materiali",
    "chantier": "Attrezzature da Cantiere",
    "pieces": "Ricambi e Accessori",
    "clotures": "Recinzioni e Allevamento",
    "distributeurs": "Distributori di Mangime",
    "melangeuses": "Miscelatori di Mangime",
    "traite": "Attrezzature per Mungitura",
    "autres": "Altre Attrezzature",
    "tondeuse": "Tagliaerba",
    "mini-pelle": "Mini Escavatori",
    "chargeuse": "Pale Caricatrici",
    "broyeur": "Trituratori",
  };
  return map[slug || ""] || slug || "";
}

// Normalize title casing: convert ALL CAPS titles to Title Case, preserving brand acronyms ≤4 chars
function normalizeTitle(title: string): string {
  const normalizeWord = (word: string): string => {
    // Keep short uppercase tokens (acronyms/series codes)
    if (/^[A-Z0-9]{1,4}$/.test(word)) return word;
    // Convert long uppercase words to Title Case to avoid GMC uppercase warnings
    if (/^[A-ZÀ-Ý]{5,}$/.test(word)) {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }
    return word;
  };

  const normalizedByWord = title
    .split(/(\s+|[-–—])/)
    .map(normalizeWord)
    .join("");

  // If more than 60% of alphabetic chars are uppercase, convert to Title Case
  const alphaChars = normalizedByWord.replace(/[^a-zA-ZÀ-ÿ]/g, "");
  const upperCount = (normalizedByWord.match(/[A-ZÀ-Ý]/g) || []).length;
  if (alphaChars.length > 0 && upperCount / alphaChars.length > 0.6) {
    return normalizedByWord
      .split(/(\s+|[-–—])/)
      .map(word => {
        // Keep short uppercase words (brands/acronyms like "JCB", "CAT", "4WD")
        if (/^[A-Z0-9]{1,5}$/.test(word)) return word;
        // Keep words with numbers mixed (like "GX390", "400V")
        if (/\d/.test(word) && /[A-Z]/.test(word)) return word;
        // Convert to title case
        if (word.length > 1) {
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }
        return word;
      })
      .join("");
  }
  return normalizedByWord;
}

// Remove or replace words that trigger Google's "Vehicles" classification
function sanitizeVehicleTerms(title: string): string {
  return title
    // Italian vehicle terms → agricultural/garden equivalents
    .replace(/\bTrattore agricolo\b/gi, "Macchina Agricola")
    .replace(/\bTrattore compact\b/gi, "Macchina Compatta Agricola")
    .replace(/\bTrattore tondeuse\b/gi, "Tagliaerba con Sedile")
    .replace(/\bTrattorino\b/gi, "Tagliaerba con Sedile")
    .replace(/\bTrattore\b/gi, "Macchina Agricola")
    // French vehicle terms
    .replace(/\bTracteur agricole\b/gi, "Machine Agricole")
    .replace(/\bTracteur compact\b/gi, "Machine Compacte Agricole")
    .replace(/\bTracteur tondeuse\b/gi, "Tondeuse Autoportée")
    .replace(/\bTracteur\b/gi, "Machine Agricole")
    // English vehicle terms
    .replace(/\bAgricultural Tractor\b/gi, "Macchina Agricola")
    .replace(/\bCompact Tractor\b/gi, "Macchina Agricola Compatta")
    .replace(/\bTractor\b/gi, "Macchina Agricola")
    // Other vehicle-triggering terms
    .replace(/\bMoissonneuse[- ]?batteuse\b/gi, "Raccoglitrice")
    .replace(/\bHarvester\b/gi, "Macchina da Raccolta")
    .replace(/\bMietitrebbia\b/gi, "Raccoglitrice")
    // Falciatrice / mower terms that can trigger vehicle classification
    .replace(/\bFalciatrice\b/gi, "Attrezzatura da Taglio")
    .replace(/\bFalciacondizionatrice\b/gi, "Attrezzatura da Taglio Condizionata")
    .replace(/\bMower\b/gi, "Attrezzatura da Taglio")
    .replace(/\bFaucheuse\b/gi, "Attrezzatura da Taglio")
    // Clean up double spaces
    .replace(/\s{2,}/g, " ")
    .trim();
}


function escapeXml(str: string | null | undefined): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function getCondition(condition: string | null): string {
  switch (condition) {
    case "new":
      return "new";
    case "refurbished":
      return "refurbished";
    default:
      return "used";
  }
}

function getAvailability(stock: number | null, status: string | null): string {
  if (status !== "active") return "out of stock";
  if (stock === null) return "in stock"; // unique pieces without stock tracking
  if (stock <= 0) return "out of stock";
  return "in stock";
}

function toAbsolutePublicUrl(url: string | null | undefined): string {
  if (!url) return "";

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  if (url.startsWith("//")) {
    return `https:${url}`;
  }

  if (url.startsWith("/")) {
    return `${SITE_URL}${url}`;
  }

  return `${SITE_URL}/${url}`;
}

function getUnitPricingXml(product: any): string {
  // Add unit price measure for spare parts/accessories where GMC often expects it
  if (product.category !== "pieces") return "";

  const sourceTitle = (product.title_translations?.it || product.title || "").toLowerCase();
  const qtyMatch = sourceTitle.match(/(?:lot de|lot da|confezione da|pack de|pack da|x)\s*(\d{1,3})/i);
  const quantity = qtyMatch ? Math.max(1, Number(qtyMatch[1])) : 1;

  return `
      <g:unit_pricing_measure>${quantity} ct</g:unit_pricing_measure>
      <g:unit_pricing_base_measure>1 ct</g:unit_pricing_base_measure>`;
}

function buildProductEntry(product: any): string {
  const priceTTC = (product.price * (1 + TVA_RATE)).toFixed(2);
  const imageUrl = toAbsolutePublicUrl(product.merchant_safe_image_url || product.images?.[0]) || `${SITE_URL}/placeholder.svg`;
  const availability = getAvailability(product.stock, product.status);
  const condition = getCondition(product.condition);
  const link = `${SITE_URL}/${CONTENT_LANGUAGE}/${LISTING_SLUG_IT}/${product.id}`;
  const refNumber = `GIA${String(product.reference_number).padStart(5, "0")}`;

  // Use Italian (site's primary language) for title and description
  const titleTranslations = product.title_translations;
  const descTranslations = product.description_translations;
  const rawTitle = titleTranslations?.it || product.title;
  const itTitle = sanitizeVehicleTerms(normalizeTitle(rawTitle));
  // Use Italian description, fallback to title
  const rawDescription = descTranslations?.it || product.description || itTitle;
  const itDescription = sanitizeVehicleTerms(rawDescription);

  // Additional images (merchant-safe first, then regular)
  const additionalImages: string[] = [];
  if (product.merchant_safe_additional_images?.length) {
    additionalImages.push(...product.merchant_safe_additional_images);
  } else if (product.images?.length > 1) {
    additionalImages.push(...product.images.slice(1, 10));
  }

  const normalizedAdditionalImages = additionalImages
    .map((img) => toAbsolutePublicUrl(img))
    .filter((img) => !!img && img !== imageUrl)
    .slice(0, 10);

  // Sale price if discount
  let salePriceXml = "";
  if (product.original_price && product.discount_percentage && product.discount_percentage > 0) {
    const originalTTC = (product.original_price * (1 + TVA_RATE)).toFixed(2);
    salePriceXml = `
      <g:sale_price>${priceTTC} ${CURRENCY}</g:sale_price>
      <g:price>${originalTTC} ${CURRENCY}</g:price>`;
  }

  // Description - strip HTML, limit to 5000 chars
  let description = (itDescription || itTitle || "")
    .replace(/<[^>]*>/g, "")
    .substring(0, 5000);

  // Google Product Category to avoid "Vehicles" classification
  const googleCategory = getGoogleProductCategory(product.category, product.subcategory);

  // Translate product_type to Italian
  const productType = translateCategory(product.category) + 
    (product.subcategory ? ` > ${translateCategory(product.subcategory)}` : "");

  const unitPricingXml = getUnitPricingXml(product);

  return `
    <item>
      <g:id>${escapeXml(product.id)}</g:id>
      <g:title>${escapeXml(itTitle)}</g:title>
      <g:description>${escapeXml(description)}</g:description>
      <g:link>${escapeXml(link)}</g:link>
      <g:image_link>${escapeXml(imageUrl)}</g:image_link>
      ${normalizedAdditionalImages.map((img) => `<g:additional_image_link>${escapeXml(img)}</g:additional_image_link>`).join("\n      ")}
      ${salePriceXml || `<g:price>${priceTTC} ${CURRENCY}</g:price>`}
      <g:availability>${availability}</g:availability>
      <g:content_language>${CONTENT_LANGUAGE}</g:content_language>
      <g:target_country>${TARGET_COUNTRY}</g:target_country>
      <g:condition>${condition}</g:condition>
      
      <g:google_product_category>${escapeXml(googleCategory)}</g:google_product_category>
      ${product.brand ? `<g:brand>${escapeXml(product.brand)}</g:brand>` : ""}
      <g:mpn>${escapeXml(refNumber)}</g:mpn>
      <g:identifier_exists>false</g:identifier_exists>
      <g:product_type>${escapeXml(productType)}</g:product_type>
      ${unitPricingXml}
      ${product.model ? `<g:custom_label_0>${escapeXml(product.model)}</g:custom_label_0>` : ""}
      ${product.year ? `<g:custom_label_1>${product.year}</g:custom_label_1>` : ""}
      ${product.hours ? `<g:custom_label_2>${product.hours}h</g:custom_label_2>` : ""}
      <g:shipping>
        <g:country>GB</g:country>
        <g:service>Standard</g:service>
        <g:price>0.00 ${CURRENCY}</g:price>
      </g:shipping>
      <g:shipping>
        <g:country>FR</g:country>
        <g:service>Standard</g:service>
        <g:price>0.00 ${CURRENCY}</g:price>
      </g:shipping>
      <g:shipping>
        <g:country>DE</g:country>
        <g:service>Standard</g:service>
        <g:price>0.00 ${CURRENCY}</g:price>
      </g:shipping>
      <g:shipping>
        <g:country>IE</g:country>
        <g:service>Standard</g:service>
        <g:price>0.00 ${CURRENCY}</g:price>
      </g:shipping>
      <g:shipping>
        <g:country>AT</g:country>
        <g:service>Standard</g:service>
        <g:price>0.00 ${CURRENCY}</g:price>
      </g:shipping>
      <g:shipping>
        <g:country>ES</g:country>
        <g:service>Standard</g:service>
        <g:price>0.00 ${CURRENCY}</g:price>
      </g:shipping>
      <g:shipping>
        <g:country>IT</g:country>
        <g:service>Standard</g:service>
        <g:price>0.00 ${CURRENCY}</g:price>
      </g:shipping>
      <g:shipping>
        <g:country>PT</g:country>
        <g:service>Standard</g:service>
        <g:price>0.00 ${CURRENCY}</g:price>
      </g:shipping>
      <g:shipping>
        <g:country>BE</g:country>
        <g:service>Standard</g:service>
        <g:price>0.00 ${CURRENCY}</g:price>
      </g:shipping>
      <g:shipping>
        <g:country>NL</g:country>
        <g:service>Standard</g:service>
        <g:price>0.00 ${CURRENCY}</g:price>
      </g:shipping>
    </item>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Generating Google Shopping product feed...");

    // Fetch all active products
    const { data: products, error } = await supabase
      .from("products")
      .select("id, title, description, price, original_price, discount_percentage, category, subcategory, brand, model, condition, year, hours, kilometers, images, merchant_safe_image_url, merchant_safe_additional_images, stock, status, reference_number, location, title_translations, description_translations")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching products:", error);
      throw error;
    }

    console.log(`Found ${products?.length || 0} active products for feed`);

    const items = (products || []).map(buildProductEntry).join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>GeoItalyAgro - Marketplace di Macchinari Agricoli e Industriali</title>
    <link>${SITE_URL}</link>
    <description>Acquista macchinari agricoli e industriali nuovi e usati su GeoItalyAgro</description>
    <g:content_language>${CONTENT_LANGUAGE}</g:content_language>
    <g:target_country>${TARGET_COUNTRY}</g:target_country>
    ${items}
  </channel>
</rss>`;

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("Product feed error:", err);
    return new Response(`<?xml version="1.0" encoding="UTF-8"?><error>${err.message}</error>`, {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/xml" },
    });
  }
});

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://ekiptrade.com";
const CURRENCY = "EUR";
const TVA_RATE = 0.20;
const CONTENT_LANGUAGE = "en";

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
  };
  if (subcategory && subCatMap[subcategory]) return subCatMap[subcategory];
  
  return catMap[category || ""] || "2878";
}

// Translate French category/subcategory slugs to English for product_type
function translateCategory(slug: string | null): string {
  const map: Record<string, string> = {
    "tracteurs": "Tractors",
    "tracteurs-agricoles": "Agricultural Tractors",
    "recolte": "Harvesting Equipment",
    "travail-sol": "Soil Working Equipment",
    "manutention": "Material Handling",
    "chantier": "Construction Equipment",
    "pieces": "Parts & Accessories",
    "clotures": "Fencing & Livestock",
    "distributeurs": "Feed Distributors",
    "melangeuses": "Feed Mixers",
    "traite": "Milking Equipment",
    "autres": "Other Equipment",
    "tondeuse": "Lawn Mowers",
    "mini-pelle": "Mini Excavators",
    "chargeuse": "Loaders",
    "broyeur": "Shredders",
  };
  return map[slug || ""] || slug || "";
}

// Normalize title casing: convert ALL CAPS titles to Title Case, preserving brand acronyms ≤4 chars
function normalizeTitle(title: string): string {
  // If more than 60% of alphabetic chars are uppercase, convert to Title Case
  const alphaChars = title.replace(/[^a-zA-ZÀ-ÿ]/g, "");
  const upperCount = (title.match(/[A-ZÀ-Ý]/g) || []).length;
  if (alphaChars.length > 0 && upperCount / alphaChars.length > 0.6) {
    return title
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
  return title;
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
  if (status !== "active") return "out_of_stock";
  if (stock === null) return "in_stock"; // unique pieces without stock tracking
  if (stock <= 0) return "out_of_stock";
  return "in_stock";
}

function buildProductEntry(product: any): string {
  const priceTTC = (product.price * (1 + TVA_RATE)).toFixed(2);
  const imageUrl = product.merchant_safe_image_url || product.images?.[0] || "";
  const availability = getAvailability(product.stock, product.status);
  const condition = getCondition(product.condition);
  const slug = product.title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const link = `${SITE_URL}/en/listing/${product.id}`;
  const refNumber = `REFEQUITRAD${String(product.reference_number).padStart(5, "0")}`;

  // Use English translations if available, fallback to French title (never French description)
  const titleTranslations = product.title_translations;
  const descTranslations = product.description_translations;
  const rawEnTitle = titleTranslations?.en || product.title;
  const enTitle = normalizeTitle(rawEnTitle);
  // IMPORTANT: Only use English description, never fall back to French description (causes "wrong language" error)
  const enDescription = descTranslations?.en || enTitle;

  // Additional images (merchant-safe first, then regular)
  const additionalImages: string[] = [];
  if (product.merchant_safe_additional_images?.length) {
    additionalImages.push(...product.merchant_safe_additional_images);
  } else if (product.images?.length > 1) {
    additionalImages.push(...product.images.slice(1, 10));
  }

  // Sale price if discount
  let salePriceXml = "";
  if (product.original_price && product.discount_percentage && product.discount_percentage > 0) {
    const originalTTC = (product.original_price * (1 + TVA_RATE)).toFixed(2);
    salePriceXml = `
      <g:sale_price>${priceTTC} ${CURRENCY}</g:sale_price>
      <g:price>${originalTTC} ${CURRENCY}</g:price>`;
  }

  // Description - strip HTML, limit to 5000 chars
  let description = (enDescription || enTitle || "")
    .replace(/<[^>]*>/g, "")
    .substring(0, 5000);

  // Google Product Category to avoid "Vehicles" classification
  const googleCategory = getGoogleProductCategory(product.category, product.subcategory);

  // Translate product_type to English
  const productType = translateCategory(product.category) + 
    (product.subcategory ? ` > ${translateCategory(product.subcategory)}` : "");

  return `
    <item>
      <g:id>${escapeXml(product.id)}</g:id>
      <g:title>${escapeXml(enTitle)}</g:title>
      <g:description>${escapeXml(description)}</g:description>
      <g:link>${escapeXml(link)}</g:link>
      <g:image_link>${escapeXml(imageUrl)}</g:image_link>
      ${additionalImages.map((img) => `<g:additional_image_link>${escapeXml(img)}</g:additional_image_link>`).join("\n      ")}
      ${salePriceXml || `<g:price>${priceTTC} ${CURRENCY}</g:price>`}
      <g:availability>${availability}</g:availability>
      <g:condition>${condition}</g:condition>
      <g:content_language>${CONTENT_LANGUAGE}</g:content_language>
      <g:target_country>GB</g:target_country>
      <g:google_product_category>${escapeXml(googleCategory)}</g:google_product_category>
      ${product.brand ? `<g:brand>${escapeXml(product.brand)}</g:brand>` : ""}
      <g:mpn>${escapeXml(refNumber)}</g:mpn>
      <g:identifier_exists>false</g:identifier_exists>
      <g:product_type>${escapeXml(productType)}</g:product_type>
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
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
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
    <title>EkipTrade - Agricultural &amp; Industrial Equipment</title>
    <link>${SITE_URL}</link>
    <description>Buy new and used agricultural and industrial equipment on EkipTrade</description>
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

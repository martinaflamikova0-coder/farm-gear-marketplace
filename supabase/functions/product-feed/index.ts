import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://ekiptrade.com";
const CURRENCY = "EUR";
const TVA_RATE = 0.20;

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
  const link = `${SITE_URL}/annonce/${product.id}/${slug}`;
  const refNumber = `REFEQUITRAD${String(product.reference_number).padStart(5, "0")}`;

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
  let description = (product.description || product.title || "")
    .replace(/<[^>]*>/g, "")
    .substring(0, 5000);

  return `
    <item>
      <g:id>${escapeXml(product.id)}</g:id>
      <g:title>${escapeXml(product.title)}</g:title>
      <g:description>${escapeXml(description)}</g:description>
      <g:link>${escapeXml(link)}</g:link>
      <g:image_link>${escapeXml(imageUrl)}</g:image_link>
      ${additionalImages.map((img) => `<g:additional_image_link>${escapeXml(img)}</g:additional_image_link>`).join("\n      ")}
      ${salePriceXml || `<g:price>${priceTTC} ${CURRENCY}</g:price>`}
      <g:availability>${availability}</g:availability>
      <g:condition>${condition}</g:condition>
      ${product.brand ? `<g:brand>${escapeXml(product.brand)}</g:brand>` : ""}
      <g:mpn>${escapeXml(refNumber)}</g:mpn>
      <g:identifier_exists>false</g:identifier_exists>
      <g:product_type>${escapeXml(product.category)}${product.subcategory ? ` &gt; ${escapeXml(product.subcategory)}` : ""}</g:product_type>
      ${product.model ? `<g:custom_label_0>${escapeXml(product.model)}</g:custom_label_0>` : ""}
      ${product.year ? `<g:custom_label_1>${product.year}</g:custom_label_1>` : ""}
      ${product.hours ? `<g:custom_label_2>${product.hours}h</g:custom_label_2>` : ""}
      <g:shipping>
        <g:country>FR</g:country>
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
      .select("id, title, description, price, original_price, discount_percentage, category, subcategory, brand, model, condition, year, hours, kilometers, images, merchant_safe_image_url, merchant_safe_additional_images, stock, status, reference_number, location")
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
    <title>EkipTrade - Matériel Agricole et Industriel</title>
    <link>${SITE_URL}</link>
    <description>Achetez du matériel agricole et industriel d'occasion et neuf sur EkipTrade</description>
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

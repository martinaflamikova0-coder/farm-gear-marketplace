import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ========== AUTHENTICATION CHECK ==========
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized - No valid authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify the user's JWT token
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error("Auth error:", claimsError);
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized - Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;

    // ========== ADMIN ROLE CHECK ==========
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { data: isAdmin, error: roleError } = await supabaseAdmin.rpc("has_role", {
      _user_id: userId,
      _role: "admin"
    });

    if (roleError || !isAdmin) {
      console.error("Role check failed:", roleError);
      return new Response(
        JSON.stringify({ success: false, error: "Forbidden - Admin role required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ========== BUSINESS LOGIC ==========
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: "URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("FIRECRAWL_API_KEY");
    if (!apiKey) {
      console.error("FIRECRAWL_API_KEY not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Firecrawl connector not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Format URL
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log("Scraping product URL:", formattedUrl, "by admin:", userId);

    // Scrape with Firecrawl
    const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ["markdown", "html", "links"],
        onlyMainContent: true,
        waitFor: 3000,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Firecrawl API error:", data);
      return new Response(
        JSON.stringify({ success: false, error: data.error || `Request failed with status ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const markdown = data.data?.markdown || data.markdown || "";
    const html = data.data?.html || data.html || "";
    
    // Extract product data from markdown/html
    const product = extractProductData(markdown, html, formattedUrl);
    
    console.log("Product scraped successfully:", product.title);

    return new Response(
      JSON.stringify({ success: true, product, raw: { markdown, html } }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error scraping product:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to scrape product";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function extractProductData(markdown: string, html: string, sourceUrl: string): ScrapedProduct {
  // Extract title from HTML - most reliable source
  let title = "";
  
  // Method 1: Look for product_title class in HTML
  const productTitleMatch = html.match(/<h1[^>]*class="[^"]*product_title[^"]*"[^>]*>([^<]+)<\/h1>/i);
  if (productTitleMatch) {
    title = productTitleMatch[1].trim();
  }
  
  // Method 2: Look for entry-title class
  if (!title) {
    const entryTitleMatch = html.match(/<h1[^>]*class="[^"]*entry-title[^"]*"[^>]*>([^<]+)<\/h1>/i);
    if (entryTitleMatch) {
      title = entryTitleMatch[1].trim();
    }
  }
  
  // Method 3: Fall back to markdown H1
  if (!title) {
    const titleMatch = markdown.match(/^# (.+)$/m);
    if (titleMatch) {
      title = titleMatch[1].trim();
    }
  }
  
  // Clean title from special chars
  title = title.replace(/[–—]/g, "-").replace(/\s+/g, " ").trim();
  
  // Extract price - look for the main product price
  let price = 0;
  
  // Method 1: Look for price in WooCommerce price element
  const wcPriceMatch = html.match(/<p[^>]*class="[^"]*price[^"]*"[^>]*>[\s\S]*?(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)\s*[€$£]/);
  if (wcPriceMatch) {
    const priceStr = wcPriceMatch[1]
      .replace(/\./g, "") // Remove thousand separators
      .replace(",", "."); // Convert decimal comma to dot
    price = parseFloat(priceStr) || 0;
  }
  
  // Method 2: Look for price in markdown near title
  if (price === 0) {
    const titlePos = markdown.indexOf(`# ${title}`) || markdown.indexOf(title);
    if (titlePos !== -1) {
      const afterTitle = markdown.substring(titlePos, titlePos + 500);
      const priceMatch = afterTitle.match(/\n\n(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)\s*€/);
      if (priceMatch) {
        const priceStr = priceMatch[1]
          .replace(/\./g, "")
          .replace(",", ".");
        price = parseFloat(priceStr) || 0;
      }
    }
  }
  
  // Method 3: Look for price near "inkl. MwSt"
  if (price === 0) {
    const mwstMatch = markdown.match(/(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)\s*€\s*\n\n.*inkl\.\s*MwSt/i);
    if (mwstMatch) {
      const priceStr = mwstMatch[1]
        .replace(/\./g, "")
        .replace(",", ".");
      price = parseFloat(priceStr) || 0;
    }
  }
  
  // Extract ONLY main product images from WooCommerce gallery
  let images: string[] = [];
  
  // Method 1: Extract from woocommerce-product-gallery images (most reliable)
  const galleryMatch = html.match(/<div[^>]*class="[^"]*woocommerce-product-gallery[^"]*"[^>]*>[\s\S]*?<\/div>\s*<\/div>/i);
  if (galleryMatch) {
    const galleryHtml = galleryMatch[0];
    // Extract data-large_image URLs (full resolution)
    const largeImagePattern = /data-large_image="([^"]+)"/g;
    let match;
    while ((match = largeImagePattern.exec(galleryHtml)) !== null) {
      if (match[1] && !images.includes(match[1])) {
        images.push(match[1]);
      }
    }
    
    // Also check for data-src or src in gallery
    if (images.length === 0) {
      const srcPattern = /(?:data-src|src)="(https:\/\/[^"]+(?:\.jpg|\.jpeg|\.png|\.webp)[^"]*)"/gi;
      while ((match = srcPattern.exec(galleryHtml)) !== null) {
        if (match[1] && !images.includes(match[1])) {
          images.push(match[1]);
        }
      }
    }
  }
  
  // Method 2: Look for wp-post-image (main product image)
  if (images.length === 0) {
    const mainImagePattern = /<img[^>]*class="[^"]*wp-post-image[^"]*"[^>]*src="([^"]+)"[^>]*>/gi;
    let match;
    while ((match = mainImagePattern.exec(html)) !== null) {
      if (match[1] && !images.includes(match[1])) {
        images.push(match[1]);
      }
    }
  }
  
  // Method 3: Look for product images by URL pattern (product uploads folder)
  if (images.length === 0) {
    // Extract product slug from URL
    const slugMatch = sourceUrl.match(/\/product\/([^\/]+)/);
    const productSlug = slugMatch ? slugMatch[1] : "";
    
    const htmlImagePattern = /src=["'](https:\/\/[^"']+\/wp-content\/uploads\/[^"']+\.(jpg|jpeg|png|webp))["']/gi;
    let match;
    const allImages: string[] = [];
    while ((match = htmlImagePattern.exec(html)) !== null) {
      const img = match[1];
      // Filter out unwanted images
      if (
        !img.includes("icon") && 
        !img.includes("logo") && 
        !img.includes("payment") &&
        !img.includes("Payment") &&
        !img.includes("Zahlungsmethode") &&
        !img.includes("16x16") &&
        !img.includes("32x32") &&
        !img.includes("50x") &&
        !img.includes("65x74") &&
        !img.includes("100x100") &&
        !img.includes("150x150") &&
        !img.includes("WhatsApp") &&
        !img.includes("Untitled-design") &&
        !img.includes("removebg") &&
        !img.includes("placeholder") &&
        !img.includes("woocommerce-placeholder")
      ) {
        allImages.push(img);
      }
    }
    
    // Prioritize images that appear in the first half of the page (product section)
    // and remove duplicates
    const uniqueImages = [...new Set(allImages)];
    
    // Get high-res versions (remove size suffixes)
    images = uniqueImages.map(img => img.replace(/-\d+x\d+(\.(jpg|jpeg|png|webp))/, "$1"));
    images = [...new Set(images)];
  }
  
  // Filter and limit images
  images = images.filter(img => 
    img.startsWith("http") && 
    !img.includes("related") &&
    !img.includes("upsell")
  ).slice(0, 10);
  
  // Extract description from product description section
  let description = "";
  
  // Method 1: Look for Produktbeschreibung section in markdown
  const descMatch = markdown.match(/## Produktbeschreibung[\s\S]*?((?:- .*\n)+)/i);
  if (descMatch) {
    description = descMatch[1].trim();
  }
  
  // Method 2: Look for description tab content in HTML
  if (!description) {
    const descTabMatch = html.match(/<div[^>]*id="tab-description"[^>]*>([\s\S]*?)<\/div>/i);
    if (descTabMatch) {
      // Extract text content, removing HTML tags
      description = descTabMatch[1]
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 1000);
    }
  }
  
  // Method 3: Fallback to bullet points
  if (!description) {
    const bulletMatch = markdown.match(/(?:^[-•*] .+$\n?)+/m);
    if (bulletMatch) {
      description = bulletMatch[0].trim();
    }
  }
  
  // Extract brand from title or content - extended list
  let brand = "";
  const brandPatterns = [
    // Construction equipment
    "WACKER NEUSON", "HÄNER", "HEB", "EPIROC", "ATLAS COPCO", "KINSHOFER", "RÄDLINGER", "RADLINGER",
    "CAT", "CATERPILLAR", "VOLVO", "HITACHI", "KOMATSU", "JCB", "KUBOTA", "BOBCAT", "LIEBHERR",
    "TAKEUCHI", "YANMAR", "KOBELCO", "DOOSAN", "HYUNDAI", "CASE", "NEW HOLLAND",
    // Power tools
    "BOSCH", "MAKITA", "HILTI", "DEWALT", "METABO", "HUSQVARNA", "STIHL", "MILWAUKEE", "FESTOOL",
    // Measuring instruments
    "LEICA", "NEDO", "TOPCON", "TRIMBLE", "GEO FENNEL", "STABILA",
    // Agricultural
    "JOHN DEERE", "FENDT", "MASSEY FERGUSON", "CLAAS", "DEUTZ-FAHR", "VALTRA", "ZETOR",
    "MCCORMICK", "SAME", "LANDINI", "NEW HOLLAND", "CASE IH",
    // Others
    "DITCH WITCH", "VERMEER", "SANDVIK", "WIRTGEN", "BOMAG", "HAMM", "DYNAPAC"
  ];
  
  const titleUpper = title.toUpperCase();
  for (const b of brandPatterns) {
    if (titleUpper.includes(b.toUpperCase())) {
      // Keep proper casing for the brand
      brand = b.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
      // Special casing for some brands
      if (b === "CAT") brand = "CAT";
      if (b === "JCB") brand = "JCB";
      if (b === "HEB") brand = "HEB";
      if (b === "HÄNER") brand = "Häner";
      if (b === "KINSHOFER") brand = "Kinshofer";
      if (b === "RÄDLINGER" || b === "RADLINGER") brand = "Rädlinger";
      break;
    }
  }
  
  // Extract specifications - focus on product-specific specs
  const specifications: string[] = [];
  const specMatches = markdown.matchAll(/^[-•*] (.+)$/gm);
  const seenSpecs = new Set<string>();
  for (const match of specMatches) {
    const spec = match[1].trim();
    // Filter out generic site content and duplicates
    if (
      spec.length > 5 && 
      spec.length < 200 && 
      !spec.includes("http") &&
      !spec.includes("Description") &&
      !spec.includes("Bewertungen") &&
      !seenSpecs.has(spec.toLowerCase())
    ) {
      seenSpecs.add(spec.toLowerCase());
      specifications.push(spec);
    }
  }
  
  // Category mapping: German source categories -> French target categories
  const categoryMapping: Record<string, string> = {
    // Construction equipment
    "hydraulikhammer": "chantier",
    "erdbohrgerate": "chantier",
    "greifer": "chantier",
    "diamanttechnik": "chantier",
    "gerate": "chantier",
    "hacksler": "broyeurs",
    "messwerkzeuge": "pieces",
    // Default fallbacks
    "default": "autres"
  };
  
  // Determine category from URL or content
  let category = "autres";
  const urlLower = sourceUrl.toLowerCase();
  
  if (urlLower.includes("messwerkzeuge") || titleUpper.includes("LASER") || titleUpper.includes("MESSFIX")) {
    category = categoryMapping["messwerkzeuge"] || "pieces";
  } else if (urlLower.includes("erdbohrgerate") || titleUpper.includes("BOHR")) {
    category = categoryMapping["erdbohrgerate"] || "chantier";
  } else if (urlLower.includes("greifer")) {
    category = categoryMapping["greifer"] || "chantier";
  } else if (urlLower.includes("hydraulikhammer")) {
    category = categoryMapping["hydraulikhammer"] || "chantier";
  } else if (urlLower.includes("diamanttechnik")) {
    category = categoryMapping["diamanttechnik"] || "chantier";
  } else if (urlLower.includes("hacksler")) {
    category = categoryMapping["hacksler"] || "broyeurs";
  } else {
    category = categoryMapping["default"] || "autres";
  }
  
  return {
    title,
    price,
    description,
    images,
    category,
    brand,
    specifications: specifications.slice(0, 20), // Limit to 20 specs
    sourceUrl,
  };
}

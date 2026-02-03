import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    console.log("Scraping product URL:", formattedUrl);

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
  // Extract title - look for H1 or first significant heading
  const titleMatch = markdown.match(/^# (.+)$/m) || markdown.match(/^## (.+)$/m);
  let title = titleMatch ? titleMatch[1].trim() : "";
  
  // Clean title from special chars
  title = title.replace(/[–—]/g, "-").trim();
  
  // Extract price - look for the product price, which follows the H1 title
  // The product page shows title then price: "# Product Title\n\n865,80 €"
  // We need to find the price that appears right after the main title, not in related products
  let price = 0;
  
  // Find position of main title in markdown
  const titlePos = markdown.indexOf(`# ${title}`);
  if (titlePos !== -1) {
    // Look for price in the section after the title (next 500 chars)
    const afterTitle = markdown.substring(titlePos, titlePos + 500);
    const priceMatch = afterTitle.match(/\n\n(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)\s*€/);
    if (priceMatch) {
      const priceStr = priceMatch[1]
        .replace(/\./g, "") // Remove thousand separators
        .replace(",", "."); // Convert decimal comma to dot
      price = parseFloat(priceStr) || 0;
    }
  }
  
  // Fallback: look for price pattern near "inkl. MwSt"
  if (price === 0) {
    const mwstMatch = markdown.match(/(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)\s*€\s*\n\n.*inkl\.\s*MwSt/i);
    if (mwstMatch) {
      const priceStr = mwstMatch[1]
        .replace(/\./g, "")
        .replace(",", ".");
      price = parseFloat(priceStr) || 0;
    }
  }
  
  // Extract images - look for image URLs in markdown
  const imagePattern = /!\[.*?\]\((https:\/\/[^\s)]+\.(jpg|jpeg|png|webp)[^\s)]*)\)/gi;
  const imageMatches = [...markdown.matchAll(imagePattern)];
  let images = imageMatches.map(m => m[1]).filter(img => 
    !img.includes("icon") && 
    !img.includes("logo") && 
    !img.includes("payment") &&
    !img.includes("Payment") &&
    !img.includes("Zahlungsmethode") &&
    !img.includes("16x16") &&
    !img.includes("32x32") &&
    !img.includes("65x74") && // thumbnails
    !img.includes("WhatsApp") &&
    !img.includes("Untitled-design") &&
    !img.includes("removebg")
  );
  
  // Also extract from HTML for larger images
  const htmlImagePattern = /src=["'](https:\/\/[^"']+\.(jpg|jpeg|png|webp)[^"']*)["']/gi;
  const htmlImageMatches = [...html.matchAll(htmlImagePattern)];
  const htmlImages = htmlImageMatches.map(m => m[1]).filter(img => 
    !img.includes("icon") && 
    !img.includes("logo") && 
    !img.includes("payment") &&
    !img.includes("Payment") &&
    !img.includes("Zahlungsmethode") &&
    !img.includes("16x16") &&
    !img.includes("32x32") &&
    !img.includes("65x74") &&
    !img.includes("WhatsApp") &&
    !img.includes("Untitled-design") &&
    !img.includes("removebg") &&
    (img.includes("600x600") || img.includes("wp-content/uploads"))
  );
  
  // Merge and dedupe images
  images = [...new Set([...images, ...htmlImages])];
  
  // Get high-res versions (remove size suffixes)
  images = images.map(img => img.replace(/-\d+x\d+(\.(jpg|jpeg|png|webp))/, "$1"));
  images = [...new Set(images)].slice(0, 10); // Limit to 10 images
  
  // Extract description - look for product description section
  let description = "";
  const descMatch = markdown.match(/## Produktbeschreibung[\s\S]*?((?:- .*\n)+)/i);
  if (descMatch) {
    description = descMatch[1].trim();
  } else {
    // Fallback: look for bullet points after title
    const bulletMatch = markdown.match(/(?:^[-•*] .+$\n?)+/m);
    if (bulletMatch) {
      description = bulletMatch[0].trim();
    }
  }
  
  // Extract brand from title
  let brand = "";
  const brandPatterns = ["LEICA", "NEDO", "WACKER NEUSON", "HÄNER", "HEB", "BOSCH", "MAKITA", "HILTI", "DEWALT", "METABO"];
  for (const b of brandPatterns) {
    if (title.toUpperCase().includes(b)) {
      brand = b;
      break;
    }
  }
  
  // Extract specifications
  const specifications: string[] = [];
  const specMatches = markdown.matchAll(/^[-•*] (.+)$/gm);
  for (const match of specMatches) {
    const spec = match[1].trim();
    if (spec.length > 5 && spec.length < 200 && !spec.includes("http")) {
      specifications.push(spec);
    }
  }
  
  // Determine category from URL or content
  let category = "";
  if (sourceUrl.includes("messwerkzeuge") || title.toLowerCase().includes("laser") || title.toLowerCase().includes("messfix")) {
    category = "messwerkzeuge";
  } else if (sourceUrl.includes("erdbohrgerate") || title.toLowerCase().includes("bohr")) {
    category = "erdbohrgerate";
  } else if (sourceUrl.includes("greifer")) {
    category = "greifer";
  } else if (sourceUrl.includes("hydraulikhammer")) {
    category = "hydraulikhammer";
  } else if (sourceUrl.includes("diamanttechnik")) {
    category = "diamanttechnik";
  } else if (sourceUrl.includes("hacksler")) {
    category = "hacksler";
  } else {
    category = "gerate"; // Default
  }
  
  return {
    title,
    price,
    description,
    images,
    category,
    brand,
    specifications,
    sourceUrl,
  };
}

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, limit = 50 } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: "Category URL is required" }),
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

    console.log("Scraping category page:", formattedUrl);

    // First, scrape the category page to get product links
    const scrapeResponse = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ["markdown", "links"],
        onlyMainContent: true,
        waitFor: 3000,
      }),
    });

    const scrapeData = await scrapeResponse.json();

    if (!scrapeResponse.ok) {
      console.error("Firecrawl Scrape API error:", scrapeData);
      return new Response(
        JSON.stringify({ success: false, error: scrapeData.error || `Scrape request failed with status ${scrapeResponse.status}` }),
        { status: scrapeResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract product URLs from the scraped content
    const markdown = scrapeData.data?.markdown || scrapeData.markdown || "";
    const links = scrapeData.data?.links || scrapeData.links || [];
    
    // Extract domain from the category URL
    const urlObj = new URL(formattedUrl);
    const domain = urlObj.origin;
    
    // Method 1: Extract from links array
    let productUrls: string[] = links.filter((link: string) => 
      link.includes("/product/") && 
      !link.includes("/product-category/") &&
      !link.includes("#") &&
      !link.includes("?add-to-cart=") &&
      !link.includes("?") &&
      link.startsWith(domain)
    );

    // Method 2: Extract product URLs from markdown content
    const markdownUrlPattern = /\]\((https?:\/\/[^\s)]+\/product\/[^\/\s)]+\/?)\)/g;
    let match;
    while ((match = markdownUrlPattern.exec(markdown)) !== null) {
      const productUrl = match[1].replace(/\/$/, ""); // Remove trailing slash
      if (!productUrl.includes("?") && !productUrls.includes(productUrl)) {
        productUrls.push(productUrl);
      }
    }

    // Method 3: Try Firecrawl Map as fallback if no products found
    if (productUrls.length === 0) {
      console.log("No products found via scrape, trying Map API...");
      
      const mapResponse = await fetch("https://api.firecrawl.dev/v1/map", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: formattedUrl,
          limit: limit,
          includeSubdomains: false,
        }),
      });

      const mapData = await mapResponse.json();

      if (mapResponse.ok) {
        const allUrls = mapData.links || [];
        productUrls = allUrls.filter((link: string) => 
          link.includes("/product/") && 
          !link.includes("/product-category/") &&
          !link.includes("#") &&
          !link.includes("?")
        );
      }
    }

    // Remove duplicates and normalize URLs
    productUrls = [...new Set(productUrls.map((url: string) => url.replace(/\/$/, "")))];
    
    // Limit results
    productUrls = productUrls.slice(0, limit);

    console.log(`Found ${productUrls.length} product URLs in category`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        productUrls,
        totalFound: productUrls.length,
        categoryUrl: formattedUrl
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error mapping category:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to map category";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

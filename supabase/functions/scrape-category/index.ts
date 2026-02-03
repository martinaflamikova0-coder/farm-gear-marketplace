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

    console.log("Mapping category URL:", formattedUrl);

    // First, use Firecrawl Map to discover all product URLs
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

    if (!mapResponse.ok) {
      console.error("Firecrawl Map API error:", mapData);
      return new Response(
        JSON.stringify({ success: false, error: mapData.error || `Map request failed with status ${mapResponse.status}` }),
        { status: mapResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Filter for product URLs only
    const allUrls = mapData.links || [];
    const productUrls = allUrls.filter((link: string) => 
      link.includes("/product/") && 
      !link.includes("/product-category/") &&
      !link.includes("#") &&
      !link.includes("?")
    );

    // Remove duplicates
    const uniqueProductUrls = [...new Set(productUrls)];

    console.log(`Found ${uniqueProductUrls.length} product URLs in category`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        productUrls: uniqueProductUrls,
        totalFound: uniqueProductUrls.length,
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

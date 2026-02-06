import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface WatermarkResult {
  productId: string;
  productTitle: string;
  referenceNumber: number;
  hasWatermark: boolean;
  detectedBrands: string[];
  affectedImages: string[];
  confidence: number;
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
        JSON.stringify({ error: "Unauthorized - No valid authorization header" }),
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
        JSON.stringify({ error: "Unauthorized - Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;

    // ========== ADMIN ROLE CHECK ==========
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: isAdmin, error: roleError } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin"
    });

    if (roleError || !isAdmin) {
      console.error("Role check failed:", roleError);
      return new Response(
        JSON.stringify({ error: "Forbidden - Admin role required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ========== BUSINESS LOGIC ==========
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { productIds, scanAll = false, limit = 50 } = await req.json();

    console.log("Watermark detection started by admin:", userId);

    // Fetch products to scan
    let query = supabase
      .from("products")
      .select("id, title, reference_number, images, merchant_safe_image_url")
      .eq("status", "active")
      .not("images", "is", null);

    if (productIds && productIds.length > 0) {
      query = query.in("id", productIds);
    } else if (!scanAll) {
      query = query.limit(limit);
    }

    const { data: products, error: fetchError } = await query;

    if (fetchError) {
      throw new Error(`Failed to fetch products: ${fetchError.message}`);
    }

    if (!products || products.length === 0) {
      return new Response(
        JSON.stringify({ results: [], message: "No products to scan" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results: WatermarkResult[] = [];

    // Process products in batches to avoid rate limits
    for (const product of products) {
      const images = product.images || [];
      if (images.length === 0) continue;

      // Only check the first image for efficiency (main image)
      const imageUrl = images[0];
      
      try {
        const aiResponse = await fetch(
          "https://ai.gateway.lovable.dev/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [
                {
                  role: "user",
                  content: [
                    {
                      type: "text",
                      text: `You are a watermark detection expert. Carefully analyze this product image.

TASK: Find any DIGITAL OVERLAYS, WATERMARKS, or THIRD-PARTY LOGOS that have been ADDED to the image (not physically on the product).

SPECIFICALLY LOOK FOR:
1. "AGRIEURO" or "AgriEuro" text anywhere on the image - THIS IS THE MAIN TARGET
2. Website URLs (like agrieuro.com, agrieuro.fr, etc.)
3. Stock photo watermarks (Shutterstock, Getty, etc.)
4. Any semi-transparent text or logo overlays
5. Copyright notices that look added digitally
6. Competitor brand names as overlays

IGNORE (do not report these):
- Brand names physically printed ON the product itself (like John Deere on a tractor)
- Model numbers on equipment
- Manufacturer labels that are part of the physical product
- Product stickers that came with the item

BE VERY CAREFUL: AgriEuro watermarks are often in corners or edges of images, sometimes semi-transparent.

If you see ANY text overlay that says "AGRIEURO", "AgriEuro", or similar - report hasWatermark: true.`,
                    },
                    {
                      type: "image_url",
                      image_url: {
                        url: imageUrl,
                      },
                    },
                  ],
                },
              ],
              tools: [
                {
                  type: "function",
                  function: {
                    name: "report_watermark_detection",
                    description: "Report the watermark detection results",
                    parameters: {
                      type: "object",
                      properties: {
                        hasWatermark: {
                          type: "boolean",
                          description: "Whether a watermark or third-party overlay was detected",
                        },
                        detectedBrands: {
                          type: "array",
                          items: { type: "string" },
                          description: "List of detected brand names or watermarks",
                        },
                        confidence: {
                          type: "number",
                          description: "Confidence level from 0 to 1",
                        },
                      },
                      required: ["hasWatermark", "detectedBrands", "confidence"],
                      additionalProperties: false,
                    },
                  },
                },
              ],
              tool_choice: {
                type: "function",
                function: { name: "report_watermark_detection" },
              },
            }),
          }
        );

        if (aiResponse.status === 429) {
          console.log("Rate limited, waiting before continuing...");
          await new Promise((resolve) => setTimeout(resolve, 5000));
          continue;
        }

        if (!aiResponse.ok) {
          console.error(`AI error for product ${product.id}:`, await aiResponse.text());
          continue;
        }

        const aiData = await aiResponse.json();
        const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
        
        if (toolCall?.function?.arguments) {
          const detection = JSON.parse(toolCall.function.arguments);
          
          if (detection.hasWatermark) {
            results.push({
              productId: product.id,
              productTitle: product.title,
              referenceNumber: product.reference_number,
              hasWatermark: detection.hasWatermark,
              detectedBrands: detection.detectedBrands,
              affectedImages: [imageUrl],
              confidence: detection.confidence,
            });
          }
        }

        // Small delay between requests to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (imageError) {
        console.error(`Error processing image for product ${product.id}:`, imageError);
      }
    }

    return new Response(
      JSON.stringify({
        results,
        scannedCount: products.length,
        issuesFound: results.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("detect-watermarks error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

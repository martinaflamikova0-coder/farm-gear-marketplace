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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { productIds, scanAll = false, limit = 50 } = await req.json();

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
                      text: `Analyze this product image for watermarks, logos, or brand names that are overlaid on the image (not part of the actual product). 
                      
Common watermarks to detect include: AGRIEURO, AgriEuro, stock photo watermarks, competitor brand overlays, website URLs, copyright text overlays.

DO NOT report:
- Brand names that are physically part of the product (like a John Deere logo on a tractor)
- Model numbers on the equipment itself
- Manufacturer labels that are part of the product

ONLY report overlay watermarks that are added to the image digitally.

Respond with a JSON object:
{
  "hasWatermark": boolean,
  "detectedBrands": ["brand1", "brand2"],
  "confidence": number between 0 and 1
}`,
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

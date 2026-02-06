import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SUPPORTED_LANGUAGES = ["en", "fr", "de", "es", "it", "pt"];

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  fr: "French",
  de: "German",
  es: "Spanish",
  it: "Italian",
  pt: "Portuguese",
};

interface ProductInput {
  title?: string;
  description?: string;
  specifications?: string[];
  brand?: string;
  category?: string;
  price?: number;
}

interface GeneratedContent {
  title: string;
  description: string;
  title_translations: Record<string, string>;
  description_translations: Record<string, string>;
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
    const { product, sourceLang = "de" }: { product: ProductInput; sourceLang?: string } = await req.json();

    if (!product) {
      return new Response(
        JSON.stringify({ success: false, error: "Product data is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const targetLanguages = SUPPORTED_LANGUAGES.filter(lang => lang !== sourceLang);

    // Build context from product data
    const context = `
Product Information:
- Original Title: ${product.title || "Unknown"}
- Brand: ${product.brand || "Unknown"}
- Category: ${product.category || "Unknown"}
- Price: ${product.price ? `${product.price}€` : "Unknown"}
- Original Description: ${product.description || "No description"}
- Specifications: ${product.specifications?.join(", ") || "None"}
    `.trim();

    const prompt = `You are an expert e-commerce copywriter specializing in construction and industrial equipment.

Based on the following product information, generate:
1. A professional, SEO-optimized product title in ${LANGUAGE_NAMES[sourceLang]}
2. A compelling product description (2-3 paragraphs) in ${LANGUAGE_NAMES[sourceLang]}
3. Translations of both title and description into: ${targetLanguages.map(l => LANGUAGE_NAMES[l]).join(", ")}

${context}

IMPORTANT RULES:
- Keep brand names, model numbers, and technical specifications unchanged
- Make titles concise but descriptive (max 80 characters)
- Descriptions should highlight key features and benefits
- Use professional, technical language appropriate for B2B customers
- Maintain consistent tone across all languages
- Return ONLY valid JSON, no markdown or explanation

Return a JSON object with this exact structure:
{
  "title": "Optimized title in ${LANGUAGE_NAMES[sourceLang]}",
  "description": "Compelling description in ${LANGUAGE_NAMES[sourceLang]}",
  "title_translations": {
    ${targetLanguages.map(l => `"${l}": "translated title in ${LANGUAGE_NAMES[l]}"`).join(",\n    ")}
  },
  "description_translations": {
    ${targetLanguages.map(l => `"${l}": "translated description in ${LANGUAGE_NAMES[l]}"`).join(",\n    ")}
  }
}`;

    console.log("Generating content for product:", product.title, "by admin:", userId);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a professional e-commerce copywriter. Return only valid JSON, no markdown formatting." },
          { role: "user", content: prompt },
        ],
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: "Rate limit exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: "Payment required, please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content received from AI");
    }

    console.log("Raw AI response received");

    // Parse the JSON response
    let generatedContent: GeneratedContent;
    try {
      const cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      generatedContent = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI response");
    }

    // Add source language to translations
    generatedContent.title_translations = {
      [sourceLang]: generatedContent.title,
      ...generatedContent.title_translations,
    };
    generatedContent.description_translations = {
      [sourceLang]: generatedContent.description,
      ...generatedContent.description_translations,
    };

    console.log("Content generated successfully");

    return new Response(
      JSON.stringify({ success: true, content: generatedContent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Content generation error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

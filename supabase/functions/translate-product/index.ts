import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productId, title, description, sourceLang = "fr" } = await req.json();

    if (!productId || !title) {
      return new Response(
        JSON.stringify({ error: "productId and title are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build translation prompt
    const targetLanguages = SUPPORTED_LANGUAGES.filter(lang => lang !== sourceLang);
    
    const prompt = `You are a professional translator specializing in agricultural equipment and machinery. 
Translate the following product listing from ${LANGUAGE_NAMES[sourceLang]} to ${targetLanguages.map(l => LANGUAGE_NAMES[l]).join(", ")}.

IMPORTANT RULES:
- Keep technical terms, brand names, and model numbers unchanged
- Maintain the same tone and style
- Keep measurements and numbers as-is
- Return ONLY valid JSON, no markdown or explanation

Product Title: "${title}"
${description ? `Product Description: "${description}"` : ""}

Return a JSON object with this exact structure:
{
  "title_translations": {
    ${targetLanguages.map(l => `"${l}": "translated title in ${LANGUAGE_NAMES[l]}"`).join(",\n    ")}
  }${description ? `,
  "description_translations": {
    ${targetLanguages.map(l => `"${l}": "translated description in ${LANGUAGE_NAMES[l]}"`).join(",\n    ")}
  }` : ""}
}`;

    console.log("Requesting translation for product:", productId);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a professional translator. Return only valid JSON, no markdown formatting." },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No translation content received");
    }

    console.log("Raw AI response:", content);

    // Parse the JSON response (handle potential markdown wrapping)
    let translations;
    try {
      // Remove potential markdown code blocks
      const cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      translations = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse translation response:", content);
      throw new Error("Failed to parse translation response");
    }

    // Add source language to translations
    const titleTranslations = {
      [sourceLang]: title,
      ...translations.title_translations,
    };

    const descriptionTranslations = description
      ? {
          [sourceLang]: description,
          ...translations.description_translations,
        }
      : {};

    // Update the product in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

    const { error: updateError } = await supabaseAdmin
      .from("products")
      .update({
        title_translations: titleTranslations,
        description_translations: descriptionTranslations,
      })
      .eq("id", productId);

    if (updateError) {
      console.error("Database update error:", updateError);
      throw new Error(`Failed to save translations: ${updateError.message}`);
    }

    console.log("Translations saved successfully for product:", productId);

    return new Response(
      JSON.stringify({
        success: true,
        title_translations: titleTranslations,
        description_translations: descriptionTranslations,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Translation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

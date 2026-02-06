import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Helper to escape SQL strings
const escapeSql = (value: unknown): string => {
  if (value === null || value === undefined) {
    return "NULL";
  }
  if (typeof value === "boolean") {
    return value ? "TRUE" : "FALSE";
  }
  if (typeof value === "number") {
    return String(value);
  }
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return "'{}'";
    }
    const escaped = value.map((v) => escapeSql(v).replace(/^'|'$/g, "")).join(",");
    return `ARRAY[${value.map((v) => `'${String(v).replace(/'/g, "''")}'`).join(",")}]`;
  }
  if (typeof value === "object") {
    return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
  }
  return `'${String(value).replace(/'/g, "''")}'`;
};

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

    console.log(`Export all data requested by admin user ${userId}`);

    // ========== BUSINESS LOGIC ==========
    // Fetch all data from all tables
    const [
      { data: products },
      { data: categories },
      { data: brands },
      { data: testimonials },
      { data: shippingZones },
      { data: bankAccounts },
      { data: promotions },
      { data: paypalSettings },
      { data: merchantSettings },
    ] = await Promise.all([
      supabase.from("products").select("*").order("reference_number"),
      supabase.from("categories").select("*").order("sort_order"),
      supabase.from("brands").select("*").order("sort_order"),
      supabase.from("testimonials").select("*"),
      supabase.from("shipping_zones").select("*").order("sort_order"),
      supabase.from("bank_accounts").select("*"),
      supabase.from("promotions").select("*"),
      supabase.from("paypal_settings").select("*").limit(1),
      supabase.from("merchant_center_settings").select("*"),
    ]);

    let sql = `-- =====================================================
-- SCRIPT D'IMPORT COMPLET - Généré le ${new Date().toISOString()}
-- =====================================================
-- Ce script contient TOUTES les données du projet :
-- - ${products?.length || 0} produits (avec traductions et images)
-- - ${categories?.length || 0} catégories
-- - ${brands?.length || 0} marques
-- - ${testimonials?.length || 0} témoignages
-- - ${shippingZones?.length || 0} zones de livraison
-- - ${bankAccounts?.length || 0} comptes bancaires
-- - ${promotions?.length || 0} promotions
-- - Paramètres PayPal et Merchant Center
-- =====================================================

-- IMPORTANT: Exécutez ce script dans Cloud → Database → Run SQL
-- après avoir créé le remix du projet.

`;

    // Categories
    sql += `\n-- ==================== CATEGORIES ====================\n`;
    sql += `DELETE FROM categories WHERE TRUE;\n\n`;
    for (const cat of categories || []) {
      sql += `INSERT INTO categories (id, name, slug, description, icon, parent_id, sort_order, created_at, updated_at) VALUES (
  ${escapeSql(cat.id)},
  ${escapeSql(cat.name)},
  ${escapeSql(cat.slug)},
  ${escapeSql(cat.description)},
  ${escapeSql(cat.icon)},
  ${escapeSql(cat.parent_id)},
  ${escapeSql(cat.sort_order)},
  ${escapeSql(cat.created_at)},
  ${escapeSql(cat.updated_at)}
);\n`;
    }

    // Brands
    sql += `\n-- ==================== MARQUES ====================\n`;
    sql += `DELETE FROM brands WHERE TRUE;\n\n`;
    for (const brand of brands || []) {
      sql += `INSERT INTO brands (id, name, slug, logo_url, category_id, sort_order, created_at, updated_at) VALUES (
  ${escapeSql(brand.id)},
  ${escapeSql(brand.name)},
  ${escapeSql(brand.slug)},
  ${escapeSql(brand.logo_url)},
  ${escapeSql(brand.category_id)},
  ${escapeSql(brand.sort_order)},
  ${escapeSql(brand.created_at)},
  ${escapeSql(brand.updated_at)}
);\n`;
    }

    // Testimonials
    sql += `\n-- ==================== TEMOIGNAGES ====================\n`;
    sql += `DELETE FROM testimonials WHERE TRUE;\n\n`;
    for (const t of testimonials || []) {
      sql += `INSERT INTO testimonials (id, author_name, author_company, author_location, content, content_translations, rating, is_featured, is_active, created_at, updated_at) VALUES (
  ${escapeSql(t.id)},
  ${escapeSql(t.author_name)},
  ${escapeSql(t.author_company)},
  ${escapeSql(t.author_location)},
  ${escapeSql(t.content)},
  ${escapeSql(t.content_translations)},
  ${escapeSql(t.rating)},
  ${escapeSql(t.is_featured)},
  ${escapeSql(t.is_active)},
  ${escapeSql(t.created_at)},
  ${escapeSql(t.updated_at)}
);\n`;
    }

    // Shipping zones
    sql += `\n-- ==================== ZONES DE LIVRAISON ====================\n`;
    sql += `DELETE FROM shipping_zones WHERE TRUE;\n\n`;
    for (const zone of shippingZones || []) {
      sql += `INSERT INTO shipping_zones (id, name, countries, min_days, max_days, is_active, sort_order, created_at, updated_at) VALUES (
  ${escapeSql(zone.id)},
  ${escapeSql(zone.name)},
  ${escapeSql(zone.countries)},
  ${escapeSql(zone.min_days)},
  ${escapeSql(zone.max_days)},
  ${escapeSql(zone.is_active)},
  ${escapeSql(zone.sort_order)},
  ${escapeSql(zone.created_at)},
  ${escapeSql(zone.updated_at)}
);\n`;
    }

    // Bank accounts
    sql += `\n-- ==================== COMPTES BANCAIRES ====================\n`;
    sql += `DELETE FROM bank_accounts WHERE TRUE;\n\n`;
    for (const acc of bankAccounts || []) {
      sql += `INSERT INTO bank_accounts (id, account_key, name, bank_name, iban, bic, holder, threshold_min, threshold_max, is_active, created_at, updated_at) VALUES (
  ${escapeSql(acc.id)},
  ${escapeSql(acc.account_key)},
  ${escapeSql(acc.name)},
  ${escapeSql(acc.bank_name)},
  ${escapeSql(acc.iban)},
  ${escapeSql(acc.bic)},
  ${escapeSql(acc.holder)},
  ${escapeSql(acc.threshold_min)},
  ${escapeSql(acc.threshold_max)},
  ${escapeSql(acc.is_active)},
  ${escapeSql(acc.created_at)},
  ${escapeSql(acc.updated_at)}
);\n`;
    }

    // Promotions
    sql += `\n-- ==================== PROMOTIONS ====================\n`;
    sql += `DELETE FROM promotions WHERE TRUE;\n\n`;
    for (const promo of promotions || []) {
      sql += `INSERT INTO promotions (id, name, description, discount_type, discount_value, applies_to, target_categories, target_product_ids, min_price, max_price, start_date, end_date, is_active, priority, created_at, updated_at) VALUES (
  ${escapeSql(promo.id)},
  ${escapeSql(promo.name)},
  ${escapeSql(promo.description)},
  ${escapeSql(promo.discount_type)},
  ${escapeSql(promo.discount_value)},
  ${escapeSql(promo.applies_to)},
  ${escapeSql(promo.target_categories)},
  ${escapeSql(promo.target_product_ids)},
  ${escapeSql(promo.min_price)},
  ${escapeSql(promo.max_price)},
  ${escapeSql(promo.start_date)},
  ${escapeSql(promo.end_date)},
  ${escapeSql(promo.is_active)},
  ${escapeSql(promo.priority)},
  ${escapeSql(promo.created_at)},
  ${escapeSql(promo.updated_at)}
);\n`;
    }

    // PayPal settings
    sql += `\n-- ==================== PARAMETRES PAYPAL ====================\n`;
    sql += `DELETE FROM paypal_settings WHERE TRUE;\n\n`;
    for (const pp of paypalSettings || []) {
      sql += `INSERT INTO paypal_settings (id, client_id, sandbox_mode, is_active, created_at, updated_at) VALUES (
  ${escapeSql(pp.id)},
  ${escapeSql(pp.client_id)},
  ${escapeSql(pp.sandbox_mode)},
  ${escapeSql(pp.is_active)},
  ${escapeSql(pp.created_at)},
  ${escapeSql(pp.updated_at)}
);\n`;
    }

    // Merchant Center settings
    sql += `\n-- ==================== MERCHANT CENTER SETTINGS ====================\n`;
    sql += `DELETE FROM merchant_center_settings WHERE TRUE;\n\n`;
    for (const mc of merchantSettings || []) {
      sql += `INSERT INTO merchant_center_settings (id, key, value, description, category, updated_at) VALUES (
  ${escapeSql(mc.id)},
  ${escapeSql(mc.key)},
  ${escapeSql(mc.value)},
  ${escapeSql(mc.description)},
  ${escapeSql(mc.category)},
  ${escapeSql(mc.updated_at)}
);\n`;
    }

    // Products (the big one!)
    sql += `\n-- ==================== PRODUITS (${products?.length || 0}) ====================\n`;
    sql += `-- ATTENTION: Les images pointent vers l'ancien projet Supabase.\n`;
    sql += `-- Elles resteront accessibles tant que l'ancien projet existe.\n\n`;
    sql += `DELETE FROM products WHERE TRUE;\n\n`;

    // Reset sequence for reference_number
    sql += `-- Reset sequence for reference_number\n`;
    sql += `SELECT setval('products_reference_number_seq', (SELECT COALESCE(MAX(reference_number), 0) + 1 FROM products), false);\n\n`;

    for (const p of products || []) {
      sql += `INSERT INTO products (
  id, title, title_translations, description, description_translations,
  category, subcategory, brand, model, year, hours, kilometers,
  price, original_price, discount_percentage, price_type, condition,
  location, department, images, customer_images,
  merchant_safe_image_url, merchant_safe_additional_images,
  featured, status, stock, low_stock_threshold, reference_number,
  seller_name, seller_phone, seller_email, created_by, created_at, updated_at
) VALUES (
  ${escapeSql(p.id)},
  ${escapeSql(p.title)},
  ${escapeSql(p.title_translations)},
  ${escapeSql(p.description)},
  ${escapeSql(p.description_translations)},
  ${escapeSql(p.category)},
  ${escapeSql(p.subcategory)},
  ${escapeSql(p.brand)},
  ${escapeSql(p.model)},
  ${escapeSql(p.year)},
  ${escapeSql(p.hours)},
  ${escapeSql(p.kilometers)},
  ${escapeSql(p.price)},
  ${escapeSql(p.original_price)},
  ${escapeSql(p.discount_percentage)},
  ${escapeSql(p.price_type)},
  ${escapeSql(p.condition)},
  ${escapeSql(p.location)},
  ${escapeSql(p.department)},
  ${escapeSql(p.images)},
  ${escapeSql(p.customer_images)},
  ${escapeSql(p.merchant_safe_image_url)},
  ${escapeSql(p.merchant_safe_additional_images)},
  ${escapeSql(p.featured)},
  ${escapeSql(p.status)},
  ${escapeSql(p.stock)},
  ${escapeSql(p.low_stock_threshold)},
  ${escapeSql(p.reference_number)},
  ${escapeSql(p.seller_name)},
  ${escapeSql(p.seller_phone)},
  ${escapeSql(p.seller_email)},
  ${escapeSql(p.created_by)},
  ${escapeSql(p.created_at)},
  ${escapeSql(p.updated_at)}
);\n\n`;
    }

    // Update sequence after inserts
    sql += `-- Update reference_number sequence to continue from max\n`;
    sql += `SELECT setval('products_reference_number_seq', (SELECT COALESCE(MAX(reference_number), 0) + 1 FROM products), false);\n`;

    sql += `\n-- =====================================================\n`;
    sql += `-- FIN DU SCRIPT - Import terminé !\n`;
    sql += `-- =====================================================\n`;

    return new Response(sql, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="COMPLETE_DATA_EXPORT_${new Date().toISOString().split("T")[0]}.sql"`,
      },
    });
  } catch (error: unknown) {
    console.error("Export error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

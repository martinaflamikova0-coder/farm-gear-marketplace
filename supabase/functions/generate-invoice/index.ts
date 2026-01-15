import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { orderId } = await req.json();

    if (!orderId) {
      return new Response(
        JSON.stringify({ error: "Order ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch order with items
    const { data: order, error: orderError } = await supabaseClient
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: orderItems, error: itemsError } = await supabaseClient
      .from("order_items")
      .select("*")
      .eq("order_id", orderId);

    if (itemsError) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch order items" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate invoice number
    const invoiceNumber = `INV-${new Date(order.created_at).getFullYear()}-${order.id.slice(0, 8).toUpperCase()}`;
    const invoiceDate = new Date(order.created_at).toLocaleDateString("fr-FR");
    
    // Calculate totals
    const subtotal = orderItems.reduce((sum: number, item: any) => sum + (item.product_price * item.quantity), 0);
    const tva = subtotal * 0.20; // 20% TVA
    const total = subtotal + tva;

    // Generate HTML invoice
    const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Facture ${invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; line-height: 1.6; }
    .invoice { max-width: 800px; margin: 0 auto; padding: 40px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 3px solid #2d5a27; padding-bottom: 20px; }
    .logo { font-size: 28px; font-weight: bold; color: #2d5a27; }
    .logo span { color: #f59e0b; }
    .invoice-info { text-align: right; }
    .invoice-info h1 { font-size: 32px; color: #2d5a27; margin-bottom: 5px; }
    .invoice-info p { color: #666; }
    .addresses { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .address-block { width: 45%; }
    .address-block h3 { color: #2d5a27; margin-bottom: 10px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
    .address-block p { color: #555; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    th { background: #2d5a27; color: white; padding: 12px; text-align: left; }
    td { padding: 12px; border-bottom: 1px solid #ddd; }
    tr:nth-child(even) { background: #f9f9f9; }
    .totals { width: 300px; margin-left: auto; }
    .totals table { margin-bottom: 0; }
    .totals td { border: none; padding: 8px 12px; }
    .totals tr:last-child { background: #2d5a27; color: white; font-weight: bold; font-size: 18px; }
    .totals tr:last-child td { padding: 15px 12px; }
    .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #888; font-size: 12px; }
    .status { display: inline-block; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
    .status-pending { background: #fef3c7; color: #d97706; }
    .status-confirmed { background: #d1fae5; color: #059669; }
    .status-shipped { background: #dbeafe; color: #2563eb; }
    .status-delivered { background: #dcfce7; color: #16a34a; }
    .status-cancelled { background: #fee2e2; color: #dc2626; }
    .bank-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 30px; }
    .bank-info h3 { color: #2d5a27; margin-bottom: 10px; }
    .bank-info p { margin: 5px 0; color: #555; }
    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .invoice { padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      <div class="logo">Equip<span>Trade</span></div>
      <div class="invoice-info">
        <h1>FACTURE</h1>
        <p><strong>N°:</strong> ${invoiceNumber}</p>
        <p><strong>Date:</strong> ${invoiceDate}</p>
        <p><span class="status status-${order.status}">${getStatusLabel(order.status)}</span></p>
      </div>
    </div>
    
    <div class="addresses">
      <div class="address-block">
        <h3>Vendeur</h3>
        <p><strong>EquipTrade</strong></p>
        <p>Marketplace de Matériel Agricole</p>
        <p>France</p>
        <p>contact@equiptrade.fr</p>
      </div>
      <div class="address-block">
        <h3>Facturé à</h3>
        <p><strong>${order.shipping_name || 'N/A'}</strong></p>
        <p>${order.shipping_address || ''}</p>
        <p>${order.shipping_postal_code || ''} ${order.shipping_city || ''}</p>
        <p>${order.shipping_country || 'France'}</p>
        <p>${order.shipping_email || ''}</p>
        <p>${order.shipping_phone || ''}</p>
      </div>
    </div>
    
    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th style="text-align: center;">Quantité</th>
          <th style="text-align: right;">Prix unitaire</th>
          <th style="text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${orderItems.map((item: any) => `
        <tr>
          <td>${item.product_title}</td>
          <td style="text-align: center;">${item.quantity}</td>
          <td style="text-align: right;">${formatPrice(item.product_price)}</td>
          <td style="text-align: right;">${formatPrice(item.product_price * item.quantity)}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>
    
    <div class="totals">
      <table>
        <tr>
          <td>Sous-total HT</td>
          <td style="text-align: right;">${formatPrice(subtotal / 1.20)}</td>
        </tr>
        <tr>
          <td>TVA (20%)</td>
          <td style="text-align: right;">${formatPrice(subtotal - subtotal / 1.20)}</td>
        </tr>
        <tr>
          <td>Total TTC</td>
          <td style="text-align: right;">${formatPrice(subtotal)}</td>
        </tr>
      </table>
    </div>
    
    <div class="bank-info">
      <h3>Informations de paiement</h3>
      <p><strong>Mode de paiement:</strong> Virement bancaire</p>
      ${order.total_amount < 5000 ? `
      <p><strong>IBAN:</strong> FR76 XXXX XXXX XXXX XXXX XXXX XXX</p>
      <p><strong>BIC:</strong> BNPAFRPP</p>
      ` : `
      <p><strong>IBAN:</strong> FR76 YYYY YYYY YYYY YYYY YYYY YYY</p>
      <p><strong>BIC:</strong> CRLYFRPP</p>
      `}
      <p><strong>Référence:</strong> ${invoiceNumber}</p>
    </div>
    
    <div class="footer">
      <p>EquipTrade - Marketplace de Matériel Agricole</p>
      <p>Document généré automatiquement - Facture valide sans signature</p>
    </div>
  </div>
</body>
</html>
    `;

    return new Response(htmlContent, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Error generating invoice:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate invoice" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function formatPrice(price: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: "En attente",
    confirmed: "Confirmée",
    shipped: "Expédiée",
    delivered: "Livrée",
    cancelled: "Annulée",
  };
  return labels[status] || status;
}

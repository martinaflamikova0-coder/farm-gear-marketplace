import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";

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

    // Generate invoice number and date
    const invoiceNumber = `INV-${new Date(order.created_at).getFullYear()}-${order.id.slice(0, 8).toUpperCase()}`;
    const invoiceDate = new Date(order.created_at).toLocaleDateString("fr-FR");

    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size in points
    const { width, height } = page.getSize();

    // Embed fonts
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Colors
    const primaryColor = rgb(0.18, 0.35, 0.15); // #2d5a27
    const accentColor = rgb(0.96, 0.62, 0.04); // #f59e0b
    const textColor = rgb(0.2, 0.2, 0.2);
    const mutedColor = rgb(0.4, 0.4, 0.4);

    let yPos = height - 50;

    // Header - Logo
    page.drawText("Equip", {
      x: 50,
      y: yPos,
      size: 28,
      font: helveticaBold,
      color: primaryColor,
    });
    page.drawText("Trade", {
      x: 50 + helveticaBold.widthOfTextAtSize("Equip", 28),
      y: yPos,
      size: 28,
      font: helveticaBold,
      color: accentColor,
    });

    // Header - Invoice info (right side)
    page.drawText("FACTURE", {
      x: width - 150,
      y: yPos,
      size: 24,
      font: helveticaBold,
      color: primaryColor,
    });

    yPos -= 25;
    page.drawText(`N°: ${invoiceNumber}`, {
      x: width - 150,
      y: yPos,
      size: 10,
      font: helvetica,
      color: mutedColor,
    });

    yPos -= 15;
    page.drawText(`Date: ${invoiceDate}`, {
      x: width - 150,
      y: yPos,
      size: 10,
      font: helvetica,
      color: mutedColor,
    });

    yPos -= 15;
    page.drawText(`Statut: ${getStatusLabel(order.status)}`, {
      x: width - 150,
      y: yPos,
      size: 10,
      font: helvetica,
      color: mutedColor,
    });

    // Header line
    yPos -= 20;
    page.drawLine({
      start: { x: 50, y: yPos },
      end: { x: width - 50, y: yPos },
      thickness: 2,
      color: primaryColor,
    });

    // Addresses section
    yPos -= 40;

    // Seller address
    page.drawText("VENDEUR", {
      x: 50,
      y: yPos,
      size: 10,
      font: helveticaBold,
      color: primaryColor,
    });
    yPos -= 18;
    page.drawText("EquipTrade", { x: 50, y: yPos, size: 11, font: helveticaBold, color: textColor });
    yPos -= 15;
    page.drawText("Marketplace de Matériel Agricole", { x: 50, y: yPos, size: 10, font: helvetica, color: mutedColor });
    yPos -= 15;
    page.drawText("France", { x: 50, y: yPos, size: 10, font: helvetica, color: mutedColor });
    yPos -= 15;
    page.drawText("contact@equiptrade.fr", { x: 50, y: yPos, size: 10, font: helvetica, color: mutedColor });

    // Client address (right side)
    let clientY = yPos + 63;
    page.drawText("FACTURÉ À", {
      x: 320,
      y: clientY,
      size: 10,
      font: helveticaBold,
      color: primaryColor,
    });
    clientY -= 18;
    page.drawText(order.shipping_name || "N/A", { x: 320, y: clientY, size: 11, font: helveticaBold, color: textColor });
    clientY -= 15;
    if (order.shipping_address) {
      page.drawText(order.shipping_address, { x: 320, y: clientY, size: 10, font: helvetica, color: mutedColor });
      clientY -= 15;
    }
    page.drawText(`${order.shipping_postal_code || ""} ${order.shipping_city || ""}`.trim(), { x: 320, y: clientY, size: 10, font: helvetica, color: mutedColor });
    clientY -= 15;
    page.drawText(order.shipping_country || "France", { x: 320, y: clientY, size: 10, font: helvetica, color: mutedColor });
    clientY -= 15;
    if (order.shipping_email) {
      page.drawText(order.shipping_email, { x: 320, y: clientY, size: 10, font: helvetica, color: mutedColor });
      clientY -= 15;
    }
    if (order.shipping_phone) {
      page.drawText(order.shipping_phone, { x: 320, y: clientY, size: 10, font: helvetica, color: mutedColor });
    }

    // Items table
    yPos -= 60;

    // Table header
    page.drawRectangle({
      x: 50,
      y: yPos - 5,
      width: width - 100,
      height: 25,
      color: primaryColor,
    });

    page.drawText("Description", { x: 55, y: yPos + 3, size: 10, font: helveticaBold, color: rgb(1, 1, 1) });
    page.drawText("Qté", { x: 340, y: yPos + 3, size: 10, font: helveticaBold, color: rgb(1, 1, 1) });
    page.drawText("Prix unit.", { x: 390, y: yPos + 3, size: 10, font: helveticaBold, color: rgb(1, 1, 1) });
    page.drawText("Total", { x: 480, y: yPos + 3, size: 10, font: helveticaBold, color: rgb(1, 1, 1) });

    yPos -= 25;

    // Table rows
    let subtotalHT = 0;
    for (let i = 0; i < orderItems.length; i++) {
      const item = orderItems[i];
      const itemTotal = item.product_price * item.quantity;
      subtotalHT += itemTotal;

      // Alternate row background
      if (i % 2 === 1) {
        page.drawRectangle({
          x: 50,
          y: yPos - 5,
          width: width - 100,
          height: 22,
          color: rgb(0.97, 0.97, 0.97),
        });
      }

      // Truncate long titles
      let title = item.product_title;
      if (title.length > 40) {
        title = title.substring(0, 37) + "...";
      }

      page.drawText(title, { x: 55, y: yPos + 3, size: 10, font: helvetica, color: textColor });
      page.drawText(item.quantity.toString(), { x: 350, y: yPos + 3, size: 10, font: helvetica, color: textColor });
      page.drawText(formatPrice(item.product_price), { x: 390, y: yPos + 3, size: 10, font: helvetica, color: textColor });
      page.drawText(formatPrice(itemTotal), { x: 480, y: yPos + 3, size: 10, font: helvetica, color: textColor });

      yPos -= 22;
    }

    // Separator line
    yPos -= 10;
    page.drawLine({
      start: { x: 50, y: yPos },
      end: { x: width - 50, y: yPos },
      thickness: 0.5,
      color: rgb(0.85, 0.85, 0.85),
    });

    // Totals section (right aligned)
    yPos -= 30;
    const totalsX = 380;

    // Calculate HT and TVA
    const htAmount = subtotalHT / 1.20;
    const tvaAmount = subtotalHT - htAmount;

    page.drawText("Sous-total HT:", { x: totalsX, y: yPos, size: 10, font: helvetica, color: mutedColor });
    page.drawText(formatPrice(htAmount), { x: 480, y: yPos, size: 10, font: helvetica, color: textColor });

    yPos -= 18;
    page.drawText("TVA (20%):", { x: totalsX, y: yPos, size: 10, font: helvetica, color: mutedColor });
    page.drawText(formatPrice(tvaAmount), { x: 480, y: yPos, size: 10, font: helvetica, color: textColor });

    yPos -= 25;
    // Total TTC box
    page.drawRectangle({
      x: totalsX - 10,
      y: yPos - 8,
      width: width - totalsX - 30,
      height: 28,
      color: primaryColor,
    });
    page.drawText("TOTAL TTC:", { x: totalsX, y: yPos, size: 12, font: helveticaBold, color: rgb(1, 1, 1) });
    page.drawText(formatPrice(subtotalHT), { x: 475, y: yPos, size: 12, font: helveticaBold, color: rgb(1, 1, 1) });

    // Bank info section
    yPos -= 60;
    page.drawRectangle({
      x: 50,
      y: yPos - 80,
      width: width - 100,
      height: 95,
      color: rgb(0.97, 0.97, 0.97),
      borderColor: rgb(0.9, 0.9, 0.9),
      borderWidth: 1,
    });

    page.drawText("Informations de paiement", { x: 60, y: yPos - 15, size: 12, font: helveticaBold, color: primaryColor });
    page.drawText("Mode de paiement: Virement bancaire", { x: 60, y: yPos - 35, size: 10, font: helvetica, color: mutedColor });
    
    const bankDetails = order.total_amount < 5000 
      ? { iban: "FR76 1234 5678 9012 3456 7890 123", bic: "AGRIFRPP" }
      : { iban: "FR76 9876 5432 1098 7654 3210 987", bic: "BNPAFRPP" };
    
    page.drawText(`IBAN: ${bankDetails.iban}`, { x: 60, y: yPos - 50, size: 10, font: helvetica, color: mutedColor });
    page.drawText(`BIC: ${bankDetails.bic}`, { x: 60, y: yPos - 65, size: 10, font: helvetica, color: mutedColor });
    page.drawText(`Référence: ${invoiceNumber}`, { x: 350, y: yPos - 50, size: 10, font: helvetica, color: mutedColor });

    // Footer
    const footerY = 50;
    page.drawLine({
      start: { x: 50, y: footerY + 20 },
      end: { x: width - 50, y: footerY + 20 },
      thickness: 0.5,
      color: rgb(0.85, 0.85, 0.85),
    });

    page.drawText("EquipTrade - Marketplace de Matériel Agricole", {
      x: 180,
      y: footerY + 5,
      size: 9,
      font: helvetica,
      color: mutedColor,
    });
    page.drawText("Document généré automatiquement - Facture valide sans signature", {
      x: 150,
      y: footerY - 10,
      size: 8,
      font: helvetica,
      color: rgb(0.6, 0.6, 0.6),
    });

    // Serialize PDF to bytes
    const pdfBytes = await pdfDoc.save();

    return new Response(new Uint8Array(pdfBytes).buffer as ArrayBuffer, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="facture-${invoiceNumber}.pdf"`,
      },
    });
  } catch (error: unknown) {
    console.error("Error generating invoice:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: "Failed to generate invoice", details: errorMessage }),
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

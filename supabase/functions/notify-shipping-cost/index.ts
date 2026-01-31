import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotifyShippingCostRequest {
  orderId: string;
  customerEmail: string;
  shippingCost: number;
  supplement: number;
  orderTotal: number;
  language?: string;
}

const translations: Record<string, { subject: string; greeting: string; intro: string; details: string; covered: string; supplement: string; newTotal: string; contact: string; thanks: string; team: string }> = {
  fr: {
    subject: "Frais de livraison pour votre commande",
    greeting: "Bonjour",
    intro: "Les frais de livraison pour votre commande ont été calculés.",
    details: "Détails de la livraison",
    covered: "Frais pris en charge par EkipTrade (offerts)",
    supplement: "Supplément à votre charge",
    newTotal: "Nouveau total de votre commande",
    contact: "Veuillez nous contacter pour régler ce supplément avant l'expédition de votre commande.",
    thanks: "Merci pour votre confiance.",
    team: "L'équipe EkipTrade",
  },
  en: {
    subject: "Shipping costs for your order",
    greeting: "Hello",
    intro: "The shipping costs for your order have been calculated.",
    details: "Shipping details",
    covered: "Shipping covered by EkipTrade (free)",
    supplement: "Additional charge",
    newTotal: "New order total",
    contact: "Please contact us to pay this supplement before your order is shipped.",
    thanks: "Thank you for your trust.",
    team: "The EkipTrade Team",
  },
  de: {
    subject: "Versandkosten für Ihre Bestellung",
    greeting: "Hallo",
    intro: "Die Versandkosten für Ihre Bestellung wurden berechnet.",
    details: "Versanddetails",
    covered: "Von EkipTrade übernommene Versandkosten (kostenlos)",
    supplement: "Zusätzliche Gebühr",
    newTotal: "Neuer Bestellbetrag",
    contact: "Bitte kontaktieren Sie uns, um diesen Aufpreis vor dem Versand zu bezahlen.",
    thanks: "Vielen Dank für Ihr Vertrauen.",
    team: "Das EkipTrade-Team",
  },
  es: {
    subject: "Gastos de envío de su pedido",
    greeting: "Hola",
    intro: "Los gastos de envío de su pedido han sido calculados.",
    details: "Detalles del envío",
    covered: "Envío cubierto por EkipTrade (gratis)",
    supplement: "Cargo adicional",
    newTotal: "Nuevo total del pedido",
    contact: "Por favor, contáctenos para pagar este suplemento antes del envío.",
    thanks: "Gracias por su confianza.",
    team: "El equipo EkipTrade",
  },
  it: {
    subject: "Spese di spedizione per il tuo ordine",
    greeting: "Ciao",
    intro: "Le spese di spedizione per il tuo ordine sono state calcolate.",
    details: "Dettagli della spedizione",
    covered: "Spedizione coperta da EkipTrade (gratuita)",
    supplement: "Supplemento a tuo carico",
    newTotal: "Nuovo totale ordine",
    contact: "Ti preghiamo di contattarci per pagare questo supplemento prima della spedizione.",
    thanks: "Grazie per la tua fiducia.",
    team: "Il team EkipTrade",
  },
  pt: {
    subject: "Custos de envio da sua encomenda",
    greeting: "Olá",
    intro: "Os custos de envio da sua encomenda foram calculados.",
    details: "Detalhes do envio",
    covered: "Envio coberto pela EkipTrade (grátis)",
    supplement: "Suplemento a seu cargo",
    newTotal: "Novo total da encomenda",
    contact: "Por favor contacte-nos para pagar este suplemento antes do envio.",
    thanks: "Obrigado pela sua confiança.",
    team: "A equipa EkipTrade",
  },
};

const FREE_SHIPPING_LIMIT = 150;

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const requestBody = await req.json();
    const { orderId, customerEmail, shippingCost, supplement, orderTotal, language = 'fr' }: NotifyShippingCostRequest = requestBody;

    if (!orderId || !customerEmail || shippingCost === undefined) {
      throw new Error("Missing required fields: orderId, customerEmail, shippingCost");
    }
    
    if (!resendApiKey) {
      console.log("RESEND_API_KEY not configured - logging notification instead");
      console.log("Shipping cost notification would be sent:", requestBody);
      return new Response(
        JSON.stringify({ success: true, message: "Notification logged (RESEND_API_KEY not configured)" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const t = translations[language] || translations.fr;
    const coveredAmount = Math.min(shippingCost, FREE_SHIPPING_LIMIT);
    const newTotal = orderTotal + supplement;

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #16a34a; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">EkipTrade</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #333333; margin: 0 0 20px 0;">${t.greeting},</h2>
              <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                ${t.intro}
              </p>
              
              <!-- Order reference -->
              <div style="background-color: #f8f9fa; border-radius: 6px; padding: 15px; margin-bottom: 20px;">
                <p style="margin: 0; font-size: 14px; color: #666666;">
                  Commande / Order: <strong style="color: #333333;">#${orderId.slice(0, 8).toUpperCase()}</strong>
                </p>
              </div>
              
              <!-- Shipping details -->
              <h3 style="color: #333333; margin: 30px 0 15px 0;">${t.details}</h3>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden;">
                <tr style="background-color: #f9fafb;">
                  <td style="padding: 12px 15px; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: #666666;">${t.covered}</span>
                  </td>
                  <td style="padding: 12px 15px; border-bottom: 1px solid #e5e7eb; text-align: right;">
                    <span style="color: #16a34a; font-weight: bold;">-${coveredAmount}€</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 15px; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: #333333; font-weight: bold;">${t.supplement}</span>
                  </td>
                  <td style="padding: 12px 15px; border-bottom: 1px solid #e5e7eb; text-align: right;">
                    <span style="color: #dc2626; font-weight: bold; font-size: 18px;">${supplement}€</span>
                  </td>
                </tr>
                <tr style="background-color: #f9fafb;">
                  <td style="padding: 12px 15px;">
                    <span style="color: #333333; font-weight: bold;">${t.newTotal}</span>
                  </td>
                  <td style="padding: 12px 15px; text-align: right;">
                    <span style="color: #333333; font-weight: bold; font-size: 18px;">${newTotal.toLocaleString('fr-FR')}€</span>
                  </td>
                </tr>
              </table>
              
              <!-- Contact message -->
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 25px 0;">
                <p style="margin: 0; color: #92400e; font-size: 14px;">
                  ${t.contact}
                </p>
              </div>
              
              <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 20px 0 0 0;">
                ${t.thanks}<br><br>
                <strong>${t.team}</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} EkipTrade. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // Send email to customer
    const customerEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "EkipTrade <infos@ekiptrade.com>",
        to: [customerEmail],
        subject: `${t.subject} #${orderId.slice(0, 8).toUpperCase()}`,
        html: emailHtml,
      }),
    });

    if (!customerEmailResponse.ok) {
      const errorData = await customerEmailResponse.json().catch(() => ({}));
      console.error("Resend API error (customer):", errorData);
      throw new Error(`Failed to send customer email: ${JSON.stringify(errorData)}`);
    }

    console.log(`Shipping cost notification sent to customer: ${customerEmail}`);

    // Also send notification to admin
    const adminEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "EkipTrade <infos@ekiptrade.com>",
        to: ["infos@ekiptrade.com"],
        subject: `[Admin] Notification frais de port envoyée - Commande #${orderId.slice(0, 8).toUpperCase()}`,
        html: `
          <h2>Notification de frais de port envoyée</h2>
          <p>Le client <strong>${customerEmail}</strong> a été notifié des frais de port :</p>
          <ul>
            <li>Commande : #${orderId.slice(0, 8).toUpperCase()}</li>
            <li>Frais couverts : ${coveredAmount}€</li>
            <li>Supplément : ${supplement}€</li>
            <li>Nouveau total : ${newTotal.toLocaleString('fr-FR')}€</li>
          </ul>
        `,
      }),
    });

    if (!adminEmailResponse.ok) {
      console.error("Failed to send admin notification, but customer was notified");
    }

    console.log(`Shipping cost notification also sent to admin for order ${orderId}`);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in notify-shipping-cost:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);

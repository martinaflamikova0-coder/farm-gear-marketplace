import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderConfirmationRequest {
  orderId: string;
  customerEmail: string;
  customerName: string;
  orderTotal: number;
  paymentMethod: string;
  language?: string;
}

const translations: Record<string, {
  subject: string;
  greeting: string;
  orderConfirmed: string;
  orderDetails: string;
  orderNumber: string;
  total: string;
  paymentMethod: string;
  bankTransfer: string;
  paypal: string;
  nextSteps: string;
  bankStep1: string;
  bankStep2: string;
  paypalStep: string;
  questions: string;
  thanks: string;
  team: string;
}> = {
  fr: {
    subject: "Confirmation de votre commande",
    greeting: "Bonjour",
    orderConfirmed: "Votre commande a été enregistrée avec succès !",
    orderDetails: "Détails de la commande",
    orderNumber: "Numéro de commande",
    total: "Total",
    paymentMethod: "Mode de paiement",
    bankTransfer: "Virement bancaire",
    paypal: "PayPal",
    nextSteps: "Prochaines étapes",
    bankStep1: "Votre paiement est en cours de vérification.",
    bankStep2: "Nous vous contacterons dès réception pour confirmer l'expédition.",
    paypalStep: "Votre paiement a été confirmé. Votre commande sera préparée dans les plus brefs délais.",
    questions: "Pour toute question, n'hésitez pas à nous contacter à infos@ekip-trade.com ou au +44 7883 782699.",
    thanks: "Merci pour votre confiance !",
    team: "L'équipe EkipTrade",
  },
  en: {
    subject: "Order Confirmation",
    greeting: "Hello",
    orderConfirmed: "Your order has been successfully registered!",
    orderDetails: "Order Details",
    orderNumber: "Order Number",
    total: "Total",
    paymentMethod: "Payment Method",
    bankTransfer: "Bank Transfer",
    paypal: "PayPal",
    nextSteps: "Next Steps",
    bankStep1: "Your payment is being verified.",
    bankStep2: "We will contact you upon receipt to confirm shipment.",
    paypalStep: "Your payment has been confirmed. Your order will be prepared as soon as possible.",
    questions: "For any questions, feel free to contact us at infos@ekip-trade.com or +44 7883 782699.",
    thanks: "Thank you for your trust!",
    team: "The EkipTrade Team",
  },
  de: {
    subject: "Bestellbestätigung",
    greeting: "Hallo",
    orderConfirmed: "Ihre Bestellung wurde erfolgreich registriert!",
    orderDetails: "Bestelldetails",
    orderNumber: "Bestellnummer",
    total: "Gesamt",
    paymentMethod: "Zahlungsmethode",
    bankTransfer: "Banküberweisung",
    paypal: "PayPal",
    nextSteps: "Nächste Schritte",
    bankStep1: "Ihre Zahlung wird überprüft.",
    bankStep2: "Wir werden Sie nach Eingang kontaktieren, um den Versand zu bestätigen.",
    paypalStep: "Ihre Zahlung wurde bestätigt. Ihre Bestellung wird so schnell wie möglich vorbereitet.",
    questions: "Bei Fragen können Sie uns gerne unter infos@ekip-trade.com oder +44 7883 782699 kontaktieren.",
    thanks: "Vielen Dank für Ihr Vertrauen!",
    team: "Das EkipTrade-Team",
  },
  es: {
    subject: "Confirmación de pedido",
    greeting: "Hola",
    orderConfirmed: "¡Su pedido ha sido registrado con éxito!",
    orderDetails: "Detalles del pedido",
    orderNumber: "Número de pedido",
    total: "Total",
    paymentMethod: "Método de pago",
    bankTransfer: "Transferencia bancaria",
    paypal: "PayPal",
    nextSteps: "Próximos pasos",
    bankStep1: "Su pago está siendo verificado.",
    bankStep2: "Le contactaremos a la recepción para confirmar el envío.",
    paypalStep: "Su pago ha sido confirmado. Su pedido será preparado lo antes posible.",
    questions: "Para cualquier pregunta, no dude en contactarnos en infos@ekip-trade.com o +44 7883 782699.",
    thanks: "¡Gracias por su confianza!",
    team: "El equipo EkipTrade",
  },
  it: {
    subject: "Conferma ordine",
    greeting: "Ciao",
    orderConfirmed: "Il tuo ordine è stato registrato con successo!",
    orderDetails: "Dettagli ordine",
    orderNumber: "Numero ordine",
    total: "Totale",
    paymentMethod: "Metodo di pagamento",
    bankTransfer: "Bonifico bancario",
    paypal: "PayPal",
    nextSteps: "Prossimi passi",
    bankStep1: "Il tuo pagamento è in fase di verifica.",
    bankStep2: "Ti contatteremo al ricevimento per confermare la spedizione.",
    paypalStep: "Il tuo pagamento è stato confermato. Il tuo ordine sarà preparato il prima possibile.",
    questions: "Per qualsiasi domanda, non esitare a contattarci a infos@ekiptrade.com o +44 7883 782699.",
    thanks: "Grazie per la tua fiducia!",
    team: "Il team EkipTrade",
  },
  pt: {
    subject: "Confirmação de encomenda",
    greeting: "Olá",
    orderConfirmed: "A sua encomenda foi registada com sucesso!",
    orderDetails: "Detalhes da encomenda",
    orderNumber: "Número da encomenda",
    total: "Total",
    paymentMethod: "Método de pagamento",
    bankTransfer: "Transferência bancária",
    paypal: "PayPal",
    nextSteps: "Próximos passos",
    bankStep1: "O seu pagamento está a ser verificado.",
    bankStep2: "Contactá-lo-emos após a receção para confirmar o envio.",
    paypalStep: "O seu pagamento foi confirmado. A sua encomenda será preparada o mais rapidamente possível.",
    questions: "Para qualquer questão, não hesite em contactar-nos em infos@ekiptrade.com ou +44 7883 782699.",
    thanks: "Obrigado pela sua confiança!",
    team: "A equipa EkipTrade",
  },
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    // Verify authentication - user must be logged in
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("Missing or invalid Authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let userId: string | null = null;
    if (supabaseUrl && supabaseAnonKey) {
      const authClient = createClient(supabaseUrl, supabaseAnonKey);
      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: authError } = await authClient.auth.getUser(token);
      
      if (authError || !user) {
        console.error("Auth verification failed:", authError);
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      userId = user.id;
      console.log(`Order confirmation request by user ${userId}`);
    }

    const { orderId, customerEmail, customerName, orderTotal, paymentMethod, language = 'fr' }: OrderConfirmationRequest = await req.json();

    if (!orderId || !customerEmail) {
      throw new Error("Missing required fields: orderId, customerEmail");
    }

    // Verify user owns this order (or is admin)
    if (supabaseUrl && supabaseServiceKey && userId) {
      const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
      
      const { data: order } = await serviceClient
        .from("orders")
        .select("user_id")
        .eq("id", orderId)
        .single();

      const { data: isAdmin } = await serviceClient.rpc("has_role", { 
        _user_id: userId, 
        _role: "admin" 
      });

      if (order && order.user_id !== userId && !isAdmin) {
        console.error(`User ${userId} attempted to send confirmation for order ${orderId} owned by ${order.user_id}`);
        return new Response(
          JSON.stringify({ error: "Forbidden" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const t = translations[language] || translations.fr;
    const paymentLabel = paymentMethod === 'paypal' ? t.paypal : t.bankTransfer;
    const shortOrderId = orderId.slice(0, 8).toUpperCase();

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
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">✓ ${t.orderConfirmed}</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #333333; margin: 0 0 20px 0;">${t.greeting} ${customerName},</h2>
              
              <!-- Order details -->
              <div style="background-color: #f8f9fa; border-radius: 6px; padding: 20px; margin-bottom: 25px;">
                <h3 style="margin: 0 0 15px 0; color: #333333;">${t.orderDetails}</h3>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                      <span style="color: #666666;">${t.orderNumber}</span>
                    </td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                      <strong style="color: #333333;">#${shortOrderId}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                      <span style="color: #666666;">${t.paymentMethod}</span>
                    </td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                      <span style="color: #333333;">${paymentLabel}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0;">
                      <span style="color: #333333; font-weight: bold;">${t.total}</span>
                    </td>
                    <td style="padding: 12px 0; text-align: right;">
                      <span style="color: #16a34a; font-weight: bold; font-size: 20px;">${orderTotal.toLocaleString('fr-FR')} €</span>
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- Next steps -->
              <div style="background-color: #d1fae5; border-left: 4px solid #16a34a; padding: 15px; margin-bottom: 25px;">
                <h4 style="margin: 0 0 10px 0; color: #166534;">${t.nextSteps}</h4>
                ${paymentMethod === 'paypal' 
                  ? `<p style="margin: 0; color: #166534; font-size: 14px;">${t.paypalStep}</p>`
                  : `<p style="margin: 0 0 8px 0; color: #166534; font-size: 14px;">1. ${t.bankStep1}</p>
                     <p style="margin: 0; color: #166534; font-size: 14px;">2. ${t.bankStep2}</p>`
                }
              </div>
              
              <!-- Contact info -->
              <p style="color: #666666; font-size: 14px; margin: 0 0 20px 0;">
                ${t.questions}
              </p>
              
              <p style="color: #333333; font-size: 16px; margin: 20px 0 0 0;">
                ${t.thanks}<br><br>
                <strong>${t.team}</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 5px 0; color: #666666; font-size: 12px;">
                EkipTrade Ltd - Wednesbury Trading Estate, Block P
              </p>
              <p style="margin: 0 0 5px 0; color: #666666; font-size: 12px;">
                Wednesbury WS10 7JN, United Kingdom
              </p>
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

    if (!resendApiKey) {
      console.log("RESEND_API_KEY not configured - logging notification instead");
      console.log("Order confirmation would be sent to:", customerEmail);
      return new Response(
        JSON.stringify({ success: true, message: "Notification logged (RESEND_API_KEY not configured)" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
        subject: `${t.subject} #${shortOrderId}`,
        html: emailHtml,
      }),
    });

    if (!customerEmailResponse.ok) {
      const errorData = await customerEmailResponse.json().catch(() => ({}));
      console.error("Resend API error (customer):", errorData);
      throw new Error(`Failed to send customer email: ${JSON.stringify(errorData)}`);
    }

    console.log(`Order confirmation sent to customer: ${customerEmail}`);

    // Send notification to admin
    const adminHtml = `
      <h2>Nouvelle commande reçue!</h2>
      <p><strong>Commande:</strong> #${shortOrderId}</p>
      <p><strong>Client:</strong> ${customerName} (${customerEmail})</p>
      <p><strong>Total:</strong> ${orderTotal.toLocaleString('fr-FR')} €</p>
      <p><strong>Paiement:</strong> ${paymentLabel}</p>
      <p><strong>Langue:</strong> ${language.toUpperCase()}</p>
      <hr>
      <p><a href="https://ekiptrade.com/admin/orders">Voir dans l'admin</a></p>
    `;

    const adminEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "EkipTrade <infos@ekiptrade.com>",
        to: ["infos@ekiptrade.com"],
        subject: `🛒 Nouvelle commande #${shortOrderId} - ${orderTotal.toLocaleString('fr-FR')} €`,
        html: adminHtml,
      }),
    });

    if (!adminEmailResponse.ok) {
      console.error("Failed to send admin notification, but customer was notified");
    }

    console.log(`Order confirmation also sent to admin for order ${orderId}`);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-order-confirmation:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);

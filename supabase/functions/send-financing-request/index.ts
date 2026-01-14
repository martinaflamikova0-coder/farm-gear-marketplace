import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
interface FinancingRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  siret?: string;
  downPayment?: string;
  preferredDuration: number;
  additionalInfo?: string;
  productId: string;
  productTitle: string;
  productPrice: number;
  selectedDuration: number;
  monthlyPayment: number;
}

const formatPrice = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: FinancingRequest = await req.json();
    console.log("Received financing request:", JSON.stringify(data, null, 2));

    // Validate required fields
    if (!data.firstName || !data.lastName || !data.email || !data.phone || !data.productTitle) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if RESEND_API_KEY is configured
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!resendApiKey) {
      console.log("RESEND_API_KEY not configured. Logging financing request for later processing.");
      console.log("=== FINANCING REQUEST ===");
      console.log(`Product: ${data.productTitle}`);
      console.log(`Price: ${formatPrice(data.productPrice)}`);
      console.log(`Duration: ${data.selectedDuration} months`);
      console.log(`Monthly Payment: ${formatPrice(data.monthlyPayment)}`);
      console.log(`Customer: ${data.firstName} ${data.lastName}`);
      console.log(`Email: ${data.email}`);
      console.log(`Phone: ${data.phone}`);
      console.log(`Company: ${data.company || 'N/A'}`);
      console.log(`SIRET: ${data.siret || 'N/A'}`);
      console.log(`Down Payment: ${data.downPayment ? formatPrice(parseInt(data.downPayment)) : 'N/A'}`);
      console.log(`Additional Info: ${data.additionalInfo || 'N/A'}`);
      console.log("=========================");
      
      // Return success even without email - request is logged
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Financing request received and logged. Email will be sent once Resend is configured." 
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Import Resend dynamically only if API key is available
    const resendModule = await import("https://esm.sh/resend@2.0.0");
    const Resend = resendModule.Resend;
    const resend = new Resend(resendApiKey);

    // Build email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Demande de financement</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #16a34a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .section { margin-bottom: 20px; }
          .section-title { font-weight: bold; color: #16a34a; margin-bottom: 10px; border-bottom: 2px solid #16a34a; padding-bottom: 5px; }
          .row { display: flex; margin-bottom: 8px; }
          .label { font-weight: 600; width: 150px; }
          .value { flex: 1; }
          .highlight { background: #d1fae5; padding: 15px; border-radius: 8px; margin-top: 20px; }
          .price { font-size: 24px; font-weight: bold; color: #16a34a; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚜 Nouvelle demande de financement</h1>
          </div>
          <div class="content">
            <div class="section">
              <div class="section-title">📦 Produit concerné</div>
              <div class="row"><span class="label">Produit :</span><span class="value">${data.productTitle}</span></div>
              <div class="row"><span class="label">Prix total :</span><span class="value">${formatPrice(data.productPrice)}</span></div>
              <div class="row"><span class="label">Durée souhaitée :</span><span class="value">${data.selectedDuration} mois</span></div>
              <div class="row"><span class="label">Mensualité estimée :</span><span class="value price">${formatPrice(data.monthlyPayment)}/mois</span></div>
              ${data.downPayment ? `<div class="row"><span class="label">Apport proposé :</span><span class="value">${formatPrice(parseInt(data.downPayment))}</span></div>` : ''}
            </div>
            
            <div class="section">
              <div class="section-title">👤 Informations client</div>
              <div class="row"><span class="label">Nom :</span><span class="value">${data.firstName} ${data.lastName}</span></div>
              <div class="row"><span class="label">Email :</span><span class="value"><a href="mailto:${data.email}">${data.email}</a></span></div>
              <div class="row"><span class="label">Téléphone :</span><span class="value"><a href="tel:${data.phone}">${data.phone}</a></span></div>
              ${data.company ? `<div class="row"><span class="label">Entreprise :</span><span class="value">${data.company}</span></div>` : ''}
              ${data.siret ? `<div class="row"><span class="label">SIRET :</span><span class="value">${data.siret}</span></div>` : ''}
            </div>
            
            ${data.additionalInfo ? `
            <div class="section">
              <div class="section-title">💬 Informations complémentaires</div>
              <p>${data.additionalInfo}</p>
            </div>
            ` : ''}
            
            <div class="highlight">
              <strong>⚡ Action requise :</strong> Contactez ce prospect dans les plus brefs délais pour lui proposer une offre de financement personnalisée.
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email to admin
    const adminEmailResponse = await resend.emails.send({
      from: "EquipTrade <onboarding@resend.dev>",
      to: ["contact@equiptrade.com"], // Replace with actual admin email
      subject: `🚜 Nouvelle demande de financement - ${data.productTitle}`,
      html: emailHtml,
    });

    console.log("Admin email sent:", adminEmailResponse);

    // Send confirmation email to customer
    const customerEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Confirmation de votre demande de financement</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #16a34a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .highlight { background: #d1fae5; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .price { font-size: 20px; font-weight: bold; color: #16a34a; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Demande de financement reçue</h1>
          </div>
          <div class="content">
            <p>Bonjour ${data.firstName},</p>
            
            <p>Nous avons bien reçu votre demande de financement pour :</p>
            
            <div class="highlight">
              <strong>${data.productTitle}</strong><br>
              Prix : ${formatPrice(data.productPrice)}<br>
              Durée : ${data.selectedDuration} mois<br>
              Mensualité estimée : <span class="price">${formatPrice(data.monthlyPayment)}/mois</span>
            </div>
            
            <p>Notre équipe commerciale vous contactera dans les plus brefs délais pour vous proposer une offre de financement personnalisée.</p>
            
            <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
            
            <p>Cordialement,<br>L'équipe EquipTrade</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const customerEmailResponse = await resend.emails.send({
      from: "EquipTrade <onboarding@resend.dev>",
      to: [data.email],
      subject: "✅ Votre demande de financement a été reçue - EquipTrade",
      html: customerEmailHtml,
    });

    console.log("Customer confirmation email sent:", customerEmailResponse);

    return new Response(
      JSON.stringify({ success: true, message: "Financing request sent successfully" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-financing-request function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  firstName: string;
  lastName: string;
  language?: string;
}

const translations: Record<string, {
  subject: string;
  greeting: string;
  welcome: string;
  intro: string;
  benefits: string;
  benefit1: string;
  benefit2: string;
  benefit3: string;
  benefit4: string;
  cta: string;
  ctaButton: string;
  questions: string;
  thanks: string;
  team: string;
}> = {
  fr: {
    subject: "Bienvenue chez EkipTrade !",
    greeting: "Bonjour",
    welcome: "Bienvenue chez EkipTrade !",
    intro: "Votre compte a été créé avec succès. Vous faites désormais partie de notre communauté de professionnels du matériel agricole.",
    benefits: "Avec votre compte EkipTrade, vous pouvez :",
    benefit1: "Parcourir notre catalogue de matériel agricole neuf et d'occasion",
    benefit2: "Ajouter des articles à votre panier et passer commande",
    benefit3: "Suivre vos commandes et accéder à vos factures",
    benefit4: "Bénéficier de nos offres exclusives",
    cta: "Commencez à explorer notre catalogue dès maintenant :",
    ctaButton: "Voir les annonces",
    questions: "Si vous avez des questions, n'hésitez pas à nous contacter à infos@ekip-trade.com ou au +39 377 389 0872.",
    thanks: "Merci pour votre confiance.",
    team: "L'équipe EkipTrade",
  },
  en: {
    subject: "Welcome to EkipTrade!",
    greeting: "Hello",
    welcome: "Welcome to EkipTrade!",
    intro: "Your account has been successfully created. You are now part of our community of agricultural equipment professionals.",
    benefits: "With your EkipTrade account, you can:",
    benefit1: "Browse our catalog of new and used agricultural equipment",
    benefit2: "Add items to your cart and place orders",
    benefit3: "Track your orders and access your invoices",
    benefit4: "Benefit from our exclusive offers",
    cta: "Start exploring our catalog now:",
    ctaButton: "View listings",
    questions: "If you have any questions, feel free to contact us at infos@ekip-trade.com or +39 377 389 0872.",
    thanks: "Thank you for your trust.",
    team: "The EkipTrade Team",
  },
  de: {
    subject: "Willkommen bei EkipTrade!",
    greeting: "Hallo",
    welcome: "Willkommen bei EkipTrade!",
    intro: "Ihr Konto wurde erfolgreich erstellt. Sie sind jetzt Teil unserer Gemeinschaft von Landtechnik-Profis.",
    benefits: "Mit Ihrem EkipTrade-Konto können Sie:",
    benefit1: "Unseren Katalog mit neuen und gebrauchten Landmaschinen durchsuchen",
    benefit2: "Artikel in den Warenkorb legen und bestellen",
    benefit3: "Ihre Bestellungen verfolgen und auf Ihre Rechnungen zugreifen",
    benefit4: "Von unseren exklusiven Angeboten profitieren",
    cta: "Beginnen Sie jetzt mit der Erkundung unseres Katalogs:",
    ctaButton: "Anzeigen ansehen",
    questions: "Bei Fragen kontaktieren Sie uns gerne unter infos@ekip-trade.com oder +39 377 389 0872.",
    thanks: "Vielen Dank für Ihr Vertrauen.",
    team: "Das EkipTrade-Team",
  },
  es: {
    subject: "¡Bienvenido a EkipTrade!",
    greeting: "Hola",
    welcome: "¡Bienvenido a EkipTrade!",
    intro: "Su cuenta ha sido creada con éxito. Ahora forma parte de nuestra comunidad de profesionales de maquinaria agrícola.",
    benefits: "Con su cuenta EkipTrade, puede:",
    benefit1: "Explorar nuestro catálogo de maquinaria agrícola nueva y usada",
    benefit2: "Añadir artículos a su carrito y realizar pedidos",
    benefit3: "Seguir sus pedidos y acceder a sus facturas",
    benefit4: "Beneficiarse de nuestras ofertas exclusivas",
    cta: "Comience a explorar nuestro catálogo ahora:",
    ctaButton: "Ver anuncios",
    questions: "Si tiene preguntas, no dude en contactarnos en infos@ekip-trade.com o al +39 377 389 0872.",
    thanks: "Gracias por su confianza.",
    team: "El equipo EkipTrade",
  },
  it: {
    subject: "Benvenuto su EkipTrade!",
    greeting: "Ciao",
    welcome: "Benvenuto su EkipTrade!",
    intro: "Il tuo account è stato creato con successo. Ora fai parte della nostra comunità di professionisti delle macchine agricole.",
    benefits: "Con il tuo account EkipTrade, puoi:",
    benefit1: "Sfogliare il nostro catalogo di macchine agricole nuove e usate",
    benefit2: "Aggiungere articoli al carrello e effettuare ordini",
    benefit3: "Seguire i tuoi ordini e accedere alle tue fatture",
    benefit4: "Beneficiare delle nostre offerte esclusive",
    cta: "Inizia a esplorare il nostro catalogo ora:",
    ctaButton: "Vedi annunci",
    questions: "Per qualsiasi domanda, contattaci a infos@ekip-trade.com o al +44 7883 782699.",
    thanks: "Grazie per la tua fiducia.",
    team: "Il team EkipTrade",
  },
  pt: {
    subject: "Bem-vindo à EkipTrade!",
    greeting: "Olá",
    welcome: "Bem-vindo à EkipTrade!",
    intro: "A sua conta foi criada com sucesso. Agora faz parte da nossa comunidade de profissionais de máquinas agrícolas.",
    benefits: "Com a sua conta EkipTrade, pode:",
    benefit1: "Explorar o nosso catálogo de máquinas agrícolas novas e usadas",
    benefit2: "Adicionar artigos ao carrinho e fazer encomendas",
    benefit3: "Acompanhar as suas encomendas e aceder às suas faturas",
    benefit4: "Beneficiar das nossas ofertas exclusivas",
    cta: "Comece a explorar o nosso catálogo agora:",
    ctaButton: "Ver anúncios",
    questions: "Se tiver dúvidas, contacte-nos em infos@ekip-trade.com ou +44 7883 782699.",
    thanks: "Obrigado pela sua confiança.",
    team: "A equipa EkipTrade",
  },
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const requestBody = await req.json();
    const { email, firstName, lastName, language = 'en' }: WelcomeEmailRequest = requestBody;

    if (!email || !firstName) {
      throw new Error("Missing required fields: email, firstName");
    }

    if (!resendApiKey) {
      console.log("RESEND_API_KEY not configured - logging welcome email instead");
      console.log("Welcome email would be sent to:", email);
      return new Response(
        JSON.stringify({ success: true, message: "Welcome email logged (RESEND_API_KEY not configured)" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const t = translations[language] || translations.en;
    const siteUrl = "https://field-trader-net.lovable.app";

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
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">EkipTrade</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #16a34a; margin: 0 0 20px 0; font-size: 24px;">${t.greeting} ${firstName},</h2>
              
              <h3 style="color: #333333; margin: 0 0 15px 0;">${t.welcome}</h3>
              
              <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                ${t.intro}
              </p>
              
              <!-- Benefits -->
              <div style="background-color: #f0fdf4; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                <h4 style="color: #166534; margin: 0 0 15px 0;">${t.benefits}</h4>
                <ul style="color: #166534; margin: 0; padding-left: 20px; line-height: 1.8;">
                  <li>${t.benefit1}</li>
                  <li>${t.benefit2}</li>
                  <li>${t.benefit3}</li>
                  <li>${t.benefit4}</li>
                </ul>
              </div>
              
              <!-- CTA -->
              <p style="color: #666666; font-size: 16px; margin: 0 0 20px 0;">${t.cta}</p>
              
              <table cellpadding="0" cellspacing="0" style="margin-bottom: 25px;">
                <tr>
                  <td style="background-color: #16a34a; border-radius: 6px;">
                    <a href="${siteUrl}/${language}/annonces" style="display: inline-block; padding: 14px 28px; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px;">
                      ${t.ctaButton}
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Contact info -->
              <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 6px;">
                ${t.questions}
              </p>
              
              <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 20px 0 0 0;">
                ${t.thanks}<br><br>
                <strong>${t.team}</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; color: #666666; font-size: 12px;">
                EkipTrade — Via Vittorio Veneto 118, 28040 Oleggio Castello (NO), Italia — P.IVA: IT10992060011
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

    // Send welcome email to customer
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "EkipTrade <infos@ekip-trade.com>",
        to: [email],
        subject: t.subject,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json().catch(() => ({}));
      console.error("Resend API error:", errorData);
      throw new Error(`Failed to send welcome email: ${JSON.stringify(errorData)}`);
    }

    console.log(`Welcome email sent to: ${email}`);

    // Send notification to admin
    const adminEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "EkipTrade <infos@ekip-trade.com>",
        to: ["infos@ekip-trade.com"],
        subject: `[Admin] Nouveau compte créé - ${firstName} ${lastName}`,
        html: `
          <h2>Nouveau compte client créé</h2>
          <p>Un nouveau client s'est inscrit sur EkipTrade :</p>
          <ul>
            <li><strong>Nom :</strong> ${firstName} ${lastName}</li>
            <li><strong>Email :</strong> ${email}</li>
            <li><strong>Langue :</strong> ${language}</li>
            <li><strong>Date :</strong> ${new Date().toLocaleString('fr-FR')}</li>
          </ul>
        `,
      }),
    });

    if (!adminEmailResponse.ok) {
      console.error("Failed to send admin notification, but customer was notified");
    }

    console.log(`Admin notification sent for new account: ${email}`);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-welcome-email:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const escapeHtml = (str: string): string =>
  str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
  language?: string;
}

const getLocalizedContent = (language: string) => {
  const content: Record<string, { autoReplySubject: string; autoReplyBody: string; teamSubject: string }> = {
    fr: {
      autoReplySubject: "Nous avons bien reçu votre message - GeoItalyAgro",
      autoReplyBody: `
        <p>Bonjour,</p>
        <p>Nous avons bien reçu votre message et nous vous remercions de nous avoir contactés.</p>
        <p>Notre équipe vous répondra dans les plus brefs délais, généralement sous 24 à 48 heures ouvrées.</p>
        <p>Cordialement,<br>L'équipe GeoItalyAgro</p>
      `,
      teamSubject: "Nouveau message de contact",
    },
    en: {
      autoReplySubject: "We received your message - GeoItalyAgro",
      autoReplyBody: `
        <p>Hello,</p>
        <p>We have received your message and thank you for contacting us.</p>
        <p>Our team will get back to you as soon as possible, usually within 24-48 business hours.</p>
        <p>Best regards,<br>The GeoItalyAgro Team</p>
      `,
      teamSubject: "New contact message",
    },
    de: {
      autoReplySubject: "Wir haben Ihre Nachricht erhalten - GeoItalyAgro",
      autoReplyBody: `
        <p>Hallo,</p>
        <p>Wir haben Ihre Nachricht erhalten und danken Ihnen für Ihre Kontaktaufnahme.</p>
        <p>Unser Team wird sich so schnell wie möglich bei Ihnen melden, in der Regel innerhalb von 24-48 Geschäftsstunden.</p>
        <p>Mit freundlichen Grüßen,<br>Das GeoItalyAgro-Team</p>
      `,
      teamSubject: "Neue Kontaktanfrage",
    },
    es: {
      autoReplySubject: "Hemos recibido su mensaje - GeoItalyAgro",
      autoReplyBody: `
        <p>Hola,</p>
        <p>Hemos recibido su mensaje y le agradecemos por contactarnos.</p>
        <p>Nuestro equipo le responderá lo antes posible, normalmente en 24-48 horas hábiles.</p>
        <p>Saludos cordiales,<br>El equipo de GeoItalyAgro</p>
      `,
      teamSubject: "Nuevo mensaje de contacto",
    },
    it: {
      autoReplySubject: "Abbiamo ricevuto il tuo messaggio - GeoItalyAgro",
      autoReplyBody: `
        <p>Ciao,</p>
        <p>Abbiamo ricevuto il tuo messaggio e ti ringraziamo per averci contattato.</p>
        <p>Il nostro team ti risponderà il prima possibile, di solito entro 24-48 ore lavorative.</p>
        <p>Cordiali saluti,<br>Il team GeoItalyAgro</p>
      `,
      teamSubject: "Nuovo messaggio di contatto",
    },
    pt: {
      autoReplySubject: "Recebemos sua mensagem - GeoItalyAgro",
      autoReplyBody: `
        <p>Olá,</p>
        <p>Recebemos sua mensagem e agradecemos por entrar em contato.</p>
        <p>Nossa equipe responderá o mais breve possível, geralmente em 24-48 horas úteis.</p>
        <p>Atenciosamente,<br>Equipe GeoItalyAgro</p>
      `,
      teamSubject: "Nova mensagem de contato",
    },
  };
  return content[language] || content.en;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message, language = 'en' }: ContactRequest = await req.json();

    // Validate required fields
    if (!name || !email || !subject || !message) {
      throw new Error("Missing required fields");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }

    // Validate lengths
    if (name.length > 100 || email.length > 255 || subject.length > 200 || message.length > 5000) {
      throw new Error("Field length exceeded");
    }

    const localizedContent = getLocalizedContent(language);
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message);

    // Send email to the team
    const teamEmail = await resend.emails.send({
      from: "GeoItalyAgro Contact <info@geoitalyagro.com>",
      to: ["info@geoitalyagro.com"],
      reply_to: email,
      subject: `${localizedContent.teamSubject}: ${safeSubject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #166534; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Nouveau Message de Contact</h1>
          </div>
          <div style="padding: 20px; background: #f9f9f9;">
            <p><strong>Nom:</strong> ${safeName}</p>
            <p><strong>Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
            <p><strong>Sujet:</strong> ${safeSubject}</p>
            <p><strong>Langue:</strong> ${escapeHtml(language).toUpperCase()}</p>
            <hr style="border: 1px solid #ddd; margin: 20px 0;">
            <p><strong>Message:</strong></p>
            <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #ddd;">
              ${safeMessage.replace(/\n/g, '<br>')}
            </div>
          </div>
          <div style="padding: 15px; background: #166534; color: white; text-align: center; font-size: 12px;">
            <p style="margin: 0;">GeoItalyAgro - Global Marketplace for Agricultural Equipment</p>
          </div>
        </div>
      `,
    });

    console.log("Team email sent:", teamEmail);

    // Send auto-reply to customer
    const customerEmail = await resend.emails.send({
      from: "GeoItalyAgro <info@geoitalyagro.com>",
      to: [email],
      subject: localizedContent.autoReplySubject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #166534; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">GeoItalyAgro</h1>
          </div>
          <div style="padding: 30px; background: #ffffff;">
            ${localizedContent.autoReplyBody}
            <hr style="border: 1px solid #eee; margin: 25px 0;">
            <p style="color: #666; font-size: 14px;"><strong>Votre message:</strong></p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; color: #333; font-size: 14px;">
              <p><strong>Sujet:</strong> ${subject}</p>
              <p>${message.replace(/\n/g, '<br>')}</p>
            </div>
          </div>
          <div style="padding: 20px; background: #f9f9f9; text-align: center; font-size: 12px; color: #666;">
            <p>GEO ITALY s.r.l. — Via G. Abbate 151, 14054 Castagnole delle Lanze (AT), Italia</p>
            <p>P.IVA: IT01540910054 | +39 0141 877 368 | info@geoitalyagro.com</p>
          </div>
        </div>
      `,
    });

    console.log("Customer auto-reply sent:", customerEmail);

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

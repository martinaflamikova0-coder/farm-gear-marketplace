import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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
      autoReplySubject: "Nous avons bien reçu votre message - EkipTrade",
      autoReplyBody: `
        <p>Bonjour,</p>
        <p>Nous avons bien reçu votre message et nous vous remercions de nous avoir contactés.</p>
        <p>Notre équipe vous répondra dans les plus brefs délais, généralement sous 24 à 48 heures ouvrées.</p>
        <p>Cordialement,<br>L'équipe EkipTrade</p>
      `,
      teamSubject: "Nouveau message de contact",
    },
    en: {
      autoReplySubject: "We received your message - EkipTrade",
      autoReplyBody: `
        <p>Hello,</p>
        <p>We have received your message and thank you for contacting us.</p>
        <p>Our team will get back to you as soon as possible, usually within 24-48 business hours.</p>
        <p>Best regards,<br>The EkipTrade Team</p>
      `,
      teamSubject: "New contact message",
    },
    de: {
      autoReplySubject: "Wir haben Ihre Nachricht erhalten - EkipTrade",
      autoReplyBody: `
        <p>Hallo,</p>
        <p>Wir haben Ihre Nachricht erhalten und danken Ihnen für Ihre Kontaktaufnahme.</p>
        <p>Unser Team wird sich so schnell wie möglich bei Ihnen melden, in der Regel innerhalb von 24-48 Geschäftsstunden.</p>
        <p>Mit freundlichen Grüßen,<br>Das EkipTrade-Team</p>
      `,
      teamSubject: "Neue Kontaktanfrage",
    },
    es: {
      autoReplySubject: "Hemos recibido su mensaje - EkipTrade",
      autoReplyBody: `
        <p>Hola,</p>
        <p>Hemos recibido su mensaje y le agradecemos por contactarnos.</p>
        <p>Nuestro equipo le responderá lo antes posible, normalmente en 24-48 horas hábiles.</p>
        <p>Saludos cordiales,<br>El equipo de EkipTrade</p>
      `,
      teamSubject: "Nuevo mensaje de contacto",
    },
    it: {
      autoReplySubject: "Abbiamo ricevuto il tuo messaggio - EkipTrade",
      autoReplyBody: `
        <p>Ciao,</p>
        <p>Abbiamo ricevuto il tuo messaggio e ti ringraziamo per averci contattato.</p>
        <p>Il nostro team ti risponderà il prima possibile, di solito entro 24-48 ore lavorative.</p>
        <p>Cordiali saluti,<br>Il team EkipTrade</p>
      `,
      teamSubject: "Nuovo messaggio di contatto",
    },
    pt: {
      autoReplySubject: "Recebemos sua mensagem - EkipTrade",
      autoReplyBody: `
        <p>Olá,</p>
        <p>Recebemos sua mensagem e agradecemos por entrar em contato.</p>
        <p>Nossa equipe responderá o mais breve possível, geralmente em 24-48 horas úteis.</p>
        <p>Atenciosamente,<br>Equipe EkipTrade</p>
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

    // Send email to the team
    const teamEmail = await resend.emails.send({
      from: "EkipTrade Contact <infos@ekiptrade.com>",
      to: ["infos@ekiptrade.com"],
      reply_to: email,
      subject: `${localizedContent.teamSubject}: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #166534; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Nouveau Message de Contact</h1>
          </div>
          <div style="padding: 20px; background: #f9f9f9;">
            <p><strong>Nom:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Sujet:</strong> ${subject}</p>
            <p><strong>Langue:</strong> ${language.toUpperCase()}</p>
            <hr style="border: 1px solid #ddd; margin: 20px 0;">
            <p><strong>Message:</strong></p>
            <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #ddd;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
          <div style="padding: 15px; background: #166534; color: white; text-align: center; font-size: 12px;">
            <p style="margin: 0;">EkipTrade - Global Marketplace for Agricultural Equipment</p>
          </div>
        </div>
      `,
    });

    console.log("Team email sent:", teamEmail);

    // Send auto-reply to customer
    const customerEmail = await resend.emails.send({
      from: "EkipTrade <infos@ekiptrade.com>",
      to: [email],
      subject: localizedContent.autoReplySubject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #166534; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">EkipTrade</h1>
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
            <p>EkipTrade - Wednesbury Trading Estate, Block P, Wednesbury WS10 7JN, UK</p>
            <p>+44 7883 782699 | infos@ekiptrade.com</p>
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

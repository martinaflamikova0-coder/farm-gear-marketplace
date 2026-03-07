import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import logoEkiptrade from '@/assets/logo-ekiptrade.png';

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="#25D366">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const ChatBubbleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5">
    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  const whatsappNumber = '393773890872';
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;

  return (
    <>
      {/* Popup */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 z-50 w-[340px] max-w-[calc(100vw-2rem)] rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="bg-foreground px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logoEkiptrade} alt="EkipTrade" className="h-8 w-auto rounded-full bg-white p-0.5" />
              <div>
                <p className="text-primary-foreground font-semibold text-sm">EkipTrade</p>
                <p className="text-primary-foreground/60 text-xs">{t('chat.subtitle', 'Comment pouvons-nous vous aider ?')}</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-primary-foreground/60 hover:text-primary-foreground transition-colors"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="bg-background p-5 space-y-3">
            <h3 className="text-center font-semibold text-foreground text-base mb-4">
              {t('chat.title', 'Comment pouvons-nous vous aider ?')}
            </h3>

            {/* Chat option */}
            <a
              href={`mailto:infos@ekiptrade.com?subject=${encodeURIComponent(t('chat.emailSubject', 'Demande depuis le site'))}`}
              className="flex items-center gap-4 bg-muted hover:bg-muted/80 rounded-xl p-4 transition-colors group"
            >
              <div className="bg-primary/10 rounded-full p-2.5 flex-shrink-0">
                <ChatBubbleIcon />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm group-hover:text-primary transition-colors">
                  {t('chat.emailOption', 'Envoyez-nous un email')}
                </p>
                <p className="text-muted-foreground text-xs">infos@ekiptrade.com</p>
              </div>
            </a>

            {/* WhatsApp option */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-muted hover:bg-muted/80 rounded-xl p-4 transition-colors group"
            >
              <div className="bg-[#25D366]/10 rounded-full p-2.5 flex-shrink-0">
                <WhatsAppIcon />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm group-hover:text-primary transition-colors">
                  {t('chat.whatsappOption', 'Contacter via WhatsApp')}
                </p>
                <p className="text-muted-foreground text-xs">WhatsApp</p>
              </div>
            </a>
          </div>

          {/* Footer */}
          <div className="bg-background border-t border-border px-5 py-3">
            <p className="text-center text-muted-foreground text-xs">
              Powered by EkipTrade
            </p>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-4 z-50 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-4 shadow-lg hover:shadow-xl transition-all"
        aria-label="Chat"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </>
  );
};

export default ChatWidget;

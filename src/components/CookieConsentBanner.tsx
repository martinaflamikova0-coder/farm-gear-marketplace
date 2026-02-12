import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Cookie, X } from 'lucide-react';
import { Link } from 'react-router-dom';

declare global {
  interface Window {
    dataLayer: Array<Record<string, unknown>>;
    gtag: (...args: unknown[]) => void;
  }
}

const CONSENT_KEY = 'ekiptrade_cookie_consent';

type ConsentChoice = 'accepted' | 'rejected' | 'custom';

interface ConsentState {
  choice: ConsentChoice;
  analytics: boolean;
  marketing: boolean;
}

function updateGtagConsent(analytics: boolean, marketing: boolean) {
  if (typeof window.gtag === 'function') {
    window.gtag('consent', 'update', {
      ad_storage: marketing ? 'granted' : 'denied',
      ad_user_data: marketing ? 'granted' : 'denied',
      ad_personalization: marketing ? 'granted' : 'denied',
      analytics_storage: analytics ? 'granted' : 'denied',
    });
  }
}

const CookieConsentBanner = () => {
  const { t, i18n } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored) {
      try {
        const state: ConsentState = JSON.parse(stored);
        updateGtagConsent(state.analytics, state.marketing);
      } catch {
        // corrupt data, show banner
        setVisible(true);
      }
    } else {
      setVisible(true);
    }
  }, []);

  const saveConsent = (state: ConsentState) => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(state));
    updateGtagConsent(state.analytics, state.marketing);
    setVisible(false);
  };

  const handleAcceptAll = () => {
    saveConsent({ choice: 'accepted', analytics: true, marketing: true });
  };

  const handleRejectAll = () => {
    saveConsent({ choice: 'rejected', analytics: false, marketing: false });
  };

  const cookiesPath = i18n.language === 'fr' ? '/fr/cookies' : `/${i18n.language}/cookies`;

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 animate-in slide-in-from-bottom-5 duration-500">
      <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card/95 backdrop-blur-lg shadow-2xl p-5 md:p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-primary/10 p-2 shrink-0 mt-0.5">
            <Cookie className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground text-sm md:text-base">
                {t('cookies.banner.title', '🍪 Nous respectons votre vie privée')}
              </h3>
              <button
                onClick={handleRejectAll}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
              {t(
                'cookies.banner.description',
                'Nous utilisons des cookies pour analyser le trafic et améliorer votre expérience. Vous pouvez accepter ou refuser les cookies non essentiels.'
              )}{' '}
              <Link to={cookiesPath} className="underline text-primary hover:text-primary/80 transition-colors">
                {t('cookies.banner.learnMore', 'En savoir plus')}
              </Link>
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                onClick={handleAcceptAll}
                size="sm"
                className="rounded-full px-5 text-xs md:text-sm"
              >
                {t('cookies.banner.acceptAll', 'Tout accepter')}
              </Button>
              <Button
                onClick={handleRejectAll}
                variant="outline"
                size="sm"
                className="rounded-full px-5 text-xs md:text-sm"
              >
                {t('cookies.banner.rejectAll', 'Tout refuser')}
              </Button>
              <Link to={cookiesPath}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full px-5 text-xs md:text-sm text-muted-foreground"
                >
                  {t('cookies.banner.customize', 'Personnaliser')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;

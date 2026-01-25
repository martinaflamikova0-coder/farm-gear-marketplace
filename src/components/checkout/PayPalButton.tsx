import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { usePaypalSettings } from '@/hooks/usePaypalSettings';
import { useToast } from '@/hooks/use-toast';

interface PayPalButtonProps {
  amount: number;
  currency?: string;
  onSuccess: (details: PayPalOrderDetails) => void;
  onError?: (error: Error) => void;
  onCancel?: () => void;
  disabled?: boolean;
}

interface PayPalOrderDetails {
  id: string;
  status: string;
  payer: {
    email_address: string;
    payer_id: string;
    name?: {
      given_name: string;
      surname: string;
    };
  };
  purchase_units: Array<{
    amount: {
      value: string;
      currency_code: string;
    };
  }>;
}

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: {
        style?: {
          layout?: 'vertical' | 'horizontal';
          color?: 'gold' | 'blue' | 'silver' | 'white' | 'black';
          shape?: 'rect' | 'pill';
          label?: 'paypal' | 'checkout' | 'buynow' | 'pay';
          height?: number;
        };
        createOrder: (data: unknown, actions: {
          order: {
            create: (order: {
              purchase_units: Array<{
                amount: {
                  value: string;
                  currency_code: string;
                };
                description?: string;
              }>;
            }) => Promise<string>;
          };
        }) => Promise<string>;
        onApprove: (data: { orderID: string }, actions: {
          order: {
            capture: () => Promise<PayPalOrderDetails>;
          };
        }) => Promise<void>;
        onError?: (err: Error) => void;
        onCancel?: () => void;
      }) => {
        render: (container: HTMLElement) => Promise<void>;
      };
    };
  }
}

const PayPalButton = ({
  amount,
  currency = 'EUR',
  onSuccess,
  onError,
  onCancel,
  disabled = false,
}: PayPalButtonProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { data: paypalSettings, isLoading: isLoadingSettings } = usePaypalSettings();
  const paypalContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const buttonsRenderedRef = useRef(false);

  // Load PayPal script
  useEffect(() => {
    if (!paypalSettings?.client_id || !paypalSettings.is_active) {
      setIsLoading(false);
      return;
    }

    // Check if script already loaded
    if (window.paypal) {
      setIsScriptLoaded(true);
      setIsLoading(false);
      return;
    }

    const existingScript = document.querySelector('script[src*="paypal.com/sdk"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        setIsScriptLoaded(true);
        setIsLoading(false);
      });
      return;
    }

    const script = document.createElement('script');
    const sandboxParam = paypalSettings.sandbox_mode ? 'sandbox' : 'live';
    script.src = `https://www.paypal.com/sdk/js?client-id=${paypalSettings.client_id}&currency=${currency}&intent=capture`;
    script.async = true;
    script.onload = () => {
      setIsScriptLoaded(true);
      setIsLoading(false);
    };
    script.onerror = () => {
      console.error('Failed to load PayPal SDK');
      setIsLoading(false);
      toast({
        title: t('checkout.paypal.loadError'),
        description: t('checkout.paypal.loadErrorDescription'),
        variant: 'destructive',
      });
    };

    document.body.appendChild(script);

    return () => {
      // Don't remove script on cleanup as it may be needed elsewhere
    };
  }, [paypalSettings, currency, toast, t]);

  // Render PayPal buttons
  useEffect(() => {
    if (!isScriptLoaded || !window.paypal || !paypalContainerRef.current || disabled || buttonsRenderedRef.current) {
      return;
    }

    const container = paypalContainerRef.current;
    
    // Clear previous buttons
    container.innerHTML = '';
    buttonsRenderedRef.current = true;

    try {
      window.paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'pay',
          height: 45,
        },
        createOrder: async (_data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: amount.toFixed(2),
                  currency_code: currency,
                },
                description: 'EquipTrade Order',
              },
            ],
          });
        },
        onApprove: async (_data, actions) => {
          try {
            const details = await actions.order.capture();
            onSuccess(details);
          } catch (err) {
            console.error('PayPal capture error:', err);
            onError?.(err as Error);
            toast({
              title: t('checkout.paypal.captureError'),
              description: t('checkout.paypal.captureErrorDescription'),
              variant: 'destructive',
            });
          }
        },
        onError: (err) => {
          console.error('PayPal error:', err);
          onError?.(err);
          toast({
            title: t('checkout.paypal.error'),
            description: t('checkout.paypal.errorDescription'),
            variant: 'destructive',
          });
        },
        onCancel: () => {
          onCancel?.();
          toast({
            title: t('checkout.paypal.cancelled'),
            description: t('checkout.paypal.cancelledDescription'),
          });
        },
      }).render(container);
    } catch (err) {
      console.error('Failed to render PayPal buttons:', err);
      buttonsRenderedRef.current = false;
    }
  }, [isScriptLoaded, amount, currency, disabled, onSuccess, onError, onCancel, toast, t]);

  // Reset buttons rendered flag when amount changes
  useEffect(() => {
    buttonsRenderedRef.current = false;
  }, [amount]);

  if (isLoadingSettings || isLoading) {
    return (
      <div className="flex items-center justify-center p-6 bg-muted/30 rounded-lg">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!paypalSettings?.is_active || !paypalSettings.client_id) {
    return null;
  }

  if (disabled) {
    return (
      <div className="p-6 bg-muted/30 rounded-lg text-center text-muted-foreground">
        {t('checkout.paypal.disabled')}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div ref={paypalContainerRef} className="min-h-[50px]" />
      {paypalSettings.sandbox_mode && (
        <p className="text-xs text-center text-warning">
          ⚠️ {t('checkout.paypal.sandboxMode')}
        </p>
      )}
    </div>
  );
};

export default PayPalButton;

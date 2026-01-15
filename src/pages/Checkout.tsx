import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, CreditCard, Building2, Check, Loader2, Copy, CheckCheck, Upload, FileCheck, X } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { getLocalizedSlug, type SupportedLanguage } from '@/i18n';
import { z } from 'zod';

// Bank account threshold (below this amount = Account A, above = Account B)
const BANK_ACCOUNT_THRESHOLD = 5000;

// Bank account details (these should ideally come from a config or admin settings)
const BANK_ACCOUNTS = {
  accountA: {
    name: 'Compte principal',
    bankName: 'Banque Agricole',
    iban: 'FR76 1234 5678 9012 3456 7890 123',
    bic: 'AGRIFRPP',
    holder: 'EQUIPTRADE SAS',
  },
  accountB: {
    name: 'Compte grands montants',
    bankName: 'Banque Internationale',
    iban: 'FR76 9876 5432 1098 7654 3210 987',
    bic: 'BNPAFRPP',
    holder: 'EQUIPTRADE SAS',
  },
};

const shippingSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(10, 'Numéro de téléphone invalide'),
  address: z.string().min(5, 'Adresse requise'),
  city: z.string().min(2, 'Ville requise'),
  postalCode: z.string().min(4, 'Code postal requis'),
  country: z.string().min(2, 'Pays requis'),
});

const Checkout = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const currentLang = (i18n.language || 'fr') as SupportedLanguage;
  const cartSlug = 'panier';
  
  const { items, total, user, clearCart } = useCart();
  
  const [step, setStep] = useState<'shipping' | 'payment' | 'confirmation'>('shipping');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [orderReference, setOrderReference] = useState<string>('');
  
  // Receipt upload state
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const receiptInputRef = useRef<HTMLInputElement>(null);
  
  // Shipping form - email is NOT pre-filled
  const [shippingData, setShippingData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'France',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Select bank account based on total amount
  const selectedBankAccount = total >= BANK_ACCOUNT_THRESHOLD 
    ? BANK_ACCOUNTS.accountB 
    : BANK_ACCOUNTS.accountA;

  const formatPrice = (price: number) => {
    const locale = currentLang === 'en' ? 'en-GB' : 
                   currentLang === 'de' ? 'de-DE' : 
                   currentLang === 'es' ? 'es-ES' :
                   currentLang === 'it' ? 'it-IT' :
                   currentLang === 'pt' ? 'pt-PT' : 'fr-FR';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleShippingChange = (field: string, value: string) => {
    setShippingData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = shippingSchema.safeParse(shippingData);
    if (!validation.success) {
      const newErrors: Record<string, string> = {};
      validation.error.errors.forEach(err => {
        if (err.path[0]) newErrors[err.path[0] as string] = err.message;
      });
      setErrors(newErrors);
      return;
    }

    setStep('payment');
  };

  const handleCopyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleReceiptSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: t('checkout.errors.unsupportedFormat'),
          description: t('checkout.errors.unsupportedFormatDescription'),
          variant: 'destructive',
        });
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: t('checkout.errors.fileTooLarge'),
          description: t('checkout.errors.fileTooLargeDescription'),
          variant: 'destructive',
        });
        return;
      }
      setReceiptFile(file);
    }
  };

  const handleRemoveReceipt = () => {
    setReceiptFile(null);
    if (receiptInputRef.current) {
      receiptInputRef.current.value = '';
    }
  };

  const uploadReceipt = async (orderId: string): Promise<string | null> => {
    if (!receiptFile || !user) return null;

    const fileExt = receiptFile.name.split('.').pop();
    const fileName = `${user.id}/${orderId}-receipt.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('payment-receipts')
      .upload(fileName, receiptFile, { upsert: true });

    if (error) {
      console.error('Receipt upload error:', error);
      return null;
    }

    return data.path;
  };

  const handleConfirmOrder = async () => {
    if (!user) return;

    // Validate receipt is uploaded
    if (!receiptFile) {
      toast({
        title: t('checkout.errors.receiptMissing'),
        description: t('checkout.errors.receiptMissingDescription'),
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Create order first
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: total,
          status: 'pending',
          shipping_name: `${shippingData.firstName} ${shippingData.lastName}`,
          shipping_email: shippingData.email,
          shipping_phone: shippingData.phone,
          shipping_address: shippingData.address,
          shipping_city: shippingData.city,
          shipping_postal_code: shippingData.postalCode,
          shipping_country: shippingData.country,
          notes: `Paiement par virement bancaire - Compte: ${selectedBankAccount.name}`,
        })
        .select('id')
        .single();

      if (orderError) throw orderError;

      // Upload receipt
      setIsUploadingReceipt(true);
      const receiptPath = await uploadReceipt(order.id);
      setIsUploadingReceipt(false);

      // Update order with receipt URL if uploaded
      if (receiptPath) {
        await supabase
          .from('orders')
          .update({ payment_receipt_url: receiptPath })
          .eq('id', order.id);
      }

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        product_title: item.product.title,
        product_price: item.product.price,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Generate order reference
      const ref = `CMD-${Date.now().toString(36).toUpperCase()}`;
      setOrderReference(ref);

      // Clear cart
      await clearCart();

      // Move to confirmation
      setStep('confirmation');

      toast({
        title: t('checkout.success.orderSaved'),
        description: t('checkout.success.orderSavedDescription'),
      });
    } catch (error) {
      console.error('Order error:', error);
      toast({
        title: t('checkout.errors.orderError'),
        description: t('checkout.errors.orderErrorDescription'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsUploadingReceipt(false);
    }
  };

  // Redirect if cart is empty (except on confirmation step)
  if (items.length === 0 && step !== 'confirmation') {
    return (
      <div className="min-h-screen flex flex-col">
        <SEOHead titleKey="seo.checkout.title" descriptionKey="seo.checkout.description" />
        <Header />
        <main className="flex-1 bg-background flex items-center justify-center py-12">
          <Card className="max-w-md w-full mx-4 text-center">
            <CardHeader>
              <CardTitle className="font-display text-2xl">{t('checkout.emptyCart')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                {t('checkout.emptyCartDescription')}
              </p>
              <Button asChild>
                <Link to={`/${currentLang}/${getLocalizedSlug('listings', currentLang)}`}>
                  {t('checkout.viewListings')}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead titleKey="seo.checkout.title" descriptionKey="seo.checkout.description" />
      <Header />
      <main className="flex-1 bg-background">
        <div className="container-custom py-8">
          {/* Breadcrumb */}
          {step !== 'confirmation' && (
            <nav className="mb-6">
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2 -ml-2"
                onClick={() => step === 'payment' ? setStep('shipping') : navigate(`/${currentLang}/${cartSlug}`)}
              >
                <ArrowLeft className="h-4 w-4" />
                {step === 'payment' ? t('checkout.backToShipping') : t('checkout.backToCart')}
              </Button>
            </nav>
          )}

          {/* Steps indicator */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className={`flex items-center gap-2 ${step === 'shipping' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === 'shipping' ? 'bg-primary text-primary-foreground' : step === 'payment' || step === 'confirmation' ? 'bg-success text-success-foreground' : 'bg-muted'}`}>
                {step === 'payment' || step === 'confirmation' ? <Check className="h-4 w-4" /> : '1'}
              </div>
              <span className="hidden sm:inline text-sm font-medium">{t('checkout.steps.shipping')}</span>
            </div>
            <div className="w-12 h-px bg-border" />
            <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === 'payment' ? 'bg-primary text-primary-foreground' : step === 'confirmation' ? 'bg-success text-success-foreground' : 'bg-muted'}`}>
                {step === 'confirmation' ? <Check className="h-4 w-4" /> : '2'}
              </div>
              <span className="hidden sm:inline text-sm font-medium">{t('checkout.steps.payment')}</span>
            </div>
            <div className="w-12 h-px bg-border" />
            <div className={`flex items-center gap-2 ${step === 'confirmation' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === 'confirmation' ? 'bg-success text-success-foreground' : 'bg-muted'}`}>
                {step === 'confirmation' ? <Check className="h-4 w-4" /> : '3'}
              </div>
              <span className="hidden sm:inline text-sm font-medium">{t('checkout.steps.confirmation')}</span>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2">
              {/* Step 1: Shipping */}
              {step === 'shipping' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="font-display">{t('checkout.shipping.title')}</CardTitle>
                    <CardDescription>{t('checkout.shipping.description')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleShippingSubmit} className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">{t('checkout.shipping.firstName')} *</Label>
                          <Input
                            id="firstName"
                            value={shippingData.firstName}
                            onChange={(e) => handleShippingChange('firstName', e.target.value)}
                            className={errors.firstName ? 'border-destructive' : ''}
                          />
                          {errors.firstName && <p className="text-sm text-destructive">{errors.firstName}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">{t('checkout.shipping.lastName')} *</Label>
                          <Input
                            id="lastName"
                            value={shippingData.lastName}
                            onChange={(e) => handleShippingChange('lastName', e.target.value)}
                            className={errors.lastName ? 'border-destructive' : ''}
                          />
                          {errors.lastName && <p className="text-sm text-destructive">{errors.lastName}</p>}
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">{t('checkout.shipping.email')} *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={shippingData.email}
                            onChange={(e) => handleShippingChange('email', e.target.value)}
                            className={errors.email ? 'border-destructive' : ''}
                          />
                          {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">{t('checkout.shipping.phone')} *</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={shippingData.phone}
                            onChange={(e) => handleShippingChange('phone', e.target.value)}
                            className={errors.phone ? 'border-destructive' : ''}
                          />
                          {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">{t('checkout.shipping.address')} *</Label>
                        <Input
                          id="address"
                          value={shippingData.address}
                          onChange={(e) => handleShippingChange('address', e.target.value)}
                          placeholder={t('checkout.shipping.addressPlaceholder')}
                          className={errors.address ? 'border-destructive' : ''}
                        />
                        {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
                      </div>

                      <div className="grid sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="postalCode">{t('checkout.shipping.postalCode')} *</Label>
                          <Input
                            id="postalCode"
                            value={shippingData.postalCode}
                            onChange={(e) => handleShippingChange('postalCode', e.target.value)}
                            className={errors.postalCode ? 'border-destructive' : ''}
                          />
                          {errors.postalCode && <p className="text-sm text-destructive">{errors.postalCode}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="city">{t('checkout.shipping.city')} *</Label>
                          <Input
                            id="city"
                            value={shippingData.city}
                            onChange={(e) => handleShippingChange('city', e.target.value)}
                            className={errors.city ? 'border-destructive' : ''}
                          />
                          {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="country">{t('checkout.shipping.country')} *</Label>
                          <Input
                            id="country"
                            value={shippingData.country}
                            onChange={(e) => handleShippingChange('country', e.target.value)}
                            className={errors.country ? 'border-destructive' : ''}
                          />
                          {errors.country && <p className="text-sm text-destructive">{errors.country}</p>}
                        </div>
                      </div>

                      <Button type="submit" className="w-full" size="lg">
                        {t('checkout.shipping.continueToPayment')}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Payment */}
              {step === 'payment' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="font-display flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      {t('checkout.payment.title')}
                    </CardTitle>
                    <CardDescription>
                      {t('checkout.payment.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Bank account info */}
                    <div className="bg-secondary/50 rounded-lg p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{selectedBankAccount.bankName}</h3>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                          {total >= BANK_ACCOUNT_THRESHOLD ? t('checkout.payment.amountThresholdHigh') : t('checkout.payment.amountThresholdLow')}
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">{t('checkout.payment.accountHolder')}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-medium">{selectedBankAccount.holder}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleCopyToClipboard(selectedBankAccount.holder, 'holder')}
                            >
                              {copiedField === 'holder' ? <CheckCheck className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">IBAN</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-medium text-sm">{selectedBankAccount.iban}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleCopyToClipboard(selectedBankAccount.iban.replace(/\s/g, ''), 'iban')}
                            >
                              {copiedField === 'iban' ? <CheckCheck className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">BIC</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-medium">{selectedBankAccount.bic}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleCopyToClipboard(selectedBankAccount.bic, 'bic')}
                            >
                              {copiedField === 'bic' ? <CheckCheck className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">{t('checkout.payment.amountToTransfer')}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-display font-bold text-lg text-primary">{formatPrice(total)}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleCopyToClipboard(total.toString(), 'amount')}
                            >
                              {copiedField === 'amount' ? <CheckCheck className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Instructions */}
                    <div className="bg-warning/10 border border-warning/30 rounded-lg p-4">
                      <h4 className="font-medium text-warning mb-2">⚠️ {t('checkout.payment.important')}</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• {t('checkout.payment.instruction1')}</li>
                        <li>• {t('checkout.payment.instruction2')}</li>
                        <li>• {t('checkout.payment.instruction3')}</li>
                      </ul>
                    </div>

                    {/* Receipt Upload */}
                    <div className="space-y-3">
                      <Label className="text-base font-medium">
                        {t('checkout.payment.uploadReceipt')} *
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t('checkout.payment.uploadReceiptDescription')}
                      </p>
                      
                      <input
                        type="file"
                        ref={receiptInputRef}
                        accept="image/jpeg,image/png,image/webp,application/pdf"
                        className="hidden"
                        onChange={handleReceiptSelect}
                      />

                      {!receiptFile ? (
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full h-24 border-dashed flex flex-col gap-2"
                          onClick={() => receiptInputRef.current?.click()}
                        >
                          <Upload className="h-6 w-6 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {t('checkout.payment.uploadButton')}
                          </span>
                        </Button>
                      ) : (
                        <div className="flex items-center gap-3 p-4 bg-success/10 border border-success/30 rounded-lg">
                          <FileCheck className="h-6 w-6 text-success flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{receiptFile.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(receiptFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={handleRemoveReceipt}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    <Button 
                      onClick={handleConfirmOrder} 
                      className="w-full" 
                      size="lg"
                      disabled={isLoading || !receiptFile}
                    >
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isUploadingReceipt ? t('checkout.payment.uploadingReceipt') : t('checkout.payment.confirmOrder')}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Confirmation */}
              {step === 'confirmation' && (
                <Card className="text-center">
                  <CardHeader>
                    <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="h-8 w-8 text-success" />
                    </div>
                    <CardTitle className="font-display text-2xl">{t('checkout.confirmation.title')}</CardTitle>
                    <CardDescription>
                      {t('checkout.confirmation.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-secondary/50 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">{t('checkout.confirmation.orderReference')}</p>
                      <p className="font-mono font-bold text-lg">{orderReference}</p>
                    </div>

                    <div className="text-left bg-muted/50 rounded-lg p-4 space-y-2">
                      <h4 className="font-medium">{t('checkout.confirmation.nextSteps')}</h4>
                      <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                        <li>{t('checkout.confirmation.step1')}</li>
                        <li>{t('checkout.confirmation.step2')} <strong>{shippingData.email}</strong></li>
                        <li>{t('checkout.confirmation.step3')}</li>
                      </ol>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button asChild className="flex-1">
                        <Link to={`/${currentLang}`}>
                          {t('checkout.confirmation.backToHome')}
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Order summary sidebar */}
            {step !== 'confirmation' && (
              <div>
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle className="font-display">{t('checkout.summary')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Items */}
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {items.map((item) => (
                        <div key={item.id} className="flex gap-3">
                          <div className="w-16 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                            <img
                              src={item.product.images?.[0] || '/placeholder.svg'}
                              alt={item.product.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium line-clamp-2">{item.product.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.quantity > 1 && `x${item.quantity} • `}
                              {formatPrice(item.product.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t('cart.subtotal')}</span>
                        <span>{formatPrice(total)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t('cart.shipping')}</span>
                        <span className="text-success">{t('cart.freeShipping')}</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex justify-between font-semibold text-lg">
                      <span>{t('cart.total')}</span>
                      <span className="font-display text-primary">{formatPrice(total)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;

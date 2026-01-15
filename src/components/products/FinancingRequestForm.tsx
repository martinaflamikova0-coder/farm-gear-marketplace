import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Send, User, Mail, Phone, Building, Euro, Calendar, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface FinancingRequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  productTitle: string;
  productPrice: number;
  productId: string;
  selectedDuration: number;
  monthlyPayment: number;
}

const createFinancingFormSchema = (t: (key: string) => string) => z.object({
  firstName: z.string().min(2, { message: t('validation.firstNameMin') }).max(50),
  lastName: z.string().min(2, { message: t('validation.lastNameMin') }).max(50),
  email: z.string().email({ message: t('validation.emailInvalid') }).max(255),
  phone: z.string().min(10, { message: t('validation.phoneInvalid') }).max(20),
  company: z.string().max(100).optional(),
  siret: z.string().max(14).optional(),
  downPayment: z.string().optional(),
  preferredDuration: z.string(),
  additionalInfo: z.string().max(1000).optional(),
});

type FinancingFormData = z.infer<ReturnType<typeof createFinancingFormSchema>>;

const DURATION_OPTIONS = [12, 24, 36, 48, 60, 72];

const FinancingRequestForm = ({
  isOpen,
  onClose,
  productTitle,
  productPrice,
  productId,
  selectedDuration,
  monthlyPayment,
}: FinancingRequestFormProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const financingFormSchema = createFinancingFormSchema(t);

  const form = useForm<FinancingFormData>({
    resolver: zodResolver(financingFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      siret: '',
      downPayment: '',
      preferredDuration: selectedDuration.toString(),
      additionalInfo: '',
    },
  });

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const onSubmit = async (data: FinancingFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke('send-financing-request', {
        body: {
          ...data,
          productId,
          productTitle,
          productPrice,
          selectedDuration: parseInt(data.preferredDuration),
          monthlyPayment: Math.round(productPrice / parseInt(data.preferredDuration)),
        },
      });

      if (error) throw error;

      toast({
        title: t('financingForm.successTitle'),
        description: t('financingForm.successDescription'),
      });
      onClose();
      form.reset();
    } catch (error) {
      console.error('Error submitting financing request:', error);
      toast({
        title: t('financingForm.errorTitle'),
        description: t('financingForm.errorDescription'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <Euro className="h-5 w-5 text-success" />
            {t('financingForm.title')}
          </DialogTitle>
        </DialogHeader>

        {/* Product summary */}
        <div className="bg-muted/50 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-sm text-muted-foreground mb-2">
            {t('financingForm.productSummary')}
          </h4>
          <p className="font-semibold">{productTitle}</p>
          <div className="flex justify-between items-center mt-2 text-sm">
            <span>{t('financingForm.totalPrice')}: <strong>{formatPrice(productPrice)}</strong></span>
            <span>{t('financing.monthlyPayment')}: <strong className="text-success">{formatPrice(monthlyPayment)}</strong>/{t('financing.month')}</span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Personal info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {t('financingForm.firstName')} *
                    </FormLabel>
                    <FormControl>
                      <Input placeholder={t('financingForm.firstNamePlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('financingForm.lastName')} *</FormLabel>
                    <FormControl>
                      <Input placeholder={t('financingForm.lastNamePlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {t('financingForm.email')} *
                    </FormLabel>
                    <FormControl>
                      <Input type="email" placeholder={t('financingForm.emailPlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {t('financingForm.phone')} *
                    </FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder={t('financingForm.phonePlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Company info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      {t('financingForm.company')}
                    </FormLabel>
                    <FormControl>
                      <Input placeholder={t('financingForm.companyPlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="siret"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('financingForm.siret')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('financingForm.siretPlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Financing options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="downPayment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Euro className="h-4 w-4" />
                      {t('financingForm.downPayment')}
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder={t('financingForm.downPaymentPlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="preferredDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {t('financingForm.preferredDuration')} *
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('financingForm.selectDuration')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DURATION_OPTIONS.map((months) => (
                          <SelectItem key={months} value={months.toString()}>
                            {months} {t('financing.months')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Additional info */}
            <FormField
              control={form.control}
              name="additionalInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('financingForm.additionalInfo')}</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={t('financingForm.additionalInfoPlaceholder')}
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Disclaimer */}
            <p className="text-xs text-muted-foreground">
              {t('financingForm.disclaimer')}
            </p>

            {/* Submit button */}
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                {t('financingForm.cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1 bg-success hover:bg-success/90">
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                {t('financingForm.submit')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default FinancingRequestForm;

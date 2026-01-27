import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import {
  useCreatePromotion,
  useUpdatePromotion,
  type Promotion,
} from '@/hooks/usePromotions';
import { useCategories } from '@/hooks/useCategories';

const formSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  description: z.string().optional(),
  discount_type: z.enum(['percentage', 'fixed_amount']),
  discount_value: z.number().min(0.01, 'La valeur doit être supérieure à 0'),
  start_date: z.date(),
  end_date: z.date(),
  is_active: z.boolean(),
  priority: z.number().min(0),
  applies_to: z.enum(['all', 'categories', 'products']),
  target_categories: z.array(z.string()),
  min_price: z.number().nullable(),
  max_price: z.number().nullable(),
}).refine((data) => data.end_date > data.start_date, {
  message: 'La date de fin doit être postérieure à la date de début',
  path: ['end_date'],
}).refine((data) => {
  if (data.discount_type === 'percentage') {
    return data.discount_value <= 100;
  }
  return true;
}, {
  message: 'Le pourcentage ne peut pas dépasser 100%',
  path: ['discount_value'],
});

type FormValues = z.infer<typeof formSchema>;

interface PromotionFormProps {
  promotion?: Promotion | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const PromotionForm = ({ promotion, onSuccess, onCancel }: PromotionFormProps) => {
  const createPromotion = useCreatePromotion();
  const updatePromotion = useUpdatePromotion();
  const { data: categories } = useCategories();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: promotion?.name || '',
      description: promotion?.description || '',
      discount_type: promotion?.discount_type || 'percentage',
      discount_value: promotion?.discount_value || 10,
      start_date: promotion ? new Date(promotion.start_date) : new Date(),
      end_date: promotion ? new Date(promotion.end_date) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      is_active: promotion?.is_active ?? true,
      priority: promotion?.priority || 0,
      applies_to: promotion?.applies_to || 'all',
      target_categories: promotion?.target_categories || [],
      min_price: promotion?.min_price || null,
      max_price: promotion?.max_price || null,
    },
  });

  const appliesTo = form.watch('applies_to');
  const discountType = form.watch('discount_type');

  const onSubmit = async (values: FormValues) => {
    const payload = {
      name: values.name,
      description: values.description || null,
      discount_type: values.discount_type,
      discount_value: values.discount_value,
      start_date: values.start_date.toISOString(),
      end_date: values.end_date.toISOString(),
      is_active: values.is_active,
      priority: values.priority,
      applies_to: values.applies_to,
      target_categories: values.target_categories,
      target_product_ids: [] as string[],
      min_price: values.min_price,
      max_price: values.max_price,
    };

    if (promotion) {
      await updatePromotion.mutateAsync({ id: promotion.id, ...payload });
    } else {
      await createPromotion.mutateAsync(payload);
    }
    onSuccess();
  };

  const isSubmitting = createPromotion.isPending || updatePromotion.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom de la promotion *</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Soldes d'été" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priorité</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormDescription>
                  Plus la valeur est élevée, plus la promo est prioritaire
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Description de la promotion (optionnel)"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Discount Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="discount_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type de réduction *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="percentage">Pourcentage (%)</SelectItem>
                    <SelectItem value="fixed_amount">Montant fixe (€)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="discount_value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Valeur de la réduction *{' '}
                  {discountType === 'percentage' ? '(%)' : '(€)'}
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={discountType === 'percentage' ? 100 : undefined}
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date de début *</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'dd/MM/yyyy')
                        ) : (
                          <span>Sélectionner</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date de fin *</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'dd/MM/yyyy')
                        ) : (
                          <span>Sélectionner</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < form.getValues('start_date')}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Target Selection */}
        <FormField
          control={form.control}
          name="applies_to"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Appliquer à *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="all">Tous les produits</SelectItem>
                  <SelectItem value="categories">Catégories spécifiques</SelectItem>
                  <SelectItem value="products">Produits spécifiques</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category Selection */}
        {appliesTo === 'categories' && (
          <FormField
            control={form.control}
            name="target_categories"
            render={() => (
              <FormItem>
                <FormLabel>Catégories ciblées</FormLabel>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md">
                  {categories?.map((category) => (
                    <FormField
                      key={category.id}
                      control={form.control}
                      name="target_categories"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(category.slug)}
                              onCheckedChange={(checked) => {
                                const current = field.value || [];
                                if (checked) {
                                  field.onChange([...current, category.slug]);
                                } else {
                                  field.onChange(
                                    current.filter((s) => s !== category.slug)
                                  );
                                }
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal cursor-pointer">
                            {category.name}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Price Constraints */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="min_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prix minimum (€)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Aucun minimum"
                    value={field.value ?? ''}
                    onChange={(e) =>
                      field.onChange(e.target.value ? parseFloat(e.target.value) : null)
                    }
                  />
                </FormControl>
                <FormDescription>
                  Laisser vide pour aucune limite
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="max_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prix maximum (€)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Aucun maximum"
                    value={field.value ?? ''}
                    onChange={(e) =>
                      field.onChange(e.target.value ? parseFloat(e.target.value) : null)
                    }
                  />
                </FormControl>
                <FormDescription>
                  Laisser vide pour aucune limite
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Active Switch */}
        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Promotion active</FormLabel>
                <FormDescription>
                  Désactivez pour mettre en pause sans supprimer
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? 'Enregistrement...'
              : promotion
              ? 'Mettre à jour'
              : 'Créer la promotion'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PromotionForm;

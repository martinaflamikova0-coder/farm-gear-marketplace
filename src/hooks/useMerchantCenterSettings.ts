import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Define all Merchant Center setting keys
export type MerchantCenterKey =
  // Global
  | 'mc_enabled'
  // Images
  | 'mc_force_merchant_safe_images'
  | 'mc_hide_all_image_overlays'
  | 'mc_hide_badges_on_images'
  | 'mc_hide_price_on_images'
  | 'mc_hide_ratings_on_images'
  | 'mc_hide_cta_on_images'
  | 'mc_hide_shipping_claims_on_images'
  | 'mc_hide_warranty_claims_on_images'
  | 'mc_hide_brand_logo_watermark_overlays'
  | 'mc_hide_barcodes_on_images'
  | 'mc_disallow_borders_frames'
  | 'mc_disallow_placeholders'
  // Cards/Listings
  | 'mc_simplified_card_layout'
  | 'mc_hide_ui_chips_and_labels'
  | 'mc_hide_review_stars_in_cards'
  | 'mc_hide_compare_at_price'
  | 'mc_hide_discount_percent_everywhere'
  | 'mc_hide_financing_in_cards'
  // Pricing
  | 'mc_single_price_only'
  | 'mc_price_display_mode'
  | 'mc_hide_vat_mentions_on_cards'
  | 'mc_hide_secondary_price_text'
  // Product page
  | 'mc_move_financing_below_fold'
  // Quality
  | 'mc_disable_intrusive_popups'
  | 'mc_disable_login_gate_for_viewing_products'
  | 'mc_show_clear_contact_block'
  | 'mc_show_return_refund_policy_links';

export type PriceDisplayMode = 'TTC_only' | 'HT_only';

export interface MerchantCenterSetting {
  id: string;
  key: string;
  value: boolean | string;
  description: string | null;
  category: string;
  updated_at: string;
}

export interface MerchantCenterSettings {
  [key: string]: boolean | string;
}

// Parse JSON value from database
const parseValue = (value: unknown): boolean | string => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    // Handle quoted strings like '"TTC_only"'
    if (value.startsWith('"') && value.endsWith('"')) {
      return value.slice(1, -1);
    }
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  }
  return false;
};

// Fetch all settings
export const useMerchantCenterSettings = () => {
  return useQuery({
    queryKey: ['merchant-center-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('merchant_center_settings')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;

      // Convert array to keyed object
      const settings: MerchantCenterSettings = {};
      (data || []).forEach((row: any) => {
        settings[row.key] = parseValue(row.value);
      });

      return settings;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

// Fetch raw settings with metadata (for admin page)
export const useMerchantCenterSettingsRaw = () => {
  return useQuery({
    queryKey: ['merchant-center-settings-raw'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('merchant_center_settings')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;

      return (data || []).map((row: any) => ({
        ...row,
        value: parseValue(row.value),
      })) as MerchantCenterSetting[];
    },
  });
};

// Update a single setting
export const useUpdateMerchantCenterSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: boolean | string }) => {
      // Format value for JSONB storage
      const jsonValue = typeof value === 'string' ? `"${value}"` : value;
      
      const { error } = await supabase
        .from('merchant_center_settings')
        .update({ value: jsonValue })
        .eq('key', key);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-center-settings'] });
      queryClient.invalidateQueries({ queryKey: ['merchant-center-settings-raw'] });
    },
  });
};

// Batch update settings
export const useBatchUpdateMerchantCenterSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: { key: string; value: boolean | string }[]) => {
      // Update all settings in parallel
      const promises = updates.map(({ key, value }) => {
        const jsonValue = typeof value === 'string' ? `"${value}"` : value;
        return supabase
          .from('merchant_center_settings')
          .update({ value: jsonValue })
          .eq('key', key);
      });

      const results = await Promise.all(promises);
      const errors = results.filter(r => r.error);
      if (errors.length > 0) {
        throw new Error(`Failed to update ${errors.length} settings`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-center-settings'] });
      queryClient.invalidateQueries({ queryKey: ['merchant-center-settings-raw'] });
    },
  });
};

// Helper functions for components
export const isMcEnabled = (settings: MerchantCenterSettings | undefined): boolean => {
  return settings?.mc_enabled === true;
};

export const mcFlag = (settings: MerchantCenterSettings | undefined, key: MerchantCenterKey): boolean => {
  if (!settings) return false;
  const value = settings[key];
  return value === true;
};

export const mcPriceMode = (settings: MerchantCenterSettings | undefined): PriceDisplayMode => {
  if (!settings) return 'TTC_only';
  const value = settings.mc_price_display_mode;
  if (value === 'HT_only') return 'HT_only';
  return 'TTC_only';
};

// Get product image based on MC settings
export const getMerchantSafeImage = (
  settings: MerchantCenterSettings | undefined,
  normalImage: string | undefined,
  merchantSafeImage: string | null | undefined
): string => {
  const placeholder = '/placeholder.svg';
  
  // If MC mode is enabled and force merchant-safe images is on
  if (isMcEnabled(settings) && mcFlag(settings, 'mc_force_merchant_safe_images')) {
    // Use merchant-safe image if available, otherwise fall back to normal
    return merchantSafeImage || normalImage || placeholder;
  }
  
  return normalImage || placeholder;
};

// Check if product is at risk (no merchant-safe image when MC mode is on)
export const isProductAtRisk = (
  settings: MerchantCenterSettings | undefined,
  merchantSafeImage: string | null | undefined
): boolean => {
  return isMcEnabled(settings) && !merchantSafeImage;
};

// Strict MC configuration preset
export const STRICT_MC_CONFIG: { key: MerchantCenterKey; value: boolean | string }[] = [
  { key: 'mc_enabled', value: true },
  { key: 'mc_force_merchant_safe_images', value: true },
  { key: 'mc_hide_all_image_overlays', value: true },
  { key: 'mc_hide_badges_on_images', value: true },
  { key: 'mc_hide_price_on_images', value: true },
  { key: 'mc_hide_ratings_on_images', value: true },
  { key: 'mc_hide_cta_on_images', value: true },
  { key: 'mc_hide_shipping_claims_on_images', value: true },
  { key: 'mc_hide_warranty_claims_on_images', value: true },
  { key: 'mc_hide_brand_logo_watermark_overlays', value: true },
  { key: 'mc_hide_barcodes_on_images', value: true },
  { key: 'mc_disallow_borders_frames', value: true },
  { key: 'mc_disallow_placeholders', value: true },
  { key: 'mc_simplified_card_layout', value: true },
  { key: 'mc_hide_ui_chips_and_labels', value: true },
  { key: 'mc_hide_review_stars_in_cards', value: true },
  { key: 'mc_hide_compare_at_price', value: true },
  { key: 'mc_hide_discount_percent_everywhere', value: true },
  { key: 'mc_hide_financing_in_cards', value: true },
  { key: 'mc_single_price_only', value: true },
  { key: 'mc_price_display_mode', value: 'TTC_only' },
  { key: 'mc_hide_vat_mentions_on_cards', value: true },
  { key: 'mc_hide_secondary_price_text', value: true },
  { key: 'mc_move_financing_below_fold', value: true },
  { key: 'mc_disable_intrusive_popups', value: true },
  { key: 'mc_disable_login_gate_for_viewing_products', value: true },
  { key: 'mc_show_clear_contact_block', value: true },
  { key: 'mc_show_return_refund_policy_links', value: true },
];

// Default marketplace configuration preset
export const DEFAULT_MARKETPLACE_CONFIG: { key: MerchantCenterKey; value: boolean | string }[] = [
  { key: 'mc_enabled', value: false },
  { key: 'mc_force_merchant_safe_images', value: false },
  { key: 'mc_hide_all_image_overlays', value: false },
  { key: 'mc_hide_badges_on_images', value: false },
  { key: 'mc_hide_price_on_images', value: false },
  { key: 'mc_hide_ratings_on_images', value: false },
  { key: 'mc_hide_cta_on_images', value: false },
  { key: 'mc_hide_shipping_claims_on_images', value: false },
  { key: 'mc_hide_warranty_claims_on_images', value: false },
  { key: 'mc_hide_brand_logo_watermark_overlays', value: false },
  { key: 'mc_hide_barcodes_on_images', value: false },
  { key: 'mc_disallow_borders_frames', value: false },
  { key: 'mc_disallow_placeholders', value: false },
  { key: 'mc_simplified_card_layout', value: false },
  { key: 'mc_hide_ui_chips_and_labels', value: false },
  { key: 'mc_hide_review_stars_in_cards', value: false },
  { key: 'mc_hide_compare_at_price', value: false },
  { key: 'mc_hide_discount_percent_everywhere', value: false },
  { key: 'mc_hide_financing_in_cards', value: false },
  { key: 'mc_single_price_only', value: false },
  { key: 'mc_price_display_mode', value: 'TTC_only' },
  { key: 'mc_hide_vat_mentions_on_cards', value: false },
  { key: 'mc_hide_secondary_price_text', value: false },
  { key: 'mc_move_financing_below_fold', value: false },
  { key: 'mc_disable_intrusive_popups', value: false },
  { key: 'mc_disable_login_gate_for_viewing_products', value: false },
  { key: 'mc_show_clear_contact_block', value: false },
  { key: 'mc_show_return_refund_policy_links', value: false },
];

-- Create merchant_center_settings table for storing all MC configuration flags
CREATE TABLE public.merchant_center_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL DEFAULT 'false'::jsonb,
  description text,
  category text NOT NULL DEFAULT 'global',
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.merchant_center_settings ENABLE ROW LEVEL SECURITY;

-- Policies: Anyone can read settings, only admins can write
CREATE POLICY "Anyone can view merchant center settings"
ON public.merchant_center_settings
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage merchant center settings"
ON public.merchant_center_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add merchant-safe image columns to products table
ALTER TABLE public.products 
ADD COLUMN merchant_safe_image_url text,
ADD COLUMN merchant_safe_additional_images text[] DEFAULT '{}'::text[];

-- Create trigger to update updated_at
CREATE TRIGGER update_merchant_center_settings_updated_at
BEFORE UPDATE ON public.merchant_center_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings with all the flags
INSERT INTO public.merchant_center_settings (key, value, description, category) VALUES
-- Global
('mc_enabled', 'false', 'Mode Merchant Center activé', 'global'),

-- Images
('mc_force_merchant_safe_images', 'false', 'Utiliser les images merchant-safe pour Google/MC', 'images'),
('mc_hide_all_image_overlays', 'false', 'Masquer tous les overlays sur les images', 'images'),
('mc_hide_badges_on_images', 'false', 'Masquer les badges sur les images (-xx%, Used, etc.)', 'images'),
('mc_hide_price_on_images', 'false', 'Masquer les prix sur les images', 'images'),
('mc_hide_ratings_on_images', 'false', 'Masquer les notes sur les images', 'images'),
('mc_hide_cta_on_images', 'false', 'Masquer les CTA sur les images (Acheter, etc.)', 'images'),
('mc_hide_shipping_claims_on_images', 'false', 'Masquer les mentions de livraison sur images', 'images'),
('mc_hide_warranty_claims_on_images', 'false', 'Masquer les mentions de garantie sur images', 'images'),
('mc_hide_brand_logo_watermark_overlays', 'false', 'Masquer les logos/watermarks de marque', 'images'),
('mc_hide_barcodes_on_images', 'false', 'Masquer les codes-barres sur images', 'images'),
('mc_disallow_borders_frames', 'false', 'Interdire les bordures autour des images', 'images'),
('mc_disallow_placeholders', 'false', 'Interdire les images placeholder', 'images'),

-- Cards/Listings
('mc_simplified_card_layout', 'false', 'Layout simplifié des cartes produit', 'cards'),
('mc_hide_ui_chips_and_labels', 'false', 'Masquer les chips et labels UI', 'cards'),
('mc_hide_review_stars_in_cards', 'false', 'Masquer les étoiles de review dans les cartes', 'cards'),
('mc_hide_compare_at_price', 'false', 'Masquer le prix barré (compare-at)', 'cards'),
('mc_hide_discount_percent_everywhere', 'false', 'Masquer les pourcentages de remise partout', 'cards'),
('mc_hide_financing_in_cards', 'false', 'Masquer les infos de financement (€/mois)', 'cards'),

-- Prix/TVA
('mc_single_price_only', 'false', 'Afficher un seul prix', 'pricing'),
('mc_price_display_mode', '"TTC_only"', 'Mode d''affichage des prix (TTC_only ou HT_only)', 'pricing'),
('mc_hide_vat_mentions_on_cards', 'false', 'Masquer les mentions TVA sur les cartes', 'pricing'),
('mc_hide_secondary_price_text', 'false', 'Masquer le texte de prix secondaire', 'pricing'),

-- Page produit
('mc_move_financing_below_fold', 'false', 'Déplacer le financement sous le fold', 'product_page'),

-- Qualité site
('mc_disable_intrusive_popups', 'false', 'Désactiver les popups intrusifs', 'quality'),
('mc_disable_login_gate_for_viewing_products', 'false', 'Désactiver la gate login pour voir les produits', 'quality'),
('mc_show_clear_contact_block', 'false', 'Afficher un bloc contact clair', 'quality'),
('mc_show_return_refund_policy_links', 'false', 'Afficher les liens politique de retour/remboursement', 'quality');
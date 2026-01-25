-- Create paypal_settings table for storing PayPal configuration
CREATE TABLE public.paypal_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id TEXT,
  sandbox_mode BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.paypal_settings ENABLE ROW LEVEL SECURITY;

-- Admins can manage PayPal settings
CREATE POLICY "Admins can manage paypal settings"
  ON public.paypal_settings
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can view active PayPal settings (needed for client-side SDK)
CREATE POLICY "Anyone can view active paypal settings"
  ON public.paypal_settings
  FOR SELECT
  USING (is_active = true);

-- Create trigger for updating updated_at
CREATE TRIGGER update_paypal_settings_updated_at
  BEFORE UPDATE ON public.paypal_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings row
INSERT INTO public.paypal_settings (client_id, sandbox_mode, is_active)
VALUES (NULL, true, false);
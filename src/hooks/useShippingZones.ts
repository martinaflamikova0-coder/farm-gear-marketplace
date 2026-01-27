import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ShippingZone {
  id: string;
  name: string;
  countries: string[];
  min_days: number;
  max_days: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const useShippingZones = () => {
  return useQuery({
    queryKey: ['shipping-zones'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shipping_zones')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as ShippingZone[];
    },
  });
};

export const useShippingZoneForCountry = (countryCode: string | null) => {
  const { data: zones } = useShippingZones();

  if (!countryCode || !zones) return null;

  // Find specific zone for the country
  const specificZone = zones.find(zone => 
    zone.countries.includes(countryCode)
  );

  if (specificZone) return specificZone;

  // Fallback to "rest of world" zone (contains '*')
  return zones.find(zone => zone.countries.includes('*')) || null;
};

export const useAdminShippingZones = () => {
  const queryClient = useQueryClient();

  const fetchAllZones = useQuery({
    queryKey: ['admin-shipping-zones'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shipping_zones')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as ShippingZone[];
    },
  });

  const createZone = useMutation({
    mutationFn: async (zone: Omit<ShippingZone, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('shipping_zones')
        .insert(zone)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-shipping-zones'] });
      queryClient.invalidateQueries({ queryKey: ['shipping-zones'] });
    },
  });

  const updateZone = useMutation({
    mutationFn: async ({ id, ...zone }: Partial<ShippingZone> & { id: string }) => {
      const { data, error } = await supabase
        .from('shipping_zones')
        .update(zone)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-shipping-zones'] });
      queryClient.invalidateQueries({ queryKey: ['shipping-zones'] });
    },
  });

  const deleteZone = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('shipping_zones')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-shipping-zones'] });
      queryClient.invalidateQueries({ queryKey: ['shipping-zones'] });
    },
  });

  return {
    zones: fetchAllZones.data || [],
    isLoading: fetchAllZones.isLoading,
    createZone,
    updateZone,
    deleteZone,
  };
};

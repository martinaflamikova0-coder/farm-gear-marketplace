import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@supabase/supabase-js';

// Price threshold: items <= this go to cart, above go to quote request
export const CART_MAX_PRICE = 8000;

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    id: string;
    title: string;
    price: number;
    images: string[] | null;
    brand: string | null;
    condition: string | null;
    stock: number | null;
  };
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  total: number;
  isLoading: boolean;
  user: User | null;
  addToCart: (productId: string, quantity?: number) => Promise<boolean>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  isInCart: (productId: string) => boolean;
  canAddToCart: (price: number, condition: string | null, stock: number | null) => { allowed: boolean; reason?: string };
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check if product can be added to cart
  const canAddToCart = useCallback((price: number, condition: string | null, stock: number | null): { allowed: boolean; reason?: string } => {
    // Price must be <= CART_MAX_PRICE
    if (price > CART_MAX_PRICE) {
      return { allowed: false, reason: 'price_too_high' };
    }
    
    // Check stock for new items
    if (condition === 'new' && stock !== null && stock === 0) {
      return { allowed: false, reason: 'out_of_stock' };
    }
    
    // Used/refurbished items are unique, so quantity is always 1
    if (condition !== 'new') {
      return { allowed: true };
    }
    
    return { allowed: true };
  }, []);

  // Fetch cart items from database
  const fetchCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          product_id,
          quantity,
          products:product_id (
            id,
            title,
            price,
            images,
            brand,
            condition,
            stock
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const cartItems: CartItem[] = (data || [])
        .filter((item: any) => item.products) // Filter out items with deleted products
        .map((item: any) => ({
          id: item.id,
          product_id: item.product_id,
          quantity: item.quantity,
          product: {
            id: item.products.id,
            title: item.products.title,
            price: Number(item.products.price),
            images: item.products.images,
            brand: item.products.brand,
            condition: item.products.condition,
            stock: item.products.stock,
          },
        }));

      setItems(cartItems);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch cart when user changes
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Add item to cart
  const addToCart = useCallback(async (productId: string, quantity: number = 1): Promise<boolean> => {
    if (!user) {
      toast({
        title: 'Connexion requise',
        description: 'Veuillez vous connecter pour ajouter des articles au panier',
        variant: 'destructive',
      });
      return false;
    }

    try {
      // Check if item already in cart
      const existingItem = items.find(item => item.product_id === productId);

      if (existingItem) {
        // For used/refurbished items, quantity is always 1
        if (existingItem.product.condition !== 'new') {
          toast({
            title: 'Déjà dans le panier',
            description: 'Cet article unique est déjà dans votre panier',
          });
          return true;
        }

        // Update quantity for new items
        const newQuantity = existingItem.quantity + quantity;
        
        // Check stock
        if (existingItem.product.stock !== null && newQuantity > existingItem.product.stock) {
          toast({
            title: 'Stock insuffisant',
            description: `Seulement ${existingItem.product.stock} unité(s) disponible(s)`,
            variant: 'destructive',
          });
          return false;
        }

        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: newQuantity })
          .eq('id', existingItem.id);

        if (error) throw error;
      } else {
        // Add new item
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: productId,
            quantity,
          });

        if (error) throw error;
      }

      await fetchCart();
      toast({
        title: 'Ajouté au panier',
        description: 'L\'article a été ajouté à votre panier',
      });
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter l\'article au panier',
        variant: 'destructive',
      });
      return false;
    }
  }, [user, items, fetchCart, toast]);

  // Remove item from cart
  const removeFromCart = useCallback(async (productId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;

      setItems(prev => prev.filter(item => item.product_id !== productId));
      toast({
        title: 'Article retiré',
        description: 'L\'article a été retiré de votre panier',
      });
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de retirer l\'article',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  // Update item quantity
  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    if (!user || quantity < 1) return;

    const item = items.find(i => i.product_id === productId);
    if (!item) return;

    // Check stock for new items
    if (item.product.condition === 'new' && item.product.stock !== null && quantity > item.product.stock) {
      toast({
        title: 'Stock insuffisant',
        description: `Seulement ${item.product.stock} unité(s) disponible(s)`,
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;

      setItems(prev => prev.map(item =>
        item.product_id === productId ? { ...item, quantity } : item
      ));
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour la quantité',
        variant: 'destructive',
      });
    }
  }, [user, items, toast]);

  // Clear cart
  const clearCart = useCallback(async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  }, [user]);

  // Check if product is in cart
  const isInCart = useCallback((productId: string) => {
    return items.some(item => item.product_id === productId);
  }, [items]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        total,
        isLoading,
        user,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isInCart,
        canAddToCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

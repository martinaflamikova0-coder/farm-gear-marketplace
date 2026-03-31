import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// No price limit - all products go to cart
export const CART_MAX_PRICE = Infinity;

const CART_STORAGE_KEY = 'geoitalyagro-cart';

interface LocalCartItem {
  product_id: string;
  quantity: number;
}

interface CartProduct {
  id: string;
  title: string;
  price: number;
  images: string[] | null;
  brand: string | null;
  condition: string | null;
  stock: number | null;
}

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: CartProduct;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  total: number;
  isLoading: boolean;
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

// localStorage helpers
const getStoredCart = (): LocalCartItem[] => {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const setStoredCart = (items: LocalCartItem[]) => {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const canAddToCart = useCallback((price: number, condition: string | null, stock: number | null): { allowed: boolean; reason?: string } => {
    if (condition === 'new' && stock !== null && stock === 0) {
      return { allowed: false, reason: 'out_of_stock' };
    }
    return { allowed: true };
  }, []);

  // Fetch product details for local cart items
  const hydrateCart = useCallback(async () => {
    const localItems = getStoredCart();
    if (localItems.length === 0) {
      setItems([]);
      setIsLoading(false);
      return;
    }

    try {
      const productIds = localItems.map(i => i.product_id);
      const { data: products, error } = await supabase
        .from('products')
        .select('id, title, price, images, brand, condition, stock')
        .in('id', productIds)
        .eq('status', 'active');

      if (error) throw error;

      const productMap = new Map((products || []).map(p => [p.id, p]));

      const hydrated: CartItem[] = localItems
        .filter(item => productMap.has(item.product_id))
        .map(item => {
          const p = productMap.get(item.product_id)!;
          return {
            id: item.product_id, // use product_id as id for local cart
            product_id: item.product_id,
            quantity: item.quantity,
            product: {
              id: p.id,
              title: p.title,
              price: Number(p.price),
              images: p.images,
              brand: p.brand,
              condition: p.condition,
              stock: p.stock,
            },
          };
        });

      // Clean up localStorage if some products no longer exist
      if (hydrated.length !== localItems.length) {
        setStoredCart(hydrated.map(i => ({ product_id: i.product_id, quantity: i.quantity })));
      }

      setItems(hydrated);
    } catch (error) {
      console.error('Error hydrating cart:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    hydrateCart();
  }, [hydrateCart]);

  const addToCart = useCallback(async (productId: string, quantity: number = 1): Promise<boolean> => {
    try {
      const localItems = getStoredCart();
      const existing = localItems.find(i => i.product_id === productId);
      const existingCartItem = items.find(i => i.product_id === productId);

      if (existing && existingCartItem) {
        if (existingCartItem.product.condition !== 'new') {
          toast({
            title: 'Déjà dans le panier',
            description: 'Cet article unique est déjà dans votre panier',
          });
          return true;
        }

        const newQty = existing.quantity + quantity;
        if (existingCartItem.product.stock !== null && newQty > existingCartItem.product.stock) {
          toast({
            title: 'Stock insuffisant',
            description: `Seulement ${existingCartItem.product.stock} unité(s) disponible(s)`,
            variant: 'destructive',
          });
          return false;
        }

        const updated = localItems.map(i =>
          i.product_id === productId ? { ...i, quantity: newQty } : i
        );
        setStoredCart(updated);
      } else {
        localItems.push({ product_id: productId, quantity });
        setStoredCart(localItems);
      }

      await hydrateCart();
      toast({
        title: 'Ajouté au panier',
        description: "L'article a été ajouté à votre panier",
      });
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: 'Erreur',
        description: "Impossible d'ajouter l'article au panier",
        variant: 'destructive',
      });
      return false;
    }
  }, [items, hydrateCart, toast]);

  const removeFromCart = useCallback(async (productId: string) => {
    const updated = getStoredCart().filter(i => i.product_id !== productId);
    setStoredCart(updated);
    setItems(prev => prev.filter(i => i.product_id !== productId));
    toast({
      title: 'Article retiré',
      description: "L'article a été retiré de votre panier",
    });
  }, [toast]);

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    if (quantity < 1) return;

    const item = items.find(i => i.product_id === productId);
    if (!item) return;

    if (item.product.condition === 'new' && item.product.stock !== null && quantity > item.product.stock) {
      toast({
        title: 'Stock insuffisant',
        description: `Seulement ${item.product.stock} unité(s) disponible(s)`,
        variant: 'destructive',
      });
      return;
    }

    const updated = getStoredCart().map(i =>
      i.product_id === productId ? { ...i, quantity } : i
    );
    setStoredCart(updated);
    setItems(prev => prev.map(i =>
      i.product_id === productId ? { ...i, quantity } : i
    ));
  }, [items, toast]);

  const clearCart = useCallback(async () => {
    localStorage.removeItem(CART_STORAGE_KEY);
    setItems([]);
  }, []);

  const isInCart = useCallback((productId: string) => {
    return items.some(i => i.product_id === productId);
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

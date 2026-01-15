import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, FileText, Check, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart, CART_MAX_PRICE } from '@/contexts/CartContext';

interface AddToCartButtonProps {
  productId: string;
  price: number;
  condition: string | null;
  stock: number | null;
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
}

const AddToCartButton = ({
  productId,
  price,
  condition,
  stock,
  className = '',
  size = 'default',
  showLabel = true,
}: AddToCartButtonProps) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { addToCart, isInCart, canAddToCart, user } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  
  const currentLang = i18n.language || 'fr';
  const alreadyInCart = isInCart(productId);
  const { allowed, reason } = canAddToCart(price, condition, stock);
  
  // If price > CART_MAX_PRICE, show quote request button
  if (price > CART_MAX_PRICE) {
    return (
      <Button
        variant="accent"
        size={size}
        className={className}
        onClick={() => {
          // Scroll to quote form
          const quoteForm = document.getElementById('request-quote');
          if (quoteForm) {
            quoteForm.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      >
        <FileText className="h-4 w-4" />
        {showLabel && <span className="ml-2">{t('product.requestQuote')}</span>}
      </Button>
    );
  }

  // Out of stock
  if (reason === 'out_of_stock') {
    return (
      <Button
        variant="secondary"
        size={size}
        className={className}
        disabled
      >
        <AlertTriangle className="h-4 w-4" />
        {showLabel && <span className="ml-2">{t('product.outOfStock')}</span>}
      </Button>
    );
  }

  // Already in cart
  if (alreadyInCart) {
    return (
      <Button
        variant="secondary"
        size={size}
        className={className}
        onClick={() => navigate(`/${currentLang}/panier`)}
      >
        <Check className="h-4 w-4" />
        {showLabel && <span className="ml-2">{t('cart.inCart')}</span>}
      </Button>
    );
  }

  const handleAddToCart = async () => {
    if (!user) {
      // Redirect to login with return URL
      navigate(`/${currentLang}/auth?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setIsAdding(true);
    await addToCart(productId);
    setIsAdding(false);
  };

  return (
    <Button
      variant="default"
      size={size}
      className={className}
      onClick={handleAddToCart}
      disabled={isAdding || !allowed}
    >
      {isAdding ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <ShoppingCart className="h-4 w-4" />
      )}
      {showLabel && <span className="ml-2">{t('cart.addToCart')}</span>}
    </Button>
  );
};

export default AddToCartButton;

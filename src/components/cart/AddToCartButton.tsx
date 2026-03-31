import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';

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
  const { addToCart, isInCart, canAddToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  
  const currentLang = i18n.language || 'fr';
  const alreadyInCart = isInCart(productId);
  const { allowed } = canAddToCart(price, condition, stock);

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

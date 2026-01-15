import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { useTranslation } from 'react-i18next';

const CartIcon = () => {
  const { itemCount, user } = useCart();
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'fr';

  return (
    <Button variant="ghost" size="icon" className="relative" asChild>
      <Link to={user ? `/${currentLang}/panier` : `/${currentLang}/auth?redirect=/${currentLang}/panier`}>
        <ShoppingCart className="h-5 w-5" />
        {itemCount > 0 && (
          <Badge 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary text-primary-foreground"
          >
            {itemCount > 99 ? '99+' : itemCount}
          </Badge>
        )}
        <span className="sr-only">Panier ({itemCount} articles)</span>
      </Link>
    </Button>
  );
};

export default CartIcon;

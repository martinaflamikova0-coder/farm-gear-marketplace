import { Gift, Sparkles } from 'lucide-react';
import { ProductGift, calculateGiftsTotalValue } from '@/hooks/useProductGifts';
import { useTranslation } from 'react-i18next';

interface ProductGiftsListProps {
  gifts: ProductGift[];
}

const ProductGiftsList = ({ gifts }: ProductGiftsListProps) => {
  const { t } = useTranslation();
  
  if (gifts.length === 0) return null;

  const totalValue = calculateGiftsTotalValue(gifts);

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-2 rounded-lg">
          <Gift className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
            Cadeaux offerts avec cet article
            <Sparkles className="h-4 w-4 text-amber-500" />
          </h3>
          <p className="text-sm text-muted-foreground">
            Valeur totale : <span className="font-semibold text-amber-600 dark:text-amber-400">{totalValue}€</span> de cadeaux inclus
          </p>
        </div>
      </div>
      
      <div className="grid gap-2 sm:grid-cols-2">
        {gifts.map((gift, index) => (
          <div 
            key={index}
            className="flex items-center gap-3 bg-white dark:bg-background/50 rounded-lg p-3 border border-amber-100 dark:border-amber-900 hover:border-amber-300 dark:hover:border-amber-700 transition-colors"
          >
            <span className="text-2xl">{gift.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-foreground truncate">{gift.name}</p>
              {gift.value && (
                <p className="text-xs text-muted-foreground">Valeur : {gift.value}</p>
              )}
            </div>
            <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
              OFFERT
            </span>
          </div>
        ))}
      </div>
      
      <p className="mt-4 text-xs text-muted-foreground text-center">
        ✨ Ces cadeaux vous seront automatiquement envoyés avec votre commande
      </p>
    </div>
  );
};

export default ProductGiftsList;

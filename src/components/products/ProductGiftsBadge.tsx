import { Gift } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ProductGift, calculateGiftsTotalValue } from '@/hooks/useProductGifts';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ProductGiftsBadgeProps {
  gifts: ProductGift[];
  variant?: 'card' | 'detail';
}

const ProductGiftsBadge = ({ gifts, variant = 'card' }: ProductGiftsBadgeProps) => {
  const { t } = useTranslation();
  
  if (gifts.length === 0) return null;

  const totalValue = calculateGiftsTotalValue(gifts);

  if (variant === 'card') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="absolute bottom-2 left-2 z-10 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg cursor-pointer hover:scale-105 transition-transform">
              <Gift className="h-3 w-3" />
              <span>{t('gifts.count', { count: gifts.length })}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs p-3">
            <div className="space-y-2">
              <p className="font-semibold text-sm flex items-center gap-1">
                <Gift className="h-3 w-3" />
                {t('gifts.includedValue', { value: totalValue })}
              </p>
              <ul className="text-xs space-y-1.5">
                {gifts.slice(0, 3).map((gift, i) => (
                  <li key={gift.id || i} className="flex items-center gap-2">
                    {gift.image ? (
                      <img 
                        src={gift.image} 
                        alt={gift.name}
                        className="w-6 h-6 rounded object-cover"
                      />
                    ) : (
                      <span className="text-sm">{gift.icon}</span>
                    )}
                    <span className="line-clamp-1">{gift.name}</span>
                  </li>
                ))}
                {gifts.length > 3 && (
                  <li className="text-muted-foreground">{t('gifts.moreGifts', { count: gifts.length - 3 })}</li>
                )}
              </ul>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return null;
};

export default ProductGiftsBadge;

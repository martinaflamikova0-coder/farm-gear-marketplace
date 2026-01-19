import { Gift } from 'lucide-react';
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
  if (gifts.length === 0) return null;

  const totalValue = calculateGiftsTotalValue(gifts);

  if (variant === 'card') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg cursor-pointer hover:scale-105 transition-transform">
              <Gift className="h-3 w-3" />
              <span>{gifts.length} cadeau{gifts.length > 1 ? 'x' : ''}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <div className="space-y-1">
              <p className="font-semibold text-sm">🎁 Cadeaux inclus ({totalValue}€ de valeur)</p>
              <ul className="text-xs space-y-0.5">
                {gifts.slice(0, 3).map((gift, i) => (
                  <li key={i} className="flex items-center gap-1">
                    <span>{gift.icon}</span>
                    <span>{gift.name}</span>
                  </li>
                ))}
                {gifts.length > 3 && (
                  <li className="text-muted-foreground">+{gifts.length - 3} autres cadeaux...</li>
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

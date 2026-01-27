import { useTranslation } from 'react-i18next';
import { Timer, Sparkles, Percent } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Promotion } from '@/hooks/usePromotions';

interface PromotionBadgeProps {
  promotion: Promotion;
  variant?: 'card' | 'detail';
  showCountdown?: boolean;
}

const PromotionBadge = ({ promotion, variant = 'card', showCountdown = false }: PromotionBadgeProps) => {
  const { t, i18n } = useTranslation();
  
  const endDate = new Date(promotion.end_date);
  const now = new Date();
  const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const hoursLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60));
  
  const getTimeLeftText = () => {
    if (hoursLeft <= 24) {
      return t('promotions.hoursLeft', { count: hoursLeft });
    }
    return t('promotions.daysLeft', { count: daysLeft });
  };
  
  const discountText = promotion.discount_type === 'percentage'
    ? `-${promotion.discount_value}%`
    : `-${promotion.discount_value}€`;
  
  if (variant === 'card') {
    return (
      <Badge 
        className={cn(
          "absolute bottom-2 left-2 gap-1 animate-pulse",
          "bg-gradient-to-r from-accent to-primary text-primary-foreground",
          "shadow-lg border-0"
        )}
      >
        <Sparkles className="h-3 w-3" />
        <span className="font-bold">{discountText}</span>
        {showCountdown && hoursLeft <= 48 && (
          <>
            <span className="mx-1">•</span>
            <Timer className="h-3 w-3" />
            <span className="text-xs">{getTimeLeftText()}</span>
          </>
        )}
      </Badge>
    );
  }
  
  // Detail variant - larger, more prominent
  return (
    <div className="bg-gradient-to-r from-accent/20 to-primary/20 border border-accent/30 rounded-lg p-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent text-accent-foreground">
          <Sparkles className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-xl text-accent">
              {discountText}
            </span>
            <Badge variant="outline" className="text-xs">
              {promotion.name}
            </Badge>
          </div>
          {promotion.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {promotion.description}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <Timer className="h-4 w-4" />
            <span>
              {t('promotions.endsOn', {
                date: endDate.toLocaleDateString(i18n.language, {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })
              })}
            </span>
            {hoursLeft <= 48 && (
              <Badge variant="destructive" className="ml-2">
                {getTimeLeftText()}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionBadge;

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselScrollButtonsProps {
  scrollRef: React.RefObject<HTMLDivElement>;
  scrollAmount?: number;
}

const CarouselScrollButtons = ({ scrollRef, scrollAmount = 240 }: CarouselScrollButtonsProps) => {
  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = direction === 'left' ? -scrollAmount : scrollAmount;
    scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  return (
    <div className="hidden md:flex items-center gap-1.5">
      <button
        onClick={() => scroll('left')}
        aria-label="Scroll left"
        className="w-8 h-8 rounded-full border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        onClick={() => scroll('right')}
        aria-label="Scroll right"
        className="w-8 h-8 rounded-full border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};

export default CarouselScrollButtons;

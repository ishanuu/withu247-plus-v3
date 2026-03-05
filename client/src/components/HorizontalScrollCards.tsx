import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Card {
  id: string;
  title: string;
  description: string;
  image?: string;
  badge?: string;
  onClick?: () => void;
}

interface HorizontalScrollCardsProps {
  title: string;
  subtitle?: string;
  cards: Card[];
  onCardClick?: (card: Card) => void;
}

export default function HorizontalScrollCards({
  title,
  subtitle,
  cards,
  onCardClick,
}: HorizontalScrollCardsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="py-10 px-4 border-b border-border">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>

        <div className="relative group">
          {/* Left Scroll Button */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black/90 rounded-full p-2 transition-all opacity-0 group-hover:opacity-100"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          {/* Scrollable Container */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scroll-smooth pb-2 scrollbar-hide"
          >
            {cards.map((card) => (
              <div
                key={card.id}
                className="flex-shrink-0 w-64 bg-card rounded-lg border border-border p-4 cursor-pointer hover:bg-accent hover:border-primary transition-all hover:shadow-lg hover:-translate-y-2 duration-300"
                onClick={() => {
                  card.onClick?.();
                  onCardClick?.(card);
                }}
              >
                {card.image && (
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-40 object-cover rounded-md mb-4"
                  />
                )}
                <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                  {card.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                  {card.description}
                </p>
                {card.badge && (
                  <div className="flex gap-2">
                    <span className="inline-block bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                      {card.badge}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Scroll Button */}
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black/90 rounded-full p-2 transition-all opacity-0 group-hover:opacity-100"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>
    </section>
  );
}

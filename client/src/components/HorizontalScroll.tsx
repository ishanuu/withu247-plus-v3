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

interface HorizontalScrollProps {
  title: string;
  subtitle?: string;
  cards: Card[];
  onCardClick?: (card: Card) => void;
}

export default function HorizontalScroll({
  title,
  subtitle,
  cards,
  onCardClick,
}: HorizontalScrollProps) {
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
    <section className="horizontal-scroll-section">
      <div className="netflix-container">
        <div className="section-header">
          <h2 className="section-title">{title}</h2>
          {subtitle && <p className="section-subtitle">{subtitle}</p>}
        </div>

        <div className="relative">
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/80 rounded-full p-2 transition-all"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          <div
            ref={scrollRef}
            className="cards-container"
          >
            {cards.map((card) => (
              <div
                key={card.id}
                className="card"
                onClick={() => {
                  card.onClick?.();
                  onCardClick?.(card);
                }}
              >
                {card.image && (
                  <img
                    src={card.image}
                    alt={card.title}
                    className="card-image"
                  />
                )}
                <h3 className="card-title">{card.title}</h3>
                <p className="card-description">{card.description}</p>
                {card.badge && (
                  <div className="card-footer">
                    <span className="card-badge">{card.badge}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/80 rounded-full p-2 transition-all"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>
    </section>
  );
}
